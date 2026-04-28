import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CoverLetterClient from "./cover-letter-client";

export default async function CoverLettersPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, is_base")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: coverLetters } = await supabase
    .from("cover_letters")
    .select("id, company, role, content, created_at, tone")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight text-white">Cover Letters</h1>
        <p className="app-subtitle mt-1 text-slate-400">Generate role-specific cover letters from your strongest resume points.</p>
      </div>

      <CoverLetterClient 
        resumes={resumes || []} 
        initialLetters={coverLetters || []} 
      />
    </div>
  );
}




