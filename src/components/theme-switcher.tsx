
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

  const currentTheme = theme === "theme-cyprus" ? "theme-cyprus" : "theme-plum";
  const toggleTheme = () => setTheme(currentTheme === "theme-plum" ? "theme-cyprus" : "theme-plum");

  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div className={cn("inline-flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 opacity-60", className)}>
          <button className="h-9 rounded-lg px-3 text-sm" disabled>Plum</button>
          <button className="h-9 rounded-lg px-3 text-sm" disabled>Cyprus</button>
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
          onClick={() => setTheme("theme-plum")}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-medium transition-all duration-300",
            currentTheme === "theme-plum" ? "bg-[var(--primary)] text-[var(--background)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          Plum
        </button>
        <button
          onClick={() => setTheme("theme-cyprus")}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-medium transition-all duration-300",
            currentTheme === "theme-cyprus" ? "bg-[var(--primary)] text-[var(--background)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          Cyprus
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] transition-all duration-300 hover:text-[var(--text)] hover:bg-[var(--primary)]/10 active:scale-95",
        className
      )}
      title={currentTheme === "theme-plum" ? "Switch to Cyprus Focus" : "Switch to Plum Luxury"}
    >
      <div className="relative h-4 w-4">
        <Sun 
          className={cn(
            "absolute inset-0 h-full w-full transition-all duration-300",
            currentTheme === "theme-plum" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
          )} 
        />
        <Moon 
          className={cn(
            "absolute inset-0 h-full w-full transition-all duration-300",
            currentTheme === "theme-cyprus" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
          )} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

