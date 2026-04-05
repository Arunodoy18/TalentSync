import { Mail, Sparkles } from "lucide-react";

export default function CoverLettersPage() {
  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="app-title text-3xl font-bold tracking-tight">Cover Letters</h1>
        <p className="app-subtitle mt-1">Generate role-specific cover letters from your strongest resume points.</p>
      </div>

      <div className="app-surface p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00389310] text-[#003893]">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#212529]">Feature ready for rollout</h2>
            <p className="text-[#6b7280]">
              This route now exists and is wired into the dashboard. The cover letter generator UI can be expanded here without returning a 404.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#f3f4f6] px-4 py-2 text-sm font-medium text-[#4b5563]">
              <Sparkles className="h-4 w-4 text-[#003893]" />
              Next step: connect generation workflow and templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




