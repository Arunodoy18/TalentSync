import { createClient } from "@/lib/supabase-server";
import { Plus, FileText, LayoutGrid, List, Briefcase, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/sections/resume-upload";
import CareerRoadmap from "@/components/sections/career-roadmap";
import SkillGap from "@/components/sections/skill-gap";
import JobRecommendations from "@/components/sections/job-recommendations";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", user.id);

  const baseResumeId = resumes?.find(r => r.is_base)?.id || resumes?.[0]?.id;

  const stats = [
    { label: "Resumes", value: resumes?.length || 0, icon: FileText, color: "text-blue-600" },
    { label: "Applications", value: applications?.length || 0, icon: Briefcase, color: "text-green-600" },
    { label: "Match Rate", value: "92%", icon: Sparkles, color: "text-purple-600" },
    { label: "Avg. ATS Score", value: "85", icon: LayoutGrid, color: "text-orange-600" },
  ];

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#212529]">TalentSync Dashboard</h1>
          <p className="text-muted-foreground mt-1">AI Career Operating System. From skills to job automatically.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/pricing"
            className="bg-white text-[#003893] border border-[#003893] px-5 h-[50px] rounded-[50px] font-semibold flex items-center gap-2 hover:bg-[#00389308] transition-all"
          >
            Upgrade Plan
          </Link>
          <Link 
            href="/ats-checker"
            className="bg-white text-[#003893] border border-[#d1d5db] px-5 h-[50px] rounded-[50px] font-semibold flex items-center gap-2 hover:bg-[#f3f4f6] transition-all"
          >
            ATS Checker
          </Link>
          <ResumeUpload />
          <Link 
            href="/dashboard/resumes/new"
            className="bg-[#003893] text-white px-6 h-[50px] rounded-[50px] font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Create New Resume
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[24px] border border-[#e5e7eb] flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6b7280]">{stat.label}</p>
              <p className="text-2xl font-bold text-[#212529]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <h2 className="text-xl font-bold text-[#212529] flex items-center gap-2">
             <FileText className="h-5 w-5 text-[#003893]" />
             My Resumes
           </h2>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* New Resume Card */}
              <Link 
                href="/dashboard/resumes/new"
                className="group border-2 border-dashed border-[#d1d5db] rounded-[24px] p-6 flex flex-col items-center justify-center gap-4 hover:border-[#003893] hover:bg-[#00389305] transition-all min-h-[300px]"
              >
                <div className="h-14 w-14 rounded-full bg-[#f3f4f6] flex items-center justify-center group-hover:bg-[#00389310] group-hover:text-[#003893] transition-colors">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="text-lg font-bold text-[#6b7280] group-hover:text-[#003893]">Create New Resume</span>
              </Link>

              {/* Resume Cards */}
              {resumes?.map((resume) => (
                <div 
                  key={resume.id}
                  className="group bg-white border border-[#e5e7eb] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col min-h-[300px]"
                >
                  <div className="flex-1 bg-[#f3f4f6] flex items-center justify-center p-8 relative">
                    <FileText className="h-20 w-20 text-[#d1d5db] group-hover:text-[#003893] group-hover:scale-110 transition-all duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Resume options"
                        aria-label="Resume options"
                        className="h-8 w-8 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f3f4f6]"
                      >
                        <LayoutGrid className="h-4 w-4 text-[#6b7280]" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-1">
                    <h3 className="font-bold text-[#212529] truncate">{resume.title || "Untitled Resume"}</h3>
                    <div className="flex items-center justify-between text-xs text-[#6b7280]">
                      <span>Edited {new Date(resume.updated_at).toLocaleDateString()}</span>
                      <Link 
                        href={`/dashboard/resumes/${resume.id}`}
                        className="text-[#003893] font-bold hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
           </div>
           
           {baseResumeId && (
              <div className="grid gap-8 lg:grid-cols-2">
                 <SkillGap resumeId={baseResumeId} />
                 <JobRecommendations resumeId={baseResumeId} />
              </div>
           )}
        </div>

        <div className="space-y-8">
           <h2 className="text-xl font-bold text-[#212529] flex items-center gap-2">
             <Rocket className="h-5 w-5 text-[#003893]" />
             Career Growth
           </h2>
           {baseResumeId ? (
              <CareerRoadmap resumeId={baseResumeId} />
           ) : (
              <div className="bg-white p-8 rounded-[24px] border border-[#e5e7eb] border-dashed text-center">
                 <p className="text-muted-foreground">Upload a resume to unlock your AI Career Roadmap</p>
              </div>
           )}
        </div>
      </div>

      {resumes?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-[#e5e7eb] border-dashed border-2">
           <FileText className="h-16 w-16 text-[#d1d5db] mb-4" />
           <p className="text-lg font-medium text-[#6b7280]">No resumes found</p>
           <p className="text-[#6b7280]">Start by creating your first resume.</p>
        </div>
      )}
    </div>
  );
}
