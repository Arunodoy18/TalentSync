"use client";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      {/* Progress Bar Skeleton */}
      <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-8 animate-pulse">
        <div className="h-8 w-full bg-white/5 rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-[var(--card)] rounded-md animate-pulse border border-[var(--border)]"></div>
          <div className="h-4 w-72 bg-[var(--card)] rounded-md animate-pulse border border-[var(--border)]"></div>
        </div>
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-[24px] h-[220px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="h-12 w-12 rounded-xl bg-white/5 mb-6"></div>
            <div className="space-y-3 flex-1">
              <div className="h-3 w-1/3 bg-white/5 rounded"></div>
              <div className="h-5 w-3/4 bg-white/10 rounded"></div>
              <div className="h-4 w-full bg-white/5 rounded mt-2"></div>
              <div className="h-4 w-5/6 bg-white/5 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-white/10 rounded mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
