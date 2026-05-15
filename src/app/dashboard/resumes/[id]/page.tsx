import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import ResumePreviewClient from "./resume-preview-client";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    notFound();
  }

  return <ResumePreviewClient resume={resume} />;
}



