import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { calculateATSScore } from "@/lib/openai";

// Calls our AI service to generate deeply analytical ATS score breakdown
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobId } = await req.json();

    if (!resumeId || !jobId) {
      return NextResponse.json({ error: "Missing required properties: resumeId, jobId" }, { status: 400 });
    }

    // Load Resume 
    const { data: resume } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    // Load JD 
    const { data: job } = await supabase
      .from("jobs")
      .select("title, company, description, skills_required, location, job_type")
      .eq("id", jobId)
      .single();

    if (!resume || !job) {
      return NextResponse.json({ error: "Could not find either the Resume or Job." }, { status: 404 });
    }

    const jobDescription = `${job.title} at ${job.company}\n\nLocation: ${job.location}\nType: ${job.job_type}\n\nRequired Skills: ${job.skills_required?.join(", ") || "None specified"}\n\n${job.description}`;
    const resumeJson = resume.content || {};

    const result = await calculateATSScore(resumeJson, jobDescription);

    return NextResponse.json({
      overall: result.score,
      keywords: result.breakdown.keywordMatch,
      formatting: result.breakdown.formatting,
      experience: result.breakdown.experienceMatch,
      skills: result.breakdown.skillsMatch,
      suggestions: result.suggestions
    });
  } catch (error: unknown) {
    console.error("ATS Score error:", error);
    const message = error instanceof Error ? error.message : "Failed to calculate ATS score";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




