import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { OpenAI } from "openai";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

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
          content: "You are a professional resume parser. Extract information into structured JSON. If a field is missing, leave it as an empty string or empty array. Be precise and preserve formatting where appropriate."
        },
        {
          role: "user",
          content: `Extract the professional information from this resume text and return it in a structured JSON format following this schema:
{
  "personal": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "summary": "" },
  "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "description": "" } ],
  "education": [ { "school": "", "degree": "", "startDate": "", "endDate": "" } ],
  "skills": [],
  "projects": []
}

Resume text:
${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedContent = JSON.parse(response.choices[0].message.content || "{}");

    // Generate embedding for job matching
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.substring(0, 8000), // OpenAI limit
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Save to database
    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: file.name.replace(".pdf", ""),
        content: parsedContent,
        is_base: true,
        embedding: embedding,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error("Parsing error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse resume" }, { status: 500 });
  }
}




