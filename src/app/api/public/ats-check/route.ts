import { NextRequest, NextResponse } from "next/server";
import { calculateATSScore } from "@/lib/openai";

type RateLimitState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const memoryRateLimit = new Map<string, RateLimitState>();

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const current = memoryRateLimit.get(clientKey);

  if (!current || now > current.resetAt) {
    memoryRateLimit.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return true;
  }

  current.count += 1;
  memoryRateLimit.set(clientKey, current);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req);
    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const resumeText = (body?.resumeText || "").toString().trim();
    const jobDescription = (body?.jobDescription || "").toString().trim();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const mockResumeData = {
      personal: {},
      experience: [],
      education: [],
      skills: [],
      projects: [],
      raw_text: resumeText,
    };

    const result = await calculateATSScore(mockResumeData, jobDescription);

    return NextResponse.json({
      score: result.score,
      breakdown: result.breakdown,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
    });
  } catch (error: unknown) {
    console.error("Public ATS check error:", error);
    const message = error instanceof Error ? error.message : "Failed to evaluate ATS score";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




