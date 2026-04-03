"use client";

export default function AtsScoreLoading() {
  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
          <div className="h-4 w-72 bg-[var(--card)] border border-[var(--border)] rounded-md"></div>
        </div>
      </div>

      <div className="grid gap-[24px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* MAIN SCORE CARD */}
        <div className="p-[32px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] col-span-1 md:col-span-2 flex flex-col items-center justify-center min-h-[300px]">
           <div className="w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center mb-6">
             <div className="h-12 w-20 bg-white/10 rounded-lg"></div>
           </div>
           <div className="h-6 w-32 bg-white/5 rounded-md"></div>
        </div>

        {/* BREAKDOWN CARDS */}
        <div className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] col-span-1 md:col-span-2 flex flex-col justify-center space-y-6 min-h-[300px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-white/10 rounded"></div>
                  <div className="h-4 w-10 bg-white/5 rounded"></div>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-white/10" style={{ width: Math.max(30, Math.random() * 80) + '%' }}></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
