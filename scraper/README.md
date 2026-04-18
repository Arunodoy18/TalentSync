# Job Scraper Service

Responsibilities:
- Collect jobs from configured sources
- Normalize and deduplicate listings
- Generate and persist embeddings

Recommended runtime:
- Python Scrapy + Playwright
- Proxy rotation
- Cron every 6 hours

Run locally:
- API: `uvicorn app.main:app --host 0.0.0.0 --port 8003`
- Worker: `python -m app`

Scheduler (built into scraper API):
- Automatic enqueue is enabled by default every 6 hours.
- Config env vars:
	- `SCRAPE_SCHEDULER_ENABLED=true|false`
	- `SCRAPE_SCHEDULE_SECONDS=21600`
	- `SCRAPE_SOURCES=remoteok,greenhouse,linkedin,indeed`
	- `SCRAPE_DEFAULT_LOCATION=`

Useful endpoints:
- `POST /scrape/run` (single source)
- `POST /scrape/run-all` (all configured sources)
- `GET /scrape/scheduler/status`
- `GET /queue/metrics`
