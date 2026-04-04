import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  addDays,
  isSubscriptionPlanCode,
  SUBSCRIPTION_PLANS,
  SubscriptionPlanCode,
} from "@/lib/billing";

type RazorpaySubscriptionResponse = {
  id: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  charge_at: number | null;
  start_at: number | null;
  end_at: number | null;
};

function getRazorpayPlanId(planCode: SubscriptionPlanCode): string | null {
  const envKey = SUBSCRIPTION_PLANS[planCode].envPlanIdKey;
  return process.env[envKey] || null;
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
    const requestedPlan = body?.plan as string;

    if (!requestedPlan || !isSubscriptionPlanCode(requestedPlan)) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    const razorpayPlanId = getRazorpayPlanId(requestedPlan);
    if (!razorpayPlanId) {
      return NextResponse.json(
        {
          error: `Missing Razorpay plan id env: ${SUBSCRIPTION_PLANS[requestedPlan].envPlanIdKey}`,
        },
        { status: 500 }
      );
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const trialStart = addDays(new Date(), 60);

    const payload = {
      plan_id: razorpayPlanId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120,
      start_at: Math.floor(trialStart.getTime() / 1000),
      notes: {
        user_id: user.id,
        plan_code: requestedPlan,
      },
    };

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const subscription = (await razorpayResponse.json()) as
      | (RazorpaySubscriptionResponse & { error?: { description?: string } })
      | { error?: { description?: string } };

    if (!razorpayResponse.ok || !("id" in subscription)) {
      const message = (subscription as { error?: { description?: string } }).error?.description;
      return NextResponse.json(
        { error: message || "Failed to create Razorpay subscription" },
        { status: razorpayResponse.status || 500 }
      );
    }

    return NextResponse.json({
      key_id: keyId,
      subscription_id: subscription.id,
      plan: requestedPlan,
      plan_label: SUBSCRIPTION_PLANS[requestedPlan].label,
      trial_days: 60,
      email: user.email,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
