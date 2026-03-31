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
    <Sidebar collapsible="icon" className="border-r border-[#e5e7eb]">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2">
          <div className="app-pill hidden h-8 items-center px-3 text-[11px] tracking-[0.16em] uppercase transition-all group-data-[collapsible=icon]:hidden md:inline-flex">
            TalentSync
          </div>
          <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#003893] text-white group-data-[collapsible=icon]:flex md:flex">
            T
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="hover:bg-[#f3f4f6] data-[active=true]:bg-[#e5e7eb] data-[active=true]:text-[#003893]"
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
                className="w-full hover:bg-red-50 hover:text-red-600"
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
