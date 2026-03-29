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
