import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { SoftPaywallGate } from "@/components/billing/soft-paywall-gate";
import { AutoApplyClient } from "./auto-apply-client";

export default async function AutoApplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch applications
  const { data: applications } = await supabase
    .from("job_applications")
    .select("*, jobs(title, company)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, is_base, updated_at")
    .eq("user_id", user.id)
    .order("is_base", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <>
      <SoftPaywallGate
        title="Auto Apply Requires Premium"
        subtitle="Trial or active subscription is required to run the Auto Apply engine."
      />
      <AutoApplyClient 
        initialPreferences={preferences}
        resumes={resumes || []}
        applications={applications || []}
        userId={user.id}
      />
    </>
  );
}