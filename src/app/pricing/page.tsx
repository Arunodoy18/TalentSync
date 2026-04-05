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
      const res = await fetch("/api/billing/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");

      if (!window.Razorpay) {
        setMessage(`Subscription created (${data.subscription_id}). Razorpay script not loaded in this page yet.`);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: "TalentSync",
        description: `Subscription: ${plan}`,
        prefill: {
          email: data.email,
        },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setMessage(verifyData.error || "Payment verification failed.");
            return;
          }

          setMessage("Subscription confirmed. Your 2-month free trial is active.");
        },
        theme: {
          color: "#235347",
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
    <main className="min-h-screen bg-atmosphere">
      <PricingSection4 onChoosePlan={startCheckout} loadingPlan={loadingPlan} />

      {message ? (
        <div className="fixed bottom-5 left-1/2 z-50 w-[min(700px,92vw)] -translate-x-1/2 rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.07)] p-4 text-sm text-[var(--text)] shadow-[0_18px_40px_rgba(2,8,20,0.45)] backdrop-blur-[14px]">
          {message}
        </div>
      ) : null}
    </main>
  );
}




