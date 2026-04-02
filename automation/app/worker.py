from __future__ import annotations

import json
import os
import time
import asyncio
from typing import Dict, Any

from .queue import (
    AUTO_APPLY_CONSUMER,
    AUTO_APPLY_DLQ_STREAM,
    AUTO_APPLY_GROUP,
    AUTO_APPLY_STREAM,
    ensure_group,
    get_client,
)
from .database import get_job_and_resume, mark_job_status
from .adapters.greenhouse import GreenhouseApplier

MAX_RETRIES = int(os.getenv("AUTO_APPLY_MAX_RETRIES", "5"))
BLOCK_MS = int(os.getenv("AUTO_APPLY_BLOCK_MS", "5000"))

# Register Adapters based on domain matching:
REGISTERED_ADAPTERS = {
    "boards.greenhouse.io": GreenhouseApplier
}

def determine_adapter(url: str) -> str | None:
    for domain in REGISTERED_ADAPTERS:
        if domain in url:
            return domain
    return None

def fetch_details_from_db(payload: dict) -> tuple[dict, dict]:
    user_id = payload.get("user_id")
    job_id = payload.get("job_id")
    resume_id = payload.get("resume_id")
    
    print(f"[*] Fetching Job {job_id} and Resume {resume_id} for User {user_id}")
    job_data, resume_data = get_job_and_resume(job_id, resume_id, user_id)
    return job_data, resume_data

async def async_process_payload(payload: dict) -> None:
    """Async execution wrapper for running playwright."""
    required = ["user_id", "job_id", "resume_id"]
    missing = [item for item in required if not payload.get(item)]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")

    print(f"\n[+] Processing Auto-Apply Request: {payload}")
    job_id = payload["job_id"]
    user_id = payload["user_id"]
    resume_id = payload["resume_id"]

    try:
        # 1. Fetch Job from Supabase
        job_data, resume_data = fetch_details_from_db(payload)
        
        apply_url = job_data.get("url")
        if not apply_url:
             print(f"[!] No apply URL found for job {job_id}. Skipping.")
             mark_job_status(job_id, resume_id, user_id, "failed")
             return

        # 2. Determine Applier
        adapter_key = determine_adapter(apply_url)
        
        if not adapter_key:
             print(f"[!] Target ATS domain '{apply_url}' is not currently supported.")
             mark_job_status(job_id, resume_id, user_id, "skipped")
             return
             
        AdapterClass = REGISTERED_ADAPTERS[adapter_key]
        applier = AdapterClass()
        
        # 3. Transform Resume JSON to flattened data for forms
        # Usually we would also fetch the pre-generated PDF URL from S3 here to upload.
        # We will mock the filepath downloaded from S3 locally:
        resume_content = resume_data.get("content", {})
        basics = resume_content.get("basics", {})
        
        applicant_data = {
             "name": basics.get("name", "Unknown Name"),
             "email": basics.get("email", "unknown@email.com"),
             "phone": basics.get("phone", "555-0000"),
             "linkedin_url": "https://linkedin.com/in/talent-sync" # Would be in basics.profiles
        }
        
        # Assume we downloaded the generated PDF from Supabase Storage and stored it locally
        mock_resume_path = "/tmp/resume_placeholder.pdf"
        if not os.path.exists(mock_resume_path):
             os.makedirs("/tmp", exist_ok=True)
             with open(mock_resume_path, "w") as f:
                 f.write("MOCK RESUME PDF CONTENT")
                 
        print(f"[*] Starting apply automation for {apply_url} via adapter: {adapter_key}")
        
        success = await applier.apply(apply_url, applicant_data, mock_resume_path)
        
        if success:
             mark_job_status(job_id, resume_id, user_id, "applied")
             print("[+] Success status saved to Supabase.")
        else:
             mark_job_status(job_id, resume_id, user_id, "failed")
             print("[-] Failed to inject application.")
             
    except Exception as process_err:
        print(f"[!] Database fetch error mapping auto-apply: {process_err}")
        mark_job_status(job_id, resume_id, user_id, "failed")
        raise process_err

def process_payload(payload: dict) -> None:
    # Synchronously run the event loop wrapper
    asyncio.run(async_process_payload(payload))


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
