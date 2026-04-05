import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-[var(--border)] placeholder:text-[var(--text-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-black/5 dark:bg-[rgba(255,255,255,0.05)] flex field-sizing-content min-h-16 w-full rounded-[14px] border px-4 py-3 text-base text-[var(--text)] shadow-none transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }




