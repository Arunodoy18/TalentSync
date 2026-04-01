import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-medium text-[var(--text)] transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[var(--primary)] focus-visible:ring-[4px] focus-visible:ring-[rgba(99,102,241,0.25)] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-[rgba(99,102,241,0.2)] bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:bg-[var(--primary-hover)]",
        destructive:
          "border border-[rgba(239,68,68,0.3)] bg-[var(--danger)] text-white hover:bg-[#dc2626] focus-visible:ring-[rgba(239,68,68,0.35)]",
        outline:
          "border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.14)]",
        secondary:
          "border border-[var(--border)] bg-[rgba(255,255,255,0.08)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.14)]",
        ghost:
          "hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
        link: "text-indigo-300 underline-offset-4 hover:text-indigo-200 hover:underline",
      },
      size: {
        default: "h-[44px] px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-[44px]",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
    if (asChild) {
      return (
        <Slot
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      )
    }

  return (
      <motion.button
      data-slot="button"
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
