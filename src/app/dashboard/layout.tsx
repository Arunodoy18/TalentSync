"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bot,
  Briefcase,
  ClipboardList,
  CreditCard,
  FilePenLine,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Rocket,
  Settings,
  Target,
} from "lucide-react"
import { createClient } from "@/lib/supabase-browser"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "ATS Score", href: "/dashboard/ats-score", icon: Target },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Auto Apply", href: "/dashboard/auto-apply", icon: Rocket },
  { label: "Applications", href: "/dashboard/applications", icon: ClipboardList },
  { label: "Your Assistant", href: "/dashboard/assistant", icon: Bot },
  { label: "Cover Letters", href: "/dashboard/cover-letters", icon: FilePenLine },
  { label: "Roadmap", href: "/dashboard/roadmap", icon: Map },
  { label: "Billing & Pricing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const handleSignOut = React.useCallback(async () => {
    if (isSigningOut) return
    setIsSigningOut(true)

    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }, [isSigningOut, router, supabase])

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--text-primary)]">
      <aside className="flex h-screen w-[280px] flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5">
        <div className="mb-6 flex items-center justify-between px-2">
          <Link
            href="/dashboard"
            className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]"
          >
            TalentSync
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isRouteActive(pathname, item.href)
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      background: active ? "var(--primary-muted)" : "transparent",
                      color: active ? "var(--primary)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}




