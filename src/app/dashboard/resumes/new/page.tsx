import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function NewResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .insert([
      {
        user_id: user.id,
        title: "Untitled Resume",
        content: {
          personal: {
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: "",
            location: "",
            website: "",
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
        },
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error || !resume) {
    console.error("Error creating resume:", error);
    redirect("/dashboard");
  }

  redirect(`/dashboard/resumes/${resume.id}`);
}
