"use client"

import * as React from "react"
import {
  FileText,
  LayoutDashboard,
  ChartNoAxesColumn,
  Shield,
  Mail,
  Settings,
  User,
  LogOut,
  Briefcase
} from "lucide-react"
import { motion } from "framer-motion"
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
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Admin Ops",
    url: "/dashboard/admin",
    icon: Shield,
  },
  {
    title: "Cover Letters",
    url: "/dashboard/cover-letters",
    icon: Mail,
  },
  {
    title: "My Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-[var(--border)]">
      <SidebarHeader className="p-4">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-2"
        >
          <div className="app-pill hidden h-9 items-center px-3 text-[11px] tracking-[0.16em] uppercase transition-all group-data-[collapsible=icon]:hidden md:inline-flex">
            TalentSync
          </div>
          <div className="hidden h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.26)] text-indigo-100 group-data-[collapsible=icon]:flex md:flex">
            T
          </div>
        </motion.div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-1 px-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="h-11 rounded-[12px] border border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text)] data-[active=true]:border-[rgba(99,102,241,0.45)] data-[active=true]:bg-[rgba(99,102,241,0.2)] data-[active=true]:text-indigo-100"
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/auth/signout" method="post" className="w-full">
              <SidebarMenuButton
                type="submit"
                tooltip="Logout"
                className="h-11 w-full rounded-[12px] border border-transparent text-[var(--text-muted)] hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.16)] hover:text-red-200"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </div>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
