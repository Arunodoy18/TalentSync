import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck, UserRound, Wallet, Bell, Lock } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SmokeTestHelper } from "@/components/settings/smoke-test-helper";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, plan_name, trial_end, end_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = subscription?.status || "inactive";
  const planLabel = subscription?.plan_name || (subscription?.plan ? subscription.plan.toUpperCase() : "Free");
  const accessUntil =
    status === "trial" ? formatDate(subscription?.trial_end) : formatDate(subscription?.end_date);

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">Settings</h1>
        <p className="app-subtitle mt-1">Control account preferences, privacy, and product behavior.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
              <UserRound className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Account</h2>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <p className="text-sm text-[var(--text-muted)]">Name</p>
            <p className="text-[var(--text)] font-medium">{user.user_metadata?.full_name || "Not set"}</p>
            <p className="text-sm text-[var(--text-muted)] pt-2">Email</p>
            <p className="text-[var(--text)] font-medium break-all">{user.email}</p>
            <p className="text-sm text-[var(--text-muted)] pt-2">User ID</p>
            <p className="text-[var(--text)] text-sm break-all">{user.id}</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
          >
            Manage Profile
          </Link>
        </div>

        <div className="app-surface p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Plan & Billing</h2>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <p className="text-sm text-[var(--text-muted)]">Current Plan</p>
            <p className="text-[var(--text)] font-medium">{planLabel}</p>
            <p className="text-sm text-[var(--text-muted)] pt-2">Status</p>
            <p className="text-[var(--text)] font-medium capitalize">{status}</p>
            <p className="text-sm text-[var(--text-muted)] pt-2">Access Until</p>
            <p className="text-[var(--text)] font-medium">{accessUntil}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-4 py-2 text-sm font-semibold text-[var(--primary-light)]"
            >
              Open Pricing Plans
            </Link>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
            >
              Open Billing
            </Link>
          </div>
        </div>

        <div className="app-surface p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Appearance</h2>
              <p className="text-sm text-[var(--text-muted)]">Choose your workspace visual style.</p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Theme</p>
                <p className="text-xs text-[var(--text-muted)]">Default is Dark. Switch to Gold for the premium warm palette.</p>
              </div>
              <ThemeSwitcher variant="segmented" />
            </div>
          </div>
        </div>

        <SmokeTestHelper userId={user.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="app-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-base font-semibold text-[var(--text)]">Notifications</h3>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Email alerts and product updates settings are available in the next module.</p>
        </div>
        <div className="app-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-base font-semibold text-[var(--text)]">Security</h3>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Password reset and session controls are managed through your auth provider.</p>
        </div>
        <div className="app-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-base font-semibold text-[var(--text)]">Product Status</h3>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--primary-light)]">
              <ShieldCheck className="h-4 w-4" />
              Settings module active and ready.
            </p>
        </div>
      </div>
    </div>
  );
}




