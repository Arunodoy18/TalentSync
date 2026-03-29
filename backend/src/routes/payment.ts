import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { PaymentWebhookService } from "../services/payment-webhook.service.js";
import { verifyPaymentSignature } from "../services/payment-signature.js";

const createOrderSchema = z.object({
  plan: z.enum(["free", "pro", "auto_apply", "lifetime"]),
});

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function registerPaymentRoutes(app: FastifyInstance) {
  app.post("/payment/create-order", { preHandler: [app.authenticate] }, async (request) => {
    const body = createOrderSchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;

    const planAmountMap: Record<(typeof body.plan), number> = {
      free: 0,
      pro: 49900,
      auto_apply: 99900,
      lifetime: 299900,
    };
    const amount = planAmountMap[body.plan];

    if (amount <= 0) {
      return { ok: true, data: { orderId: null, amount: 0, currency: "INR", skipped: true } };
    }

    const orderId = `order_${Date.now()}`;
    await app.db.query(
      "insert into payments(user_id, razorpay_order_id, amount, plan, status) values($1, $2, $3, $4, 'created')",
      [userId, orderId, amount, body.plan]
    );

    return { ok: true, data: { orderId, amount, currency: "INR" } };
  });

  app.post("/payment/verify", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = verifySchema.parse(request.body);
    const userId = (request.user as { sub: string }).sub;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return reply.code(500).send({ ok: false, error: "RAZORPAY_KEY_SECRET not configured" });
    }

    const isValid = verifyPaymentSignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
      secret,
    });
    if (!isValid) {
      return reply.code(400).send({ ok: false, error: "Invalid payment signature" });
    }

    await app.db.query(
      "update payments set razorpay_payment_id = $1, status = 'captured' where razorpay_order_id = $2 and user_id = $3",
      [body.razorpayPaymentId, body.razorpayOrderId, userId]
    );

    return { ok: true, data: { verified: true } };
  });

  app.post("/payment/webhook", { config: { rawBody: true } }, async (request, reply) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return reply.code(500).send({ ok: false, error: "RAZORPAY_WEBHOOK_SECRET not configured" });
    }

    const rawBody = (request as FastifyRequest & { rawBody?: string }).rawBody ?? "";
    const signature = request.headers["x-razorpay-signature"];
    const service = new PaymentWebhookService(app.db);
    const result = await service.process(rawBody, typeof signature === "string" ? signature : null, secret);

    return reply.code(result.statusCode).send(result.payload);
  });
}
