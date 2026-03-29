import { createAdminClient } from "@/lib/supabase-admin";

type BillingPlan = "free" | "pro" | "auto_apply" | "lifetime";

export class BillingWebhookRepository {
  private readonly admin = createAdminClient();

  async insertPaymentEvent(eventId: string, eventType: string, payload: unknown) {
    const result = await this.admin.from("payment_events").insert({
      event_id: eventId,
      event_type: eventType,
      payload,
    });

    if (!result.error) {
      return { duplicate: false as const };
    }

    const duplicate =
      result.error.code === "23505" ||
      result.error.message?.toLowerCase().includes("duplicate") ||
      result.error.message?.toLowerCase().includes("unique");

    return {
      duplicate,
      error: duplicate ? null : result.error.message,
    };
  }

  async logWebhookEvent(args: {
    eventId: string;
    eventType: string;
    payload: unknown;
    signatureValid: boolean;
    status: "received" | "processed" | "failed" | "duplicate" | "ignored";
    retryCount?: number;
    errorMessage?: string | null;
  }) {
    await this.admin.from("webhook_logs").upsert(
      {
        event_id: args.eventId,
        event_type: args.eventType,
        source: "razorpay",
        payload: args.payload,
        signature_valid: args.signatureValid,
        status: args.status,
        retry_count: args.retryCount ?? 0,
        error_message: args.errorMessage ?? null,
        processed_at: args.status === "processed" ? new Date().toISOString() : null,
      },
      { onConflict: "event_id,source" }
    );
  }

  async getPaymentByOrderId(orderId: string) {
    const result = await this.admin
      .from("payments")
      .select("id, user_id, plan")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    return result.data;
  }

  async updatePaymentCaptured(orderId: string, paymentId: string | null) {
    await this.admin
      .from("payments")
      .update({
        razorpay_payment_id: paymentId,
        status: "captured",
      })
      .eq("razorpay_order_id", orderId);
  }

  async updatePaymentFailed(orderId: string) {
    await this.admin.from("payments").update({ status: "failed" }).eq("razorpay_order_id", orderId);
  }

  async upsertSubscription(userId: string, plan: BillingPlan) {
    const now = new Date();
    const startDate = now.toISOString();
    const endDate =
      plan === "lifetime" ? null : new Date(now.setMonth(now.getMonth() + 1)).toISOString();

    await this.admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      },
      { onConflict: "user_id" }
    );
  }

  async getOpenReferral(userId: string) {
    const result = await this.admin
      .from("referrals")
      .select("id")
      .eq("user_id", userId)
      .is("converted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return result.data;
  }

  async markReferralConverted(referralId: string, paymentId: string | null) {
    await this.admin
      .from("referrals")
      .update({
        converted_at: new Date().toISOString(),
        first_payment_id: paymentId,
      })
      .eq("id", referralId);
  }

  async insertPaymentTransaction(args: {
    paymentRowId?: string | null;
    orderId?: string | null;
    paymentId?: string | null;
    eventId: string;
    eventType: string;
    amount?: number | null;
    status: string;
    payload: unknown;
  }) {
    await this.admin.from("payment_transactions").insert({
      payment_id: args.paymentRowId ?? null,
      razorpay_order_id: args.orderId ?? null,
      razorpay_payment_id: args.paymentId ?? null,
      event_id: args.eventId,
      event_type: args.eventType,
      amount: args.amount ?? null,
      currency: "INR",
      status: args.status,
      payload: args.payload,
    });
  }

  async insertRefund(args: {
    userId?: string | null;
    paymentRowId?: string | null;
    razorpayRefundId: string;
    amount: number;
    status: string;
    payload: unknown;
  }) {
    await this.admin.from("refunds").upsert(
      {
        user_id: args.userId ?? null,
        payment_id: args.paymentRowId ?? null,
        razorpay_refund_id: args.razorpayRefundId,
        amount: args.amount,
        status: args.status,
        payload: args.payload,
      },
      { onConflict: "razorpay_refund_id" }
    );
  }
}
