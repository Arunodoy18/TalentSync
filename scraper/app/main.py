import asyncio
import os
from contextlib import suppress
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from .queue import enqueue_scrape_job, get_client, stream_metrics

app = FastAPI(title="TalentSync Scraper Service", version="0.1.0")

DEFAULT_SOURCES = ("remoteok", "greenhouse", "linkedin", "indeed")
SCHEDULER_ENABLED = os.getenv("SCRAPE_SCHEDULER_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
SCHEDULE_SECONDS = max(60, int(os.getenv("SCRAPE_SCHEDULE_SECONDS", "21600")))
DEFAULT_LOCATION = os.getenv("SCRAPE_DEFAULT_LOCATION")
SCHEDULER_LOCK_KEY = os.getenv("SCRAPE_SCHEDULER_LOCK_KEY", "jobs.scrape.scheduler.lock")
SCHEDULER_LOCK_TTL_SECONDS = max(30, int(os.getenv("SCRAPE_SCHEDULER_LOCK_TTL_SECONDS", "120")))

_scheduler_task: asyncio.Task | None = None
_scheduler_last_run_at: str | None = None
_scheduler_last_result: dict | None = None


class ScrapeTrigger(BaseModel):
    source: str
    location: str | None = None


def _configured_sources() -> list[str]:
    raw = os.getenv("SCRAPE_SOURCES", ",".join(DEFAULT_SOURCES))
    sources = [item.strip().lower() for item in raw.split(",") if item.strip()]
    return sources or list(DEFAULT_SOURCES)


def _enqueue_scrapes(trigger: str, location: str | None = None) -> dict:
    global _scheduler_last_run_at, _scheduler_last_result

    requested_sources = _configured_sources()
    queued: list[dict] = []

    for source in requested_sources:
        payload = {
            "source": source,
            "location": location,
            "queued_at": datetime.utcnow().isoformat(),
            "trigger": trigger,
        }
        job_id = enqueue_scrape_job(payload)
        queued.append({"source": source, "job_id": job_id})

    _scheduler_last_run_at = datetime.utcnow().isoformat()
    _scheduler_last_result = {
        "trigger": trigger,
        "location": location,
        "queued": queued,
        "scheduled_at": _scheduler_last_run_at,
    }

    return _scheduler_last_result


async def _scheduler_loop() -> None:
    while True:
        try:
            # Use a short lock to avoid duplicate scheduling if multiple scraper API replicas are running.
            client = get_client()
            has_lock = bool(client.set(SCHEDULER_LOCK_KEY, "1", ex=SCHEDULER_LOCK_TTL_SECONDS, nx=True))
            if has_lock:
                _enqueue_scrapes(trigger="scheduler", location=DEFAULT_LOCATION)
        except Exception as error:  # noqa: BLE001
            print("[!] scheduler loop error", str(error))

        await asyncio.sleep(SCHEDULE_SECONDS)


@app.on_event("startup")
async def startup_scheduler() -> None:
    global _scheduler_task

    if not SCHEDULER_ENABLED:
        print("[*] scraper scheduler disabled")
        return

    if _scheduler_task is None or _scheduler_task.done():
        _scheduler_task = asyncio.create_task(_scheduler_loop())
        print("[*] scraper scheduler started", {"sources": _configured_sources(), "interval_seconds": SCHEDULE_SECONDS})


@app.on_event("shutdown")
async def shutdown_scheduler() -> None:
    global _scheduler_task

    if _scheduler_task is None:
        return

    _scheduler_task.cancel()
    with suppress(asyncio.CancelledError):
        await _scheduler_task
    _scheduler_task = None


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


@app.post("/scrape/run-all")
def run_all_scrapes() -> dict:
    result = _enqueue_scrapes(trigger="manual", location=DEFAULT_LOCATION)
    return {"ok": True, "data": result}


@app.get("/scrape/scheduler/status")
def scheduler_status() -> dict:
    return {
        "ok": True,
        "data": {
            "enabled": SCHEDULER_ENABLED,
            "interval_seconds": SCHEDULE_SECONDS,
            "sources": _configured_sources(),
            "default_location": DEFAULT_LOCATION,
            "last_run_at": _scheduler_last_run_at,
            "last_result": _scheduler_last_result,
            "task_running": bool(_scheduler_task and not _scheduler_task.done()),
        },
    }


@app.get("/queue/metrics")
def queue_metrics() -> dict:
    return {"ok": True, "data": stream_metrics()}
