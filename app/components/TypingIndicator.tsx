"use client";

export default function TypingIndicator() {
    return (
        <div className="flex gap-1 items-center px-4 py-3">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
        </div>
    );
}
