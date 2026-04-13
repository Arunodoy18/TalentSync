from __future__ import annotations

import json
import os
import time

# Load environment variables explicitly from the root .env.local 
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env.local'))

from .queue import (
    SCRAPE_CONSUMER,
    SCRAPE_DLQ_STREAM,
    SCRAPE_GROUP,
    SCRAPE_STREAM,
    ensure_group,
    get_client,
)
from .scrapers.remoteok import RemoteOKScraper
from .scrapers.greenhouse import GreenhousePlaywrightScraper
from .scrapers.linkedin import LinkedInScraper
from .scrapers.indeed import IndeedScraper
from .database import insert_jobs_bulk

MAX_RETRIES = int(os.getenv("SCRAPE_MAX_RETRIES", "5"))
BLOCK_MS = int(os.getenv("SCRAPE_BLOCK_MS", "5000"))

# Register scrapers into a dynamic dictionary lookup. 
# Ex: When Redis triggers an event {"source": "remoteok"}, this map routes it easily.
REGISTERED_SCRAPERS = {
    "remoteok": RemoteOKScraper,
    "greenhouse": GreenhousePlaywrightScraper,
    "linkedin": LinkedInScraper,
    "indeed": IndeedScraper,
}

def process_payload(payload: dict) -> None:
    source = payload.get("source")
    if not source:
        raise ValueError("source is required")
        
    normalized_source = source.lower()
    
    if normalized_source not in REGISTERED_SCRAPERS:
        print(f"[!] Scraper '{source}' not registered. Ignoring payload in DLQ.")
        return
        
    ScraperClass = REGISTERED_SCRAPERS[normalized_source]
    scraper_instance = ScraperClass()
    
    location = payload.get("location")
    
    # We now pass the entire payload or a sub-dict to handle rich AI params
    search_params = payload.get("search_params", {"location": location})
    
    print(f"[*] Worker booting up Scraper '{source}' with params: {search_params}")
    
    # Check if the scraper uses the old string location or new dict approach
    try:
        scraped_data = scraper_instance.scrape(search_params)
    except TypeError:
        scraped_data = scraper_instance.scrape(location)
    
    print(f"[*] Scraper '{source}' found {len(scraped_data)} jobs.")
    if scraped_data:
        insert_jobs_bulk(scraped_data)



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
