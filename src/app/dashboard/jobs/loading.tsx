"use client";

export default function JobsLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="h-[44px] w-full lg:w-80 bg-[var(--card)] border border-[var(--border)] rounded-[12px]"></div>
          <div className="h-[44px] w-24 bg-[var(--card)] border border-[var(--border)] rounded-[12px]"></div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-hidden pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-[var(--card)] border border-[var(--border)]"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-[12px] bg-[var(--card)] border border-[var(--border)] overflow-hidden">
        <div className="bg-black/20 border-b border-[var(--border)] h-12 w-full"></div>
        <div className="divide-y divide-[var(--border)]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-20 w-full flex items-center justify-between px-6">
              <div className="flex items-center gap-4 w-1/4">
                <div className="h-8 w-8 rounded-md bg-white/5"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="w-1/4"><div className="h-4 w-2/3 bg-white/5 rounded"></div></div>
              <div className="w-1/4"><div className="h-4 w-1/2 bg-white/5 rounded"></div></div>
              <div className="w-1/6">
                <div className="h-6 w-16 bg-emerald-500/10 rounded-full border border-emerald-500/20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




