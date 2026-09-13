"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Plus, MessageSquare, Brain, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ChatSidebar() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/sessions");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        }
    };

    useEffect(() => {
        fetchSessions();

        const handleUpdate = () => fetchSessions();
        const handleToggle = () => setIsCollapsed(prev => !prev);

        window.addEventListener("chat-updated", handleUpdate);
        window.addEventListener("toggle-sidebar", handleToggle);

        return () => {
            window.removeEventListener("chat-updated", handleUpdate);
            window.removeEventListener("toggle-sidebar", handleToggle);
        };
    }, []);

    const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this chat session?")) return;

        try {
            const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSessions((prev) => prev.filter((s) => s._id !== id));
                if (pathname.includes(id)) {
                    router.push("/chat");
                }
                window.dispatchEvent(new CustomEvent("chat-updated"));
            }
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 0 : 288 }}
            className={cn(
                "h-screen border-r border-white/5 bg-black flex flex-col relative shrink-0 overflow-hidden",
                isCollapsed ? "border-none" : "border-r"
            )}
        >

            {/* Header */}
            <div className={cn("p-6", isCollapsed && "px-4")}>
                <Link href="/" className="flex items-center gap-2 mb-8 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && <span className="font-bold text-lg tracking-tight truncate">LocalRAG</span>}
                </Link>

                <Link href="/chat">
                    <Button variant="primary" className={cn("w-full justify-start gap-2 h-11 rounded-xl shadow-blue-500/10", isCollapsed && "px-0 justify-center")}>
                        <Plus className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>New Chat</span>}
                    </Button>
                </Link>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                <div className={cn("px-3 mb-2", isCollapsed && "px-0 flex justify-center")}>
                    {!isCollapsed ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recent Chats</span>
                    ) : (
                        <div className="h-px bg-white/5 w-8" />
                    )}
                </div>

                {sessions.length === 0 ? (
                    !isCollapsed && (
                        <div className="px-3 py-4 text-xs text-zinc-500 italic">
                            No recent sessions
                        </div>
                    )
                ) : (
                    sessions.map((s) => {
                        const isActive = pathname.includes(s._id);
                        return (
                            <Link
                                key={s._id}
                                href={`/chat/${s._id}`}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden",
                                    isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <MessageSquare className={cn("w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100", isActive && "opacity-100 text-blue-400")} />
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{s.title || "Untitled Chat"}</div>
                                            <div className="text-[10px] opacity-40 mt-0.5">
                                                {new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, s._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                                            title="Delete Chat"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </Link>
                        );
                    })
                )}
            </div>
        </motion.aside>
    );
}
