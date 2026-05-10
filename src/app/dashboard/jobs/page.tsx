'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type JobMatch = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: string;
  applyUrl: string;
  source: "Adzuna" | "LinkedIn" | "Internshala";
  matchScore: number;
  matchedSkills: string[];
  postedDate: string;
};

type Suggestion = { label: string; role: string; city: string };

const suggestions: Suggestion[] = [
  { label: "SDE 1 • Bangalore", role: "SDE 1", city: "Bangalore" },
  { label: "Backend Engineer • Pune", role: "Backend Engineer", city: "Pune" },
  { label: "ML Engineer • Hyderabad", role: "ML Engineer", city: "Hyderabad" },
  { label: "Frontend Developer • Remote", role: "Frontend Developer", city: "Remote" },
  { label: "Full Stack • Mumbai", role: "Full Stack", city: "Mumbai" },
  { label: "DevOps • Bangalore", role: "DevOps", city: "Bangalore" },
];

const sourceStyles: Record<string, string> = {
  Adzuna: "bg-blue-500/15 text-blue-200 border-blue-500/40",
  LinkedIn: "bg-sky-500/15 text-sky-200 border-sky-500/40",
  Internshala: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
};

function getMatchBadge(score: number) {
  if (score > 80) {
    return "bg-emerald-500/20 text-emerald-200 border-emerald-400/50";
  }
  if (score >= 60) {
    return "bg-amber-500/20 text-amber-200 border-amber-400/50";
  }
  return "bg-red-500/20 text-red-200 border-red-400/50";
}

