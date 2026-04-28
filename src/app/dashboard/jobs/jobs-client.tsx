"use client";

import { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, Sparkles, Zap, ExternalLink, Bookmark } from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer } from "@/components/ui/fade-in";

export default function JobsClient({ activeResume }: { activeResume: any }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);

  const fetchJobs = async () => {
    if (!activeResume) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeId: activeResume.id,
          q: search,
          location,
          remote
        })
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResume, remote]);

  // Handle Enter key for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchJobs();
    }
  };

  return (
    <StaggerContainer className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      <FadeIn className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Job Matches</h1>
          <p className="text-[var(--text-muted)] mt-2">Curated opportunities based on your skills and experience.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-60">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 h-[44px] rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/50 transition-all"
              placeholder="Roles, companies..."
            />
          </div>
          
          <div className="relative w-full lg:w-48">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 h-[44px] rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/50 transition-all"
              placeholder="Location..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text)] whitespace-nowrap cursor-pointer px-2">
            <input 
              type="checkbox" 
              checked={remote} 
              onChange={(e) => setRemote(e.target.checked)} 
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
            />
            Remote Only
          </label>

          <button onClick={fetchJobs} className="flex items-center justify-center h-[44px] px-6 rounded-[12px] bg-[var(--primary)] text-black font-medium hover:scale-105 transition-transform">
            Search
          </button>
        </div>
      </FadeIn>

      {!activeResume && (
        <FadeIn delay={0.2}>
          <div className="p-[24px] rounded-[12px] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--card)] border border-[var(--primary)]/30 flex flex-col md:flex-row items-center gap-6">
            <div className="h-12 w-12 rounded-[12px] bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold text-lg text-[var(--text)]">Upload your Master Resume</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">We need your skills and experience to find perfect job matches instantly.</p>
            </div>
            <Link href="/dashboard/resumes/upload">
              <button className="h-[44px] px-6 rounded-[12px] bg-[var(--primary)] text-black font-medium hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(142,182,155,0.2)]">
                Upload Resume
              </button>
            </Link>
          </div>
        </FadeIn>
      )}

      {activeResume && (
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-[12px] bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
              ))
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => {
                const matchLabel = Math.round(job.match_score || 0);
                const isHighMatch = matchLabel >= 75;
                const isMediumMatch = matchLabel >= 50 && matchLabel < 75;
                const matchColorText = isHighMatch ? 'text-[var(--success)]' : isMediumMatch ? 'text-[var(--warning)]' : 'text-[var(--error)]';
                const matchColorBg = isHighMatch ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : isMediumMatch ? 'bg-[var(--warning)]/10 border-[var(--warning)]/30' : 'bg-[var(--error)]/10 border-[var(--error)]/30';
                
                return (
                  <div key={job.id} className="flex flex-col p-6 rounded-[12px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors group relative overflow-hidden h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 py-1 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-[var(--text-primary)] line-clamp-1">{job.title}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-0.5 max-w-[180px] truncate">{job.company}</p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${matchColorBg}`}>
                        <Zap className={`h-3 w-3 ${matchColorText}`} />
                        <span className={`text-xs font-bold ${matchColorText}`}>{matchLabel}%</span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-xs text-[var(--text-secondary)] mb-4">
                      <div className="flex items-center gap-1 font-medium bg-[var(--surface-elevated)] px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{job.location || "Remote"}</span>
                      </div>
                      {(job.source || job.url?.includes('adzuna')) && (
                        <div className="px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-bold capitalize tracking-wider">
                          {job.source || (job.url?.includes('adzuna') ? 'Adzuna' : 'LinkedIn')}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-6 flex-1 whitespace-pre-line">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[var(--border)]">
                      <button 
                        onClick={() => window.open(job.url || "#", "_blank")}
                        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors"
                      >
                         Apply <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {/* Save job logic placeholder */}}
                        className="flex items-center justify-center gap-2 h-10 rounded-lg border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Bookmark className="h-4 w-4" /> Save
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center border border-dashed border-[var(--border)] rounded-2xl">
                <Briefcase className="h-12 w-12 text-[var(--text-muted)] opacity-30 mx-auto mb-4" />
                <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Job Matches Found</p>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  Try adjusting your search filters or check back later for new opportunities.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </StaggerContainer>
  );
}