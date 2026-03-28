"use client"

import * as React from "react"
import {
  FileText,
  LayoutDashboard,
  ChartNoAxesColumn,
  Mail,
  Settings,
  User,
  LogOut,
  Plus,
  Briefcase
} from "lucide-react"
import Image from "next/image"
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
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/90d7a352-e88b-418e-99a9-a0f1c8842820-app-resumly-ai/assets/svgs/logo_cd120a9103042b5bfba678e4a2c0af45-1.svg"
            alt="TalentSync"
            width={120}
            height={32}
            className="h-8 w-auto transition-all group-data-[collapsible=icon]:hidden"
          />
          <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#003893] text-white group-data-[collapsible=icon]:flex">
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
