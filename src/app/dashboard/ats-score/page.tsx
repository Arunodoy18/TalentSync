import { Target, Upload } from "lucide-react";
import Link from "next/link";

export default function AtsScorePage() {
  const hasAtsScore = false; // Force empty state for now

  if (!hasAtsScore) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
        <div className="h-20 w-20 bg-[var(--primary)/10] rounded-full flex items-center justify-center mb-6">
          <Target className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">No ATS Score Yet</h2>
        <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
          Upload your resume to analyze your ATS score and see how well your resume performs in real hiring systems.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/resumes/upload"
            className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Link>
        </div>
        
        {/* Decorative Preview */}
        <div className="mt-16 w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 opacity-40 blur-[1px] select-none pointer-events-none">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-[var(--primary)]"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[var(--muted)] rounded"></div>
                <div className="h-3 w-48 bg-[var(--muted)] rounded"></div>
              </div>
           </div>
           <div className="h-2 w-full bg-[var(--muted)] rounded mb-4"></div>
           <div className="h-2 w-3/4 bg-[var(--muted)] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-3xl font-bold">ATS Score</h1>
    </div>
  );
}




