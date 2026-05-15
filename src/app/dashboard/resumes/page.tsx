import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ResumesClient from "./resumes-client";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, created_at, updated_at, is_base, template_type, ats_score, data, content")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <ResumesClient initialResumes={resumes || []} />;
}




