"use client"

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TailorButtonProps {
  resumeId: string;
  jobId: string;
  jobTitle: string;
}

const TailorButton = ({ resumeId, jobId, jobTitle }: TailorButtonProps) => {
  const [isTailoring, setIsTailoring] = useState(false);
  const router = useRouter();

  const handleTailor = async () => {
    if (!resumeId) {
      toast.error("Please upload or create a base resume first.");
      return;
    }

    setIsTailoring(true);
    toast.info(`Tailoring your resume for ${jobTitle}...`);

    try {
      const response = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to tailor resume");
      }

      toast.success("Resume tailored successfully!");
      router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch (error: any) {
      console.error("Tailoring error:", error);
      toast.error(error.message || "Failed to tailor resume");
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <Button 
      onClick={handleTailor}
      disabled={isTailoring}
      className="bg-[#003893] text-white rounded-[50px] px-6 h-10 font-bold flex items-center gap-2"
    >
      {isTailoring ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isTailoring ? "Tailoring..." : "Tailor Resume"}
    </Button>
  );
};

export default TailorButton;




