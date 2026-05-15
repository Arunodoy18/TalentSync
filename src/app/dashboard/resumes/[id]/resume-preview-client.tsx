"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit3, Loader2, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import IITTemplate from "@/components/resume/templates/IITTemplate";
import JakesTemplate from "@/components/resume/templates/JakesTemplate";
import { createClient } from "@/lib/supabase-browser";

const IIT_LOGO_URL = "/logos/smit-seal.svg";

type ResumeRecord = {
  id: string;
  title?: string | null;
  template_type?: string | null;
  data?: Record<string, unknown> | null;
  content?: Record<string, unknown> | null;
  ats_score?: number | null;
  target_job_id?: string | null;
};

export default function ResumePreviewClient({ resume }: { resume: ResumeRecord }) {
  const supabase = React.useMemo(() => createClient(), []);
  const resumeRef = useRef<HTMLDivElement>(null);

  const templateType = resume.template_type === "iit" ? "iit" : "jakes";
  const resumeData = resume.data ?? resume.content ?? {};
  const nameFromData =
    templateType === "iit"
      ? (resumeData as { fullName?: string }).fullName
      : (resumeData as { name?: string }).name;

  const [title, setTitle] = useState(resume.title || "Untitled Resume");
  const [draftTitle, setDraftTitle] = useState(resume.title || "Untitled Resume");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isCheckingAts, setIsCheckingAts] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(resume.ats_score ?? null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const templateNode = useMemo(() => {
    if (templateType === "iit") {
      return <IITTemplate data={resumeData} logoUrl={IIT_LOGO_URL} />;
    }
    return <JakesTemplate data={resumeData} />;
  }, [resumeData, templateType]);

  const handleSaveTitle = async () => {
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === title) {
      setDraftTitle(title);
      setIsEditingTitle(false);
      return;
    }

    if (!supabase) {
      setStatusMessage("Supabase is not configured. Check your environment variables.");
      return;
    }

    setIsSavingTitle(true);
    try {
      const { error } = await supabase
        .from("resumes")
        .update({ title: trimmed, updated_at: new Date().toISOString() })
        .eq("id", resume.id);

      if (error) throw error;
      setTitle(trimmed);
      setDraftTitle(trimmed);
      setStatusMessage("Title updated.");
      setIsEditingTitle(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update title.";
      setStatusMessage(message);
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCheckAts = async () => {
    setIsCheckingAts(true);
    setStatusMessage(null);

    try {
      let response: Response | null = null;

      if (resume.target_job_id) {
        response = await fetch("/api/ats/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: resume.id, jobId: resume.target_job_id }),
        });
      } else {
        response = await fetch(`/api/resume/${resume.id}/ats`, { method: "POST" });
      }

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Failed to calculate ATS score.");
      }

      const data = await response.json();
      const nextScore =
        data?.overall ??
        data?.score ??
        data?.resume?.ats_score ??
        data?.resume?.atsScore ??
        null;

      if (typeof nextScore === "number") {
        setAtsScore(nextScore);
      }
      setStatusMessage("ATS score updated.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to calculate ATS score.";
      setStatusMessage(message);
    } finally {
      setIsCheckingAts(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const filenameBase = (nameFromData || title || "resume").replace(/\s+/g, "-");

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filenameBase}-resume.pdf`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate PDF.";
      setStatusMessage(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/r/${resume.id}`;
      if (!navigator.clipboard) {
        setStatusMessage("Clipboard access is not available.");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage("Share link copied to clipboard.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to copy share link.";
      setStatusMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-6 py-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white/95 p-4 shadow-sm">
          <div className="flex flex-1 items-center gap-4">
            <Link
              href="/dashboard/resumes"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--text)]"
              aria-label="Back to resumes"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-col">
              {isEditingTitle ? (
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSaveTitle();
                    if (event.key === "Escape") {
                      setDraftTitle(title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-[280px] rounded-md border border-[var(--border)] bg-white px-3 py-2 text-base font-semibold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-left text-lg font-semibold text-[var(--text)] hover:text-[var(--primary)]"
                >
                  {title || "Untitled Resume"}
                </button>
              )}
              <span className="text-xs text-[var(--text-muted)]">
                {isSavingTitle ? "Saving title..." : atsScore !== null ? `ATS ${Number(atsScore).toFixed(0)}` : "ATS not checked yet"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/resumes/builder?id=${resume.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)]"
            >
              <Edit3 className="h-4 w-4" />
              Edit Resume
            </Link>
            <button
              type="button"
              onClick={handleCheckAts}
              disabled={isCheckingAts}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
            >
              {isCheckingAts ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Check ATS Score
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)]"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text-muted)]">
            {statusMessage}
          </div>
        ) : null}

        <div className="flex w-full justify-center">
          <div
            ref={resumeRef}
            className="w-[816px] rounded-[12px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.15)]"
          >
            <div className="flex justify-center">{templateNode}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
