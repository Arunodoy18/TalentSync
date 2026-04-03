"use client";

export default function RoadmapLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2 mt-1">
                   <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border-4 border-[var(--background)] ring-2 ring-white/5"></div>
                   {i !== 4 && <div className="w-0.5 h-20 bg-white/5"></div>}
                </div>
                <div className="space-y-3 flex-1 pt-2">
                   <div className="h-6 w-48 bg-white/10 rounded"></div>
                   <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                   <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                   
                   <div className="flex gap-3 mt-4">
                     <div className="h-8 w-24 bg-white/10 rounded-full"></div>
                     <div className="h-8 w-32 bg-white/10 rounded-full"></div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
