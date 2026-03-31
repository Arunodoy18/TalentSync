"use client";

import { useEffect, useState } from "react";
import PricingSection4, { PricingPlanId } from "@/components/ui/pricing-section-4";

type Plan = PricingPlanId;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    document.body.appendChild(script);

    return () => {
      // Keep script for page lifetime; no cleanup required.
    };
  }, []);

  const startCheckout = async (plan: Plan) => {
    setLoadingPlan(plan);
    setMessage(null);

    try {
      const res = await fetch("/api/billing/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");

      if (!window.Razorpay) {
        setMessage(`Order created (${data.order_id}). Razorpay script not loaded in this page yet.`);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "TalentSync",
        description: `Subscription: ${plan}`,
        order_id: data.order_id,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setMessage(verifyData.error || "Payment verification failed.");
            return;
          }

          setMessage("Payment verified. Subscription activated successfully.");
        },
        theme: {
          color: "#003893",
        },
      });

      rzp.open();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Checkout failed";
      setMessage(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <PricingSection4 onChoosePlan={startCheckout} loadingPlan={loadingPlan} />

      {message ? (
        <div className="fixed bottom-5 left-1/2 z-50 w-[min(700px,92vw)] -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900/95 p-4 text-sm text-neutral-100 shadow-lg backdrop-blur">
          {message}
        </div>
      ) : null}
    </main>
  );
}
