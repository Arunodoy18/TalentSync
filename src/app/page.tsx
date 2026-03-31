import LoginAuth from "@/components/sections/login-auth";
import DemoOne from "@/components/ui/demo";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden bg-[#040611]">
      <DemoOne />

      <section className="relative z-20 -mt-28 px-6 pb-20 sm:px-10 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="glass-panel reveal-up p-8 sm:p-10 lg:p-12">
            <p className="mb-4 inline-flex rounded-full border border-white/40 bg-white/35 px-4 py-1 text-xs font-semibold tracking-[0.12em] text-[#284b63] uppercase">
              TalentSync Career OS
            </p>
            <h1 className="font-display text-balance text-4xl leading-tight text-[#153243] sm:text-5xl lg:text-6xl">
              Build Your Interview Pipeline, Not Just a Resume.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#284b63] sm:text-lg">
              Build polished resumes, discover relevant roles, tailor applications, and track your progress in one place.
              Stay consistent, save time, and move faster toward your next offer.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="metric-label">Resume</p>
                <p className="metric-value">Smart Editing</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Jobs</p>
                <p className="metric-value">Role Matching</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Applications</p>
                <p className="metric-value">Guided Workflow</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Progress</p>
                <p className="metric-value">Clear Tracking</p>
              </div>
            </div>
          </section>

          <section className="reveal-up-delay flex items-center justify-center">
            <div className="w-full max-w-[460px]">
              <LoginAuth />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
