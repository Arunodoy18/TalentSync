"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="status-error app-surface flex flex-col items-start gap-4 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.18)] text-red-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Something went wrong</h2>
        <p className="mt-1 text-[var(--text-muted)]">This section hit an unexpected error. Try reloading it.</p>
      </div>
      <button
        onClick={reset}
        className="h-[44px] rounded-[14px] border border-[rgba(142,182,155,0.5)] bg-[rgba(35,83,71,0.22)] px-5 font-semibold text-[var(--primary-light)] hover:bg-[rgba(35,83,71,0.35)]"
      >
        Try again
      </button>
    </div>
  );
}
