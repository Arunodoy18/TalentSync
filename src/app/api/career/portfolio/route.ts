import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PortfolioResponse {
  portfolio: {
    hero: {
      title: string;
      subtitle: string;
    };
    about: {
      summary: string;
    };
    projects: Array<{
      title: string;
      description: string;
      tech: string[];
    }>;
    skills: string[];
  };
}

const fallbackPortfolio: PortfolioResponse["portfolio"] = {
  hero: {
    title: "Professional Portfolio",
    subtitle: "Building measurable impact through strong execution.",
  },
  about: {
    summary: "Results-driven professional with a track record of delivering high-quality outcomes.",
  },
  projects: [
    {
      title: "Impact Project",
      description: "Delivered an end-to-end solution that improved team delivery and user outcomes.",
      tech: ["TypeScript", "React", "SQL"],
    },
    {
      title: "Automation Initiative",
      description: "Reduced manual effort with automation and improved operational efficiency.",
      tech: ["Python", "APIs", "CI/CD"],
    },
  ],
  skills: ["Problem Solving", "Communication", "Execution"],
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ portfolio: fallbackPortfolio });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a senior personal-branding strategist. Convert resume data into a portfolio content blueprint. Keep language concise, concrete, and results-oriented.",
        },
        {
          role: "user",
          content: `Generate JSON only with this exact shape:\n{\n  "portfolio": {\n    "hero": {"title": "", "subtitle": ""},\n    "about": {"summary": ""},\n    "projects": [{"title": "", "description": "", "tech": []}],\n    "skills": []\n  }\n}\n\nRules:\n- Include 3 to 5 projects max.\n- Skills should be 8 to 12 concise items.\n- Do not invent impossible claims; infer from provided resume only.\n\nResume data:\n${JSON.stringify(
            resume.content
          )}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiResponse.choices[0].message.content;
    const parsed = content ? (JSON.parse(content) as PortfolioResponse) : null;

    if (!parsed?.portfolio) {
      return NextResponse.json({ portfolio: fallbackPortfolio });
    }

    return NextResponse.json({ portfolio: parsed.portfolio });
  } catch (error: any) {
    console.error("Portfolio generation error:", error);
    return NextResponse.json({ portfolio: fallbackPortfolio });
  }
}




