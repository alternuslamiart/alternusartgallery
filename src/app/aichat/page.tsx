"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  GitBranch,
  Menu,
  Mic,
  MoreHorizontal,
  Plus,
  Share2,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; content: string };

const conversations = [
  "Create HTML Game...",
  "Apply To Leave For Emergency",
  "What is UI UX Design?",
  "Create UI System",
  "What is UX Design",
  "Create Prompt...",
  "Create 3D Environment",
  "AutoCAD Course for Leaning",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "workflow">("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as { content?: string; answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "The AI request failed.");
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: data.content || data.answer || "I could not generate a response." },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: error instanceof Error ? error.message : "The AI request failed." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white">
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[276px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0e0e0e] p-5 transition-transform duration-300 lg:static lg:translate-x-0`}>
        <div className="flex items-center justify-between">
          <Link href="/aichat" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3b82f6] shadow-lg shadow-blue-500/20"><Sparkles size={18} /></span>
            Crystal
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><X size={18} /></button>
        </div>

        <div className="mt-9 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Your conversations</span>
          <button onClick={() => setMessages([])} className="text-[#3b82f6] transition hover:text-blue-300">Clear All</button>
        </div>
        <nav className="mt-4 space-y-1.5">
          {conversations.map((conversation, index) => (
            <button key={conversation} onClick={() => setSidebarOpen(false)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 hover:bg-[#1c1c1c] ${index === 0 ? "border-l-2 border-[#3b82f6] bg-[#1c1c1c] text-white" : "border-l-2 border-transparent text-zinc-500 hover:text-zinc-200"}`}>
              <span className="truncate">{conversation}</span>
              {index === 0 && <MoreHorizontal size={16} className="shrink-0 text-zinc-300" />}
            </button>
          ))}
        </nav>
        <button className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] py-3 text-sm font-semibold shadow-lg shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-500/25 active:scale-95"><Sparkles size={15} /> Upgrade Now</button>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col bg-[#111111]">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="rounded-xl p-2 text-zinc-400 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><Menu size={20} /></button>
          <div className="mx-auto flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] p-1 shadow-lg">
            <button onClick={() => setMode("chat")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "chat" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><Sparkles size={14} /> Chat</button>
            <button onClick={() => setMode("workflow")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "workflow" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><GitBranch size={14} /> Workflow</button>
          </div>
          <Link href="/crystal" className="hidden rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs text-zinc-400 transition hover:border-blue-500/50 hover:text-white sm:block">Go to Studio</Link>
        </header>

        <section className="flex flex-1 flex-col overflow-y-auto px-4 pb-36 sm:px-8">
          {messages.length === 0 ? (
            <div className="m-auto text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] text-[#3b82f6]"><Sparkles size={21} /></div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-200 sm:text-3xl">Good Morning, Toby</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-200 sm:text-3xl">How Can I <span className="text-[#3b82f6]">Assist You Today?</span></h1>
              {mode === "workflow" && <p className="mt-4 text-sm text-zinc-500">Build a repeatable creative workflow with Crystal.</p>}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
              {messages.map((message) => (
                <div key={message.id} className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "bg-[#1c1c1c] text-zinc-100" : "border border-[#2a2a2a] bg-[#171717] text-zinc-300"}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && <div className="mt-3 flex gap-1 opacity-60 transition group-hover:opacity-100"><button onClick={() => void copyMessage(message)} aria-label="Copy response" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}</button><button aria-label="Share response" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]"><Share2 size={14} /></button><Link href="/crystal" className="ml-1 rounded-lg px-2 py-1 text-[11px] text-[#3b82f6] transition hover:bg-blue-500/10">Go to Crystal</Link></div>}
                  </div>
                </div>
              ))}
              {isSending && <div className="flex"><div className="flex items-center gap-1 rounded-2xl border border-[#2a2a2a] bg-[#171717] px-4 py-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.3s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" /></div></div>}
            </div>
          )}
        </section>

        <form onSubmit={sendMessage} className="absolute bottom-6 left-1/2 flex w-[calc(100%-32px)] max-w-[620px] -translate-x-1/2 items-end gap-2 rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/90 p-2 shadow-2xl backdrop-blur-xl transition focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10">
          <button type="button" aria-label="New conversation" onClick={() => { setMessages([]); setInput(""); }} className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2a2a2a] text-zinc-400 transition hover:scale-105 hover:text-white active:scale-95"><Plus size={18} /></button>
          <textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} placeholder="Ask Crystal anything..." className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600" />
          <button type="button" aria-label="Use microphone" className="mb-0.5 hidden h-9 w-9 shrink-0 place-items-center rounded-xl text-zinc-500 transition hover:bg-[#2a2a2a] hover:text-white sm:grid"><Mic size={17} /></button>
          <button type="submit" aria-label="Send message" disabled={!input.trim() || isSending} className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-[#2563eb] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={17} /></button>
        </form>
      </main>
    </div>
  );
}
