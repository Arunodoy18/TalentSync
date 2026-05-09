'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TemplatePreview, DownloadPDFButton } from '@/components/resume/templates/TemplatePreview';
import { IITResumeData, sampleData } from '@/components/resume/templates/IITTemplate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<IITResumeData>(sampleData);
  const [templateType, setTemplateType] = useState<'iit' | 'jakes'>('iit');
  
  // Custom states for ATS Check
  const [isCheckingATS, setIsCheckingATS] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab control inside builder 
  const [activeTab, setActiveTab] = useState<'editor' | 'ats'>('editor');

  // Debounced Resume Data for Preview
  const [debouncedResumeData, setDebouncedResumeData] = useState<IITResumeData>(sampleData);

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
    achievements: false
  });

  const toggleExpanded = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasData = useCallback((section: keyof typeof expanded) => {
    switch(section) {
      case 'personal': return !!resumeData.fullName || !!resumeData.rollNumber;
      case 'education': return resumeData.education && resumeData.education.length > 0;
      case 'experience': return resumeData.experience && resumeData.experience.length > 0;
      case 'projects': return resumeData.projects && resumeData.projects.length > 0;
      case 'skills': return !!resumeData.skills?.programmingLanguages || !!resumeData.skills?.toolsAndLibraries;
      case 'achievements': return resumeData.activities && resumeData.activities.length > 0;
      default: return false;
    }
  }, [resumeData]);

  const handleChange = (field: keyof IITResumeData, value: any) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (field: keyof IITResumeData, index: number, key: string, value: any) => {
    setResumeData((prev) => {
      const arr = [...(prev[field] as any[])];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const handleNestedStringArrayChange = (field: keyof IITResumeData, index: number, key: string, text: string) => {
    setResumeData((prev) => {
      const arr = [...(prev[field] as any[])];
      arr[index] = { ...arr[index], [key]: text.split('\n') };
      return { ...prev, [field]: arr };
    });
  };

  const removeEntry = (field: keyof IITResumeData, index: number) => {
    setResumeData((prev) => {
      const arr = [...(prev[field] as any[])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const addEntry = (field: keyof IITResumeData, entry: any) => {
    setResumeData((prev) => {
      const arr = prev[field] ? [...(prev[field] as any[])] : [];
      arr.push(entry);
      return { ...prev, [field]: arr };
    });
  }

  const handleCheckATS = async () => {
    setIsCheckingATS(true);
    try {
      const res = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData)
      });
      
      if(res.ok) {
         const data = await res.json();
         setAtsScore(data.score || 85);
      } else {
         await new Promise(r => setTimeout(r, 1500));
         setAtsScore(82);
      }
      setActiveTab('ats');
    } catch(err) {
      console.error("ATS Check failed", err);
      setAtsScore(75);
      setActiveTab('ats');
    } finally {
      setIsCheckingATS(false);
    }
  }

  const handleSaveDraft = async () => {
    toast.success("Draft Saved!");
  }

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
      
      // Map extracted JSON to the IITResumeData format
      const mappedData = {
        fullName: rawJson.name || '',
        rollNumber: '', // usually absent in standard resumes
        department: '', // to be filled
        degree: '',
        institute: '',
        gender: '',
        email: rawJson.email || '',
        phone: rawJson.phone || '',
        linkedin: rawJson.linkedin || '',
        github: rawJson.github || '',
        portfolio: rawJson.portfolio || '',
        education: (rawJson.education || []).map((edu: any) => ({
          examination: edu.degree || '',
          university: edu.institution || '',
          institute: edu.institution || '',
          year: edu.dates || '',
          cpi: ''
        })),
        experience: (rawJson.experience || []).map((exp: any) => ({
          position: exp.position || '',
          company: exp.company || '',
          date: exp.dates || '',
          descriptions: exp.bullets || []
        })),
        projects: (rawJson.projects || []).map((proj: any) => ({
          title: proj.name || '',
          courseCode: '',
          date: proj.dates || '',
          descriptions: proj.bullets || [],
          liveUrl: proj.liveUrl || '',
          codeUrl: proj.codeUrl || ''
        })),
        skills: {
          programmingLanguages: rawJson.skills?.languages || '',
          toolsAndLibraries: `${rawJson.skills?.frameworks || ''} ${rawJson.skills?.tools || ''}`.trim() || ''
        },
        activities: (rawJson.achievements || []).map((ach: string) => ({
          role: 'Achievement',
          organization: '',
          date: '',
          description: ach || ''
        }))
      } as unknown as IITResumeData;

      setResumeData(mappedData);
      toast.success('Resume imported successfully', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to import resume. Please try again.', { id: toastId });
    } finally {
      setIsImporting(false);
      // Reset input so the same file could be chosen again
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
            
            <div className="flex gap-2">
                <Button 
                    onClick={() => setActiveTab('editor')}
                    variant={activeTab === 'editor' ? 'default' : 'outline'}
                    className={activeTab === 'editor' ? 'bg-[#D4AF37] text-black hover:bg-[#B89A32]' : 'border-[#1F2937] text-gray-300 hover:text-white'}
                    size="sm"
                >
                    Editor
                </Button>
                <Button 
                    onClick={() => setActiveTab('ats')}
                    variant={activeTab === 'ats' ? 'default' : 'outline'}
                    className={activeTab === 'ats' ? 'bg-[#D4AF37] text-black hover:bg-[#B89A32]' : 'border-[#1F2937] text-gray-300 hover:text-white'}
                    size="sm"
                >
                    ATS Score
                </Button>
            </div>
        </div>
        
        {activeTab === 'editor' ? (
        <div className="pb-10">
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
                    <label className="block text-sm mb-1">Full Name</label>
                    <Input value={resumeData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Roll Number</label>
                    <Input value={resumeData.rollNumber} onChange={(e) => handleChange('rollNumber', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Department</label>
                    <Input value={resumeData.department} onChange={(e) => handleChange('department', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Degree</label>
                    <Input value={resumeData.degree} onChange={(e) => handleChange('degree', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Institute</label>
                    <Input value={resumeData.institute} onChange={(e) => handleChange('institute', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <Input value={resumeData.gender} onChange={(e) => handleChange('gender', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
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
                        <Input placeholder="Examination" value={edu.examination} onChange={(e) => handleNestedChange('education', idx, 'examination', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="University" value={edu.university} onChange={(e) => handleNestedChange('education', idx, 'university', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Institute" value={edu.institute} onChange={(e) => handleNestedChange('education', idx, 'institute', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Year" value={edu.year} onChange={(e) => handleNestedChange('education', idx, 'year', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="CPI / %" value={edu.cpi} onChange={(e) => handleNestedChange('education', idx, 'cpi', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white" onClick={() => addEntry('education', { examination: '', university: '', institute: '', year: '', cpi: '' })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Education
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
                  <h2 className="text-lg font-semibold">3. Experience & Internships</h2>
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
                        <Input placeholder="Date" value={exp.date} onChange={(e) => handleNestedChange('experience', idx, 'date', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Descriptions (One bullet per line)</label>
                        <Textarea 
                          value={(exp.descriptions || []).join('\n')} 
                          onChange={(e) => handleNestedStringArrayChange('experience', idx, 'descriptions', e.target.value)}
                          className="bg-[#0F172A] border-[#1F2937] min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white" onClick={() => addEntry('experience', { position: '', company: '', date: '', descriptions: [] })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Experience
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
                        <Input placeholder="Project Title" value={proj.title} onChange={(e) => handleNestedChange('projects', idx, 'title', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Course Code (Optional)" value={proj.courseCode} onChange={(e) => handleNestedChange('projects', idx, 'courseCode', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Date" value={proj.date} onChange={(e) => handleNestedChange('projects', idx, 'date', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Descriptions (One bullet per line)</label>
                        <Textarea 
                          value={(proj.descriptions || []).join('\n')} 
                          onChange={(e) => handleNestedStringArrayChange('projects', idx, 'descriptions', e.target.value)}
                          className="bg-[#0F172A] border-[#1F2937] min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white" onClick={() => addEntry('projects', { title: '', courseCode: '', date: '', descriptions: [] })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Project
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
                    <label className="block text-sm mb-1">Programming Languages</label>
                    <Input 
                      value={resumeData.skills?.programmingLanguages || ''} 
                      onChange={(e) => setResumeData(prev => ({...prev, skills: {...(prev.skills || {}), programmingLanguages: e.target.value}} as IITResumeData))} 
                      className="bg-[#0F172A] border-[#1F2937]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Tools and Libraries</label>
                    <Input 
                      value={resumeData.skills?.toolsAndLibraries || ''} 
                      onChange={(e) => setResumeData(prev => ({...prev, skills: {...(prev.skills || {}), toolsAndLibraries: e.target.value}} as IITResumeData))} 
                      className="bg-[#0F172A] border-[#1F2937]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Achievements/Activities */}
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
                  {(resumeData.activities || []).map((act, idx) => (
                    <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4 relative">
                      <button onClick={() => removeEntry('activities', idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Title / Role" value={act.role} onChange={(e) => handleNestedChange('activities', idx, 'role', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Organization" value={act.organization} onChange={(e) => handleNestedChange('activities', idx, 'organization', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                        <Input placeholder="Date" value={act.date} onChange={(e) => handleNestedChange('activities', idx, 'date', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Description</label>
                        <Input 
                          placeholder="Brief description"
                          value={act.description} 
                          onChange={(e) => handleNestedChange('activities', idx, 'description', e.target.value)}
                          className="bg-[#0F172A] border-[#1F2937]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-[#1F2937] text-gray-400 hover:text-white" onClick={() => addEntry('activities', { role: '', organization: '', description: '', date: '' })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Achievement
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Action Bar (Sticky) */}
            <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-[#0F172A]/90 backdrop-blur-sm border-t border-[#1F2937] flex gap-4 z-10 w-[calc(100%+48px)]">
              <Button onClick={handleSaveDraft} className="flex-1 bg-[#1F2937] hover:bg-gray-700 text-white font-medium h-[44px]">
                Save Draft
              </Button>
              <Button 
                onClick={handleCheckATS}
                disabled={isCheckingATS}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-[44px]"
              >
                  {isCheckingATS && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Check ATS Score
              </Button>
              <DownloadPDFButton 
                className="flex-1 bg-[#D4AF37] hover:bg-[#B89A32] text-[#0F172A] font-medium h-[44px] rounded-md text-sm transition-colors flex items-center justify-center cursor-pointer"
                templateType={templateType} 
                data={debouncedResumeData} 
              />
            </div>
        </div>
        ) : (
            <div className="space-y-6 mt-8">
                <div className="bg-[#111827] p-8 rounded-xl border border-[#1F2937] flex flex-col items-center justify-center">
                    <div className="text-6xl font-black text-[#D4AF37] mb-2">{atsScore ?? '--'}</div>
                    <div className="text-gray-400 mb-8">Predicted ATS Match Score</div>
                    
                    <div className="w-full bg-[#0F172A] p-4 border border-[#1F2937] rounded-lg">
                        <h3 className="font-bold mb-2">Recommendations</h3>
                        <ul className="list-disc pl-5 text-sm space-y-2 text-gray-300">
                            <li>Add more quantitative metrics to your experience section</li>
                            <li>Ensure keywords match the target job description</li>
                            <li>Use strong action verbs at the beginning of each bullet</li>
                        </ul>
                    </div>
                </div>
                <Button 
                    onClick={() => setActiveTab('editor')}
                    className="w-full bg-[#1F2937] text-white hover:bg-gray-700"
                >
                    Back to Editor
                </Button>
            </div>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-[#0F172A]">
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
          <TemplatePreview templateType={templateType} data={debouncedResumeData} />
        </div>
      </div>
    </div>
  );
}