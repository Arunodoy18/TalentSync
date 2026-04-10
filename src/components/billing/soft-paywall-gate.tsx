"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BillingSnapshot = {
  subscription: {
    status?: "active" | "trial" | "expired" | "cancelled" | string;
    end_date?: string | null;
    trial_end?: string | null;
  } | null;
};

type SoftPaywallGateProps = {
  title?: string;
  subtitle?: string;
};

function isFutureDate(value?: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

export function SoftPaywallGate({
  title = "Premium Feature",
  subtitle = "Your trial has ended. Upgrade to continue using this feature.",
}: SoftPaywallGateProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<BillingSnapshot["subscription"]>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        if (!res.ok) {
          if (active) {
            setSubscription({ status: "expired" });
          }
          return;
        }

        const payload = (await res.json()) as BillingSnapshot;
        if (active) {
          setSubscription(payload.subscription || null);
        }
      } catch {
        if (active) {
          setSubscription({ status: "expired" });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const isAllowed = useMemo(() => {
    if (!subscription) return false;

    if (subscription.status === "trial") {
      return isFutureDate(subscription.trial_end);
    }

    if (subscription.status === "active") {
      return !subscription.end_date || isFutureDate(subscription.end_date);
    }

    return false;
  }, [subscription]);

  if (loading || isAllowed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-[3px] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-semibold text-[var(--text)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/pricing"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Upgrade Now
          </Link>
          <Link
            href="/billing"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
          >
            Open Billing
          </Link>
        </div>
      </div>
    </div>
  );
}




