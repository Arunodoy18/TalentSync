import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase-auth-helpers";
import { ingestRealJobs } from "@/lib/jobs-ingestion";

type SeedRequestBody = {
  source?: string;
  limit?: number;
  location?: string;
  keyword?: string;
};

export async function POST(req: Request) {
  try {
    const body = ((await req.json().catch(() => ({}))) ?? {}) as SeedRequestBody;

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await ingestRealJobs(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Job ingestion failed:", error);
    const message = error instanceof Error ? error.message : "Failed to ingest jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




