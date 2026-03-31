import { createClient } from "@/lib/supabase-server";
import { Search, Briefcase, MapPin, DollarSign, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          <h1 className="app-title text-3xl font-bold tracking-tight">Job Recommendations</h1>
          <p className="app-subtitle mt-1">Discover curated roles aligned to your profile and goals.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <Input 
            className="pl-10 h-[50px] rounded-[50px] border-[#e5e7eb]" 
            placeholder="Search jobs..." 
          />
        </div>
      </div>

      {!baseResume && (
        <div className="app-surface p-6 flex items-center gap-4">
          <Sparkles className="h-8 w-8 text-[#003893]" />
          <div>
            <h3 className="font-bold text-[#212529]">Upload your resume for better matches</h3>
            <p className="text-[#6b7280] text-sm">We'll use your skills and experience to find the perfect job for you.</p>
          </div>
          <Link href="/dashboard" className="ml-auto">
            <Button variant="outline" className="rounded-[50px] border-[#003893] text-[#003893] font-bold">
              Set Base Resume
            </Button>
          </Link>
        </div>
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
