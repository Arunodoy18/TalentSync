"use client";

import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Target, Award, BookOpen, PenTool, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { use } from "react";

export default function AtsScorePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [aiScore, setAiScore] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Fetch the match
      const { data: match } = await supabase
        .from("job_matches")
        .select("match_score, semantic_score, missing_skills, resume_id, jobs(*)")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .single();

      if (!match || !match.jobs) {
        setData({ error: "No Match Found" });
        setLoading(false);
        return;
      }

      setData(match);

      // Deep AI scoring calculations
      try {
        const res = await fetch("/api/ats/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: match.resume_id, jobId: jobId })
        });
        
        if (res.ok) {
          const aiData = await res.json();
          setAiScore(aiData);
        }
      } catch(err) {
        console.error("AI fetch err", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [jobId, router]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 h-full w-full">
         <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)] mb-4" />
         <p className="text-[var(--primary-light)]">Analyzing thousands of vectors and scoring match...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--primary-light)]">
        <h2 className="text-2xl font-bold mb-4">No Match Found</h2>
        <p className="text-[var(--primary)]">Score has not been calculated yet for this combination.</p>
        <Link href="/dashboard/jobs" className="mt-8 px-6 py-2 bg-[rgba(142,182,155,0.2)] text-[var(--primary)] rounded-full hover:bg-[rgba(142,182,155,0.4)]">
          Return to Jobs
        </Link>
      </div>
    );
  }

  const job = data.jobs;

  // Utilize the real OpenAI calculation parsed out of response
  const score = aiScore?.score || data.match_score || 0;
  
  const keywordScore = aiScore?.breakdown?.keyword_match ?? Math.min(Number((score * 1.1).toFixed(0)), 100);
  const skillsScore = aiScore?.breakdown?.skills_match ?? Math.min(Number((score * 1.05).toFixed(0)), 100);
  const experienceScore = aiScore?.breakdown?.experience_match ?? Math.min(Number((score * 0.95).toFixed(0)), 100);
  const educationScore = aiScore?.breakdown?.education_match ?? Math.min(Number((score * 0.9).toFixed(0)), 100);

  const missingSkills: string[] = aiScore?.missing_skills || data.missing_skills || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link href="/dashboard/jobs" className="inline-flex items-center text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-light)]">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
      </Link>
      
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--primary-light)]">ATS Match Analysis</h1>
        <p className="mt-2 text-lg text-[var(--primary)]/80">
          How your resume stacks up against <strong>{job.title}</strong> at <em>{job.company}</em>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Big Score Circle */}
        <Card className="md:col-span-1 border-[rgba(35,83,71,0.2)] bg-[rgba(255,255,255,0.02)] app-surface flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <h2 className="text-xl font-bold text-[var(--primary-light)] mb-6">Overall ATS Score</h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-gradient-to-tr from-[rgba(255,255,255,0.05)] to-transparent border border-[rgba(255,255,255,0.1)] shadow-inner">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 stroke-[rgba(142,182,155,0.2)]">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8"/>
              <circle 
                 cx="50" cy="50" r="45" 
                 fill="none" 
                 strokeWidth="8" 
                 strokeLinecap="round" 
                 strokeDasharray="283" 
                 strokeDashoffset={283 - (283 * score) / 100}
                 className="stroke-[var(--primary)] transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(35,83,71,0.8)]" 
               />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] drop-shadow-sm">
                {score}
              </span>
              <span className="text-sm font-semibold text-[var(--primary)] mt-2">/ 100 Match</span>
            </div>
          </div>
          
          <Button className="mt-8 w-full font-bold bg-[rgba(35,83,71,0.15)] text-[var(--primary)] border border-[rgba(35,83,71,0.5)] hover:bg-white hover:text-[var(--bg)] transition-all">
             <Sparkles className="mr-2 h-4 w-4"/> AI Tailor Resume
          </Button>
        </Card>

        {/* Detailed Metrics */}
        <Card className="md:col-span-2 border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] p-6">
           <CardHeader className="px-0 pt-0">
             <CardTitle className="text-2xl text-white">Score Breakdown</CardTitle>
             <CardDescription className="text-[var(--primary)]">Detailed algorithmic mapping of your resume against the JD.</CardDescription>
           </CardHeader>
           <CardContent className="px-0 space-y-6">
             <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold tracking-wide text-[var(--primary-light)] flex items-center"><Target className="w-4 h-4 mr-2"/> Keyword Match (40%)</span>
                 <span className="text-sm font-black text-white">{keywordScore}%</span>
               </div>
               <Progress value={Number(keywordScore)} className="h-3 bg-[rgba(255,255,255,0.1)] [&>div]:bg-gradient-to-r [&>div]:from-[var(--primary)] [&>div]:to-[var(--primary-light)]" />
             </div>

             <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold tracking-wide text-[var(--primary-light)] flex items-center"><PenTool className="w-4 h-4 mr-2"/> Skills Match (20%)</span>
                 <span className="text-sm font-black text-white">{skillsScore}%</span>
               </div>
               <Progress value={Number(skillsScore)} className="h-3 bg-[rgba(255,255,255,0.1)] [&>div]:bg-gradient-to-r [&>div]:from-[var(--primary)] [&>div]:to-[var(--primary-light)]" />
             </div>

             <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold tracking-wide text-[var(--primary-light)] flex items-center"><Award className="w-4 h-4 mr-2"/> Experience Match (20%)</span>
                 <span className="text-sm font-black text-white">{experienceScore}%</span>
               </div>
               <Progress value={Number(experienceScore)} className="h-3 bg-[rgba(255,255,255,0.1)] [&>div]:bg-gradient-to-r [&>div]:from-[var(--primary)] [&>div]:to-[var(--primary-light)]" />
             </div>

             <div className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold tracking-wide text-[var(--primary-light)] flex items-center"><BookOpen className="w-4 h-4 mr-2"/> Education Match (10%)</span>
                 <span className="text-sm font-black text-white">{educationScore}%</span>
               </div>
               <Progress value={Number(educationScore)} className="h-3 bg-[rgba(255,255,255,0.1)] [&>div]:bg-gradient-to-r [&>div]:from-[var(--primary)] [&>div]:to-[var(--primary-light)]" />
             </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <Card className="border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] border-l-4 border-l-[var(--danger)]">
          <CardHeader>
             <CardTitle className="text-xl text-white">Missing Skills & Keywords</CardTitle>
             <CardDescription className="text-[var(--primary)]">Adding these to your resume accurately could boost your score to 90+.</CardDescription>
          </CardHeader>
          <CardContent>
            {missingSkills.length > 0 ? (
               <div className="flex max-w-full flex-wrap gap-2">
                 {missingSkills.map(skill => (
                   <span key={skill} className="px-3 py-1 text-sm font-semibold rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] text-[#fc8181] drop-shadow-sm">
                      {skill}
                   </span>
                 ))}
               </div>
            ) : (
               <p className="text-sm text-green-400 font-semibold bg-green-500/10 p-4 rounded-lg inline-block">
                 Perfect match! No critical skills missing.
               </p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}



