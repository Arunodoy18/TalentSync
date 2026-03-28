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

  const feedback = resume.feedback;

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
    <div className="flex h-full w-full bg-[#f6f7f9]">
      {/* Sidebar Editor */}
      <div className="w-[450px] bg-white border-r border-[#e5e7eb] flex flex-col h-full shadow-sm">
        <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between bg-white sticky top-0 z-10">
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

        <div className="flex-1 overflow-auto p-6 space-y-8 pb-20 custom-scrollbar">
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

            <nav className="flex items-center gap-2 border-b border-[#e5e7eb] -mx-6 px-6">
              <button 
                onClick={() => setActiveTab("personal")}
                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "personal" ? "text-[#003893]" : "text-[#6b7280]"}`}
              >
                Personal Info
                {activeTab === "personal" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003893]" />}
              </button>
              <button 
                onClick={() => setActiveTab("experience")}
                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "experience" ? "text-[#003893]" : "text-[#6b7280]"}`}
              >
                Experience
                {activeTab === "experience" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003893]" />}
              </button>
              <button 
                onClick={() => setActiveTab("education")}
                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "education" ? "text-[#003893]" : "text-[#6b7280]"}`}
              >
                Education
                {activeTab === "education" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003893]" />}
              </button>
              <button 
                onClick={() => setActiveTab("skills")}
                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "skills" ? "text-[#003893]" : "text-[#6b7280]"}`}
              >
                Skills
                {activeTab === "skills" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003893]" />}
              </button>
              {resume.ats_score !== undefined && (
                <button 
                  onClick={() => setActiveTab("score")}
                  className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "score" ? "text-[#003893]" : "text-[#6b7280]"}`}
                >
                  ATS Score
                  {activeTab === "score" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003893]" />}
                </button>
              )}
            </nav>

          {activeTab === "score" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col items-center justify-center p-6 bg-[#00389305] rounded-2xl border border-[#00389320]">
                {resume.ats_score !== undefined ? (
                  <>
                    <div className="relative h-24 w-24 mb-4">
                      <svg className="h-24 w-24 -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="transparent"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="transparent"
                          stroke="#003893"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (resume.ats_score || 0) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#003893]">
                        {resume.ats_score}%
                      </div>
                    </div>
                    <h3 className="font-bold text-[#212529]">ATS Compatibility Score</h3>
                    <p className="text-center text-sm text-[#6b7280] mt-1">{resume.feedback?.match_explanation}</p>
                    <Button onClick={calculateATS} disabled={isAnalyzing} variant="outline" size="sm" className="mt-4 rounded-full">
                      {isAnalyzing ? "Recalculating..." : "Recalculate Score"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Sparkles className="h-10 w-10 text-[#003893] mx-auto mb-4 opacity-20" />
                    <p className="text-sm text-[#6b7280] mb-4">Calculate your ATS score to see how well this resume matches industry standards.</p>
                    <Button onClick={calculateATS} disabled={isAnalyzing} className="bg-[#003893] text-white rounded-full">
                      {isAnalyzing ? "Calculating..." : "Calculate ATS Score"}
                    </Button>
                  </div>
                )}
              </div>


                {resume.feedback?.missing_skills?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Missing Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {resume.feedback.missing_skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resume.feedback?.suggestions?.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Suggestions</Label>
                    <div className="space-y-2">
                      {resume.feedback.suggestions.map((suggestion: string, i: number) => (
                        <div key={i} className="flex gap-3 p-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#4b5563]">
                          <Sparkles className="h-4 w-4 text-[#003893] flex-shrink-0 mt-0.5" />
                          <span>{suggestion}</span>
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
      <div className="flex-1 flex flex-col items-center justify-start p-12 overflow-auto bg-[#e5ebf5]">
        <div className="w-[800px] min-h-[1100px] bg-white shadow-2xl p-[60px] font-serif transition-all duration-300 scale-95 origin-top">
          <div className="text-center border-b-2 border-[#1a1a1a] pb-6 mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#1a1a1a] mb-2">{resume.content.personal.fullName || "Your Name"}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-[#4b5563]">
              {resume.content.personal.email && <span>{resume.content.personal.email}</span>}
              {resume.content.personal.phone && <span>• {resume.content.personal.phone}</span>}
              {resume.content.personal.location && <span>• {resume.content.personal.location}</span>}
              {resume.content.personal.website && <span>• {resume.content.personal.website}</span>}
            </div>
          </div>

          {resume.content.personal.summary && (
            <div className="mb-10">
              <h2 className="text-lg font-bold uppercase border-b border-[#e5e7eb] pb-1 mb-3">Professional Summary</h2>
              <p className="text-sm leading-relaxed text-[#374151]">{resume.content.personal.summary}</p>
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
                    <div className="text-sm font-bold text-[#374151] italic mb-2">{exp.role}</div>
                    <p className="text-sm leading-relaxed text-[#374151] whitespace-pre-line">{exp.description}</p>
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
                      <h3 className="font-bold text-md text-[#1a1a1a]">{edu.school}</h3>
                      <div className="text-sm text-[#374151]">{edu.degree}</div>
                    </div>
                    <span className="text-sm font-medium italic text-[#4b5563]">{edu.startDate} - {edu.endDate}</span>
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
                  <span key={i}>{skill}{i < resume.content.skills.length - 1 ? "," : ""}</span>
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
