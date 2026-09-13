"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, use, Suspense } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import TypingIndicator from "@/app/components/TypingIndicator";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Send, User, Bot, Brain, Mic, Pause, Trash2, Menu } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

/** Convert legacy <iframe> tags (from old messages) back to plain URLs so the `a` component can handle them */
function normalizeIframeTags(text: string): string {
    return text.replace(/<iframe\s[^>]*?\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi, (_, src) => src);
}

function ChatContent({ id }: { id: string }) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const { messages, setMessages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: `/api/chat?sessionId=${id}`
        }),
        body: {
            sessionId: id
        }
    } as any);

    const [historyLoaded, setHistoryLoaded] = useState(false);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const isAppending = useRef(false);
    useEffect(() => {
        if (!listening && transcript) {
            if (isAppending.current) return;
            isAppending.current = true;
            setInput((prev) => (prev ? prev + " " + transcript : transcript));
            resetTranscript();
            setTimeout(() => { isAppending.current = false; }, 100);
        }
    }, [listening, transcript, resetTranscript]);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`/api/messages/${id}`);
                if (!res.ok) {
                    console.error(`Failed to fetch history: ${res.status}`);
                    setHistoryLoaded(true);
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mappedMessages = data.map((m: any) => ({
                        id: m._id,
                        role: m.role as any,
                        parts: [{ type: "text" as const, text: m.content }],
                    }));
                    setMessages(mappedMessages);
                }
                setHistoryLoaded(true);
            } catch (error) {
                console.error("Failed to fetch history:", error);
                setHistoryLoaded(true);
            }
        }
        fetchHistory();
    }, [id, setMessages]);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status === "submitted" || status === "streaming") return;
        await sendMessage({ text: input, metadata: { sessionId: id } });
        setInput("");
    };

    const isLoading = status === "submitted" || status === "streaming";

    const searchParams = useSearchParams();
    const firstQuery = searchParams.get("q");
    const sentRef = useRef(false);

    useEffect(() => {
        if (historyLoaded && firstQuery && !sentRef.current && messages.length === 0) {
            sentRef.current = true;
            sendMessage({
                text: firstQuery,
                metadata: { sessionId: id }
            })
        }
    }, [historyLoaded, firstQuery, sendMessage, messages.length, id]);

    const handleDeleteChat = async () => {
        if (!confirm("Are you sure you want to delete this chat session? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                window.dispatchEvent(new CustomEvent("chat-updated"));
                router.push("/");
            } else {
                alert("Failed to delete chat.");
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
            alert("An error occurred while deleting the chat.");
        }
    };

    function toggleListening() {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            SpeechRecognition.startListening({ continuous: true });
        }
    }

    if (!isMounted) {
        return (
            <div className="flex flex-col h-screen bg-[#0a0a0a] animate-pulse">
                <header className="h-16 border-b border-white/5 flex items-center px-8 bg-black/50 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                        <div className="h-4 w-32 bg-zinc-800 rounded" />
                    </div>
                </header>
                <main className="flex-1" />
            </div>
        );
    }

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-zinc-500">
                Voice input not supported in this browser.
            </div>
        );
    }

    if (typeof window !== "undefined" && !("webkitSpeechRecognition" in window)) {
        console.warn("Voice input not supported in this browser");
    }

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a]">
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-black/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
                        className="text-zinc-500 hover:text-white"
                        title="Toggle Sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                            <Brain className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white">Knowledge Session</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">ID: {id.slice(-6)}</p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleDeleteChat}
                    variant="ghost"
                    size="icon"
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete Chat"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto py-8">
                <div className="max-w-4xl mx-auto px-6 space-y-8 pb-12">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
                                <Brain className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Deep Knowledge Retrieval</h2>
                            <p className="text-zinc-500 max-w-sm">
                                This session is ready. Ask anything about your indexed documents and notes.
                            </p>
                        </motion.div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${m.role === "user"
                                    ? "bg-blue-600/10 border-blue-500/20 text-blue-400"
                                    : "bg-zinc-800 border-white/10 text-zinc-400"
                                    }`}>
                                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={`flex flex-col min-w-0 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`px-5 py-3 rounded-2xl min-w-0 w-full ${m.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-zinc-900 border border-white/5 text-zinc-200"
                                        }`}>
                                        {m.parts.map((p, i) => (
                                            p.type === "text" ? (
                                                <div key={i} className="prose prose-sm prose-invert max-w-none">
                                                    {p.text.split("\n\n").map((block, idx) => {
                                                        return (
                                                            <Markdown
                                                                remarkPlugins={[remarkGfm]}
                                                                key={idx}
                                                                components={{
                                                                    code({ inline, className, children, ...props }: any) {
                                                                        const match = /language-(\w+)/.exec(className || "");
                                                                        return !inline && match ? (
                                                                            <SyntaxHighlighter
                                                                                style={vscDarkPlus}
                                                                                language={match[1]}
                                                                                PreTag="div"
                                                                                className="rounded-xl my-4 text-xs"
                                                                                {...props}
                                                                            >
                                                                                {String(children).replace(/\n$/, "")}
                                                                            </SyntaxHighlighter>
                                                                        ) : (
                                                                            <code
                                                                                className="bg-white/10 px-1.5 py-0.5 rounded text-sm"
                                                                                {...props}
                                                                            >
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    a({ href, children }) {
                                                                        if (!href) return <>{children}</>;

                                                                        const videoId = extractYoutubeId(href);
                                                                        if (videoId) {
                                                                            return (
                                                                                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                                                                                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                                                                                        <iframe
                                                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                                                            title="Embedded video"
                                                                                            className="absolute top-0 left-0 w-full h-full"
                                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                            allowFullScreen
                                                                                            referrerPolicy="strict-origin-when-cross-origin"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <a
                                                                                href={href}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                                                                            >
                                                                                {children}
                                                                            </a>
                                                                        );
                                                                    },
                                                                    img({ src, alt }) {
                                                                        if (!src) return null;

                                                                        return (
                                                                            <div className="group relative my-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-all duration-300 hover:border-white/20">
                                                                                <Image
                                                                                    src={(src as string).replace("/public", "")}
                                                                                    alt={alt ?? "Knowledge Image"}
                                                                                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                                                                    loading="lazy"
                                                                                    width={1600}
                                                                                    height={900}
                                                                                    quality={100}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    },
                                                                    p({ children }) {
                                                                        return <div className="my-3">{children}</div>;
                                                                    },
                                                                }}
                                                            >
                                                                {normalizeIframeTags(block)}
                                                            </Markdown>
                                                        );
                                                    })}
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                    <div className="mt-1 px-2 text-[10px] text-zinc-600">
                                        {m.role === "user" ? "You" : "LocalRAG"}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-2">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>
            </main>

            <div className="p-6 bg-linear-to-t from-black via-black to-transparent">
                <form onSubmit={onSubmit} className="max-w-4xl mx-auto relative group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search LocalRAG..."
                        disabled={isLoading}
                        className="pr-14 h-14 rounded-2xl bg-zinc-900/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-2xl transition-all"
                    />

                    <div className="absolute right-14 top-2">
                        <Button onClick={toggleListening} type="button" size="icon" className={`h-10 w-10 rounded-xl cursor-pointer ${listening ? "bg-red-600 animate-pulse" : ""}`}>
                            {listening ? <Pause className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                        </Button>
                    </div>

                    <div className="absolute right-2 top-2">
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-10 w-10 rounded-xl cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
                <p className="text-center mt-3 text-[10px] text-zinc-600 tracking-wider">
                    AI generated responses may be inaccurate. Check citations for verification.
                </p>
            </div>
        </div>
    );
}

export default function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-zinc-500">Loading session...</div>}>
            <ChatContent id={id} />
        </Suspense>
    );
}
