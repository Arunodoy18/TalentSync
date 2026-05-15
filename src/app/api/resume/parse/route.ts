import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { OpenAI } from "openai";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResumeProfile = {
  name?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  education?: Array<{ institution: string; location: string; degree: string; dates: string }>;
  experience?: Array<{ company: string; dates: string; position: string; location: string; bullets: string[] }>;
  projects?: Array<{ name: string; techStack: string; dates: string; bullets: string[]; liveUrl: string }>;
  skills?: {
    languages?: string;
    frameworks?: string;
    databases?: string;
    tools?: string;
    aiMl?: string;
  };
  achievements?: string[];
};

function mapResumeToProfile(data: any): ResumeProfile {
  if (!data || typeof data !== "object") return {};

  if (data.name || data.experience || data.education || data.projects) {
    return {
      name: data.name,
      phone: data.phone,
      email: data.email,
      linkedin: data.linkedin,
      github: data.github,
      education: data.education,
      experience: data.experience,
      projects: data.projects,
      skills: data.skills,
      achievements: data.achievements,
    };
  }

  if (data.personal || data.experience || data.education) {
    const skillsText = Array.isArray(data.skills) ? data.skills.join(", ") : "";
    return {
      name: data.personal?.fullName,
      email: data.personal?.email,
      phone: data.personal?.phone,
      linkedin: data.personal?.website,
      education: (data.education || []).map((edu: any) => ({
        institution: edu.school ?? "",
        location: "",
        degree: edu.degree ?? "",
        dates: [edu.startDate, edu.endDate].filter(Boolean).join(" - "),
      })),
      experience: (data.experience || []).map((exp: any) => ({
        company: exp.company ?? "",
        dates: [exp.startDate, exp.endDate].filter(Boolean).join(" - "),
        position: exp.role ?? "",
        location: "",
        bullets: String(exp.description ?? "")
          .split("\n")
          .map((line: string) => line.trim())
          .filter(Boolean),
      })),
      projects: (data.projects || []).map((proj: any) => ({
        name: proj.name ?? "",
        techStack: proj.technologies ?? "",
        dates: "",
        bullets: Array.isArray(proj.bullets) ? proj.bullets : [],
        liveUrl: proj.link ?? "",
      })),
      skills: {
        languages: skillsText,
      },
      achievements: [],
    };
  }

  if (data.fullName || data.department || data.education) {
    return {
      name: data.fullName,
      education: (data.education || []).map((edu: any) => ({
        institution: edu.institute ?? edu.university ?? "",
        location: "",
        degree: edu.examination ?? "",
        dates: edu.year ?? "",
      })),
      experience: (data.experience || []).map((exp: any) => ({
        company: exp.company ?? "",
        dates: exp.date ?? "",
        position: exp.position ?? "",
        location: "",
        bullets: Array.isArray(exp.descriptions) ? exp.descriptions : [],
      })),
      projects: (data.projects || []).map((proj: any) => ({
        name: proj.title ?? "",
        techStack: proj.courseCode ?? "",
        dates: proj.date ?? "",
        bullets: Array.isArray(proj.descriptions) ? proj.descriptions : [],
        liveUrl: "",
      })),
      skills: {
        languages: data.skills?.programmingLanguages ?? "",
        frameworks: data.skills?.toolsAndLibraries ?? "",
      },
      achievements: [],
    };
  }

  return {};
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profileRes, resumeRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("resumes")
        .select("data, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const fallbackResume = resumeRes.data?.data ?? resumeRes.data?.content ?? null;
    const mappedResume = mapResumeToProfile(fallbackResume);
    const profile = profileRes.data ?? {};

    const userProfile: ResumeProfile = {
      ...mappedResume,
      name: profile.full_name || mappedResume.name || user.user_metadata?.full_name || "",
      email: profile.email || mappedResume.email || user.email || "",
      phone: profile.phone || mappedResume.phone || "",
      linkedin: profile.linkedin || mappedResume.linkedin || "",
      github: profile.github || mappedResume.github || "",
      skills: {
        languages: profile.skills_languages || mappedResume.skills?.languages || "",
        frameworks: profile.skills_frameworks || mappedResume.skills?.frameworks || "",
        databases: profile.skills_databases || mappedResume.skills?.databases || "",
        tools: profile.skills_tools || mappedResume.skills?.tools || "",
        aiMl: profile.skills_ai_ml || mappedResume.skills?.aiMl || "",
      },
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    const text = data.text || "";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    const prompt = `You are an expert resume writer. I will give you:
A) A REFERENCE RESUME from someone else (for structure/format only)
B) MY PERSONAL DATA (my actual details)

Your job: Rewrite the reference resume's STRUCTURE and FORMAT 
but replace 100% of the content with MY PERSONAL DATA.

Rules:
- Keep the same sections that exist in the reference resume
- Keep the same number of bullet points per section
- Use the same writing style (action verbs, metrics)
- But ALL names, companies, projects, skills, dates must 
  come from MY PERSONAL DATA only
- Enhance my bullet points to match the quality and density 
  of the reference resume
- Add metrics and numbers where I haven't provided them 
  (estimate realistically based on context)
- Return ONLY valid JSON, no markdown, no explanation

REFERENCE RESUME TEXT:
${text}

MY PERSONAL DATA:
${JSON.stringify(userProfile, null, 2)}

Return this exact JSON structure:
{
  name, phone, email, linkedin, github,
  education: [{institution, location, degree, dates}],
  experience: [{company, dates, position, location, bullets:[]}],
  projects: [{name, techStack, dates, bullets:[], liveUrl}],
  skills: {languages, frameworks, databases, tools, aiMl},
  achievements: []
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    let content = response.choices[0].message?.content || "{}";

    if (content.startsWith("```")) {
      content = content.replace(/^```json\n|\n```$/g, "");
    }

    const parsedJson = JSON.parse(content);

    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: "Failed to parse resume", details: error.message },
      { status: 500 }
    );
  }
}
