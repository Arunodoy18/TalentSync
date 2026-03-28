import { createClient } from "@/lib/supabase-server";
import { BillingPlan } from "@/lib/billing";

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

export async function getUserPlan(userId: string): Promise<BillingPlan> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, end_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscription || subscription.status !== "active") {
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
