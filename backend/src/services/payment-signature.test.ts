import { describe, expect, it } from "vitest";
import { computePaymentSignature, verifyPaymentSignature } from "./payment-signature.js";

describe("payment-signature", () => {
  it("verifies a valid signature", () => {
    const signature = computePaymentSignature("order_1", "pay_1", "secret");
    expect(
      verifyPaymentSignature({
        orderId: "order_1",
        paymentId: "pay_1",
        signature,
        secret: "secret",
      })
    ).toBe(true);
  });

  it("rejects invalid signature", () => {
    expect(
      verifyPaymentSignature({
        orderId: "order_1",
        paymentId: "pay_1",
        signature: "wrong",
        secret: "secret",
      })
    ).toBe(false);
  });
});
