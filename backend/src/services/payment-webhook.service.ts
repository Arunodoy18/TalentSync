import crypto from "node:crypto";
import type { Pool } from "pg";
import { z } from "zod";
import { enqueueOutboxEvent } from "./outbox.service.js";

const webhookSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export class PaymentWebhookService {
  constructor(private readonly db: Pool) {}

  verifySignature(rawBody: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  async process(rawBody: string, signature: string | null, secret: string) {
    if (!signature) {
      return { statusCode: 400, payload: { ok: false, error: "Missing webhook signature" } };
    }

    const valid = this.verifySignature(rawBody, signature, secret);
    if (!valid) {
      return { statusCode: 400, payload: { ok: false, error: "Invalid webhook signature" } };
    }

    const parsed = webhookSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return { statusCode: 400, payload: { ok: false, error: "Invalid webhook payload" } };
    }

    const event = parsed.data;

    const insert = await this.db.query(
      "insert into payment_events(event_id, event_type, payload) values($1, $2, $3) on conflict(event_id) do nothing",
      [event.id, event.event, event]
    );

    const duplicate = insert.rowCount === 0;

    await this.db.query(
      "insert into webhook_logs(event_id, event_type, source, payload, signature_valid, status) values($1, $2, 'razorpay', $3, true, $4) on conflict(event_id, source) do update set status = excluded.status, payload = excluded.payload",
      [event.id, event.event, event, duplicate ? "duplicate" : "processed"]
    );

    if (!duplicate) {
      await enqueueOutboxEvent({
        db: this.db,
        aggregateType: "payment",
        aggregateId: event.id,
        eventType: `payment.webhook.${event.event}`,
        payload: {
          eventId: event.id,
          eventType: event.event,
        },
      });
    }

    return {
      statusCode: 200,
      payload: { ok: true, data: { received: true, duplicate } },
    };
  }
}
