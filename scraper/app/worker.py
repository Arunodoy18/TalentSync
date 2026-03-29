from __future__ import annotations

import json
import os
import time

from .queue import (
    SCRAPE_CONSUMER,
    SCRAPE_DLQ_STREAM,
    SCRAPE_GROUP,
    SCRAPE_STREAM,
    ensure_group,
    get_client,
)

MAX_RETRIES = int(os.getenv("SCRAPE_MAX_RETRIES", "5"))
BLOCK_MS = int(os.getenv("SCRAPE_BLOCK_MS", "5000"))


def process_payload(payload: dict) -> None:
    source = payload.get("source")
    if not source:
        raise ValueError("source is required")

    # TODO: Replace with actual Scrapy + Playwright execution pipeline.
    print("scraper.process", payload)


def run_worker() -> None:
    client = get_client()
    ensure_group()
    print("scraper worker started")

    while True:
        records = client.xreadgroup(
            groupname=SCRAPE_GROUP,
            consumername=SCRAPE_CONSUMER,
            streams={SCRAPE_STREAM: ">"},
            count=10,
            block=BLOCK_MS,
        )

        if not records:
            continue

        for _, entries in records:
            for message_id, fields in entries:
                payload = json.loads(fields.get("payload", "{}"))
                retries = int(fields.get("retries", "0"))

                try:
                    process_payload(payload)
                    client.xack(SCRAPE_STREAM, SCRAPE_GROUP, message_id)
                except Exception as error:  # noqa: BLE001
                    retries += 1
                    client.xack(SCRAPE_STREAM, SCRAPE_GROUP, message_id)

                    if retries >= MAX_RETRIES:
                        client.xadd(
                            SCRAPE_DLQ_STREAM,
                            {
                                "payload": json.dumps(payload),
                                "retries": str(retries),
                                "error": str(error),
                            },
                            maxlen=10000,
                            approximate=True,
                        )
                        print("scraper.dlq", {"payload": payload, "error": str(error), "retries": retries})
                    else:
                        backoff_seconds = min(60, 2**retries)
                        time.sleep(backoff_seconds)
                        client.xadd(
                            SCRAPE_STREAM,
                            {"payload": json.dumps(payload), "retries": str(retries)},
                            maxlen=10000,
                            approximate=True,
                        )
                        print("scraper.retry", {"payload": payload, "retries": retries})


if __name__ == "__main__":
    run_worker()
