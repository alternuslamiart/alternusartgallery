"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Check,
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
  Plus,
  Paperclip,
  Plug,
  Search,
  Share2,
  Sparkles,
  Target,
  EyeOff,
  Pencil,
  Trash2,
  UserRound,
  Settings2,
  CircleHelp,
  Info,
  LogOut,
  X,
  Moon,
  Sun,
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
const models = ["Claude", "ChatGPT", "Gemini", "Grok", "Groq", "Copilot"];
const initialRecentItems = ["House Architecture", "Modern Interior", "Robot Concept", "Living Room Design", "New Project"];
type ChatSection = { id: string; label: string };
const TEST_RESPONSE = `But the main point is this:

A large company doesn't just buy a beautiful UI.

If Crystal had:

⚡ a very fast renderer
🤖 AI that creates/modifies 3D
🧱 procedural modeling
🎨 PBR/material system
📦 professional export: GLTF, STEP, OBJ, etc.
🖥️ a serious desktop application
☁️ cloud collaboration
🔌 plugin ecosystem/API
👥 real users
💰 recurring revenue
🧠 technology/IP that is hard to copy

...then the situation changes significantly.

At that point, Crystal might not just be "a piece of software"; it could become a strategic asset.

Autodesk, for instance, has a history of scouting for technology to integrate into its ecosystem: e.g., acquiring Solid Angle for the Arnold renderer and Wonder Dynamics for AI/VFX.

And there is an even more interesting scenario.

If Crystal is built in such a way that:

"A person with no 3D knowledge can create a professional asset simply by describing it in text."

...then Crystal could position itself not just against Blender/Maya/3ds Max, but in a brand-new category:

An AI-powered 3D creation platform.

This would make it far more attractive to a large company.

So, yes: an exit via acquisition is a realistic goal. But first, you have to build something of strategic value—not just a product with a lot of features.`;

