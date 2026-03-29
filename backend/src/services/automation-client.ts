type AutoApplyRequest = {
  user_id: string;
  job_id: string;
  resume_id: string;
};

type AutoApplyResponse = {
  ok: boolean;
  data: {
    status: string;
    queue_job_id?: string;
    user_id: string;
    job_id: string;
    resume_id: string;
    queued_at: string;
  };
};

function getBaseUrl(): string {
  return (process.env.AUTOMATION_SERVICE_URL ?? "http://localhost:8004").replace(/\/$/, "");
}

export async function enqueueAutoApply(payload: AutoApplyRequest): Promise<AutoApplyResponse> {
  const res = await fetch(`${getBaseUrl()}/apply/auto`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Automation service request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as AutoApplyResponse;
}
