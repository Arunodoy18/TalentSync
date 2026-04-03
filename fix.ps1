
$v0Chat = @"
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import {
    ImageIcon,
    FileUp,
    FileText,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = minHeight + "px";
                return;
            }

            textarea.style.height = minHeight + "px";

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = newHeight + "px";
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = minHeight + "px";
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
    const { messages, sendMessage, status } = useChat();
    const [input, setInput] = useState("");
    
    const isLoading = status === "submitted" || status === "streaming";
    
    const handleInputChange = (e: any) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e?: any) => {
        if (e) e.preventDefault();
        if (input.trim() && !isLoading) {
            sendMessage({ text: input });
            setInput("");
            adjustHeight(true);
        }
    };

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-140px)]">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-4 space-y-8">
                    <h1 className="text-4xl font-bold text-black dark:text-white text-center">
                        What can I help you achieve?
                    </h1>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
                    {messages.map((m: any) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex flex-col max-w-[80%]",
                                m.role === "user" ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-4 py-3 outline-none shadow-sm",
                                    m.role === "user"
                                        ? "bg-[var(--primary)] text-white rounded-l-2xl rounded-tr-2xl"
                                        : "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-r-2xl rounded-tl-2xl"
                                )}
                            >
                                <p className="whitespace-pre-wrap">{m.content || m.text}</p>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                                {m.role === "user" ? "You" : "TalentSync Assistant"}
                            </span>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="self-start px-4 py-3 rounded-xl bg-[var(--card)] text-[var(--text-muted)] flex gap-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce delay-100">.</span>
                            <span className="animate-bounce delay-200">.</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <div className={cn("w-full px-4 shrink-0 transition-all", messages.length > 0 ? "pb-4 -mt-16 z-10" : "")}>
                <form onSubmit={handleSubmit}>
                    <div className="relative bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm focus-within:ring-1 focus-within:ring-[var(--primary)]/20 transition-all">
                        <div className="overflow-y-auto">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your goal..."
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-[var(--text)] text-base",
                                    "focus:outline-none",
                                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "placeholder:text-[var(--text-muted)]",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="group p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Paperclip className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text)]" />
                                    <span className="text-xs text-[var(--text-muted)] hidden group-hover:inline transition-opacity">
                                        Attach Resume or Job
                                    </span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "px-2 py-2 rounded-lg text-sm transition-colors border flex items-center justify-center gap-1",
                                        input.trim()
                                            ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)] hover:opacity-90"
                                            : "bg-transparent text-[var(--text-muted)] border-[var(--border)]"
                                    )}
                                >
                                    <ArrowUpIcon
                                        className={cn(
                                            "w-4 h-4",
                                            input.trim()
                                                ? "text-[var(--bg)]"
                                                : "text-[var(--text-muted)]"
                                        )}
                                    />
                                    <span className="sr-only">Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {messages.length === 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        <ActionButton
                            icon={<FileUp className="w-4 h-4" />}
                            label="Create Career Roadmap"
                            onClick={() => {
                                setInput("Can you help me create a step-by-step career roadmap for becoming a Senior Engineer?");
                                setTimeout(() => adjustHeight(), 0);
                            }}
                        />
                        <ActionButton
                            icon={<MonitorIcon className="w-4 h-4" />}
                            label="Review my ATS score"
                            onClick={() => {
                                setInput("I need help improving my ATS formatting. What are the best practices?");
                                setTimeout(() => adjustHeight(), 0);
                            }}
                        />
                        <ActionButton
                            icon={<ImageIcon className="w-4 h-4" />}
                            label="Prep for interview"
                            onClick={() => {
                                setInput("Can you ask me 3 common behavioral interview questions for a tech company?");
                                setTimeout(() => adjustHeight(), 0);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] hover:bg-[var(--secondary)] rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
"@
$v0Chat | Set-Content -Path src/components/ui/v0-ai-chat.tsx -Encoding UTF8

