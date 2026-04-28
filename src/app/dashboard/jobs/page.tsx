import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import JobsClient from "./jobs-client";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get user's base resume
  const { data: baseResume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_base", true)
    .maybeSingle();

  const { data: latestResume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeResume = baseResume ?? latestResume;

  return <JobsClient activeResume={activeResume} />;
}




