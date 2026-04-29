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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, query } = await req.json();

    if (!type || !query) {
      return NextResponse.json({ error: "Type and query are required" }, { status: 400 });
    }

    const promptText = type === "role" 
      ? `Generate a highly structured, professional career roadmap for the role of "${query}". Break it down into sequential, easy-to-follow chronological steps that the user must take, starting from the absolute basics up to an advanced level. For each step, provide a clear title, a brief actionable description, an estimated timeline, and a list of essential skills to learn.`
      : `Generate a very detailed, structured learning roadmap to master the skill/technology "${query}". Break the learning process into logical, sequential progressive steps, from fundamental concepts to advanced mastery. For each step, provide a concise title, an actionable straightforward description, an estimated timeline, and sub-topics/skills required for that phase.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert career and technology strategist. You output beautiful structured JSON data for learning roadmaps.
          Format the output strictly as a JSON object containing a "roadmap" array.
          Each object in the array MUST have:
          - id (string, unique like 'step-1')
          - title (string, e.g., "Learn Basics of JS")
          - description (string, 1-2 short sentences)
          - skills (array of strings, e.g. ["Variables", "Functions", "ES6"])
          - timeline (string, e.g. "Week 1-2")`
        },
        {
          role: "user",
          content: promptText
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedContent = response.choices[0].message.content || "{}";
    const roadmapData = JSON.parse(parsedContent);
    const roadmap = roadmapData.roadmap || [];

    return NextResponse.json({ roadmap });
  } catch (error: unknown) {
    console.error("Roadmap generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate roadmap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




