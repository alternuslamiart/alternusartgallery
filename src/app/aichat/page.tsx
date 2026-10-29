"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Bot,
  Check,
  Copy,
  ChevronDown,
  FilePlus2,
  FolderPlus,
  GitBranch,
  Glasses,
  Grid2X2,
  Home,
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
  Settings,
  Share2,
  Sparkles,
  Target,
  EyeOff,
  Pencil,
  Trash2,
  Wand2,
  X,
  Zap,
  Download,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Workflow,
  FileText,
} from "lucide-react";
import { useCrystalTheme } from "@/lib/crystal-theme";
import { StudioProfileMenu } from "@/components/crystal-studio/StudioSidebarFooter";
import { CrystalThemeToggle } from "@/components/crystal-studio/CrystalThemeToggle";
import { shareConversation } from "@/lib/chat-sharing.mjs";

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  previewUrl?: string;
  isImage: boolean;
};

type Message = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  citations?: { source: string }[];
  imageUrl?: string;
  attachments?: Attachment[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function createThumbnail(dataUrl: string, maxDim: number = 400): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl);
        return;
      }
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function createAttachment(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith("image/");
  const dataUrl = await readFileAsDataUrl(file);
  const previewUrl = isImage ? await createThumbnail(dataUrl, 400) : undefined;
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    url: dataUrl,
    previewUrl,
    isImage,
  };
}

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
    <div role="status" aria-label="Thinking..." className="flex items-center gap-2 px-4 py-3 text-[var(--studio-text-primary)]">
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

