import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, updated_at, is_base")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="app-title text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="app-subtitle mt-1">Manage your base resume and tailored resume versions.</p>
        </div>
        <Link
          href="/dashboard/resumes/new"
          className="inline-flex h-[50px] items-center gap-2 rounded-[50px] bg-[#003893] px-6 font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          New Resume
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(resumes || []).map((resume) => (
          <Link
            key={resume.id}
            href={`/dashboard/resumes/${resume.id}`}
            className="app-surface flex flex-col gap-4 p-6 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f4f6]">
                <FileText className="h-5 w-5 text-[#6b7280]" />
              </div>
              {resume.is_base ? (
                <span className="rounded-full bg-[#00389310] px-3 py-1 text-xs font-semibold text-[#003893]">
                  Base
                </span>
              ) : null}
            </div>
            <div>
              <p className="truncate text-lg font-bold text-[#212529]">{resume.title || "Untitled Resume"}</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Updated {new Date(resume.updated_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {(resumes || []).length === 0 ? (
        <div className="app-surface flex flex-col items-center justify-center gap-2 border-2 border-dashed py-20">
          <FileText className="h-12 w-12 text-[#d1d5db]" />
          <p className="text-lg font-semibold text-[#6b7280]">No resumes yet</p>
          <Link href="/dashboard/resumes/new" className="text-sm font-semibold text-[#003893] hover:underline">
            Create your first resume
          </Link>
        </div>
      ) : null}
    </div>
  );
}
