import { Settings, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">Settings</h1>
        <p className="app-subtitle mt-1">Control account preferences, privacy, and product behavior.</p>
      </div>

      <div className="app-surface p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00389310] text-[#003893]">
            <Settings className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#212529]">Settings route is now available</h2>
            <p className="text-[#6b7280]">
              This page replaces the 404 response for direct visits and refreshes and is ready for account-level settings modules.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fff7ed] px-4 py-2 text-sm font-medium text-[#b45309]">
              <ShieldCheck className="h-4 w-4" />
              Add security and notification controls next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
