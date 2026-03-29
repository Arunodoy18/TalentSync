export type MatchingCandidate = {
  job_id: string;
  embedding: number[];
};

export type MatchRunResponse = {
  user_id: string;
  results: Array<{
    job_id: string;
    match_score: number;
  }>;
};

function getBaseUrl(): string {
  return (process.env.MATCHING_ENGINE_URL ?? "http://localhost:8002").replace(/\/$/, "");
}

export async function runMatch(input: {
  user_id: string;
  resume_embedding: number[];
  candidates: MatchingCandidate[];
}): Promise<MatchRunResponse> {
  const res = await fetch(`${getBaseUrl()}/match/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Matching engine request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as MatchRunResponse;
}
