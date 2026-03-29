from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from .queue import enqueue_auto_apply_job, stream_metrics

app = FastAPI(title="TalentSync Auto Apply Service", version="0.1.0")


class AutoApplyRequest(BaseModel):
    user_id: str
    job_id: str
    resume_id: str


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "automation"}


@app.post("/apply/auto")
def auto_apply(payload: AutoApplyRequest) -> dict:
    job_id = enqueue_auto_apply_job(
        {
            "user_id": payload.user_id,
            "job_id": payload.job_id,
            "resume_id": payload.resume_id,
            "queued_at": datetime.utcnow().isoformat(),
        }
    )

    return {
        "ok": True,
        "data": {
            "status": "queued",
            "queue_job_id": job_id,
            "user_id": payload.user_id,
            "job_id": payload.job_id,
            "resume_id": payload.resume_id,
            "queued_at": datetime.utcnow().isoformat(),
        },
    }


@app.get("/queue/metrics")
def queue_metrics() -> dict:
    return {"ok": True, "data": stream_metrics()}
