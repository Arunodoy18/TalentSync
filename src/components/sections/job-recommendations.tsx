"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, MapPin, ExternalLink, Sparkles, Building2 } from "lucide-react";
import TailorButton from "./tailor-button";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  url: string;
  similarity: number;
  explainability?: {
    missing_skills: string[];
  };
}

interface JobRecommendationsProps {
  resumeId: string;
}

const JobRecommendations = ({ resumeId }: JobRecommendationsProps) => {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[] | null>(null);

  const findJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to match jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-indigo-100">
              <Sparkles className="h-5 w-5" />
              AI Job Recommendations
            </CardTitle>
            <CardDescription>Top roles matched to your specific profile.</CardDescription>
          </div>
          {!jobs && (
            <Button 
              onClick={findJobs} 
              disabled={loading}
              className="h-[44px] rounded-[14px] border border-[rgba(129,140,248,0.5)] bg-[rgba(99,102,241,0.22)] text-indigo-100 hover:bg-[rgba(99,102,241,0.35)]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find My Best Match
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading && !jobs && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-300" />
            <p>Matching your resume with thousands of jobs...</p>
          </div>
        )}

        {!loading && !jobs && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)]">
              <Briefcase className="h-8 w-8 text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">Discover Matching Jobs</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Our semantic matching engine finds the best roles for you beyond just keywords.
            </p>
          </div>
        )}

        {jobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="group rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] p-4 transition-all hover:-translate-y-1 hover:border-[rgba(129,140,248,0.4)] hover:bg-[rgba(99,102,241,0.12)]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-[var(--text)] transition-colors group-hover:text-indigo-200">{job.title}</h4>
                    <p className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1">
                       <Building2 className="h-3 w-3" />
                       {job.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full border border-[rgba(129,140,248,0.5)] bg-[rgba(99,102,241,0.22)] px-2 py-1 text-xs font-semibold text-indigo-100">
                       {Math.round(job.similarity * 100)}% Match
                    </span>
                  </div>
                </div>
                
                <div className="mb-4 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                   <span className="flex items-center gap-1">
                     <MapPin className="h-3 w-3" />
                     {job.location}
                   </span>
                   <span>•</span>
                   <span>{job.job_type}</span>
                   {job.salary_range && (
                      <>
                        <span>•</span>
                        <span>{job.salary_range}</span>
                      </>
                   )}
                </div>

                {job.explainability?.missing_skills && job.explainability.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Missing Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.explainability.missing_skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="rounded border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 text-[10px] text-indigo-400 capitalize">
                          {skill}
                        </span>
                      ))}
                      {job.explainability.missing_skills.length > 5 && (
                        <span className="rounded border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 text-[10px] text-indigo-500/80">
                          +{job.explainability.missing_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="w-full text-xs font-semibold" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        Apply
                        <ExternalLink className="h-3 w-3" />
                      </a>
                   </Button>
                   <TailorButton 
                      resumeId={resumeId}
                      jobId={job.id}
                      jobTitle={job.title}
                   />
                </div>
              </div>
            ))}
          </div>
        )}

        {jobs && jobs.length === 0 && (
           <div className="text-center py-12 text-muted-foreground">
             <p>No jobs found with a high enough match. Try broadening your profile.</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobRecommendations;
