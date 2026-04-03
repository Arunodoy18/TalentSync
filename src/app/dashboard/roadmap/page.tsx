import { Route, Map } from "lucide-react";
import Link from "next/link";

export default function CareerRoadmapPage() {
  const hasRoadmap = false;

  if (!hasRoadmap) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
        <div className="h-20 w-20 bg-[var(--primary)/10] rounded-full flex items-center justify-center mb-6">
          <Route className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">No Career Roadmap Yet</h2>
        <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
          We will analyze your resume and target role to create a personalized roadmap to help you reach top companies.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/resumes"
            className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
          >
            <Map className="h-4 w-4 mr-2" />
            Generate Roadmap
          </Link>
        </div>

        {/* Decorative Roadmap Preview */}
        <div className="mt-16 w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 opacity-40 blur-[1px] select-none flex flex-col items-start gap-4 pointer-events-none">
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-[var(--background)]">?</div>
              <div className="h-4 w-48 bg-[var(--muted)] rounded"></div>
           </div>
           <div className="w-0.5 h-6 bg-[var(--border)] ml-4"></div>
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-[var(--muted)] rounded-full flex items-center justify-center text-xs font-bold px-2 ring-4 ring-[var(--background)]">2</div>
              <div className="h-4 w-64 bg-[var(--muted)] rounded"></div>
           </div>
           <div className="w-0.5 h-6 bg-[var(--border)] ml-4"></div>
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-[var(--muted)] rounded-full flex items-center justify-center text-xs font-bold px-2 ring-4 ring-[var(--background)]">3</div>
              <div className="h-4 w-32 bg-[var(--muted)] rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-3xl font-bold">Career Roadmap</h1>
    </div>
  );
}
