"use client";

export default function AutoApplyLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-64 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-96 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-10 w-32 bg-[var(--primary)/10] border border-[var(--primary)/20] rounded-md"></div>
        </div>
      </div>

      {/* METRICS STATS */}
      <div className="grid gap-[24px] grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-white/5 rounded"></div>
              <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10"></div>
            </div>
            <div className="h-8 w-16 bg-white/10 rounded"></div>
            <div className="h-3 w-32 bg-white/5 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* ACTIVE TASKS / APPLICATIONS TABLE */}
      <div className="space-y-4">
        <div className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-[8px] flex items-center px-4">
           <div className="h-4 w-32 bg-white/10 rounded mr-auto"></div>
           <div className="h-4 w-24 bg-white/5 rounded mx-4"></div>
           <div className="h-4 w-24 bg-white/5 rounded"></div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex items-center">
            <div className="h-10 w-10 rounded-[8px] bg-white/5 border border-white/10 mr-6"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-white/10 rounded"></div>
              <div className="h-4 w-32 bg-white/5 rounded"></div>
            </div>
            <div className="h-6 w-24 bg-white/5 rounded-full mr-6"></div>
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
