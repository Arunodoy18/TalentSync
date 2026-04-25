"use client";

import { useMemo, useState } from "react";
import { Copy, CheckCircle2, FlaskConical, KeyRound, UserCircle2 } from "lucide-react";

type SmokeTestHelperProps = {
  userId: string;
};

type CopyState = "idle" | "copied";

function buildPowerShellTemplate(userId: string): string {
  return [
    "$env:SMOKE_BASE_URL = \"http://localhost:3000\"",
    `$env:SMOKE_USER_ID = \"${userId}\"`,
    "$env:SMOKE_PDF_PATH = \"C:\\\\path\\\\to\\\\resume.pdf\"",
    "$env:SMOKE_AUTH_COOKIE = \"<paste cookie header from browser request>\"",
    "$env:SMOKE_CLEANUP = \"true\"",
    "npm run smoke:resume-upload",
  ].join("\n");
}

export function SmokeTestHelper({ userId }: SmokeTestHelperProps) {
  const [copiedUserId, setCopiedUserId] = useState<CopyState>("idle");
  const [copiedCommand, setCopiedCommand] = useState<CopyState>("idle");

  const commandTemplate = useMemo(() => buildPowerShellTemplate(userId), [userId]);

  const copyText = async (
    text: string,
    setState: (state: CopyState) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 1400);
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="app-surface p-6 space-y-5 lg:col-span-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Resume Upload Smoke Test Helper</h2>
          <p className="text-sm text-[var(--text-muted)]">Use this to run upload -&gt; parse -&gt; vault visibility verification quickly.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <UserCircle2 className="h-4 w-4 text-[var(--primary)]" />
            Smoke User ID
          </div>
          <p className="text-xs text-[var(--text-muted)] break-all">{userId}</p>
          <button
            type="button"
            onClick={() => copyText(userId, setCopiedUserId)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--primary)]"
          >
            {copiedUserId === "copied" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedUserId === "copied" ? "Copied" : "Copy User ID"}
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            <KeyRound className="h-4 w-4 text-[var(--primary)]" />
            Auth Cookie (Secure Capture)
          </div>
          <ol className="space-y-1 text-xs text-[var(--text-muted)] list-decimal pl-4">
            <li>Open browser DevTools Network tab while logged in.</li>
            <li>Trigger any request to this app domain.</li>
            <li>Copy the full Cookie request header into SMOKE_AUTH_COOKIE.</li>
          </ol>
          <p className="text-[11px] text-[var(--text-muted)]/80">Cookie is not shown in-app for security reasons.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--text)]">PowerShell command template</p>
          <button
            type="button"
            onClick={() => copyText(commandTemplate, setCopiedCommand)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--primary)]"
          >
            {copiedCommand === "copied" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedCommand === "copied" ? "Copied" : "Copy Template"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-muted)] whitespace-pre-wrap">
{commandTemplate}
        </pre>
      </div>
    </div>
  );
}
