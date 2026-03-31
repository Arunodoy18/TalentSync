import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="app-backdrop overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
