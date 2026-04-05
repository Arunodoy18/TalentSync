import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function NewResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  redirect("/dashboard/resumes/builder?entry=ai");
}




