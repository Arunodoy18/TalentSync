import LoginAuth from "@/components/sections/login-auth";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-atmosphere">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2f5d62]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#f3a712]/20 blur-3xl" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:px-10">
        <section className="glass-panel reveal-up p-8 sm:p-10 lg:p-12">
          <p className="mb-4 inline-flex rounded-full border border-white/40 bg-white/35 px-4 py-1 text-xs font-semibold tracking-[0.12em] text-[#284b63] uppercase">
            TalentSync Career OS
          </p>
          <h1 className="font-display text-balance text-4xl leading-tight text-[#153243] sm:text-5xl lg:text-6xl">
            Build Your Interview Pipeline, Not Just a Resume.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#284b63] sm:text-lg">
            Parse resumes, match real jobs, tailor every application, and track outcomes in one AI-driven system.
            Reliable automation, measurable analytics, and production-grade billing.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="metric-card">
              <p className="metric-label">Core Stack</p>
              <p className="metric-value">Next.js + OpenAI</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Matching</p>
              <p className="metric-value">Embeddings + Cosine</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Billing</p>
              <p className="metric-value">Razorpay + Webhooks</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Automation</p>
              <p className="metric-value">Playwright RPA</p>
            </div>
          </div>
        </section>

        <section className="reveal-up-delay flex items-center justify-center">
          <div className="w-full max-w-[460px]">
            <LoginAuth />
          </div>
        </section>
      </div>
    </main>
  );
}
