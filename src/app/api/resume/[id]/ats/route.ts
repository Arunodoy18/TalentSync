import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { calculateATSScore } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // If target_job_id exists, we match against that job description
    // Otherwise, we match against a generic senior role in their field
    let jobDescription = "A generic senior professional role matching the candidate's skills.";
    if (resume.target_job_id) {
       const { data: job } = await supabase
         .from("jobs")
         .select("description")
         .eq("id", resume.target_job_id)
         .single();
       if (job) jobDescription = job.description;
    }

    const result = await calculateATSScore(resume.content, jobDescription);

    const { data: updatedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        ats_score: result.score,
        feedback: {
           match_explanation: result.suggestions[0] || "Your resume matches the core requirements.",
           missing_skills: result.missingSkills,
           suggestions: result.suggestions,
           ats_breakdown: result.breakdown,
        },
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ resume: updatedResume });
  } catch (error: unknown) {
    console.error("ATS calculation error:", error);
    const message = error instanceof Error ? error.message : "Failed to calculate ATS score";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