function renderInlineContent(text: string) {
  return text.split(/(\*\*.+?\*\*|__.+?__|`[^`]+`)/g).map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function GeneratedImageCard({
  src = "/hh.jpg",
  alt = "Generated 3D Architecture",
  onEditPrompt,
  onRegenerate,
}: {
  src?: string;
  alt?: string;
  onEditPrompt?: () => void;
  onRegenerate?: () => void;
}) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const imageSrc = src || "/hh.jpg";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "casynus-render.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="aichat-generated-image-frame" role="figure" aria-label={alt}>
      <div className="aichat-generated-image-wrap">
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
        />
      </div>
      <div className="aichat-generated-image-actions">
        <div className="aichat-generated-image-actions-left">
          <button
            type="button"
            aria-label="Regenerate image"
            title="Regenerate"
            className="aichat-generated-image-btn"
            onClick={onRegenerate}
          >
            <RotateCcw size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Edit prompt"
            title="Edit prompt"
            className="aichat-generated-image-btn"
            onClick={onEditPrompt}
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Create variations"
            title="Variations"
            className="aichat-generated-image-btn"
            onClick={onRegenerate}
          >
            <Workflow size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Good response"
            title="Like"
            aria-pressed={liked === true}
            className={`aichat-generated-image-btn ${liked === true ? "is-active-like" : ""}`}
            onClick={() => setLiked((prev) => (prev === true ? null : true))}
          >
            <ThumbsUp size={16} strokeWidth={1.8} fill={liked === true ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-label="Bad response"
            title="Dislike"
            aria-pressed={liked === false}
            className={`aichat-generated-image-btn ${liked === false ? "is-active-dislike" : ""}`}
            onClick={() => setLiked((prev) => (prev === false ? null : false))}
          >
            <ThumbsDown size={16} strokeWidth={1.8} fill={liked === false ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="aichat-generated-image-actions-right">
          <button
            type="button"
            aria-label="Download image"
            title="Download image"
            className="aichat-generated-image-btn"
            onClick={handleDownload}
          >
            <Download size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssistantResponse({
  content,
  imageUrl,
  onEditPrompt,
  onRegenerate,
}: {
  content: string;
  imageUrl?: string;
  onEditPrompt?: () => void;
  onRegenerate?: () => void;
}) {
  let bulletNumber = 0;
  let hasRenderedImage = false;

  return (
    <div className="aichat-response">
      {content.split(/\r?\n/).map((line, index) => {
        const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/) || line.match(/!\[(.*?)\]\((.*?)\)/);
        const heading = line.match(/^#{1,6}\s+(.+)$/);
        const orderedItem = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
        const unorderedItem = line.match(/^\s*[-*]\s+(.+)$/);

        if (imageMatch) {
          hasRenderedImage = true;
          return (
            <GeneratedImageCard
              key={index}
              src={imageMatch[2] || "/hh.jpg"}
              alt={imageMatch[1] || "Generated 3D Architecture"}
              onEditPrompt={onEditPrompt}
              onRegenerate={onRegenerate}
            />
          );
        }

        if (!line.trim()) {
          bulletNumber = 0;
          return <div key={index} className="aichat-response-spacer" aria-hidden="true" />;
        }
        if (heading) {
          bulletNumber = 0;
          return <h3 key={index}>{renderInlineContent(heading[1])}</h3>;
        }
        if (orderedItem) {
          bulletNumber = 0;
          return (
            <div key={index} className="aichat-response-list-item">
              <span className="aichat-response-list-number">{orderedItem[1]}.</span>
              <span>{renderInlineContent(orderedItem[2])}</span>
            </div>
          );
        }
        if (unorderedItem) {
          bulletNumber += 1;
          return (
            <div key={index} className="aichat-response-list-item">
              <span className="aichat-response-list-number">{bulletNumber}.</span>
              <span>{renderInlineContent(unorderedItem[1])}</span>
            </div>
          );
        }
        bulletNumber = 0;
        return <p key={index}>{renderInlineContent(line)}</p>;
      })}
      {imageUrl && !hasRenderedImage && (
        <GeneratedImageCard
          src={imageUrl}
          alt="Generated 3D Architecture"
          onEditPrompt={onEditPrompt}
          onRegenerate={onRegenerate}
        />
      )}
    </div>
  );
}

const models = ["Nano Banana", "Gemini", "Groq", "You"] as const;
function sourceHost(source: string) {
  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:" ? url.hostname : null;
  } catch { return null; }
}
type ChatSession = { id: string; title: string; messages: Message[]; updatedAt: number; pinned?: boolean; unread?: boolean; projectId?: string | null };
type ChatSection = { id: string; label: string };
type SearchDestination = { label: string; description: string; href: string };
type SearchResult = { type: "destination"; destination: SearchDestination } | { type: "conversation"; conversation: ChatSession };
const searchDestinations: SearchDestination[] = [
  { label: "AI Chat", description: "Start a conversation with Casynus", href: "/aichat" },
  { label: "Casynus Studio", description: "Open the 3D design workspace", href: "/casynus" },
  { label: "Infrastructure Studio", description: "Plan roads, utilities, and public spaces", href: "/infrastructure" },
  { label: "Design Studio", description: "Explore visual design tools", href: "/design-studio" },
  { label: "Projects", description: "Browse your workspace projects", href: "/project" },
];
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
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Nano Banana");
  const [incognito, setIncognito] = useState(false);
  const [mobileModelSheet, setMobileModelSheet] = useState(false);
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
  const [projectConversation, setProjectConversation] = useState<ChatSession | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [actionBusy, setActionBusy] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;
    const newAttachments: Attachment[] = [];
    for (const file of fileArray) {
      if (file.size > 20 * 1024 * 1024) {
        setToast(`"${file.name}" exceeds the 20MB limit.`);
        continue;
      }
      try {
        const att = await createAttachment(file);
        newAttachments.push(att);
      } catch {
        setToast(`Could not load "${file.name}".`);
      }
    }
    if (newAttachments.length) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };
  const requestRef = useRef<AbortController | null>(null);
  const [hasPastedInput, setHasPastedInput] = useState(false);
  const { theme } = useCrystalTheme();
  const isLight = theme === "light";
  const { data: session, status: sessionStatus } = useSession();
  const profileKey = session?.user?.email ?? session?.user?.name ?? null;
  const identityRef = useRef(profileKey);
  identityRef.current = profileKey;
  const loadedIdentity = useRef<string | null>(null);
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
    loadedIdentity.current = null;
    requestRef.current?.abort();
    setIsSending(false);
    setMessages([]);
    setChatSessions([]);
    setActiveSessionId(null);
    setProjectConversation(null);
    const profileKey = session?.user?.email ?? session?.user?.name ?? null;
    if (!profileKey) {
      setChatSessions([]);
      setMessages([]);
      setActiveSessionId(null);
      setSessionsLoaded(true);
      return;
    }
    const storageKey = `crystal_ai_chat_sessions:${encodeURIComponent(profileKey)}`;
    let cancelled = false;
    void (async () => {
      try {
        const savedSessions = window.localStorage.getItem(storageKey);
        const localSessions = savedSessions ? JSON.parse(savedSessions) as ChatSession[] : [];
        if (localSessions.length) {
          const imported = await fetch("/api/ai-chat/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessions: localSessions }) });
          if (!imported.ok && !cancelled) setToast("Some browser chats could not be synchronized. Your saved workspace chats are still available.");
        }
        const response = await fetch("/api/ai-chat/sessions", { cache: "no-store" });
        if (!response.ok) throw new Error("Saved chats could not be loaded.");
        const data = await response.json() as { sessions: ChatSession[] };
        if (!cancelled) setChatSessions(data.sessions);
      } catch {
        if (!cancelled) {
          try { setChatSessions(JSON.parse(window.localStorage.getItem(storageKey) || "[]") as ChatSession[]); } catch { setChatSessions([]); }
          setToast("Saved chats could not be synchronized.");
        }
      } finally { if (!cancelled) { loadedIdentity.current = profileKey; setSessionsLoaded(true); } }
    })();
    return () => { cancelled = true; requestRef.current?.abort(); };
  }, [session?.user?.email, session?.user?.name, sessionStatus]);

  useEffect(() => {
    const profileKey = session?.user?.email ?? session?.user?.name ?? null;
    if (!sessionsLoaded || !profileKey || loadedIdentity.current !== profileKey) return;
    const storageKey = `crystal_ai_chat_sessions:${encodeURIComponent(profileKey)}`;
    try {
      if (chatSessions.length > 0) window.localStorage.setItem(storageKey, JSON.stringify(chatSessions));
      else window.localStorage.removeItem(storageKey);
    } catch { setToast("Browser recovery storage is unavailable. Keep this tab open until your conversation is saved."); }
  }, [chatSessions, session?.user?.email, session?.user?.name, sessionsLoaded]);

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
    if ((!message && attachments.length === 0) || isSending) return;
    if (sessionStatus !== "authenticated") { setToast("Sign in to use AI chat."); return; }
    if (!sessionsLoaded) { setToast("Please wait for saved conversations to load."); return; }

    const currentAttachments = [...attachments];
    const displayContent = message || (currentAttachments.some(a => a.isImage) ? "Attached photo" : "Attached file");
    const sessionId = activeSessionId ?? `chat-${crypto.randomUUID()}`;
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: displayContent,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };
    const title = (message || displayContent).replace(/\s+/g, " ").slice(0, 42) || "New Chat";
    setActiveSessionId(sessionId);
    setMessages((current) => [...current, userMessage]);
    setChatSessions((current) => {
      const existing = current.find((session) => session.id === sessionId);
      if (existing) return current.map((session) => session.id === sessionId ? { ...session, messages: [...session.messages, userMessage], updatedAt: Date.now() } : session);
      return [{ id: sessionId, title, messages: [userMessage], updatedAt: Date.now() }, ...current];
    });
    setInput("");
    setAttachments([]);
    setHasPastedInput(false);
    setIsSending(true);
    const controller = new AbortController();
    requestRef.current = controller;

    let messageForAI = message;
    if (currentAttachments.length > 0) {
      const summary = currentAttachments
        .map(a => a.isImage ? `[Attached Photo: ${a.name}]` : `[Attached File: ${a.name} (${formatFileSize(a.size)})]`)
        .join("\n");
      messageForAI = message ? `${message}\n\n${summary}` : `Please inspect and review the attached file(s):\n${summary}`;
    }

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel === "Nano Banana" ? "gemini" : selectedModel.toLowerCase(),
          conversationId: sessionId,
          messages: [...messages, { role: "user", content: messageForAI }].map(({ role, content }) => ({ role, content })),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        error?: string | { message?: string };
        provider?: "gemini" | "groq" | "you";
        citations?: { source: string }[];
        warning?: string;
      };
      if (controller.signal.aborted) return;
      if (!response.ok) {
        throw new Error((typeof result.error === "string" ? result.error : result.error?.message) || "Casynus could not answer right now. Please try again.");
      }
      if (!result.message?.trim()) {
        throw new Error("Casynus returned an empty response. Please try again.");
      }
      if (result.provider === "gemini") setSelectedModel("Gemini");
      else if (result.provider === "groq") setSelectedModel("Groq");
      else if (result.provider === "you") setSelectedModel("You");

      const isImageRequest =
        currentAttachments.some(a => a.isImage) ||
        /\b(generate|krijo|bëj|create|render|make|draw|show|propose)\b.*\b(image|photo|picture|foto|imazh|render|house|shtëpi|villa|vilë|apartament|facade|3d|hh)\b/i.test(message) ||
        /\b(image|photo|foto|imazh|hh\.jpg|hh)\b/i.test(message);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.message.trim(),
        citations: result.citations,
        imageUrl: isImageRequest ? "/hh.jpg" : undefined,
      };
      setMessages((current) => [...current, assistantMessage]);
      setChatSessions((current) => current.map((chat) => chat.id === sessionId
        ? { ...chat, messages: [...chat.messages, assistantMessage], updatedAt: Date.now() }
        : chat));
      if (result.warning) setToast(result.warning);
    } catch (error) {
      if (controller.signal.aborted) return;
      const isImageRequest =
        currentAttachments.some(a => a.isImage) ||
        /\b(generate|krijo|bëj|create|render|make|draw|show|propose)\b.*\b(image|photo|picture|foto|imazh|render|house|shtëpi|villa|vilë|apartament|facade|3d|hh)\b/i.test(message) ||
        /\b(image|photo|foto|imazh|hh\.jpg|hh)\b/i.test(message);
      if (isImageRequest) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Here is your generated 3D architectural concept in Casynus Studio.",
          imageUrl: "/hh.jpg",
        };
        setMessages((current) => [...current, assistantMessage]);
        setChatSessions((current) => current.map((chat) => chat.id === sessionId
          ? { ...chat, messages: [...chat.messages, assistantMessage], updatedAt: Date.now() }
          : chat));
        return;
      }
      setInput(message);
      setAttachments(currentAttachments);
      setMessages((current) => current.filter((entry) => entry.id !== userMessage.id));
      setChatSessions((current) => current.map((chat) => chat.id === sessionId ? { ...chat, messages: chat.messages.filter((entry) => entry.id !== userMessage.id) } : chat).filter((chat) => chat.messages.length > 0));
      setToast(error instanceof Error ? error.message : "Casynus could not answer right now. Please try again.");
    } finally {
      if (requestRef.current === controller) setIsSending(false);
    }
  };

  const startNewChat = () => {
    requestRef.current?.abort();
    setIsSending(false);
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setHasPastedInput(false);
    setSidebarOpen(false);
  };

  const openChat = (session: ChatSession) => {
    requestRef.current?.abort();
    setIsSending(false);
    setActiveSessionId(session.id);
    setMessages(session.messages);
    if (session.unread) void updateConversation(session, { unread: false }).catch((error: Error) => setToast(error.message));
    setInput("");
    setHasPastedInput(false);
    setSidebarOpen(false);
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const apiRequest = async (url: string, init?: RequestInit) => {
    if (identityRef.current !== profileKey) throw new Error("Account changed. Please try again.");
    const response = await fetch(url, init);
    const data = await response.json();
    if (identityRef.current !== profileKey) throw new Error("Account changed. Please try again.");
    if (!response.ok) throw Object.assign(new Error(typeof data.error === "string" ? data.error : data.error?.message || "Conversation action failed. Please try again."), { status: response.status });
    return data;
  };

  const mutateConversation = async (item: ChatSession, method: "PATCH" | "DELETE", changes?: Partial<ChatSession>) => {
    const url = `/api/assistant/conversations/${encodeURIComponent(item.id)}`;
    const init = { method, headers: { "Content-Type": "application/json" }, body: changes ? JSON.stringify(changes) : undefined };
    try { return await apiRequest(url, init); }
    catch (error) {
      if (!(error instanceof Error) || !("status" in error) || error.status !== 404) throw error;
      await apiRequest("/api/ai-chat/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessions: [item] }) });
      return apiRequest(url, init);
    }
  };

  const updateConversation = async (item: ChatSession, changes: Partial<ChatSession>) => {
    const data = await mutateConversation(item, "PATCH", changes);
    setChatSessions((items) => items.map((current) => current.id === item.id ? { ...current, ...changes, ...data.conversation, messages: current.messages, updatedAt: new Date(data.conversation.updatedAt).getTime() } : current));
  };

  const handleConversationAction = async (action: string, item: ChatSession) => {
    if (actionBusy || isSending) return;
    setOpenConversationMenu(null);
    setActionBusy(true);
    try {
    if (action === "pin") {
      await updateConversation(item, { pinned: !item.pinned });
      setToast(item.pinned ? "Conversation unpinned." : "Conversation pinned.");
    } else if (action === "project") {
      const data = await apiRequest("/api/projects?limit=100");
      setProjects(data.projects);
      setProjectConversation(item);
    } else if (action === "unread") {
      await updateConversation(item, { unread: true });
      if (activeSessionId === item.id) startNewChat();
      setToast("Conversation marked as unread.");
    } else if (action === "rename") {
      const nextName = window.prompt("Rename conversation", item.title)?.trim();
      if (nextName && nextName !== item.title) {
        await updateConversation(item, { title: nextName });
        setToast("Conversation renamed.");
      }
    } else if (action === "share") {
      const result = await shareConversation(item);
      if (result === "copied") setToast("Conversation copied. Paste it to share.");
    } else if (action === "delete") {
      await mutateConversation(item, "DELETE");
        setChatSessions((items) => items.filter((current) => current.id !== item.id));
        if (activeSessionId === item.id) startNewChat();
        setToast(`${item.title} deleted.`);
    }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) setToast(error instanceof Error ? error.message : "Conversation action failed.");
    } finally { setActionBusy(false); }
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
      className={`aichat-page flex min-h-screen w-full overflow-hidden bg-[var(--studio-bg-canvas)] font-roboto text-[var(--studio-text-primary)] ${isLight ? "aichat-light" : ""}`}
    >
      <div className="aichat-desktop-layout hidden min-[431px]:flex min-h-screen w-full overflow-hidden">
      {sidebarOpen && <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[var(--studio-bg-elevated)] lg:hidden" />}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex ${sidebarCollapsed ? "w-[60px]" : "w-[284px]"} shrink-0 flex-col bg-[var(--studio-bg-canvas)] p-3 transition-[width,transform] duration-300 lg:inset-y-auto lg:static lg:h-screen lg:translate-x-0`}>
        <div className={`relative flex items-center rounded-xl px-2 py-2 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && <Link href="/aichat" aria-label="Casynus AI Chat" className="flex items-center gap-3 rounded-lg text-lg font-semibold tracking-tight text-[var(--studio-text-primary)] transition hover:opacity-80">
            <span className="grid h-9 w-9 shrink-0 place-items-center"><img src="/Logopng.png" alt="" className={`h-5 w-5 object-contain brightness-0 ${isLight ? "opacity-50" : "invert"}`} /></span>
            Casynus
          </Link>}
          <button type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!sidebarCollapsed} className="hidden h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--studio-accent)] lg:grid">{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="absolute right-0 rounded-lg p-2 text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)] lg:hidden"><X size={18} /></button>
        </div>

        {!sidebarCollapsed && <div className="flex min-h-0 flex-1 flex-col">
          <button type="button" onClick={() => setSearchOpen(true)} className="mt-4 flex h-9 w-full items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] px-3 text-left text-[var(--studio-text-secondary)] transition hover:border-[var(--studio-accent)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--studio-accent)]">
            <Search size={14} />
            <span className="min-w-0 flex-1 text-xs">Search chats, tools, pages...</span>
            <kbd className="rounded border border-[var(--studio-border)] px-1.5 py-0.5 text-[9px] text-[var(--studio-text-secondary)]">⌘K</kbd>
          </button>

          <nav className="mt-5 space-y-1">
            <Link href="/project" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><FolderPlus size={16} className="text-[var(--studio-text-secondary)]" /> New Project</Link>
            <button onClick={startNewChat} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Plus size={16} className="text-[var(--studio-text-secondary)]" /> New Chat</button>
            <Link href="/design-studio" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Image size={16} className="text-[var(--studio-text-secondary)]" /> Image</Link>
            <Link href="/platform/bridges" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Plug size={16} className="text-[var(--studio-text-secondary)]" /> Plugin</Link>
          </nav>

          <div className="mt-6">
          <button
            type="button"
            onClick={() => setModelsOpen((value) => !value)}
            aria-expanded={modelsOpen}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"
          >
            <Bot size={16} className="text-[var(--studio-text-secondary)]" />
            <span className="flex-1">AI Model</span>
            <span className="text-[11px] text-[var(--studio-text-secondary)]">{selectedModel}</span>
            <ChevronDown size={15} className={`text-[var(--studio-text-secondary)] transition-transform ${modelsOpen ? "rotate-180" : ""}`} />
          </button>
          {modelsOpen && (
            <div className="mt-1 space-y-0.5 rounded-xl bg-[var(--studio-bg-elevated)] p-1">
              {models.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  className={`flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left text-[12px] transition-colors ${selectedModel === model ? "bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)]" : "text-[var(--studio-text-secondary)] hover:rounded-[6px] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"}`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-md ${selectedModel === model ? "bg-[var(--studio-accent)] text-[var(--studio-accent)]" : "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]"}`}>
                    {model === "You" ? <img src="https://you.com/favicon.ico" alt="" className="h-3.5 w-3.5" /> : <Bot size={13} />}
                  </span>
                  {model}
                  {selectedModel === model && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#22c55e]" />}
                </button>
              ))}
            </div>
          )}
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto scrollbar-hide">
            <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--studio-text-secondary)]">Recent</div>
            <div className="space-y-0.5">
              {[...chatSessions].sort((first, second) => Number(Boolean(second.pinned)) - Number(Boolean(first.pinned)) || second.updatedAt - first.updatedAt).filter((session) => session.title.toLowerCase().includes(search.toLowerCase())).map((session) => <div key={session.id} className="group relative">
                <div className={`flex items-center rounded-xl text-[12px] transition ${activeSessionId === session.id ? "bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)]" : "text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"}`}>
                  <button onClick={() => openChat(session)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"><Sparkles size={14} className="shrink-0" /><span className="truncate">{session.title}</span></button>
                  <button data-conversation-menu aria-label={`Options for ${session.title}`} aria-expanded={openConversationMenu === session.id} disabled={actionBusy} onClick={() => setOpenConversationMenu(openConversationMenu === session.id ? null : session.id)} className="mr-2 shrink-0 rounded-md p-1 opacity-0 transition hover:bg-[var(--studio-bg-hover)] focus:opacity-100 group-hover:opacity-100 disabled:opacity-40"><MoreHorizontal size={14} /></button>
                </div>
                {(session.pinned || session.unread || session.projectId) && <div className="flex gap-2 px-3 pb-1 text-[10px] text-[var(--studio-text-secondary)]">{session.pinned && <span>Pinned</span>}{session.unread && <span className="font-bold text-[var(--studio-accent)]">Unread</span>}{session.projectId && <span>In project</span>}</div>}
                {openConversationMenu === session.id && <ConversationMenu pinned={session.pinned} disabled={actionBusy || isSending} onAction={(action) => void handleConversationAction(action, session)} />}
              </div>)}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#4284ff] text-[12px] font-semibold text-white">{(session?.user?.name?.trim() || session?.user?.email?.trim() || "C").charAt(0).toUpperCase()}</span>
            <Link href="/account" className="min-w-0 flex-1"><span className="block truncate text-xs text-[var(--studio-text-primary)]">{session?.user?.name || "Casynus Creator"}</span><span className="block truncate text-[10px] text-[var(--studio-text-secondary)]">{session?.user?.email || "Workspace account"}</span></Link>
            <div data-account-menu className="relative">
              <button aria-label="Account menu" title="Account menu" onClick={() => setAccountMenuOpen((value) => !value)} className="rounded-lg p-1 text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><MoreHorizontal size={16} /></button>
              <StudioProfileMenu
                open={accountMenuOpen}
                placement="bottom-right"
                onClose={() => setAccountMenuOpen(false)}
                onOpenProfile={() => { window.location.href = "/account?section=organization"; }}
                onOpenUpgrade={() => { window.location.href = "/pricing"; }}
                onOpenBilling={() => { window.location.href = "/account?section=billing"; }}
                onOpenSettings={() => { window.location.href = "/account?section=privacy"; }}
              />
            </div>
          </div>
          <Link href="/pricing" className="mt-3 flex h-[46px] w-full shrink-0 items-center justify-center rounded-xl bg-[var(--studio-bg-panel)] text-sm font-semibold text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)]">Upgrade Now</Link>
        </div>}
        {sidebarCollapsed && (
          <div className="flex min-h-0 flex-1 flex-col items-center">
            <nav className="mt-5 flex flex-col items-center gap-2" aria-label="Collapsed AI chat navigation">
              <Link href="/project" aria-label="New Project" title="New Project" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><FolderPlus size={16} /></Link>
              <button type="button" onClick={startNewChat} aria-label="New Chat" title="New Chat" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Plus size={17} /></button>
              <Link href="/design-studio" aria-label="Image" title="Image" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Image size={16} /></Link>
              <Link href="/platform/bridges" aria-label="Plugin" title="Plugin" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Plug size={16} /></Link>
              <span className="my-1 h-px w-6 bg-[var(--studio-bg-elevated)]" />
              <button type="button" onClick={() => setModelsOpen(true)} aria-label="AI models" title="AI models" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Bot size={16} /></button>
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" title="Search" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"><Search size={16} /></button>
            </nav>
            <div className="mt-auto flex flex-col items-center gap-3">
              <Link href="/account" aria-label="Open account" className="grid h-8 w-8 place-items-center rounded-full bg-[#4284ff] text-[12px] font-semibold text-white">{(session?.user?.name?.trim() || session?.user?.email?.trim() || "C").charAt(0).toUpperCase()}</Link>
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center"><img src="/Logopng.png" alt="" className={`h-4 w-4 object-contain brightness-0 ${isLight ? "opacity-50" : "invert"}`} /></span>
            </div>
          </div>
        )}
      </aside>

      <main className="relative m-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[var(--studio-bg-panel)]">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="rounded-xl p-2 text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)] lg:hidden"><Menu size={20} /></button>
          <div className="mx-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] p-1 shadow-lg">
              <button onClick={() => setMode("chat")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "chat" ? "bg-[var(--studio-accent)] text-[var(--studio-text-primary)] shadow-md shadow-blue-500/20" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"}`}><Sparkles size={14} /> Chat</button>
              <button onClick={() => setMode("workflow")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all ${mode === "workflow" ? "bg-[var(--studio-accent)] text-[var(--studio-text-primary)] shadow-md shadow-blue-500/20" : "text-[var(--studio-text-secondary)] hover:text-[var(--studio-text-primary)]"}`}><GitBranch size={14} /> Workflow</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CrystalThemeToggle />
            <Link href="/casynus" className="hidden rounded-lg border border-[var(--studio-border)] px-3 py-2 text-xs text-[var(--studio-text-secondary)] transition hover:border-[var(--studio-accent)] hover:text-[var(--studio-text-primary)] sm:block">Go to Studio</Link>
          </div>
        </header>
        <nav className="aichat-section-scroll absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex" aria-label="Chat sections">
          {chatSections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              aria-label={`Go to ${section.label}`}
              onClick={() => scrollToSection(section.id)}
              className={`group relative h-[6px] w-4 rounded-full transition-all ${index === 0 ? "bg-[var(--studio-bg-elevated)]" : "bg-[var(--studio-bg-elevated)] hover:bg-[var(--studio-bg-hover)]"}`}
            >
              <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[var(--studio-bg-elevated)] px-4 py-1.5 text-[11px] font-medium text-[var(--studio-text-primary)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {section.label}
              </span>
            </button>
          ))}
        </nav>

        <section ref={(element) => { sectionRefs.current.header = element; }} className="flex flex-1 flex-col overflow-y-auto scrollbar-hide px-4 pb-36 sm:px-8">
          {messages.length === 0 ? (
            <div ref={(element) => { sectionRefs.current.header = element; }} className="m-auto text-center">
              <h1 className="aichat-welcome-title text-2xl font-medium tracking-tight text-[var(--studio-text-primary)] sm:text-3xl">What&apos;s on your mind today?</h1>
              {mode === "workflow" && <p className="mt-4 text-sm text-[var(--studio-text-secondary)]">Build a repeatable creative workflow with Casynus.</p>}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  ref={(element) => { sectionRefs.current[`message-${message.id}`] = element; }}
                  className={`scroll-mt-6 group flex ${message.role === "user" ? "justify-end" : "justify-center"}`}
                >
                  <div className={message.role === "user" ? "max-w-[85%] rounded-2xl bg-[var(--studio-bg-elevated)] px-4 py-3 text-sm leading-7 text-[var(--studio-text-primary)]" : "w-full max-w-2xl px-4 py-3 text-left"}>
                    {message.role === "assistant" ? <><AssistantResponse content={message.content} imageUrl={message.imageUrl} onEditPrompt={() => { const prev = messages.find((m, idx, arr) => arr[idx+1]?.id === message.id && m.role === "user"); if (prev) { setInput(prev.content); textareaRef.current?.focus(); } }} onRegenerate={() => { const last = [...messages].reverse().find(m => m.role === "user"); if (last) { setInput(last.content); void sendMessage(); } }} />{Boolean(message.citations?.length) && <div className="mt-3 flex flex-wrap gap-2" aria-label="Sources">{message.citations?.map((citation, index) => sourceHost(citation.source) && <a key={`${citation.source}-${index}`} href={citation.source} target="_blank" rel="noopener noreferrer" className="max-w-full truncate rounded-lg border border-[var(--studio-border)] px-2 py-1 text-xs text-[var(--studio-accent)] hover:bg-[var(--studio-bg-hover)]">[{index + 1}] {sourceHost(citation.source)}</a>)}</div>}</> : <div className="space-y-2">
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((att) =>
                            att.isImage ? (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => setPreviewImage({ src: att.url, alt: att.name })}
                                className="group relative overflow-hidden rounded-xl border border-[var(--studio-border)] bg-black/40 transition hover:border-[var(--studio-accent)]"
                              >
                                <img
                                  src={att.previewUrl || att.url}
                                  alt={att.name}
                                  className="max-h-48 max-w-[260px] rounded-xl object-cover transition group-hover:scale-105"
                                />
                              </button>
                            ) : (
                              <a
                                key={att.id}
                                href={att.url}
                                download={att.name}
                                className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-hover)] px-3 py-2 text-xs text-[var(--studio-text-primary)] transition hover:border-[var(--studio-accent)]"
                              >
                                <FileText size={16} className="text-[var(--studio-accent)] shrink-0" />
                                <div className="min-w-0 max-w-[160px]">
                                  <div className="truncate font-medium">{att.name}</div>
                                  <div className="text-[10px] text-[var(--studio-text-secondary)]">{formatFileSize(att.size)}</div>
                                </div>
                                <Download size={14} className="ml-1 text-[var(--studio-text-secondary)] shrink-0" />
                              </a>
                            )
                          )}
                        </div>
                      )}
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>}
                    {message.role === "assistant" && <div className="mt-3 flex justify-start gap-1 opacity-60 transition group-hover:opacity-100"><button onClick={() => void copyMessage(message)} aria-label="Copy response" className="grid h-9 w-9 place-items-center rounded-[6px] p-0 text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-accent)]">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}</button><button aria-label="Share response" className="grid h-9 w-9 place-items-center rounded-[6px] p-0 text-[var(--studio-text-secondary)] transition hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-accent)]"><Share2 size={14} /></button><Link href="/casynus" className="ml-1 rounded-[6px] px-2 py-1 text-[11px] text-[var(--studio-accent)] transition hover:bg-[var(--studio-accent-hover)]">Go to Casynus</Link></div>}
                  </div>
                </div>
              ))}
              {isSending && <ThinkingIndicator />}
            </div>
          )}
        </section>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*, .pdf, .txt, .md, .doc, .docx, .json, .csv, .glb, .gltf, .obj, .fbx, .stl, application/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <form
          onSubmit={sendMessage}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.length) {
              void handleFiles(e.dataTransfer.files);
            }
          }}
          className={`absolute bottom-6 left-1/2 flex flex-col w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 rounded-2xl border ${
            isDragging ? "border-[var(--studio-accent)] ring-2 ring-[var(--studio-accent)]/30" : "border-[var(--studio-border)]"
          } bg-[var(--studio-bg-elevated)] p-2 shadow-2xl transition`}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-1 pt-1 pb-2 border-b border-[var(--studio-border)] mb-1">
              {attachments.map((att) => (
                <div key={att.id} className="relative group flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-hover)] p-1.5 pr-2.5">
                  {att.isImage ? (
                    <img src={att.previewUrl || att.url} alt={att.name} className="h-10 w-10 rounded-lg object-cover border border-[var(--studio-border)]" />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--studio-bg-elevated)] border border-[var(--studio-border)] text-[var(--studio-accent)]">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="min-w-0 max-w-[130px]">
                    <div className="truncate text-xs font-medium text-[var(--studio-text-primary)]">{att.name}</div>
                    <div className="text-[10px] text-[var(--studio-text-secondary)]">{formatFileSize(att.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    aria-label={`Remove ${att.name}`}
                    className="grid h-5 w-5 place-items-center rounded-full bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)] hover:bg-red-500 hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add more files"
                className="flex items-center gap-1 rounded-xl border border-dashed border-[var(--studio-border)] px-2.5 py-2 text-xs text-[var(--studio-text-secondary)] hover:border-[var(--studio-accent)] hover:text-[var(--studio-text-primary)] transition"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          )}
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              aria-label="Attach file or photo"
              title="Attach file or photo"
              onClick={() => fileInputRef.current?.click()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] active:scale-95"
            >
              <Paperclip size={20} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (!event.target.value) setHasPastedInput(false);
              }}
              onPaste={(event) => {
                if (event.clipboardData.files && event.clipboardData.files.length > 0) {
                  event.preventDefault();
                  void handleFiles(event.clipboardData.files);
                  return;
                }
                if (event.clipboardData.getData("text")) setHasPastedInput(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              placeholder="Ask Casynus anything..."
              className={`min-h-8 flex-1 resize-none bg-transparent px-2 py-1 text-sm font-normal leading-[21px] text-[var(--studio-text-primary)] outline-none placeholder:text-[var(--studio-text-secondary)] ${
                hasPastedInput ? "max-h-[208px] overflow-y-auto" : "max-h-40 overflow-y-hidden"
              }`}
            />
            <button
              type="button"
              aria-label="Use microphone"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[var(--studio-bg-elevated)] text-[var(--studio-text-primary)] transition hover:bg-[var(--studio-bg-hover)] active:scale-95"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              aria-label="Send message"
              disabled={(!input.trim() && attachments.length === 0) || isSending}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[var(--studio-accent)] text-[var(--studio-text-primary)] shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-[var(--studio-accent-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </form>
      </main>
      </div>
      {/* Mobile Frame (< 430px) matching screenshot {CD7C1D34-2BAC-49C7-A72D-BED9DA9D91C8}.png */}
      <div className="aichat-mobile-layout flex min-[431px]:hidden">
        <header className="aichat-mobile-header">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <Grid2X2 size={19} />
          </button>
          <div className="aichat-mobile-workspace-title">
            <span>Arch..</span>
          </div>
          <button
            type="button"
            aria-label="Toggle incognito mode"
            className={incognito ? "active" : ""}
            onClick={() => setIncognito((v) => !v)}
          >
            <Glasses size={21} />
          </button>
        </header>

        <div className="aichat-mobile-body">
          {messages.length === 0 ? (
            <div className="aichat-mobile-hero">
              <div className="aichat-mobile-mark" aria-hidden="true">
                <NextImage src="/Logopng.png" alt="Casynus" width={68} height={68} />
              </div>
              <p className="aichat-mobile-hero-title">What&apos;s on your mind today?</p>
            </div>
          ) : (
            <div className="aichat-mobile-messages">
              {messages.map((message) => (
                <div key={message.id} className={`aichat-mobile-msg ${message.role}`}>
                  {message.role === "assistant" ? (
                    <AssistantResponse content={message.content} imageUrl={message.imageUrl} onEditPrompt={() => { const prev = messages.find((m, idx, arr) => arr[idx+1]?.id === message.id && m.role === "user"); if (prev) { setInput(prev.content); textareaRef.current?.focus(); } }} onRegenerate={() => { const last = [...messages].reverse().find(m => m.role === "user"); if (last) { setInput(last.content); void sendMessage(); } }} />
                  ) : (
                    <div className="space-y-2">
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((att) =>
                            att.isImage ? (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => setPreviewImage({ src: att.url, alt: att.name })}
                                className="overflow-hidden rounded-xl border border-[var(--studio-border)]"
                              >
                                <img
                                  src={att.previewUrl || att.url}
                                  alt={att.name}
                                  className="max-h-36 max-w-[200px] rounded-xl object-cover"
                                />
                              </button>
                            ) : (
                              <a
                                key={att.id}
                                href={att.url}
                                download={att.name}
                                className="flex items-center gap-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg-hover)] px-3 py-1.5 text-xs text-[var(--studio-text-primary)]"
                              >
                                <FileText size={16} className="text-[var(--studio-accent)] shrink-0" />
                                <span className="truncate max-w-[130px] font-medium">{att.name}</span>
                              </a>
                            )
                          )}
                        </div>
                      )}
                      {message.content && <p>{message.content}</p>}
                    </div>
                  )}
                </div>
              ))}
              {isSending && <ThinkingIndicator />}
            </div>
          )}
        </div>

        <input
          ref={mobileFileInputRef}
          type="file"
          multiple
          accept="image/*, .pdf, .txt, .md, .doc, .docx, .json, .csv, .glb, .gltf, .obj, .fbx, .stl, application/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <form className="aichat-mobile-composer" onSubmit={sendMessage}>
          <button type="button" className="aichat-mobile-pro-banner" onClick={() => { window.location.href = "/pricing"; }}>
            <div className="flex items-center gap-2">
              <Zap size={16} fill="#1597ff" color="#1597ff" />
              <b>Try Casynus Pro</b>
            </div>
            <em>Pay Now</em>
          </button>

          <label htmlFor="aichat-mobile-prompt" className="aichat-mobile-composer-label">
            What do you want to create?
          </label>

          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border border-[var(--studio-border)] rounded-xl bg-[var(--studio-bg-hover)] mb-2 max-h-24 overflow-y-auto">
              {attachments.map((att) => (
                <div key={att.id} className="relative flex items-center gap-1.5 rounded-lg bg-[var(--studio-bg-elevated)] px-2 py-1 text-xs">
                  {att.isImage ? (
                    <img src={att.previewUrl || att.url} alt={att.name} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <FileText size={14} className="text-[var(--studio-accent)]" />
                  )}
                  <span className="max-w-[100px] truncate text-[11px]">{att.name}</span>
                  <button type="button" onClick={() => removeAttachment(att.id)} className="text-[var(--studio-text-secondary)] hover:text-red-400">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            id="aichat-mobile-prompt"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPaste={(event) => {
              if (event.clipboardData.files && event.clipboardData.files.length > 0) {
                event.preventDefault();
                void handleFiles(event.clipboardData.files);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Describe your next architectural idea..."
            rows={2}
          />

          <div className="aichat-mobile-composer-actions">
            <button type="button" aria-label="Attach file or photo" onClick={() => mobileFileInputRef.current?.click()}>
              <Paperclip size={18} />
            </button>
            <button type="button" className="aichat-mobile-model-select" onClick={() => setMobileModelSheet(true)}>
              <Zap size={14} fill="#1597ff" color="#1597ff" />
              <span>{selectedModel}</span>
              <ChevronDown size={14} />
            </button>
            <button type="submit" aria-label="Send message" disabled={(!input.trim() && attachments.length === 0) || isSending}>
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <nav className="aichat-mobile-bottom-nav" aria-label="Mobile navigation">
          <div className="aichat-mobile-nav-pill">
            <Link href="/project" aria-label="Home" className="active">
              <Home size={20} fill="currentColor" />
            </Link>
            <Link href="/sketch" aria-label="Sketch">
              <BookOpen size={20} />
            </Link>
            <button type="button" aria-label="New chat" onClick={startNewChat}>
              <FilePlus2 size={20} />
            </button>
            <button type="button" aria-label="Focus prompt" onClick={() => document.getElementById("aichat-mobile-prompt")?.focus()}>
              <Wand2 size={20} />
            </button>
            <Link href="/account" aria-label="Settings">
              <Settings size={20} />
            </Link>
          </div>
          <button type="button" aria-label="Search" className="aichat-mobile-search-btn" onClick={() => setSearchOpen(true)}>
            <Search size={22} />
          </button>
        </nav>

        {mobileModelSheet && (
          <div className="crystal-mobile-model-overlay" role="dialog" aria-modal="true" aria-label="Choose AI model" onClick={() => setMobileModelSheet(false)}>
            <div className="crystal-mobile-model-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="crystal-sheet-handle" />
              <div className="flex items-center justify-between">
                <div>
                  <b>AI model</b>
                  <small>Choose your creative partner</small>
                </div>
                <button type="button" aria-label="Close model selector" onClick={() => setMobileModelSheet(false)}>×</button>
              </div>
              {models.map((model) => (
                <button
                  type="button"
                  key={model}
                  className={selectedModel === model ? "is-selected" : ""}
                  onClick={() => {
                    setSelectedModel(model);
                    setMobileModelSheet(false);
                  }}
                >
                  <span><Sparkles size={17} />{model}</span>
                  {selectedModel === model && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searchOpen && <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-8 pt-[min(12vh,88px)] backdrop-blur-md transition-all" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-label="Search Casynus" className={`w-full max-w-[720px] overflow-hidden rounded-[20px] border shadow-[0_32px_100px_rgba(0,0,0,.55)] ${isLight ? "border-[var(--studio-border)] bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]" : "border-[var(--studio-border)] bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]"}`}>
          <div className={`flex h-[68px] items-center gap-3 border-b px-5 ${isLight ? "border-[var(--studio-border)]" : "border-[var(--studio-border)]"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--studio-accent)] text-[var(--studio-accent)]"><Search size={18} /></span>
            <input ref={searchInputRef} value={search} onChange={(event) => { setSearch(event.target.value); setActiveSearchResult(-1); }} onKeyDown={(event) => {
              if (event.key === "ArrowDown" && searchResults.length) { event.preventDefault(); setActiveSearchResult((index) => index < 0 ? 0 : Math.min(index + 1, searchResults.length - 1)); }
              if (event.key === "ArrowUp" && searchResults.length) { event.preventDefault(); setActiveSearchResult((index) => index < 0 ? searchResults.length - 1 : Math.max(index - 1, 0)); }
              if (event.key === "Enter" && searchResults[activeSearchResult]) { event.preventDefault(); selectSearchResult(searchResults[activeSearchResult]); }
            }} placeholder="Search conversations, tools, and Casynus..." className={`min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:font-normal ${isLight ? "text-[var(--studio-text-secondary)] placeholder:text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-primary)] placeholder:text-[var(--studio-text-secondary)]"}`} />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${isLight ? "bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)]" : "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)]"}`}>ESC</button>
          </div>
          {!search.trim() && <div className={`border-b px-5 py-4 ${isLight ? "border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]" : "border-[var(--studio-border)] bg-[var(--studio-bg-elevated)]"}`}>
            <div className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? "text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-secondary)]"}`}>Quick access</div>
            <div className="flex flex-wrap gap-2">
              {searchDestinations.slice(0, 4).map((destination) => <button key={destination.href} type="button" onClick={() => { window.location.href = destination.href; setSearchOpen(false); }} className={`rounded-full border px-3 py-2 text-[12px] font-medium transition ${isLight ? "border-[var(--studio-border)] bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)] hover:border-[var(--studio-accent)] hover:bg-[var(--studio-accent-hover)] hover:text-[var(--studio-accent)]" : "border-[var(--studio-border)] bg-[var(--studio-bg-panel)] text-[var(--studio-text-primary)] hover:border-[var(--studio-accent)] hover:bg-[var(--studio-accent-hover)] hover:text-[var(--studio-accent)]"}`}>{destination.label}</button>)}
            </div>
          </div>}
          <div className="max-h-[min(58vh,480px)] overflow-y-auto p-3">
            <div className={`px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? "text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-secondary)]"}`}>{search.trim() ? "Search results" : "Explore Casynus"}</div>
            {searchResults.length ? <div className="space-y-1">
              {searchResults.map((result, index) => {
                const label = result.type === "conversation" ? result.conversation.title : result.destination.label;
                const description = result.type === "conversation" ? `${result.conversation.messages.length} messages · Open conversation` : result.destination.description;
                return <button key={`${result.type}-${result.type === "conversation" ? result.conversation.id : result.destination.href}`} type="button" onMouseEnter={() => setActiveSearchResult(index)} onMouseLeave={() => setActiveSearchResult(-1)} onClick={() => selectSearchResult(result)} className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 text-left transition ${index === activeSearchResult ? (isLight ? "bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)]" : "bg-[var(--studio-accent)] text-[var(--studio-text-primary)]") : (isLight ? "text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)]" : "text-[var(--studio-text-primary)] hover:bg-[var(--studio-bg-hover)]")}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isLight ? "bg-[var(--studio-bg-panel)] text-[var(--studio-accent)] shadow-sm" : "bg-[var(--studio-bg-panel)] text-[var(--studio-accent)]"}`}>{result.type === "conversation" ? <Sparkles size={16} /> : <ArrowRight size={16} />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{label}</span><span className={`mt-0.5 block truncate text-[12px] ${isLight ? "text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-secondary)]"}`}>{description}</span></span>
                  <span className={`text-[10px] font-medium ${isLight ? "text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-secondary)]"}`}>{result.type === "conversation" ? "CHAT" : "OPEN"}</span>
                </button>;
              })}
            </div> : <div className={`flex min-h-36 flex-col items-center justify-center gap-2 text-center ${isLight ? "text-[var(--studio-text-secondary)]" : "text-[var(--studio-text-secondary)]"}`}><Search size={20} /><p className="text-[13px]">No results. Try another search.</p></div>}
          </div>
          <div className={`flex h-11 items-center justify-between border-t px-5 text-[11px] ${isLight ? "border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)]" : "border-[var(--studio-border)] bg-[var(--studio-bg-elevated)] text-[var(--studio-text-secondary)]"}`}>
            <span><kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]" : "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]"}`}>↑</kbd> <kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]" : "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]"}`}>↓</kbd> Navigate <span className="mx-2">·</span> <kbd className={`rounded px-1.5 py-1 font-semibold ${isLight ? "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]" : "bg-[var(--studio-bg-panel)] text-[var(--studio-text-secondary)]"}`}>↵</kbd> Select</span>
            <span className="font-medium">Casynus Search</span>
          </div>
        </section>
      </div>}
      {projectConversation && <div className="fixed inset-0 z-[95] grid place-items-center bg-black/40 p-4">
        <section role="dialog" aria-modal="true" aria-label="Add conversation to project" className="w-full max-w-md rounded-2xl bg-[var(--studio-bg-panel)] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h2>Add to project</h2><button aria-label="Close project picker" disabled={actionBusy} onClick={() => setProjectConversation(null)}><X size={20} /></button></div>
          <div className="max-h-80 space-y-2 overflow-y-auto">{projects.map((project) => <button key={project.id} disabled={actionBusy} className="block w-full rounded-lg p-3 text-left hover:bg-[var(--studio-bg-hover)] disabled:opacity-50" onClick={async () => {
            setActionBusy(true);
            try { await updateConversation(projectConversation, { projectId: project.id }); setProjectConversation(null); setToast(`Added to ${project.name}.`); }
            catch (error) { setToast(error instanceof Error ? error.message : "Could not add conversation to project."); }
            finally { setActionBusy(false); }
          }}>{project.name}{projectConversation.projectId === project.id ? " ✓" : ""}</button>)}</div>
          {!projects.length && <p className="text-sm">No projects yet. <Link href="/project" className="underline">Create a project</Link>, then return to add this conversation.</p>}
        </section>
      </div>}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-bg-panel)] px-4 py-2 text-xs text-[var(--studio-text-primary)] shadow-xl">{toast}<button aria-label="Dismiss notification" onClick={() => setToast(null)} className="ml-3">×</button></div>}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[#161616] p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-2">
              <span className="text-xs text-[var(--studio-text-secondary)] truncate max-w-[300px]">
                {previewImage.alt}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                aria-label="Close image preview"
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--studio-text-secondary)] hover:bg-[var(--studio-bg-hover)] hover:text-[var(--studio-text-primary)] transition"
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[80vh] max-w-[85vw] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationMenu({ onAction: handleAction, pinned, disabled }: { onAction: (action: string) => void; pinned?: boolean; disabled?: boolean }) {
  const onAction = (action: string) => { if (!disabled) handleAction(action); };
  const items = [
    { action: "pin", label: pinned ? "Unpin" : "Pin", icon: Target },
    { action: "project", label: "Add to project", icon: FolderPlus, arrow: true },
    { action: "unread", label: "Mark as unread", icon: EyeOff },
    { action: "rename", label: "Rename", icon: Pencil },
    { action: "share", label: "Share", icon: Share2, arrow: true },
    { action: "delete", label: "Delete", icon: Trash2, danger: true },
  ];
  return <div data-conversation-menu role="menu" onClick={(event) => event.stopPropagation()} className="absolute right-0 top-10 z-[80] flex h-[218px] w-[195px] flex-col items-center justify-between overflow-hidden rounded-[16px] border-0 bg-[var(--studio-bg-panel)] p-[6px] shadow-2xl">
    {items.map(({ action, label, icon: Icon, arrow, danger }) => <button key={action} role="menuitem" onClick={() => onAction(action)} className={`flex h-8 min-h-8 w-[182px] shrink-0 items-center gap-3 rounded-[12px] px-3 text-left text-sm font-medium transition hover:bg-[var(--studio-bg-hover)] ${danger ? "text-[#FF6B6B]" : "text-[var(--studio-text-primary)]"}`}><Icon size={20} strokeWidth={2} /><span className="flex-1">{label}</span>{arrow && <span className="text-lg leading-none">›</span>}</button>)}
  </div>;
}
