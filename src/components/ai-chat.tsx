"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { X, Plus, ChevronDown, Sparkles, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WELCOME_MESSAGE, SUGGESTED_QUESTIONS } from "@/lib/ai-assistant";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
  imageUrl?: string;
}

interface QuickAction {
  id: string;
  label: string;
  link?: string;
  prompt?: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "browse-gallery", label: "Browse Gallery", link: "/gallery" },
  { id: "view-artists", label: "View Artists", link: "/artists" },
  { id: "create-image", label: "Create an image", prompt: "Create a beautiful impressionist painting of a sunset over the sea" },
  { id: "how-to-buy", label: "How to buy art?", prompt: "How do I buy art on Alternus? Walk me through the process." },
  { id: "sell-art", label: "Sell your Art", link: "/apply" },
  { id: "shipping-returns", label: "Shipping & Returns", prompt: "What are your shipping times and return policy?" },
  { id: "art-styles", label: "Art styles guide", prompt: "Tell me about different art styles and movements available on Alternus" },
  { id: "commission", label: "Commission artwork", prompt: "How can I commission a custom artwork from an artist?" },
];

const ADDABLE_ACTIONS: QuickAction[] = [
  { id: "generate-image", label: "Generate image", prompt: "Generate a unique art image for me" },
  { id: "art-news", label: "Art news today", prompt: "What's happening in the art world today?" },
  { id: "price-guide", label: "Art price guide", prompt: "Help me understand art pricing and valuation" },
  { id: "frame-advice", label: "Framing advice", prompt: "What framing options do you recommend for artwork?" },
  { id: "color-palette", label: "Color palette ideas", prompt: "Suggest a color palette for my space" },
  { id: "gift-ideas", label: "Art gift ideas", prompt: "Suggest art gifts for different occasions" },
];

