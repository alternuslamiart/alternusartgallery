"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
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

const thinkingDots = [
  { cx: 12, cy: 3.2, color: "#47B3FF" },
  { cx: 6.7, cy: 7.1, color: "#0182DF" },
  { cx: 17.3, cy: 7.1, color: "#0085E3" },
  { cx: 3.2, cy: 12, color: "#0672BF" },
  { cx: 12, cy: 12, color: "#0166AF" },
  { cx: 20.8, cy: 12, color: "#0A6EB5" },
  { cx: 6.7, cy: 16.9, color: "#054E83" },
  { cx: 17.3, cy: 16.9, color: "#024D83" },
  { cx: 12, cy: 20.8, color: "#012F50" },
];

function ThinkingIndicator() {
  return (
    <div role="status" aria-label="Thinking..." className="flex items-center gap-2 px-4 py-3 text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0">
        {thinkingDots.map((dot, index) => (
          <circle
            key={dot.color}
            cx={dot.cx}
            cy={dot.cy}
            r="2.4"
            fill={dot.color}
            className="animate-pulse"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </svg>
      <span className="font-medium text-[12px] leading-4" style={{ fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif" }}>
        Thinking...
      </span>
    </div>
  );
}

const models = ["Claude", "ChatGPT", "Gemini", "Grok", "Groq", "Copilot"];
type ChatSession = { id: string; title: string; messages: Message[]; updatedAt: number };
type ChatSection = { id: string; label: string };
type SearchDestination = { label: string; description: string; href: string };
type SearchResult = { type: "destination"; destination: SearchDestination } | { type: "conversation"; conversation: ChatSession };
const searchDestinations: SearchDestination[] = [
  { label: "AI Chat", description: "Start a conversation with Crystal", href: "/aichat" },
  { label: "Crystal Studio", description: "Open the 3D design workspace", href: "/crystal" },
  { label: "Infrastructure Studio", description: "Plan roads, utilities, and public spaces", href: "/infrastructure" },
  { label: "Architecture plans", description: "Create and organize floor plans", href: "/archplan" },
  { label: "Design Studio", description: "Explore visual design tools", href: "/design-studio" },
  { label: "AI Code", description: "Build with the AI code workspace", href: "/aicode" },
  { label: "Projects", description: "Browse your workspace projects", href: "/project" },
];
const TEST_RESPONSE = `A Vision of Architecture, Technology, and Human Experience

Design and generate a breathtaking futuristic architectural complex called The Crystal Horizon, a monumental structure that combines modern minimalism, organic architecture, advanced engineering, and sustainable technology. The building should feel like a landmark from a distant future, yet remain believable, functional, and suitable for real-world architectural visualization.

The project is located on a vast elevated landscape overlooking a calm ocean. The site is surrounded by natural cliffs, green hills, tall grasses, reflective water surfaces, and carefully designed gardens. The architecture should create a strong connection between the building and its environment, making it appear as though it has grown naturally from the landscape rather than being placed upon it.

The main structure consists of a large central tower surrounded by several interconnected architectural wings. The central tower rises approximately 180 meters above the ground and has a sculptural, elegant silhouette. Its form is inspired by the geometry of a crystal, the curvature of flowing water, and the structure of a futuristic spacecraft. The tower is not a simple rectangular skyscraper. Instead, it has a gently twisting vertical shape, with several faceted surfaces that reflect sunlight throughout the day.

The exterior facade is composed of transparent and semi-transparent glass panels, brushed titanium, polished aluminum, and large sections of white architectural concrete. The materials should have realistic physical properties, including accurate reflections, subtle roughness, natural imperfections, and physically based shading. The glass should reflect the sky, the ocean, and the surrounding landscape while remaining partially transparent in selected areas.

The main entrance is located at the front of the complex and is accessed through a wide ceremonial plaza. A long pedestrian bridge extends from the landscape toward the entrance, crossing a shallow reflective pool. The bridge has a minimalist design with a floating appearance. Its structure is made of dark metal and translucent glass, with discreet integrated lighting along its edges.

At the end of the bridge, visitors arrive at a monumental entrance formed by two enormous curved architectural walls. These walls rise approximately 25 meters and create a dramatic gateway into the main building. Between them is a large glass entrance with automatic sliding doors. Above the entrance, a sculptural canopy extends outward like a crystalline wing, protecting visitors from rain and sunlight.

The entrance plaza should include carefully arranged trees, geometric planters, elegant benches, water channels, and subtle landscape lighting. The ground is paved with large slabs of light gray natural stone, arranged in a precise geometric pattern. Some sections of the pavement should contain thin lines of illuminated glass, creating a delicate futuristic effect after sunset.`;

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchResult, setActiveSearchResult] = useState(-1);
  const [mode, setMode] = useState<"chat" | "workflow">("chat");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [openConversationMenu, setOpenConversationMenu] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasPastedInput, setHasPastedInput] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const chatSections = useMemo<ChatSection[]>(() => [
    { id: "header", label: "Header" },
    ...messages.map((message, index) => ({
      id: `message-${message.id}`,
      label: message.role === "assistant" ? getGeneratedSection(message.content, index) : "Prompt",
    })),
  ], [messages]);
  const searchResults = useMemo<SearchResult[]>(() => {
    const query = search.trim().toLowerCase();
    const destinations = searchDestinations
      .filter((destination) => !query || `${destination.label} ${destination.description}`.toLowerCase().includes(query))
      .map((destination): SearchResult => ({ type: "destination", destination }));
    const conversations = [...chatSessions]
      .sort((first, second) => second.updatedAt - first.updatedAt)
      .filter((conversation) => !query || `${conversation.title} ${conversation.messages.map((message) => message.content).join(" ")}`.toLowerCase().includes(query))
      .slice(0, 8)
      .map((conversation): SearchResult => ({ type: "conversation", conversation }));
    return [...destinations, ...conversations];
  }, [chatSessions, search]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    setSessionsLoaded(false);
    setIsLight(window.localStorage.getItem("Coreforge_auth_theme") === "light");
    const profileKey = session?.user?.email ?? session?.user?.name ?? null;
    if (!profileKey) {
      setChatSessions([]);
      setSessionsLoaded(true);
      return;
    }
    const storageKey = `crystal_ai_chat_sessions:${encodeURIComponent(profileKey)}`;
    try {
      const savedSessions = window.localStorage.getItem(storageKey);
      if (savedSessions) setChatSessions(JSON.parse(savedSessions) as ChatSession[]);
      else setChatSessions([]);
    } catch {
      setToast("Saved chats could not be loaded.");
    } finally {
      setSessionsLoaded(true);
    }
  }, [session?.user?.email, session?.user?.name, sessionStatus]);

  useEffect(() => {
    const profileKey = session?.user?.email ?? session?.user?.name ?? null;
    if (!sessionsLoaded || !profileKey) return;
    const storageKey = `crystal_ai_chat_sessions:${encodeURIComponent(profileKey)}`;
    if (chatSessions.length > 0) window.localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    else window.localStorage.removeItem(storageKey);
  }, [chatSessions, session?.user?.email, session?.user?.name, sessionsLoaded]);

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

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    setActiveSearchResult(-1);
  }, [searchOpen]);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, [searchOpen]);

  const selectSearchResult = (result: SearchResult) => {
    if (result.type === "conversation") {
      openChat(result.conversation);
    } else {
      window.location.href = result.destination.href;
    }
    setSearchOpen(false);
  };

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const sessionId = activeSessionId ?? `chat-${Date.now()}`;
    const userMessage: Message = { id: Date.now(), role: "user", content: message };
    const title = message.replace(/\s+/g, " ").slice(0, 42) || "New Chat";
    setActiveSessionId(sessionId);
    setMessages((current) => [...current, userMessage]);
    setChatSessions((current) => {
      const existing = current.find((session) => session.id === sessionId);
      if (existing) return current.map((session) => session.id === sessionId ? { ...session, messages: [...session.messages, userMessage], updatedAt: Date.now() } : session);
      return [{ id: sessionId, title, messages: [userMessage], updatedAt: Date.now() }, ...current];
    });
    setInput("");
    setHasPastedInput(false);
    setIsSending(true);

    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const assistantMessage: Message = { id: Date.now() + 1, role: "assistant", content: TEST_RESPONSE };
    setMessages((current) => [...current, assistantMessage]);
    setChatSessions((current) => current.map((session) => session.id === sessionId ? { ...session, messages: [...session.messages, assistantMessage], updatedAt: Date.now() } : session));
    setIsSending(false);
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setHasPastedInput(false);
    setSidebarOpen(false);
  };

  const openChat = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setHasPastedInput(false);
    setSidebarOpen(false);
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const handleConversationAction = async (action: string, item: ChatSession) => {
    setOpenConversationMenu(null);
    if (action === "pin") {
      setChatSessions((items) => [item, ...items.filter((current) => current.id !== item.id)]);
      setToast(`${item.title} pinned.`);
    } else if (action === "project") {
      setToast(`${item.title} added to project.`);
    } else if (action === "unread") {
      setToast(`${item.title} marked as unread.`);
    } else if (action === "rename") {
      const nextName = window.prompt("Rename conversation", item.title)?.trim();
      if (nextName && nextName !== item.title) setChatSessions((items) => items.map((current) => current.id === item.id ? { ...current, title: nextName } : current));
    } else if (action === "share") {
      await navigator.clipboard?.writeText(window.location.href);
      setToast("Conversation link copied.");
    } else if (action === "delete") {
      setChatSessions((items) => items.filter((current) => current.id !== item.id));
      if (activeSessionId === item.id) startNewChat();
      setToast(`${item.title} deleted.`);
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
        <div className={`relative flex items-center rounded-xl px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && <Link href="/aichat" aria-label="Crystal AI Chat" className="flex items-center gap-3 rounded-lg text-lg font-semibold tracking-tight text-white transition hover:opacity-80">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#3b82f6] shadow-lg shadow-blue-500/20"><img src="/Logopng.png" alt="" className="h-5 w-5 object-contain brightness-0 invert" /></span>
            Crystal
          </Link>}
          <button type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!sidebarCollapsed} className="hidden h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 lg:grid">{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="absolute right-0 rounded-lg p-2 text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white lg:hidden"><X size={18} /></button>
        </div>

        {!sidebarCollapsed && <div className="flex min-h-0 flex-1 flex-col">
          <button type="button" onClick={() => setSearchOpen(true)} className="mt-4 flex h-9 w-full items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-3 text-left text-zinc-500 transition hover:border-blue-500/40 hover:bg-[#191c22] hover:text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
            <Search size={14} />
            <span className="min-w-0 flex-1 text-xs">Search chats, tools, pages...</span>
            <kbd className="rounded border border-[#2a2a2a] px-1.5 py-0.5 text-[9px] text-zinc-600">⌘K</kbd>
          </button>

          <nav className="mt-5 space-y-1">
            <Link href="/archplan" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><FolderPlus size={16} className="text-zinc-500" /> New Project</Link>
            <button onClick={startNewChat} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-300 transition hover:bg-[#1c1c1c] hover:text-white"><Plus size={16} className="text-zinc-500" /> New Chat</button>
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
              {[...chatSessions].sort((first, second) => second.updatedAt - first.updatedAt).filter((session) => session.title.toLowerCase().includes(search.toLowerCase())).map((session) => <div key={session.id} className="group relative">
                <button onClick={() => openChat(session)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] transition ${activeSessionId === session.id ? "bg-[#1c1c1c] text-white" : "text-zinc-500 hover:bg-[#1c1c1c] hover:text-zinc-200"}`}><Sparkles size={14} className="shrink-0 text-zinc-600" /><span className="min-w-0 flex-1 truncate">{session.title}</span><span role="button" tabIndex={0} aria-label={`Options for ${session.title}`} onClick={(event) => { event.stopPropagation(); setOpenConversationMenu(openConversationMenu === session.id ? null : session.id); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpenConversationMenu(openConversationMenu === session.id ? null : session.id); } }} className="shrink-0 rounded-md p-1 text-zinc-500 opacity-0 transition hover:bg-[#363636] group-hover:opacity-100"><MoreHorizontal size={14} /></span></button>
                {openConversationMenu === session.id && <ConversationMenu onAction={(action) => void handleConversationAction(action, session)} />}
              </div>)}
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
          <Link href="/pricing" className="mt-3 flex h-[46px] w-full shrink-0 items-center justify-center rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white transition hover:bg-[#242424]">Upgrade Now</Link>
        </div>}
        {sidebarCollapsed && (
          <div className="flex min-h-0 flex-1 flex-col items-center">
            <nav className="mt-5 flex flex-col items-center gap-2" aria-label="Collapsed AI chat navigation">
              <Link href="/archplan" aria-label="New Project" title="New Project" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><FolderPlus size={16} /></Link>
              <button type="button" onClick={startNewChat} aria-label="New Chat" title="New Chat" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Plus size={17} /></button>
              <Link href="/design-studio" aria-label="Image" title="Image" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Image size={16} /></Link>
              <Link href="/platform/bridges" aria-label="Plugin" title="Plugin" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Plug size={16} /></Link>
              <span className="my-1 h-px w-6 bg-[#2a2a2a]" />
              <button type="button" onClick={() => setModelsOpen(true)} aria-label="AI models" title="AI models" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Bot size={16} /></button>
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" title="Search" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-[#1c1c1c] hover:text-white"><Search size={16} /></button>
            </nav>
            <div className="mt-auto flex flex-col items-center gap-3">
              <Link href="/account" aria-label="Open account" className="grid h-8 w-8 place-items-center rounded-full bg-[#d99e72] text-[11px] font-bold text-[#27211c]">AL</Link>
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-xl bg-[#3b82f6] shadow-lg shadow-blue-500/20"><img src="/Logopng.png" alt="" className="h-4 w-4 object-contain brightness-0 invert" /></span>
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
              <div className="mx-auto mb-5 grid place-items-center"><img src="/Logopng.png" alt="Crystal" className="h-10 w-10 object-contain" /></div>
              <p className="aichat-welcome-title text-2xl font-medium tracking-tight text-zinc-200 sm:text-3xl">Good Morning, Toby</p>
              <h1 className="aichat-welcome-subtitle mt-2 text-2xl font-medium tracking-tight text-zinc-200 sm:text-3xl">How Can I <span className="text-[#1d9bf0]">Assist You Today?</span></h1>
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
                    {message.role === "assistant" && <div className="mt-3 flex justify-start gap-1 opacity-60 transition group-hover:opacity-100"><button onClick={() => void copyMessage(message)} aria-label="Copy response" className="grid h-9 w-9 place-items-center rounded-[6px] p-0 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}</button><button aria-label="Share response" className="grid h-9 w-9 place-items-center rounded-[6px] p-0 text-zinc-500 transition hover:bg-[#242424] hover:text-[#3b82f6]"><Share2 size={14} /></button><Link href="/crystal" className="ml-1 rounded-[6px] px-2 py-1 text-[11px] text-[#3b82f6] transition hover:bg-blue-500/10">Go to Crystal</Link></div>}
                  </div>
                </div>
              ))}
              {isSending && <ThinkingIndicator />}
            </div>
          )}
        </section>

        <form onSubmit={sendMessage} className={`absolute bottom-6 left-1/2 flex w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 items-end gap-2 rounded-2xl border border-[#333] bg-[#282828] p-2 shadow-2xl transition ${hasPastedInput ? "h-[240px]" : "h-12"}`}>
          <button type="button" aria-label="Attach file" onClick={() => { setToast("File attachments are available in chat."); window.setTimeout(() => setToast(null), 1800); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3c3c3c] text-zinc-300 transition hover:bg-[#484848] hover:text-white active:scale-95"><Paperclip size={20} /></button>
          <textarea ref={textareaRef} value={input} onChange={(event) => { setInput(event.target.value); if (!event.target.value) setHasPastedInput(false); }} onPaste={(event) => { if (event.clipboardData.getData("text")) setHasPastedInput(true); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} placeholder="Ask Crystal anything..." className={`min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600 ${hasPastedInput ? "max-h-[208px] overflow-y-auto" : "max-h-40 overflow-y-hidden"}`} />
          <button type="button" aria-label="Use microphone" className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3c3c3c] text-zinc-300 transition hover:bg-[#484848] hover:text-white active:scale-95"><Mic size={20} /></button>
          <button type="submit" aria-label="Send message" disabled={!input.trim() || isSending} className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-[#2563eb] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={20} /></button>
        </form>
      </main>
      {searchOpen && <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[#05070b]/75 px-4 pb-8 pt-[min(12vh,88px)] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-label="Search Crystal" className={`w-full max-w-[720px] overflow-hidden rounded-[20px] border shadow-[0_32px_100px_rgba(0,0,0,.55)] ${isLight ? "border-[#d9e1ed] bg-white text-[#171b24]" : "border-white/[0.09] bg-[#1a1a1a] text-[#eef2f8]"}`}>
          <div className={`flex h-[68px] items-center gap-3 border-b px-5 ${isLight ? "border-[#e8edf4]" : "border-white/[0.08]"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><Search size={18} /></span>
            <input ref={searchInputRef} value={search} onChange={(event) => { setSearch(event.target.value); setActiveSearchResult(-1); }} onKeyDown={(event) => {
              if (event.key === "ArrowDown" && searchResults.length) { event.preventDefault(); setActiveSearchResult((index) => index < 0 ? 0 : Math.min(index + 1, searchResults.length - 1)); }
              if (event.key === "ArrowUp" && searchResults.length) { event.preventDefault(); setActiveSearchResult((index) => index < 0 ? searchResults.length - 1 : Math.max(index - 1, 0)); }
              if (event.key === "Enter" && searchResults[activeSearchResult]) { event.preventDefault(); selectSearchResult(searchResults[activeSearchResult]); }
            }} placeholder="Search conversations, tools, and Crystal..." className={`min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:font-normal ${isLight ? "text-[#171b24] placeholder:text-[#8a94a4]" : "text-white placeholder:text-zinc-500"}`} />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${isLight ? "bg-[#f1f4f8] text-[#6b7482] hover:bg-[#e7edf5]" : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"}`}>ESC</button>
          </div>
          {!search.trim() && <div className={`border-b px-5 py-4 ${isLight ? "border-[#e8edf4] bg-[#fafcff]" : "border-white/[0.07] bg-[#141414]"}`}>
            <div className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? "text-[#8792a2]" : "text-zinc-500"}`}>Quick access</div>
            <div className="flex flex-wrap gap-2">
              {searchDestinations.slice(0, 4).map((destination) => <button key={destination.href} type="button" onClick={() => { window.location.href = destination.href; setSearchOpen(false); }} className={`rounded-full border px-3 py-2 text-[12px] font-medium transition ${isLight ? "border-[#e1e7f0] bg-white text-[#4d5969] hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" : "border-white/[0.08] bg-white/[0.025] text-zinc-300 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-200"}`}>{destination.label}</button>)}
            </div>
          </div>}
          <div className="max-h-[min(58vh,480px)] overflow-y-auto p-3">
            <div className={`px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? "text-[#8792a2]" : "text-zinc-500"}`}>{search.trim() ? "Search results" : "Explore Crystal"}</div>
            {searchResults.length ? <div className="space-y-1">
              {searchResults.map((result, index) => {
                const label = result.type === "conversation" ? result.conversation.title : result.destination.label;
                const description = result.type === "conversation" ? `${result.conversation.messages.length} messages · Open conversation` : result.destination.description;
                return <button key={`${result.type}-${result.type === "conversation" ? result.conversation.id : result.destination.href}`} type="button" onMouseEnter={() => setActiveSearchResult(index)} onMouseLeave={() => setActiveSearchResult(-1)} onClick={() => selectSearchResult(result)} className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 text-left transition ${index === activeSearchResult ? (isLight ? "bg-[#edf4ff] text-[#14243c]" : "bg-blue-500/[0.12] text-white") : (isLight ? "text-[#293241] hover:bg-[#f4f7fb]" : "text-zinc-200 hover:bg-white/[0.045]")}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isLight ? "bg-white text-blue-600 shadow-sm" : "bg-white/[0.06] text-blue-300"}`}>{result.type === "conversation" ? <Sparkles size={16} /> : <ArrowRight size={16} />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{label}</span><span className={`mt-0.5 block truncate text-[12px] ${isLight ? "text-[#738094]" : "text-zinc-500"}`}>{description}</span></span>
                  <span className={`text-[10px] font-medium ${isLight ? "text-[#8a94a4]" : "text-zinc-600"}`}>{result.type === "conversation" ? "CHAT" : "OPEN"}</span>
                </button>;
              })}
            </div> : <div className={`flex min-h-36 flex-col items-center justify-center gap-2 text-center ${isLight ? "text-[#7d8796]" : "text-zinc-500"}`}><Search size={20} /><p className="text-[13px]">No results. Try another search.</p></div>}
          </div>
          <div className={`flex h-11 items-center justify-between border-t px-5 text-[11px] ${isLight ? "border-[#e8edf4] bg-[#fafcff] text-[#7d8796]" : "border-white/[0.07] bg-[#141414] text-zinc-500"}`}>
            <span><kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-white text-[#667184]" : "bg-white/[0.06] text-zinc-400"}`}>↑</kbd> <kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-white text-[#667184]" : "bg-white/[0.06] text-zinc-400"}`}>↓</kbd> Navigate <span className="mx-2">·</span> <kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-white text-[#667184]" : "bg-white/[0.06] text-zinc-400"}`}>↵</kbd> Select</span>
            <span className="font-medium">Crystal Search</span>
          </div>
        </section>
      </div>}
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
