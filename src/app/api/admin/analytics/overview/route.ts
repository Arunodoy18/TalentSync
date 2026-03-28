import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const [
      usersCountRes,
      profileCountRes,
      paymentsRes,
      subscriptionsRes,
      referralsRes,
      paymentEventsRes,
    ] = await Promise.all([
      admin.from("users").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("payments").select("amount, status, created_at"),
      admin.from("subscriptions").select("plan, status"),
      admin.from("referrals").select("id, source, campaign, converted_at"),
      admin.from("payment_events").select("event_type, replay_status, created_at"),
    ]);

    const userCount = usersCountRes.count ?? profileCountRes.count ?? 0;

    const payments = paymentsRes.data || [];
    const capturedPayments = payments.filter((p) => p.status === "captured");
    const capturedRevenuePaise = capturedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const subscriptions = subscriptionsRes.data || [];
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

    const planDistribution = activeSubscriptions.reduce<Record<string, number>>((acc, row) => {
      const key = row.plan || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const referrals = referralsRes.data || [];
    const totalReferrals = referrals.length;
    const convertedReferrals = referrals.filter((r) => !!r.converted_at).length;
    const referralConversionRate =
      totalReferrals > 0 ? Number(((convertedReferrals / totalReferrals) * 100).toFixed(2)) : 0;

    const sourceCohorts = referrals.reduce<Record<string, { touches: number; converted: number }>>((acc, row) => {
      const key = row.source || "unknown";
      if (!acc[key]) acc[key] = { touches: 0, converted: 0 };
      acc[key].touches += 1;
      if (row.converted_at) acc[key].converted += 1;
      return acc;
    }, {});

    const campaignCohorts = referrals.reduce<Record<string, { touches: number; converted: number }>>((acc, row) => {
      const key = row.campaign || "none";
      if (!acc[key]) acc[key] = { touches: 0, converted: 0 };
      acc[key].touches += 1;
      if (row.converted_at) acc[key].converted += 1;
      return acc;
    }, {});

    const paymentEvents = paymentEventsRes.data || [];
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const eventsLast24h = paymentEvents.filter((e) => new Date(e.created_at).getTime() >= dayAgo);
    const replayFailuresLast24h = eventsLast24h.filter((e) => e.replay_status === "failed").length;

    return NextResponse.json({
      kpis: {
        users: userCount,
        capturedPayments: capturedPayments.length,
        capturedRevenuePaise,
        capturedRevenueInr: Number((capturedRevenuePaise / 100).toFixed(2)),
        activeSubscriptions: activeSubscriptions.length,
        totalReferrals,
        convertedReferrals,
        referralConversionRate,
      },
      subscriptions: {
        activePlanDistribution: planDistribution,
      },
      cohorts: {
        bySource: Object.entries(sourceCohorts).map(([source, v]) => ({
          source,
          touches: v.touches,
          converted: v.converted,
          conversionRate: v.touches > 0 ? Number(((v.converted / v.touches) * 100).toFixed(2)) : 0,
        })),
        byCampaign: Object.entries(campaignCohorts).map(([campaign, v]) => ({
          campaign,
          touches: v.touches,
          converted: v.converted,
          conversionRate: v.touches > 0 ? Number(((v.converted / v.touches) * 100).toFixed(2)) : 0,
        })),
      },
      ops: {
        paymentEventsLast24h: eventsLast24h.length,
        replayFailuresLast24h,
      },
    });
  } catch (error: unknown) {
    console.error("Admin overview analytics error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch admin analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