const getGeneratedSection = (content: string, index: number): string => {
  const normalized = content.toLowerCase();
  if (/\b(pdf|portable document)\b/.test(normalized)) return "PDF";
  if (/\b(docx|word document|document)\b/.test(normalized)) return "DOCX";
  if (/\b(photo|image|jpg|jpeg|png|render|visual)\b/.test(normalized)) return "Photo";
  if (/\b(plan|floor plan|architecture|architectural)\b/.test(normalized)) return "Architecture plan";
  if (/\b(file|download|attachment|export)\b/.test(normalized)) return "File";
  return index === 0 ? "Description" : `Description ${index + 1}`;
};

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
  const [recentItems, setRecentItems] = useState(initialRecentItems);
  const [openConversationMenu, setOpenConversationMenu] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasPastedInput, setHasPastedInput] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const chatSections = useMemo<ChatSection[]>(() => [
    { id: "header", label: "Header" },
    ...messages.map((message, index) => ({
      id: `message-${message.id}`,
      label: message.role === "assistant" ? getGeneratedSection(message.content, index) : "Prompt",
    })),
  ], [messages]);

  useEffect(() => {
    setIsLight(window.localStorage.getItem("Coreforge_auth_theme") === "light");
  }, []);

  const toggleTheme = () => {
    setIsLight((current) => {
      const next = !current;
      window.localStorage.setItem("Coreforge_auth_theme", next ? "light" : "dark");
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, hasPastedInput ? 208 : 160)}px`;
  }, [hasPastedInput, input]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setHasPastedInput(false);
    setIsSending(true);

    await new Promise((resolve) => window.setTimeout(resolve, 250));
    setMessages((current) => [
      ...current,
      { id: Date.now() + 1, role: "assistant", content: TEST_RESPONSE },
    ]);
    setIsSending(false);
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const handleConversationAction = async (action: string, item: string) => {
    setOpenConversationMenu(null);
    if (action === "pin") {
      setRecentItems((items) => [item, ...items.filter((current) => current !== item)]);
      setToast(`${item} pinned.`);
    } else if (action === "project") {
      setToast(`${item} added to project.`);
    } else if (action === "unread") {
      setToast(`${item} marked as unread.`);
    } else if (action === "rename") {
      const nextName = window.prompt("Rename conversation", item)?.trim();
      if (nextName && nextName !== item) setRecentItems((items) => items.map((current) => current === item ? nextName : current));
    } else if (action === "share") {
      await navigator.clipboard?.writeText(window.location.href);
      setToast("Conversation link copied.");
    } else if (action === "delete") {
      setRecentItems((items) => items.filter((current) => current !== item));
      setToast(`${item} deleted.`);
    }
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div
      onClick={(event) => {
        if (openConversationMenu && !(event.target as HTMLElement).closest("[data-conversation-menu]")) {
          setOpenConversationMenu(null);
        }
        if (accountMenuOpen && !(event.target as HTMLElement).closest("[data-account-menu]")) {
          setAccountMenuOpen(false);
        }
      }}
      className={`aichat-page flex min-h-screen w-full overflow-hidden bg-[#101010] font-roboto text-white ${isLight ? "aichat-light" : ""}`}
    >
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex ${sidebarCollapsed ? "w-[60px]" : "w-[284px]"} shrink-0 flex-col bg-[#101010] p-3 transition-[width,transform] duration-300 lg:inset-y-auto lg:static lg:h-screen lg:translate-x-0`}>
        <div className={`flex items-center rounded-xl px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/aichat" aria-label="Crystal AI Chat" className={`flex items-center gap-3 text-lg font-semibold tracking-tight text-white ${sidebarCollapsed ? "mx-auto" : ""}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3b82f6] shadow-lg shadow-blue-500/20"><img src="/Logopng.png" alt="" className="h-5 w-5 object-contain brightness-0 invert" /></span>
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
                  className={`flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left text-[12px] transition-colors ${selectedModel === model ? "bg-[#1c1c1c] text-white" : "text-zinc-500 hover:rounded-[6px] hover:bg-[#181818] hover:text-zinc-200"}`}
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

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto scrollbar-hide">
            <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Recent</div>
            <div className="space-y-0.5">
              {recentItems.filter((item) => item.toLowerCase().includes(search.toLowerCase())).map((item) => <div key={item} className="group relative">
                <button onClick={() => { setInput(item); setSidebarOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-zinc-200"><Sparkles size={14} className="shrink-0 text-zinc-600" /><span className="min-w-0 flex-1 truncate">{item}</span><span role="button" tabIndex={0} aria-label={`Options for ${item}`} onClick={(event) => { event.stopPropagation(); setOpenConversationMenu(openConversationMenu === item ? null : item); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpenConversationMenu(openConversationMenu === item ? null : item); } }} className="shrink-0 rounded-md p-1 text-zinc-500 opacity-0 transition hover:bg-[#363636] group-hover:opacity-100"><MoreHorizontal size={14} /></span></button>
                {openConversationMenu === item && <ConversationMenu onAction={(action) => void handleConversationAction(action, item)} />}
              </div>)}
            </div>
            <div className="mt-5 space-y-1.5 border-t border-[#242424] pt-4">
              {conversations.filter((item) => item.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map((conversation, index) => <button key={conversation} onClick={() => setSidebarOpen(false)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition hover:bg-[#1c1c1c] ${index === 0 ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}><span className="truncate">{conversation}</span><MoreHorizontal size={14} className="shrink-0 opacity-0 transition group-hover:opacity-100" /></button>)}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d99e72] text-[11px] font-bold text-[#27211c]">AL</span>
            <Link href="/account" className="min-w-0 flex-1"><span className="block truncate text-xs text-zinc-200">Crystal User</span><span className="block truncate text-[10px] text-zinc-600">you@alternusart.com</span></Link>
            <div data-account-menu className="relative">
              <button aria-label="Account menu" title="Account menu" onClick={() => setAccountMenuOpen((value) => !value)} className="rounded-lg p-1 text-zinc-600 transition hover:bg-[#2a2a2a] hover:text-white"><MoreHorizontal size={16} /></button>
              {accountMenuOpen && <AccountMenu onAction={(action) => {
                setAccountMenuOpen(false);
                if (action === "profile") window.location.href = "/account";
                else if (action === "logout") window.location.href = "/login";
                else setToast(`${action} selected.`);
                window.setTimeout(() => setToast(null), 1800);
              }} />}
            </div>
          </div>
          <Link href="/pricing" className="mt-3 flex h-[46px] w-[236px] shrink-0 items-center justify-center rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white transition hover:bg-[#242424]">Upgrade Now</Link>
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

      <main className="relative m-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[#1a1a1a]">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="rounded-xl p-2 text-zinc-400 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><Menu size={20} /></button>
          <div className="mx-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] p-1 shadow-lg">
              <button onClick={() => setMode("chat")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "chat" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><Sparkles size={14} /> Chat</button>
              <button onClick={() => setMode("workflow")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "workflow" ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}><GitBranch size={14} /> Workflow</button>
            </div>
            <Link href="/aicode" aria-label="Open AI Code" title="AI Code" className="hidden h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition hover:bg-[#2a2a2a] hover:text-[#6ca5ff] md:flex"><Code2 size={15} strokeWidth={2.2} /></Link>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button type="button" onClick={toggleTheme} aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"} title={isLight ? "Dark mode" : "Light mode"} className="grid h-8 w-8 place-items-center rounded-lg border border-[#2a2a2a] text-zinc-400 transition hover:bg-[#2a2a2a] hover:text-white">
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <Link href="/crystal" className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs text-zinc-400 transition hover:border-blue-500/50 hover:text-white">Go to Studio</Link>
          </div>
        </header>
        <nav className="aichat-section-scroll absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex" aria-label="Chat sections">
          {chatSections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              aria-label={`Go to ${section.label}`}
              onClick={() => scrollToSection(section.id)}
              className={`group relative h-[6px] w-4 rounded-full transition-all ${index === 0 ? "bg-zinc-200" : "bg-zinc-600 hover:bg-zinc-300"}`}
            >
              <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#3a3a3a] px-4 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {section.label}
              </span>
            </button>
          ))}
        </nav>

        <section ref={(element) => { sectionRefs.current.header = element; }} className="flex flex-1 flex-col overflow-y-auto scrollbar-hide px-4 pb-36 sm:px-8">
          {messages.length === 0 ? (
            <div ref={(element) => { sectionRefs.current.header = element; }} className="m-auto text-center">
              <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] text-[#3b82f6]"><Sparkles size={21} /></div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-200 sm:text-3xl">Good Morning, Toby</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-200 sm:text-3xl">How Can I <span className="text-[#3b82f6]">Assist You Today?</span></h1>
              {mode === "workflow" && <p className="mt-4 text-sm text-zinc-500">Build a repeatable creative workflow with Crystal.</p>}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  ref={(element) => { sectionRefs.current[`message-${message.id}`] = element; }}
                  className={`scroll-mt-6 group flex ${message.role === "user" ? "justify-end" : "justify-center"}`}
                >
                  <div className={message.role === "user" ? "max-w-[85%] rounded-2xl bg-[#1c1c1c] px-4 py-3 text-sm leading-7 text-zinc-100" : "w-full max-w-2xl px-4 py-3 text-left text-sm leading-7 text-zinc-300"}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && <div className="mt-3 flex justify-start gap-1 opacity-60 transition group-hover:opacity-100"><button onClick={() => void copyMessage(message)} aria-label="Copy response" className="rounded-[6px] p-1.5 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}</button><button aria-label="Share response" className="rounded-[6px] p-1.5 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]"><Share2 size={14} /></button><Link href="/crystal" className="ml-1 rounded-[6px] px-2 py-1 text-[11px] text-[#3b82f6] transition hover:bg-blue-500/10">Go to Crystal</Link></div>}
                  </div>
                </div>
              ))}
              {isSending && <div className="flex"><div className="flex items-center gap-1 rounded-2xl border border-[#2a2a2a] bg-[#171717] px-4 py-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.3s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" /></div></div>}
            </div>
          )}
        </section>

        <form onSubmit={sendMessage} className={`absolute bottom-6 left-1/2 flex w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 items-end gap-2 rounded-2xl border border-[#333] bg-[#282828] p-2 shadow-2xl transition focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 ${hasPastedInput ? "h-[240px]" : "h-12"}`}>
          <button type="button" aria-label="Attach file" onClick={() => { setToast("File attachments are available in chat."); window.setTimeout(() => setToast(null), 1800); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3c3c3c] text-zinc-300 transition hover:bg-[#484848] hover:text-white active:scale-95"><Paperclip size={20} /></button>
          <textarea ref={textareaRef} value={input} onChange={(event) => { setInput(event.target.value); if (!event.target.value) setHasPastedInput(false); }} onPaste={(event) => { if (event.clipboardData.getData("text")) setHasPastedInput(true); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} placeholder="Ask Crystal anything..." className={`min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600 ${hasPastedInput ? "max-h-[208px] overflow-y-auto" : "max-h-40 overflow-y-hidden"}`} />
          <button type="button" aria-label="Use microphone" className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3c3c3c] text-zinc-300 transition hover:bg-[#484848] hover:text-white active:scale-95"><Mic size={20} /></button>
          <button type="submit" aria-label="Send message" disabled={!input.trim() || isSending} className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-[#2563eb] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={20} /></button>
        </form>
      </main>
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-[#2a2a2a] bg-[#242424] px-4 py-2 text-xs text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function ConversationMenu({ onAction }: { onAction: (action: string) => void }) {
  const items = [
    { action: "pin", label: "Pin", icon: Target },
    { action: "project", label: "Add to project", icon: FolderPlus, arrow: true },
    { action: "unread", label: "Mark as unread", icon: EyeOff },
    { action: "rename", label: "Rename", icon: Pencil },
    { action: "share", label: "Share", icon: Share2, arrow: true },
    { action: "delete", label: "Delete", icon: Trash2, danger: true },
  ];
  return <div data-conversation-menu role="menu" onClick={(event) => event.stopPropagation()} className="absolute right-0 top-10 z-[80] flex h-[218px] w-[195px] flex-col items-center justify-between overflow-hidden rounded-[16px] border-0 bg-[#242424] p-[6px] shadow-2xl">
    {items.map(({ action, label, icon: Icon, arrow, danger }) => <button key={action} role="menuitem" onClick={() => onAction(action)} className={`flex h-8 min-h-8 w-[182px] shrink-0 items-center gap-3 rounded-[12px] px-3 text-left text-sm font-medium transition hover:bg-[#363636] ${danger ? "text-[#FF6B6B]" : "text-zinc-100"}`}><Icon size={20} strokeWidth={2} /><span className="flex-1">{label}</span>{arrow && <span className="text-lg leading-none">›</span>}</button>)}
  </div>;
}

function AccountMenu({ onAction }: { onAction: (action: string) => void }) {
  const items = [
    { action: "profile", label: "Profile", icon: UserRound },
    { action: "settings", label: "Settings", icon: Settings2 },
    { action: "upgrade", label: "Upgrade plan", icon: Sparkles },
    { action: "apps", label: "Get apps and extensions", icon: LogOut },
    { action: "help", label: "Get help", icon: CircleHelp, arrow: true },
    { action: "learn", label: "Learn more", icon: Info },
    { action: "logout", label: "Log out", icon: LogOut },
  ];
  return <div role="menu" onClick={(event) => event.stopPropagation()} className="absolute bottom-11 right-0 z-[90] flex h-[327px] w-[248px] flex-col items-center justify-start overflow-hidden rounded-[12px] bg-[#242424] p-[9px] shadow-2xl">
    <div className="flex h-[58px] w-[229px] shrink-0 items-center gap-3 rounded-[12px] px-3 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#363636] text-zinc-100"><UserRound size={22} strokeWidth={1.8} /></span>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-white">Lam</div><div className="text-xs text-zinc-400">Free Plan</div></div>
      <span className="text-2xl leading-none text-zinc-300">›</span>
    </div>
    <div className="h-px w-[229px] bg-[#383838]" />
    {items.map(({ action, label, icon: Icon, arrow }) => <button key={action} role="menuitem" onClick={() => onAction(action)} className="flex h-9 min-h-9 w-[229px] shrink-0 items-center gap-3 rounded-[9px] px-3 text-left text-xs text-zinc-100 transition-colors hover:rounded-[9px] hover:bg-[#363636]"><Icon size={18} strokeWidth={1.8} /><span className="flex-1">{label}</span>{arrow && <span className="text-lg leading-none">›</span>}</button>)}
  </div>;
}
