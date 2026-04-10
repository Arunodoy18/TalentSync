"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function DashboardPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAssistantRoute = pathname === "/dashboard/assistant";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={isAssistantRoute ? "h-[calc(100vh-140px)] min-h-0 overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--soft-surface-bg)] flex flex-col" : "min-h-[calc(100vh-140px)]"}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}




