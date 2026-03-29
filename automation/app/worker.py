from __future__ import annotations

import json
import os
import time

from .queue import (
    AUTO_APPLY_CONSUMER,
    AUTO_APPLY_DLQ_STREAM,
    AUTO_APPLY_GROUP,
    AUTO_APPLY_STREAM,
    ensure_group,
    get_client,
)

MAX_RETRIES = int(os.getenv("AUTO_APPLY_MAX_RETRIES", "5"))
BLOCK_MS = int(os.getenv("AUTO_APPLY_BLOCK_MS", "5000"))


def process_payload(payload: dict) -> None:
    required = ["user_id", "job_id", "resume_id"]
    missing = [item for item in required if not payload.get(item)]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")

    # TODO: Replace with Playwright worker orchestration.
    print("automation.process", payload)


def run_worker() -> None:
    client = get_client()
    ensure_group()
    print("automation worker started")

    while True:
        records = client.xreadgroup(
            groupname=AUTO_APPLY_GROUP,
            consumername=AUTO_APPLY_CONSUMER,
            streams={AUTO_APPLY_STREAM: ">"},
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
                    client.xack(AUTO_APPLY_STREAM, AUTO_APPLY_GROUP, message_id)
                except Exception as error:  # noqa: BLE001
                    retries += 1
                    client.xack(AUTO_APPLY_STREAM, AUTO_APPLY_GROUP, message_id)

                    if retries >= MAX_RETRIES:
                        client.xadd(
                            AUTO_APPLY_DLQ_STREAM,
                            {
                                "payload": json.dumps(payload),
                                "retries": str(retries),
                                "error": str(error),
                            },
                            maxlen=10000,
                            approximate=True,
                        )
                        print("automation.dlq", {"payload": payload, "error": str(error), "retries": retries})
                    else:
                        backoff_seconds = min(60, 2**retries)
                        time.sleep(backoff_seconds)
                        client.xadd(
                            AUTO_APPLY_STREAM,
                            {"payload": json.dumps(payload), "retries": str(retries)},
                            maxlen=10000,
                            approximate=True,
                        )
                        print("automation.retry", {"payload": payload, "retries": retries})


if __name__ == "__main__":
    run_worker()
