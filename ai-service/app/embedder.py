import os
import time
from typing import Any, Dict

from supabase import create_client, Client
from dotenv import load_dotenv

from .pipeline import AIPipeline

load_dotenv()

# We need the service role key to forcefully update background records
URL = os.environ.get("SUPABASE_URL", "")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

def run_background_embedder():
    if not URL or not KEY:
        print("[!] Missing SUPABASE variables. Cannot run background embedder.")
        return

    supabase: Client = create_client(URL, KEY)
    pipeline = AIPipeline()

    print("[*] Starting Background pgvector Job Embedder...")

    while True:
        try:
            # Fetch up to 50 jobs at a time where embedding is null
            response = supabase.table("jobs").select("id, title, company, description, location").is_("embedding", "null").limit(50).execute()
            jobs = response.data

            if not jobs:
                # Sleep if no pending jobs
                time.sleep(10)
                continue

            print(f"[*] Found {len(jobs)} jobs missing vector embeddings. Generating...")

            for job in jobs:
                # Concatenate fields into a rich text blob for the LLM
                title = job.get("title") or ""
                company = job.get("company") or ""
                desc = job.get("description") or ""
                loc = job.get("location") or ""
                
                text_to_embed = f"{title} at {company} ({loc})\n\n{desc}"
                
                # Fetch OpenAI 1536-d mapping
                vector = pipeline.embedding(text_to_embed)
                
                # Upsert silently back into Supabase without disrupting other fields
                supabase.table("jobs").update({"embedding": vector}).eq("id", job["id"]).execute()
            
            print(f"[+] Successfully vectorized {len(jobs)} jobs.")
            
        except Exception as e:
            print(f"[!] Embedder Error: {str(e)}")
            time.sleep(5)

if __name__ == "__main__":
    run_background_embedder()