export default function JobsPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [jobTypeFilter, setJobTypeFilter] = useState({
    fullTime: false,
    internship: false,
    contract: false,
  });
  const [experienceFilter, setExperienceFilter] = useState<"" | "fresher" | "1-3" | "3-5">("");
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [sourceFilter, setSourceFilter] = useState({
    Adzuna: true,
    LinkedIn: true,
    Internshala: true,
  });

  useEffect(() => {
    let isMounted = true;
    const loadResumeSkills = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data: resume } = await supabase
        .from("resumes")
        .select("data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const rawSkills = Array.isArray(resume?.data?.skills) ? resume.data.skills : [];
      const normalizedSkills = rawSkills
        .map((skill: any) => (typeof skill === "string" ? skill : skill?.name))
        .filter((skill: string | undefined) => Boolean(skill));

      if (isMounted) {
        setResumeSkills(normalizedSkills);
      }
    };

    loadResumeSkills();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSearch = useCallback(
    async (nextRole?: string, nextCity?: string) => {
      const roleValue = (nextRole ?? role).trim();
      const cityValue = (nextCity ?? city).trim();
      setHasSearched(true);
      setErrorMessage(null);

      if (!roleValue || !cityValue) {
        setErrorMessage("Please enter both role and city.");
        setJobs([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/jobs/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: roleValue, city: cityValue, resumeSkills }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data?.error || "Failed to fetch jobs.");
          setJobs([]);
        } else {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (error) {
        console.error("Job fetch error:", error);
        setErrorMessage("Failed to fetch jobs. Please try again.");
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [role, city, resumeSkills]
  );

  const handleSuggestion = (suggestion: Suggestion) => {
    setRole(suggestion.role);
    setCity(suggestion.city);
    handleSearch(suggestion.role, suggestion.city);
  };

  const filteredJobs = useMemo(() => {
    const activeJobTypes = Object.entries(jobTypeFilter)
      .filter(([, isActive]) => isActive)
      .map(([key]) => key);

    const hasJobTypeFilter = activeJobTypes.length > 0;
    const hasSourceFilter = Object.values(sourceFilter).some(Boolean);

    return jobs.filter((job) => {
      const normalizedType = (job.jobType || "").toLowerCase();
      const normalizedText = `${job.title} ${job.description}`.toLowerCase();

      const jobTypeMatch = !hasJobTypeFilter || (
        (jobTypeFilter.fullTime && normalizedType.includes("full")) ||
        (jobTypeFilter.internship && (normalizedType.includes("intern") || normalizedText.includes("intern"))) ||
        (jobTypeFilter.contract && normalizedType.includes("contract"))
      );

      const experienceMatch = experienceFilter === "" ||
        (experienceFilter === "fresher" && /fresher|entry|graduate|0-1/.test(normalizedText)) ||
        (experienceFilter === "1-3" && /1\s*-\s*3|2\s*-\s*3|1\s*to\s*3/.test(normalizedText)) ||
        (experienceFilter === "3-5" && /3\s*-\s*5|4\s*-\s*5|3\s*to\s*5/.test(normalizedText));

      const scoreMatch = (job.matchScore ?? 0) >= minMatchScore;
      const salaryMatch = !salaryOnly || (job.salary && job.salary !== "Not disclosed");
      const sourceMatch = !hasSourceFilter || (sourceFilter[job.source] ?? false);

      return jobTypeMatch && experienceMatch && scoreMatch && salaryMatch && sourceMatch;
    });
  }, [jobs, jobTypeFilter, experienceFilter, minMatchScore, salaryOnly, sourceFilter]);

  const toggleJobDetails = (jobId: string) => {
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const handleApply = (job: JobMatch) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB] px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#F9FAFB]">Find Jobs</h1>
            <p className="text-sm text-gray-400 mt-2">Search India roles and match using your resume skills.</p>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE 1, Backend Engineer, ML Engineer"
                  className="pl-9 bg-[#0F172A] border-[#1F2937]"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore, Pune, Mumbai, Remote"
                  className="pl-9 bg-[#0F172A] border-[#1F2937]"
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="h-[44px] bg-[#D4AF37] text-black font-semibold hover:bg-[#B89A32]"
              >
                {isLoading ? "Searching..." : "Find Jobs"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1 rounded-full border border-[#1F2937] bg-[#0F172A] text-sm text-gray-300 hover:text-white hover:border-[#D4AF37]"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72">
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-xl mb-4"
            >
              <span className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </span>
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <div className={`${filtersOpen ? "block" : "hidden"} lg:block bg-[#111827] border border-[#1F2937] rounded-2xl p-5 space-y-6`}>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-200">Job Type</h3>
                {([
                  { key: "fullTime", label: "Full-time" },
                  { key: "internship", label: "Internship" },
                  { key: "contract", label: "Contract" },
                ] as const).map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={jobTypeFilter[item.key]}
                      onChange={(e) => setJobTypeFilter((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-[#1F2937] accent-[#D4AF37]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-200">Experience</h3>
                {([
                  { value: "fresher", label: "Fresher" },
                  { value: "1-3", label: "1-3 yrs" },
                  { value: "3-5", label: "3-5 yrs" },
                ] as const).map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="radio"
                      name="experience"
                      checked={experienceFilter === item.value}
                      onChange={() => setExperienceFilter(item.value)}
                      className="h-4 w-4 rounded-full border-[#1F2937] accent-[#D4AF37]"
                    />
                    {item.label}
                  </label>
                ))}
                <button
                  onClick={() => setExperienceFilter("")}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-200">Min Match Score</h3>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
                <div className="text-xs text-gray-400">{minMatchScore}% and above</div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={salaryOnly}
                    onChange={(e) => setSalaryOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-[#1F2937] accent-[#D4AF37]"
                  />
                  Show only disclosed salaries
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-200">Source</h3>
                {([
                  { key: "Adzuna", label: "Adzuna" },
                  { key: "LinkedIn", label: "LinkedIn" },
                  { key: "Internshala", label: "Internshala" },
                ] as const).map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={sourceFilter[item.key]}
                      onChange={(e) => setSourceFilter((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-[#1F2937] accent-[#D4AF37]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 space-y-6">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-400/40 text-red-200 rounded-xl px-4 py-3 text-sm">
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-64 rounded-2xl bg-[#111827] border border-[#1F2937] animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => {
                  const score = Math.round(job.matchScore || 0);
                  const badgeStyle = getMatchBadge(score);
                  const sourceStyle = sourceStyles[job.source] || "bg-slate-500/15 text-slate-200 border-slate-400/40";
                  const initials = job.company?.trim()?.[0] || job.title?.trim()?.[0] || "?";
                  const matchedSkills = (job.matchedSkills || []).slice(0, 4);
                  const isExpanded = expandedJobs[job.id];

                  return (
                    <div key={job.id} className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#1F2937] flex items-center justify-center text-sm font-semibold text-[#D4AF37]">
                            {initials.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-base font-semibold text-white">{job.title}</div>
                            <div className="text-sm text-gray-400">{job.company}</div>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${badgeStyle}`}>
                          {score}%
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        <div className="flex items-center gap-1 bg-[#0F172A] px-2 py-1 rounded-full border border-[#1F2937]">
                          <MapPin className="h-3 w-3" />
                          {job.location || "Remote"}
                        </div>
                        <span className={`px-2 py-1 rounded-full border ${sourceStyle}`}>{job.source}</span>
                        <span className="px-2 py-1 rounded-full border border-[#1F2937] text-gray-300">
                          {job.salary || "Not disclosed"}
                        </span>
                      </div>

                      <div className={`text-sm text-gray-300 ${isExpanded ? "" : "line-clamp-3"}`}>
                        {job.description}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.length > 0 ? (
                          matchedSkills.map((skill) => (
                            <span key={skill} className="px-2 py-1 rounded-full bg-[#0F172A] border border-[#1F2937] text-xs text-gray-300">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No matched skills listed</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Posted {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : "Recently"}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="h-9 border-[#1F2937] text-gray-200 hover:bg-[#0F172A]"
                            onClick={() => toggleJobDetails(job.id)}
                          >
                            View Details
                          </Button>
                          <Button
                            className="h-9 bg-[#D4AF37] text-black hover:bg-[#B89A32]"
                            onClick={() => handleApply(job)}
                          >
                            Apply Now <ExternalLink className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              hasSearched && (
                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-10 text-center space-y-3">
                  <Briefcase className="h-10 w-10 text-gray-500 mx-auto" />
                  <div className="text-lg font-semibold">No jobs found for {role || "your role"} in {city || "your city"}</div>
                  <div className="text-sm text-gray-400">Try: SDE 1, Software Engineer, Backend Developer</div>
                  <Button
                    variant="outline"
                    className="border-[#1F2937] text-gray-200 hover:bg-[#0F172A]"
                    onClick={() => handleSearch()}
                  >
                    Retry Search
                  </Button>
                </div>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  );
}




