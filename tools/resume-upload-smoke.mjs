import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function getEnv(name, optional = false) {
  const value = process.env[name];
  if (!optional && (!value || !value.trim())) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const baseUrl = (getEnv("SMOKE_BASE_URL", true) || "http://localhost:3000").replace(/\/$/, "");
  const authCookie = getEnv("SMOKE_AUTH_COOKIE");
  const smokeUserId = getEnv("SMOKE_USER_ID");
  const pdfPath = getEnv("SMOKE_PDF_PATH");
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const cleanup = String(process.env.SMOKE_CLEANUP || "false").toLowerCase() === "true";

  const absolutePdfPath = path.isAbsolute(pdfPath)
    ? pdfPath
    : path.resolve(process.cwd(), pdfPath);

  const buffer = await readFile(absolutePdfPath);

  const formData = new FormData();
  formData.append(
    "file",
    new File([buffer], path.basename(absolutePdfPath), {
      type: "application/pdf",
    })
  );

  const uploadResponse = await fetch(`${baseUrl}/api/resume/parse`, {
    method: "POST",
    headers: {
      cookie: authCookie,
    },
    body: formData,
  });

  const payloadText = await uploadResponse.text();
  let payload;

  try {
    payload = JSON.parse(payloadText);
  } catch {
    payload = { raw: payloadText };
  }

  if (!uploadResponse.ok) {
    throw new Error(
      `Upload request failed (${uploadResponse.status}): ${JSON.stringify(payload)}`
    );
  }

  const resumeId = payload?.resume?.id;
  if (!resumeId) {
    throw new Error(`Upload response missing resume.id: ${JSON.stringify(payload)}`);
  }

  const admin = createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: resume, error } = await admin
    .from("resumes")
    .select("id, user_id, title, content, created_at")
    .eq("id", resumeId)
    .eq("user_id", smokeUserId)
    .single();

  if (error || !resume) {
    throw new Error(`Uploaded resume not found in vault: ${error?.message || "no row"}`);
  }

  if (!resume.content || typeof resume.content !== "object") {
    throw new Error("Uploaded resume row has invalid content payload");
  }

  console.log("[ok] Resume upload smoke passed");
  console.log(`resume_id=${resume.id}`);
  console.log(`title=${resume.title || "Untitled Resume"}`);

  if (cleanup) {
    const { error: deleteError } = await admin.from("resumes").delete().eq("id", resume.id);
    if (deleteError) {
      throw new Error(`Cleanup failed for ${resume.id}: ${deleteError.message}`);
    }
    console.log(`[ok] Cleanup complete for ${resume.id}`);
  }
}

main().catch((error) => {
  console.error("[error] Resume upload smoke failed:", error.message);
  process.exit(1);
});
