import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { OpenAI } from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract raw text from the PDF using pdf-parse library
    const data = await pdfParse(buffer);
    const text = data.text;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        text: text.substring(0, 1000)
      }, { status: 500 });
    }

    // Send the extracted text to OpenAI with the EXACT prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a resume parser. Extract all information from this resume 
text and return ONLY a valid JSON object with NO markdown, 
NO backticks, NO explanation. Use this exact structure:

{
  "name": "string",
  "phone": "string",
  "email": "string",
  "linkedin": "string",
  "github": "string",
  "portfolio": "string",
  "education": [{
    "institution": "string",
    "location": "string",
    "degree": "string",
    "dates": "string",
    "coursework": "string"
  }],
  "experience": [{
    "company": "string",
    "dates": "string",
    "position": "string",
    "location": "string",
    "bullets": ["string"]
  }],
  "projects": [{
    "name": "string",
    "techStack": "string",
    "dates": "string",
    "bullets": ["string"],
    "liveUrl": "string",
    "codeUrl": "string"
  }],
  "skills": {
    "languages": "string",
    "aiMl": "string",
    "frameworks": "string",
    "databases": "string",
    "tools": "string"
  },
  "achievements": ["string"]
}`
        },
        {
          role: "user",
          content: `Resume text:\n${text}`
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message?.content || "{}";
    
    if (content.startsWith("\`\`\`json")) {
        content = content.replace(/^\`\`\`json\n|\n\`\`\`$/g, "");
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
