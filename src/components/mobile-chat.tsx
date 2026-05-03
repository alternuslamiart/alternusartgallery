"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { WELCOME_MESSAGE, SUGGESTED_QUESTIONS } from "@/lib/ai-assistant";
import { PlanLimitBanner } from "@/components/plan-limit-banner";
import { forceAIPlanLimitReached, getAIPlanLimitState, recordAIPlanUsage } from "@/lib/ai-plan-limit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
}

interface MobileChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileChat({ isOpen, onClose }: MobileChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE.en,
      timestamp: new Date(),
      suggestedQuestions: SUGGESTED_QUESTIONS.en,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlanLimitReached, setIsPlanLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsPlanLimitReached(getAIPlanLimitState().reached);
  }, []);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const markPlanLimitReached = () => {
    setIsPlanLimitReached(forceAIPlanLimitReached().reached);
  };

  const handleSend = async () => {
    if (!input.trim() || isPlanLimitReached) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history (exclude welcome message)
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data?.code === "PLAN_LIMIT_REACHED") {
        markPlanLimitReached();
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setIsPlanLimitReached(recordAIPlanUsage().reached);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I apologize, but I'm having trouble connecting right now. Error: ${errMsg}\n\nPlease try again in a moment, or contact us at info@alternusart.com for assistance.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get the last message's suggested questions, or use defaults
  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestedQuestions || SUGGESTED_QUESTIONS.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Full Screen Chat Container */}
      <div className="absolute inset-0 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header - Fixed */}
        <header className="flex-shrink-0 bg-gray-900 px-4 py-3 flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                <Image
                  src="/logo.png"
                  alt="Alternus AI"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Alternus AI</h3>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        {/* Contact Options */}
        <div className="flex-shrink-0 px-4 py-2 bg-gray-800 flex items-center gap-2 border-t border-gray-700">
          <span className="text-[11px] text-gray-400 mr-1">Write to:</span>
          <a
            href="mailto:curator@alternusart.com?subject=Inquiry from Alternus Gallery"
            className="px-3 py-1 bg-gray-700 active:bg-gray-600 text-white text-[11px] rounded-full transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Curator
          </a>
        </div>

        {/* Messages - Scrollable */}
        <main className="flex-1 overflow-y-auto overscroll-contain bg-gray-100 dark:bg-gray-800">
          <div className="p-4 space-y-3 min-h-full">
            {isPlanLimitReached && <PlanLimitBanner dark />}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-gray-900 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-[10px] mt-1.5 ${message.role === "user" ? "text-white/50" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Suggested Questions */}
        {currentSuggestions && currentSuggestions.length > 0 && messages.length <= 4 && (
          <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {currentSuggestions.map((question) => (
                <button
                  key={question}
                  disabled={isPlanLimitReached}
                  onClick={async () => {
                    if (isPlanLimitReached) return;

                    const userMessage: Message = {
                      id: Date.now().toString(),
                      role: "user",
                      content: question,
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, userMessage]);
                    setIsTyping(true);

                    try {
                      const conversationHistory = messages
                        .filter((m) => m.id !== "welcome")
                        .map((m) => ({
                          role: m.role,
                          content: m.content,
                        }));

                      const response = await fetch("/api/ai-chat", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          message: question,
                          conversationHistory,
                        }),
                      });

                      const data = await response.json();

                      if (response.status === 429 || data?.code === "PLAN_LIMIT_REACHED") {
                        markPlanLimitReached();
                        return;
                      }

                      if (!response.ok) {
                        throw new Error(data.error || "Failed to get response");
                      }

                      setIsPlanLimitReached(recordAIPlanUsage().reached);
                      const assistantMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: data.content,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, assistantMessage]);
                    } catch (error) {
                      console.error("AI Chat error:", error);
                      const errMsg = error instanceof Error ? error.message : "Unknown error";
                      const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `I apologize, but I'm having trouble connecting right now. Error: ${errMsg}`,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, errorMessage]);
                    } finally {
                      setIsTyping(false);
                    }
                  }}
                  className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 transition-colors active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Fixed at bottom */}
        <footer className="flex-shrink-0 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isPlanLimitReached ? "Free plan limit reached. Upgrade to continue." : "Type a message..."}
              disabled={isPlanLimitReached}
              className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isPlanLimitReached}
              className="w-11 h-11 bg-gray-900 active:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
