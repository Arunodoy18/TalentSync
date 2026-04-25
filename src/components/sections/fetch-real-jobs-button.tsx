"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SeedResult = {
  message?: string;
  inserted?: number;
  skipped?: number;
  error?: string;
};

export default function FetchRealJobsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRealJobs = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/jobs/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });

      const data = (await response.json()) as SeedResult;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch real jobs");
      }

      const inserted = Number(data.inserted ?? 0);
      const skipped = Number(data.skipped ?? 0);
      setMessage(`${data.message || "Real jobs synced"}. Inserted ${inserted}, skipped ${skipped}.`);
      router.refresh();
    } catch (syncError) {
      const messageText = syncError instanceof Error ? syncError.message : "Failed to fetch real jobs";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={fetchRealJobs}
        disabled={loading}
        className="h-[44px] rounded-[12px] bg-[var(--primary)] text-black font-semibold hover:opacity-90"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Fetch Real Jobs
      </Button>
      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
