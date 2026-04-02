import { createClient } from "@/lib/supabase-server";
import { Search, Briefcase, MapPin, DollarSign, Sparkles, Building2 } from "lucide-react";    
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import TailorButton from "@/components/sections/tailor-button";

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
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-100">Job Recommendations</h1> 
          <p className="mt-2 text-lg text-indigo-300/80">Discover curated roles aligned to your profile and goals.</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            className="pl-11 h-[48px] rounded-[18px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] focus:bg-[rgba(255,255,255,0.05)] text-indigo-100 placeholder:text-indigo-400/50"
            placeholder="Search thousands of jobs..."
          />
        </div>
      </div>

      {!baseResume && (
        <Card className="p-0 border-[rgba(99,102,241,0.3)] bg-gradient-to-r from-[rgba(99,102,241,0.15)] to-[rgba(11,15,26,0.3)] shadow-[0_0_40px_rgba(99,102,241,0.1)]">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-[rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.4)] flex items-center justify-center shadow-inner">
              <Sparkles className="h-7 w-7 text-indigo-300" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-xl text-indigo-100">Upload your resume for AI matches</h3>
              <p className="text-indigo-300/80 text-sm mt-1">Our engine uses your skills and experience to find the perfect job for you instantly.</p>
            </div>
            <Link href="/dashboard" className="w-full md:w-auto">
              <Button variant="outline" className="w-full rounded-[14px] border-[rgba(99,102,241,0.5)] bg-[rgba(99,102,241,0.1)] text-indigo-200 hover:bg-[rgba(99,102,241,0.25)] hover:text-white font-semibold">
                Set Base Resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => {
            const matchLabel =
              typeof job.similarity === "number"
                ? `${Math.round(job.similarity * 100)}% Match`
                : "AI Match";

            return (
            <div 
              key={job.id}
              className="app-surface p-6 hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-8 w-8 text-[#d1d5db]" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-[#212529]">{job.title}</h3>
                  <div className="flex items-center gap-2 bg-[#00389310] px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3 text-[#003893]" />
                    <span className="text-xs font-bold text-[#003893]">{matchLabel}</span>
                  </div>
                </div>
                
                <p className="font-semibold text-[#003893] mb-4">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-[#6b7280] mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary_range || "Competitive"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.job_type || "Full-time"}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {baseResume && (
                    <TailorButton 
                      resumeId={baseResume.id} 
                      jobId={job.id} 
                      jobTitle={job.title} 
                    />
                  )}
                  <Button variant="outline" className="rounded-[50px] px-6 h-10 border-[#e5e7eb] font-bold">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
            );
          })
        ) : (
           <div className="app-surface border-dashed border-2 flex flex-col items-center justify-center py-20">
             <Briefcase className="h-16 w-16 text-[#d1d5db] mb-4" />
             <p className="text-lg font-medium text-[#6b7280]">No jobs found yet</p>
             <p className="text-[#6b7280]">We're scanning for new opportunities...</p>
          </div>
        )}
      </div>
    </div>
  );
}
