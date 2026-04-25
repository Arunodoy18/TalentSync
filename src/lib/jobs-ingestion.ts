import { createAdminClient } from "@/lib/supabase-admin";
import { generateEmbedding } from "@/lib/openai";

const REMOTE_OK_API_URL = "https://remoteok.com/api";

export type JobsIngestionInput = {
  source?: string;
  limit?: number;
  location?: string;
  keyword?: string;
};

export type JobsIngestionResult = {
  message: string;
  inserted: number;
  skipped: number;
  embeddingFailures: number;
  source: "remoteok";
};

const SUPPORTED_SOURCES = ["remoteok"] as const;
type SupportedSource = (typeof SUPPORTED_SOURCES)[number];

function parseSource(value: string | undefined): SupportedSource | null {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return SUPPORTED_SOURCES.includes(normalized as SupportedSource)
    ? (normalized as SupportedSource)
    : null;
}

function getDefaultSource(): SupportedSource {
  const configured = parseSource(process.env.JOBS_INGEST_DEFAULT_SOURCE);
  return configured ?? "remoteok";
}

function getDefaultLimit(): number {
  const raw = Number(process.env.JOBS_INGEST_DEFAULT_LIMIT ?? 20);
  return Number.isFinite(raw) ? raw : 20;
}

function getMaxLimit(): number {
  const raw = Number(process.env.JOBS_INGEST_MAX_LIMIT ?? 50);
  return Number.isFinite(raw) ? Math.max(1, raw) : 50;
}

function resolveInput(input: JobsIngestionInput): {
  source: SupportedSource;
  limit: number;
  location?: string;
  keyword?: string;
} {
  const source = parseSource(input.source) ?? getDefaultSource();

  if (input.source && !parseSource(input.source)) {
    throw new Error(
      `Unsupported jobs source '${input.source}'. Supported sources: ${SUPPORTED_SOURCES.join(", ")}`
    );
  }

  const limit = Math.min(Math.max(Number(input.limit ?? getDefaultLimit()), 1), getMaxLimit());
  const location = (input.location ?? process.env.JOBS_INGEST_DEFAULT_LOCATION ?? "").trim() || undefined;
  const keyword = (input.keyword ?? process.env.JOBS_INGEST_DEFAULT_KEYWORD ?? "").trim() || undefined;

  return { source, limit, location, keyword };
}

type RemoteOkJob = {
  position?: string;
  company?: string;
  location?: string;
  tags?: string[];
  description?: string;
  url?: string;
  salary_min?: number;
  salary_max?: number;
};

type JobInsertPayload = {
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  url: string;
  source: string;
  embedding: number[] | null;
};

function toSalaryRange(job: RemoteOkJob): string {
  const min = Number(job.salary_min ?? 0);
  const max = Number(job.salary_max ?? 0);

  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0) {
    return `$${min} - $${max}`;
  }

  if (Number.isFinite(min) && min > 0) {
    return `$${min}+`;
  }

  return "Not disclosed";
}

function toJobType(job: RemoteOkJob): string {
  const tags = Array.isArray(job.tags) ? job.tags.map((tag) => String(tag).toLowerCase()) : [];
  if (tags.includes("contract")) return "Contract";
  if (tags.includes("part-time") || tags.includes("part_time")) return "Part-time";
  return "Full-time";
}

function normalizeRemoteOkJob(job: RemoteOkJob): Omit<JobInsertPayload, "embedding"> | null {
  const title = (job.position ?? "").trim();
  const company = (job.company ?? "").trim();
  const url = (job.url ?? "").trim();

  if (!title || !company || !url) {
    return null;
  }

  return {
    title,
    company,
    location: (job.location ?? "Remote").trim() || "Remote",
    job_type: toJobType(job),
    salary_range: toSalaryRange(job),
    description: (job.description ?? "See source for full details.").trim() || "See source for full details.",
    url,
    source: "manual",
  };
}

async function fetchRemoteOkJobs(limit: number, location?: string, keyword?: string): Promise<RemoteOkJob[]> {
  const response = await fetch(REMOTE_OK_API_URL, {
    method: "GET",
    headers: {
      "user-agent": "TalentSync/1.0",
      accept: "application/json",
      "cache-control": "no-cache",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RemoteOK request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error("RemoteOK payload is not an array");
  }

  const normalizedLocation = location?.trim().toLowerCase();
  const normalizedKeyword = keyword?.trim().toLowerCase();

  return payload
    .filter((item): item is RemoteOkJob => typeof item === "object" && item !== null)
    .filter((item) => !("legal" in item))
    .filter((item) => {
      if (!normalizedLocation) return true;
      const jobLocation = String(item.location ?? "remote").toLowerCase();
      return (
        jobLocation.includes(normalizedLocation) ||
        jobLocation.includes("remote") ||
        jobLocation.includes("worldwide")
      );
    })
    .filter((item) => {
      if (!normalizedKeyword) return true;
      const haystack = `${item.position ?? ""} ${item.description ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedKeyword);
    })
    .slice(0, limit);
}

export async function ingestRealJobs(input: JobsIngestionInput): Promise<JobsIngestionResult> {
  const { source, limit, location, keyword } = resolveInput(input);

  const admin = createAdminClient();
  const remoteJobs = await fetchRemoteOkJobs(limit, location, keyword);

  const normalized = remoteJobs
    .map((job) => normalizeRemoteOkJob(job))
    .filter((job): job is Omit<JobInsertPayload, "embedding"> => job !== null);

  if (normalized.length === 0) {
    return {
      message: "No jobs found from RemoteOK for the selected filters.",
      inserted: 0,
      skipped: 0,
      embeddingFailures: 0,
      source: "remoteok",
    };
  }

  const deduped = Array.from(new Map(normalized.map((job) => [job.url, job])).values());
  const urls = deduped.map((job) => job.url);

  const { data: existingRows, error: existingError } = await admin
    .from("jobs")
    .select("url")
    .in("url", urls);

  if (existingError) {
    throw new Error(`Failed to check existing jobs: ${existingError.message}`);
  }

  const existingUrls = new Set((existingRows ?? []).map((row: { url: string }) => row.url));
  const toInsert = deduped.filter((job) => !existingUrls.has(job.url));

  if (toInsert.length === 0) {
    return {
      message: "No new jobs to insert. Existing listings are up to date.",
      inserted: 0,
      skipped: deduped.length,
      embeddingFailures: 0,
      source: "remoteok",
    };
  }

  const rows: JobInsertPayload[] = [];
  let embeddingFailures = 0;

  for (const job of toInsert) {
    const embeddingInput = `${job.title}\n${job.company}\n${job.location}\n${job.description}`;
    let embedding: number[] | null = null;

    try {
      embedding = await generateEmbedding(embeddingInput);
    } catch (embeddingError) {
      embeddingFailures += 1;
      console.warn("Embedding generation failed for job", job.url, embeddingError);
    }

    rows.push({ ...job, embedding });
  }

  const { error: insertError } = await admin.from("jobs").insert(rows);
  if (insertError) {
    throw new Error(`Failed to insert jobs: ${insertError.message}`);
  }

  return {
    message: "Real jobs ingested successfully",
    inserted: rows.length,
    skipped: deduped.length - rows.length,
    embeddingFailures,
    source,
  };
}
