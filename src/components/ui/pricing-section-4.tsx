"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
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
  buttonVariant: "outline" | "default";
  popular?: boolean;
  includes: string[];
  billingLabel?: string;
};

const plans: PricingCardPlan[] = [
  {
    id: "pro",
    name: "Starter",
    description:
      "Great for small businesses and startups looking to get started with AI",
    price: 499,
    yearlyPrice: 4990,
    buttonText: "Get started",
    buttonVariant: "outline",
    includes: [
      "Free includes:",
      "Unlimited cards",
      "Custom background and stickers",
      "Two-factor authentication",
      "Resume tailoring",
      "Career roadmap",
      "ATS breakdown",
      "Priority support",
    ],
  },
  {
    id: "auto_apply",
    name: "Business",
    description:
      "Best value for growing businesses that need more advanced features",
    price: 999,
    yearlyPrice: 9990,
    buttonText: "Get started",
    buttonVariant: "default",
    popular: true,
    includes: [
      "Everything in Starter, plus:",
      "Advanced checklists",
      "Custom fields",
      "Serverless functions",
      "Auto-apply queue",
      "Higher credits",
      "Automation analytics",
      "Priority support",
    ],
  },
  {
    id: "lifetime",
    name: "Enterprise",
    description:
      "Advanced plan with enhanced security and unlimited access for large teams",
    price: 2999,
    yearlyPrice: 2999,
    buttonText: "Get started",
    buttonVariant: "outline",
    billingLabel: "one-time",
    includes: [
      "Everything in Business, plus:",
      "Multi-board management",
      "Guest access controls",
      "Attachment permissions",
      "One-time purchase",
      "Premium forever",
      "No monthly renewal",
      "Best value",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-gray-700 bg-neutral-900 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 h-10 w-fit rounded-full px-3 py-1 font-medium transition-colors sm:px-6 sm:py-2",
            selected === "0" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600 shadow-sm shadow-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 h-10 w-fit flex-shrink-0 rounded-full px-3 py-1 font-medium transition-colors sm:px-6 sm:py-2",
            selected === "1" ? "text-white" : "text-gray-200"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600 shadow-sm shadow-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4({ onChoosePlan, loadingPlan = null }: PricingSection4Props) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value, 10) === 1);

  return (
    <div className="relative mx-auto min-h-screen overflow-x-hidden bg-black" ref={pricingRef}>
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
        <SparklesComp
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>

      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] z-0 flex h-[113.625vh] w-full flex-col items-start justify-start gap-2.5 overflow-hidden p-0"
      >
        <div
          className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] rounded-full"
          style={{
            border: "200px solid #3131f5",
            filter: "blur(92px)",
            WebkitFilter: "blur(92px)",
          }}
        />
      </TimelineContent>

      <article className="relative z-50 mx-auto mb-6 max-w-3xl space-y-2 pt-32 text-center">
        <h2 className="text-4xl font-medium text-white">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Plans that works best for your
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-300"
        >
          Trusted by millions, We help teams all around the world, Explore which option is right for you.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute left-[10%] top-0 z-0 h-full w-[80%]"
        style={{
          backgroundImage: "radial-gradient(circle at center, #206ce8 0%, transparent 70%)",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-20 mx-auto grid max-w-5xl gap-4 py-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative border-neutral-800 text-white ${
                plan.popular
                  ? "z-20 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff]"
                  : "z-10 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900"
              }`}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between">
                  <h3 className="mb-2 text-3xl">{plan.name}</h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold">
                    INR <NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="text-4xl font-semibold" />
                  </span>
                  <span className="ml-1 text-gray-300">/{plan.billingLabel || (isYearly ? "year" : "month")}</span>
                </div>
                <p className="mb-4 text-sm text-gray-300">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  onClick={() => onChoosePlan?.(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`mb-6 w-full rounded-xl p-4 text-xl transition-opacity disabled:cursor-not-allowed disabled:opacity-65 ${
                    plan.popular
                      ? "border border-blue-500 bg-gradient-to-t from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-800"
                      : plan.buttonVariant === "outline"
                        ? "border border-neutral-800 bg-gradient-to-t from-neutral-950 to-neutral-600 text-white shadow-lg shadow-neutral-900"
                        : ""
                  }`}
                >
                  {loadingPlan === plan.id ? "Creating Order..." : plan.buttonText}
                </button>

                <div className="space-y-3 border-t border-neutral-700 pt-4">
                  <h4 className="mb-3 text-base font-medium">{plan.includes[0]}</h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <span className="grid h-2.5 w-2.5 place-content-center rounded-full bg-neutral-500" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
