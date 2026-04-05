import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(isoDay(d));
  }

  return days;
}

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

    const last14Days = getLastNDays(14);
    const touchesByDay = new Map<string, number>();
    const convertedByDay = new Map<string, number>();

    for (const row of referrals) {
      const createdDay = isoDay(new Date(row.created_at));
      if (last14Days.includes(createdDay)) {
        touchesByDay.set(createdDay, (touchesByDay.get(createdDay) || 0) + 1);
      }

      if (row.converted_at) {
        const convertedDay = isoDay(new Date(row.converted_at));
        if (last14Days.includes(convertedDay)) {
          convertedByDay.set(convertedDay, (convertedByDay.get(convertedDay) || 0) + 1);
        }
      }
    }

    const trendDaily = last14Days.map((day) => {
      const dayTouches = touchesByDay.get(day) || 0;
      const dayConverted = convertedByDay.get(day) || 0;
      return {
        day,
        touches: dayTouches,
        converted: dayConverted,
        conversionRate: dayTouches > 0 ? Number(((dayConverted / dayTouches) * 100).toFixed(2)) : 0,
      };
    });

    const trendRolling7 = trendDaily.map((_, index) => {
      const windowStart = Math.max(0, index - 6);
      const windowRows = trendDaily.slice(windowStart, index + 1);
      const touchesWindow = windowRows.reduce((sum, row) => sum + row.touches, 0);
      const convertedWindow = windowRows.reduce((sum, row) => sum + row.converted, 0);
      return {
        day: trendDaily[index].day,
        touches: touchesWindow,
        converted: convertedWindow,
        conversionRate:
          touchesWindow > 0 ? Number(((convertedWindow / touchesWindow) * 100).toFixed(2)) : 0,
      };
    });

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
      trends: {
        daily: trendDaily,
        rolling7: trendRolling7,
      },
    });
  } catch (error: unknown) {
    console.error("Referral analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch referral analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




