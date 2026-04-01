"use client"

import React, { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported at this time.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      toast.success("Resume parsed successfully!");
      router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to parse resume");
      if (error.message.includes("OpenAI")) {
        // Show some raw text to the user or tell them to check env
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        title="Upload resume PDF"
        aria-label="Upload resume PDF"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
      />
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-[44px] rounded-[14px] border border-[rgba(129,140,248,0.5)] bg-[rgba(99,102,241,0.22)] px-5 font-semibold text-indigo-100 shadow-[0_10px_22px_rgba(79,70,229,0.32)] hover:bg-[rgba(99,102,241,0.36)]"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          {isUploading ? "Parsing..." : "Upload Resume"}
        </Button>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;
