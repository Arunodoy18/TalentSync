import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

supabase: Client | None = None

if URL and KEY:
    supabase = create_client(URL, KEY)
else:
    print("[WARNING] Supabase environment variables missing! Jobs will only be printed to console.")

def insert_jobs_bulk(jobs: list[dict]):
    if not supabase:
        print("[!] Cannot insert jobs into DB! Supabase client not initialized.")
        for job in jobs:
            print(f"[DRY RUN] Would save: {job['title']} @ {job['company']}")
        return

    try:
        # Avoid mass inserting empty results
        if not jobs:
            return
            
        print(f"[*] Bulk inserting {len(jobs)} into DB.jobs...")
        response = supabase.table('jobs').upsert(jobs).execute()
        # You'll note we omit `embedding` generation here in the Scraper 
        # so that it stays exceptionally lightweight! A cron job or Edge function 
        # should generate embeddings asynchronously for any jobs with `NULL` embedding.
        
        return response
    except Exception as e:
        print(f"[!] Supabase bulk insert error: {str(e)}")
