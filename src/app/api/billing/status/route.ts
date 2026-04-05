import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [subscriptionResult, paymentResult] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan, plan_name, plan_id, subscription_id, status, start_date, end_date, trial_end")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("payments")
        .select("razorpay_order_id, razorpay_payment_id, status, amount, plan, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    let subscription = subscriptionResult.data;

    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 60);

      const admin = createAdminClient();
      const trialPayload = {
        user_id: user.id,
        plan: "pro",
        plan_name: "Free Trial",
        status: "trial",
        start_date: now.toISOString(),
        trial_end: trialEnd.toISOString(),
      };

      const upsert = await admin
        .from("subscriptions")
        .upsert(trialPayload, { onConflict: "user_id" })
        .select("plan, plan_name, plan_id, subscription_id, status, start_date, end_date, trial_end")
        .single();

      if (!upsert.error) {
        subscription = upsert.data;
      }
    }

    return NextResponse.json({
      subscription,
      latest_payment: paymentResult.data,
    });
  } catch (error: unknown) {
    console.error("Billing status error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch billing status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




