"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, CircleDollarSign } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

type BillingStatus = {
  subscription: {
    plan: string;
    status: string;
    start_date: string;
    end_date: string | null;
  } | null;
};

type ReferralAnalytics = {
  summary: {
    touches: number;
    converted: number;
    conversionRate: number;
  };
  latest: {
    created_at: string;
    converted_at: string | null;
    source: string | null;
    campaign: string | null;
  } | null;
  cohorts?: {
    bySource: Array<{ source: string; touches: number; converted: number; conversionRate: number }>;
    byCampaign: Array<{ campaign: string; touches: number; converted: number; conversionRate: number }>;
  };
  trends?: {
    daily: Array<{ day: string; touches: number; converted: number; conversionRate: number }>;
    rolling7: Array<{ day: string; touches: number; converted: number; conversionRate: number }>;
  };
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [referrals, setReferrals] = useState<ReferralAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [billingRes, referralRes] = await Promise.all([
          fetch("/api/billing/status", { cache: "no-store" }),
          fetch("/api/analytics/referrals", { cache: "no-store" }),
        ]);

        const billingData = await billingRes.json();
        const referralData = await referralRes.json();

        if (!billingRes.ok) throw new Error(billingData.error || "Failed to load billing status");
        if (!referralRes.ok) throw new Error(referralData.error || "Failed to load referral analytics");

        setBilling(billingData);
        setReferrals(referralData);
      } catch (loadError: unknown) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load analytics";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="app-surface flex items-center gap-3 px-6 py-4">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
          <span className="text-sm text-[var(--text-muted)]">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-error rounded-[14px] p-6 text-sm">
        {error}
      </div>
    );
  }

  const plan = billing?.subscription?.plan || "free";
  const subscriptionStatus = billing?.subscription?.status || "inactive";

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="app-subtitle mt-1">Track plan performance, referral outcomes, and growth signals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[#6b7280]">Current Plan</p>
          <div className="mt-2 flex items-center gap-2 text-indigo-200">
            <CircleDollarSign className="h-5 w-5" />
            <p className="text-2xl font-semibold uppercase">{plan.replace("_", " ")}</p>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Status: {subscriptionStatus}</p>
        </div>

        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[#6b7280]">Referral Touches</p>
          <div className="mt-2 flex items-center gap-2 text-[var(--text)]">
            <Users className="h-5 w-5 text-[var(--success)]" />
            <p className="text-2xl font-semibold">{referrals?.summary.touches ?? 0}</p>
          </div>
        </div>

        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[#6b7280]">Referral Conversion</p>
          <div className="mt-2 flex items-center gap-2 text-[var(--text)]">
            <TrendingUp className="h-5 w-5 text-indigo-300" />
            <p className="text-2xl font-semibold">{referrals?.summary.conversionRate ?? 0}%</p>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Converted: {referrals?.summary.converted ?? 0}
          </p>
        </div>
      </div>

      <div className="app-surface p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Latest Referral Attribution</h2>
        {referrals?.latest ? (
          <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
            <p>Source: {referrals.latest.source || "unknown"}</p>
            <p>Campaign: {referrals.latest.campaign || "none"}</p>
            <p>Tracked At: {new Date(referrals.latest.created_at).toLocaleString()}</p>
            <p>
              Converted: {referrals.latest.converted_at ? new Date(referrals.latest.converted_at).toLocaleString() : "not yet"}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-muted)]">No referral activity yet.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Source Cohorts</h2>
          <div className="mt-4 space-y-3">
            {(referrals?.cohorts?.bySource || []).map((row) => (
              <div key={row.source} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-3 text-sm">
                <div>
                  <p className="font-semibold text-[var(--text)]">{row.source}</p>
                  <p className="text-[var(--text-muted)]">Touches: {row.touches} • Converted: {row.converted}</p>
                </div>
                <p className="font-semibold text-indigo-200">{row.conversionRate}%</p>
              </div>
            ))}
            {(referrals?.cohorts?.bySource || []).length === 0 ? (
              <p className="text-sm text-[#6b7280]">No source cohort data yet.</p>
            ) : null}
          </div>
        </div>

        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Campaign Cohorts</h2>
          <div className="mt-4 space-y-3">
            {(referrals?.cohorts?.byCampaign || []).map((row) => (
              <div key={row.campaign} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-3 text-sm">
                <div>
                  <p className="font-semibold text-[var(--text)]">{row.campaign}</p>
                  <p className="text-[var(--text-muted)]">Touches: {row.touches} • Converted: {row.converted}</p>
                </div>
                <p className="font-semibold text-indigo-200">{row.conversionRate}%</p>
              </div>
            ))}
            {(referrals?.cohorts?.byCampaign || []).length === 0 ? (
              <p className="text-sm text-[#6b7280]">No campaign cohort data yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Referral Daily Trend (14d)</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Touches vs conversions by day.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referrals?.trends?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="touches" stroke="#818CF8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="converted" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Rolling 7-Day Conversion</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Smoothed conversion trend over a 7-day window.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referrals?.trends?.rolling7 || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} unit="%" />
                <Tooltip formatter={(value: number) => [`${value}%`, "Conversion"]} />
                <Line type="monotone" dataKey="conversionRate" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