const AI_MODES = [
  { id: "smart", label: "Smart", description: "Balanced speed and quality", icon: Sparkles },
  { id: "think-deeper", label: "Think deeper", description: "More thorough analysis", icon: Sparkles },
  { id: "study-learn", label: "Study and learn", description: "Educational explanations", icon: Sparkles },
  { id: "search", label: "Search", description: "Find artworks and artists", icon: Sparkles },
] as const;

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export function AIChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBarVisible, setIsBarVisible] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
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
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [selectedMode, setSelectedMode] = useState<string>("smart");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expandedInputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const hydratedRef = useRef(false);

  // Load chat history and current messages from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("alternus_ai_chat_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as ChatSession[];
        setChatHistory(parsed.map(s => ({
          ...s,
          timestamp: new Date(s.timestamp),
          messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
        })));
      }
      const savedMessages = localStorage.getItem("alternus_ai_current_chat");
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages) as Message[];
        setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
      const savedActions = localStorage.getItem("alternus_ai_quick_actions");
      if (savedActions) {
        setQuickActions(JSON.parse(savedActions));
      }
      const savedMode = localStorage.getItem("alternus_ai_mode");
      if (savedMode) {
        setSelectedMode(savedMode);
      }
    } catch {}
    hydratedRef.current = true;
  }, []);

  // Persist chat history to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("alternus_ai_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Persist quick actions to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("alternus_ai_quick_actions", JSON.stringify(quickActions));
  }, [quickActions]);

  // Persist selected mode to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("alternus_ai_mode", selectedMode);
  }, [selectedMode]);

  // Persist current messages to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("alternus_ai_current_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isExpanded && expandedInputRef.current) expandedInputRef.current.focus();
  }, [isExpanded]);

  // Ctrl+A — toggle the floating bar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "a") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setIsBarVisible((v) => !v);
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const sendMessage = async (text: string) => {
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
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        imageUrl: data.imageUrl || undefined,
      }]);
    } catch (error: unknown) {
      console.error("AI Chat error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm having trouble connecting right now. Error: ${errMsg}\n\nPlease try again or contact us at info@alternusart.com for assistance.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const closeAll = () => {
    setIsOpen(false);
    setIsExpanded(false);
    setIsSidebarOpen(false);
  };

  const startNewChat = () => {
    // Save current conversation to history if it has messages
    if (messages.length > 1) {
      const firstUserMsg = messages.find(m => m.role === "user");
      const title = firstUserMsg?.content.slice(0, 40) || "New Chat";
      setChatHistory(prev => [{
        id: Date.now().toString(),
        title: title + (title.length >= 40 ? "..." : ""),
        timestamp: new Date(),
        messages: [...messages],
      }, ...prev]);
    }
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE.en,
      timestamp: new Date(),
      suggestedQuestions: SUGGESTED_QUESTIONS.en,
    }]);
  };

  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  const removeQuickAction = (id: string) => {
    setQuickActions(prev => prev.filter(a => a.id !== id));
  };

  const addQuickAction = (action: QuickAction) => {
    setQuickActions(prev => {
      if (prev.some(a => a.id === action.id)) return prev;
      return [...prev, action];
    });
    setIsAddMenuOpen(false);
  };

  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestedQuestions || SUGGESTED_QUESTIONS.en;
  const hasConversation = messages.length > 1;

  // Hide on OS page
  if (pathname === "/main" || pathname === "/os" || pathname === "/") return null;

  return (
    <>
      {/* Floating AI Assistant Bar */}
      {!isOpen && !isExpanded && (
        <div
          className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
            isBarVisible
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-5 pointer-events-none"
          }`}
        >
          <div className="relative flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/60 px-2 py-2 w-[320px] md:w-[440px] group hover:shadow-blue-200/40 hover:shadow-[0_8px_32px] transition-shadow duration-300">

            {/* Animated glow ring on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Left: "+" button — quick actions / navigation dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative w-10 h-10 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50 hover:shadow-md"
                  aria-label="Quick actions"
                >
                  <Plus size={18} />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={10} className="w-60 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-150">

                {/* Navigation section */}
                <DropdownMenuLabel className="flex items-center gap-1.5 text-stone-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Navigate
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { id: "home", label: "Home", link: "/home", icon: "🏠" },
                  { id: "gallery-nav", label: "Gallery", link: "/gallery", icon: "🖼️" },
                  { id: "artists-nav", label: "Artists", link: "/artists", icon: "🎨" },
                  { id: "ai-page", label: "AI Assistant", link: "/ai", icon: "✨" },
                  { id: "apply-nav", label: "Sell your Art", link: "/apply", icon: "💼" },
                  { id: "dashboard-nav", label: "My Dashboard", link: "/dashboard", icon: "📊" },
                  { id: "orders-nav", label: "My Orders", link: "/orders", icon: "📦" },
                  { id: "cart-nav", label: "Cart", link: "/cart", icon: "🛒" },
                ].map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => router.push(item.link)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}

                {/* AI actions section */}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-1.5 text-stone-500">
                  <Sparkles size={12} />
                  Ask AI
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DEFAULT_QUICK_ACTIONS.filter((a) => !!a.prompt).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => { setIsExpanded(true); sendMessage(action.prompt!); }}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-blue-400">→</span>
                    {action.label}
                  </DropdownMenuItem>
                ))}

              </DropdownMenuContent>
            </DropdownMenu>

            {/* Center: text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  setIsExpanded(true);
                  sendMessage(input.trim());
                }
              }}
              onClick={() => setIsOpen(true)}
              placeholder="Ask AI anything..."
              className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none px-2 cursor-text transition-colors duration-150"
            />

            {/* Right: chevron-down button — mode selection dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 shadow-sm shadow-blue-500/30 hover:shadow-blue-500/50 hover:shadow-md"
                  aria-label="Select AI mode"
                >
                  <ChevronDown size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-52 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-150">
                <DropdownMenuLabel className="flex items-center gap-1.5 text-stone-500">
                  <Sparkles size={12} />
                  AI Mode
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {AI_MODES.map((mode) => (
                  <DropdownMenuItem
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`cursor-pointer ${selectedMode === mode.id ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{mode.label}</p>
                      <p className="text-xs text-stone-400">{mode.description}</p>
                    </div>
                    {selectedMode === mode.id && <Check size={14} className="ml-auto text-blue-500" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <p className="text-[10px] text-stone-400 text-center">Press <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-500 font-mono">Ctrl+A</kbd> to hide/show</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      )}

      {/* ==================== MINI CHAT WINDOW ==================== */}
      {isOpen && !isExpanded && (
        <div className="flex fixed inset-0 z-50 items-end justify-center md:justify-end px-5 pb-5 md:p-6">
          <div className="absolute inset-0" onClick={closeAll} />
          <div className="relative w-full md:w-[380px] h-[85vh] md:h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

            {/* Header */}
            <div className="bg-coffee px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    <Image src="/logo.png" alt="Alternus AI" width={36} height={36} className="object-cover" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-coffee" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Alternus AI</h3>
                  <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Art Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setIsOpen(false); setIsExpanded(true); }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  title="Expand"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" x2="14" y1="3" y2="10" />
                    <line x1="3" x2="10" y1="21" y2="14" />
                  </svg>
                </button>
                <button onClick={closeAll} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#f7f7f8]">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-coffee flex items-center justify-center overflow-hidden flex-shrink-0 mr-2 mt-1">
                      <Image src="/logo.png" alt="AI" width={20} height={20} className="object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-coffee text-white rounded-2xl rounded-br-md"
                      : "bg-white text-stone-800 rounded-2xl rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                  }`}>
                    {message.imageUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img src={message.imageUrl} alt="AI Generated Art" className="w-full h-auto rounded-lg" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-coffee flex items-center justify-center overflow-hidden flex-shrink-0 mr-2 mt-1">
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
                    <button key={question} onClick={() => sendMessage(question)}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-[11px] text-stone-600 transition-colors">
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-stone-100">
              <div className="flex items-center gap-2 bg-stone-50 rounded-full px-4 py-1 border border-stone-200 focus-within:border-stone-400 transition-colors">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Search or ask AI anything..." className="flex-1 py-2.5 bg-transparent text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                <button onClick={handleSend} disabled={!input.trim() || isTyping}
                  className="w-9 h-9 bg-coffee hover:bg-stone-800 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-stone-300 text-center mt-2">Powered by Alternus AI</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EXPANDED OVERLAY (Copilot-style) ==================== */}
      {isExpanded && (
        <div className="flex fixed inset-0 z-50">
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeAll} />

          {/* Expanded Panel */}
          <div className="relative mx-5 md:mx-auto my-5 md:my-10 w-full max-w-5xl h-[calc(100vh-40px)] md:h-[calc(100vh-80px)] bg-gradient-to-b from-stone-50 to-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.25)] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-200 overflow-hidden border-r border-stone-200 bg-white flex flex-col flex-shrink-0`}>
              <div className="p-3 border-b border-stone-100">
                <button onClick={startNewChat}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-coffee/5 hover:bg-coffee/10 text-coffee text-sm font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center mt-4 px-2">No previous chats yet</p>
                ) : (
                  <div className="space-y-1">
                    {chatHistory.map((session) => (
                      <div key={session.id} className="flex items-center gap-1 rounded-lg hover:bg-stone-100 transition-colors group">
                        <button onClick={() => loadChat(session)} className="flex-1 text-left px-3 py-2 min-w-0">
                          <p className="text-xs font-medium text-stone-700 truncate">{session.title}</p>
                          <p className="text-[10px] text-stone-400">{session.timestamp.toLocaleDateString()}</p>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setChatHistory(prev => prev.filter(s => s.id !== session.id)); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-md hover:bg-stone-200 transition-all flex-shrink-0"
                          title="Delete chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 hover:text-red-500">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-white/80 backdrop-blur-sm rounded-tr-2xl">
              <div className="flex items-center gap-2">
                {/* Sidebar toggle */}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${isSidebarOpen ? "bg-stone-200 text-stone-700" : "hover:bg-stone-100 text-stone-500 hover:text-stone-700"}`}
                  title="Chat history">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>
                  </svg>
                </button>
                <div className="flex items-center gap-2.5 ml-1">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-coffee flex items-center justify-center overflow-hidden">
                      <Image src="/logo.png" alt="Alternus AI" width={22} height={22} className="object-cover" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-stone-900">Alternus AI</h1>
                    <p className="text-[10px] text-stone-400">Art Assistant & Image Creator</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {/* New chat */}
                <button onClick={startNewChat}
                  className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-all duration-150 text-stone-400 hover:text-stone-700"
                  title="New chat">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/><path d="M5 12h14"/>
                  </svg>
                </button>
                {/* Minimize */}
                <button onClick={() => { setIsExpanded(false); setIsOpen(true); setIsSidebarOpen(false); }}
                  className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-all duration-150 text-stone-400 hover:text-stone-700"
                  title="Minimize">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>
                  </svg>
                </button>
                {/* Close */}
                <button onClick={closeAll}
                  className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all duration-150 text-stone-400 hover:text-red-500"
                  title="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {!hasConversation ? (
              /* ---- Welcome State ---- */
              <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee to-stone-700 flex items-center justify-center shadow-lg">
                    <Image src="/logo.png" alt="Alternus AI" width={40} height={40} className="object-cover" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-stone-900 mb-1">Good afternoon!</h2>
                <p className="text-stone-500 text-sm mb-8">What can I help you with today?</p>

                {/* Input */}
                <div className="w-full max-w-xl mb-4">
                  <div className="flex items-end gap-3 bg-white rounded-2xl border border-stone-200 shadow-sm px-4 py-3 focus-within:border-stone-400 focus-within:shadow-md transition-all">
                    <textarea
                      ref={expandedInputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Search or ask AI anything..."
                      rows={1}
                      className="flex-1 resize-none bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[24px] max-h-[120px]"
                      style={{ height: "24px" }}
                      onInput={(e) => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "24px";
                        t.style.height = t.scrollHeight + "px";
                      }}
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isTyping}
                      className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mode Selector + Add Button Row */}
                <div className="flex items-center gap-2 mb-4 max-w-xl w-full px-2">
                  <DropdownMenu open={isModeMenuOpen} onOpenChange={setIsModeMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-sm text-stone-600 transition-colors">
                        <Sparkles size={14} />
                        {AI_MODES.find(m => m.id === selectedMode)?.label ?? "Smart"}
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-52 z-[60]">
                      <DropdownMenuLabel>Select mode</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {AI_MODES.map(mode => (
                        <DropdownMenuItem
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={selectedMode === mode.id ? "bg-coffee/5 text-coffee" : ""}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{mode.label}</p>
                            <p className="text-xs text-stone-400">{mode.description}</p>
                          </div>
                          {selectedMode === mode.id && <Check size={14} className="ml-auto text-coffee" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-sm text-stone-600 transition-colors">
                        <Plus size={14} />
                        Add
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-56 z-[60]">
                      <DropdownMenuLabel>Add quick action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ADDABLE_ACTIONS
                        .filter(a => !quickActions.some(q => q.id === a.id))
                        .map(action => (
                          <DropdownMenuItem key={action.id} onClick={() => addQuickAction(action)}>
                            <Plus size={14} className="mr-2 text-stone-400" />
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      {ADDABLE_ACTIONS.filter(a => !quickActions.some(q => q.id === a.id)).length === 0 && (
                        <p className="text-xs text-stone-400 text-center py-2">All actions already added</p>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 justify-center px-2 max-w-xl">
                  {quickActions.map((action) => (
                    <div key={action.id} className="relative group inline-flex">
                      <button onClick={() => {
                        if (action.link) { closeAll(); router.push(action.link); }
                        else if (action.prompt) { sendMessage(action.prompt); }
                      }}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                          action.link
                            ? "bg-coffee/5 border-coffee/20 text-coffee hover:bg-coffee/10 font-medium"
                            : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm text-stone-600"
                        }`}>
                        {action.link && <span className="mr-1.5">→</span>}
                        {action.label}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuickAction(action.id); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-stone-400 mt-6">Powered by Claude AI & DALL-E</p>
              </div>
            ) : (
              /* ---- Chat State ---- */
              <>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {messages.filter(m => m.id !== "welcome").map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-coffee flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                          <Image src="/logo.png" alt="AI" width={22} height={22} className="object-cover" />
                        </div>
                      )}
                      <div className={`max-w-[65%] px-4 py-3 text-sm leading-relaxed ${
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

                {/* Input */}
                <div className="border-t border-stone-200 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-b-2xl">
                  <div className="max-w-xl mx-auto flex items-end gap-3 bg-stone-50 rounded-2xl border border-stone-200 px-4 py-3 focus-within:border-stone-400 transition-all">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Search or ask AI anything..."
                      rows={1}
                      className="flex-1 resize-none bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-h-[24px] max-h-[120px]"
                      style={{ height: "24px" }}
                      onInput={(e) => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "24px";
                        t.style.height = t.scrollHeight + "px";
                      }}
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isTyping}
                      className="w-10 h-10 bg-coffee hover:bg-stone-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 text-center mt-2">Powered by Claude AI & DALL-E</p>
                </div>
              </>
            )}
          </div>{/* end main content */}
          </div>{/* end panel */}
        </div>
      )}
    </>
  );
}
