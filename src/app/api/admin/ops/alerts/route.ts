import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { dispatchOpsAlerts } from "@/lib/ops-alert-dispatch";

type Alert = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
};

export async function GET(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = Date.now();
    const dayAgoIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const weekAgoIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [eventRes, paymentRes, referralRes] = await Promise.all([
      admin
        .from("payment_events")
        .select("event_id, replay_status, event_type, created_at")
        .gte("created_at", dayAgoIso),
      admin
        .from("payments")
        .select("id, status, created_at")
        .gte("created_at", dayAgoIso),
      admin
        .from("referrals")
        .select("id, converted_at, created_at")
        .gte("created_at", weekAgoIso),
    ]);

    const alerts: Alert[] = [];

    const events = eventRes.data || [];
    const replayFailures = events.filter((e) => e.replay_status === "failed").length;
    const totalEvents = events.length;

    if (replayFailures > 0) {
      alerts.push({
        id: "replay-failures",
        severity: replayFailures >= 5 ? "critical" : "warning",
        title: "Webhook replay failures detected",
        detail: `${replayFailures} replay failures in the last 24h out of ${totalEvents} payment events.`,
      });
    }

    const payments = paymentRes.data || [];
    const failedPayments = payments.filter((p) => p.status === "failed").length;
    if (failedPayments >= 3) {
      alerts.push({
        id: "failed-payments",
        severity: failedPayments >= 10 ? "critical" : "warning",
        title: "Spike in failed payments",
        detail: `${failedPayments} failed payments were recorded in the last 24h.`,
      });
    }

    const referrals = referralRes.data || [];
    const touches = referrals.length;
    const converted = referrals.filter((r) => !!r.converted_at).length;
    const conversionRate = touches > 0 ? (converted / touches) * 100 : 0;

    if (touches >= 20 && conversionRate < 5) {
      alerts.push({
        id: "low-referral-conversion",
        severity: "warning",
        title: "Low referral conversion trend",
        detail: `Referral conversion is ${conversionRate.toFixed(2)}% over the last 7 days (${converted}/${touches}).`,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: "healthy",
        severity: "info",
        title: "Operations healthy",
        detail: "No warning thresholds crossed in current monitoring window.",
      });
    }

    try {
      await dispatchOpsAlerts(alerts);
    } catch (dispatchError) {
      console.error("Ops alert dispatch failure:", dispatchError);
    }

    return NextResponse.json({ alerts });
  } catch (error: unknown) {
    console.error("Ops alerts error:", error);
    const message = error instanceof Error ? error.message : "Failed to evaluate alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




