import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

type RazorpayWebhookEvent = {
  id: string;
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
      };
    };
  };
};

function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

function getEventOrderId(event: RazorpayWebhookEvent): string | null {
  const paymentOrderId = event.payload?.payment?.entity?.order_id;
  const orderId = event.payload?.order?.entity?.id;
  return paymentOrderId || orderId || null;
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

    const admin = createAdminClient();

    const idempotencyInsert = await admin.from("payment_events").insert({
      event_id: event.id,
      event_type: event.event,
      payload: event,
    });

    if (idempotencyInsert.error) {
      const duplicate =
        idempotencyInsert.error.code === "23505" ||
        idempotencyInsert.error.message?.toLowerCase().includes("duplicate") ||
        idempotencyInsert.error.message?.toLowerCase().includes("unique");

      if (duplicate) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      return NextResponse.json({ error: idempotencyInsert.error.message }, { status: 500 });
    }

    const orderId = getEventOrderId(event);

    if (!orderId) {
      return NextResponse.json({ received: true, skipped: true });
    }

    if (event.event === "payment.failed") {
      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("razorpay_order_id", orderId);
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentId = event.payload?.payment?.entity?.id || null;

      const existingPayment = await admin
        .from("payments")
        .select("user_id, plan")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (existingPayment.data) {
        await admin
          .from("payments")
          .update({
            razorpay_payment_id: paymentId,
            status: "captured",
          })
          .eq("razorpay_order_id", orderId);

        const now = new Date();
        const startDate = now.toISOString();
        const endDate = existingPayment.data.plan === "lifetime"
          ? null
          : new Date(now.setMonth(now.getMonth() + 1)).toISOString();

        await admin
          .from("subscriptions")
          .upsert(
            {
              user_id: existingPayment.data.user_id,
              plan: existingPayment.data.plan,
              start_date: startDate,
              end_date: endDate,
              status: "active",
            },
            { onConflict: "user_id" }
          );

        const referralResult = await admin
          .from("referrals")
          .select("id")
          .eq("user_id", existingPayment.data.user_id)
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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Razorpay webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
