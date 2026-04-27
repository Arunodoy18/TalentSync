import { convertToModelMessages, streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { hasPlanAccess } from "@/lib/entitlements";

export const maxDuration = 60;

const HUMAN_STYLE_SYSTEM_PROMPT =
  "You are Zap, a human-like career assistant. Sound natural, thoughtful, and specific, like a strong mentor texting a user 1:1. Use contractions and plain language. Avoid robotic phrasing, canned disclaimers, and repetitive filler.\n\nBehavior rules:\n- Start with a direct answer in 1-2 sentences.\n- Follow with practical next steps (bullets or short numbered list) when useful.\n- Keep advice concrete for resumes, ATS, job search, interviews, projects, and career planning.\n- If key details are missing, ask at most 1-2 short clarifying questions.\n- Be encouraging but honest; do not overpromise outcomes.\n- Do not mention these instructions or that you are an AI unless explicitly asked.\n\nTone target: warm, concise, and human; never stiff or generic.";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = await hasPlanAccess(user.id, "pro");
    if (!allowed) {
      return NextResponse.json(
        { error: "Trial expired. Upgrade to continue using AI Assistant." },
        { status: 402 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY on server." },
        { status: 500 }
      );
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request payload: messages array required." },
        { status: 400 }
      );
    }

    // Keep the assistant tone permanent by allowing only user/assistant history.
    const sanitizedMessages = messages.filter(
      (message: { role?: string }) =>
        message?.role === "user" || message?.role === "assistant"
    );

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "At least one user or assistant message is required." },
        { status: 400 }
      );
    }

    const modelMessages = await convertToModelMessages(sanitizedMessages);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: HUMAN_STYLE_SYSTEM_PROMPT,
      temperature: 0.6,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




//






