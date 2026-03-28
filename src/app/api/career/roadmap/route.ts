import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";
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

    const canUseRoadmap = await hasPlanAccess(user.id, "pro");
    if (!canUseRoadmap) {
      return NextResponse.json(
        { error: "Career Roadmap is available on Pro and above plans." },
        { status: 402 }
      );
    }

    const { resumeId } = await req.json();

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career strategist. Analyze the user's resume and generate a detailed 3-step career roadmap. For each step, provide a title, description, key skills to learn, and a realistic timeline."
        },
        {
          role: "user",
          content: `Generate a career roadmap based on this resume: ${JSON.stringify(resume.content)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const roadmapData = JSON.parse(response.choices[0].message.content || "{}");
    const roadmap = roadmapData.roadmap || [
        { title: "Skill Up", description: "Enhance your technical skills", skills: ["React", "TypeScript"], timeline: "1-2 months" },
        { title: "Build Projects", description: "Apply your skills to real-world projects", skills: ["Portfolio Building"], timeline: "3-4 months" },
        { title: "Apply & Network", description: "Start reaching out to recruiters", skills: ["Networking", "Interview Prep"], timeline: "5-6 months" }
    ];

    return NextResponse.json({ roadmap });
  } catch (error: unknown) {
    console.error("Roadmap generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate roadmap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
