"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { WELCOME_MESSAGE, SUGGESTED_QUESTIONS } from "@/lib/ai-assistant";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
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
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

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

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact us at info@alternusart.com for assistance.",
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

  const handleSuggestedQuestion = async (question: string) => {
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestedQuestions || SUGGESTED_QUESTIONS.en;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 items-center justify-center"
        aria-label="Open AI Chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 items-end justify-end p-6">
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Chat Container */}
          <div className="relative w-[380px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

            {/* Header */}
            <div className="bg-stone-900 px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    <Image
                      src="/logo.png"
                      alt="Alternus AI"
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-stone-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Alternus AI</h3>
                  <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Art Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#f7f7f8]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center overflow-hidden flex-shrink-0 mr-2 mt-1">
                      <Image src="/logo.png" alt="AI" width={20} height={20} className="object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed ${
                      message.role === "user"
                        ? "bg-stone-900 text-white rounded-2xl rounded-br-md"
                        : "bg-white text-stone-800 rounded-2xl rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center overflow-hidden flex-shrink-0 mr-2 mt-1">
                    <Image src="/logo.png" alt="AI" width={20} height={20} className="object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
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

            {/* Suggested Questions */}
            {currentSuggestions && currentSuggestions.length > 0 && messages.length <= 4 && (
              <div className="px-4 py-3 bg-white border-t border-stone-100">
                <p className="text-[11px] text-stone-400 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-[11px] text-stone-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-stone-100">
              <div className="flex items-center gap-2 bg-stone-50 rounded-full px-4 py-1 border border-stone-200 focus-within:border-stone-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about art..."
                  className="flex-1 py-2.5 bg-transparent text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 bg-stone-900 hover:bg-stone-800 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-stone-300 text-center mt-2">
                Powered by Alternus AI
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
