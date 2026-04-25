import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { ingestRealJobs, type JobsIngestionInput } from "@/lib/jobs-ingestion";

type SyncRunStatus = "success" | "failed";

type SyncRunPayload = {
  source: string;
  status: SyncRunStatus;
  insertedCount: number;
  skippedCount: number;
  embeddingFailures: number;
  triggeredBy: string;
  errorMessage?: string;
};

function normalizeSource(source: string | undefined): string {
  return (source ?? process.env.JOBS_INGEST_DEFAULT_SOURCE ?? "remoteok").trim().toLowerCase();
}

function isStatusMode(req: NextRequest): boolean {
  const mode = req.nextUrl.searchParams.get("mode")?.toLowerCase();
  const status = req.nextUrl.searchParams.get("status")?.toLowerCase();
  return mode === "status" || status === "1" || status === "true";
}

function parseInputFromQuery(req: NextRequest): JobsIngestionInput {
  const params = req.nextUrl.searchParams;
  const limitParam = params.get("limit");

  return {
    source: params.get("source") ?? undefined,
    location: params.get("location") ?? undefined,
    keyword: params.get("keyword") ?? undefined,
    limit: limitParam ? Number(limitParam) : undefined,
  };
}

async function recordSyncRun(payload: SyncRunPayload): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("job_sync_runs").insert({
      source: payload.source,
      status: payload.status,
      inserted_count: payload.insertedCount,
      skipped_count: payload.skippedCount,
      embedding_failures: payload.embeddingFailures,
      triggered_by: payload.triggeredBy,
      error_message: payload.errorMessage ?? null,
    });

    if (error) {
      console.warn("Failed to record job sync run:", error.message);
    }
  } catch (error) {
    console.warn("Failed to record job sync run:", error);
  }
}

async function getSyncStatus() {
  const admin = createAdminClient();
  const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [latestRunRes, latestSuccessRes, recentRunsRes] = await Promise.all([
    admin
      .from("job_sync_runs")
      .select("id, source, status, inserted_count, skipped_count, embedding_failures, error_message, triggered_by, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("job_sync_runs")
      .select("id, source, status, inserted_count, skipped_count, embedding_failures, triggered_by, created_at")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("job_sync_runs")
      .select("status, inserted_count")
      .gte("created_at", dayAgoIso),
  ]);

  if (latestRunRes.error) {
    throw new Error(`Failed to fetch latest sync run: ${latestRunRes.error.message}`);
  }
  if (latestSuccessRes.error) {
    throw new Error(`Failed to fetch latest successful sync run: ${latestSuccessRes.error.message}`);
  }
  if (recentRunsRes.error) {
    throw new Error(`Failed to fetch recent sync runs: ${recentRunsRes.error.message}`);
  }

  const recentRuns = recentRunsRes.data ?? [];
  const successfulRuns = recentRuns.filter((run) => run.status === "success");
  const insertedLast24h = successfulRuns.reduce((sum, run) => sum + Number(run.inserted_count ?? 0), 0);

  return NextResponse.json({
    latestRun: latestRunRes.data ?? null,
    latestSuccessfulRun: latestSuccessRes.data ?? null,
    summary24h: {
      totalRuns: recentRuns.length,
      successfulRuns: successfulRuns.length,
      failedRuns: recentRuns.length - successfulRuns.length,
      insertedJobs: insertedLast24h,
    },
  });
}

async function handleSync(req: NextRequest) {
  let requestedSource: string | undefined;
  const statusMode = req.method === "GET" && isStatusMode(req);

  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (statusMode) {
      return await getSyncStatus();
    }

    const body =
      req.method === "GET"
        ? parseInputFromQuery(req)
        : (((await req.json().catch(() => ({}))) ?? {}) as JobsIngestionInput);

    requestedSource = body.source;

    const result = await ingestRealJobs(body);

    await recordSyncRun({
      source: normalizeSource(result.source),
      status: "success",
      insertedCount: result.inserted,
      skippedCount: result.skipped,
      embeddingFailures: result.embeddingFailures,
      triggeredBy: "admin-cron",
    });

    return NextResponse.json({
      ...result,
      triggeredBy: "admin-cron",
      triggeredAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Admin jobs sync failed:", error);
    const message = error instanceof Error ? error.message : "Failed to sync jobs";

    if (!statusMode) {
      await recordSyncRun({
        source: normalizeSource(requestedSource),
        status: "failed",
        insertedCount: 0,
        skippedCount: 0,
        embeddingFailures: 0,
        triggeredBy: "admin-cron",
        errorMessage: message,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}
