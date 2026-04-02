import time
from bs4 import BeautifulSoup
import requests
from typing import List, Dict, Any
from .base import BaseScraper

class RemoteOKScraper:
    """
    Example parser for RemoteOK job board without strict anti-bot protections.
    Demonstrates scraping real, live job listings efficiently.
    """
    
    BASE_URL = "https://remoteok.com/api"
    
    def scrape(self, location: str | None = None) -> List[Dict[str, Any]]:
        # RemoteOK provides a handy JSON API which makes scraping much lighter
        # than firing up full Playwright if not strictly required.
        print(f"[*] Starting RemoteOK job sync. Optional location filter: {location}")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
        
        jobs: List[Dict[str, Any]] = []
        try:
            # We add a tag (e.g. "tech" or "engineering") or use location parameter
            url = self.BASE_URL
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            for item in data:
                # The first item is often a legal/copyright notice block in remoteOK api
                if "legal" in item:
                    continue
                
                # Filter location locally if provided since their API is somewhat basic
                job_location = item.get("location", "Remote")
                if location and location.lower() not in job_location.lower() and "worldwide" not in job_location.lower():
                    continue

                jobs.append({
                    "title": item.get("position", "Unknown Title"),
                    "company": item.get("company", "Confidential"),
                    "location": job_location,
                    "salary_range": f"${item.get('salary_min', 0)} - ${item.get('salary_max', 0)}",
                    "description": item.get("description", ""),
                    "job_type": "Full-time", # RemoteOk defaults heavily to full-time remote natively
                    "url": item.get("url", "")
                })
        except Exception as e:
            print(f"[!] RemoteOK Scraper Error: {str(e)}")
            
        return jobs
