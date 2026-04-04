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

    return NextResponse.json({
      subscription: subscriptionResult.data,
      latest_payment: paymentResult.data,
    });
  } catch (error: unknown) {
    console.error("Billing status error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch billing status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
