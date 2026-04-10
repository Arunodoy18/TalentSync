"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Bell, Command, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopNavbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="app-surface sticky top-0 z-40 mb-6 flex h-[68px] items-center justify-between px-4 md:px-6"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-10 w-10 rounded-[12px] border border-[var(--border)] bg-[var(--primary)]/[0.03] text-[var(--text)] hover:bg-[var(--primary)]/[0.08]" />
        <div className="hidden items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--primary)]/[0.02] px-3 md:flex">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            title="Search dashboard"
            aria-label="Search dashboard"
            placeholder="Search resumes, jobs, insights..."
            className="h-10 w-72 border-0 bg-transparent px-0 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Pro Workspace
        </div>

        <button
          type="button"
          title="Open notifications"
          aria-label="Open notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--primary)]/[0.03] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--primary)]/[0.08] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--warning)]" />
        </button>

        <div className="hidden items-center gap-1 rounded-[12px] border border-[var(--border)] bg-[var(--primary)]/[0.02] px-2 py-1 text-xs text-[var(--text-muted)] sm:flex">
          <Command className="h-3.5 w-3.5" />
          K
        </div>

        <ThemeSwitcher />

        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--primary)]/40 bg-[var(--primary)]/20 text-sm font-semibold text-[var(--primary-light)]">
          TS
        </div>
      </div>
    </motion.header>
  );
}




