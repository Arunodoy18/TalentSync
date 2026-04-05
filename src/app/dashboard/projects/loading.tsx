"use client";

export default function ProjectsVaultLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-[var(--primary)/10] border border-[var(--primary)/20] rounded-md"></div>
      </div>

      <div className="grid gap-[24px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex flex-col min-h-[220px]">
            <div className="flex items-start justify-between mb-4">
               <div className="h-12 w-12 rounded-[8px] bg-white/10"></div>
               <div className="h-8 w-8 rounded-md bg-white/5"></div>
            </div>
            <div className="h-6 w-3/4 bg-white/10 rounded mb-3"></div>
            <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-white/5 rounded mb-6"></div>
            
            <div className="mt-auto flex gap-2">
               <div className="h-6 w-16 bg-white/10 rounded-full"></div>
               <div className="h-6 w-20 bg-white/10 rounded-full"></div>
               <div className="h-6 w-12 bg-white/10 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




