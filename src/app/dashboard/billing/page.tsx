"use client";

import { useEffect, useMemo, useState } from "react";
import PricingSection4, { PricingPlanId } from "@/components/ui/pricing-section-4";

type Plan = PricingPlanId;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type BillingSnapshot = {
  subscription: {
    plan?: string | null;
    plan_name?: string | null;
    plan_id?: string | null;
    subscription_id?: string | null;
    status?: "active" | "trial" | "expired" | "cancelled" | string;
    start_date?: string | null;
    end_date?: string | null;
    trial_end?: string | null;
  } | null;
  latest_payment: {
    amount?: number;
    plan?: string;
    status?: string;
    created_at?: string;
  } | null;
};

function prettyDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default function BillingPricingPage() {
  const [data, setData] = useState<BillingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const res = await fetch("/api/billing/status", { cache: "no-store" });
    const payload = (await res.json()) as BillingSnapshot & { error?: string };
    if (!res.ok) {
      setMessage(payload.error || "Unable to fetch billing details");
      setLoading(false);
      return;
    }
    setData(payload);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

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

  const nextBillingDate = useMemo(() => {
    if (!data?.subscription) return "-";
    if (data.subscription.status === "trial") return prettyDate(data.subscription.trial_end);
    return prettyDate(data.subscription.end_date);
  }, [data]);

  const currentPlan = data?.subscription?.plan_name || data?.subscription?.plan || "Free Trial";

  const cancelSubscription = async () => {
    setCancelling(true);
    setMessage(null);
    const res = await fetch("/api/billing/razorpay/cancel", { method: "POST" });
    const payload = (await res.json()) as { error?: string; ok?: boolean };
    if (!res.ok) {
      setMessage(payload.error || "Cancellation failed");
      setCancelling(false);
      return;
    }
    setMessage("Subscription cancelled successfully.");
    await refresh();
    setCancelling(false);
  };

  const startCheckout = async (plan: Plan) => {
    setLoadingPlan(plan);
    setPricingMessage(null);

    try {
      const res = await fetch("/api/billing/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const checkoutData = await res.json();
      if (!res.ok) throw new Error(checkoutData.error || "Failed to start checkout");

      if (!window.Razorpay) {
        setPricingMessage(`Subscription created (${checkoutData.subscription_id}). Razorpay script not loaded in this page yet.`);
        return;
      }

      const rzp = new window.Razorpay({
        key: checkoutData.key_id,
        subscription_id: checkoutData.subscription_id,
        name: "TalentSync",
        description: `Subscription: ${plan}`,
        prefill: {
          email: checkoutData.email,
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
            setPricingMessage(verifyData.error || "Payment verification failed.");
            return;
          }

          setPricingMessage("Subscription confirmed.");
          refresh();
        },
        theme: {
          color: "#235347",
        },
      });

      rzp.open();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Checkout failed";
      setPricingMessage(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Billing Overview Section */}
      <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-md">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage your current plan and view upcoming charges.
        </p>

        {loading ? (
          <p className="mt-8 text-[var(--text-muted)]">Loading billing details...</p>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Current Plan</p>
                <p className="mt-2 text-xl font-semibold text-[var(--text)]">{currentPlan}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Status</p>
                <p className="mt-2 text-xl font-semibold text-[var(--text)] capitalize">
                  {data?.subscription?.status || "trial"}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Next Billing Date</p>
                <p className="mt-2 text-xl font-semibold text-[var(--text)]">{nextBillingDate}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--text-muted)]">Subscription ID</p>
                <p className="mt-2 truncate text-sm text-[var(--text)]" title={data?.subscription?.subscription_id || "-"}>
                  {data?.subscription?.subscription_id || "-"}
                </p>
              </div>
            </div>

            {data?.subscription?.subscription_id && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cancelSubscription}
                  disabled={cancelling}
                  className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Cancel Subscription"
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              </div>
            )}
            
            {message ? (
              <p className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)]">
                {message}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Pricing Plans Section */}
      <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.05)] backdrop-blur-md overflow-hidden">
        <PricingSection4 onChoosePlan={startCheckout} loadingPlan={loadingPlan} />
        
        {pricingMessage ? (
          <div className="m-6 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.05)] p-4 text-sm text-[var(--text)]">
            {pricingMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}