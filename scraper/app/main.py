from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from .queue import enqueue_scrape_job, stream_metrics

app = FastAPI(title="TalentSync Scraper Service", version="0.1.0")


class ScrapeTrigger(BaseModel):
    source: str
    location: str | None = None


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "scraper"}


@app.post("/scrape/run")
def run_scrape(payload: ScrapeTrigger) -> dict:
    job_id = enqueue_scrape_job(
        {
            "source": payload.source,
            "location": payload.location,
            "queued_at": datetime.utcnow().isoformat(),
        }
    )

    return {
        "ok": True,
        "data": {
            "status": "queued",
            "job_id": job_id,
            "source": payload.source,
            "location": payload.location,
            "scheduled_at": datetime.utcnow().isoformat(),
        },
    }


@app.get("/queue/metrics")
def queue_metrics() -> dict:
    return {"ok": True, "data": stream_metrics()}
