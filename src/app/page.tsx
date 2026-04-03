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
              Build a MAANG-Level Resume. Get Matched to the Right Jobs. Auto-Apply with AI.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#284b63] sm:text-lg">
              TalentSync builds ATS-optimized resumes, finds the best matching jobs, and applies for you automatically.
            </p>

            <div className="mt-8 flex items-center justify-start gap-4">
              <button className="rounded-xl bg-[#D4AF37] px-6 py-3 font-medium text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                Build Resume
              </button>
              <button className="rounded-xl border border-[#1F2937] bg-[#111827] px-6 py-3 font-medium text-[#F9FAFB] transition-colors hover:bg-[#1F2937]">
                Find Jobs
              </button>
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
