import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("subscription_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    if (!subscription?.subscription_id) {
      return NextResponse.json({ error: "No active Razorpay subscription found" }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured" }, { status: 500 });
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const cancelResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscription.subscription_id}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancel_at_cycle_end: false }),
      }
    );

    if (!cancelResponse.ok) {
      const payload = (await cancelResponse.json()) as { error?: { description?: string } };
      return NextResponse.json(
        { error: payload.error?.description || "Failed to cancel subscription" },
        { status: cancelResponse.status }
      );
    }

    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({
        status: "cancelled",
        end_date: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ ok: true, status: "cancelled" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
