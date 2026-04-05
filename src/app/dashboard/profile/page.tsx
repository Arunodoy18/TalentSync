import { UserRound, BadgeCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="app-subtitle mt-1">Keep your personal details and career preferences up to date.</p>
      </div>

      <div className="app-surface p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00389310] text-[#003893]">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#212529]">Profile workspace is active</h2>
            <p className="text-[#6b7280]">
              This page now resolves correctly under the dashboard route and can be extended with profile forms and account details.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-4 py-2 text-sm font-medium text-[#047857]">
              <BadgeCheck className="h-4 w-4" />
              Route health: OK
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




