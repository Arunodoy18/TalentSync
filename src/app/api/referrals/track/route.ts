import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import crypto from "node:crypto";

function getVisitorId(req: NextRequest): string {
  const existing = req.cookies.get("ts_vid")?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const refCode = body?.ref_code as string | undefined;

    if (!refCode || refCode.trim().length < 2) {
      return NextResponse.json({ error: "Invalid ref_code" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const visitorId = getVisitorId(req);

    const insertResult = await admin.from("referrals").insert({
      ref_code: refCode,
      source: body?.source || null,
      campaign: body?.campaign || null,
      medium: body?.medium || null,
      visitor_id: visitorId,
      user_id: user?.id || null,
    });

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
    }

    const response = NextResponse.json({ tracked: true });
    response.cookies.set("ts_vid", visitorId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 120,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: unknown) {
    console.error("Referral tracking error:", error);
    const message = error instanceof Error ? error.message : "Failed to track referral";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




