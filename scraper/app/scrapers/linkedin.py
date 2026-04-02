import asyncio
from playwright.async_api import async_playwright
from typing import List, Dict, Any
from .base import BaseScraper
import urllib.parse
import random

class LinkedInScraper:
    """
    Playwright scraper for LinkedIn Jobs (Public Search).
    """
    
    base_url = "https://www.linkedin.com/jobs/search"
    
    async def run_playwright(self, location: str | None = None) -> List[Dict[str, Any]]:
        # LinkedIn public search does not strictly require login but uses heavy rate limiting.
        query = "software engineer" # Default query; you would parameterize this in worker
        loc = location or "Worldwide"
        
        url = f"{self.base_url}?keywords={urllib.parse.quote(query)}&location={urllib.parse.quote(loc)}"
        print(f"[*] Scraping LinkedIn Jobs: {url}")
        
        jobs: List[Dict[str, Any]] = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            try:
                await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                
                # Wait for job cards to render
                await page.wait_for_selector(".base-card", timeout=10000)
                
                elements = await page.locator("div.base-card").all()
                for element in elements[:15]:  # Limit to avoid heavy bot blocking on first load
                    try:
                        title_el = element.locator(".base-search-card__title")
                        company_el = element.locator(".base-search-card__subtitle")
                        loc_el = element.locator(".job-search-card__location")
                        link_el = element.locator("a.base-card__full-link")
                        
                        title = await title_el.inner_text()
                        company = await company_el.inner_text()
                        job_loc = await loc_el.inner_text()
                        job_link = await link_el.get_attribute("href")
                        
                        # Clean tracking params from URL
                        clean_url = job_link.split("?")[0] if job_link else ""
                        
                        jobs.append({
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": job_loc.strip(),
                            "salary_range": "Competitive", 
                            "description": "See LinkedIn for full details.",
                            "job_type": "Full-time",
                            "url": clean_url,
                            "source": "LinkedIn"
                        })
                    except Exception as parse_err:
                        print(f"[!] Error parsing individual LinkedIn card: {parse_err}")
                        
            except Exception as e:
                print(f"[!] LinkedIn Scraper Engine error: {str(e)}")
            finally:
                await browser.close()
        
        return jobs

    def scrape(self, location: str | None = None) -> List[Dict[str, Any]]:
        return asyncio.run(self.run_playwright(location))
