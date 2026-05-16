"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { SoftPaywallGate } from "@/components/billing/soft-paywall-gate";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const SYSTEM_PROMPT =
    "You are an expert career coach and resume advisor for Indian tech professionals. " +
    "You help with resume writing, job search strategy, interview preparation, salary negotiation, and " +
    "career planning. Be specific, actionable, and encouraging. Format responses with clear sections " +
    "when helpful.";

const SUGGESTIONS = [
    "Review my resume",
    "Prepare for interviews",
    "Career roadmap advice",
    "Improve my LinkedIn",
];

const MAX_CHARS = 2000;

function parseInlineMarkdown(text: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    const patterns = [
        { type: "link", regex: /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/ },
        { type: "code", regex: /`([^`]+)`/ },
        { type: "bold", regex: /\*\*([^*]+)\*\*/ },
        { type: "italic", regex: /\*([^*]+)\*/ },
    ];

    while (remaining.length > 0) {
        let earliestMatch: { type: string; match: RegExpExecArray } | null = null;

        for (const pattern of patterns) {
            const match = pattern.regex.exec(remaining);
            if (!match) continue;
            if (!earliestMatch || match.index < earliestMatch.match.index) {
                earliestMatch = { type: pattern.type, match };
            }
        }

        if (!earliestMatch) {
            tokens.push(remaining);
            break;
        }

        const { type, match } = earliestMatch;
        const [fullMatch, content, href] = match;
        const before = remaining.slice(0, match.index);

        if (before) tokens.push(before);

        if (type === "link") {
            tokens.push(
                <a
                    key={`md-link-${keyIndex++}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#14B8A6] underline"
                >
                    {content}
                </a>
            );
        } else if (type === "code") {
            tokens.push(
                <code
                    key={`md-code-${keyIndex++}`}
                    className="rounded bg-[#0B1118] px-1 py-0.5 text-[0.9em] text-[#E2E8F0]"
                >
                    {content}
                </code>
            );
        } else if (type === "bold") {
            tokens.push(
                <strong key={`md-bold-${keyIndex++}`} className="font-semibold">
                    {content}
                </strong>
            );
        } else if (type === "italic") {
            tokens.push(
                <em key={`md-italic-${keyIndex++}`} className="italic">
                    {content}
                </em>
            );
        }

        remaining = remaining.slice(match.index + fullMatch.length);
    }

    return tokens;
}

function MarkdownLite({ content }: { content: string }) {
    return (
        <span className="whitespace-pre-wrap leading-relaxed">
            {parseInlineMarkdown(content)}
        </span>
    );
}

const getMessageText = (message: UIMessage): string =>
    message.parts
        .map((part) => {
            if (part.type === "text") return part.text;
            if (part.type === "reasoning") return part.text;
            return "";
        })
        .filter(Boolean)
        .join("");

export default function AssistantPage() {
    const systemMessage = useMemo<UIMessage>(
        () => ({
            id: "system-prompt",
            role: "system",
            parts: [{ type: "text", text: SYSTEM_PROMPT }],
        }),
        []
    );

    const { messages, sendMessage, status, error } = useChat<UIMessage>({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        messages: [systemMessage],
    });

    const [input, setInput] = useState("");
    const isLoading = status === "submitted" || status === "streaming";

    const [timestamps, setTimestamps] = useState<Record<string, string>>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const visibleMessages = useMemo(
        () => messages.filter((message) => message.role !== "system"),
        [messages]
    );

    useEffect(() => {
        setTimestamps((prev) => {
            const next = { ...prev };
            messages.forEach((message) => {
                if (!next[message.id]) {
                    next[message.id] = new Date().toISOString();
                }
            });
            return next;
        });
    }, [messages]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [visibleMessages, isLoading]);

    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }, [input]);

    const remainingChars = Math.max(0, MAX_CHARS - input.length);

    const handleQuickSend = async (text: string) => {
        if (!text.trim() || isLoading) return;
        await sendMessage({ text });
    };

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        await sendMessage({ text: trimmed });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    const formatTimestamp = (iso?: string) => {
        if (!iso) return "";
        return new Date(iso).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            data-no-page-scroll="true"
            className="flex h-screen w-full flex-col overflow-hidden bg-[#080C10] text-[#F1F5F9]"
        >
            <SoftPaywallGate
                title="AI Assistant Requires Premium"
                subtitle="Use your trial or upgrade to continue unlimited assistant conversations."
            />

            <header className="flex items-center justify-between border-b border-[#1E2D3D] px-6 py-4">
                <h1 className="text-lg font-semibold">Your Career Assistant</h1>
                <span className="rounded-full border border-[#1E2D3D] bg-[#0F1419] px-3 py-1 text-xs text-[#94A3B8]">
                    Powered by GPT-4
                </span>
            </header>

            <main className="flex-1 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto px-6 py-6"
                >
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                        {visibleMessages.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F1419] border border-[#1E2D3D]">
                                    <Sparkles className="h-7 w-7 text-[#14B8A6]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold">How can I help with your career today?</h2>
                                    <p className="mt-2 text-sm text-[#94A3B8]">Pick a prompt or ask anything about resumes, jobs, or interviews.</p>
                                </div>
                                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleQuickSend(suggestion)}
                                            className="rounded-xl border border-[#1E2D3D] bg-[#0F1419] px-4 py-4 text-left text-sm font-medium text-[#F1F5F9] hover:border-[#14B8A6] hover:bg-[#101922] transition"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {visibleMessages.map((message) => {
                                    const isUser = message.role === "user";
                                    const bubbleStyles = isUser
                                        ? "bg-[#14B8A6] text-white"
                                        : "bg-[#0F1419] text-[#F1F5F9]";
                                    const maxWidth = isUser ? "max-w-[70%]" : "max-w-[75%]";
                                    const messageText = getMessageText(message);

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex flex-col ${maxWidth}`}>
                                                <div className={`rounded-lg px-4 py-3 ${bubbleStyles}`}>
                                                    {message.role === "assistant" ? (
                                                        <MarkdownLite content={messageText} />
                                                    ) : (
                                                        <span className="whitespace-pre-wrap leading-relaxed">{messageText}</span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-[#94A3B8]">
                                                    {formatTimestamp(timestamps[message.id])}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {isLoading && (
                                    <div className="flex w-full justify-start">
                                        <div className="max-w-[75%] rounded-lg bg-[#0F1419] px-4 py-3 text-[#F1F5F9]">
                                            <div className="flex items-center gap-1">
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.2s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8] [animation-delay:-0.1s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#94A3B8]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <div className="border-t border-[#1E2D3D] bg-[#0F1419] px-6 py-4">
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="mx-auto flex w-full max-w-4xl flex-col gap-2"
                >
                    <div className="flex items-end gap-3 rounded-2xl border border-[#1E2D3D] bg-[#161D26] px-4 py-3">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            maxLength={MAX_CHARS}
                            placeholder="Ask about your career, resume, jobs..."
                            className="w-full resize-none bg-transparent text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14B8A6] text-white transition hover:bg-[#0EA89A] disabled:opacity-50"
                            aria-label="Send message"
                        >
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                        <span>{error ? "Something went wrong. Try again." : "Shift+Enter for new line"}</span>
                        <span>{remainingChars} chars left</span>
                    </div>
                </form>
            </div>
        </div>
    );
}




