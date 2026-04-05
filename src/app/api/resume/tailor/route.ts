import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase-server";
import { hasPlanAccess } from "@/lib/entitlements";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canUseTailor = await hasPlanAccess(user.id, "pro");
    if (!canUseTailor) {
      return NextResponse.json(
        { error: "Tailor Resume is available on Pro and above plans." },
        { status: 402 }
      );
    }

    const { resume_id, job_id } = await req.json();

    if (!resume_id || !job_id) {
      return NextResponse.json({ error: "Missing resume_id or job_id" }, { status: 400 });
    }

    // Fetch resume and job
    const [{ data: resume }, { data: job }] = await Promise.all([
      supabase.from("resumes").select("*").eq("id", resume_id).single(),
      supabase.from("jobs").select("*").eq("id", job_id).single(),
    ]);

    if (!resume || !job) {
      return NextResponse.json({ error: "Resume or Job not found" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // 1. Rewrite Resume (Tailoring Engine)
    const rewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach and resume writer. Rewrite the user's resume to perfectly match the job description while remaining truthful. Emphasize relevant experience, use industry-standard keywords from the job description, and optimize for ATS systems."
        },
        {
          role: "user",
          content: `
Job Description:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Current Resume:
${JSON.stringify(resume.content, null, 2)}

Return the tailored resume in the EXACT SAME JSON structure as the current resume.
Include a new field "feedback" that contains:
{
  "ats_score": number (0-100),
  "match_explanation": string,
  "missing_skills": string[],
  "suggestions": string[]
}
`
        }
      ],
      response_format: { type: "json_object" }
    });

    const tailoredData = JSON.parse(rewriteResponse.choices[0].message.content || "{}");
    const { feedback, ...tailoredContent } = tailoredData;

    // Save as a new tailored resume
    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${resume.title} - ${job.company} (${job.title})`,
        content: tailoredContent,
        is_base: false,
        parent_resume_id: resume.id,
        target_job_id: job.id,
        ats_score: feedback?.ats_score || 0,
        feedback: feedback || {},
      })
      .select()
      .single();

    if (error) throw error;

    // Also create a job application record
    await supabase.from("job_applications").insert({
      user_id: user.id,
      job_id: job.id,
      resume_id: newResume.id,
      status: "tailored",
    });

    return NextResponse.json({ resume: newResume });
  } catch (error: unknown) {
    console.error("Tailoring error:", error);
    const message = error instanceof Error ? error.message : "Failed to tailor resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




