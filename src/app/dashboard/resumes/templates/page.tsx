"use client";

import Link from "next/link";
import { LayoutTemplate, ChevronRight } from "lucide-react";

const templateCards = [
  {
    id: "iit",
    title: "IIT Guwahati Template",
    description: "Academic-first layout with dense achievements and structured sections.",
    href: "/dashboard/resumes/builder?entry=template&template=iit",
    previewTitle: "IIT Guwahati Resume",
  },
  {
    id: "jake",
    title: "Jake's Resume Template",
    description: "FAANG-style modern layout with project-heavy impact storytelling.",
    href: "/dashboard/resumes/builder?entry=template&template=jake",
    previewTitle: "Jake's Resume",
  },
] as const;

export default function ResumeTemplatesPage() {
  return (
    <main className="flex-1 max-w-[1400px] mx-auto w-full space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Choose Resume Template</h1>
        <p className="text-[var(--text-muted)] mt-2">
          Select one of the two supported templates and continue to the builder.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {templateCards.map((template) => (
          <Link
            key={template.id}
            href={template.href}
            className="group rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(142,182,155,0.12)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">{template.title}</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{template.description}</p>
              </div>
              <div className="h-10 w-10 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                <LayoutTemplate className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-[var(--border)] bg-black/20 p-4">
              <div className="mx-auto h-48 max-w-[340px] rounded-md border border-black/30 bg-white text-black p-3 overflow-hidden">
                <div className="text-center text-[10px] font-bold uppercase tracking-wide">{template.previewTitle}</div>
                <div className="mt-2 h-[2px] w-full bg-black/40" />
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-2/3 bg-black/30 rounded" />
                  <div className="h-2 w-full bg-black/20 rounded" />
                  <div className="h-2 w-5/6 bg-black/20 rounded" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-1/2 bg-black/30 rounded" />
                  <div className="h-2 w-full bg-black/20 rounded" />
                  <div className="h-2 w-4/5 bg-black/20 rounded" />
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center text-sm font-semibold text-[var(--primary)] group-hover:translate-x-1 transition-transform">
              Use this template <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm text-[var(--text-muted)]">
          Want AI-first generation instead? Use
          <Link href="/dashboard/resumes/builder?entry=ai" className="text-[var(--primary)] font-semibold ml-1">
            Build with AI
          </Link>
          .
        </p>
      </div>
    </main>
  );
}




