from typing import Protocol, Dict, Any, List

class BaseScraper(Protocol):
    """
    Abstract Protocol for all Job Board Scrapers.
    Enforces a standard dictionary output for 'jobs' table compatibility.
    """
    def scrape(self, location: str | None = None) -> List[Dict[str, Any]]:
        ...
