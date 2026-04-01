import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { DashboardPageTransition } from "@/components/dashboard/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "240px" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="app-backdrop overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col">
            <TopNavbar />
            <DashboardPageTransition>
              {children}
            </DashboardPageTransition>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
