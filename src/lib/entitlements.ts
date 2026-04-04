import { createClient } from "@/lib/supabase-server";
import { BillingPlan } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase-admin";

const PLAN_PRIORITY: Record<BillingPlan, number> = {
  free: 0,
  pro: 1,
  auto_apply: 2,
  lifetime: 3,
};

function parsePlan(value: string | null | undefined): BillingPlan {
  if (value === "pro" || value === "auto_apply" || value === "lifetime") return value;
  return "free";
}

function isFutureIso(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

async function ensureTrialSubscription(userId: string) {
  const admin = createAdminClient();
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 60);

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "pro",
      plan_name: "Free Trial",
      status: "trial",
      start_date: now.toISOString(),
      trial_end: trialEnd.toISOString(),
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );
}

export async function getUserPlan(userId: string): Promise<BillingPlan> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, end_date, trial_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscription) {
    await ensureTrialSubscription(userId);
    return "pro";
  }

  if (subscription.status === "trial") {
    if (isFutureIso(subscription.trial_end)) {
      return "pro";
    }
    return "free";
  }

  if (subscription.status !== "active") {
    return "free";
  }

  if (subscription.end_date) {
    const endDate = new Date(subscription.end_date);
    if (endDate.getTime() < Date.now()) {
      return "free";
    }
  }

  return parsePlan(subscription.plan);
}

export async function hasPlanAccess(userId: string, minimumPlan: BillingPlan): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return PLAN_PRIORITY[plan] >= PLAN_PRIORITY[minimumPlan];
}
