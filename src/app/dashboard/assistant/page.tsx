"use client";

import dynamic from "next/dynamic";
import { SoftPaywallGate } from "@/components/billing/soft-paywall-gate";

const AnimatedAIChat = dynamic(
    () => import("@/components/ui/animated-ai-chat").then((m) => m.AnimatedAIChat),
    {
        ssr: false,
        loading: () => (
            <div className="h-full min-h-0 w-full animate-pulse">
                <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
                    <div className="h-10 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
                    <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
                    <div className="h-28 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
                </div>
            </div>
        ),
    }
);

export default function AssistantPage() {
    return (
        <div data-no-page-scroll="true" className="w-full flex-1 h-full min-h-0 overscroll-none overflow-hidden m-0 p-0">
             <SoftPaywallGate
                title="AI Assistant Requires Premium"
                subtitle="Use your trial or upgrade to continue unlimited assistant conversations."
             />
             <AnimatedAIChat />
        </div>
    );
}




