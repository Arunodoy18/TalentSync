export type BillingPlan = "free" | "pro" | "auto_apply" | "lifetime";

export const PLAN_PRICING_INR: Record<BillingPlan, number> = {
  free: 0,
  pro: 499,
  auto_apply: 999,
  lifetime: 2999,
};

export function isPaidPlan(plan: BillingPlan): boolean {
  return plan !== "free";
}

export function toPaise(inr: number): number {
  return Math.round(inr * 100);
}

export function isBillingPlan(value: string): value is BillingPlan {
  return value === "free" || value === "pro" || value === "auto_apply" || value === "lifetime";
}
