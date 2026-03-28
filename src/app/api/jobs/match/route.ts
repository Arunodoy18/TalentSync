import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateEmbedding } from "@/lib/openai";

function normalizeSkill(value: string): string {
  return value.trim().toLowerCase();
}

function extractResumeSkills(resumeContent: any): string[] {
  const skills = resumeContent?.skills;
  if (!Array.isArray(skills)) return [];

  if (skills.length > 0 && typeof skills[0] === "string") {
    return skills.map(normalizeSkill).filter(Boolean);
  }

  if (skills.length > 0 && typeof skills[0] === "object" && Array.isArray(skills[0]?.items)) {
    return skills
      .flatMap((entry: { items?: string[] }) => entry.items || [])
      .map(normalizeSkill)
      .filter(Boolean);
  }

  return [];
}

function extractJobSkills(job: any): string[] {
  if (Array.isArray(job?.skills_required) && job.skills_required.length > 0) {
    return job.skills_required.map((s: string) => normalizeSkill(s)).filter(Boolean);
  }

  const text = `${job?.title || ""} ${job?.description || ""}`;
  return text
    .split(/[^a-zA-Z0-9+#\.]/)
    .map(normalizeSkill)
    .filter((token) => token.length > 2);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await req.json();

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let queryEmbedding = resume.embedding;

    // If no embedding exists, generate one
    if (!queryEmbedding) {
      const text = JSON.stringify(resume.content);
      queryEmbedding = await generateEmbedding(text);
      
      // Update resume with embedding for future use
      await supabase
        .from("resumes")
        .update({ embedding: queryEmbedding })
        .eq("id", resumeId);
    }

    const { data: jobs, error: matchError } = await supabase.rpc("match_jobs", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (matchError) throw matchError;

    const resumeSkills = Array.from(new Set(extractResumeSkills(resume.content)));

    const rankedJobs = (jobs || [])
      .map((job: any) => {
        const semanticScore = Math.max(0, Math.min(1, Number(job.similarity || 0)));
        const jobSkills = Array.from(new Set(extractJobSkills(job)));
        const matchingSkills = jobSkills.filter((skill) => resumeSkills.includes(skill));
        const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill));
        const skillsScore = jobSkills.length > 0 ? matchingSkills.length / jobSkills.length : semanticScore;

        const finalScore =
          0.7 * semanticScore +
          0.3 * skillsScore;

        return {
          ...job,
          similarity: semanticScore,
          match_score: Number((finalScore * 100).toFixed(2)),
          explainability: {
            semantic_score: Number((semanticScore * 100).toFixed(2)),
            skills_score: Number((skillsScore * 100).toFixed(2)),
            matching_skills: matchingSkills,
            missing_skills: missingSkills.slice(0, 10),
            formula: "0.7*semantic + 0.3*skills",
          },
        };
      })
      .sort((a: any, b: any) => b.match_score - a.match_score);

    try {
      const matchRows = rankedJobs.map((job: any) => ({
        user_id: user.id,
        job_id: job.id,
        resume_id: resume.id,
        match_score: job.match_score,
        semantic_score: Number((job.similarity * 100).toFixed(2)),
        missing_skills: job.explainability.missing_skills,
        status: "not_applied",
      }));

      if (matchRows.length > 0) {
        await supabase.from("job_matches").upsert(matchRows, {
          onConflict: "user_id,job_id,resume_id",
        });
      }
    } catch (persistError) {
      console.error("Job match persistence warning:", persistError);
    }

    return NextResponse.json({ jobs: rankedJobs });
  } catch (error: unknown) {
    console.error("Job match error:", error);
    const message = error instanceof Error ? error.message : "Failed to match jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
