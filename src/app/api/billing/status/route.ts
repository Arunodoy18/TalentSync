import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = req.nextUrl.searchParams.get("order_id");

    const [subscriptionResult, paymentResult] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan, status, start_date, end_date")
        .eq("user_id", user.id)
        .maybeSingle(),
      orderId
        ? supabase
            .from("payments")
            .select("razorpay_order_id, razorpay_payment_id, status, amount, plan, created_at")
            .eq("user_id", user.id)
            .eq("razorpay_order_id", orderId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    return NextResponse.json({
      subscription: subscriptionResult.data,
      payment: paymentResult.data,
      order_id: orderId,
    });
  } catch (error: unknown) {
    console.error("Billing status error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch billing status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
