import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  addDays,
  isSubscriptionPlanCode,
  SUBSCRIPTION_PLANS,
  SubscriptionPlanCode,
} from "@/lib/billing";

function verifySignature(paymentId: string, subscriptionId: string, signature: string, secret: string): boolean {
  const payload = `${paymentId}|${subscriptionId}`;
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return digest === signature;
}

function normalizePlan(planCode: SubscriptionPlanCode): "pro" {
  if (SUBSCRIPTION_PLANS[planCode]) return "pro";
  return "pro";
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
    const paymentId = body?.razorpay_payment_id as string;
    const subscriptionId = body?.razorpay_subscription_id as string;
    const signature = body?.razorpay_signature as string;
    const plan = body?.plan as string;

    if (!paymentId || !subscriptionId || !signature || !plan || !isSubscriptionPlanCode(plan)) {
      return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });
    }

    const valid = verifySignature(paymentId, subscriptionId, signature, keySecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 400 });
    }

    const admin = createAdminClient();

    const planCode = plan as SubscriptionPlanCode;
    const trialEnd = addDays(new Date(), 60).toISOString();
    const planInfo = SUBSCRIPTION_PLANS[planCode];
    const razorpayPlanId = process.env[planInfo.envPlanIdKey] ?? null;

    const subscriptionPayload = {
      user_id: user.id,
      plan: normalizePlan(planCode),
      plan_name: planInfo.label,
      plan_id: razorpayPlanId,
      subscription_id: subscriptionId,
      start_date: new Date().toISOString(),
      trial_end: trialEnd,
      status: "trial",
    };

    const upsertResult = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (upsertResult.error) {
      console.error("Subscription upsert warning:", upsertResult.error);
      return NextResponse.json({ error: "Failed to store subscription" }, { status: 500 });
    }

    const referralResult = await admin
      .from("referrals")
      .select("id")
      .eq("user_id", user.id)
      .is("converted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (referralResult.data?.id) {
      await admin
        .from("referrals")
        .update({
          converted_at: new Date().toISOString(),
          first_payment_id: paymentId,
        })
        .eq("id", referralResult.data.id);
    }

    return NextResponse.json({
      verified: true,
      subscription: {
        plan: planInfo.label,
        status: "trial",
        trial_end: trialEnd,
        subscription_id: subscriptionId,
      },
    });
  } catch (error: unknown) {
    console.error("Razorpay verification error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




