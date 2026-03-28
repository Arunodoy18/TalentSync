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
    <main className="w-full flex items-center justify-center min-h-screen bg-[#f6f7f9]">
      <LoginAuth />
    </main>
  );
}
