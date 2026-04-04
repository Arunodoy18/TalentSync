import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { BillingWebhookService } from "@/lib/billing/webhook-service";
import { RazorpayWebhookEvent } from "@/lib/billing/webhook-types";
import { createAdminClient } from "@/lib/supabase-admin";

function parseEpochSeconds(value: unknown): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return new Date(value * 1000).toISOString();
}

async function handleSubscriptionEvent(event: RazorpayWebhookEvent) {
  const entity = event.payload?.subscription?.entity;
  const subscriptionId = entity?.id;

  if (!subscriptionId) {
    return { received: true, skipped: true, reason: "Missing subscription id" };
  }

  const admin = createAdminClient();
  const patch: Record<string, string | null> = {
    plan_id: entity?.plan_id ?? null,
    start_date: parseEpochSeconds(entity?.current_start) ?? null,
    end_date: parseEpochSeconds(entity?.current_end) ?? null,
  };

  if (event.event === "subscription.activated") {
    patch.status = "active";
  }

  if (event.event === "subscription.cancelled") {
    patch.status = "cancelled";
    patch.end_date = new Date().toISOString();
  }

  if (event.event === "subscription.completed") {
    patch.status = "expired";
    patch.end_date = parseEpochSeconds(entity?.ended_at) ?? new Date().toISOString();
  }

  if (event.event === "payment.failed") {
    patch.status = "expired";
  }

  await admin
    .from("subscriptions")
    .update(patch)
    .eq("subscription_id", subscriptionId);

  return { received: true };
}

function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;

    if (!event.id || !event.event) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    if (
      event.event === "subscription.activated" ||
      event.event === "subscription.cancelled" ||
      event.event === "subscription.completed" ||
      event.event === "payment.failed"
    ) {
      const result = await handleSubscriptionEvent(event);
      return NextResponse.json(result);
    }

    const service = new BillingWebhookService();
    const result = await service.processRazorpayEvent(event);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Razorpay webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
