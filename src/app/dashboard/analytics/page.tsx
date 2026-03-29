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
        <Loader2 className="h-8 w-8 animate-spin text-[#003893]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  const plan = billing?.subscription?.plan || "free";
  const subscriptionStatus = billing?.subscription?.status || "inactive";

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#212529]">Analytics</h1>
        <p className="mt-1 text-[#6b7280]">Subscription health and referral conversion performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <p className="text-sm font-medium text-[#6b7280]">Current Plan</p>
          <div className="mt-2 flex items-center gap-2 text-[#003893]">
            <CircleDollarSign className="h-5 w-5" />
            <p className="text-2xl font-bold uppercase">{plan.replace("_", " ")}</p>
          </div>
          <p className="mt-2 text-xs text-[#6b7280]">Status: {subscriptionStatus}</p>
        </div>

        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <p className="text-sm font-medium text-[#6b7280]">Referral Touches</p>
          <div className="mt-2 flex items-center gap-2 text-[#212529]">
            <Users className="h-5 w-5 text-green-600" />
            <p className="text-2xl font-bold">{referrals?.summary.touches ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <p className="text-sm font-medium text-[#6b7280]">Referral Conversion</p>
          <div className="mt-2 flex items-center gap-2 text-[#212529]">
            <TrendingUp className="h-5 w-5 text-[#003893]" />
            <p className="text-2xl font-bold">{referrals?.summary.conversionRate ?? 0}%</p>
          </div>
          <p className="mt-2 text-xs text-[#6b7280]">
            Converted: {referrals?.summary.converted ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-xl font-bold text-[#212529]">Latest Referral Attribution</h2>
        {referrals?.latest ? (
          <div className="mt-4 grid gap-2 text-sm text-[#4b5563]">
            <p>Source: {referrals.latest.source || "unknown"}</p>
            <p>Campaign: {referrals.latest.campaign || "none"}</p>
            <p>Tracked At: {new Date(referrals.latest.created_at).toLocaleString()}</p>
            <p>
              Converted: {referrals.latest.converted_at ? new Date(referrals.latest.converted_at).toLocaleString() : "not yet"}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#6b7280]">No referral activity yet.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-xl font-bold text-[#212529]">Source Cohorts</h2>
          <div className="mt-4 space-y-3">
            {(referrals?.cohorts?.bySource || []).map((row) => (
              <div key={row.source} className="flex items-center justify-between rounded-xl border border-[#eef1f6] p-3 text-sm">
                <div>
                  <p className="font-semibold text-[#212529]">{row.source}</p>
                  <p className="text-[#6b7280]">Touches: {row.touches} • Converted: {row.converted}</p>
                </div>
                <p className="font-bold text-[#003893]">{row.conversionRate}%</p>
              </div>
            ))}
            {(referrals?.cohorts?.bySource || []).length === 0 ? (
              <p className="text-sm text-[#6b7280]">No source cohort data yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-xl font-bold text-[#212529]">Campaign Cohorts</h2>
          <div className="mt-4 space-y-3">
            {(referrals?.cohorts?.byCampaign || []).map((row) => (
              <div key={row.campaign} className="flex items-center justify-between rounded-xl border border-[#eef1f6] p-3 text-sm">
                <div>
                  <p className="font-semibold text-[#212529]">{row.campaign}</p>
                  <p className="text-[#6b7280]">Touches: {row.touches} • Converted: {row.converted}</p>
                </div>
                <p className="font-bold text-[#003893]">{row.conversionRate}%</p>
              </div>
            ))}
            {(referrals?.cohorts?.byCampaign || []).length === 0 ? (
              <p className="text-sm text-[#6b7280]">No campaign cohort data yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-xl font-bold text-[#212529]">Referral Daily Trend (14d)</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Touches vs conversions by day.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referrals?.trends?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="touches" stroke="#003893" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="converted" stroke="#0f9d58" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-6">
          <h2 className="text-xl font-bold text-[#212529]">Rolling 7-Day Conversion</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Smoothed conversion trend over a 7-day window.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referrals?.trends?.rolling7 || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} unit="%" />
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
