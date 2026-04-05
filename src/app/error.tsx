"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[600px] w-full">
      <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-semibold mb-3 tracking-tight">Something went wrong!</h2>
      <p className="text-[var(--muted-foreground)] max-w-[420px] mb-8 text-base">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="btn-interaction inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)/90] h-10 px-8 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}




