import { UploadCloud, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ResumeUpload from "@/components/sections/resume-upload";

export default async function ResumeUploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex-1 max-w-[1200px] mx-auto w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Upload Resume</h1>
        <p className="text-[var(--text-muted)]">
          Upload your existing PDF resume and we will parse it into your vault automatically.
        </p>
      </div>

      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-8 md:p-12">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-[14px] border border-[var(--border)] bg-white/5 flex items-center justify-center">
            <UploadCloud className="h-8 w-8 text-[var(--primary)]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--text)]">Import PDF Resume</h2>
            <p className="text-sm text-[var(--text-muted)]">
              After upload, your parsed resume is saved and you are redirected to the editor.
            </p>
          </div>

          <div className="flex justify-center">
            <ResumeUpload />
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <FileText className="h-3.5 w-3.5" />
            <span>Supported format: PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
