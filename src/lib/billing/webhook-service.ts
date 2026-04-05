import { BillingWebhookRepository } from "@/lib/billing/webhook-repository";
import { getEventAmount, getEventOrderId, RazorpayWebhookEvent } from "@/lib/billing/webhook-types";

export type WebhookProcessResult = {
  received: true;
  duplicate?: true;
  skipped?: true;
};

export class BillingWebhookService {
  constructor(private readonly repository = new BillingWebhookRepository()) {}

  async processRazorpayEvent(event: RazorpayWebhookEvent): Promise<WebhookProcessResult> {
    const idempotencyInsert = await this.repository.insertPaymentEvent(event.id, event.event, event);

    if (idempotencyInsert.duplicate) {
      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "duplicate",
      });
      return { received: true, duplicate: true };
    }

    if (idempotencyInsert.error) {
      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "failed",
        errorMessage: idempotencyInsert.error,
      });
      throw new Error(idempotencyInsert.error);
    }

    const orderId = getEventOrderId(event);
    const amount = getEventAmount(event);

    if (!orderId) {
      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "ignored",
      });
      return { received: true, skipped: true };
    }

    const payment = await this.repository.getPaymentByOrderId(orderId);

    if (event.event === "payment.failed") {
      await this.repository.updatePaymentFailed(orderId);
      await this.repository.insertPaymentTransaction({
        paymentRowId: payment?.id,
        orderId,
        eventId: event.id,
        eventType: event.event,
        amount,
        status: "failed",
        payload: event,
      });
      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "processed",
      });
      return { received: true };
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentId = event.payload?.payment?.entity?.id || null;

      await this.repository.updatePaymentCaptured(orderId, paymentId);
      await this.repository.insertPaymentTransaction({
        paymentRowId: payment?.id,
        orderId,
        paymentId,
        eventId: event.id,
        eventType: event.event,
        amount,
        status: "captured",
        payload: event,
      });

      if (payment?.user_id && payment.plan) {
        await this.repository.upsertSubscription(payment.user_id, payment.plan);

        const openReferral = await this.repository.getOpenReferral(payment.user_id);
        if (openReferral?.id) {
          await this.repository.markReferralConverted(openReferral.id, paymentId);
        }
      }

      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "processed",
      });
      return { received: true };
    }

    if (event.event.startsWith("subscription.")) {
      await this.repository.insertPaymentTransaction({
        paymentRowId: payment?.id,
        orderId,
        eventId: event.id,
        eventType: event.event,
        amount,
        status: "subscription_event",
        payload: event,
      });

      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "processed",
      });
      return { received: true };
    }

    if (event.event.startsWith("refund.")) {
      const refundId = event.payload?.refund?.entity?.id;
      const refundAmount = event.payload?.refund?.entity?.amount ?? 0;
      if (refundId) {
        await this.repository.insertRefund({
          userId: payment?.user_id,
          paymentRowId: payment?.id,
          razorpayRefundId: refundId,
          amount: refundAmount,
          status: "processed",
          payload: event,
        });
      }

      await this.repository.insertPaymentTransaction({
        paymentRowId: payment?.id,
        orderId,
        eventId: event.id,
        eventType: event.event,
        amount,
        status: "refunded",
        payload: event,
      });

      await this.repository.logWebhookEvent({
        eventId: event.id,
        eventType: event.event,
        payload: event,
        signatureValid: true,
        status: "processed",
      });
      return { received: true };
    }

    await this.repository.logWebhookEvent({
      eventId: event.id,
      eventType: event.event,
      payload: event,
      signatureValid: true,
      status: "ignored",
    });
    return { received: true, skipped: true };
  }
}




