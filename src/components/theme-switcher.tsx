"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeSwitcherProps = {
  variant?: "icon" | "segmented";
  className?: string;
};

export function ThemeSwitcher({ variant = "icon", className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "gold" ? "gold" : "dark";
  const toggleTheme = () => setTheme(currentTheme === "dark" ? "gold" : "dark");

  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div className={cn("inline-flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 opacity-60", className)}>
          <button className="h-9 rounded-lg px-3 text-sm" disabled>
            Dark
          </button>
          <button className="h-9 rounded-lg px-3 text-sm" disabled>
            Gold
          </button>
        </div>
      );
    }

    return (
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] opacity-50"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  if (variant === "segmented") {
    return (
      <div className={cn("inline-flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1", className)}>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-medium transition-all",
            currentTheme === "dark"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme("gold")}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-medium transition-all",
            currentTheme === "gold"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          Gold
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={currentTheme === "dark" ? "Switch to Gold Theme" : "Switch to Dark Theme"}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.08)] transition-all",
        className
      )}
    >
      {currentTheme === "gold" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}




