import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text)] placeholder:text-[var(--text-muted)] selection:bg-[var(--primary)] selection:text-white h-[44px] w-full min-w-0 rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-[var(--text)] shadow-none transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--primary)] focus-visible:ring-[4px] focus-visible:ring-[rgba(99,102,241,0.25)]",
        "aria-invalid:ring-[rgba(239,68,68,0.2)] aria-invalid:border-[var(--danger)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
