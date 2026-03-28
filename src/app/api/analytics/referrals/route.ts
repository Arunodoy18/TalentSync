import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rows, error } = await supabase
      .from("referrals")
      .select("id, created_at, converted_at, first_payment_id, source, campaign")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const referrals = rows || [];
    const touches = referrals.length;
    const converted = referrals.filter((r) => !!r.converted_at).length;
    const conversionRate = touches > 0 ? Number(((converted / touches) * 100).toFixed(2)) : 0;

    const sourceMap = new Map<string, { touches: number; converted: number }>();
    const campaignMap = new Map<string, { touches: number; converted: number }>();

    for (const row of referrals) {
      const sourceKey = row.source || "unknown";
      const campaignKey = row.campaign || "none";
      const isConverted = !!row.converted_at;

      const sourceEntry = sourceMap.get(sourceKey) || { touches: 0, converted: 0 };
      sourceEntry.touches += 1;
      sourceEntry.converted += isConverted ? 1 : 0;
      sourceMap.set(sourceKey, sourceEntry);

      const campaignEntry = campaignMap.get(campaignKey) || { touches: 0, converted: 0 };
      campaignEntry.touches += 1;
      campaignEntry.converted += isConverted ? 1 : 0;
      campaignMap.set(campaignKey, campaignEntry);
    }

    const sourceCohorts = Array.from(sourceMap.entries()).map(([source, metrics]) => ({
      source,
      touches: metrics.touches,
      converted: metrics.converted,
      conversionRate: metrics.touches > 0 ? Number(((metrics.converted / metrics.touches) * 100).toFixed(2)) : 0,
    }));

    const campaignCohorts = Array.from(campaignMap.entries()).map(([campaign, metrics]) => ({
      campaign,
      touches: metrics.touches,
      converted: metrics.converted,
      conversionRate: metrics.touches > 0 ? Number(((metrics.converted / metrics.touches) * 100).toFixed(2)) : 0,
    }));

    const latest = referrals[0] || null;

    return NextResponse.json({
      summary: {
        touches,
        converted,
        conversionRate,
      },
      latest,
      rows: referrals,
      cohorts: {
        bySource: sourceCohorts,
        byCampaign: campaignCohorts,
      },
    });
  } catch (error: unknown) {
    console.error("Referral analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch referral analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
