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

  const text = `${job?.title || ""} ${job?.description || ""} ${job?.job_description || ""}`;
  return text
    .split(/[^a-zA-Z0-9+#\.]/)
    .map(normalizeSkill)
    .filter((token) => token.length > 2);
}

function titleTokenOverlap(title: string, resumeSkills: Set<string>): number {
  const tokens = title
    .toLowerCase()
    .split(/[^a-z0-9+#\.]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  if (tokens.length === 0 || resumeSkills.size === 0) {
    return 0;
  }

  const overlap = tokens.filter((token) => resumeSkills.has(token)).length;
  return overlap / tokens.length;
}

export async function POST(req: NextRequest) {
  try {
    const { resumeId } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // If no embedding exists, generate one for the resume text
    if (!queryEmbedding) {
      const text = typeof resume.content === 'object' ? JSON.stringify(resume.content) : resume.content;
      queryEmbedding = await generateEmbedding(text);

      // Update resume with embedding for future use
      await supabase
        .from("resumes")
        .update({ embedding: queryEmbedding })
        .eq("id", resumeId);
    }

    // Use cosine similarity (via match_jobs which uses 1 - (embedding <=> query_embedding))
    const { data: jobs, error: matchError } = await supabase.rpc("match_jobs", {
      query_embedding: queryEmbedding,
      match_threshold: 0.65,
      match_count: 20,
    });
    if (matchError) {
      console.warn("match_jobs RPC warning:", matchError.message);
    }

    const resumeSkills = Array.from(new Set(extractResumeSkills(resume.content)));
    const resumeSkillSet = new Set(resumeSkills);
    let fallbackUsed = false;
    let similarityThreshold = 0.65;

    let jobsForRanking: any[] = Array.isArray(jobs) ? jobs : [];

    if (jobsForRanking.length === 0) {
      fallbackUsed = true;
      similarityThreshold = 0.15;

      const { data: recentJobs, error: recentJobsError } = await supabase
        .from("jobs")
        .select("id, title, company, location, salary_range, description, job_type, url, skills_required, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (recentJobsError) {
        throw new Error(`Failed to fetch recent jobs for fallback ranking: ${recentJobsError.message}`);
      }

      jobsForRanking = (recentJobs ?? []).map((job: any) => {
        const jobSkills = Array.from(new Set(extractJobSkills(job)));
        const overlappingSkills = jobSkills.filter((skill) => resumeSkillSet.has(skill)).length;
        const skillScore = jobSkills.length > 0 ? overlappingSkills / jobSkills.length : 0;
        const titleScore = titleTokenOverlap(job.title || "", resumeSkillSet);

        const fallbackSimilarity = Math.max(0, Math.min(1, skillScore * 0.8 + titleScore * 0.2));

        return {
          ...job,
          similarity: fallbackSimilarity,
        };
      });
    }

    const rankedJobs = jobsForRanking
      .map((job: any) => {
        const match_score = Math.max(0, Math.min(1, Number(job.similarity || 0)));
        
        // Extract skills to figure out what's missing
        const jobSkills = Array.from(new Set(extractJobSkills(job)));
        const missing_skills = jobSkills.filter((skill) => !resumeSkills.includes(skill));      

        return {
          ...job,
          similarity: match_score,
          match_score: Number((match_score * 100).toFixed(2)),
          explainability: {
            missing_skills: missing_skills.slice(0, 10),
          },
        };
      })
      .filter((job: any) => job.similarity > similarityThreshold)
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 20);
      const matchRows = rankedJobs.map((job: any) => ({
        user_id: user.id,
        job_id: job.id,
        resume_id: resume.id,
        match_score: job.match_score,
        semantic_score: Number((job.similarity * 100).toFixed(2)),
        missing_skills: job.explainability.missing_skills,
        status: "not_applied",
      }));

      try {
        if (matchRows.length > 0) {
          await supabase.from("job_matches").upsert(matchRows, {
            onConflict: "user_id,job_id,resume_id",
          });
        }
      } catch (persistError) {
        console.error("Job match persistence warning:", persistError);
      }

      return NextResponse.json({ jobs: rankedJobs, fallbackUsed });
    } catch (error: unknown) {
    console.error("Job match error:", error);
    const message = error instanceof Error ? error.message : "Failed to match jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




