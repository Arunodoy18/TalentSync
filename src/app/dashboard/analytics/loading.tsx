"use client";

export default function AnalyticsLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid gap-[24px] grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-white/5 rounded"></div>
              <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10"></div>
            </div>
            <div className="h-8 w-20 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>

      {/* CHARTS SKELETON */}
      <div className="grid gap-[24px] grid-cols-1 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] col-span-1 lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="h-6 w-48 bg-white/10 rounded mb-8"></div>
          <div className="flex items-end gap-4 h-full flex-1 justify-between px-8 pb-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-full bg-white/5 rounded-t-sm" style={{ height: Math.max(20, Math.random() * 100) + '%' }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
