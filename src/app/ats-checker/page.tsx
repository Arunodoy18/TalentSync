"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Target, Sparkles, ArrowRight, Loader2 } from "lucide-react";

const SCORE_WIDTH_CLASS: Array<{ min: number; className: string }> = [
  { min: 95, className: "w-[95%]" },
  { min: 90, className: "w-[90%]" },
  { min: 85, className: "w-[85%]" },
  { min: 80, className: "w-[80%]" },
  { min: 75, className: "w-[75%]" },
  { min: 70, className: "w-[70%]" },
  { min: 65, className: "w-[65%]" },
  { min: 60, className: "w-[60%]" },
  { min: 55, className: "w-[55%]" },
  { min: 50, className: "w-[50%]" },
  { min: 45, className: "w-[45%]" },
  { min: 40, className: "w-[40%]" },
  { min: 35, className: "w-[35%]" },
  { min: 30, className: "w-[30%]" },
  { min: 25, className: "w-[25%]" },
  { min: 20, className: "w-[20%]" },
  { min: 15, className: "w-[15%]" },
  { min: 10, className: "w-[10%]" },
  { min: 5, className: "w-[5%]" },
  { min: 0, className: "w-[0%]" },
];

function getScoreWidthClass(score: number): string {
  const clamped = Math.max(0, Math.min(100, score));
  return SCORE_WIDTH_CLASS.find((entry) => clamped >= entry.min)?.className || "w-[0%]";
}

export default function AtsCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    breakdown: {
      keywordMatch: number;
      experienceMatch: number;
      skillsMatch: number;
      educationMatch: number;
      formatting: number;
      metricsImpact: number;
    };
    missingSkills: string[];
    suggestions: string[];
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const score = result?.score ?? 78;
  const scoreWidthClass = getScoreWidthClass(score);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    setShareUrl(null);

    try {
      const response = await fetch("/api/public/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ATS check failed");
      }

      setResult(data);
    } catch (checkError: unknown) {
      const message = checkError instanceof Error ? checkError.message : "ATS check failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async () => {
    if (!result) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/public/ats-check/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: result.score,
          breakdown: result.breakdown,
          missingSkills: result.missingSkills,
          suggestions: result.suggestions,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create share link");

      const absolute = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(absolute);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absolute);
      }
    } catch (shareError: unknown) {
      const message = shareError instanceof Error ? shareError.message : "Failed to create share link";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-backdrop min-h-screen px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cdd8ee] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#003893]">
              <Sparkles className="h-3.5 w-3.5" />
              Free Lead Magnet
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight text-[#212529]">
              Free ATS Score Checker
            </h1>
            <p className="mt-4 text-lg text-[#6b7280] leading-relaxed">
              Paste your resume and job description to get an instant ATS-style analysis, skill gaps, and keyword recommendations.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Keyword match analysis in seconds",
                "Missing skills and priority gaps",
                "Actionable improvement suggestions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[#374151]">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/?next=/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#003893] px-6 font-semibold text-white hover:opacity-90"
              >
                Try It After Signup
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/billing"
                className="inline-flex h-12 items-center rounded-full border border-[#003893] px-6 font-semibold text-[#003893] hover:bg-[#00389308]"
              >
                View Plans
              </Link>
            </div>
          </div>

          <div className="app-surface p-8">
            <div className="mb-6 flex items-center gap-2 text-[#003893]">
              <Target className="h-5 w-5" />
              <h2 className="text-xl font-bold">Run Live ATS Check</h2>
            </div>

            <div className="space-y-5">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text"
                className="w-full min-h-[120px] rounded-xl border border-[#d6dce8] p-3 text-sm outline-none focus:border-[#003893]"
              />
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste target job description"
                className="w-full min-h-[120px] rounded-xl border border-[#d6dce8] p-3 text-sm outline-none focus:border-[#003893]"
              />

              <button
                onClick={runCheck}
                disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#003893] px-4 font-semibold text-white hover:opacity-90 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Analyzing..." : "Check ATS Score"}
              </button>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[#6b7280]">
                  <span>Overall ATS Score</span>
                  <span className="font-bold text-[#003893]">{score}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#e9edf6]">
                  <div className={`h-3 rounded-full bg-[#003893] ${scoreWidthClass}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#f8fafc] p-3">
                  <div className="text-[#6b7280]">Keyword Match</div>
                  <div className="text-xl font-bold text-[#212529]">{result?.breakdown?.keywordMatch ?? 82}</div>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-3">
                  <div className="text-[#6b7280]">Experience</div>
                  <div className="text-xl font-bold text-[#212529]">{result?.breakdown?.experienceMatch ?? 74}</div>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-3">
                  <div className="text-[#6b7280]">Skills</div>
                  <div className="text-xl font-bold text-[#212529]">{result?.breakdown?.skillsMatch ?? 69}</div>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-3">
                  <div className="text-[#6b7280]">Formatting</div>
                  <div className="text-xl font-bold text-[#212529]">{result?.breakdown?.formatting ?? 89}</div>
                </div>
              </div>

              {result?.missingSkills?.length ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.slice(0, 10).map((skill) => (
                      <span key={skill} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {result ? (
                <button
                  onClick={createShareLink}
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#003893] px-4 font-semibold text-[#003893] hover:bg-[#00389308] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Share Result
                </button>
              ) : null}

              {shareUrl ? (
                <div className="rounded-xl border border-[#d6dce8] bg-[#f8fafc] p-3 text-xs text-[#374151] break-all">
                  Share URL copied: {shareUrl}
                </div>
              ) : null}

              <p className="text-sm text-[#6b7280]">
                Upgrade to Pro to unlock deeper optimization and faster interview-ready improvements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}




