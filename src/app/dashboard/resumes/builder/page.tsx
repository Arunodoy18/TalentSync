"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, FileText, CheckCircle2, Sparkles, Plus, Loader2, Download, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/resume/PDFDocument";
import { IITBombayTemplate } from "@/components/resume/IITBombayTemplate";
import { JakesTemplate } from "@/components/resume/JakesTemplate";

const sections = [
  { id: "basics", title: "Basic Info", desc: "Contact details and summary" },
  { id: "experience", title: "Experience", desc: "Your past roles" },
  { id: "projects", title: "Projects", desc: "Your Master Vault of 50+ Projects" },
  { id: "education", title: "Education", desc: "Degrees and certifications" },
  { id: "skills", title: "Skills", desc: "Technical & soft skills" },
];

export default function ResumeBuilderPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [activeSection, setActiveSection] = useState(sections[0].id);

  const [basics, setBasics] = useState({ name: "", email: "", phone: "", location: "", summary: "", github: "", linkedin: "" });
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState("");
  const [templateFormat, setTemplateFormat] = useState<"auto" | "iit" | "jake">("auto");

  const [generating, setGenerating] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes/parse", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Mass-update state with LLM parsed struct
        if (data.basics) setBasics(data.basics);
        if (data.experience) setExperience(data.experience);
        if (data.projects) setProjects(data.projects.map((p: any) => ({ ...p, selected: true }))); // Auto-select parsed projects
        if (data.education) setEducation(data.education);
        if (data.skills) setSkills(data.skills);
      } else {
        alert("Failed to parse resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing resume.");
    } finally {
      setParsingResume(false);
    }
  };

  const generateBullet = async (index: number) => {
    setGenerating(true);
    try {
      const resp = await fetch("/api/ats/bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_verb: "Developed",
          task: "a new microservice architecture",
          tools: ["Node.js", "Docker", "AWS"],
          impact: "improving system uptime by 99%"
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        const updated = [...experience];
        updated[index].bullets = updated[index].bullets || [];
        updated[index].bullets.push(data.bullet_point);
        setExperience(updated);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <h2 className="text-2xl font-bold mb-4 text-indigo-100">Resume Builder</h2>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "text-left p-4 rounded-[16px] transition-all duration-300",
              activeSection === section.id 
                ? "bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.4)] shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                : "hover:bg-[rgba(255,255,255,0.05)] border border-transparent text-indigo-300"
            )}
          >
            <h3 className={cn("font-semibold mb-1", activeSection === section.id ? "text-indigo-100" : "text-indigo-200")}>{section.title}</h3>
            <p className="text-xs text-indigo-400 opacity-80">{section.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto app-surface p-6 rounded-[24px]">
        
        {/* Magic File Upload Zone */}
        {activeSection === "basics" && basics.name === "" && experience.length === 0 && (
          <div className="w-full relative group mb-8 rounded-xl border-2 border-dashed border-indigo-400 bg-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.1)] transition-colors p-8 text-center flex flex-col items-center justify-center cursor-pointer">
             <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
             {parsingResume ? (
                <>
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">AI is reading your resume...</h3>
                  <p className="text-sm text-indigo-300">Extracting projects, skills, and experience into your Master Vault.</p>
                </>
             ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">Magic Import (Highly Recommended)</h3>
                  <p className="text-sm text-indigo-300 max-w-md mx-auto">Skip typing. Drag and drop your old PDF resume right here. Our LLM will instantly parse it perfectly into your Master Vault.</p>
                </>
             )}
          </div>
        )}

        {activeSection === "basics" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-300">Full Name</label>
                <Input value={basics.name} onChange={e => setBasics({...basics, name: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-300">Email</label>
                <Input value={basics.email} onChange={e => setBasics({...basics, email: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-300">Phone</label>
                <Input value={basics.phone} onChange={e => setBasics({...basics, phone: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-300">Location</label>
                <Input value={basics.location} onChange={e => setBasics({...basics, location: e.target.value})} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]" placeholder="San Francisco, CA" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-indigo-300">Professional Summary</label>
              <Textarea 
                value={basics.summary} 
                onChange={e => setBasics({...basics, summary: e.target.value})}
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] min-h-[120px]" 
                placeholder="Software engineer with 5+ years..." 
              />
            </div>
            <div className="flex justify-end">
               <Button onClick={() => setActiveSection("experience")}>Next: Experience <ChevronRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </div>
        )}

        {activeSection === "experience" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Work Experience</h3>
              <Button size="sm" variant="outline" onClick={() => setExperience([...experience, { company:"", role:"", start:"", end:"", bullets: [] }])}>
                <Plus className="mr-2 h-4 w-4"/> Add Role
              </Button>
            </div>
            
            {experience.length === 0 ? (
               <div className="text-center py-10 border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-[16px]">
                  <p className="text-indigo-300">No experience added yet.</p>
               </div>
            ) : (
              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <Card key={i} className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">Company</label>
                           <Input value={exp.company} onChange={e => {const n=[...experience]; n[i].company=e.target.value; setExperience(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="Acme Inc."/>
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">Role</label>
                           <Input value={exp.role} onChange={e => {const n=[...experience]; n[i].role=e.target.value; setExperience(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="Senior Engineer"/>
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-indigo-300">FAANG Bullets</label>
                            <Button size="sm" variant="secondary" onClick={() => generateBullet(i)} disabled={generating}>
                              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                              AI Generate Tool
                            </Button>
                         </div>
                         <ul className="list-disc pl-5 text-indigo-100 space-y-2 text-sm mt-3">
                            {(exp.bullets || []).map((b: string, idx: number) => (
                              <li key={idx} className="bg-[rgba(255,255,255,0.05)] p-2 rounded-md">{b}</li>
                            ))}
                         </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex justify-end">
               <Button onClick={() => setActiveSection("projects")}>Next: Projects Vault <ChevronRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Master Projects Vault</h3>
                <p className="text-sm text-indigo-300">Add all 50+ of your projects here. Only check the box to include them in THIS specific resume variant.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setProjects([...projects, { name:"", technologies:"", link:"", github:"", bullets: [], selected: false }])}>
                <Plus className="mr-2 h-4 w-4"/> Add Project to Vault
              </Button>
            </div>
            
            {projects.length === 0 ? (
               <div className="text-center py-10 border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-[16px]">
                  <p className="text-indigo-300">No projects added yet.</p>
               </div>
            ) : (
              <div className="space-y-8">
                {projects.map((proj, i) => (
                  <Card key={i} className={cn("border transition-colors", proj.selected ? "border-indigo-500 bg-[rgba(99,102,241,0.05)]" : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]")}>
                    <CardContent className="p-6 space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-4 mb-2">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-gray-400 bg-transparent text-indigo-600 focus:ring-indigo-500" 
                            checked={proj.selected} 
                            onChange={(e) => {const n=[...projects]; n[i].selected=e.target.checked; setProjects(n);}} 
                          />
                          <span className={cn("font-bold text-sm transition-colors", proj.selected ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-300")}>
                            {proj.selected ? "Included in PDF" : "Excluded from PDF"}
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">Project Name</label>
                           <Input value={proj.name} onChange={e => {const n=[...projects]; n[i].name=e.target.value; setProjects(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="AI Next.js Platform"/>
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">Technologies</label>
                           <Input value={proj.technologies} onChange={e => {const n=[...projects]; n[i].technologies=e.target.value; setProjects(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="React, Python, Redis"/>
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">GitHub Link</label>
                           <Input value={proj.github} onChange={e => {const n=[...projects]; n[i].github=e.target.value; setProjects(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="github.com/your-repo"/>
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-indigo-300">Live Link</label>
                           <Input value={proj.link} onChange={e => {const n=[...projects]; n[i].link=e.target.value; setProjects(n);}} className="bg-[rgba(255,255,255,0.05)] border-transparent" placeholder="app.domain.com"/>
                         </div>
                      </div>
                      
                      <div className="space-y-2 mt-2">
                         <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-indigo-300">Bullet Points</label>
                         </div>
                         <Textarea 
                            className="bg-[rgba(255,255,255,0.05)] border-transparent text-sm min-h-[80px]" 
                            placeholder="• Built x using y resulting in z (Add bullets separated by newlines)"
                            value={(proj.bullets || []).join('\n')}
                            onChange={e => {
                               const n=[...projects]; 
                               n[i].bullets=e.target.value.split('\n').filter(Boolean); 
                               setProjects(n);
                            }}
                         />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex justify-end">
               <Button onClick={() => setActiveSection("education")}>Next: Education <ChevronRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </div>
        )}

        {activeSection === "education" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Education</h3>
            <p className="text-indigo-300 mb-6">Will fetch from your base resume...</p>
             <div className="flex justify-end">
               <Button onClick={() => setActiveSection("skills")}>Next: Skills <ChevronRight className="ml-2 h-4 w-4"/></Button>
            </div>
          </div>
        )}

        {activeSection === "skills" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
            <Textarea 
               value={skills} 
               onChange={e => setSkills(e.target.value)}
               className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] min-h-[120px]" 
               placeholder="React, Node.js, Python, AWS..." 
            />
            <div className="flex justify-end">
               <Button variant="default" className="bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)]">
                 <CheckCircle2 className="mr-2 h-4 w-4"/> Ensure Save & Score
               </Button>
            </div>
          </div>
        )}
      </div>

      {/* Live ATS Preview */}
      <div className="hidden lg:flex flex-col w-96 flex-shrink-0 bg-white rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-y-auto">
         <div className="mb-4">
           <h3 className="font-bold text-black border-b border-gray-200 pb-2 mb-3 flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              Live ATS Template
           </h3>
           <div className="flex bg-gray-100 p-1 rounded-lg gap-1 border border-gray-200 mb-4">
             <button onClick={() => setTemplateFormat("auto")} className={cn("flex-1 text-xs font-bold py-1.5 px-2 rounded-md transition-colors", templateFormat === "auto" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200")}>AI Auto</button>
             <button onClick={() => setTemplateFormat("iit")} className={cn("flex-1 text-xs font-bold py-1.5 px-2 rounded-md transition-colors", templateFormat === "iit" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200")}>IIT Bombay</button>
             <button onClick={() => setTemplateFormat("jake")} className={cn("flex-1 text-xs font-bold py-1.5 px-2 rounded-md transition-colors", templateFormat === "jake" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200")}>Jake's Tech</button>
           </div>
           
           <div className="flex justify-end">
             {isClient ? (
               <PDFDownloadLink
                  document={
                    templateFormat === "auto" ? <ResumePDF basics={basics} experience={experience} education={education} skills={skills} /> :
                    templateFormat === "iit" ? <IITBombayTemplate basics={basics} experience={experience} education={education} skills={skills} /> :
                    <JakesTemplate basics={basics} experience={experience} education={education} projects={projects.filter(p => p.selected)} skills={skills} />
                  }
                  fileName={`resume-${basics.name.replace(/\s+/g, '-').toLowerCase() || 'draft'}.pdf`}
               >
                 {/* @ts-ignore */}
                 {({ loading }) => (
                   <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md w-full">
                     {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                     {loading ? "" : "Export PDF"}
                   </Button>
                 )}
               </PDFDownloadLink>
             ) : (
               <Button size="sm" className="bg-indigo-600/50 cursor-not-allowed text-white rounded-full shadow-md w-full">
                 <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading PDF Engine...
               </Button>
             )}
           </div>
         </div>
         
         <div className="text-gray-900 border border-gray-100 p-8 h-full shadow-sm bg-white overflow-hidden text-[10px]">
            <div className="text-center text-xs text-gray-400 mb-6 bg-gray-50 py-4 border border-dashed border-gray-200 rounded">
               {templateFormat === "auto" && "Previewing AI Auto-Tailor Layout (Rendered upon export)"}
               {templateFormat === "iit" && "Previewing IIT Bombay Grid (Rendered upon export)"}
               {templateFormat === "jake" && "Previewing Jake's Classic Serif (Rendered upon export)"}
            </div>

            <div className="text-center font-bold text-2xl uppercase mb-1">{basics.name || "YOUR NAME"}</div>
            <div className="text-center text-xs text-gray-500 mb-6">
              {basics.email || "email@address.com"} • {basics.phone || "Phone"} • {basics.location || "City, State"}
            </div>
            
            <div className="uppercase text-sm font-bold border-b border-black mb-2 pb-1">Summary</div>
            <p className="text-xs mb-4 text-gray-700 leading-relaxed">{basics.summary || "Summary goes here..."}</p>

            <div className="uppercase text-sm font-bold border-b border-black mb-2 pb-1">Experience</div>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                   <div className="flex justify-between text-xs font-bold">
                     <span>{exp.role || "Role"} - {exp.company}</span>
                   </div>
                   <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-gray-700">
                     {(exp.bullets || []).map((b: string, idx: number) => <li key={idx}>{b}</li>)}
                   </ul>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}