"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] opacity-50"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
      className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}




