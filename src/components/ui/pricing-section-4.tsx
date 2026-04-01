"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PricingPlanId = "pro" | "auto_apply" | "lifetime";

type PricingSection4Props = {
  onChoosePlan?: (planId: PricingPlanId) => void;
  loadingPlan?: PricingPlanId | null;
};

type PricingCardPlan = {
  id: PricingPlanId;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  buttonText: string;
  popular?: boolean;
  includes: string[];
  billingLabel?: string;
};

const plans: PricingCardPlan[] = [
  {
    id: "pro",
    name: "Starter",
    description: "Great for individuals building a high-signal resume stack.",
    price: 499,
    yearlyPrice: 4990,
    buttonText: "Start Starter",
    includes: [
      "Unlimited resume edits",
      "ATS optimization",
      "Role-specific tailoring",
      "Career roadmap",
      "Email support",
    ],
  },
  {
    id: "auto_apply",
    name: "Business",
    description: "Best for active job seekers who want automation and velocity.",
    price: 999,
    yearlyPrice: 9990,
    buttonText: "Start Business",
    popular: true,
    includes: [
      "Everything in Starter",
      "Auto-apply queue",
      "Advanced analytics",
      "Priority pipeline",
      "Faster support",
    ],
  },
  {
    id: "lifetime",
    name: "Enterprise",
    description: "One-time premium access with full feature unlock forever.",
    price: 2999,
    yearlyPrice: 2999,
    buttonText: "Get Lifetime",
    billingLabel: "one-time",
    includes: [
      "Everything in Business",
      "Lifetime access",
      "Unlimited usage",
      "Premium support",
      "Early feature access",
    ],
  },
];

function PricingSwitch({ onSwitch }: { onSwitch: (value: string) => void }) {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.05)] p-1 backdrop-blur-md">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 h-10 w-fit rounded-full px-4 text-sm font-medium transition-colors sm:px-6",
            selected === "0" ? "text-white" : "text-[var(--text-muted)]"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute left-0 top-0 h-10 w-full rounded-full border border-[rgba(129,140,248,0.6)] bg-[var(--primary)] shadow-[0_8px_24px_rgba(79,70,229,0.45)]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 h-10 w-fit rounded-full px-4 text-sm font-medium transition-colors sm:px-6",
            selected === "1" ? "text-white" : "text-[var(--text-muted)]"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute left-0 top-0 h-10 w-full rounded-full border border-[rgba(129,140,248,0.6)] bg-[var(--primary)] shadow-[0_8px_24px_rgba(79,70,229,0.45)]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Yearly</span>
        </button>
      </div>
    </div>
  );
}

export default function PricingSection4({ onChoosePlan, loadingPlan = null }: PricingSection4Props) {
  const [isYearly, setIsYearly] = useState(false);

  const togglePricingPeriod = (value: string) => {
    setIsYearly(Number.parseInt(value, 10) === 1);
  };

  return (
    <div className="relative mx-auto min-h-screen overflow-x-hidden bg-atmosphere">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-[120px]" />
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
          Premium glass UI, serious analytics, and automation that feels world-class from day one.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </motion.div>
      </article>

      <div className="relative z-20 mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-3">
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
                  ? "border-[rgba(129,140,248,0.55)] bg-[rgba(99,102,241,0.18)] shadow-[0_22px_52px_rgba(79,70,229,0.35)]"
                  : "border-[var(--border)] bg-[rgba(255,255,255,0.05)]"
              )}
            >
              <CardHeader className="text-left">
                <div className="mb-1 flex justify-between">
                  <h3 className="text-2xl font-semibold sm:text-3xl">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-full border border-[rgba(129,140,248,0.5)] bg-[rgba(99,102,241,0.22)] px-3 py-1 text-xs font-semibold text-indigo-100">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold sm:text-4xl">
                    INR <NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="text-3xl font-semibold sm:text-4xl" />
                  </span>
                  <span className="ml-1 text-[var(--text-muted)]">/{plan.billingLabel || (isYearly ? "year" : "month")}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChoosePlan?.(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={cn(
                    "mb-6 h-[44px] w-full rounded-[14px] text-base font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-65",
                    plan.popular
                      ? "border border-[rgba(129,140,248,0.55)] bg-[var(--primary)] text-white shadow-[0_12px_28px_rgba(79,70,229,0.45)]"
                      : "border border-[var(--border)] bg-[rgba(255,255,255,0.06)] text-[var(--text)] hover:border-[rgba(129,140,248,0.35)] hover:bg-[rgba(99,102,241,0.16)]"
                  )}
                >
                  {loadingPlan === plan.id ? "Creating Order..." : plan.buttonText}
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
