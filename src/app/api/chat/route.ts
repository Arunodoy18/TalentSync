import { convertToModelMessages, streamText } from "ai";
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

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "You are Zap, a friendly and practical career assistant who talks like a trusted human friend. Be warm, clear, and helpful. Provide complete, actionable guidance on career roadmaps, jobs, projects, skills, resume improvements, ATS optimization, interview preparation, and application strategy. Use step-by-step plans, concise checklists, and examples when useful. If information is missing, ask short clarifying questions before giving the final recommendation.",
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}




//






