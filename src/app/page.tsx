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
              Stop Rewriting Resumes.
            </p>
            <h1 className="font-display text-balance text-4xl leading-tight text-[#153243] sm:text-5xl lg:text-6xl">
              Your AI Auto-Apply Engine.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#284b63] sm:text-lg">
              Drop your PDF once into our Master Vault. Our AI perfectly tailors it to the highest-scoring FAANG or IIT Bombay templates, scores it live against job descriptions, and auto-applies while you sleep.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="metric-label">Extract</p>
                <p className="metric-value">Magic PDF Import</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Match</p>
                <p className="metric-value">Vector AI Scoring</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Format</p>
                <p className="metric-value">IIT & Jake's Resumes</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Deploy</p>
                <p className="metric-value">Robotic Auto-Applier</p>
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
