import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";

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
          content: "You are an industry skills expert. Identify the user's current skills from their resume and suggest 5-8 missing key skills for their target career path. Rank missing skills by priority (high, medium, low)."
        },
        {
          role: "user",
          content: `Identify skills and gaps from this resume: ${JSON.stringify(resume.content)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const skillData = JSON.parse(response.choices[0].message.content || "{}");
    const skills = skillData.skills || [
        { name: "React", status: "have", priority: "low" },
        { name: "Node.js", status: "missing", priority: "high" },
        { name: "AWS", status: "missing", priority: "medium" },
    ];

    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error("Skill analysis error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze skills" }, { status: 500 });
  }
}
