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
      // Build conversation history (exclude welcome message and suggested questions)
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

  // Get the last message's suggested questions, or use defaults
  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestedQuestions || SUGGESTED_QUESTIONS.en;

  // This component is now only used for desktop
  // Mobile chat is handled by MobileChat component in mobile-nav
  return (
    <>
      {/* Desktop Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-50 w-16 h-16 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 items-center justify-center group"
        aria-label="Open AI Chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        {/* Tooltip */}
        <span className="absolute right-20 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with Alternus AI
        </span>
      </button>

      {/* Desktop Chat Window */}
      {isOpen && (
        <div className="hidden md:flex fixed inset-0 z-50 items-end justify-end p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className="relative w-full max-w-md h-[600px] max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                    <Image
                      src="/logo.png"
                      alt="Alternus AI"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Alternus AI</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Art Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Contact Options */}
            <div className="px-4 py-2 bg-gray-800 flex items-center gap-2 border-t border-gray-700">
              <span className="text-[11px] text-gray-400 mr-1">Write to:</span>
              <a
                href="mailto:curator@alternusart.com?subject=Inquiry from Alternus Gallery"
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-[11px] rounded-full transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Curator
              </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gray-900 text-white rounded-br-md"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm rounded-bl-md"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/logo.png"
                            alt="Alternus AI"
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Alternus AI</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-[10px] mt-2 ${message.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/logo.png"
                          alt="Alternus AI"
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (show if available) */}
            {currentSuggestions && currentSuggestions.length > 0 && messages.length <= 4 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {currentSuggestions.map((question) => (
                    <button
                      key={question}
                      onClick={async () => {
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
                      }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about art..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Powered by Alternus AI
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
