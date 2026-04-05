import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

async function getShareResult(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ats_share_results")
    .select("score, breakdown, missing_skills, suggestions, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getShareResult(id);

  if (!data) {
    return {
      title: "Shared ATS Report | TalentSync",
      description: "ATS report shared from TalentSync.",
    };
  }

  const score = Math.round(Number(data.score));
  const description = `ATS Score: ${score}%. Improve your resume with TalentSync AI optimization.`;

  return {
    title: `ATS Score ${score}% | TalentSync Shared Report`,
    description,
    openGraph: {
      title: `ATS Score ${score}% | TalentSync`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `ATS Score ${score}% | TalentSync`,
      description,
    },
  };
}

export default async function AtsSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShareResult(id);

  if (!data) {
    notFound();
  }

  return (
    <main className="app-backdrop min-h-screen px-6 py-20">
      <div className="app-surface mx-auto max-w-4xl p-8">
        <h1 className="text-4xl font-black text-[#212529]">Shared ATS Report</h1>
        <p className="mt-2 text-[#6b7280]">Generated on {new Date(data.created_at).toLocaleString()}</p>

        <div className="app-soft-surface mt-8 p-6">
          <p className="text-sm text-[#6b7280]">Overall ATS Score</p>
          <p className="text-5xl font-black text-[#003893]">{Math.round(Number(data.score))}%</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Object.entries((data.breakdown as Record<string, number>) || {}).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-[#e5e7eb] p-4">
              <p className="text-xs uppercase tracking-wider text-[#6b7280]">{key}</p>
              <p className="text-2xl font-bold text-[#212529]">{Math.round(Number(value || 0))}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#6b7280]">Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              {(data.missing_skills || []).slice(0, 12).map((skill: string) => (
                <span key={skill} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#6b7280]">Top Suggestions</p>
            <div className="space-y-2">
              {(data.suggestions || []).slice(0, 5).map((suggestion: string, idx: number) => (
                <div key={`${idx}-${suggestion}`} className="flex items-start gap-2 text-sm text-[#374151]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-[#d6dce8] bg-[#eef3ff] p-5">
          <h2 className="text-xl font-bold text-[#212529]">Want a stronger result?</h2>
          <p className="mt-1 text-sm text-[#4b5563]">Use TalentSync to refine your resume faster, match stronger roles, and improve ATS performance.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/?next=/dashboard" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#003893] px-5 font-semibold text-white hover:opacity-90">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex h-11 items-center rounded-full border border-[#003893] px-5 font-semibold text-[#003893] hover:bg-[#00389308]">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}



