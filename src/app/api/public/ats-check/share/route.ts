import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const score = Number(body?.score ?? 0);
    const breakdown = body?.breakdown ?? {};
    const missingSkills = Array.isArray(body?.missingSkills) ? body.missingSkills : [];
    const suggestions = Array.isArray(body?.suggestions) ? body.suggestions : [];

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: "Invalid ATS score" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const insertResult = await admin
      .from("ats_share_results")
      .insert({
        score,
        breakdown,
        missing_skills: missingSkills,
        suggestions,
        created_by_user_id: user?.id || null,
      })
      .select("id")
      .single();

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
    }

    const shareId = insertResult.data.id;
    return NextResponse.json({
      shareId,
      shareUrl: `/ats-checker/share/${shareId}`,
    });
  } catch (error: unknown) {
    console.error("ATS share create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create share link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




