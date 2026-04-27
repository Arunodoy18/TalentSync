import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { OpenAI } from "openai";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResumeContent = {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  projects: Array<Record<string, unknown>>;
};

function asText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeParsedContent(raw: unknown): ResumeContent {
  const record = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const personalRaw =
    typeof record.personal === "object" && record.personal !== null
      ? (record.personal as Record<string, unknown>)
      : {};

  const experienceRaw = Array.isArray(record.experience) ? record.experience : [];
  const educationRaw = Array.isArray(record.education) ? record.education : [];
  const projectsRaw = Array.isArray(record.projects) ? record.projects : [];
  const skillsRaw = Array.isArray(record.skills)
    ? record.skills
    : typeof record.skills === "string"
      ? record.skills.split(",")
      : [];

  return {
    personal: {
      fullName: asText(personalRaw.fullName),
      email: asText(personalRaw.email),
      phone: asText(personalRaw.phone),
      location: asText(personalRaw.location),
      website: asText(personalRaw.website),
      summary: asText(personalRaw.summary),
    },
    experience: experienceRaw.map((entry) => {
      const value = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {};
      return {
        company: asText(value.company),
        role: asText(value.role),
        startDate: asText(value.startDate),
        endDate: asText(value.endDate),
        description: asText(value.description),
      };
    }),
    education: educationRaw.map((entry) => {
      const value = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {};
      return {
        school: asText(value.school),
        degree: asText(value.degree),
        startDate: asText(value.startDate),
        endDate: asText(value.endDate),
        description: asText(value.description),
      };
    }),
    skills: asStringArray(skillsRaw),
    projects: projectsRaw.map((entry) =>
      typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {}
    ),
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        text: text.substring(0, 1000)
      }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume parser and resume writer. Convert raw resume text into dense, keyword-rich, ATS-optimized structured JSON while preserving factual information. Always return valid JSON only."
        },
        {
          role: "user",
          content: `Extract and ENRICH the professional information from this resume text and return it in a structured JSON format following this schema:
{
  "personal": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "summary": "" },
  "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "description": "" } ],
  "education": [ { "school": "", "degree": "", "startDate": "", "endDate": "", "description": "" } ],
  "skills": [],
  "projects": []
}

STRICT OUTPUT RULES:
1) For every experience entry, "description" must contain 4-5 bullet points separated by newline characters.
2) Every bullet point must start with a strong action verb from this set whenever applicable:
   Engineered, Architected, Optimized, Implemented, Designed, Led, Reduced, Increased.
3) Every bullet must include at least one concrete metric/number where possible
   (examples: "reduced load time by 40%", "served 10k+ users", "cut costs by 22%").
4) "skills" must list 15-20 relevant technical skills minimum, deduplicated, ATS keyword-rich.
5) The generated content should be dense enough to fill a full A4 resume when rendered.
6) Keep output concise, high-signal, and recruiter-friendly while remaining truthful to the source.
7) If a field is missing, use an empty string or empty array instead of inventing unrelated facts.
8) Return JSON only; do not add markdown or explanations.

Resume text:
${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedContent = normalizeParsedContent(
      JSON.parse(response.choices[0].message.content || "{}")
    );

    // Keep one latest base resume.
    await supabase.from("resumes").update({ is_base: false }).eq("user_id", user.id);

    // Save to database
    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: file.name.replace(".pdf", ""),
        content: parsedContent,
        is_base: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    console.error("Parsing error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




