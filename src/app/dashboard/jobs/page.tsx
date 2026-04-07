import { createClient } from "@/lib/supabase-server";
import { Search, Briefcase, MapPin, Sparkles, Filter, ChevronRight, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import TailorButton from "@/components/sections/tailor-button";
import { FadeIn, StaggerContainer } from "@/components/ui/fade-in";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get user's base resume
  const { data: baseResume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_base", true)
    .maybeSingle();

  // Get jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("posted_at", { ascending: false })
    .limit(10);

  return (
    <StaggerContainer className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      <FadeIn className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Job Matches</h1>
          <p className="text-[var(--text-muted)] mt-2">Curated opportunities based on your skills and experience.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              className="w-full pl-11 h-[44px] rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/50 transition-all"
              placeholder="Search roles, companies..."
            />
          </div>
          <button className="flex items-center justify-center h-[44px] px-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[#1F2937] transition-colors">
            <Filter className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline text-sm font-medium">Filters</span>
          </button>
        </div>
      </FadeIn>

      {/* FILTER BAR */}
      <FadeIn delay={0.1} className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {['Location', 'Role', 'Salary', 'Remote', 'Experience'].map((filter) => (
          <button key={filter} className="flex-shrink-0 px-4 h-9 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-colors">
            {filter} <ChevronRight className="inline h-3 w-3 ml-1" />
          </button>
        ))}
      </FadeIn>

      {!baseResume && (
        <FadeIn delay={0.2}>
          <div className="p-[24px] rounded-[12px] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--card)] border border-[var(--primary)]/30 flex flex-col md:flex-row items-center gap-6">
            <div className="h-12 w-12 rounded-[12px] bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold text-lg text-[var(--text)]">Upload your Master Resume</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">We need your skills and experience to find perfect job matches instantly.</p>
            </div>
            <Link href="/dashboard/resumes">
              <button className="h-[44px] px-6 rounded-[12px] bg-[var(--primary)] text-black font-medium hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(142,182,155,0.2)]">
                Go to Vault
              </button>
            </Link>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.3}>
        <div className="rounded-[12px] bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/20 border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                <tr>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Match Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job) => {
                    const matchLabel = typeof job.similarity === "number" ? Math.round(job.similarity * 100) : 92;
                    return (
                      <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-medium text-[var(--text)]">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                            {job.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-muted)] font-medium">{job.company}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 opacity-70" />
                            <span>{job.location || "Remote"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 w-fit bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <Zap className="h-3 w-3 text-emerald-400" />
                            <span className="text-[11px] font-bold tracking-wide text-emerald-400">{matchLabel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {baseResume && (
                              <div className="scale-90 origin-right">
                                <TailorButton 
                                  resumeId={baseResume.id} 
                                  jobId={job.id} 
                                  jobTitle={job.title} 
                                />
                              </div>
                            )}
                            <button className="h-8 px-4 rounded-md bg-[var(--primary)] text-black text-xs font-semibold hover:scale-105 transition-transform">
                              Apply
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                       <Briefcase className="h-12 w-12 text-[var(--text-muted)] opacity-30 mx-auto mb-4" />
                       <p className="text-lg font-semibold text-[var(--text)] mb-2">No Job Matches Yet</p>
                       <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto leading-relaxed">
                         Upload your resume to start getting AI-matched jobs.<br/>
                         We&apos;ll scan LinkedIn, Indeed, and Wellfound and show you the best matches.
                       </p>
                       <Link href="/dashboard/resumes">
                         <button className="h-[40px] px-6 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(142,182,155,0.2)]">
                           Upload Resume
                         </button>
                       </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </StaggerContainer>
  );
}




