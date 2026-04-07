import { createClient } from "@/lib/supabase-server";
import { FileText, Briefcase, Target, Rocket, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { motion } from "framer-motion";

function ProgressBar() {
  const steps = [
    { label: "Profile", completed: true },
    { label: "Resume", completed: true },
    { label: "ATS Score", completed: false },
    { label: "Matches", completed: false },
    { label: "Applied", completed: false },
  ];

  return (
    <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between w-full relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[var(--border)] -z-10"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] h-[2px] bg-[var(--primary)] -z-10 transition-all duration-500"></div>
        
        {steps.map((step, idx) => (
          <div key={step.label} className="flex flex-col items-center gap-3 bg-[var(--card)] px-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[var(--card)] transition-colors ${
              step.completed 
                ? "border-[var(--primary)] text-[var(--primary)]" 
                : idx === 2 
                  ? "border-[var(--primary)] text-[var(--primary)] shadow-[0_0_15px_rgba(142,182,155,0.3)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
            }`}>
              {step.completed ? <CheckCircle2 className="w-5 h-5 bg-[var(--card)] rounded-full" /> : <Circle className="w-3 h-3 fill-current" />}
            </div>
            <span className={`text-xs font-medium ${
              step.completed || idx === 2 ? "text-[var(--text)]" : "text-[var(--text-muted)]"
            }`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { count: resumeCount } = await supabase
    .from("resumes")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  const isNewUser = resumeCount === 0;

  // The new Action-Based Dashboard
  const actions = [
    { 
      title: "Review ATS Score", 
      metric: "Ready to Scan", 
      description: "Match your resume against exact FAANG job descriptions.", 
      href: "/dashboard/ats-score", 
      cta: "Run Scan",
      icon: Target,
      tag: "Next Step",
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary)]/10",
      border: "border-[var(--primary)]/30"
    },
    { 
      title: "View Matched Jobs", 
      metric: "12 New Matches", 
      description: "Based on your latest profile update.", 
      href: "/dashboard/jobs", 
      cta: "View Matches",
      icon: Briefcase,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/30"
    },
    { 
      title: "Start Auto-Apply", 
      metric: "Engine Idle", 
      description: "Configure settings to automatically submit applications.", 
      href: "/dashboard/auto-apply", 
      cta: "Configure",
      icon: Rocket,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30"
    },
    { 
      title: "Update Resume", 
      metric: "Last updated 2d ago", 
      description: "Edit your core resume using our structured templates.", 
      href: "/dashboard/resumes", 
      cta: "Edit Resume",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/30"
    },
  ];

  return (
    <div className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      <FadeIn delay={0.1}>
        <ProgressBar />
      </FadeIn>

      {isNewUser ? (
        <FadeIn delay={0.2} className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center w-full">
          <div className="h-16 w-16 mb-6 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30">
            <Target className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)] mb-4">Welcome to TalentSync</h1>
          <p className="text-[var(--text-muted)] text-base max-w-sm mx-auto leading-relaxed mb-8">
            Start by creating your resume.<br/>
            Then we&apos;ll calculate your ATS score and match you with jobs.
          </p>
          <Link href="/dashboard/resumes/builder">
            <button className="h-[44px] px-8 rounded-lg bg-[var(--primary)] text-black text-sm font-semibold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(142,182,155,0.2)]">
              Create Resume
            </button>
          </Link>
        </FadeIn>
      ) : (
        <>
          <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6" delay={0.2}>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Action Center</h1>
              <p className="text-[var(--text-muted)] mt-2">
                Your next steps for accelerating your job search.
              </p>
            </div>
          </FadeIn>

          {/* ACTION-BASED MATRIX */}
          <StaggerContainer className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
              <StaggerItem key={action.title}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="h-full"
                >
                  <Link href={action.href} className={`relative p-[24px] h-full rounded-[12px] bg-[var(--card)] border border-[var(--border)] flex flex-col group transition-all hover:border-[var(--surface-hover-border)] hover:shadow-xl`}>
                    {action.tag && (
                      <div className="absolute top-4 right-4 bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/50 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                        {action.tag}
                      </div>
                    )}

                    <motion.div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${action.color} ${action.bg} border ${action.border} mb-6`}
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: -4 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    >
                      <action.icon className="h-6 w-6" />
                    </motion.div>

                    <div className="flex-1 space-y-2">
                      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-wide">{action.metric}</p>
                      <h3 className="text-xl font-semibold text-[var(--text)] leading-tight">{action.title}</h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{action.description}</p>
                    </div>

                    <div className="mt-8 flex items-center text-sm font-semibold text-[var(--text)]/90 group-hover:text-[var(--text)] transition-colors">
                      {action.cta} <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </>
      )}
    </div>
  );
}




