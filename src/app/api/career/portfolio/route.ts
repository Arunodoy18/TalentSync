import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription, company, role, tone } = body;

    if (!resumeId || !jobDescription || !company || !role || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the resume
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
      return NextResponse.json({ error: "OpenAI API key missing" }, { status: 500 });
    }

    // Prepare Prompt
    const systemPrompt = `You are an expert career strategist and executive copywriter. 
Generate a tailored 3-paragraph cover letter using the provided resume skills and the job description.
Tone: ${tone}.
Structure:
- Paragraph 1: Enthusiastic opening, mention the role at ${company}, and a strong hook summarizing value.
- Paragraph 2: Connect specific past achievements and skills from the resume to the core needs in the job description.
- Paragraph 3: Concise closing, reinforcing cultural fit or readiness to impact the team, and a call to action.
Do not include placeholder brackets like [Your Name] unless absolutely necessary. Sign off professionally.`;

    const userPrompt = `Target Company: ${company}
Target Role: ${role}

Job Description:
${jobDescription}

My Resume Data:
${JSON.stringify(resume.content)}

Draft the cover letter now.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const generatedText = aiResponse.choices[0].message.content || "";

    // Save to cover_letters table
    const { data: insertedLetter, error: insertError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        company,
        role,
        tone,
        job_description: jobDescription,
        content: generatedText,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save cover letter" }, { status: 500 });
    }

    return NextResponse.json({ 
      id: insertedLetter.id,
      text: generatedText 
    });

  } catch (error: unknown) {
    console.error("Cover letter generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




