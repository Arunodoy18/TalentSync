import { headers } from "next/headers";

type AdminOverview = {
  kpis: {
    users: number;
    capturedPayments: number;
    capturedRevenueInr: number;
    activeSubscriptions: number;
    totalReferrals: number;
    convertedReferrals: number;
    referralConversionRate: number;
  };
  subscriptions: {
    activePlanDistribution: Record<string, number>;
  };
  cohorts: {
    bySource: Array<{ source: string; touches: number; converted: number; conversionRate: number }>;
    byCampaign: Array<{ campaign: string; touches: number; converted: number; conversionRate: number }>;
  };
  ops: {
    paymentEventsLast24h: number;
    replayFailuresLast24h: number;
  };
};

type OpsAlerts = {
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    detail: string;
  }>;
};

function getSeverityClasses(severity: "info" | "warning" | "critical") {
  if (severity === "critical") {
    return "status-error";
  }
  if (severity === "warning") {
    return "status-warning";
  }
  return "rounded-[14px] border border-[rgba(129,140,248,0.35)] bg-[rgba(99,102,241,0.16)] text-indigo-100";
}

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  const adminToken = process.env.INTERNAL_ADMIN_TOKEN;

  if (!adminToken) {
    return (
      <div className="status-warning rounded-[14px] p-6 text-sm">
        INTERNAL_ADMIN_TOKEN is not configured. Admin operations dashboard is disabled.
      </div>
    );
  }

  const baseUrl = await getBaseUrl();

  const [overviewRes, alertsRes] = await Promise.all([
    fetch(`${baseUrl}/api/admin/analytics/overview`, {
      headers: { "x-admin-key": adminToken },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/admin/ops/alerts`, {
      headers: { "x-admin-key": adminToken },
      cache: "no-store",
    }),
  ]);

  const overviewJson = (await overviewRes.json()) as AdminOverview | { error: string };
  const alertsJson = (await alertsRes.json()) as OpsAlerts | { error: string };

  if (!overviewRes.ok || !alertsRes.ok) {
    return (
      <div className="status-error rounded-[14px] p-6 text-sm">
        Failed to load admin telemetry. Ensure admin token and Supabase service credentials are valid.
      </div>
    );
  }

  const overview = overviewJson as AdminOverview;
  const alerts = (alertsJson as OpsAlerts).alerts;

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">Admin Operations</h1>
        <p className="app-subtitle mt-1">Monitor platform health, revenue quality, and referral efficiency.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[var(--text-muted)]">Users</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{overview.kpis.users}</p>
        </div>
        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[var(--text-muted)]">Revenue (INR)</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{overview.kpis.capturedRevenueInr}</p>
        </div>
        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[var(--text-muted)]">Active Subscriptions</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{overview.kpis.activeSubscriptions}</p>
        </div>
        <div className="app-surface p-6">
          <p className="text-sm font-medium text-[var(--text-muted)]">Referral Conversion</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{overview.kpis.referralConversionRate}%</p>
        </div>
      </div>

      <div className="app-surface p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Operational Alerts</h2>
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`rounded-xl border p-4 ${getSeverityClasses(alert.severity)}`}>
              <p className="font-semibold">{alert.title}</p>
              <p className="mt-1 text-sm">{alert.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Source Cohorts</h2>
          <div className="mt-4 space-y-2 text-sm">
            {overview.cohorts.bySource.map((row) => (
              <div key={row.source} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-3">
                <span className="font-medium text-[var(--text)]">{row.source}</span>
                <span className="text-[var(--text-muted)]">{row.converted}/{row.touches} ({row.conversionRate}%)</span>
              </div>
            ))}
            {overview.cohorts.bySource.length === 0 ? <p className="text-[var(--text-muted)]">No source cohorts yet.</p> : null}
          </div>
        </div>

        <div className="app-surface p-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">Campaign Cohorts</h2>
          <div className="mt-4 space-y-2 text-sm">
            {overview.cohorts.byCampaign.map((row) => (
              <div key={row.campaign} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-3">
                <span className="font-medium text-[var(--text)]">{row.campaign}</span>
                <span className="text-[var(--text-muted)]">{row.converted}/{row.touches} ({row.conversionRate}%)</span>
              </div>
            ))}
            {overview.cohorts.byCampaign.length === 0 ? <p className="text-[var(--text-muted)]">No campaign cohorts yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="app-surface p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Payment Event Health (24h)</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Events: {overview.ops.paymentEventsLast24h} • Replay Failures: {overview.ops.replayFailuresLast24h}
        </p>
      </div>
    </div>
  );
}
