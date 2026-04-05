import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Rocket, Play, Pause, CircleCheck, CircleDot, Activity } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { SoftPaywallGate } from "@/components/billing/soft-paywall-gate";

export default async function AutoApplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Assuming we have table 'job_applications' in supabase with status 'pending', 'applied', etc.
  const { data: applications } = await supabase
    .from("job_applications")
    .select("*, jobs(title, company)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const hasApps = applications && applications.length > 0;

  return (
    <StaggerContainer className="flex-1 space-y-[32px] max-w-[1400px] mx-auto w-full">
      <SoftPaywallGate
        title="Auto Apply Requires Premium"
        subtitle="Trial or active subscription is required to run the Auto Apply engine."
      />
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Auto Apply Engine</h1>
          <p className="text-[var(--text-muted)] mt-2">Monitor the robotic agent applying to matched jobs while you sleep.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center gap-2 h-[44px] px-6 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <Activity className="h-4 w-4 animate-pulse" />
            Engine Active
          </div>
          <button className="h-[44px] px-4 rounded-[12px] border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-all">
            <Pause className="h-5 w-5" />
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
                  <th className="px-4 py-4">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {hasApps ? (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-5 font-semibold text-[var(--text)]">
                        {app.jobs?.title || "Unknown Role"}
                      </td>
                      <td className="px-4 py-5 text-[var(--text-muted)] font-medium">
                        {app.jobs?.company || "Unknown Company"}
                      </td>
                      <td className="px-4 py-5">
                        {app.status === "applied" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium px-2 py-0.5 flex w-fit items-center gap-1.5 rounded-full">
                            <CircleCheck className="h-3 w-3" />
                            Applied
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 font-medium px-2 py-0.5 flex w-fit items-center gap-1.5 rounded-full">
                            <CircleDot className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-5 text-[var(--text-muted)]">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-24 text-center">
                       <div className="h-16 w-16 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                         <Rocket className="h-8 w-8 text-emerald-400" />
                       </div>
                       <p className="text-lg font-semibold text-[var(--text)] mb-3">No Applications Yet</p>
                       <p className="text-sm text-[var(--text-muted)] mb-8 max-w-sm mx-auto leading-relaxed">
                         Once you enable Auto Apply, we will start applying to<br/>
                         matched jobs automatically for you.
                       </p>
                       <button className="h-[44px] px-8 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                         Enable Auto Apply
                       </button>
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




