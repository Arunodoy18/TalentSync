"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, FileText, LayoutTemplate, Sparkles } from "lucide-react";
import { ResumeCard } from "./resume-card";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import BuildWithAiModal from "./build-with-ai-modal";
import toast from "react-hot-toast";

export type ResumeListItem = {
  id: string;
  title?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_base?: boolean | null;
  template_type?: string | null;
  ats_score?: number | null;
  data?: Record<string, unknown> | null;
  content?: Record<string, unknown> | null;
};

export default function ResumesClient({ initialResumes }: { initialResumes: ResumeListItem[] }) {
  const [resumes, setResumes] = useState<ResumeListItem[]>(initialResumes);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const hasResumes = resumes.length > 0;

  const handleResumeCreated = (resume: ResumeListItem) => {
    setResumes((prev) => [resume, ...prev]);
    toast.success("Resume created successfully");
  };

  const resumeGrid = useMemo(
    () => (
      <div className="grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <StaggerItem key={resume.id}>
            <ResumeCard resume={resume} />
          </StaggerItem>
        ))}
      </div>
    ),
    [resumes]
  );

  return (
    <>
      <StaggerContainer className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
        <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Resumes</h1>
            <p className="text-[var(--text-muted)] mt-2">
              Create ATS-proof resumes and manage your Master Vault.
            </p>
          </div>
        </FadeIn>

        {/* CORE CREATION OPTIONS */}
        <div className="grid gap-[24px] md:grid-cols-2">
          {/* OPTION 1: CHOOSE TEMPLATE */}
          <StaggerItem>
            <Link
              href="/dashboard/resumes/templates"
              className="group relative flex flex-col justify-between p-[32px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(142,182,155,0.1)] min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-[12px] bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] mb-4">
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">Choose Template</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Select our IIT Template or Jake&apos;s FAANG-level layouts. Pick which projects and experiences from your Master Vault to inject.
                </p>
              </div>
              <div className="relative z-10 flex items-center text-[var(--primary)] text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                Start Structuring <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </StaggerItem>

          {/* OPTION 2: BUILD WITH AI */}
          <StaggerItem>
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="group relative flex w-full flex-col justify-between p-[32px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all hover:border-[var(--text)] hover:shadow-lg min-h-[220px] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text)] mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">Build with AI</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Upload any resume as a format reference and let the AI rebuild it using your own data.
                </p>
              </div>
              <div className="relative z-10 flex items-center text-[var(--text)] text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                Start Generating <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </button>
          </StaggerItem>
        </div>

        {/* EXISTING RESUMES LIST */}
        <FadeIn className="mt-[48px] space-y-[24px]" delay={0.2}>
          <h2 className="text-xl font-semibold text-[var(--text)]">Your Document Vault</h2>
          {resumeGrid}

          {!hasResumes ? (
            <StaggerItem>
              <div className="p-[48px] rounded-[12px] bg-[var(--card)] border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-[var(--text-muted)] opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)] mb-3">No Resume Created Yet</h3>
                <p className="text-sm text-[var(--text-muted)] mb-8 max-w-md mx-auto leading-relaxed">
                  Create your ATS-optimized resume using our IIT template or Jake template,
                  or build one with AI.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/dashboard/resumes/templates">
                    <button className="h-[44px] px-6 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(142,182,155,0.2)]">
                      Create Resume
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsAiOpen(true)}
                    className="h-[44px] px-6 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text)] text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Build with AI
                  </button>
                </div>
              </div>
            </StaggerItem>
          ) : null}
        </FadeIn>
      </StaggerContainer>

      <BuildWithAiModal
        open={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onResumeCreated={handleResumeCreated}
      />
    </>
  );
}
