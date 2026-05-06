"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlanLimitBanner } from "@/components/plan-limit-banner";
import { forceAIPlanLimitReached, getAIPlanLimitState, recordAIPlanUsage } from "@/lib/ai-plan-limit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const QUICK_ACTIONS = [
  { label: "Explore art styles", icon: "palette", prompt: "Tell me about different art styles and movements" },
  { label: "Create an image", icon: "image", prompt: "Create a beautiful impressionist painting of a sunset over the sea" },
  { label: "Get art advice", icon: "lightbulb", prompt: "I want to start an art collection. What advice do you have?" },
  { label: "Learn art history", icon: "book", prompt: "Tell me about the Renaissance period and its most famous artists" },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlanLimitReached, setIsPlanLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setIsPlanLimitReached(getAIPlanLimitState().reached);
  }, []);

  const markPlanLimitReached = () => {
    setIsPlanLimitReached(forceAIPlanLimitReached().reached);
  };

  const sendMessage = async (text: string) => {
    if (isTyping || isPlanLimitReached) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationHistory }),
      });

      const data = await response.json();
      if (response.status === 429 || data?.code === "PLAN_LIMIT_REACHED") {
        markPlanLimitReached();
        return;
      }
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setIsPlanLimitReached(recordAIPlanUsage().reached);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.answer,
        timestamp: new Date(),
        imageUrl: data.imageUrl || undefined,
      }]);
    } catch (error) {
      console.error("AI error:", error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I couldn't complete that request. Please check the AI configuration or try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping || isPlanLimitReached) return;
    sendMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Gallery
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-coffee flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Alternus AI" width={24} height={24} className="object-cover" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-stone-900">Alternus AI</h1>
              <p className="text-[10px] text-stone-400">Art Assistant & Image Creator</p>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {!hasMessages ? (
          /* Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coffee to-stone-700 flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Alternus AI" width={48} height={48} className="object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white" />
            </div>

            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Welcome to Alternus AI
            </h2>
            <p className="text-stone-500 text-center max-w-md mb-10">
              Your personal art assistant. Ask about art history, styles, techniques, or create stunning AI-generated artwork.
            </p>

            {isPlanLimitReached && (
              <div className="mb-6 w-full max-w-2xl">
                <PlanLimitBanner />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-10">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isPlanLimitReached}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 group-hover:bg-coffee/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    {action.icon === "palette" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coffee"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    )}
                    {action.icon === "image" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coffee"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    )}
                    {action.icon === "lightbulb" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coffee"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                    )}
                    {action.icon === "book" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coffee"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    )}
                  </div>
                  <span className="text-sm text-stone-700 font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Input Area - Welcome State */}
            <div className="w-full max-w-2xl">
              <div className="flex items-end gap-3 bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-3 focus-within:border-stone-400 focus-within:shadow-md transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isPlanLimitReached ? "Free plan limit reached. Upgrade to continue." : "Ask anything about art, or describe an image to create..."}
                  disabled={isPlanLimitReached}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[24px] max-h-[120px]"
                  style={{ height: "24px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "24px";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isPlanLimitReached}
                  className="w-10 h-10 bg-coffee hover:bg-stone-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
                  </svg>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-3">
                Powered by Gemini via /api/ai-chat. Alternus AI can make mistakes.
              </p>
            </div>
          </div>
        ) : (
          /* Chat State */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {isPlanLimitReached && <PlanLimitBanner />}

              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-coffee flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                      <Image src="/logo.png" alt="AI" width={22} height={22} className="object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${message.role === "user" ? "" : ""}`}>
                    <div className={`px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-coffee text-white rounded-2xl rounded-br-sm"
                        : "bg-white text-stone-800 rounded-2xl rounded-bl-sm shadow-sm border border-stone-100"
                    }`}>
                      {message.imageUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden">
                          <img src={message.imageUrl} alt="AI Generated Art" className="w-full h-auto rounded-xl" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-coffee flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image src="/logo.png" alt="AI" width={22} height={22} className="object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-stone-100">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Chat State */}
            <div className="sticky bottom-0 bg-gradient-to-t from-stone-100 via-stone-100 to-transparent pt-6 pb-4 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-end gap-3 bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-3 focus-within:border-stone-400 focus-within:shadow-md transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isPlanLimitReached ? "Free plan limit reached. Upgrade to continue." : "Ask anything about art..."}
                    disabled={isPlanLimitReached}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[24px] max-h-[120px]"
                    style={{ height: "24px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "24px";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || isPlanLimitReached}
                    className="w-10 h-10 bg-coffee hover:bg-stone-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
                    </svg>
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 text-center mt-2">
                  Powered by Gemini via /api/ai-chat
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
