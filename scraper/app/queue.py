from __future__ import annotations

import json
import os
from typing import Any, Dict

from redis import Redis

SCRAPE_STREAM = os.getenv("SCRAPE_STREAM", "jobs.scrape")
SCRAPE_DLQ_STREAM = os.getenv("SCRAPE_DLQ_STREAM", "jobs.scrape.dlq")
SCRAPE_GROUP = os.getenv("SCRAPE_GROUP", "scraper-workers")
SCRAPE_CONSUMER = os.getenv("SCRAPE_CONSUMER", "scraper-consumer-1")

_client: Redis | None = None


def get_client() -> Redis:
    global _client
    if _client is None:
        _client = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
    return _client


def ensure_group() -> None:
    client = get_client()
    try:
        client.xgroup_create(name=SCRAPE_STREAM, groupname=SCRAPE_GROUP, id="0", mkstream=True)
    except Exception as error:  # noqa: BLE001
        if "BUSYGROUP" not in str(error):
            raise


def enqueue_scrape_job(payload: Dict[str, Any]) -> str:
    client = get_client()
    return client.xadd(
        SCRAPE_STREAM,
        {"payload": json.dumps(payload), "retries": "0"},
        maxlen=10000,
        approximate=True,
    )


def stream_metrics() -> Dict[str, int]:
    client = get_client()
    return {
        "pending": int(client.xlen(SCRAPE_STREAM)),
        "dead_letter": int(client.xlen(SCRAPE_DLQ_STREAM)),
    }
