import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateEmbedding } from "@/lib/openai";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sampleJobs = [
      {
        title: "Senior Full Stack Engineer",
        company: "Vercel",
        location: "Remote",
        job_type: "Full-time",
        salary_range: "$150k - $200k",
        description: "Looking for experts in Next.js, React, and TypeScript. Build the future of the web with us.",
        url: "https://vercel.com/careers",
      },
      {
        title: "Frontend Developer",
        company: "Stripe",
        location: "San Francisco, CA",
        job_type: "Full-time",
        salary_range: "$130k - $180k",
        description: "Join the Stripe team to build beautiful and functional payment interfaces using React and Tailwind CSS.",
        url: "https://stripe.com/jobs",
      },
      {
        title: "AI Engineer",
        company: "Anthropic",
        location: "Remote",
        job_type: "Full-time",
        salary_range: "$160k - $220k",
        description: "Work on cutting-edge LLMs and AI safety. Proficiency in Python and Transformer models required.",
        url: "https://anthropic.com/careers",
      },
    ];

    for (const job of sampleJobs) {
      const text = `${job.title} ${job.company} ${job.description}`;
      const embedding = await generateEmbedding(text);
      
      const { error } = await supabase
        .from("jobs")
        .insert({
          ...job,
          embedding,
        });

      if (error) console.error("Job seed error:", error);
    }

    return NextResponse.json({ message: "Jobs seeded successfully" });
  } catch (error: any) {
    console.error("Job seeding failed:", error);
    return NextResponse.json({ error: error.message || "Failed to seed jobs" }, { status: 500 });
  }
}
