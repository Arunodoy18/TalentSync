"use client"

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Download,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ResumeContent {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary?: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: any[];
}

interface ResumeEditorProps {
  resume: {
    id: string;
    title: string;
    content: ResumeContent;
    updated_at: string;
    ats_score?: number;
    feedback?: any;
    is_base?: boolean;
  };
}

const BULLET = "\u2022";

const normalizeUnicode = (value: string): string => {
  return value.replace(/â€¢/g, BULLET);
};

const ResumeEditor = ({ resume: initialResume }: ResumeEditorProps) => {
  const supabase = createClient();
  const [resume, setResume] = useState(initialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedSignature, setLastSavedSignature] = useState(() =>
    JSON.stringify({
      title: initialResume.title,
      content: initialResume.content,
    })
  );

  const contactItems = [
    resume.content.personal.email,
    resume.content.personal.phone,
    resume.content.personal.location,
    resume.content.personal.website,
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => normalizeUnicode(item));

  const calculateATS = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/resume/${resume.id}/ats`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.resume) {
        setResume(data.resume);
      }
    } catch (error) {
      console.error("ATS calculation error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const currentSignature = JSON.stringify({
      title: resume.title,
      content: resume.content,
    });

    if (currentSignature === lastSavedSignature) {
      return;
    }

    const handleSave = async () => {
      setIsSaving(true);
      setSaveError(null);

      const { error } = await supabase
        .from("resumes")
        .update({
          content: resume.content,
          title: resume.title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resume.id);
      
      if (error) {
        console.error("Error saving resume:", error);
        setSaveError("Failed to save changes");
      } else {
        setLastSavedSignature(currentSignature);
      }

      setIsSaving(false);
    };

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [lastSavedSignature, resume, supabase]);

  const updatePersonalInfo = (field: string, value: string) => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        personal: {
          ...prev.content.personal,
          [field]: value,
        },
      },
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        experience: [
          ...prev.content.experience,
          { company: "", role: "", startDate: "", endDate: "", description: "" },
        ],
      },
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...resume.content.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        experience: newExperience,
      },
    }));
  };

  const removeExperience = (index: number) => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        experience: prev.content.experience.filter((_, i) => i !== index),
      },
    }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        education: [
          ...prev.content.education,
          { school: "", degree: "", startDate: "", endDate: "", description: "" },
        ],
      },
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...resume.content.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        education: newEducation,
      },
    }));
  };

  const removeEducation = (index: number) => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        education: prev.content.education.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSkills = (value: string) => {
    setResume((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        skills: value.split(",").map(s => s.trim()),
      },
    }));
  };

  return (
    <div className="app-backdrop flex h-full w-full flex-col xl:flex-row">
      {/* Sidebar Editor */}
      <div className="app-surface h-full w-full rounded-none border-x-0 border-b-0 border-t-0 xl:w-[460px] xl:rounded-none xl:border-r xl:border-l-0 xl:border-y-0">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white/95 p-4 backdrop-blur">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#6b7280] hover:text-[#212529] transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280]">
              {isSaving ? "Saving..." : saveError ? saveError : "All changes saved"}
            </span>
            <Button size="sm" variant="outline" className="h-8 rounded-full">
              <Download className="h-3 w-3 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-8 overflow-auto p-6 pb-20">
          <div>
            <Label htmlFor="resume-title" className="text-xs uppercase tracking-wider text-[#6b7280] font-bold mb-2 block">Resume Title</Label>
            <Input 
              id="resume-title"
              value={resume.title}
              onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
              className="font-bold text-xl border-none p-0 focus-visible:ring-0 shadow-none h-auto bg-transparent"
              placeholder="Resume Title"
            />
          </div>

            <nav className="-mx-6 flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] px-6 pb-3">
              <button 
                onClick={() => setActiveTab("personal")}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === "personal" ? "bg-[#00389312] text-[#003893]" : "text-[#6b7280] hover:bg-[#00389308]"}`}
              >
                Personal Info
              </button>
              <button 
                onClick={() => setActiveTab("experience")}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === "experience" ? "bg-[#00389312] text-[#003893]" : "text-[#6b7280] hover:bg-[#00389308]"}`}
              >
                Experience
              </button>
              <button 
                onClick={() => setActiveTab("education")}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === "education" ? "bg-[#00389312] text-[#003893]" : "text-[#6b7280] hover:bg-[#00389308]"}`}
              >
                Education
              </button>
              <button 
                onClick={() => setActiveTab("skills")}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === "skills" ? "bg-[#00389312] text-[#003893]" : "text-[#6b7280] hover:bg-[#00389308]"}`}
              >
                Skills
              </button>
              {resume.ats_score !== undefined && (
                <button 
                  onClick={() => setActiveTab("score")}
                  className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${activeTab === "score" ? "bg-[#00389312] text-[#003893]" : "text-[#6b7280] hover:bg-[#00389308]"}`}
                >
                  ATS Score
                </button>
              )}
            </nav>

          {activeTab === "score" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border bg-[var(--surface)] border-[var(--border)]">
                {resume.ats_score !== undefined ? (
                  <>
                    <div className="relative h-24 w-24 mb-4">
                      <svg className="h-24 w-24 -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="transparent"
                          stroke="var(--surface-elevated)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="transparent"
                          stroke={
                            resume.ats_score > 75 ? "var(--success)" : 
                            resume.ats_score >= 50 ? "var(--warning)" : "var(--error)"
                          }
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (resume.ats_score || 0) / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[var(--text-primary)]">
                        {resume.ats_score}%
                      </div>
                    </div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-1">ATS Compatibility Score</h3>
                    <p className="text-center text-sm text-[var(--text-secondary)] mb-6 mt-1">{resume.feedback?.match_explanation}</p>

                    <div className="w-full space-y-4 mb-6">
                      {[
                        { label: "Keywords Match", score: resume.feedback?.ats_breakdown?.keywords || 0 },
                        { label: "Formatting & Structure", score: resume.feedback?.ats_breakdown?.formatting || 0 },
                        { label: "Experience & Impact", score: resume.feedback?.ats_breakdown?.experience || 0 },
                        { label: "Skills Coverage", score: resume.feedback?.ats_breakdown?.skills || 0 },
                      ].map((cat, idx) => {
                        const barColor = cat.score > 75 ? "var(--success)" : cat.score >= 50 ? "var(--warning)" : "var(--error)";
                        return (
                          <div key={idx} className="flex items-center gap-4 text-sm">
                            <div className="w-1/3 font-medium text-[var(--text-primary)]">{cat.label}</div>
                            <div className="w-1/2 h-2 rounded-full overflow-hidden bg-[var(--surface-elevated)]">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${cat.score}%`, backgroundColor: barColor }} 
                              />
                            </div>
                            <div className="w-1/6 text-right font-bold" style={{ color: barColor }}>{cat.score}/100</div>
                          </div>
                        );
                      })}
                    </div>

                    <Button onClick={calculateATS} disabled={isAnalyzing} variant="outline" size="sm" className="w-full rounded-full border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]">
                      {isAnalyzing ? "Recalculating..." : "Recalculate Score"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-20 text-[var(--primary)]" />
                    <p className="text-sm mb-4 text-[var(--text-secondary)]">Calculate your ATS score to see how well this resume matches industry standards.</p>
                    <Button onClick={calculateATS} disabled={isAnalyzing} className="rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]">
                      {isAnalyzing ? "Calculating..." : "Calculate ATS Score"}
                    </Button>
                  </div>
                )}
              </div>

              {resume.feedback?.missing_skills?.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Missing Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {resume.feedback.missing_skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.feedback?.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Suggestions</Label>
                  <div className="space-y-3">
                    {resume.feedback.suggestions.map((suggestion: any, i: number) => (
                      <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
                        <div className="flex gap-3">
                          <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5 text-[var(--primary)]" />
                          <div className="flex-1">
                            <h4 className="font-bold text-[var(--text-primary)]">
                              {typeof suggestion === "string" ? "Optimization tip" : suggestion.title}
                            </h4>
                            <p className="text-[var(--text-secondary)] mt-1">
                              {typeof suggestion === "string" ? suggestion : suggestion.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end border-t border-[var(--border)] pt-3">
                          <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs h-8 bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-elevated)]" onClick={() => {/* Rewrite logic to implement later */}}>
                            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
                            Fix with AI
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#6b7280]">FULL NAME</Label>
                  <Input value={resume.content.personal.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#6b7280]">EMAIL ADDRESS</Label>
                  <Input value={resume.content.personal.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#6b7280]">PHONE NUMBER</Label>
                  <Input value={resume.content.personal.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#6b7280]">LOCATION</Label>
                  <Input value={resume.content.personal.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#6b7280]">SUMMARY</Label>
                <Textarea 
                  value={resume.content.personal.summary} 
                  onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {resume.content.experience.map((exp, index) => (
                <div key={index} className="p-4 border border-[#e5e7eb] rounded-xl space-y-4 bg-[#f9fafb] relative group/item">
                  <button 
                    onClick={() => removeExperience(index)}
                    title="Remove experience"
                    aria-label="Remove experience"
                    className="absolute top-4 right-4 text-[#6b7280] hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">COMPANY</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">ROLE</Label>
                      <Input value={exp.role} onChange={(e) => updateExperience(index, "role", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">START DATE</Label>
                      <Input value={exp.startDate} onChange={(e) => updateExperience(index, "startDate", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">END DATE</Label>
                      <Input value={exp.endDate} onChange={(e) => updateExperience(index, "endDate", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#6b7280]">DESCRIPTION</Label>
                    <Textarea 
                      value={exp.description} 
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addExperience} variant="outline" className="w-full h-12 rounded-xl border-dashed border-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {resume.content.education.map((edu, index) => (
                <div key={index} className="p-4 border border-[#e5e7eb] rounded-xl space-y-4 bg-[#f9fafb] relative group/item">
                  <button 
                    onClick={() => removeEducation(index)}
                    title="Remove education"
                    aria-label="Remove education"
                    className="absolute top-4 right-4 text-[#6b7280] hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">SCHOOL</Label>
                      <Input value={edu.school} onChange={(e) => updateEducation(index, "school", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">DEGREE</Label>
                      <Input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">START DATE</Label>
                      <Input value={edu.startDate} onChange={(e) => updateEducation(index, "startDate", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#6b7280]">END DATE</Label>
                      <Input value={edu.endDate} onChange={(e) => updateEducation(index, "endDate", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={addEducation} variant="outline" className="w-full h-12 rounded-xl border-dashed border-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#6b7280]">SKILLS (COMMA SEPARATED)</Label>
                <Textarea 
                  value={resume.content.skills.join(", ")} 
                  onChange={(e) => updateSkills(e.target.value)}
                  placeholder="React, Next.js, TypeScript..."
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Pane */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-auto p-4 sm:p-8 xl:p-12">
        <div className="app-surface w-full max-w-[900px] min-h-[1100px] p-8 sm:p-12 lg:p-[60px] font-serif transition-all duration-300 origin-top">
          <div className="text-center border-b-2 border-[#1a1a1a] pb-6 mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-2">{resume.content.personal.fullName || "Your Name"}</h1>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[#4b5563]">
              {contactItems.map((item, index) => (
                <span key={`${item}-${index}`}>
                  {index > 0 ? `${BULLET} ${item}` : item}
                </span>
              ))}
            </div>
          </div>

          {resume.content.personal.summary && (
            <div className="mb-10">
              <h2 className="text-lg font-bold uppercase border-b border-[#e5e7eb] pb-1 mb-3">Professional Summary</h2>
              <p className="text-sm leading-relaxed text-[#374151]">
                {normalizeUnicode(resume.content.personal.summary)}
              </p>
            </div>
          )}

          {resume.content.experience.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold uppercase border-b border-[#e5e7eb] pb-1 mb-4">Experience</h2>
              <div className="space-y-6">
                {resume.content.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-md text-[#1a1a1a]">{exp.company}</h3>
                      <span className="text-sm font-medium italic text-[#4b5563]">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="text-sm font-bold text-[#374151] italic mb-2">
                      {normalizeUnicode(exp.role)}
                    </div>
                    <p className="text-sm leading-relaxed text-[#374151] whitespace-pre-line">
                      {normalizeUnicode(exp.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.content.education.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold uppercase border-b border-[#e5e7eb] pb-1 mb-4">Education</h2>
              <div className="space-y-4">
                {resume.content.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <div>
                      <h3 className="font-bold text-md text-[#1a1a1a]">
                        {normalizeUnicode(edu.school)}
                      </h3>
                      <div className="text-sm text-[#374151]">
                        {normalizeUnicode(edu.degree)}
                      </div>
                    </div>
                    <span className="text-sm font-medium italic text-[#4b5563]">
                      {`${normalizeUnicode(edu.startDate)} - ${normalizeUnicode(edu.endDate)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.content.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold uppercase border-b border-[#e5e7eb] pb-1 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#374151]">
                {resume.content.skills.map((skill, i) => (
                  <span key={i}>
                    {`${normalizeUnicode(skill)}${i < resume.content.skills.length - 1 ? "," : ""}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;




