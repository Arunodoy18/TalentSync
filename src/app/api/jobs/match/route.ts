import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { resumeId, q, location, remote } = body;

    let resumeSkills: string[] = [];

    if (resumeId) {
      const { data: resumeData } = await supabase
        .from("resumes")
        .select("content")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();
      
      if (resumeData?.content) {
        try {
          const rc = typeof resumeData.content === 'string' ? JSON.parse(resumeData.content) : resumeData.content;
          if (rc.skills && Array.isArray(rc.skills)) {
            resumeSkills = rc.skills.map((s: any) => typeof s === 'string' ? s : s.name);
          } else {
            resumeSkills = JSON.stringify(rc).toLowerCase().match(/\b\w{4,}\b/g) || [];
          }
        } catch {
          resumeSkills = [];
        }
      }
    }

    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (remote) {
      query = query.ilike("location", "%remote%");
    }

    query = query.limit(200);

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const uniqueSkills = [...new Set(resumeSkills)]
      .filter(s => s && s.length > 2)
      .map(s => s.toLowerCase());

    const rankedJobs = jobs.map((job) => {
      let match_score = 0;

      if (uniqueSkills.length > 0) {
        const jobText = `${job.title} ${job.company} ${job.description} ${job.requirements || ""}`.toLowerCase();
        let matchCount = 0;
        const totalSkillsChecked = Math.min(uniqueSkills.length, 30);
        
        for (let i = 0; i < totalSkillsChecked; i++) {
          if (jobText.includes(uniqueSkills[i])) {
            matchCount++;
          }
        }
        
        const rawScore = totalSkillsChecked > 0 ? (matchCount / totalSkillsChecked) * 100 : 50;

        const titleWords = job.title.toLowerCase().split(/\W+/);
        const titleMatch = titleWords.some((w: string) => w.length > 3 && uniqueSkills.includes(w));
        
        match_score = rawScore + (titleMatch ? 20 : 0);
        match_score = Math.min(Math.max(match_score, 25), 99);
        const variance = (job.id.charCodeAt(0) % 5);
        match_score = Math.min(match_score + variance, 98);
      } else {
        match_score = 50 + (job.id.charCodeAt(0) % 35);
      }

      return { ...job, match_score };
    });

    rankedJobs.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({ jobs: rankedJobs.slice(0, 30) });

  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Failed to match jobs" }, { status: 500 });
  }
}
