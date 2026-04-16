"use client"

import * as React from "react"
import {
  FileText,
  LayoutDashboard,
  ChartNoAxesColumn,

  Settings,
  LogOut,
  Briefcase,
  Rocket,
  Target,
  Map,
  FileSignature,
  CheckSquare,

  Wallet
} from "lucide-react"
import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Resumes",
    url: "/dashboard/resumes",
    icon: FileText,
  },
  {
    title: "ATS Score",
    url: "/dashboard/ats-score",
    icon: Target,
  },
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    title: "Auto Apply",
    url: "/dashboard/auto-apply",
    icon: Rocket,
  },
  {
    title: "Applications",
    url: "/dashboard/applications",
    icon: CheckSquare,
  },
  {
    title: "Your Assistant",
    url: "/dashboard/assistant",
    icon: Map,
  },
  {
    title: "Cover Letters",
    url: "/dashboard/cover-letters",
    icon: FileSignature,
  },
  {
    title: "Insights",
    url: "/dashboard/analytics",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Billing & Pricing",
    url: "/dashboard/billing",
    icon: Wallet,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, setOpen } = useSidebar()
  const hoverExpandedRef = React.useRef(false)

  const handleMouseEnter = React.useCallback(() => {
    if (isMobile || state !== "collapsed") return
    hoverExpandedRef.current = true
    setOpen(true)
  }, [isMobile, setOpen, state])

  const handleMouseLeave = React.useCallback(() => {
    if (isMobile || !hoverExpandedRef.current) return
    hoverExpandedRef.current = false
    setOpen(false)
  }, [isMobile, setOpen])

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[var(--border)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="p-4">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-2"
        >
          <div className="app-pill hidden h-9 items-center px-3 text-[11px] tracking-[0.16em] uppercase transition-all group-data-[collapsible=icon]:hidden md:inline-flex">
            TalentSync
          </div>
          <div className="hidden h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--primary)]/50 bg-[var(--primary)]/15 text-[var(--primary-light)] group-data-[collapsible=icon]:flex md:flex font-bold">
            T
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <SidebarMenu className="space-y-1 px-2">
            {items.map((item) => (
              <motion.div key={item.title} variants={itemVariants}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="h-11 rounded-[12px] border border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card)] hover:text-[var(--text)] data-[active=true]:border-[var(--primary)]/30 data-[active=true]:bg-[var(--primary)]/10 data-[active=true]:text-[var(--primary)] transition-all"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SidebarMenuItem>
              <form action="/auth/signout" method="post" className="w-full">
                <SidebarMenuButton
                  type="submit"
                  tooltip="Logout"
                  className="h-11 w-full rounded-[12px] border border-transparent text-[var(--text-muted)] hover:border-[var(--danger)]/40 hover:bg-[var(--danger)]/15 hover:text-[var(--danger)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </div>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </motion.div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}





