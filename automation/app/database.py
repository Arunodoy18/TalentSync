import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL: str = os.environ.get("SUPABASE_URL", "")
KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

supabase: Client | None = None

if URL and KEY:
    supabase = create_client(URL, KEY)
else:
    print("[WARNING] Supabase environment variables missing! Database operations suspended.")

def get_job_and_resume(job_id: str, resume_id: str, user_id: str):
    if not supabase:
        raise ValueError("Supabase is not initialized.")
        
    job_resp = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
    resume_resp = supabase.table("resumes").select("*").eq("id", resume_id).eq("user_id", user_id).single().execute()
    
    return job_resp.data, resume_resp.data

def mark_job_status(job_id: str, resume_id: str, user_id: str, status: str):
    if not supabase:
        print(f"[!] Could not update status to {status} because Supabase is not initialized.")
        return False
        
    try:
        supabase.table("job_matches").update({"status": status}).eq("job_id", job_id).eq("user_id", user_id).eq("resume_id", resume_id).execute()
        return True
    except Exception as e:
        print(f"[!] DB Error updating status to {status}: {e}")
        return False
        