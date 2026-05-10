import tls from "tls";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type JobMatchRequest = {
  role: string;
  city: string;
  resumeSkills: string[];
};

type JobMatchResponse = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: string;
  applyUrl: string;
  source: "Adzuna" | "Internshala";
  matchScore: number;
  matchedSkills: string[];
  postedDate: string;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is",
  "it", "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "you",
  "your", "we", "our", "they", "their", "this", "these", "those", "not", "but", "if", "then",
  "than", "so", "such", "about", "into", "over", "under", "after", "before", "between", "while",
  "per", "via", "also", "within", "across", "including", "include", "including", "etc",
]);

const CACHE_TTL_SECONDS = 1800;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function extractKeywords(description: string): string[] {
  const raw = normalizeText(description).split(/\s+/).filter(Boolean);
  return raw.filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function normalizeSkills(skills: string[]): string[] {
  return skills
    .map((skill) => skill.toLowerCase().trim())
    .filter(Boolean);
}

function buildCacheKey(role: string, city: string): string {
  return `jobs:${role.trim().toLowerCase()}:${city.trim().toLowerCase()}`;
}

function encodeRedisCommand(args: string[]): Buffer {
  const parts = [`*${args.length}\r\n`];
  for (const arg of args) {
    const value = arg ?? "";
    parts.push(`$${Buffer.byteLength(value)}\r\n${value}\r\n`);
  }
  return Buffer.from(parts.join(""));
}

async function withRedis<T>(
  args: string[],
  handler: (response: string | null) => T
): Promise<T | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const parsed = new URL(redisUrl);
  const host = parsed.hostname;
  const port = Number(parsed.port || "6379");
  const password = parsed.password || "";

  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host });
    socket.setTimeout(5000);
    let buffer = Buffer.alloc(0);

    const cleanup = () => {
      socket.removeAllListeners("data");
      socket.removeAllListeners("error");
      socket.removeAllListeners("timeout");
    };

    const parseResponse = (): { done: boolean; value?: string | null; error?: Error } => {
      if (buffer.length < 1) return { done: false };

      const prefix = String.fromCharCode(buffer[0]);
      const lineEnd = buffer.indexOf("\r\n");
      if (lineEnd === -1) return { done: false };

      const line = buffer.slice(1, lineEnd).toString();
      if (prefix === "+") {
        buffer = buffer.slice(lineEnd + 2);
        return { done: true, value: line };
      }

      if (prefix === "-") {
        buffer = buffer.slice(lineEnd + 2);
        return { done: true, error: new Error(line) };
      }

      if (prefix === ":") {
        buffer = buffer.slice(lineEnd + 2);
        return { done: true, value: line };
      }

      if (prefix === "$") {
        const length = Number(line);
        if (length === -1) {
          buffer = buffer.slice(lineEnd + 2);
          return { done: true, value: null };
        }
        const endOfValue = lineEnd + 2 + length;
        if (buffer.length < endOfValue + 2) return { done: false };
        const value = buffer.slice(lineEnd + 2, endOfValue).toString();
        buffer = buffer.slice(endOfValue + 2);
        return { done: true, value };
      }

      return { done: false };
    };

    const readResponse = () =>
      new Promise<string | null>((resolveResponse, rejectResponse) => {
        const tryParse = () => {
          const result = parseResponse();
          if (!result.done) return;
          socket.off("data", onData);
          if (result.error) {
            rejectResponse(result.error);
          } else {
            resolveResponse(result.value ?? null);
          }
        };

        const onData = (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk]);
          tryParse();
        };

        socket.on("data", onData);
        tryParse();
      });

    socket.once("error", (err) => {
      cleanup();
      socket.end();
      reject(err);
    });

    socket.once("timeout", () => {
      cleanup();
      socket.end();
      reject(new Error("Redis connection timed out"));
    });

    socket.once("secureConnect", async () => {
      try {
        if (password) {
          socket.write(encodeRedisCommand(["AUTH", password]));
          await readResponse();
        }

        socket.write(encodeRedisCommand(args));
        const response = await readResponse();
        cleanup();
        socket.end();
        resolve(handler(response));
      } catch (err) {
        cleanup();
        socket.end();
        reject(err);
      }
    });
  });
}

async function redisGet(key: string): Promise<string | null> {
  return withRedis(["GET", key], (response) => response) ?? null;
}

async function redisSetEx(key: string, ttlSeconds: number, value: string): Promise<void> {
  await withRedis(["SETEX", key, String(ttlSeconds), value], () => null);
}

