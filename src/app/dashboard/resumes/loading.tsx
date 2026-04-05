"use client";

export default function ResumesLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
      </div>

      {/* CORE CREATION OPTIONS */}
      <div className="grid gap-[24px] md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="p-[32px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-[12px] bg-white/5 border border-white/10 mb-4"></div>
              <div className="h-6 w-1/2 bg-white/10 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
              </div>
            </div>
            <div className="h-4 w-32 bg-white/10 rounded mt-6"></div>
          </div>
        ))}
      </div>

      {/* EXISTING RESUMES LIST */}
      <div className="mt-[48px] space-y-[24px]">
        <div className="h-6 w-48 bg-[var(--card)] rounded-md"></div>
        <div className="grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-[12px] bg-white/5 border border-white/10"></div>
              </div>
              <div className="h-5 w-3/4 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-white/5 rounded mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




