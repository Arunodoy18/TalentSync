import asyncio
from playwright.async_api import async_playwright
from typing import Dict, Any

from .base import BaseApplier

class GreenhouseApplier:
    """
    Playwright instance for filling out Greenhouse application forms automatically.
    """
    
    async def apply(self, apply_url: str, applicant_data: Dict[str, Any], resume_path: str) -> bool:
        print(f"[*] Firing up Headless Chromium Playwright instance to auto-apply on {apply_url}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            try:
                await page.goto(apply_url, timeout=30000, wait_until="domcontentloaded")
                
                # Check if it's a valid greenhouse form
                if not await page.locator("form#application_form").count():
                    print("[!] Could not find greenhouse application form on page. Maybe not a greenhouse URL?")
                    return False
                    
                # 1. Basic Info
                print("[*] Filling Basic Info...")
                
                # First Name - parse from full name if needed
                first_name, *last_name_parts = applicant_data.get("name", "Jane Doe").split(' ')
                last_name = " ".join(last_name_parts) if last_name_parts else first_name

                await page.fill("input#first_name", first_name)
                await page.fill("input#last_name", last_name)
                await page.fill("input#email", applicant_data.get("email", "dummy@example.com"))
                await page.fill("input#phone", applicant_data.get("phone", "555-0199"))

                # 2. File Uploads (Resume & Cover Letter)
                print(f"[*] Uploading Resume from {resume_path}...")
                
                # We need to find the specific input[type="file"] for resumes. Often there are multiple. 
                # Greenhouse usually has a set of these with different parent IDs.
                resume_file_input = page.locator("button[data-source='attach']").first
                if await resume_file_input.count(): 
                    # Simpler to directly inject via file input if possible
                    file_input = page.locator("input[type='file']").first
                    if file_input:
                        await file_input.set_input_files(resume_path)
                
                # 3. Custom Questions (Optional based on payload configuration)
                # Greenhouse dynamically renders custom fields (LinkedIn URL, Website)
                linkedin_url = applicant_data.get("linkedin_url")
                if linkedin_url:
                    linkedin_input = page.locator("input:has-text('LinkedIn')").first
                    if await linkedin_input.count():
                         await linkedin_input.fill(linkedin_url)

                # 4. Consent and Submit
                print("[*] Submitting Application...")
                # We mock clicking submit if in DRY_RUN mode, but assume active mode here 
                # await page.click("button#submit_app") 
                
                # Simulation mode: Just print success instead of aggressively submitting
                # to prevent accidentally spamming real companies during development testing.
                await page.wait_for_timeout(2000) 
                
                print(f"[+] Successfully filled application map for {apply_url}!")
                return True
                
            except Exception as e:
                print(f"[!] Playwright Engine error: {str(e)}")
                return False
            finally:
                await browser.close()
