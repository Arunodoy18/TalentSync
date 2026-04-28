"use client";

import { useState } from "react";
import { Loader2, Copy, Download, RefreshCcw, Mail, Sparkles } from "lucide-react";

export default function CoverLetterClient({
  resumes,
  initialLetters,
}: {
  resumes: any[];
  initialLetters: any[];
}) {
  const [letters, setLetters] = useState<any[]>(initialLetters);
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("Professional");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLetter, setActiveLetter] = useState<any>(letters[0] || null);

  const generateLetter = async () => {
    if (!selectedResumeId || !jobDescription || !companyName || !role) {
      alert("Please fill in all fields before generating.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/career/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription,
          company: companyName,
          role,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      
      const newLetter = {
        id: data.id,
        company: companyName,
        role: role,
        content: data.text,
        tone: tone,
        created_at: new Date().toISOString(),
      };

      setLetters([newLetter, ...letters]);
      setActiveLetter(newLetter);
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate cover letter: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!activeLetter?.content) return;
    navigator.clipboard.writeText(activeLetter.content);
    alert("Copied to clipboard!");
  };

  const downloadTxt = () => {
    if (!activeLetter?.content) return;
    const blob = new Blob([activeLetter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${activeLetter.company.replace(/\s+/g, "_")}_${activeLetter.role.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = activeLetter?.content?.trim().split(/\s+/).length || 0;
  const readTime = Math.ceil(wordCount / 200) || 1; // avg 200 wpm

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left panel (40%) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Letter Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Source Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              >
                <option value="" disabled>Select a resume</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} {r.is_base ? "(Base)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input
                type="text"
                placeholder="Ex: Google, Stripe..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
              <input
                type="text"
                placeholder="Ex: Senior Frontend Engineer..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Job Description</label>
              <textarea
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {["Professional", "Enthusiastic", "Concise"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                      tone === t 
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-medium' 
                      : 'bg-transparent text-slate-400 border-[#1F2937] hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={generateLetter}
                disabled={isGenerating}
                className="w-full h-11 bg-[#D4AF37] hover:bg-[#FBE18D] text-black font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Cover Letter</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel (60%) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] shadow-xl min-h-[600px] flex flex-col">
          {activeLetter ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#1F2937] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeLetter.company}</h3>
                  <p className="text-[#D4AF37] text-sm">{activeLetter.role} • {activeLetter.tone}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <span className="px-2 py-1 bg-[#1F2937] rounded-md">{wordCount} words</span>
                  <span className="px-2 py-1 bg-[#1F2937] rounded-md">{readTime} min read</span>
                </div>
              </div>

              <div className="flex-1 text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-serif overflow-y-auto mb-6 pr-2">
                {activeLetter.content}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F2937] mt-auto">
                <button
                  onClick={copyToClipboard}
                  className="px-4 h-10 bg-transparent border border-[#1F2937] text-slate-300 hover:text-white hover:border-slate-500 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={downloadTxt}
                  className="px-4 h-10 bg-transparent border border-[#1F2937] text-slate-300 hover:text-white hover:border-slate-500 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm"
                >
                  <Download className="w-4 h-4" /> Download .txt
                </button>
                <button
                  onClick={generateLetter}
                  disabled={isGenerating}
                  className="px-4 h-10 bg-[#D4AF37] hover:bg-[#FBE18D] text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />} 
                  Regenerate
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
              <Mail className="w-16 h-16 opacity-30 mx-auto mb-2" />
              <p>Your generated cover letter will appear here.</p>
            </div>
          )}
        </div>

        {/* History List */}
        {letters.length > 0 && (
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-4">Previous Letters</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {letters.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => setActiveLetter(letter)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    activeLetter?.id === letter.id 
                    ? 'bg-[#1F2937] border-[#D4AF37]/50' 
                    : 'bg-[#0F172A] border-[#1F2937] hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{letter.company}</div>
                    <div className="text-sm text-slate-400">{letter.role}</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium whitespace-nowrap bg-black/20 px-2 py-1 rounded inline-block">
                    {new Date(letter.created_at).toLocaleDateString()} • {letter.tone}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
