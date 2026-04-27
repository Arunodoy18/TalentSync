"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  FileText,
  Send,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type DashboardStats = {
  resumesCreated: number;
  atsScore: number;
  jobsMatched: number;
  applicationsSent: number;
};

type DashboardUser = {
  name: string;
  email: string;
};

const INITIAL_STATS: DashboardStats = {
  resumesCreated: 0,
  atsScore: 0,
  jobsMatched: 0,
  applicationsSent: 0,
};

function formatEmailName(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  return localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<DashboardUser | null>(null);
  const [stats, setStats] = React.useState<DashboardStats>(INITIAL_STATS);

  React.useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authUser) {
          router.push("/login");
          return;
        }

        const userName =
          (authUser.user_metadata?.full_name as string | undefined) ||
          (authUser.user_metadata?.name as string | undefined) ||
          formatEmailName(authUser.email ?? "");

        const [resumesCountResult, resumesScoresResult, applicationsResult] = await Promise.all([
          supabase
            .from("resumes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", authUser.id),
          supabase
            .from("resumes")
            .select("ats_score")
            .eq("user_id", authUser.id),
          supabase
            .from("job_applications")
            .select("id,status,application_status")
            .eq("user_id", authUser.id),
        ]);

        if (resumesCountResult.error) throw new Error(resumesCountResult.error.message);
        if (resumesScoresResult.error) throw new Error(resumesScoresResult.error.message);
        if (applicationsResult.error) throw new Error(applicationsResult.error.message);

        const resumeCount = resumesCountResult.count ?? 0;
        const atsScores = (resumesScoresResult.data ?? [])
          .map((row) => Number(row.ats_score))
          .filter((value) => Number.isFinite(value) && value >= 0);

        const avgAts =
          atsScores.length > 0
            ? Number((atsScores.reduce((sum, value) => sum + value, 0) / atsScores.length).toFixed(1))
            : 0;

        const applicationRows = applicationsResult.data ?? [];
        const matchedCount = applicationRows.length;
        const sentCount = applicationRows.filter((row) => {
          const status = String(row.application_status ?? row.status ?? "").toLowerCase();
          return ["applied", "submitted", "under_review", "interview", "offer", "rejected"].includes(status);
        }).length;

        if (!mounted) return;

        setUser({
          name: userName || "Candidate",
          email: authUser.email ?? "",
        });

        setStats({
          resumesCreated: resumeCount,
          atsScore: avgAts,
          jobsMatched: matchedCount,
          applicationsSent: sentCount,
        });
      } catch (fetchError: unknown) {
        if (!mounted) return;
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load dashboard data.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const progressSteps = [
    { label: "Profile", completed: Boolean(user) },
    { label: "Resume", completed: stats.resumesCreated > 0 },
    { label: "ATS Score", completed: stats.atsScore > 0 },
    { label: "Matches", completed: stats.jobsMatched > 0 },
    { label: "Applied", completed: stats.applicationsSent > 0 },
  ];

  const completedStepCount = progressSteps.filter((step) => step.completed).length;
  const progressPercent = Math.max(0, Math.min(100, (completedStepCount / progressSteps.length) * 100));

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-64 animate-pulse rounded-md bg-[var(--surface-elevated)]" />
            <div className="h-5 w-80 animate-pulse rounded-md bg-[var(--surface-elevated)]" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Welcome back, {user?.name || "Candidate"}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Signed in as {user?.email || "-"}
            </p>
          </>
        )}

        <div className="mt-6">
          <Link
            href="/dashboard/resumes/new"
            className="inline-flex h-11 items-center rounded-lg border border-[var(--primary)] bg-[var(--primary-muted)] px-5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            Create Resume
          </Link>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-[var(--error)] bg-[var(--surface)] p-4 text-sm text-[var(--error)]">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(loading
          ? ["", "", "", ""]
          : [
              `${stats.resumesCreated}`,
              `${stats.atsScore.toFixed(1)}%`,
              `${stats.jobsMatched}`,
              `${stats.applicationsSent}`,
            ]
        ).map((value, index) => {
          const cards = [
            { title: "Resumes Created", icon: FileText },
            { title: "ATS Score", icon: Target },
            { title: "Jobs Matched", icon: Briefcase },
            { title: "Applications Sent", icon: Send },
          ];

          const card = cards[index];
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--primary)]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              {loading ? (
                <div className="mt-4 h-8 w-24 animate-pulse rounded-md bg-[var(--surface-elevated)]" />
              ) : (
                <p className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
              )}
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Progress</h2>
          <span className="text-sm text-[var(--text-secondary)]">{Math.round(progressPercent)}% complete</span>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-2">
          {progressSteps.map((step, index) => (
            <div
              key={`${step.label}-segment`}
              className={
                index < completedStepCount
                  ? "h-2 rounded-full bg-[var(--primary)]"
                  : "h-2 rounded-full bg-[var(--surface-elevated)]"
              }
            />
          ))}
        </div>

        <ol className="grid gap-3 md:grid-cols-5">
          {progressSteps.map((step) => (
            <li
              key={step.label}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2"
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              ) : (
                <Circle className="h-4 w-4 text-[var(--text-muted)]" />
              )}
              <span
                className={step.completed ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}




