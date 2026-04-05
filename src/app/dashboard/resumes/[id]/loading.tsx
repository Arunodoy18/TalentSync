"use client";

export default function RouteLoading() {
  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full animate-pulse space-y-6">
      <div className="h-9 w-56 rounded-md border border-[var(--border)] bg-[var(--card)]" />
      <div className="h-4 w-80 rounded-md border border-[var(--border)] bg-[var(--card)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-[12px] border border-[var(--border)] bg-[var(--card)]" />
        ))}
      </div>
      <div className="h-64 rounded-[12px] border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}
