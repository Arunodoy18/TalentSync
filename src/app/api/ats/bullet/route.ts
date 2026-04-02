import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Calls our Python AI service to generate a FAANG bullet point
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    const response = await fetch("http://ai-service:8000/ai/resume/bullet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("AI Service Error:", txt);
      return NextResponse.json({ error: "Failed to generate bullet point" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Bullet gen error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate bullet point";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
