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
    <div className="app-surface flex flex-col items-start gap-4 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#212529]">Something went wrong</h2>
        <p className="mt-1 text-[#6b7280]">This section hit an unexpected error. Try reloading it.</p>
      </div>
      <button
        onClick={reset}
        className="rounded-full bg-[#003893] px-5 py-2 font-semibold text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}