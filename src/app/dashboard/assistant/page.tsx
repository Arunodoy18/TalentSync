"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { SoftPaywallGate } from "@/components/billing/soft-paywall-gate";

export default function AssistantPage() {
    return (
        <div className="w-full flex-1 h-full min-h-screen overscroll-none overflow-hidden m-0 p-0">
             <SoftPaywallGate
                title="AI Assistant Requires Premium"
                subtitle="Use your trial or upgrade to continue unlimited assistant conversations."
             />
             <AnimatedAIChat />
        </div>
    );
}
