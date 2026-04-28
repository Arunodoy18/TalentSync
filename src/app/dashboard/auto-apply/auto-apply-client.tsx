"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Badge } from "@/components/ui/badge";
import { Rocket, Pause, CircleCheck, CircleDot, Activity, Settings2, Play, AlertCircle } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const LOCATIONS = ["Remote", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Any"];
const JOB_TYPES = ["Full-time", "Internship", "Contract"];
const EXP_LEVELS = ["Fresher", "1-3 yrs", "3-5 yrs", "5+ yrs"];

export function AutoApplyClient({ 
  initialPreferences, 
  resumes, 
  applications,
  userId
}: { 
  initialPreferences: any | null, 
  resumes: any[], 
  applications: any[],
  userId: string 
}) {
  const supabase = createClient();
  
  const [prefs, setPrefs] = useState({
    job_titles: initialPreferences?.job_titles || "",
    preferred_locations: initialPreferences?.preferred_locations || ["Remote"],
    job_types: initialPreferences?.job_types || ["Full-time"],
    experience_level: initialPreferences?.experience_level || "Fresher",
    min_match_score: initialPreferences?.min_match_score || 75,
    daily_apply_limit: initialPreferences?.daily_apply_limit || 5,
    resume_id: initialPreferences?.resume_id || "",
    auto_cover_letter: initialPreferences?.auto_cover_letter || false,
    is_active: initialPreferences?.is_active || false,
  });

  const [isEditing, setIsEditing] = useState(!initialPreferences || !initialPreferences.is_active);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleLocation = (loc: string) => {
    if (loc === "Any") {
      setPrefs(p => ({ ...p, preferred_locations: ["Any"] }));
      return;
    }
    setPrefs(p => {
      const isSelected = p.preferred_locations.includes(loc);
      let newLocs = isSelected 
        ? p.preferred_locations.filter((l: string) => l !== loc)
        : [...p.preferred_locations.filter((l: string) => l !== "Any"), loc];
      if (newLocs.length === 0) newLocs = ["Any"];
      return { ...p, preferred_locations: newLocs };
    });
  };

  const toggleJobType = (jt: string) => {
    setPrefs(p => {
      const isSelected = p.job_types.includes(jt);
      const newJts = isSelected
        ? p.job_types.filter((t: string) => t !== jt)
        : [...p.job_types, jt];
      return { ...p, job_types: newJts.length ? newJts : [jt] };
    });
  };

  const handleSave = async (activate: boolean) => {
    if (!prefs.job_titles) {
      setError("Please add at least one Job Title.");
      return;
    }
    if (!prefs.resume_id) {
      setError("Please select a Resume to use.");
      return;
    }
    
    setSaving(true);
    setError("");

    try {
      const payload = {
        user_id: userId,
        job_titles: prefs.job_titles,
        preferred_locations: prefs.preferred_locations,
        job_types: prefs.job_types,
        experience_level: prefs.experience_level,
        min_match_score: prefs.min_match_score,
        daily_apply_limit: prefs.daily_apply_limit,
        resume_id: prefs.resume_id,
        auto_cover_letter: prefs.auto_cover_letter,
        is_active: activate,
        updated_at: new Date().toISOString()
      };

      const { error: upsertErr } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertErr) throw upsertErr;

      setPrefs({ ...prefs, is_active: activate });
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleState = async () => {
    const newState = !prefs.is_active;
    try {
      const { error: updErr } = await supabase
        .from("user_preferences")
        .update({ is_active: newState })
        .eq("user_id", userId);
      
      if (updErr) throw updErr;
      setPrefs({ ...prefs, is_active: newState });
    } catch (err) {
      console.error("Failed to toggle state", err);
    }
  };

  const todaysApps = applications.filter(app => {
    const d = new Date(app.created_at);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }).length;

  if (isEditing) {
    return (
      <StaggerContainer className="flex-1 space-y-6 max-w-4xl mx-auto w-full">
        <FadeIn>
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-shrink-0 items-center justify-center">
              <Rocket className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Configure Auto Apply</h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">Set your matching criteria and let our AI apply for you while you sleep.</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="space-y-6 bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {/* Job Titles */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]">Job Titles <span className="text-[var(--text-muted)] font-normal">(comma separated)</span></label>
            <input 
              type="text" 
              placeholder="e.g. Backend Developer, Full Stack Engineer"
              value={prefs.job_titles}
              onChange={(e) => setPrefs({...prefs, job_titles: e.target.value})}
              className="w-full h-11 px-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] focus:ring-1 focus:border-[var(--primary)] outline-none transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]">Preferred Locations</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => toggleLocation(loc)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                    prefs.preferred_locations.includes(loc)
                      ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                      : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Types */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text)]">Job Type</label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map(jt => (
                  <button
                    key={jt}
                    onClick={() => toggleJobType(jt)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                      prefs.job_types.includes(jt)
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                        : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {jt}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text)]">Experience Level</label>
              <select
                value={prefs.experience_level}
                onChange={(e) => setPrefs({...prefs, experience_level: e.target.value})}
                className="w-full h-11 px-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] focus:ring-1 focus:border-[var(--primary)] outline-none transition-all"
              >
                {EXP_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Min Match Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[var(--text)]">Min Match Score</label>
                <span className="text-xs font-bold text-[var(--primary)]">{prefs.min_match_score}%</span>
              </div>
              <input 
                type="range" 
                min="60" max="95" step="1"
                value={prefs.min_match_score}
                onChange={(e) => setPrefs({...prefs, min_match_score: parseInt(e.target.value)})}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            {/* Daily Limit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text)]">Daily Apply Limit</label>
              <input 
                type="number" 
                min="1" max="20"
                value={prefs.daily_apply_limit}
                onChange={(e) => setPrefs({...prefs, daily_apply_limit: parseInt(e.target.value) || 1})}
                className="w-full h-11 px-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] focus:ring-1 focus:border-[var(--primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text)]">Which Resume</label>
              <select
                value={prefs.resume_id}
                onChange={(e) => setPrefs({...prefs, resume_id: e.target.value})}
                className="w-full h-11 px-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] focus:ring-1 focus:border-[var(--primary)] outline-none transition-all"
              >
                <option value="" disabled>Select a saved resume</option>
                {resumes.map(r => (
                   <option key={r.id} value={r.id}>
                     {r.title || "Untitled"} {r.is_base ? "(Master)" : ""}
                   </option>
                ))}
              </select>
            </div>

            {/* Auto Cover Letter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text)] flex items-center justify-between mt-1">
                Auto-generate & send Cover Letter
                <button
                  type="button"
                  onClick={() => setPrefs({...prefs, auto_cover_letter: !prefs.auto_cover_letter})}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.auto_cover_letter ? "bg-[var(--primary)]" : "bg-[var(--surface-elevated)] border border-[var(--border)]"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefs.auto_cover_letter ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </label>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="flex justify-end gap-4 mt-8">
          {initialPreferences && (
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            disabled={saving}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-indigo-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Rocket className="h-4 w-4" />
            {saving ? "Activating..." : "Activate Auto Apply"}
          </button>
        </FadeIn>
      </StaggerContainer>
    );
  }

  return (
    <StaggerContainer className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Auto Apply Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-2">Monitor the robotic agent applying to matched jobs while you sleep.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center text-sm font-semibold pr-4 border-r border-[var(--border)] text-[var(--text-muted)]">
            <span className="text-[var(--text)] mr-2">{todaysApps}/{prefs.daily_apply_limit}</span> Applied Today
          </div>
          
          <div className={`flex items-center justify-center gap-2 h-[44px] px-4 rounded-[12px] border font-medium cursor-default ${prefs.is_active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
            <Activity className={`h-4 w-4 ${prefs.is_active ? "animate-pulse" : "opacity-50"}`} />
            Engine {prefs.is_active ? "Active" : "Paused"}
          </div>
          
          <button
            onClick={handleToggleState}
            className="flex items-center gap-2 h-[44px] px-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-all text-sm font-medium"
          >
            {prefs.is_active ? <><Pause className="h-4 w-4" /> Pause Engine</> : <><Play className="h-4 w-4" /> Resume Engine</>}
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 h-[44px] px-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Settings2 className="h-4 w-4" /> Configure
          </button>
        </div>
      </FadeIn>

      <StaggerItem>
        <div className="p-[24px] rounded-[12px] bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="lowercase tracking-wider text-[var(--text-muted)] text-[11px] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-4">Job Title</th>
                  <th className="px-4 py-4">Company</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Cover Letter</th>
                  <th className="px-4 py-4">Applied At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {applications && applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-5 font-semibold text-[var(--text)]">
                        {app.jobs?.title || app.job_title || "Unknown Role"}
                      </td>
                      <td className="px-4 py-5 text-[var(--text-muted)] font-medium">
                        {app.jobs?.company || app.company || "Unknown Company"}
                      </td>
                      <td className="px-4 py-5">
                        {app.status === "applied" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium px-2 py-0.5 flex w-fit items-center gap-1.5 rounded-full">
                            <CircleCheck className="h-3 w-3" />
                            Applied
                          </Badge>
                        ) : app.status === "failed" ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-medium px-2 py-0.5 flex w-fit items-center gap-1.5 rounded-full">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-medium px-2 py-0.5 flex w-fit items-center gap-1.5 rounded-full">
                            <CircleDot className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        {app.cover_letter_sent ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400"><CircleCheck className="h-3 w-3" /> Sent</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-5 text-[var(--text-muted)]">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-24 text-center">
                       <div className="h-16 w-16 mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                         <Rocket className="h-8 w-8 text-indigo-400" />
                       </div>
                       <p className="text-lg font-semibold text-[var(--text)] mb-3">No Applications Yet</p>
                       <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                         The engine is now monitoring for jobs that match your criteria. It will automatically apply to them in the background.
                       </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}