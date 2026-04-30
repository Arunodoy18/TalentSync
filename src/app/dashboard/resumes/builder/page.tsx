'use client';

import React, { useState } from 'react';
import { TemplatePreview, DownloadPDFButton } from '@/components/resume/templates/TemplatePreview';
import { IITResumeData, sampleData } from '@/components/resume/templates/IITTemplate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<IITResumeData>(sampleData);
  const [templateType, setTemplateType] = useState<'iit' | 'jakes'>('iit');

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

  const handleArrayStringChange = (
    field: keyof IITResumeData, 
    index: number, 
    key: string, 
    arrIndex: number, 
    value: string
  ) => {
    setResumeData((prev) => {
      const arr = [...(prev[field] as any[])];
      const items = [...arr[index][key]];
      items[arrIndex] = value;
      arr[index] = { ...arr[index], [key]: items };
      return { ...prev, [field]: arr };
    });
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-[#F9FAFB]">
      {/* Left Panel: Form */}
      <div className="w-1/2 p-6 overflow-y-auto border-r border-[#1F2937] pb-32">
        <h1 className="text-2xl font-bold mb-6 text-[#D4AF37]">Resume Builder</h1>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setTemplateType('iit')}
            variant={templateType === 'iit' ? 'default' : 'outline'}
            className={templateType === 'iit' ? 'bg-[#D4AF37] text-black' : ''}
          >
            IIT Template
          </Button>
          <Button 
            onClick={() => setTemplateType('jakes')}
            variant={templateType === 'jakes' ? 'default' : 'outline'}
            className={templateType === 'jakes' ? 'bg-[#D4AF37] text-black' : ''}
          >
            Jake's Template
          </Button>
        </div>

        {/* Basic Info */}
        <section className="space-y-4 mb-8 bg-[#111827] p-4 rounded-xl border border-[#1F2937]">
          <h2 className="text-xl font-semibold">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <Input 
                value={resumeData.fullName} 
                onChange={(e) => handleChange('fullName', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Roll Number</label>
              <Input 
                value={resumeData.rollNumber} 
                onChange={(e) => handleChange('rollNumber', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Department</label>
              <Input 
                value={resumeData.department} 
                onChange={(e) => handleChange('department', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Degree</label>
              <Input 
                value={resumeData.degree} 
                onChange={(e) => handleChange('degree', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Institute</label>
              <Input 
                value={resumeData.institute} 
                onChange={(e) => handleChange('institute', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Gender</label>
              <Input 
                value={resumeData.gender} 
                onChange={(e) => handleChange('gender', e.target.value)} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
          </div>
        </section>

        {/* Technical Skills */}
        <section className="space-y-4 mb-8 bg-[#111827] p-4 rounded-xl border border-[#1F2937]">
          <h2 className="text-xl font-semibold">Technical Skills</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Programming Languages</label>
              <Input 
                value={resumeData.skills.programmingLanguages} 
                onChange={(e) => setResumeData(prev => ({...prev, skills: {...prev.skills, programmingLanguages: e.target.value}}))} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Tools and Libraries</label>
              <Input 
                value={resumeData.skills.toolsAndLibraries} 
                onChange={(e) => setResumeData(prev => ({...prev, skills: {...prev.skills, toolsAndLibraries: e.target.value}}))} 
                className="bg-[#0F172A] border-[#1F2937]"
              />
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="space-y-4 mb-8 bg-[#111827] p-4 rounded-xl border border-[#1F2937]">
          <h2 className="text-xl font-semibold">Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Examination" value={edu.examination} onChange={(e) => handleNestedChange('education', idx, 'examination', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="University" value={edu.university} onChange={(e) => handleNestedChange('education', idx, 'university', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Institute" value={edu.institute} onChange={(e) => handleNestedChange('education', idx, 'institute', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Year" value={edu.year} onChange={(e) => handleNestedChange('education', idx, 'year', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="CPI / %" value={edu.cpi} onChange={(e) => handleNestedChange('education', idx, 'cpi', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className="space-y-4 mb-8 bg-[#111827] p-4 rounded-xl border border-[#1F2937]">
          <h2 className="text-xl font-semibold">Course Projects</h2>
          {resumeData.projects.map((proj, idx) => (
            <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Project Title" value={proj.title} onChange={(e) => handleNestedChange('projects', idx, 'title', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Course Code" value={proj.courseCode} onChange={(e) => handleNestedChange('projects', idx, 'courseCode', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Date" value={proj.date} onChange={(e) => handleNestedChange('projects', idx, 'date', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Descriptions</label>
                {proj.descriptions.map((desc, dIdx) => (
                  <Textarea 
                    key={dIdx} 
                    value={desc} 
                    onChange={(e) => handleArrayStringChange('projects', idx, 'descriptions', dIdx, e.target.value)}
                    className="bg-[#0F172A] border-[#1F2937]"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Experience */}
        <section className="space-y-4 mb-8 bg-[#111827] p-4 rounded-xl border border-[#1F2937]">
          <h2 className="text-xl font-semibold">Experience & Internships</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="p-4 border border-[#1F2937] rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Position" value={exp.position} onChange={(e) => handleNestedChange('experience', idx, 'position', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Company" value={exp.company} onChange={(e) => handleNestedChange('experience', idx, 'company', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
                <Input placeholder="Date" value={exp.date} onChange={(e) => handleNestedChange('experience', idx, 'date', e.target.value)} className="bg-[#0F172A] border-[#1F2937]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Descriptions</label>
                {exp.descriptions.map((desc, dIdx) => (
                  <Textarea 
                    key={dIdx} 
                    value={desc} 
                    onChange={(e) => handleArrayStringChange('experience', idx, 'descriptions', dIdx, e.target.value)}
                    className="bg-[#0F172A] border-[#1F2937]"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

      </div>

      {/* Right Panel: Preview */}
      <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-[#0F172A]">
        <div className="mb-4">
          <DownloadPDFButton templateType={templateType} data={resumeData} />
        </div>
        <div className="shadow-2xl border border-gray-800 rounded bg-white">
          <TemplatePreview templateType={templateType} data={resumeData} />
        </div>
      </div>
    </div>
  );
}
