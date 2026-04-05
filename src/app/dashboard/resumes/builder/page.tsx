"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, FileText, CheckCircle2, Sparkles, Plus, Loader2, Download, UploadCloud, Building2, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/resume/PDFDocument";
import { IITBombayTemplate } from "@/components/resume/IITBombayTemplate";
import { JakesTemplate } from "@/components/resume/JakesTemplate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const sections = [
  { id: "basics", title: "Basic Info", desc: "Contact details and summary" },
  { id: "experience", title: "Experience", desc: "Your past roles" },
  { id: "projects", title: "Projects", desc: "Your Master Vault of 50+ Projects" },
  { id: "education", title: "Education", desc: "Degrees and certifications" },
  { id: "skills", title: "Skills", desc: "Technical & soft skills" },
];

export default function ResumeBuilderPage() {
  const searchParams = useSearchParams();
  const entryMode = searchParams.get("entry") === "ai" ? "ai" : "template";
  const requestedTemplate = searchParams.get("template") === "jake" ? "jake" : "iit";

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [basics, setBasics] = useState({ name: "", email: "", phone: "", location: "", summary: "", github: "", linkedin: "" });
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState("");
  const [templateFormat, setTemplateFormat] = useState<"auto" | "iit" | "jake">("auto");

  useEffect(() => {
    if (entryMode === "ai") {
      setTemplateFormat("auto");
    } else {
      setTemplateFormat(requestedTemplate);
    }
  }, [entryMode, requestedTemplate]);

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
        if (data.basics) setBasics(data.basics);
        if (data.experience) setExperience(data.experience);
        if (data.projects) setProjects(data.projects.map((p: any) => ({ ...p, selected: true })));
        if (data.education) setEducation(data.education);
        if (data.skills) setSkills(data.skills);
      } else {
        const errorData = await response.json().catch(() => null); alert(errorData?.error || "Failed to parse resume.");
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-8 max-w-[1600px] mx-auto w-full">
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-none pb-20 pr-2">
        
        <FadeIn delay={0.1}>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
              {entryMode === "ai" ? "AI Resume Builder" : "Template Resume Builder"}
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              {entryMode === "ai"
                ? "Use AI-first drafting with a single focused resume output."
                : "Choose IIT Bombay or Jake template and export your final resume."}
            </p>
          </div>
        </FadeIn>

        {basics.name === "" && experience.length === 0 && (
           <FadeIn delay={0.2} className="w-full relative group rounded-2xl border-2 border-dashed border-[var(--primary)]/50 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 transition-colors p-8 text-center flex flex-col items-center justify-center cursor-pointer">
             <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
             {parsingResume ? (
                <>
                  <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin mb-3" />
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-1">AI is reading your resume...</h3>
                  <p className="text-sm text-[var(--text-muted)]">Extracting projects, skills, and experience into your Master Vault.</p>
                </>
             ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-[var(--primary)] mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Magic Import (Highly Recommended)</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">Skip typing. Drag and drop your old PDF resume right here. Our LLM will instantly parse it perfectly into your Master Vault.</p>
                </>
             )}
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          <Accordion type="single" collapsible defaultValue="basics" className="space-y-4">
            {/* BASICS */}
            <AccordionItem value="basics" className="border border-[var(--border)] bg-[var(--card)] rounded-[12px] px-6">
              <AccordionTrigger className="hover:no-underline py-5 text-lg font-semibold text-[var(--text)]">
                Basic Information
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)]">Full Name</label>
                    <Input value={basics.name} onChange={e => setBasics({...basics, name: e.target.value})} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)]">Email</label>
                    <Input value={basics.email} onChange={e => setBasics({...basics, email: e.target.value})} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)]">Phone</label>
                    <Input value={basics.phone} onChange={e => setBasics({...basics, phone: e.target.value})} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-muted)]">Location</label>
                    <Input value={basics.location} onChange={e => setBasics({...basics, location: e.target.value})} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="San Francisco, CA" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-muted)]">Professional Summary</label>
                  <Textarea 
                    value={basics.summary} 
                    onChange={e => setBasics({...basics, summary: e.target.value})}
                    className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] min-h-[120px]" 
                    placeholder="Software engineer with 5+ years..." 
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* EXPERIENCE */}
            <AccordionItem value="experience" className="border border-[var(--border)] bg-[var(--card)] rounded-[12px] px-6">
              <AccordionTrigger className="hover:no-underline py-5 text-lg font-semibold text-[var(--text)]">
                Experience
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 space-y-6">
                {experience.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[var(--border)] bg-white/5 rounded-xl">
                      <p className="text-[var(--text-muted)] text-sm">No experience added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {experience.map((exp, i) => (
                      <div key={i} className="p-6 rounded-xl border border-[var(--border)] bg-white/5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-muted)]">Company</label>
                              <Input value={exp.company} onChange={e => {const n=[...experience]; n[i].company=e.target.value; setExperience(n);}} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="Acme Inc."/>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-muted)]">Role</label>
                              <Input value={exp.role} onChange={e => {const n=[...experience]; n[i].role=e.target.value; setExperience(n);}} className="bg-transparent border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]" placeholder="Senior Engineer"/>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                              <label className="text-sm font-semibold text-[var(--primary)] flex items-center">
                                <Sparkles className="h-4 w-4 mr-2" /> FAANG Structure Bullets
                              </label>
                              <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-0" onClick={() => generateBullet(i)} disabled={generating}>
                                {generating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/> : <FileText className="mr-2 h-3.5 w-3.5"/>}
                                Auto-Generate
                              </Button>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--text)] mt-2">
                              {(exp.bullets || []).map((b: string, idx: number) => (
                                <li key={idx} className="bg-white/5 p-3 rounded-md border border-white/5 leading-relaxed">{b}</li>
                              ))}
                            </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full border-dashed border-[var(--border)] bg-transparent hover:bg-white/5 text-[var(--text-muted)] hover:text-white" onClick={() => setExperience([...experience, { company:"", role:"", start:"", end:"", bullets: [] }])}>
                  <Plus className="mr-2 h-4 w-4"/> Add Experience
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* PROJECTS */}
            <AccordionItem value="projects" className="border border-[var(--border)] bg-[var(--card)] rounded-[12px] px-6">
              <AccordionTrigger className="hover:no-underline py-5 text-lg font-semibold text-[var(--text)]">
                Projects
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 space-y-6">
                {projects.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[var(--border)] bg-white/5 rounded-xl">
                      <p className="text-[var(--text-muted)] text-sm">No projects added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map((proj, i) => (
                      <div key={i} className={cn("p-6 rounded-xl border transition-all duration-300 space-y-5", proj.selected ? "border-[var(--primary)]/50 bg-[var(--primary)]/5 shadow-[0_0_15px_rgba(142,182,155,0.05)]" : "border-[var(--border)] bg-white/5")}>
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-gray-600 bg-black/20 text-[var(--primary)] focus:ring-[var(--primary)]" 
                              checked={proj.selected} 
                              onChange={(e) => {const n=[...projects]; n[i].selected=e.target.checked; setProjects(n);}} 
                            />
                            <span className={cn("font-bold text-sm transition-colors uppercase tracking-wider", proj.selected ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text)]")}>
                              {proj.selected ? "Included in active PDF" : "Excluded from active PDF"}
                            </span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-muted)]">Project Name</label>
                              <Input value={proj.name} onChange={e => {const n=[...projects]; n[i].name=e.target.value; setProjects(n);}} className="bg-transparent border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]" placeholder="AI Platform"/>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[var(--text-muted)]">Technologies</label>
                              <Input value={proj.technologies} onChange={e => {const n=[...projects]; n[i].technologies=e.target.value; setProjects(n);}} className="bg-transparent border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)]" placeholder="React, Python"/>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                            <label className="text-sm font-medium text-[var(--text-muted)]">Impact Bullets</label>
                            <Textarea 
                              className="bg-transparent border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)] min-h-[80px] leading-relaxed" 
                              placeholder="• Built x using y resulting in z"
                              value={(proj.bullets || []).join('\n')}
                              onChange={e => {
                                  const n=[...projects]; 
                                  n[i].bullets=e.target.value.split('\n').filter(Boolean); 
                                  setProjects(n);
                              }}
                            />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full border-dashed border-[var(--border)] bg-transparent hover:bg-white/5 text-[var(--text-muted)] hover:text-white" onClick={() => setProjects([...projects, { name:"", technologies:"", link:"", github:"", bullets: [], selected: false }])}>
                  <Plus className="mr-2 h-4 w-4"/> Add Project Vault Entry
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* EDUCATION */}
            <AccordionItem value="education" className="border border-[var(--border)] bg-[var(--card)] rounded-[12px] px-6">
              <AccordionTrigger className="hover:no-underline py-5 text-lg font-semibold text-[var(--text)]">
                Education
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 space-y-6">
                <p className="text-[var(--text-muted)] text-sm">Add your academic background here.</p>
              </AccordionContent>
            </AccordionItem>

            {/* SKILLS */}
            <AccordionItem value="skills" className="border border-[var(--border)] bg-[var(--card)] rounded-[12px] px-6">
              <AccordionTrigger className="hover:no-underline py-5 text-lg font-semibold text-[var(--text)]">
                Skills
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 space-y-6">
                <Textarea 
                  value={skills} 
                  onChange={e => setSkills(e.target.value)}
                  className="bg-transparent border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)] min-h-[120px] leading-relaxed" 
                  placeholder="React, Node.js, Python, System Design..." 
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FadeIn>
      </div>

      {/* Live ATS Preview */}
      <FadeIn delay={0.4} className="hidden lg:flex flex-col w-[420px] flex-shrink-0 bg-[var(--card)] border border-[var(--border)] rounded-[24px] p-6 overflow-hidden">
         <div className="mb-6">
           <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center">
              <LayoutTemplate className="mr-2 h-5 w-5 text-[var(--primary)]" />
              Template Layout
           </h3>
           <div className="flex bg-black/30 p-1.5 rounded-lg border border-[var(--border)] mb-6">
             {(entryMode === "ai" ? ["auto"] : ["iit", "jake"]).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setTemplateFormat(mode as "auto" | "iit" | "jake")} 
                  className={cn(
                    "flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-all capitalize", 
                    templateFormat === mode ? "bg-[var(--primary)] text-black shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5"
                  )}
                >
                  {mode === "auto" ? "AI Resume" : mode === "iit" ? "IIT Bombay" : "Jake's Resume"}
                </button>
             ))}
           </div>
           
           <div className="flex justify-end">
             {isClient ? (
               <PDFDownloadLink
                  document={
                    templateFormat === "auto" ? <ResumePDF basics={basics} experience={experience} education={education} skills={skills} /> :
                    templateFormat === "iit" ? <IITBombayTemplate basics={basics} experience={experience} education={education} skills={skills} /> :
                    <JakesTemplate basics={basics} experience={experience} education={education} projects={projects.filter(p => p.selected)} skills={skills} />
                  }
                  fileName={"resume-.pdf"}
               >
                 
                 {({ loading }) => (
                   <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black font-semibold rounded-[12px] w-full shadow-[0_0_20px_rgba(142,182,155,0.15)] hover:scale-[1.02] transition-transform">
                     {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                     {loading ? "Rendering..." : "Export PDF"}
                   </Button>
                 )}
               </PDFDownloadLink>
             ) : (
               <Button className="bg-white/5 cursor-not-allowed text-[var(--text-muted)] rounded-[12px] w-full border border-[var(--border)]">
                 <Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting Engine
               </Button>
             )}
           </div>
         </div>
         
         {/* Miniature Document Preview Container */}
         <div className="relative flex-1 bg-white rounded-lg shadow-inner overflow-hidden border-4 border-black/20">
           <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 p-6 overflow-y-auto text-gray-900 text-[9px] scrollbar-none">
              <div className="text-center font-bold text-lg uppercase mb-1 tracking-tight">{basics.name || "YOUR NAME"}</div>
              <div className="text-center text-[8px] text-gray-600 mb-5 pb-4 border-b-2 border-gray-900">
                {basics.email || "email@address.com"} • {basics.phone || "Phone"} • {basics.location || "City, State"}
              </div>
              
              <div className="uppercase text-[10px] font-bold text-gray-900 mb-2">Summary</div>
              <p className="text-[9px] mb-5 text-gray-700 leading-relaxed font-serif">{basics.summary || "Professional summary goes here..."}</p>

              <div className="uppercase text-[10px] font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">Experience</div>
              <div className="space-y-4">
                {experience.length > 0 ? experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[9px] font-bold text-gray-900">
                      <span>{exp.role || "Role"}</span>
                      <span>{exp.company || "Company"}</span>
                    </div>
                    <ul className="list-disc pl-4 text-[9px] mt-1.5 space-y-1 text-gray-700 font-serif">
                      {(exp.bullets || []).map((b: string, idx: number) => <li key={idx} className="leading-tight">{b}</li>)}
                      {!(exp.bullets?.length) && <li>Resume bullet one</li>}
                    </ul>
                  </div>
                )) : (
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-900">
                      <span>Software Engineer</span>
                      <span>Tech Corp</span>
                    </div>
                    <ul className="list-disc pl-4 text-[9px] mt-1.5 space-y-1 text-gray-700 font-serif">
                      <li>Designed and developed scalable microservices</li>
                    </ul>
                  </div>
                )}
              </div>
           </div>
         </div>
      </FadeIn>
    </div>
  );
}