async function fetchAdzunaJobs(what: string, where: string) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API keys not configured");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "20",
    what,
    where,
    "content-type": "application/json",
  });

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params.toString()}`;
  console.log(`[Adzuna] GET ${url}`);
  const res = await fetch(url, { cache: "no-store" });
  console.log(`[Adzuna] Status ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.log(`[Adzuna] Error response: ${errorText}`);
    throw new Error(`Adzuna request failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

function mapJobToResponse(
  job: any,
  source: "Adzuna" | "Internshala",
  resumeSkills: string[]
): JobMatchResponse {
  const description = typeof job.description === "string" ? job.description : "";
  const cleanDescription = description.replace(/<[^>]+>/g, " ");
  const keywords = extractKeywords(cleanDescription);
  const keywordSet = new Set(keywords);

  const normalizedSkills = normalizeSkills(resumeSkills);
  const skillTokens = new Set(
    normalizedSkills.flatMap((skill) => normalizeText(skill).split(/\s+/).filter(Boolean))
  );

  const matchedKeywords = Array.from(keywordSet).filter((word) => skillTokens.has(word));
  const matchScore = keywordSet.size > 0
    ? Math.round((matchedKeywords.length / keywordSet.size) * 100)
    : 0;

  const matchedSkills = normalizedSkills.filter((skill) => {
    if (!skill) return false;
    if (skill.includes(" ")) {
      return cleanDescription.toLowerCase().includes(skill);
    }
    return keywordSet.has(skill);
  });

  const salaryMin = job.salary_min ? Math.round(job.salary_min) : null;
  const salaryMax = job.salary_max ? Math.round(job.salary_max) : null;
  const salary = salaryMin && salaryMax
    ? `₹${salaryMin.toLocaleString()} - ₹${salaryMax.toLocaleString()}`
    : "Not disclosed";

  const location = job.location?.display_name || job.location?.area?.join(", ") || "";
  const company = job.company?.display_name || "";
  const jobType = job.contract_time || job.contract_type || job.job_type || "Not specified";

  return {
    id: String(job.id ?? job.adref ?? job.redirect_url ?? Math.random()),
    title: job.title || "",
    company,
    location,
    description: cleanDescription.slice(0, 300),
    salary,
    jobType,
    applyUrl: job.redirect_url || job.url || "",
    source,
    matchScore,
    matchedSkills: Array.from(new Set(matchedSkills)),
    postedDate: job.created || job.created_at || "",
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      return NextResponse.json({ error: "Adzuna API keys not configured", jobs: [] }, { status: 500 });
    }

    const body = (await request.json()) as JobMatchRequest;
    const role = body?.role?.trim();
    const city = body?.city?.trim();
    const resumeSkills = Array.isArray(body?.resumeSkills) ? body.resumeSkills : null;

    if (!role || !city || !resumeSkills) {
      return NextResponse.json({ error: "role, city, and resumeSkills are required", jobs: [] }, { status: 400 });
    }

    const cacheKey = buildCacheKey(role, city);
    try {
      const cached = await redisGet(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return NextResponse.json({ jobs: parsed });
        }
      }
    } catch (err) {
      console.warn("Redis cache read failed", err);
    }

    const results = await Promise.allSettled([
      fetchAdzunaJobs(role, city),
      fetchAdzunaJobs("software engineer intern", city),
    ]);

    const rejectedResults = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    );
    const adzunaErrorMessage = rejectedResults.length
      ? (rejectedResults[0].reason instanceof Error
        ? rejectedResults[0].reason.message
        : String(rejectedResults[0].reason))
      : null;

    const primaryJobs = results[0].status === "fulfilled" ? results[0].value : [];
    const internJobs = results[1].status === "fulfilled" ? results[1].value : [];

    if (primaryJobs.length === 0 && internJobs.length === 0) {
      const errorMessage = adzunaErrorMessage || "No jobs found.";
      return NextResponse.json({ jobs: [], error: errorMessage });
    }

    const mappedPrimary = primaryJobs.map((job: any) =>
      mapJobToResponse(job, "Adzuna", resumeSkills)
    );

    const mappedIntern = internJobs.map((job: any) =>
      mapJobToResponse(job, "Internshala", resumeSkills)
    );

    const mergedMap = new Map<string, JobMatchResponse>();
    for (const job of [...mappedPrimary, ...mappedIntern]) {
      const key = job.id || job.applyUrl || `${job.title}-${job.company}-${job.location}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, job);
      }
    }

    const mergedJobs = Array.from(mergedMap.values()).sort((a, b) => b.matchScore - a.matchScore);

    try {
      await redisSetEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(mergedJobs));
    } catch (err) {
      console.warn("Redis cache write failed", err);
    }

    return NextResponse.json({ jobs: mergedJobs });
  } catch (error) {
    console.error("Job match error:", error);
    return NextResponse.json({ jobs: [], error: "Failed to match jobs." });
  }
}
