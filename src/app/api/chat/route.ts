import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase-server";
import { hasPlanAccess } from "@/lib/entitlements";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = await hasPlanAccess(user.id, "pro");
    if (!allowed) {
      return Response.json(
        { error: "Trial expired. Upgrade to continue using AI Assistant." },
        { status: 402 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "Missing GROQ_API_KEY on server." },
        { status: 500 }
      );
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid request payload: messages array required." },
        { status: 400 }
      );
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "You are an expert career AI assistant. You help the user generate career roadmaps, suggest skills/projects/jobs, review resumes, improve ATS scores, and prepare for interviews.",
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}




//

