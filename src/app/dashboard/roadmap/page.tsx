"use client";

import { useState } from "react";
import { Map, Briefcase, Code, Loader2, ArrowRight, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  timeline: string;
}

export default function CareerRoadmapPage() {
  const [type, setType] = useState<"role" | "skill" | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);

  const generateRoadmap = async () => {
    if (!type || !query.trim()) return;
    setLoading(true);
    setRoadmap(null);

    try {
      const res = await fetch("/api/career/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoadmap(data.roadmap);
    } catch (err) {
      console.error(err);
      alert("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full p-4 md:p-8 text-neutral-200">
      
      <div className="flex flex-col items-start gap-2 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/30">
            <Target className="h-5 w-5 text-[#d4af37]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Roadmap Explorer</h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }}
          className="text-neutral-400 max-w-2xl"
        >
          Discover your optimal learning path. Choose whether you want to master a specific skill or prepare for an entire job role, and our AI will build a step-by-step visual blueprint for your success.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!roadmap && !loading && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl mx-auto space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setType("role")}
                className={`relative overflow-hidden group rounded-2xl p-6 border transition-all duration-300 flex flex-col items-start text-left ${
                  type === "role" 
                    ? "bg-[#d4af37]/10 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.15)]" 
                    : "bg-[#111827]/60 border-[#1f2937] hover:border-neutral-600 hover:bg-[#111827]"
                }`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors ${type === 'role' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-neutral-800 text-neutral-400'}`}>
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${type === 'role' ? 'text-white' : 'text-neutral-300'}`}>Role-Based Path</h3>
                <p className="text-sm text-neutral-500">I want to become a Software Engineer, Product Manager, Data Scientist, etc.</p>
                {type === "role" && (
                    <motion.div layoutId="activeType" className="absolute inset-0 border-2 border-[#d4af37] rounded-2xl pointer-events-none" />
                )}
              </button>

              <button
                onClick={() => setType("skill")}
                className={`relative overflow-hidden group rounded-2xl p-6 border transition-all duration-300 flex flex-col items-start text-left ${
                  type === "skill" 
                    ? "bg-[#d4af37]/10 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.15)]" 
                    : "bg-[#111827]/60 border-[#1f2937] hover:border-neutral-600 hover:bg-[#111827]"
                }`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors ${type === 'skill' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-neutral-800 text-neutral-400'}`}>
                  <Code className="h-6 w-6" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${type === 'skill' ? 'text-white' : 'text-neutral-300'}`}>Skill-Based Path</h3>
                <p className="text-sm text-neutral-500">I want to master React, Data Structures, Machine Learning, Python, etc.</p>
                {type === "skill" && (
                    <motion.div layoutId="activeType" className="absolute inset-0 border-2 border-[#d4af37] rounded-2xl pointer-events-none" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {type && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-neutral-300">
                      {type === "role" ? "What role are you targeting?" : "What skill do you want to learn?"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={type === "role" ? "e.g., Full Stack Developer" : "e.g., System Design"}
                        className="w-full h-14 bg-[#111827] border border-[#1f2937] rounded-xl px-5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateRoadmap}
                    disabled={!query.trim()}
                    className="w-full h-14 bg-[#d4af37] hover:bg-[#c5a030] text-[#0f172a] rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" /> Generate My Roadmap
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-20 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-[#d4af37]/20 blur-xl rounded-full" />
                <Loader2 className="h-12 w-12 text-[#d4af37] animate-spin relative z-10" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Architecting your path...</h3>
                <p className="text-neutral-400">Our AI is analyzing the best industry standards for your request.</p>
            </div>
          </motion.div>
        )}

        {roadmap && !loading && (
          <motion.div 
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative"
          >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                     <Map className="text-[#d4af37]" /> Your Master Roadmap
                  </h2>
                  <p className="text-neutral-400 mt-2">A step-by-step guide to achieving your goal.</p>
               </div>
               <button 
                  onClick={() => setRoadmap(null)}
                  className="text-sm text-neutral-400 hover:text-white flex items-center gap-2 transition-colors border border-neutral-800 bg-neutral-900/50 px-4 py-2 rounded-lg"
               >
                 Change Goal
               </button>
            </div>

            {/* The Visual Timeline Tree */}
            <div className="relative border-l-2 border-[#1f2937] ml-4 md:ml-6 pb-8 space-y-12">
              {roadmap.map((step, idx) => (
                <motion.div 
                  key={step.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative pl-8 md:pl-12"
                >
                  {/* Glowing Node */}
                  <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-[#111827] border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <span className="text-xs font-bold text-[#d4af37]">{idx + 1}</span>
                  </div>

                  <div className="bg-[#111827]/80 backdrop-blur-md border border-[#1f2937] hover:border-[#d4af37]/50 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors">{step.title}</h3>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-xs font-semibold whitespace-nowrap">
                        {step.timeline}
                      </div>
                    </div>
                    
                    <p className="text-neutral-400 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Key Skills & Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.skills.map((skill, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}





