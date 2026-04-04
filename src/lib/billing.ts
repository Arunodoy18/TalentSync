export type BillingPlan = "free" | "pro" | "auto_apply" | "lifetime";

export type SubscriptionPlanCode = "monthly_1" | "quarterly_3" | "half_yearly_6" | "yearly_12";

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanCode,
  {
    label: string;
    amountInr: number;
    intervalLabel: string;
    months: number;
    envPlanIdKey: string;
  }
> = {
  monthly_1: {
    label: "1 Month",
    amountInr: 499,
    intervalLabel: "Monthly",
    months: 1,
    envPlanIdKey: "RAZORPAY_PLAN_MONTHLY_ID",
  },
  quarterly_3: {
    label: "3 Months",
    amountInr: 899,
    intervalLabel: "Every 3 months",
    months: 3,
    envPlanIdKey: "RAZORPAY_PLAN_QUARTERLY_ID",
  },
  half_yearly_6: {
    label: "6 Months",
    amountInr: 1299,
    intervalLabel: "Every 6 months",
    months: 6,
    envPlanIdKey: "RAZORPAY_PLAN_HALF_YEARLY_ID",
  },
  yearly_12: {
    label: "12 Months",
    amountInr: 3999,
    intervalLabel: "Yearly",
    months: 12,
    envPlanIdKey: "RAZORPAY_PLAN_YEARLY_ID",
  },
};

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

export function isSubscriptionPlanCode(value: string): value is SubscriptionPlanCode {
  return (
    value === "monthly_1" ||
    value === "quarterly_3" ||
    value === "half_yearly_6" ||
    value === "yearly_12"
  );
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
