from __future__ import annotations

import json
import os
from typing import Any, Dict

from redis import Redis

AUTO_APPLY_STREAM = os.getenv("AUTO_APPLY_STREAM", "jobs.autoapply")
AUTO_APPLY_DLQ_STREAM = os.getenv("AUTO_APPLY_DLQ_STREAM", "jobs.autoapply.dlq")
AUTO_APPLY_GROUP = os.getenv("AUTO_APPLY_GROUP", "autoapply-workers")
AUTO_APPLY_CONSUMER = os.getenv("AUTO_APPLY_CONSUMER", "autoapply-consumer-1")

_client: Redis | None = None


def get_client() -> Redis:
    global _client
    if _client is None:
        _client = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
    return _client


def ensure_group() -> None:
    client = get_client()
    try:
        client.xgroup_create(name=AUTO_APPLY_STREAM, groupname=AUTO_APPLY_GROUP, id="0", mkstream=True)
    except Exception as error:  # noqa: BLE001
        if "BUSYGROUP" not in str(error):
            raise


def enqueue_auto_apply_job(payload: Dict[str, Any]) -> str:
    client = get_client()
    return client.xadd(
        AUTO_APPLY_STREAM,
        {"payload": json.dumps(payload), "retries": "0"},
        maxlen=10000,
        approximate=True,
    )


def stream_metrics() -> Dict[str, int]:
    client = get_client()
    return {
        "pending": int(client.xlen(AUTO_APPLY_STREAM)),
        "dead_letter": int(client.xlen(AUTO_APPLY_DLQ_STREAM)),
    }
