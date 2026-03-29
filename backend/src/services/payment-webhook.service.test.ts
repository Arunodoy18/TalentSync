import { describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { PaymentWebhookService } from "./payment-webhook.service.js";

function makeDb(insertRowCount: number) {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes("insert into payment_events")) {
      return { rowCount: insertRowCount, rows: [] };
    }
    return { rowCount: 1, rows: [] };
  });
  return { query };
}

describe("PaymentWebhookService", () => {
  it("rejects webhook when signature is missing", async () => {
    const db = makeDb(1);
    const service = new PaymentWebhookService(db as never);

    const body = JSON.stringify({ id: "evt_1", event: "payment.captured", payload: {} });
    const secret = "webhook-secret";
    const result = await service.process(body, null, secret);

    expect(result.statusCode).toBe(400);
  });

  it("marks duplicate when event insert is ignored", async () => {
    const db = makeDb(0);
    const service = new PaymentWebhookService(db as never);

    const body = JSON.stringify({ id: "evt_2", event: "payment.captured", payload: {} });
    const secret = "webhook-secret";
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const result = await service.process(body, signature, secret);

    expect(result.statusCode).toBe(200);
    expect((result.payload as { data: { duplicate: boolean } }).data.duplicate).toBe(true);
  });
});
