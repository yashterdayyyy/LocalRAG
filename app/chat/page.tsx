"use client";

import { Brain, Mic, Send, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Effect to append transcript when listening stops
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstMessage: input }),
    });

    const { sessionId } = await res.json();

    // Notify sidebar to refresh
    window.dispatchEvent(new CustomEvent("chat-updated"));

    // Redirect with first message
    router.push(
      `/chat/${sessionId}?q=${encodeURIComponent(input)}`
    );
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
      <div className="flex flex-col h-full items-center justify-center p-8 bg-[#0a0a0a] animate-pulse">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5" />
      </div>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-[#0a0a0a] text-zinc-500">
        Browser doesn&apos;t support speech recognition.
      </div>
    );
  }

  if (typeof window !== "undefined" && !("webkitSpeechRecognition" in window)) {
    console.warn("Voice input not supported in this browser");
  }

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-[#0a0a0a]">
      <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
        <Brain className="w-10 h-10 text-blue-500/50" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Start a Conversation
      </h2>

      <p className="text-zinc-500 max-w-xs text-sm leading-relaxed mb-6">
        Ask a question to begin exploring your knowledge base.
      </p>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md relative"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask LocalRAG..."
          disabled={loading}
          className="
            w-full pr-14 py-4 px-5
            rounded-2xl bg-zinc-900/50
            border border-white/10
            focus:border-blue-500/50
            focus:ring-blue-500/20
            shadow-xl
            text-sm
          "
        />
        <div className="absolute right-14 top-2">
          <Button onClick={toggleListening} type="button" size="icon" className={`h-10 w-10 rounded-xl ${listening ? "bg-red-600 animate-pulse" : ""}`}>
            {listening ? <Pause className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
          </Button>
        </div>

        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 h-10 w-10 rounded-xl cursor-pointer"
        >
          <Send className="w-4 h-4 bg-white" />
        </Button>
      </form>
    </div>
  );
}
