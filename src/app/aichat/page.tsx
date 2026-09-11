"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Box,
  Check,
  Columns2,
  Code2,
  Copy,
  ChevronDown,
  FolderPlus,
  GitBranch,
  Image,
  Menu,
  Mic,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  Plus,
  Plug,
  Search,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";

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
const models = ["Claude", "ChatGPT", "Gemini", "Grok", "Groq", "Copilot"];
const recentItems = ["House Architecture", "Modern Interior", "Robot Concept", "Living Room Design", "New Project"];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Gemini");
  const [modelsOpen, setModelsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"chat" | "workflow">("chat");
  const [splitView, setSplitView] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [activePanel, setActivePanel] = useState<"chat" | "studio">("chat");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!resizingRef.current) return;
    const handlePointerMove = (event: PointerEvent) => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      const bounds = workspace.getBoundingClientRect();
      const nextRatio = ((event.clientX - bounds.left) / bounds.width) * 100;
      setSplitRatio(Math.min(70, Math.max(30, nextRatio)));
    };
    const stopResizing = () => {
      resizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
    };
  }, [splitView]);

  const startResizing = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const conversation = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      const data = (await response.json()) as { message?: string; content?: string; answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "The AI request failed.");
      const assistantMessage = data.message || data.content || data.answer;
      if (!assistantMessage) throw new Error("The AI returned an empty response.");
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: assistantMessage },
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
    <div ref={workspaceRef} className="flex min-h-screen w-full overflow-hidden bg-[#0a0a0a] font-roboto text-white">
      <div
        className={`flex min-w-0 flex-1 ${splitView && activePanel === "studio" ? "hidden md:flex" : ""}`}
        style={splitView ? { flex: `0 0 ${splitRatio}%` } : undefined}
      >
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex ${sidebarCollapsed ? "w-[60px]" : "w-[276px]"} shrink-0 flex-col border border-[#2a2a2a] bg-[#0e0e0e] p-3 transition-[width,transform] duration-300 lg:inset-y-auto lg:static lg:m-3 lg:h-[calc(100vh-24px)] lg:rounded-[12px] lg:translate-x-0`}>
        <div className={`flex items-center rounded-xl px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/aichat" aria-label="Crystal AI Chat" className={`flex items-center gap-3 text-lg font-semibold tracking-tight text-white ${sidebarCollapsed ? "mx-auto" : ""}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3b82f6] shadow-lg shadow-blue-500/20"><Sparkles size={18} /></span>
            {!sidebarCollapsed && "Crystal"}
          </Link>
          <button onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Collapse sidebar" title="Collapse sidebar" className={`rounded-lg p-2 text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white lg:block ${sidebarCollapsed ? "hidden" : ""}`}><PanelLeftClose size={16} /></button>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="rounded-lg p-2 text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><X size={18} /></button>
        </div>

        {!sidebarCollapsed && <div className="flex min-h-0 flex-1 flex-col">
          <label className="mt-4 flex h-9 items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-3 text-zinc-500 focus-within:border-blue-500/60">
            <Search size={14} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600" />
            <kbd className="rounded border border-[#2a2a2a] px-1.5 py-0.5 text-[9px] text-zinc-600">⌘K</kbd>
          </label>

          <nav className="mt-5 space-y-1">
            <Link href="/archplan" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><FolderPlus size={16} className="text-zinc-500" /> New Project</Link>
            <button onClick={() => { setMessages([]); setInput(""); setSidebarOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><Plus size={16} className="text-zinc-500" /> New Chat</button>
            <Link href="/design-studio" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><Image size={16} className="text-zinc-500" /> Image</Link>
            <Link href="/platform/bridges" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><Plug size={16} className="text-zinc-500" /> Plugin</Link>
          </nav>

          <div className="mt-6">
          <button
            type="button"
            onClick={() => setModelsOpen((value) => !value)}
            aria-expanded={modelsOpen}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"
          >
            <Bot size={16} className="text-zinc-500" />
            <span className="flex-1">AI Model</span>
            <span className="text-[11px] text-zinc-600">{selectedModel}</span>
            <ChevronDown size={15} className={`text-zinc-600 transition-transform ${modelsOpen ? "rotate-180" : ""}`} />
          </button>
          {modelsOpen && (
            <div className="mt-1 space-y-0.5 rounded-xl bg-[#121212] p-1">
              {models.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[12px] transition ${selectedModel === model ? "bg-[#1c1c1c] text-white" : "text-zinc-500 hover:bg-[#181818] hover:text-zinc-200"}`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-md ${selectedModel === model ? "bg-blue-500/15 text-blue-400" : "bg-[#1a1a1a] text-zinc-500"}`}>
                    <Bot size={13} />
                  </span>
                  {model}
                  {selectedModel === model && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#22c55e]" />}
                </button>
              ))}
            </div>
          )}
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Recent</div>
            <div className="space-y-0.5">
              {recentItems.filter((item) => item.toLowerCase().includes(search.toLowerCase())).map((item, index) => <button key={item} onClick={() => { setInput(item); setSidebarOpen(false); }} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-zinc-200"><Sparkles size={14} className="shrink-0 text-zinc-600" /><span className="min-w-0 flex-1 truncate">{item}</span><MoreHorizontal size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100" /></button>)}
            </div>
            <div className="mt-5 space-y-1.5 border-t border-[#242424] pt-4">
              {conversations.filter((item) => item.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map((conversation, index) => <button key={conversation} onClick={() => setSidebarOpen(false)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition hover:bg-[#1c1c1c] ${index === 0 ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}><span className="truncate">{conversation}</span><MoreHorizontal size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100" /></button>)}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d99e72] text-[11px] font-bold text-[#27211c]">AL</span>
            <Link href="/account" className="min-w-0 flex-1"><span className="block truncate text-xs text-zinc-200">Crystal User</span><span className="block truncate text-[10px] text-zinc-600">you@alternusart.com</span></Link>
            <button aria-label="Account menu" title="Account menu" className="text-zinc-600 transition hover:text-white"><MoreHorizontal size={16} /></button>
          </div>
        </div>}
        {sidebarCollapsed && (
          <div className="flex min-h-0 flex-1 flex-col items-center">
            <nav className="mt-5 flex flex-col items-center gap-2" aria-label="Collapsed AI chat navigation">
              <Link href="/archplan" aria-label="New Project" title="New Project" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><FolderPlus size={16} /></Link>
              <button type="button" onClick={() => { setMessages([]); setInput(""); }} aria-label="New Chat" title="New Chat" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Plus size={17} /></button>
              <Link href="/design-studio" aria-label="Image" title="Image" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Image size={16} /></Link>
              <Link href="/platform/bridges" aria-label="Plugin" title="Plugin" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Plug size={16} /></Link>
              <span className="my-1 h-px w-6 bg-[#2a2a2a]" />
              <button type="button" onClick={() => setModelsOpen(true)} aria-label="AI models" title="AI models" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Bot size={16} /></button>
              <button type="button" onClick={() => setSearch("")} aria-label="Search" title="Search" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Search size={16} /></button>
            </nav>
            <div className="mt-auto flex flex-col items-center gap-3">
              <Link href="/account" aria-label="Open account" className="grid h-8 w-8 place-items-center rounded-full bg-[#d99e72] text-[11px] font-bold text-[#27211c]">AL</Link>
              <button onClick={() => setSidebarCollapsed(false)} aria-label="Expand sidebar" className="rounded-lg p-2 text-zinc-500 hover:bg-[#1c1c1c] hover:text-white"><PanelLeftOpen size={16} /></button>
            </div>
          </div>
        )}
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col bg-[#111111]">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="rounded-xl p-2 text-zinc-400 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><Menu size={20} /></button>
          <div className="mx-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] p-1 shadow-lg">
              <button onClick={() => setMode("chat")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "chat" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><Sparkles size={14} /> Chat</button>
              <button onClick={() => setMode("workflow")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "workflow" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><GitBranch size={14} /> Workflow</button>
            </div>
            <div className="hidden items-center gap-1 rounded-lg border border-[#2a2a2a] bg-[#141414] p-1 md:flex">
            <button type="button" onClick={() => setSplitView(false)} aria-label="Use chat only" title="Single panel" className={`grid h-7 w-7 place-items-center rounded-md transition ${!splitView ? "bg-[#2a2a2a] text-white" : "text-zinc-600 hover:text-zinc-300"}`}><PanelRightClose size={14} /></button>
            <button type="button" onClick={() => setSplitView(true)} aria-label="Enable split view" title="Split view" className={`grid h-7 w-7 place-items-center rounded-md transition ${splitView ? "bg-[#3b82f6] text-white" : "text-zinc-600 hover:text-zinc-300"}`}><Columns2 size={14} /></button>
            <Link href="/aicode" aria-label="Open AI Code" title="AI Code" className="grid h-7 w-7 place-items-center rounded-md text-zinc-600 transition hover:bg-[#2a2a2a] hover:text-[#6ca5ff]"><Code2 size={15} strokeWidth={2.2} /></Link>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/crystal" className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs text-zinc-400 transition hover:border-blue-500/50 hover:text-white">Go to Studio</Link>
            <Link href="/3d-studio" aria-label="Open 3D Studio Modeling" title="3D Studio Modeling" className="grid h-9 w-9 place-items-center rounded-lg border border-[#2a2a2a] text-zinc-400 transition hover:border-blue-500/50 hover:bg-[#1c1c1c] hover:text-[#6ca5ff]"><Box size={16} strokeWidth={2.2} /></Link>
          </div>
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
      {splitView && (
        <>
          <button
            type="button"
            aria-label="Resize chat and studio panels"
            title="Drag to resize panels"
            onPointerDown={startResizing}
            className="group relative z-20 hidden w-2 shrink-0 cursor-col-resize items-center justify-center border-x border-[#252525] bg-[#111111] transition hover:bg-[#1a1a1a] md:flex"
          >
            <span className="h-12 w-px bg-[#3b82f6]/40 transition group-hover:h-20 group-hover:bg-[#3b82f6]" />
          </button>
          <section className={`relative min-w-0 flex-1 overflow-hidden border-l border-[#252525] bg-[#191919] ${activePanel === "chat" ? "hidden md:block" : "block"}`}>
            <CrystalStudio embedded />
          </section>
        </>
      )}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414]/95 p-1 shadow-xl backdrop-blur md:hidden">
        <button type="button" onClick={() => setActivePanel("chat")} className={`rounded-full px-4 py-2 text-xs transition ${activePanel === "chat" ? "bg-[#3b82f6] text-white" : "text-zinc-500"}`}><Sparkles size={13} className="mr-1 inline" />Chat</button>
        <button type="button" onClick={() => { setSplitView(true); setActivePanel("studio"); }} className={`rounded-full px-4 py-2 text-xs transition ${activePanel === "studio" ? "bg-[#3b82f6] text-white" : "text-zinc-500"}`}><Columns2 size={13} className="mr-1 inline" />Studio</button>
      </div>
    </div>
  );
}
