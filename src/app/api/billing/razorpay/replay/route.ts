import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  let eventIdForErrorLog: string | undefined;
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const eventId = body?.event_id as string | undefined;
    eventIdForErrorLog = eventId;

    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const eventResult = await admin
      .from("payment_events")
      .select("id, event_id, event_type, payload")
      .eq("event_id", eventId)
      .single();

    if (eventResult.error || !eventResult.data) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = eventResult.data.payload as {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string } };
        order?: { entity?: { id?: string } };
      };
    };

    const orderId =
      event?.payload?.payment?.entity?.order_id ||
      event?.payload?.order?.entity?.id ||
      null;

    if (!orderId) {
      await admin
        .from("payment_events")
        .update({ replayed_at: new Date().toISOString(), replay_status: "skipped" })
        .eq("event_id", eventId);

      return NextResponse.json({ replayed: true, skipped: true });
    }

    if (event?.event === "payment.failed") {
      await admin.from("payments").update({ status: "failed" }).eq("razorpay_order_id", orderId);
    }

    if (event?.event === "payment.captured" || event?.event === "order.paid") {
      const payment = await admin
        .from("payments")
        .select("user_id, plan")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (payment.data) {
        const paymentId = event?.payload?.payment?.entity?.id || null;
        await admin
          .from("payments")
          .update({ status: "captured", razorpay_payment_id: paymentId })
          .eq("razorpay_order_id", orderId);

        const now = new Date();
        const startDate = now.toISOString();
        const endDate = payment.data.plan === "lifetime" ? null : new Date(now.setMonth(now.getMonth() + 1)).toISOString();

        await admin.from("subscriptions").upsert(
          {
            user_id: payment.data.user_id,
            plan: payment.data.plan,
            start_date: startDate,
            end_date: endDate,
            status: "active",
          },
          { onConflict: "user_id" }
        );
      }
    }

    await admin
      .from("payment_events")
      .update({ replayed_at: new Date().toISOString(), replay_status: "ok", replay_error: null })
      .eq("event_id", eventId);

    return NextResponse.json({ replayed: true });
  } catch (error: unknown) {
    console.error("Webhook replay error:", error);
    const message = error instanceof Error ? error.message : "Replay failed";

    try {
      if (eventIdForErrorLog) {
        const admin = createAdminClient();
        await admin
          .from("payment_events")
          .update({
            replayed_at: new Date().toISOString(),
            replay_status: "failed",
            replay_error: message,
          })
          .eq("event_id", eventIdForErrorLog);
      }
    } catch {
      // Ignore secondary failure when logging replay state.
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
