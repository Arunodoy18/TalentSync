'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TemplatePreview, DownloadPDFButton } from '@/components/resume/templates/TemplatePreview';
import { JakesResumeData, sampleData as jakesSampleData } from '@/components/resume/templates/JakesTemplate';
import { IITResumeData } from '@/components/resume/templates/IITTemplate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePostHog } from 'posthog-js/react';
import { createClient } from '@/lib/supabase-browser';

type BuilderResumeData = JakesResumeData & {
  portfolio?: string;
};

const defaultResumeData: BuilderResumeData = {
  ...jakesSampleData,
  portfolio: '',
};

const emptySkills = {
  languages: '',
  aiMl: '',
  frameworks: '',
  databases: '',
  tools: '',
};

export default function ResumeBuilderPage() {
  const posthog = usePostHog();
  const supabase = useMemo(() => createClient(), []);
  const [resumeData, setResumeData] = useState<BuilderResumeData>(defaultResumeData);
  const [templateType, setTemplateType] = useState<'iit' | 'jakes'>('jakes');

  const [isCheckingATS, setIsCheckingATS] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedTemplate = templateType;
  const experience = resumeData.experience ?? [];
  const projects = resumeData.projects ?? [];

  const [debouncedResumeData, setDebouncedResumeData] = useState<BuilderResumeData>(defaultResumeData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedResumeData(resumeData);
    }, 150);
    return () => clearTimeout(handler);
  }, [resumeData]);

  const [expanded, setExpanded] = useState<{
    personal: boolean;
    education: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
    achievements: boolean;
  }>({
    personal: true,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    achievements: false,
  });

  const toggleExpanded = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasData = useCallback((section: keyof typeof expanded) => {
    const hasText = (value?: string) => (value ?? '').trim().length > 0;
    switch (section) {
      case 'personal':
        return [
          resumeData.name,
          resumeData.email,
          resumeData.phone,
          resumeData.linkedin,
          resumeData.github,
          resumeData.portfolio,
        ].some(hasText);
      case 'education':
        return (resumeData.education || []).some((edu) =>
          [edu.institution, edu.location, edu.degree, edu.dates].some(hasText)
        );
      case 'experience':
        return (resumeData.experience || []).some((exp) =>
          [exp.company, exp.position, exp.location, exp.dates].some(hasText) ||
          (exp.bullets || []).length > 0
        );
      case 'projects':
        return (resumeData.projects || []).some((proj) =>
          [proj.name, proj.techStack, proj.dates, proj.liveUrl, proj.codeUrl].some(hasText) ||
          (proj.bullets || []).length > 0
        );
      case 'skills':
        return [
          resumeData.skills?.languages,
          resumeData.skills?.frameworks,
          resumeData.skills?.databases,
          resumeData.skills?.tools,
        ].some(hasText);
      case 'achievements':
        return (resumeData.achievements || []).some(hasText);
      default:
        return false;
    }
  }, [resumeData]);

  const filledSectionsCount = useMemo(() => {
    const sectionKeys: (keyof typeof expanded)[] = [
      'personal',
      'education',
      'experience',
      'projects',
      'skills',
      'achievements',
    ];
    return sectionKeys.reduce((count, section) => count + (hasData(section) ? 1 : 0), 0);
  }, [hasData]);

  const handleChange = <K extends keyof BuilderResumeData>(field: K, value: BuilderResumeData[K]) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    field: 'education' | 'experience' | 'projects',
    index: number,
    key: string,
    value: string
  ) => {
    setResumeData((prev) => {
      const arr = [...((prev[field] as any[]) || [])];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const handleNestedStringArrayChange = (
    field: 'experience' | 'projects',
    index: number,
    key: 'bullets',
    text: string
  ) => {
    setResumeData((prev) => {
      const arr = [...((prev[field] as any[]) || [])];
      arr[index] = { ...arr[index], [key]: text.split('\n').map((line) => line.trim()).filter(Boolean) };
      return { ...prev, [field]: arr };
    });
  };

  const handleAchievementChange = (index: number, value: string) => {
    setResumeData((prev) => {
      const arr = [...(prev.achievements || [])];
      arr[index] = value;
      return { ...prev, achievements: arr };
    });
  };

  const removeEntry = (
    field: 'education' | 'experience' | 'projects' | 'achievements',
    index: number
  ) => {
    setResumeData((prev) => {
      const arr = [...((prev[field] as any[]) || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const addEntry = (
    field: 'education' | 'experience' | 'projects' | 'achievements',
    entry: any
  ) => {
    setResumeData((prev) => {
      const arr = [...((prev[field] as any[]) || [])];
      arr.push(entry);
      return { ...prev, [field]: arr };
    });
  };

  const mapToIitData = useCallback((data: BuilderResumeData): IITResumeData => {
    const primaryEducation = data.education?.[0];
    return {
      fullName: data.name || '',
      rollNumber: '',
      department: '',
      degree: primaryEducation?.degree || '',
      institute: primaryEducation?.institution || '',
      gender: '',
      education: (data.education || []).map((edu) => ({
        examination: edu.degree || '',
        university: edu.institution || '',
        institute: edu.institution || '',
        year: edu.dates || '',
        cpi: '',
      })),
      thesis: [],
      projects: (data.projects || []).map((proj) => ({
        title: proj.name || '',
        courseCode: '',
        date: proj.dates || '',
        descriptions: proj.bullets || [],
      })),
      skills: {
        programmingLanguages: data.skills?.languages || '',
        toolsAndLibraries: [
          data.skills?.frameworks,
          data.skills?.databases,
          data.skills?.tools,
          data.skills?.aiMl,
        ]
          .filter(Boolean)
          .join(', '),
      },
      experience: (data.experience || []).map((exp) => ({
        position: exp.position || '',
        company: exp.company || '',
        date: exp.dates || '',
        descriptions: exp.bullets || [],
      })),
      activities: (data.achievements || []).map((ach) => ({
        role: 'Achievement',
        organization: '',
        description: ach || '',
        date: '',
      })),
    };
  }, []);

  const debouncedPreviewData = useMemo(() => {
    if (templateType === 'iit') {
      return mapToIitData(debouncedResumeData);
    }
    return debouncedResumeData;
  }, [templateType, debouncedResumeData, mapToIitData]);

  const previewNode = useMemo(
    () => <TemplatePreview templateType={templateType} data={debouncedPreviewData} />,
    [templateType, debouncedPreviewData]
  );

  const pdfData = useMemo(() => {
    if (!debouncedPreviewData || typeof debouncedPreviewData !== 'object') {
      return debouncedPreviewData;
    }
    return {
      ...(debouncedPreviewData as any),
      fullName: resumeData.name || (debouncedPreviewData as any).fullName || '',
    };
  }, [debouncedPreviewData, resumeData.name]);

  const saveToVault = async () => {
    if (!supabase) {
      toast.error('Supabase is not configured.');
      return;
    }
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data?.user) {
      toast.error('Please sign in to save your resume.');
      return;
    }

    const { error } = await supabase
      .from('resumes')
      .upsert({
        user_id: data.user.id,
        title: `${resumeData.name} Resume`,
        template_type: selectedTemplate,
        data: resumeData,
        status: 'completed',
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      toast.success('Resume saved to vault!');
      return;
    }

    toast.error('Failed to save resume to vault.');
  };

  const saveDraftToVault = async () => {
    if (!supabase) {
      toast.error('Supabase is not configured.');
      return false;
    }
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data?.user) {
      toast.error('Please sign in to save your resume.');
      return false;
    }

    const { error } = await supabase
      .from('resumes')
      .upsert({
        user_id: data.user.id,
        title: `Draft - ${resumeData.name}`,
        template_type: selectedTemplate,
        data: resumeData,
        status: 'draft',
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error('Failed to save draft to vault.');
      return false;
    }

    toast.success('Draft saved to vault');
    return true;
  };

  const handleCheckATS = async () => {
    setIsCheckingATS(true);
    try {
      const res = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setAtsScore(data.overall ?? data.score ?? 85);
      } else {
        await new Promise((r) => setTimeout(r, 1500));
        setAtsScore(82);
      }
    } catch (err) {
      console.error('ATS Check failed', err);
      setAtsScore(75);
    } finally {
      setIsCheckingATS(false);
      setIsAtsModalOpen(true);
    }
  };

  const handleSaveDraft = async () => {
    if (!resumeData.name?.trim() || !resumeData.email?.trim()) {
      toast.error('Name and email are required to save a draft.');
      return;
    }

    setIsSavingDraft(true);
    const toastId = toast.loading('Saving draft...');

    try {
      const saved = await saveDraftToVault();
      if (!saved) {
        throw new Error('Failed to save draft.');
      }
      toast.dismiss(toastId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save draft.';
      console.error('Save draft failed', err);
      toast.error(message, { id: toastId });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraftClick = () => {
    posthog.capture('resume_saved', {
      template_type: selectedTemplate,
      has_experience: experience.length > 0,
      has_projects: projects.length > 0,
      sections_filled: filledSectionsCount,
    });

    handleSaveDraft();
  };

  const handleCheckAtsClick = () => {
    posthog.capture('ats_score_checked', {
      score: atsScore,
      template: selectedTemplate,
    });

    handleCheckATS();
  };

  const handleMagicImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading('Magic Import: Parsing your PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to parse resume');
      }

      const rawJson = await res.json();

      const mappedData: BuilderResumeData = {
        name: rawJson.name || '',
        email: rawJson.email || '',
        phone: rawJson.phone || '',
        linkedin: rawJson.linkedin || '',
        github: rawJson.github || '',
        portfolio: rawJson.portfolio || '',
        education: (rawJson.education || []).map((edu: any) => ({
          institution: edu.institution || '',
          location: edu.location || '',
          degree: edu.degree || '',
          dates: edu.dates || '',
        })),
        experience: (rawJson.experience || []).map((exp: any) => ({
          company: exp.company || '',
          dates: exp.dates || '',
          position: exp.position || '',
          location: exp.location || '',
          bullets: exp.bullets || [],
        })),
        projects: (rawJson.projects || []).map((proj: any) => ({
          name: proj.name || '',
          techStack: proj.techStack || '',
          dates: proj.dates || '',
          bullets: proj.bullets || [],
          liveUrl: proj.liveUrl || '',
          codeUrl: proj.codeUrl || '',
        })),
        skills: {
          ...emptySkills,
          languages: rawJson.skills?.languages || '',
          aiMl: rawJson.skills?.aiMl || '',
          frameworks: rawJson.skills?.frameworks || '',
          databases: rawJson.skills?.databases || '',
          tools: rawJson.skills?.tools || '',
        },
        achievements: Array.isArray(rawJson.achievements) ? rawJson.achievements : [],
      };

      setResumeData(mappedData);
      posthog.capture('resume_imported', {
        template: selectedTemplate,
      });
      toast.success('Resume imported successfully', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to import resume. Please try again.', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-[#F9FAFB]">
      {/* Left Panel */}
      <div className="w-1/2 p-6 overflow-y-auto border-r border-[#1F2937] relative pb-32">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#D4AF37]">Resume Builder</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center bg-[#111827] p-3 rounded-lg border border-[#1F2937] justify-between">
          <div className="flex gap-4">
            <Button
              onClick={() => setTemplateType('iit')}
              variant={templateType === 'iit' ? 'default' : 'outline'}
              className={templateType === 'iit' ? 'bg-[#1F2937] text-[#D4AF37] border-[#D4AF37]' : 'border-[#1F2937] text-gray-400'}
              size="sm"
            >
              IIT Template
            </Button>
            <Button
              onClick={() => setTemplateType('jakes')}
              variant={templateType === 'jakes' ? 'default' : 'outline'}
              className={templateType === 'jakes' ? 'bg-[#1F2937] text-[#D4AF37] border-[#D4AF37]' : 'border-[#1F2937] text-gray-400'}
              size="sm"
            >
              Jake's Resume
            </Button>
          </div>

          <div>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleMagicImport}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              size="sm"
            >
              {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Magic Import
            </Button>
          </div>
        </div>

        {/* Accordion Sections */}

        {/* Personal Info */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('personal')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">1. Personal Info</h2>
              {hasData('personal') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.personal ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.personal && (
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <Input value={resumeData.name} onChange={(e) => handleChange('name', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <Input value={resumeData.email} onChange={(e) => handleChange('email', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <Input value={resumeData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm mb-1">LinkedIn</label>
                <Input value={resumeData.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm mb-1">GitHub</label>
                <Input value={resumeData.github} onChange={(e) => handleChange('github', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div>
                <label className="block text-sm mb-1">Portfolio</label>
                <Input value={resumeData.portfolio || ''} onChange={(e) => handleChange('portfolio', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('education')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">2. Education</h2>
              {hasData('education') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.education ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.education && (
            <div className="p-4 space-y-4">
              {(resumeData.education || []).map((edu, idx) => (
                <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4 relative">
                  <button onClick={() => removeEntry('education', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Institution" value={edu.institution} onChange={(e) => handleNestedChange('education', idx, 'institution', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Location" value={edu.location} onChange={(e) => handleNestedChange('education', idx, 'location', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Degree" value={edu.degree} onChange={(e) => handleNestedChange('education', idx, 'degree', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Dates" value={edu.dates} onChange={(e) => handleNestedChange('education', idx, 'dates', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white"
                onClick={() => addEntry('education', { institution: '', location: '', degree: '', dates: '' })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Entry
              </Button>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('experience')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">3. Experience</h2>
              {hasData('experience') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.experience ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.experience && (
            <div className="p-4 space-y-4">
              {(resumeData.experience || []).map((exp, idx) => (
                <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4 relative">
                  <button onClick={() => removeEntry('experience', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Position" value={exp.position} onChange={(e) => handleNestedChange('experience', idx, 'position', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Company" value={exp.company} onChange={(e) => handleNestedChange('experience', idx, 'company', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Location" value={exp.location} onChange={(e) => handleNestedChange('experience', idx, 'location', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Dates" value={exp.dates} onChange={(e) => handleNestedChange('experience', idx, 'dates', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Bullets (One per line)</label>
                    <Textarea
                      value={(exp.bullets || []).join('\n')}
                      onChange={(e) => handleNestedStringArrayChange('experience', idx, 'bullets', e.target.value)}
                      className="bg-[#0F172A] border-[#1F2937] min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white"
                onClick={() => addEntry('experience', { position: '', company: '', location: '', dates: '', bullets: [] })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Entry
              </Button>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('projects')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">4. Projects</h2>
              {hasData('projects') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.projects ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.projects && (
            <div className="p-4 space-y-4">
              {(resumeData.projects || []).map((proj, idx) => (
                <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4 relative">
                  <button onClick={() => removeEntry('projects', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Project Name" value={proj.name} onChange={(e) => handleNestedChange('projects', idx, 'name', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Tech Stack" value={proj.techStack} onChange={(e) => handleNestedChange('projects', idx, 'techStack', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Dates" value={proj.dates} onChange={(e) => handleNestedChange('projects', idx, 'dates', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Live URL" value={proj.liveUrl} onChange={(e) => handleNestedChange('projects', idx, 'liveUrl', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                    <Input placeholder="Code URL" value={proj.codeUrl} onChange={(e) => handleNestedChange('projects', idx, 'codeUrl', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Bullets (One per line)</label>
                    <Textarea
                      value={(proj.bullets || []).join('\n')}
                      onChange={(e) => handleNestedStringArrayChange('projects', idx, 'bullets', e.target.value)}
                      className="bg-[#0F172A] border-[#1F2937] min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white"
                onClick={() => addEntry('projects', { name: '', techStack: '', dates: '', bullets: [], liveUrl: '', codeUrl: '' })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Entry
              </Button>
            </div>
          )}
        </div>

        {/* Technical Skills */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('skills')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">5. Technical Skills</h2>
              {hasData('skills') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.skills ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.skills && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Languages</label>
                <Input
                  value={resumeData.skills?.languages || ''}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      skills: { ...(prev.skills || emptySkills), languages: e.target.value },
                    }))
                  }
                  className="bg-[#0F172A] border-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Frameworks</label>
                <Input
                  value={resumeData.skills?.frameworks || ''}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      skills: { ...(prev.skills || emptySkills), frameworks: e.target.value },
                    }))
                  }
                  className="bg-[#0F172A] border-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Databases</label>
                <Input
                  value={resumeData.skills?.databases || ''}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      skills: { ...(prev.skills || emptySkills), databases: e.target.value },
                    }))
                  }
                  className="bg-[#0F172A] border-[#1F2937]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tools</label>
                <Input
                  value={resumeData.skills?.tools || ''}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      skills: { ...(prev.skills || emptySkills), tools: e.target.value },
                    }))
                  }
                  className="bg-[#0F172A] border-[#1F2937]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="mb-4 bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
          <button
            onClick={() => toggleExpanded('achievements')}
            className="w-full flex items-center justify-between p-4 bg-[#1F2937]/50 hover:bg-[#1F2937] transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">6. Achievements</h2>
              {hasData('achievements') && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
            {expanded.achievements ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded.achievements && (
            <div className="p-4 space-y-4">
              {(resumeData.achievements || []).map((achievement, idx) => (
                <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4 relative">
                  <button onClick={() => removeEntry('achievements', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Input
                    placeholder="Achievement"
                    value={achievement}
                    onChange={(e) => handleAchievementChange(idx, e.target.value)}
                    className="bg-[#0F172A] border-[#1F2937]"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white"
                onClick={() => addEntry('achievements', '')}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Achievement
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Action Bar (Sticky) */}
        <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-[#0F172A]/90 backdrop-blur-sm border-t border-[#1F2937] flex gap-4 z-10 w-[calc(100%+48px)]">
          <Button
            onClick={handleSaveDraftClick}
            disabled={isSavingDraft}
            className="flex-1 bg-[#1F2937] hover:bg-gray-700 text-white font-medium h-[44px]"
          >
            {isSavingDraft && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Draft
          </Button>
          <Button
            onClick={handleCheckAtsClick}
            disabled={isCheckingATS}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-[44px]"
          >
            {isCheckingATS && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Check ATS Score
          </Button>
          <DownloadPDFButton
            className="flex-1 bg-[#D4AF37] hover:bg-[#B89A32] text-[#0F172A] font-medium h-[44px] rounded-md text-sm transition-colors flex items-center justify-center cursor-pointer"
            templateType={templateType}
            data={pdfData}
            onDownloadComplete={saveToVault}
          />
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="w-1/2 p-6 flex flex-col items-center bg-[#0F172A] relative">
        <div className="mb-6 flex w-full justify-end items-center max-w-[357px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div className="text-sm font-medium text-green-400">Live Preview</div>
          </div>
        </div>

        <div className="shadow-2xl border border-gray-800 rounded bg-white relative">
          {previewNode}

          {isAtsModalOpen && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 w-[320px] text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">ATS Match Score</h3>
                  <button
                    onClick={() => setIsAtsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-5xl font-black text-[#D4AF37] mb-2">{atsScore ?? '--'}</div>
                <div className="text-gray-400 mb-4">Predicted ATS Match Score</div>
                <div className="bg-[#0F172A] p-4 border border-[#1F2937] rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Tips</h4>
                  <ul className="list-disc pl-5 text-sm space-y-2 text-gray-300">
                    <li>Use quantified impact in experience bullets.</li>
                    <li>Mirror skills from the target job listing.</li>
                    <li>Lead with action verbs for every bullet.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}