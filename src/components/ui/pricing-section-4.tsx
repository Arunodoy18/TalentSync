"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from "@/lib/billing";

export type PricingPlanId = SubscriptionPlanCode;

type PricingSection4Props = {
  onChoosePlan?: (planId: PricingPlanId) => void;
  loadingPlan?: PricingPlanId | null;
};

type PricingCardPlan = {
  id: PricingPlanId | "trial";
  name: string;
  description: string;
  price: number;
  buttonText: string;
  popular?: boolean;
  includes: string[];
  billingLabel?: string;
  disabled?: boolean;
};

const plans: PricingCardPlan[] = [
  {
    id: "trial",
    name: "Free Trial",
    description: "Start with full premium access for your first 2 months.",
    price: 0,
    buttonText: "Included After Signup",
    includes: [
      "2 months full access",
      "AI Resume Builder",
      "ATS Score Checker",
      "Job Matching",
      "Auto Apply",
      "AI Career Assistant",
      "Cover Letter Generator",
      "Career Roadmap",
      "Analytics Dashboard",
      "Application Tracker",
    ],
    billingLabel: "2 months",
    disabled: true,
  },
  {
    id: "monthly_1",
    name: "1 Month",
    description: "Monthly recurring plan for active applicants.",
    price: SUBSCRIPTION_PLANS.monthly_1.amountInr,
    buttonText: "Buy Monthly",
    includes: [
      "All premium features",
      "Recurring monthly billing",
      "Cancel anytime",
    ],
    billingLabel: SUBSCRIPTION_PLANS.monthly_1.intervalLabel,
  },
  {
    id: "quarterly_3",
    name: "3 Months",
    description: "Best value for consistent interview cycles.",
    price: SUBSCRIPTION_PLANS.quarterly_3.amountInr,
    buttonText: "Buy 3 Months",
    popular: true,
    includes: [
      "All premium features",
      "Recurring every 3 months",
      "Lower monthly cost",
    ],
    billingLabel: SUBSCRIPTION_PLANS.quarterly_3.intervalLabel,
  },
  {
    id: "half_yearly_6",
    name: "6 Months",
    description: "High-conviction plan for long pipelines and role switches.",
    price: SUBSCRIPTION_PLANS.half_yearly_6.amountInr,
    buttonText: "Buy 6 Months",
    includes: [
      "All premium features",
      "Recurring every 6 months",
      "Lower monthly cost",
    ],
    billingLabel: SUBSCRIPTION_PLANS.half_yearly_6.intervalLabel,
  },
  {
    id: "yearly_12",
    name: "12 Months",
    description: "Best annual savings for serious career growth.",
    price: SUBSCRIPTION_PLANS.yearly_12.amountInr,
    buttonText: "Buy Yearly",
    includes: [
      "All premium features",
      "Recurring yearly billing",
      "Best savings per month",
    ],
    billingLabel: SUBSCRIPTION_PLANS.yearly_12.intervalLabel,
  },
];

export default function PricingSection4({ onChoosePlan, loadingPlan = null }: PricingSection4Props) {
  return (
    <div className="relative mx-auto min-h-screen overflow-x-hidden bg-atmosphere">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[rgba(142,182,155,0.2)] blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-[130px]" />
      </div>

      <article className="relative z-10 mx-auto mb-8 max-w-3xl space-y-4 px-4 pt-24 text-center sm:pt-28">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold text-[var(--text)] sm:text-5xl"
        >
          Plans that scale your career growth
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-[var(--text-muted)]"
        >
          Start with a free 2-month trial. Upgrade when trial ends to continue premium workflows.
        </motion.p>
      </article>

      <div className="relative z-20 mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 + index * 0.08 }}
            whileHover={{ y: -8 }}
          >
            <Card
              className={cn(
                "h-full text-[var(--text)]",
                plan.popular
                  ? "border-[rgba(142,182,155,0.55)] bg-[rgba(35,83,71,0.18)] shadow-[0_22px_52px_rgba(11,43,38,0.35)]"
                  : "border-[var(--border)] bg-[rgba(255,255,255,0.05)]"
              )}
            >
              <CardHeader className="text-left">
                <div className="mb-1 flex justify-between">
                  <h3 className="text-2xl font-semibold sm:text-3xl">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-full border border-[rgba(142,182,155,0.5)] bg-[rgba(35,83,71,0.22)] px-3 py-1 text-xs font-semibold text-[var(--primary-light)]">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold sm:text-4xl">
                    INR <NumberFlow value={plan.price} className="text-3xl font-semibold sm:text-4xl" />
                  </span>
                  <span className="ml-1 text-[var(--text-muted)]">/{plan.billingLabel || "month"}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (plan.id !== "trial") {
                      onChoosePlan?.(plan.id);
                    }
                  }}
                  disabled={plan.disabled || loadingPlan === plan.id}
                  className={cn(
                    "mb-6 h-[44px] w-full rounded-[14px] text-base font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-65",
                    plan.popular
                      ? "border border-[rgba(142,182,155,0.55)] bg-[var(--primary)] text-white shadow-[0_12px_28px_rgba(11,43,38,0.45)]"
                      : "border border-[var(--border)] bg-[rgba(255,255,255,0.06)] text-[var(--text)] hover:border-[rgba(142,182,155,0.35)] hover:bg-[rgba(35,83,71,0.16)]",
                    plan.disabled && "cursor-not-allowed opacity-70"
                  )}
                >
                  {loadingPlan === plan.id ? "Creating Subscription..." : plan.buttonText}
                </motion.button>

                <div className="space-y-3 border-t border-[var(--border)] pt-4">
                  <ul className="space-y-2">
                    {plan.includes.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                        <span className="text-sm text-[var(--text-muted)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}




