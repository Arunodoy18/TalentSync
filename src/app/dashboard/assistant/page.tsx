"use client";

import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

export default function AssistantPage() {
    return (
        <div className="w-full flex-1 h-full min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-7xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Your Assistant</h1>
                    <p className="text-[var(--text-muted)] mt-1">Get instant AI help with your resume, cover letters, ATS scores, and interview prep.</p>
                </div>
                <VercelV0Chat />
            </div>
        </div>
    );
}
