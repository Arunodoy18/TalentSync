import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isBillingPlan, isPaidPlan } from "@/lib/billing";

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const payload = `${orderId}|${paymentId}`;
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return digest === signature;
}

function subscriptionEndDateForPlan(plan: string): string | null {
  const now = new Date();
  if (plan === "lifetime") return null;
  now.setMonth(now.getMonth() + 1);
  return now.toISOString();
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
    const orderId = body?.razorpay_order_id as string;
    const paymentId = body?.razorpay_payment_id as string;
    const signature = body?.razorpay_signature as string;
    const plan = body?.plan as string;

    if (!orderId || !paymentId || !signature || !plan || !isBillingPlan(plan) || !isPaidPlan(plan)) {
      return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });
    }

    const valid = verifySignature(orderId, paymentId, signature, keySecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 400 });
    }

    const admin = createAdminClient();

    const paymentUpdate = await admin
      .from("payments")
      .update({
        razorpay_payment_id: paymentId,
        status: "captured",
      })
      .eq("razorpay_order_id", orderId)
      .eq("user_id", user.id)
      .select("amount")
      .single();

    if (paymentUpdate.error) {
      console.error("Payment update warning:", paymentUpdate.error);
    }

    const startDate = new Date().toISOString();
    const endDate = subscriptionEndDateForPlan(plan);

    const subscriptionPayload = {
      user_id: user.id,
      plan,
      start_date: startDate,
      end_date: endDate,
      status: "active",
    };

    const upsertResult = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (upsertResult.error) {
      console.error("Subscription upsert warning:", upsertResult.error);
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
        plan,
        status: "active",
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error: unknown) {
    console.error("Razorpay verification error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
