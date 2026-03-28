import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isBillingPlan, isPaidPlan, PLAN_PRICING_INR, toPaise } from "@/lib/billing";

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const requestedPlan = body?.plan;

    if (!requestedPlan || !isBillingPlan(requestedPlan)) {
      return NextResponse.json({ error: "Invalid billing plan" }, { status: 400 });
    }

    if (!isPaidPlan(requestedPlan)) {
      return NextResponse.json({ error: "Free plan does not require checkout" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    const amount = toPaise(PLAN_PRICING_INR[requestedPlan]);
    const receipt = `ts_${requestedPlan}_${user.id.slice(0, 8)}_${Date.now()}`;
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const orderPayload = {
      amount,
      currency: "INR",
      receipt,
      notes: {
        user_id: user.id,
        plan: requestedPlan,
      },
    };

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store",
    });

    const order = (await razorpayResponse.json()) as RazorpayOrderResponse & { error?: { description?: string } };

    if (!razorpayResponse.ok) {
      return NextResponse.json(
        { error: order.error?.description || "Failed to create Razorpay order" },
        { status: razorpayResponse.status }
      );
    }

    try {
      const admin = createAdminClient();
      await admin.from("payments").insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount,
        plan: requestedPlan,
        status: "created",
        payload: {
          receipt: order.receipt,
          entity: order.entity,
          currency: order.currency,
        },
      });
    } catch (insertError) {
      console.error("Payment draft persistence warning:", insertError);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      plan: requestedPlan,
    });
  } catch (error: unknown) {
    console.error("Razorpay order error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
