import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import IITTemplate from "@/components/resume/templates/IITTemplate";
import JakesTemplate from "@/components/resume/templates/JakesTemplate";

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("id, title, template_type, data, content")
      .eq("id", id)
      .single();

    if (error || !resume) {
      notFound();
    }

    const templateType = resume.template_type === "iit" ? "iit" : "jakes";
    const templateData = resume.data ?? resume.content ?? {};

    return (
      <div className="min-h-screen bg-[#f5f5f5] px-6 py-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6">
          <div className="flex w-full justify-center">
            <div className="w-[816px] rounded-[12px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
              <div className="flex justify-center">
                {templateType === "iit" ? (
                  <IITTemplate data={templateData} />
                ) : (
                  <JakesTemplate data={templateData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
