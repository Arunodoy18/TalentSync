import asyncio
from playwright.async_api import async_playwright
from typing import List, Dict, Any
from .base import BaseScraper

class GreenhousePlaywrightScraper:
    """
    Playwright implementation for job boards like Greenhouse that heavily
    rely on JS rendering and anti-bot checks.
    """
    
    company_domain = "openai"  # You likely parameterize this further in worker payload.
    base_url = f"https://boards.greenhouse.io/{company_domain}"
    
    async def run_playwright(self, location: str | None = None) -> List[Dict[str, Any]]:
        print(f"[*] Firing up Headless Chromium Playwright instance against {self.base_url}")
        jobs: List[Dict[str, Any]] = []
        
        async with async_playwright() as p:
            # We add anti-bot flag headers usually, but Playwright often handles enough locally
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            try:
                await page.goto(self.base_url, timeout=30000, wait_until="domcontentloaded")
                
                # Fetch all greenhouse 'job' rows
                elements = await page.locator("div.opening").all()
                for element in elements:
                    job_link = await element.locator("a").get_attribute("href")
                    title = await element.locator("a").inner_text()
                    job_location = await element.locator("span.location").inner_text()
                    
                    if location and location.lower() not in job_location.lower():
                        continue
                        
                    jobs.append({
                         "title": title.strip(),
                         "company": self.company_domain.capitalize(),
                         "location": job_location.strip(),
                         "salary_range": "Undisclosed", # Usually requires clicking into job description
                         "description": "Greenhouse Link",
                         "job_type": "Full-time",
                         "url": f"https://boards.greenhouse.io{job_link}"
                    })
            except Exception as e:
                print(f"[!] Playwright Engine error: {str(e)}")
            finally:
                await browser.close()
        
        return jobs

    def scrape(self, location: str | None = None) -> List[Dict[str, Any]]:
        return asyncio.run(self.run_playwright(location))
