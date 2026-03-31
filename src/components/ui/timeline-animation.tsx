"use client";

import { ElementType, ReactNode, RefObject } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type TimelineContentProps<T extends ElementType = "div"> = {
  as?: T;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children: ReactNode;
};

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function TimelineContent<T extends ElementType = "div">({
  as,
  animationNum = 0,
  customVariants,
  className,
  children,
}: TimelineContentProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={cn(className)}
      custom={animationNum}
      variants={customVariants ?? defaultVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </MotionComponent>
  );
}
