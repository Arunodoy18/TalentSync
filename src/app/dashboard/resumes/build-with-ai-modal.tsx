"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import JakesTemplate, { JakesResumeData } from "@/components/resume/templates/JakesTemplate";
import { Loader2, UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY_RESUME: JakesResumeData = {
  name: "",
  phone: "",
  email: "",
  linkedin: "",
  github: "",
  education: [{ institution: "", location: "", degree: "", dates: "" }],
  experience: [{ company: "", dates: "", position: "", location: "", bullets: [] }],
  projects: [{ name: "", techStack: "", dates: "", bullets: [], liveUrl: "", codeUrl: "" }],
  skills: { languages: "", aiMl: "", frameworks: "", databases: "", tools: "" },
  achievements: [],
};

type BuildWithAiModalProps = {
  open: boolean;
  onClose: () => void;
  onResumeCreated: (resume: any) => void;
};

function ensureArray<T>(value: T[] | undefined, fallback: T[]): T[] {
  if (Array.isArray(value) && value.length > 0) return value;
  return fallback;
}

function normalizeBullets(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function mapResumeToJakes(data: any): JakesResumeData {
  if (!data || typeof data !== "object") {
    return { ...EMPTY_RESUME };
  }

  if (data.name || data.experience || data.projects || data.education) {
    return {
      ...EMPTY_RESUME,
      ...data,
      education: ensureArray(data.education, EMPTY_RESUME.education),
      experience: ensureArray(data.experience, EMPTY_RESUME.experience),
      projects: ensureArray(data.projects, EMPTY_RESUME.projects),
      achievements: ensureArray(data.achievements, []),
      skills: {
        ...EMPTY_RESUME.skills,
        ...(data.skills || {}),
      },
    };
  }

  if (data.personal || data.experience || data.education) {
    const skills = Array.isArray(data.skills) ? data.skills.join(", ") : "";
    return {
      ...EMPTY_RESUME,
      name: data.personal?.fullName ?? "",
      email: data.personal?.email ?? "",
      phone: data.personal?.phone ?? "",
      linkedin: data.personal?.website ?? "",
      github: "",
      education: ensureArray(
        (data.education || []).map((edu: any) => ({
          institution: edu.school ?? "",
          location: "",
          degree: edu.degree ?? "",
          dates: [edu.startDate, edu.endDate].filter(Boolean).join(" - "),
        })),
        EMPTY_RESUME.education
      ),
      experience: ensureArray(
        (data.experience || []).map((exp: any) => ({
          company: exp.company ?? "",
          dates: [exp.startDate, exp.endDate].filter(Boolean).join(" - "),
          position: exp.role ?? "",
          location: "",
          bullets: normalizeBullets(exp.description ?? ""),
        })),
        EMPTY_RESUME.experience
      ),
      projects: ensureArray(
        (data.projects || []).map((proj: any) => ({
          name: proj.name ?? "",
          techStack: proj.technologies ?? "",
          dates: "",
          bullets: Array.isArray(proj.bullets) ? proj.bullets : [],
          liveUrl: proj.link ?? "",
          codeUrl: proj.github ?? "",
        })),
        EMPTY_RESUME.projects
      ),
      skills: {
        ...EMPTY_RESUME.skills,
        languages: skills,
      },
      achievements: [],
    };
  }

  if (data.fullName || data.department || data.education) {
    return {
      ...EMPTY_RESUME,
      name: data.fullName ?? "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      education: ensureArray(
        (data.education || []).map((edu: any) => ({
          institution: edu.institute ?? edu.university ?? "",
          location: "",
          degree: edu.examination ?? "",
          dates: edu.year ?? "",
        })),
        EMPTY_RESUME.education
      ),
      experience: ensureArray(
        (data.experience || []).map((exp: any) => ({
          company: exp.company ?? "",
          dates: exp.date ?? "",
          position: exp.position ?? "",
          location: "",
          bullets: Array.isArray(exp.descriptions) ? exp.descriptions : [],
        })),
        EMPTY_RESUME.experience
      ),
      projects: ensureArray(
        (data.projects || []).map((proj: any) => ({
          name: proj.title ?? "",
          techStack: proj.courseCode ?? "",
          dates: proj.date ?? "",
          bullets: Array.isArray(proj.descriptions) ? proj.descriptions : [],
          liveUrl: "",
          codeUrl: "",
        })),
        EMPTY_RESUME.projects
      ),
      skills: {
        ...EMPTY_RESUME.skills,
        languages: data.skills?.programmingLanguages ?? "",
        frameworks: data.skills?.toolsAndLibraries ?? "",
      },
      achievements: [],
    };
  }

  return { ...EMPTY_RESUME };
}

export default function BuildWithAiModal({ open, onClose, onResumeCreated }: BuildWithAiModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<JakesResumeData>({ ...EMPTY_RESUME });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const loadProfile = async () => {
      setIsLoading(true);

      if (!supabase) {
        toast.error("Supabase is not configured. Check your environment variables.");
        setIsLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error("You must be logged in to build a resume.");
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const [profileRes, resumeRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("resumes")
            .select("data, content, template_type, title")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const profile = profileRes.data ?? {};
        const fallbackResume = resumeRes.data?.data ?? resumeRes.data?.content ?? null;
        const mappedResume = mapResumeToJakes(fallbackResume);

        const merged: JakesResumeData = {
          ...mappedResume,
          name: profile.full_name || mappedResume.name || user.user_metadata?.full_name || "",
          email: profile.email || mappedResume.email || user.email || "",
          phone: profile.phone || mappedResume.phone || "",
          linkedin: profile.linkedin || mappedResume.linkedin || "",
          github: profile.github || mappedResume.github || "",
          skills: {
            ...mappedResume.skills,
            languages: profile.skills_languages || mappedResume.skills.languages || "",
            frameworks: profile.skills_frameworks || mappedResume.skills.frameworks || "",
            databases: profile.skills_databases || mappedResume.skills.databases || "",
            tools: profile.skills_tools || mappedResume.skills.tools || "",
            aiMl: profile.skills_ai_ml || mappedResume.skills.aiMl || "",
          },
        };

        if (isMounted) {
          setResumeData(merged);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load profile.";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [open, supabase]);

  const updateField = (field: keyof JakesResumeData, value: any) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSkills = (field: keyof JakesResumeData["skills"], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  const updateNested = (
    section: "education" | "experience" | "projects",
    index: number,
    key: string,
    value: any
  ) => {
    setResumeData((prev) => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [section]: updated } as JakesResumeData;
    });
  };

  const updateBullets = (
    section: "experience" | "projects",
    index: number,
    value: string
  ) => {
    updateNested(section, index, "bullets", normalizeBullets(value));
  };

  const addEntry = (section: "education" | "experience" | "projects") => {
    setResumeData((prev) => {
      const updated = [...prev[section]];
      if (section === "education") {
        updated.push({ institution: "", location: "", degree: "", dates: "" });
      }
      if (section === "experience") {
        updated.push({ company: "", dates: "", position: "", location: "", bullets: [] });
      }
      if (section === "projects") {
        updated.push({ name: "", techStack: "", dates: "", bullets: [], liveUrl: "", codeUrl: "" });
      }
      return { ...prev, [section]: updated } as JakesResumeData;
    });
  };

  const removeEntry = (section: "education" | "experience" | "projects", index: number) => {
    setResumeData((prev) => {
      const updated = [...prev[section]];
      updated.splice(index, 1);
      return { ...prev, [section]: updated } as JakesResumeData;
    });
  };

  const handleFileSelected = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelected(event.dataTransfer.files?.[0] ?? null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error("Upload a resume PDF to use as the reference format.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Failed to parse reference resume.");
      }

      const parsed = await response.json();
      const merged = mapResumeToJakes(parsed);
      setResumeData(merged);
      toast.success("AI resume generated. Review and edit before saving.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate resume.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!supabase) {
      toast.error("Supabase is not configured. Check your environment variables.");
      return;
    }
    if (!userId) {
      toast.error("You must be logged in to save a resume.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: userId,
        title: resumeData.name ? `${resumeData.name} Resume` : "AI Resume",
        template_type: "jakes",
        data: resumeData,
        content: resumeData,
        is_base: false,
      };

      const { data, error } = await supabase
        .from("resumes")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      onResumeCreated(data);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save resume.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const achievementsText = resumeData.achievements.join("\n");

  const previewNode = useMemo(() => <JakesTemplate data={resumeData} />, [resumeData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-black/60">
      <div
        className="flex-1 overflow-hidden bg-[#0b0f19]"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-0 bg-[#0b0f19]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Build with AI</h2>
              <p className="text-sm text-white/60">Upload any resume format and replace it with your data.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-0 lg:flex-row">
            {/* Left Panel */}
            <div className="flex h-full w-full flex-col gap-6 overflow-y-auto border-r border-white/10 bg-[#0f1524] p-6 lg:w-[50%]">
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-8 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <UploadCloud className="h-8 w-8 text-white/70" />
                <p className="mt-3 text-sm font-semibold text-white">Upload Any Resume PDF</p>
                <p className="mt-1 text-xs text-white/50">This is your format reference.</p>
                <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
                  Choose PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
                  />
                </label>
                {selectedFile ? (
                  <p className="mt-3 text-xs text-white/70">{selectedFile.name}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0b0f19] disabled:opacity-60"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Generate My Resume with AI
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save to Vault
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your profile data...
                </div>
              ) : null}

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Personal Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={resumeData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Name"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="Email"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="Phone"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.linkedin}
                    onChange={(event) => updateField("linkedin", event.target.value)}
                    placeholder="LinkedIn"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.github}
                    onChange={(event) => updateField("github", event.target.value)}
                    placeholder="GitHub"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Skills</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={resumeData.skills.languages}
                    onChange={(event) => updateSkills("languages", event.target.value)}
                    placeholder="Languages"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.skills.frameworks}
                    onChange={(event) => updateSkills("frameworks", event.target.value)}
                    placeholder="Frameworks"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.skills.databases}
                    onChange={(event) => updateSkills("databases", event.target.value)}
                    placeholder="Databases"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.skills.tools}
                    onChange={(event) => updateSkills("tools", event.target.value)}
                    placeholder="Tools"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={resumeData.skills.aiMl}
                    onChange={(event) => updateSkills("aiMl", event.target.value)}
                    placeholder="AI/ML"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Experience</h3>
                  <button
                    type="button"
                    onClick={() => addEntry("experience")}
                    className="text-xs font-semibold text-white/70 hover:text-white"
                  >
                    + Add Experience
                  </button>
                </div>
                {resumeData.experience.map((exp, index) => (
                  <div key={`exp-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={exp.company}
                        onChange={(event) => updateNested("experience", index, "company", event.target.value)}
                        placeholder="Company"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={exp.position}
                        onChange={(event) => updateNested("experience", index, "position", event.target.value)}
                        placeholder="Position"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={exp.location}
                        onChange={(event) => updateNested("experience", index, "location", event.target.value)}
                        placeholder="Location"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={exp.dates}
                        onChange={(event) => updateNested("experience", index, "dates", event.target.value)}
                        placeholder="Dates"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <textarea
                      value={(exp.bullets || []).join("\n")}
                      onChange={(event) => updateBullets("experience", index, event.target.value)}
                      placeholder="Bullets (one per line)"
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    {resumeData.experience.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEntry("experience", index)}
                        className="text-xs font-semibold text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Projects</h3>
                  <button
                    type="button"
                    onClick={() => addEntry("projects")}
                    className="text-xs font-semibold text-white/70 hover:text-white"
                  >
                    + Add Project
                  </button>
                </div>
                {resumeData.projects.map((proj, index) => (
                  <div key={`proj-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={proj.name}
                        onChange={(event) => updateNested("projects", index, "name", event.target.value)}
                        placeholder="Project name"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={proj.techStack}
                        onChange={(event) => updateNested("projects", index, "techStack", event.target.value)}
                        placeholder="Tech stack"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={proj.dates}
                        onChange={(event) => updateNested("projects", index, "dates", event.target.value)}
                        placeholder="Dates"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={proj.liveUrl}
                        onChange={(event) => updateNested("projects", index, "liveUrl", event.target.value)}
                        placeholder="Live URL"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <textarea
                      value={(proj.bullets || []).join("\n")}
                      onChange={(event) => updateBullets("projects", index, event.target.value)}
                      placeholder="Bullets (one per line)"
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                    {resumeData.projects.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEntry("projects", index)}
                        className="text-xs font-semibold text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Education</h3>
                  <button
                    type="button"
                    onClick={() => addEntry("education")}
                    className="text-xs font-semibold text-white/70 hover:text-white"
                  >
                    + Add Education
                  </button>
                </div>
                {resumeData.education.map((edu, index) => (
                  <div key={`edu-${index}`} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={edu.institution}
                        onChange={(event) => updateNested("education", index, "institution", event.target.value)}
                        placeholder="Institution"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={edu.location}
                        onChange={(event) => updateNested("education", index, "location", event.target.value)}
                        placeholder="Location"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={edu.degree}
                        onChange={(event) => updateNested("education", index, "degree", event.target.value)}
                        placeholder="Degree"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                      <input
                        value={edu.dates}
                        onChange={(event) => updateNested("education", index, "dates", event.target.value)}
                        placeholder="Dates"
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    {resumeData.education.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEntry("education", index)}
                        className="text-xs font-semibold text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Achievements</h3>
                <textarea
                  value={achievementsText}
                  onChange={(event) => updateField("achievements", normalizeBullets(event.target.value))}
                  placeholder="Achievements (one per line)"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </section>
            </div>

            {/* Right Panel */}
            <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-[#f5f5f5] p-6 lg:w-[50%]">
              <div className="w-full max-w-[820px] rounded-[12px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
                {previewNode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
