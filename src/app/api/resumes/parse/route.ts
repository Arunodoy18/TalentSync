import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import PDFParser from "pdf2json";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF using pdf2json
    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    });

    if (!rawText || rawText.trim() === "") {
      return NextResponse.json({ error: "Failed to extract text from the PDF" }, { status: 400 });
    }

    // Prompt OpenAI to structure the raw text into our specific JSON format
    const systemPrompt = `You are an expert ATS resume parser. Extract the following information from the provided raw resume text and return it EXCLUSIVELY as a JSON object matching this exact structure:
    {
      "basics": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "summary": "string",
        "github": "string",
        "linkedin": "string"
      },
      "experience": [
        {
          "company": "string",
          "role": "string",
          "start": "string (e.g. 'Jan 2020')",
          "end": "string (e.g. 'Present')",
          "bullets": ["string", "string"]
        }
      ],
      "projects": [
        {
          "name": "string",
          "technologies": "string",
          "github": "string",
          "link": "string",
          "bullets": ["string", "string"]
        }
      ],
      "education": [
        {
          "school": "string",
          "degree": "string",
          "year": "string",
          "grade": "string"
        }
      ],
      "skills": "A single comma-separated string of all technical and soft skills"
    }

    If any field is missing from the resume, leave it as an empty string (or empty array). Do not hallucinate information. Ensure the output is valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the raw resume text:\n\n${rawText}` }
      ],
      temperature: 0.1,
    });

    const structuredData = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(structuredData);

  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse resume" }, { status: 500 });
  }
}
