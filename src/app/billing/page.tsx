"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function BillingPage() {
  const [data, setData] = useState<BillingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  return (
    <main className="min-h-screen bg-atmosphere px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-md">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Billing</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          View current plan, next billing date, and manage your subscription.
        </p>

        {loading ? (
          <p className="mt-8 text-[var(--text-muted)]">Loading billing details...</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Current Plan</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text)]">{currentPlan}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Subscription Status</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text)]">
                {data?.subscription?.status || "trial"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Next Billing Date</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text)]">{nextBillingDate}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Subscription ID</p>
              <p className="mt-2 break-all text-sm text-[var(--text)]">
                {data?.subscription?.subscription_id || "-"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={cancelSubscription}
            disabled={cancelling || !data?.subscription?.subscription_id}
            className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Subscription"}
          </button>
          <Link
            href="/pricing"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
          >
            Upgrade Plan
          </Link>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)]">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}




