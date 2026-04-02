import asyncio
from playwright.async_api import async_playwright
from typing import List, Dict, Any
from .base import BaseScraper
import urllib.parse
import random

class IndeedScraper:
    """
    Playwright instance for Indeed's highly-bot-protected search pages.
    """
    
    base_url = "https://www.indeed.com/jobs"
    
    async def run_playwright(self, location: str | None = None) -> List[Dict[str, Any]]:
        query = "software engineer"
        loc = location or "remote"
        
        # Indeed actively blocks headless browsers if detected. 
        url = f"{self.base_url}?q={urllib.parse.quote(query)}&l={urllib.parse.quote(loc)}"
        print(f"[*] Scraping Indeed: {url}")
        
        jobs: List[Dict[str, Any]] = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()

            try:
                # Bypass basic captcha waits by injecting scripts or letting playweight naturally settle.
                await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                
                # Check for Cloudflare / DataDome catch
                if "hcaptcha" in await page.content() or "cloudflare" in await page.content():
                    print("[!] Indeed anti-bot challenge encountered. Skipping iteration.")
                    return []

                await page.wait_for_selector(".jobsearch-ResultsList", timeout=10000)
                
                cards = await page.locator(".job_seen_beacon").all()
                
                for card in cards[:15]:
                    title_elem = card.locator(".jobTitle a")
                    company_elem = card.locator("[data-testid='company-name']")
                    loc_elem = card.locator("[data-testid='text-location']")
                    
                    title = await title_elem.inner_text()
                    company = await company_elem.inner_text()
                    job_loc = await loc_elem.inner_text()
                    href = await title_elem.get_attribute("href")
                    
                    # Convert relative link to absolute
                    full_link = f"https://www.indeed.com{href}" if href and href.startswith("/") else href
                    
                    jobs.append({
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": job_loc.strip(),
                        "salary_range": "Variable",  # Sometimes scraped from inside the card, omitted for speed
                        "description": "See Indeed for full details.",
                        "job_type": "Full-time",
                        "url": full_link,
                        "source": "Indeed"
                    })
                    
            except Exception as e:
                print(f"[!] Indeed Scraper Execution error: {str(e)}")
            finally:
                await browser.close()
        
        return jobs

    def scrape(self, location: str | None = None) -> List[Dict[str, Any]]:
        return asyncio.run(self.run_playwright(location))
