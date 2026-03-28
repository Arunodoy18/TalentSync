"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

type Plan = "pro" | "auto_apply" | "lifetime";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const plans: Array<{ id: Plan; title: string; price: string; points: string[] }> = [
  {
    id: "pro",
    title: "Pro",
    price: "INR 499/month",
    points: ["Resume tailoring", "Career roadmap", "ATS breakdown", "Priority support"],
  },
  {
    id: "auto_apply",
    title: "Auto Apply",
    price: "INR 999/month",
    points: ["Everything in Pro", "Auto-apply queue", "Higher credits", "Automation analytics"],
  },
  {
    id: "lifetime",
    title: "Lifetime",
    price: "INR 2999 one-time",
    points: ["One-time purchase", "Premium forever", "No monthly renewal", "Best value"],
  },
];

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
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00389310] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#003893]">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing
          </div>
          <h1 className="mt-4 text-5xl font-black text-[#212529]">Choose Your Growth Plan</h1>
          <p className="mt-3 text-[#6b7280]">Scale from resume optimization to full AI career automation.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-[24px] border border-[#d9dfe9] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-[#212529]">{plan.title}</h2>
              <p className="mt-1 text-[#003893] font-semibold">{plan.price}</p>

              <ul className="mt-6 space-y-3">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-[#4b5563]">
                    <Check className="mt-0.5 h-4 w-4 text-green-600" />
                    {point}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#003893] px-4 font-semibold text-white hover:opacity-90 disabled:opacity-70"
              >
                {loadingPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loadingPlan === plan.id ? "Creating Order..." : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>

        {message ? (
          <div className="mt-8 rounded-xl border border-[#d9dfe9] bg-white p-4 text-sm text-[#374151]">
            {message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
