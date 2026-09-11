"use client";

import {
  Archive,
  ArrowUp,
  AudioLines,
  ChevronDown,
  Ellipsis,
  FolderKanban,
  Link as LinkIcon,
  Menu,
  Mic,
  Moon,
  Paperclip,
  Plus,
  Sparkles,
  Sun,
  Workflow,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";

type Theme = "light" | "dark";

const conversations = [
  "Villa Maris — material study",
  "Kitchen layout options",
  "Create a 3D environment",
  "Lighting plan for the studio",
  "AutoCAD course for learning",
];

export function CrystalWorkspace() {
  const [theme, setTheme] = useState<Theme>("light");
  const [view, setView] = useState<"chat" | "workflow">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("crystal-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.crystalTheme = theme;
    window.localStorage.setItem("crystal-theme", theme);
  }, [theme]);

  const submitMessage = () => {
    const next = message.trim();
    if (!next) return;
    setMessages((items) => [...items, next]);
    setMessage("");
  };

  if (view === "workflow") {
    return (
      <div className="fixed inset-0 z-[90]">
        <CrystalStudio />
        <button
          type="button"
          onClick={() => setView("chat")}
          className="fixed left-5 top-5 z-[110] inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-[#202020]/90 px-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-[#2b2b2b]"
        >
          <Sparkles size={14} /> Back to Crystal Chat
        </button>
      </div>
    );
  }

  const isDark = theme === "dark";
  const surface = isDark ? "bg-[#171a1f] text-[#f3f6fa]" : "bg-[#f7f8fa] text-[#20242b]";
  const panel = isDark ? "bg-[#20242a]/95" : "bg-white/90";
  const muted = isDark ? "text-[#929ba8]" : "text-[#707985]";

  return (
    <main className={`min-h-screen overflow-hidden transition-colors duration-300 ${surface}`}>
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-3 p-3 sm:p-4">
        <aside
          className={`fixed inset-y-3 left-3 z-40 flex w-[286px] flex-col rounded-[28px] px-5 py-6 shadow-[0_18px_50px_rgba(32,49,70,0.08)] transition-all duration-300 sm:inset-y-4 sm:left-4 ${panel} ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
          } lg:relative lg:inset-0 lg:left-0 lg:translate-x-0`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#357ff2] text-white shadow-[0_8px_18px_rgba(53,127,242,.25)]">
                <Sparkles size={19} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[17px] font-semibold tracking-[-0.03em]">Crystal</p>
                <p className={`text-[10px] uppercase tracking-[0.18em] ${muted}`}>3D Studio Modeling</p>
              </div>
            </div>
            <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className={`rounded-xl p-2 ${muted} transition hover:bg-black/5 dark:hover:bg-white/10 lg:hidden`}>
              <X size={17} />
            </button>
          </div>

          <button type="button" onClick={() => { setMessages([]); setSelectedConversation("New design brief"); }} className="mt-10 flex h-11 items-center gap-2 rounded-2xl bg-[#357ff2] px-4 text-sm font-semibold text-white transition hover:bg-[#276fe0]">
            <Plus size={17} /> New design brief
          </button>

          <div className="mt-9 flex items-center justify-between px-1">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${muted}`}>Your conversations</p>
            <button type="button" onClick={() => setMessages([])} className="text-[11px] font-medium text-[#357ff2] hover:underline">Clear all</button>
          </div>
          <nav className="mt-3 space-y-1" aria-label="Conversation history">
            {conversations.map((conversation, index) => (
              <button
                type="button"
                key={conversation}
                onClick={() => setSelectedConversation(conversation)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[13px] transition ${selectedConversation === conversation ? (isDark ? "bg-white/[0.08] text-white" : "bg-[#edf3ff] text-[#245bbd]") : `${muted} hover:bg-black/[0.04] dark:hover:bg-white/[0.05]`}`}
              >
                {index === 0 ? <FolderKanban size={15} className="shrink-0 opacity-80" /> : <Archive size={15} className="shrink-0 opacity-60" />}
                <span className="min-w-0 flex-1 truncate">{conversation}</span>
                {index === 0 && <Ellipsis size={15} className="opacity-0 transition group-hover:opacity-70" />}
              </button>
            ))}
          </nav>

          <div className={`mt-auto rounded-2xl p-4 ${isDark ? "bg-[#2a3038]" : "bg-[#f0f4f8]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c7d8f4] text-xs font-bold text-[#2859a0]">TB</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Toby Brown</p><p className={`truncate text-[11px] ${muted}`}>Studio plan</p></div>
              <ChevronDown size={15} className={muted} />
            </div>
          </div>
        </aside>

        {sidebarOpen && <button type="button" aria-label="Close sidebar overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[2px] lg:hidden" />}

        <section className="relative flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-black/[0.04] bg-white/40 shadow-[0_18px_50px_rgba(32,49,70,0.06)] dark:border-white/[0.04] dark:bg-[#1c2026]/70 sm:min-h-[calc(100vh-2rem)]">
          <header className="flex items-center justify-between px-5 py-5 sm:px-8">
            <button type="button" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-500 transition hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"><Menu size={19} /></button>
            <div className="mx-auto flex rounded-full bg-black/[0.045] p-1 dark:bg-white/[0.07]" role="tablist" aria-label="Workspace mode">
              {(["chat", "workflow"] as const).map((mode) => (
                <button key={mode} type="button" role="tab" aria-selected={view === mode} onClick={() => setView(mode)} className={`flex h-9 items-center gap-2 rounded-full px-5 text-xs font-semibold capitalize transition-all duration-200 ${view === mode ? "bg-white text-[#245fca] shadow-[0_3px_12px_rgba(35,76,130,.12)] dark:bg-[#303943] dark:text-[#6ca5ff]" : muted}`}>
                  {mode === "chat" ? <Sparkles size={14} /> : <Workflow size={14} />}{mode}
                </button>
              ))}
              <Link href="/aicode" className={`flex h-9 items-center gap-2 rounded-full px-5 text-xs font-semibold transition-all duration-200 ${muted} hover:bg-white hover:text-[#245fca] dark:hover:bg-[#303943] dark:hover:text-[#6ca5ff]`}><LinkIcon size={14} />Code</Link>
            </div>
            <button type="button" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={() => setTheme(isDark ? "light" : "dark")} className={`grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10 ${muted}`}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </header>

          <div className="relative flex flex-1 flex-col items-center justify-center px-5 pb-36 pt-8 text-center">
            <div className="pointer-events-none absolute left-1/2 top-[24%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#5c9bff]/[0.08] blur-3xl dark:bg-[#357ff2]/[0.12]" />
            <div className="relative">
              <p className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] ${muted}`}>Crystal / studio console</p>
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.055em]">Good morning, Toby</h1>
              <p className={`mt-4 text-[clamp(1rem,2vw,1.35rem)] tracking-[-0.02em] ${muted}`}>How can <span className="font-semibold text-[#357ff2]">Crystal</span> shape your next space?</p>
              {messages.length > 0 && <div className={`mx-auto mt-8 max-w-md rounded-2xl px-4 py-3 text-left text-sm ${isDark ? "bg-white/[0.08]" : "bg-white shadow-sm"}`}><span className="text-[#357ff2]">Brief added:</span> {messages[messages.length - 1]}</div>}
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 w-[min(720px,calc(100%-2rem))] -translate-x-1/2">
            <div className={`rounded-[24px] border p-3 shadow-[0_18px_45px_rgba(33,61,92,.12)] transition focus-within:border-[#357ff2]/60 focus-within:shadow-[0_14px_40px_rgba(53,127,242,.16)] ${isDark ? "border-white/[0.09] bg-[#252b33]" : "border-black/[0.08] bg-white"}`}>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(); } }} rows={2} placeholder="Describe a room, mood, material, or design problem..." aria-label="Design brief" className={`w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Attach reference" className={`grid h-9 w-9 place-items-center rounded-xl ${muted} transition hover:bg-black/5 dark:hover:bg-white/10`}><Paperclip size={17} /></button>
                  <button type="button" aria-label="Voice input" className={`grid h-9 w-9 place-items-center rounded-xl ${muted} transition hover:bg-black/5 dark:hover:bg-white/10`}><Mic size={17} /></button>
                  <span className={`hidden items-center gap-1 px-2 text-[10px] sm:flex ${muted}`}><AudioLines size={13} /> Spatial mode ready</span>
                </div>
                <button type="button" aria-label="Send design brief" onClick={submitMessage} className="grid h-10 w-10 place-items-center rounded-xl bg-[#357ff2] text-white shadow-[0_7px_15px_rgba(53,127,242,.25)] transition hover:bg-[#276fe0] disabled:cursor-not-allowed disabled:opacity-40" disabled={!message.trim()}><ArrowUp size={18} /></button>
              </div>
            </div>
            <p className={`mt-3 text-center text-[10px] ${muted}`}>Crystal can help with concepts, layouts, materials, renders, and technical documentation.</p>
          </div>

          <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#357ff2]" /><span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-white/25" : "bg-slate-300"}`} /><span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-white/15" : "bg-slate-200"}`} />
          </div>
        </section>
      </div>
    </main>
  );
}
