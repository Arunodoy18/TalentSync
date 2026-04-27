import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";

type BuilderBasics = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  github?: string;
  linkedin?: string;
};

type BuilderExperience = {
  company?: string;
  role?: string;
  start?: string;
  end?: string;
  bullets?: string[];
};

type BuilderEducation = {
  school?: string;
  degree?: string;
  year?: string;
  grade?: string;
};

type BuilderProject = {
  name?: string;
  technologies?: string;
  github?: string;
  link?: string;
  bullets?: string[];
  selected?: boolean;
};

type DraftPayload = {
  resumeId?: string;
  mode?: "auto" | "iit" | "jake";
  title?: string;
  basics?: BuilderBasics;
  experience?: BuilderExperience[];
  education?: BuilderEducation[];
  projects?: BuilderProject[];
  skills?: string;
};

function splitYearRange(yearValue?: string): { startDate: string; endDate: string } {
  const year = (yearValue ?? "").trim();
  if (!year) {
    return { startDate: "", endDate: "" };
  }

  const parts = year.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { startDate: "", endDate: "" };
  }

  if (parts.length === 1) {
    return { startDate: parts[0], endDate: "" };
  }

  return { startDate: parts[0], endDate: parts[1] };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as DraftPayload;
    const basics = payload.basics ?? {};
    const experience = Array.isArray(payload.experience) ? payload.experience : [];
    const education = Array.isArray(payload.education) ? payload.education : [];
    const projects = Array.isArray(payload.projects) ? payload.projects : [];

    if (!(basics.name ?? "").trim() || !(basics.email ?? "").trim()) {
      return NextResponse.json(
        { error: "Name and email are required to save resume." },
        { status: 400 }
      );
    }

    const skillSource = (payload.skills ?? "").trim();
    const normalizedSkills = skillSource
      .split(/[,|]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const content = {
      personal: {
        fullName: basics.name ?? "",
        email: basics.email ?? "",
        phone: basics.phone ?? "",
        location: basics.location ?? "",
        website: basics.linkedin || basics.github || "",
        summary: basics.summary ?? "",
      },
      experience: experience.map((entry) => ({
        company: entry.company ?? "",
        role: entry.role ?? "",
        startDate: entry.start ?? "",
        endDate: entry.end ?? "",
        description: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean).join("\n") : "",
      })),
      education: education.map((entry) => {
        const { startDate, endDate } = splitYearRange(entry.year);
        return {
          school: entry.school ?? "",
          degree: entry.degree ?? "",
          startDate,
          endDate,
          description: entry.grade ?? "",
        };
      }),
      skills: normalizedSkills,
      projects: projects.map((entry) => ({
        name: entry.name ?? "",
        technologies: entry.technologies ?? "",
        github: entry.github ?? "",
        link: entry.link ?? "",
        bullets: Array.isArray(entry.bullets) ? entry.bullets.filter(Boolean) : [],
        selected: Boolean(entry.selected),
      })),
    };

    const generatedTitle =
      (payload.title ?? "").trim() ||
      `${(basics.name ?? "Resume").trim() || "Resume"} (${(payload.mode ?? "auto").toUpperCase()})`;

    if (payload.resumeId) {
      await supabase
        .from("resumes")
        .update({ is_base: false })
        .eq("user_id", user.id)
        .neq("id", payload.resumeId);

      const { data: updated, error: updateError } = await supabase
        .from("resumes")
        .update({
          title: generatedTitle,
          content,
          is_base: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.resumeId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError || !updated) {
        return NextResponse.json({ error: "Failed to update resume." }, { status: 500 });
      }

      return NextResponse.json({ resume: updated });
    }

    await supabase.from("resumes").update({ is_base: false }).eq("user_id", user.id);

    const { data: created, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: generatedTitle,
        content,
        is_base: true,
      })
      .select()
      .single();

    if (createError || !created) {
      return NextResponse.json({ error: "Failed to save resume." }, { status: 500 });
    }

    return NextResponse.json({ resume: created });
  } catch (error: unknown) {
    console.error("Save draft resume error:", error);
    const message = error instanceof Error ? error.message : "Failed to save resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
