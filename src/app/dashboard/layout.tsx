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
        <SidebarInset className="bg-[#f6f7f9] p-8 overflow-auto">
          <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
