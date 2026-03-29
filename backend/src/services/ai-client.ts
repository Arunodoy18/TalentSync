type JsonRecord = Record<string, unknown>;

function getBaseUrl(): string {
  return (process.env.AI_SERVICE_URL ?? "http://localhost:8001").replace(/\/$/, "");
}

async function postJson<T>(path: string, payload: JsonRecord): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI service request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as T;
}

export type ParseResponse = {
  entities: JsonRecord;
  skills: string[];
};

export type TailorResponse = {
  tailored_resume: JsonRecord;
  notes: string[];
};

export type AtsResponse = {
  score: number;
  breakdown: Record<string, number>;
  recommendations: string[];
};

export type EmbeddingResponse = {
  vector: number[];
};

export async function parseResume(rawText: string): Promise<ParseResponse> {
  return postJson<ParseResponse>("/ai/resume/parse", { raw_text: rawText });
}

export async function tailorResume(resumeJson: JsonRecord, jobDescription: string): Promise<TailorResponse> {
  return postJson<TailorResponse>("/ai/resume/tailor", {
    resume_json: resumeJson,
    job_description: jobDescription,
  });
}

export async function atsScore(resumeJson: JsonRecord, jobDescription: string): Promise<AtsResponse> {
  return postJson<AtsResponse>("/ai/resume/ats-score", {
    resume_json: resumeJson,
    job_description: jobDescription,
  });
}

export async function embedding(text: string): Promise<EmbeddingResponse> {
  return postJson<EmbeddingResponse>("/ai/embedding", { text });
}
