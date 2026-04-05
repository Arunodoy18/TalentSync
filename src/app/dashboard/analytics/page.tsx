import { BarChart3, LineChart } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const hasAnalytics = false;

  if (!hasAnalytics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px]">
        <div className="h-20 w-20 bg-[var(--primary)/10] rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">No Analytics Generated Yet</h2>
        <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
          Generate insights to understand your application performance and conversion rates across hiring stages.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/resumes"
            className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
          >
            <LineChart className="h-4 w-4 mr-2" />
            Generate Insights
          </Link>
        </div>

        {/* Decorative Analytics Preview */}
        <div className="mt-16 w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 opacity-40 blur-[1px] select-none flex items-end gap-3 justify-center h-48 pointer-events-none">
           <div className="w-12 h-1/4 bg-[var(--primary)]/30 rounded-t-sm"></div>
           <div className="w-12 h-2/4 bg-[var(--primary)]/50 rounded-t-sm"></div>
           <div className="w-12 h-[60%] bg-[var(--primary)]/70 rounded-t-sm"></div>
           <div className="w-12 h-[85%] bg-[var(--primary)] rounded-t-sm"></div>
           <div className="w-12 h-full bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 rounded-t-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
    </div>
  );
}




