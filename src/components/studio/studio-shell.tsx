"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Bot,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleSlash,
  Code2,
  Copy,
  CreditCard,
  Download,
  FileText,
  Folder,
  Ghost,
  Grid2X2,
  ImageIcon,
  Layers3,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Network,
  Paperclip,
  PanelLeft,
  PenLine,
  Play,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Upload,
  UserRound,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type AssetType,
  type DesignSystemSettings,
  type PrototypeItem,
  type PrototypeQuality,
  type PrototypeType,
  type StudioAsset,
  assetRepository,
  defaultDesignSystem,
  detectAssetType,
  formatFileSize,
  prototypeRepository,
} from "@/lib/studio-repositories";
import {
  type CodeBuilderLayer,
  type CodeBuilderPhase,
  type CodeBuilderPlan,
  generateWebsitePlanFromPrompt,
  normalizeCodeBuilderPlan,
} from "@/lib/code-builder-plan";

export type StudioRouteKey =
  | "studio-overview"
  | "Cedium-design"
  | "autocad-design"
  | "code-builder"
  | "blender-3d"
  | "asset-library"
  | "ai-assistant"
  | "prompt-lab"
  | "projects"
  | "exports"
  | "settings"
  | "help-center";

type NavItem = {
  key: StudioRouteKey;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type GeneratedRecent = {
  id: string;
  title: string;
  tool: string;
  meta: string;
  time: string;
  icon: LucideIcon;
  output: string;
};

export const studioNavigation: NavItem[] = [
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { key: "studio-overview", label: "Studio Overview", href: "/studio-overview", icon: Grid2X2 },
  { key: "Cedium-design", label: "Cedium Design", href: "/Cedium-design", icon: Monitor },
  { key: "autocad-design", label: "AutoCAD Design", href: "/autocad-design", icon: PenLine },
  { key: "code-builder", label: "Code Builder", href: "/code-builder", icon: Code2 },
  { key: "blender-3d", label: "Blender 3D", href: "/blender-3d", icon: Layers3 },
  { key: "asset-library", label: "Asset Library", href: "/asset-library", icon: ImageIcon },
  { key: "prompt-lab", label: "Prompt Lab", href: "/prompt-lab", icon: FileText, badge: "2" },
  { key: "projects", label: "Projects", href: "/projects", icon: Folder },
  { key: "exports", label: "Exports", href: "/exports", icon: Upload },
];

const bottomNavigation = [
  { key: "settings" as const, label: "Settings", href: "/settings", icon: Settings },
  { key: "help-center" as const, label: "Help Center", href: "/help-center", icon: AlertTriangle },
];

const routeByPath: Record<string, StudioRouteKey> = {
  "/main": "studio-overview",
  "/studio-overview": "studio-overview",
  "/Cedium-design": "Cedium-design",
  "/autocad-design": "autocad-design",
  "/code-builder": "code-builder",
  "/blender-3d": "blender-3d",
  "/asset-library": "asset-library",
  "/ai-assistant": "ai-assistant",
  "/prompt-lab": "prompt-lab",
  "/projects": "projects",
  "/exports": "exports",
  "/settings": "settings",
  "/help-center": "help-center",
  "/ai-assistant/tools/code": "ai-assistant",
  "/ai-assistant/tools/blender": "ai-assistant",
  "/ai-assistant/tools/autocad": "ai-assistant",
};

type StudioPageProps = {
  route?: StudioRouteKey;
  assistantTool?: AssistantToolKey;
};

type Attachment = {
  id: string;
  name: string;
  kind: "file" | "image" | "document";
};

type StudioTheme = "light" | "dark";
type AssistantToolKey = "code" | "blender" | "autocad";
type StudioModalKey =
  | "search"
  | "quick-settings"
  | "workspace-switch"
  | "workspace-create"
  | "upgrade"
  | "upload-file"
  | "upload-image"
  | "upload-document"
  | "prompt-editor"
  | "project-create"
  | "asset-upload"
  | "support";
type StudioDrawerKey = "profile" | "notifications" | "asset-preview" | "project-detail" | "help-preview";

type ToolSelectorConfig = {
  label: string;
  options: string[];
};

type ToolWorkspaceConfig = {
  key: AssistantToolKey;
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  actionLabel: string;
  quickActions: { title: string; desc: string; icon: LucideIcon }[];
  selectors: ToolSelectorConfig[];
  previewTabs?: string[];
  previewType: "code" | "blender" | "autocad";
  emptyState: string;
};

const assistantToolByPath: Record<string, AssistantToolKey> = {
  "/ai-assistant/tools/code": "code",
  "/ai-assistant/tools/blender": "blender",
  "/ai-assistant/tools/autocad": "autocad",
};

const toolWorkspaces: Record<AssistantToolKey, ToolWorkspaceConfig> = {
  code: {
    key: "code",
    href: "/ai-assistant/tools/code",
    title: "AI for Code",
    description: "Build websites, apps, and digital tools with guided AI coding support.",
    icon: Code2,
    placeholder: "Describe the app, component, bug, or feature you want to build...",
    actionLabel: "Generate",
    quickActions: [
      { title: "Create React Component", desc: "Draft a reusable UI component.", icon: Code2 },
      { title: "Build Landing Page", desc: "Plan a polished conversion page.", icon: Monitor },
      { title: "Fix Code Issue", desc: "Debug errors or broken behavior.", icon: AlertTriangle },
      { title: "Generate API Endpoint", desc: "Create route logic and payloads.", icon: Plug },
      { title: "Explain Existing Code", desc: "Understand files and patterns.", icon: FileText },
      { title: "Convert Design to Code", desc: "Translate UI into components.", icon: PenLine },
    ],
    selectors: [
      { label: "Project type", options: ["Website", "Web App", "API", "Component", "Bug Fix"] },
      { label: "Tech stack", options: ["React", "Next.js", "Vue", "Node.js", "Go", "Rust"] },
    ],
    previewTabs: ["Plan", "Code", "Preview"],
    previewType: "code",
    emptyState: "Your generated plan, code, or preview will appear here.",
  },
  blender: {
    key: "blender",
    href: "/ai-assistant/tools/blender",
    title: "Blender 3D",
    description: "Create 3D models, scenes, and visual assets from text prompts.",
    icon: Layers3,
    placeholder: "Describe the 3D object, scene, material, or animation you want to create...",
    actionLabel: "Create",
    quickActions: [
      { title: "Create 3D Model", desc: "Generate a focused object brief.", icon: Box },
      { title: "Generate Product Scene", desc: "Stage products with lighting.", icon: Grid2X2 },
      { title: "Design Character", desc: "Shape a stylized character.", icon: Sparkles },
      { title: "Create Materials", desc: "Define textures and surfaces.", icon: ImageIcon },
      { title: "Lighting Setup", desc: "Prepare mood and render lighting.", icon: Monitor },
      { title: "Export Asset", desc: "Package assets for delivery.", icon: Download },
    ],
    selectors: [
      { label: "Asset type", options: ["Object", "Scene", "Character", "Product", "Environment"] },
      { label: "Style", options: ["Realistic", "Low-poly", "Stylized", "Isometric", "Game-ready"] },
      { label: "Output format", options: ["BLEND", "FBX", "OBJ", "GLB"] },
    ],
    previewType: "blender",
    emptyState: "Your 3D preview or generated asset will appear here.",
  },
  autocad: {
    key: "autocad",
    href: "/ai-assistant/tools/autocad",
    title: "AutoCAD",
    description: "Create CAD drawings, technical layouts, and clean drafting plans with guided AI support.",
    icon: PenLine,
    placeholder: "Describe the CAD drawing, dimensions, layers, or technical plan you want to create...",
    actionLabel: "Draft",
    quickActions: [
      { title: "Create CAD Drawing", desc: "Start a clean technical drawing.", icon: PenLine },
      { title: "Floor Plan Layout", desc: "Draft rooms, walls, and dimensions.", icon: Grid2X2 },
      { title: "Layer Setup", desc: "Organize geometry and annotations.", icon: Layers3 },
      { title: "Dimension Plan", desc: "Prepare measurements and units.", icon: Monitor },
      { title: "DXF Cleanup", desc: "Review imported CAD structure.", icon: FileText },
      { title: "Export DWG/DXF", desc: "Package drawings for delivery.", icon: Upload },
    ],
    selectors: [
      { label: "Drawing type", options: ["Floor Plan", "Elevation", "Section", "Site Plan", "Detail"] },
      { label: "Units", options: ["Millimeters", "Centimeters", "Meters", "Inches", "Feet"] },
      { label: "Layer options", options: ["Standard", "Architecture", "Mechanical", "Electrical", "Custom"] },
    ],
    previewType: "autocad",
    emptyState: "Your CAD drawing preview will appear here.",
  },
};

const StudioThemeContext = createContext<{
  theme: StudioTheme;
  setTheme: (theme: StudioTheme) => void;
  toggleTheme: () => void;
} | null>(null);

const StudioActionContext = createContext<{
  openModal: (modal: StudioModalKey) => void;
  closeModal: () => void;
  openDrawer: (drawer: StudioDrawerKey) => void;
  closeDrawer: () => void;
  showToast: (message: string) => void;
  isTemporaryChat: boolean;
  temporaryChatId: number | null;
  newChatId: number | null;
  startNewChat: () => void;
  startTemporaryChat: () => void;
  endTemporaryChat: () => void;
} | null>(null);

function useStudioTheme() {
  const context = useContext(StudioThemeContext);
  if (!context) {
    throw new Error("useStudioTheme must be used inside StudioShell");
  }
  return context;
}

function useStudioActions() {
  const context = useContext(StudioActionContext);
  if (!context) {
    throw new Error("useStudioActions must be used inside StudioShell");
  }
  return context;
}

export function StudioRoutePage({ route, assistantTool }: StudioPageProps) {
  const pathname = usePathname();
  const activeTool = assistantTool ?? assistantToolByPath[pathname];
  const activeRoute = route ?? routeByPath[pathname] ?? "ai-assistant";

  return (
    <StudioShell activeRoute={activeRoute}>
      <StudioContent route={activeRoute} assistantTool={activeTool} />
    </StudioShell>
  );
}

function StudioShell({ activeRoute, children }: { activeRoute: StudioRouteKey; children: ReactNode }) {
  const router = useRouter();
  const [theme, setTheme] = useState<StudioTheme>("light");
  const dark = theme === "dark";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<StudioModalKey | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<StudioDrawerKey | null>(null);
  const [activeRecent, setActiveRecent] = useState<GeneratedRecent | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [temporaryChatId, setTemporaryChatId] = useState<number | null>(null);
  const [newChatId, setNewChatId] = useState<number | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sidebarNotificationRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const currentTitle = getRouteTitle(activeRoute);
  const normalizedSidebarSearch = "";
  const visibleMainNavigation = useMemo(
    () =>
      normalizedSidebarSearch
        ? studioNavigation.filter((item) => item.label.toLowerCase().includes(normalizedSidebarSearch))
        : studioNavigation,
    [normalizedSidebarSearch],
  );
  const visibleBottomNavigation = useMemo(
    () =>
      normalizedSidebarSearch
        ? bottomNavigation.filter((item) => item.label.toLowerCase().includes(normalizedSidebarSearch))
        : bottomNavigation,
    [normalizedSidebarSearch],
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("Cedium-studio-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("Cedium-studio-theme", theme);
  }, [theme]);

  const themeValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((value) => (value === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveModal(null);
    setActiveDrawer(null);
    setActiveRecent(null);
    setWorkspaceOpen(false);
    setNotificationsOpen(false);
    setDisplayOpen(false);
    setIsTemporaryChat(false);
    setTemporaryChatId(null);
    setNewChatId(Date.now());
    setIsMobileOpen(false);
    router.push("/ai-assistant");
    showToast("New chat started");
  }, [router, showToast]);

  const startTemporaryChat = useCallback(() => {
    setActiveModal(null);
    setActiveDrawer(null);
    setActiveRecent(null);
    setWorkspaceOpen(false);
    setNotificationsOpen(false);
    setDisplayOpen(false);
    setIsTemporaryChat(true);
    setTemporaryChatId(Date.now());
    setIsMobileOpen(false);
    router.push("/ai-assistant");
    showToast("Temporary chat started");
  }, [router, showToast]);

  const endTemporaryChat = useCallback(() => {
    setIsTemporaryChat(false);
    setTemporaryChatId(null);
    showToast("Temporary chat ended");
  }, [showToast]);

  const actionValue = useMemo(
    () => ({
      openModal: (modal: StudioModalKey) => setActiveModal(modal),
      closeModal: () => setActiveModal(null),
      openDrawer: (drawer: StudioDrawerKey) => setActiveDrawer(drawer),
      closeDrawer: () => setActiveDrawer(null),
      showToast,
      isTemporaryChat,
      temporaryChatId,
      newChatId,
      startNewChat,
      startTemporaryChat,
      endTemporaryChat,
    }),
    [endTemporaryChat, isTemporaryChat, newChatId, showToast, startNewChat, startTemporaryChat, temporaryChatId],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
        setActiveDrawer(null);
        setActiveRecent(null);
        setActionsOpenSafe();
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const isTyping =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.getAttribute("contenteditable") === "true";
        if (!isTyping) {
          event.preventDefault();
          setActiveModal("search");
        }
      }
    }

    function setActionsOpenSafe() {
      setWorkspaceOpen(false);
      setNotificationsOpen(false);
      setDisplayOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCollapsed]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (workspaceRef.current && !workspaceRef.current.contains(target)) setWorkspaceOpen(false);
      const inHeaderNotifications = notificationRef.current?.contains(target) ?? false;
      const inSidebarNotifications = sidebarNotificationRef.current?.contains(target) ?? false;
      if (!inHeaderNotifications && !inSidebarNotifications) {
        setNotificationsOpen(false);
      }
      if (displayRef.current && !displayRef.current.contains(target)) setDisplayOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const toggleMenu = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileOpen((value) => !value);
      return;
    }

    setIsCollapsed((value) => !value);
  };

  const sidebar = (
    <aside
      className={[
        "flex h-full flex-shrink-0 flex-col rounded-none py-3 transition-all duration-200 ease-out",
        dark
          ? "border-r border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#181A1F_0%,#14161A_100%)]"
          : "border-r border-white/70 bg-[linear-gradient(180deg,#EAF3F8_0%,#F6FAFC_100%)]",
        isCollapsed ? "w-[60px]" : "w-[230px]",
      ].join(" ")}
    >
      <div className={isCollapsed ? "flex min-h-0 flex-1 flex-col px-2" : "flex min-h-0 flex-1 flex-col px-3"}>
      <div ref={workspaceRef} className="relative mb-4 flex items-center justify-between">
        {isCollapsed ? (
          <button
            onClick={toggleMenu}
            className={`group mx-auto flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-[14px] w-[14px]" strokeWidth={2.25} />
          </button>
        ) : (
          <>
            <button
              onClick={() => setWorkspaceOpen((value) => !value)}
              className={`group flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-[13px] font-semibold transition-colors ${dark ? "text-[#F4F6F8] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "text-[#1F2937] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
              aria-expanded={workspaceOpen}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white">
                <Shield className="h-[11px] w-[11px]" strokeWidth={2.25} />
              </span>
              <span className="truncate">Personal</span>
              <ChevronDown className={`h-3 w-3 ${dark ? "text-[#A8B0BA] group-hover:text-[#6EA4FF]" : "text-[#64748B] group-hover:text-[#1D9BF0]"}`} strokeWidth={2.25} />
            </button>
            <button
              onClick={startTemporaryChat}
              className={`group flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${isTemporaryChat ? (dark ? "bg-[rgba(59,167,255,0.18)] text-[#3BA7FF]" : "bg-[#CFE8F8] text-[#1D9BF0]") : (dark ? "text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]")}`}
              aria-label="Temporary Chat"
              title="Start temporary chat"
            >
              <MessageCircle className="h-[14px] w-[14px]" strokeWidth={2.25} />
            </button>
            <button
              onClick={toggleMenu}
              className={`group flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-[14px] w-[14px]" strokeWidth={2.25} />
            </button>
          </>
        )}

        {workspaceOpen && !isCollapsed && (
          <DropdownPanel className="left-0 top-9 w-56">
            <div className="px-3 py-2">
              <p className={`text-[10px] font-medium ${dark ? "text-[#6F7782]" : "text-[#8A94A3]"}`}>Current workspace</p>
              <p className={`mt-1 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Personal</p>
            </div>
            <DropdownButton onClick={() => router.push("/settings")} icon={Settings} label="Workspace settings" />
            <DropdownButton icon={RefreshCw} label="Switch workspace" onClick={() => setActiveModal("workspace-switch")} />
            <DropdownButton icon={Plus} label="Create workspace" onClick={() => setActiveModal("workspace-create")} />
          </DropdownPanel>
        )}
      </div>

      {!isCollapsed && (
        <>
          <button
            type="button"
            onClick={() => setActiveModal("search")}
            className={`mb-3 flex h-10 w-full items-center gap-2 rounded-2xl border px-3 text-left transition-all ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_8px_22px_rgba(0,0,0,0.16)] hover:border-[rgba(59,167,255,0.34)]" : "border-white/80 bg-white/72 shadow-[0_8px_22px_rgba(31,43,77,0.04)] hover:border-[#9BD2FF]"}`}
            aria-label="Open search"
          >
            <Search className={`h-[13px] w-[13px] ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`} strokeWidth={2.25} />
            <span className={`min-w-0 flex-1 truncate text-[12px] ${dark ? "text-[#6F7782]" : "text-[#A1A7B0]"}`}>Search...</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${dark ? "bg-[#202328] text-[#A8B0BA]" : "bg-[#F3F6F8] text-[#9CA3AF]"}`}>/</span>
          </button>
          <button
            onClick={startNewChat}
            className="mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#1DA1F2] text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(29,161,242,0.24)] transition-all hover:from-[#2FB2EE] hover:to-[#168ED8] active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            New Chat
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </>
      )}

      <nav className="space-y-1">
        {visibleMainNavigation.map((item) => (
          <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
        ))}
        {!isCollapsed && normalizedSidebarSearch && visibleMainNavigation.length === 0 && visibleBottomNavigation.length === 0 && (
          <p className={`px-2.5 py-2 text-[11px] ${dark ? "text-[#6F7782]" : "text-[#8A94A3]"}`}>No navigation matches.</p>
        )}
      </nav>

      <div className="mt-3 pt-3">
        {!isCollapsed && <p className={`mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${dark ? "text-[#6F7782]" : "text-[#8A94A3]"}`}>Recents</p>}
      </div>

      <div className="mt-auto">
        {!isCollapsed && (
          <div className={`mb-5 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.12)] bg-[#1D2026] text-[#F4F6F8] shadow-[0_14px_36px_rgba(0,0,0,0.28)]" : "border-[#D6DEE7] bg-[#EAF2F7] text-[#171717] shadow-[0_14px_36px_rgba(31,43,77,0.11)]"}`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white shadow-[0_10px_22px_rgba(29,161,242,0.24)]">
              <Sparkles className="h-[15px] w-[15px]" strokeWidth={2.25} />
            </div>
            <p className="text-[12px] font-bold">Free Plan</p>
            <p className={`mt-1 text-[10px] leading-4 ${dark ? "text-[#A8B0BA]" : "text-[#596575]"}`}>There are 12 days left before your free plan ends.</p>
            <button
              onClick={() => setActiveModal("upgrade")}
              className={`mt-3 h-8 rounded-lg border px-3 text-[10px] font-semibold ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#202328] text-[#F4F6F8] hover:border-[rgba(59,167,255,0.24)]" : "border-[#D1D9E2] bg-white text-[#171717] shadow-sm hover:border-[#B8C7D6]"}`}
            >
              Upgrade Now
            </button>
          </div>
        )}
        <div className="space-y-1 pb-1">
          {visibleBottomNavigation.map((item) => (
            <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
          ))}
          <button
            onClick={() => setSignOutOpen(true)}
            className={[
              "group flex h-8 items-center rounded-xl text-left text-[12px] font-medium transition-all",
              dark ? "text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.14)] hover:text-[#6EA4FF]" : "text-[#4B5563] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]",
              isCollapsed ? "mx-auto w-8 justify-center px-0" : "w-full gap-2 px-2.5",
            ].join(" ")}
          >
            <Upload className={`h-[13px] w-[13px] rotate-90 ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#6B7280] group-hover:text-[#4A9BFF]"}`} strokeWidth={2.25} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
      </div>
    </aside>
  );

  return (
    <StudioThemeContext.Provider value={themeValue}>
      <StudioActionContext.Provider value={actionValue}>
      <div className={`fixed inset-0 overflow-hidden font-sans ${dark ? "bg-[#0F1013] text-[#F4F6F8] studio-shell-dark" : "bg-[#F6FAFC] text-[#171717]"}`}>
      <style jsx global>{`
        .studio-shell-dark button,
        .studio-shell-dark a,
        button,
        a {
          cursor: pointer;
        }
        .studio-shell-dark button:focus-visible,
        .studio-shell-dark a:focus-visible,
        .studio-shell-dark input:focus-visible,
        .studio-shell-dark textarea:focus-visible,
        .studio-shell-dark select:focus-visible,
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(74, 155, 255, 0.48) !important;
          outline-offset: 2px !important;
        }
        .studio-shell-dark {
          background: #0f1013 !important;
          color: #f4f6f8 !important;
        }
        .studio-shell-dark aside {
          background: linear-gradient(180deg, #181a1f 0%, #14161a 100%) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .studio-shell-dark section {
          background: #17191d !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22) !important;
        }
        .studio-shell-dark main {
          background: #0f1013 !important;
        }
        .studio-shell-dark header button,
        .studio-shell-dark aside button,
        .studio-shell-dark nav a,
        .studio-shell-dark [role="button"] {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .studio-shell-dark [class*="bg-white"],
        .studio-shell-dark [class*="bg-\\[\\#FFFFFF\\]"],
        .studio-shell-dark [class*="bg-\\[\\#FCFDFE\\]"],
        .studio-shell-dark [class*="bg-\\[\\#FAFCFD\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F9FAFB\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F8FAFC\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F4F8FB\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F3F6F8\\]"] {
          background-color: #202328 !important;
        }
        .studio-shell-dark [class*="bg-\\[\\#DDEEFF\\]"] {
          background-color: rgba(66, 132, 255, 0.16) !important;
          color: #6ea4ff !important;
        }
        .studio-shell-dark [class*="bg-\\[\\#EEF7FC\\]"] {
          background-color: rgba(59, 167, 255, 0.12) !important;
        }
        .studio-shell-dark [class*="bg-\\[\\#4A9BFF\\]"] {
          background-color: #4284ff !important;
          color: #ffffff !important;
        }
        .studio-shell-dark [class*="bg-\\[\\#4A9BFF\\]"]:hover {
          background-color: #1e5ed4 !important;
          color: #ffffff !important;
        }
        .studio-shell-dark [class*="bg-gradient-to-br"] {
          box-shadow: 0 12px 28px rgba(66, 132, 255, 0.22) !important;
        }
        .studio-shell-dark [class*="text-\\[\\#171717\\]"],
        .studio-shell-dark [class*="text-\\[\\#1F2937\\]"],
        .studio-shell-dark [class*="text-\\[\\#111827\\]"],
        .studio-shell-dark [class*="text-slate-900"] {
          color: #f5f5f7 !important;
        }
        .studio-shell-dark [class*="text-\\[\\#4B5563\\]"],
        .studio-shell-dark [class*="text-\\[\\#6B7280\\]"],
        .studio-shell-dark [class*="text-\\[\\#8A94A3\\]"],
        .studio-shell-dark [class*="text-\\[\\#9CA3AF\\]"],
        .studio-shell-dark [class*="text-\\[\\#A1A7B0\\]"] {
          color: rgba(245, 245, 247, 0.7) !important;
        }
        .studio-shell-dark [class*="border-\\[\\#E5E7EB\\]"],
        .studio-shell-dark [class*="border-\\[\\#E8EEF2\\]"],
        .studio-shell-dark [class*="border-\\[\\#EAECEF\\]"],
        .studio-shell-dark [class*="border-\\[\\#EEF2F5\\]"],
        .studio-shell-dark [class*="border-\\[\\#D1D5DB\\]"],
        .studio-shell-dark [class*="border-\\[\\#D4EAF8\\]"],
        .studio-shell-dark [class*="border-\\[\\#CFE8F8\\]"],
        .studio-shell-dark [class*="border-white"] {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .studio-shell-dark nav a[style] {
          background: rgba(59, 167, 255, 0.14) !important;
          border-color: rgba(59, 167, 255, 0.18) !important;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22) !important;
          color: #f5f5f7 !important;
        }
        .studio-shell-dark nav a[style] svg {
          color: #3ba7ff !important;
        }
        .studio-shell-dark a:hover,
        .studio-shell-dark button:hover {
          border-color: rgba(59, 167, 255, 0.34) !important;
        }
        .studio-shell-dark input,
        .studio-shell-dark textarea,
        .studio-shell-dark select {
          background-color: #181b20 !important;
          color: #f5f5f7 !important;
        }
        .studio-shell-dark input::placeholder,
        .studio-shell-dark textarea::placeholder {
          color: rgba(245, 245, 247, 0.42) !important;
        }
        .studio-shell-dark [class*="hover:bg-\\[\\#DDEEFF\\]"]:hover,
        .studio-shell-dark [class*="hover:bg-white"]:hover,
        .studio-shell-dark [class*="hover:bg-\\[\\#FAFCFD\\]"]:hover,
        .studio-shell-dark [class*="hover:bg-\\[\\#F8FAFC\\]"]:hover,
        .studio-shell-dark [class*="hover:bg-\\[\\#F4F8FB\\]"]:hover {
          background-color: rgba(66, 132, 255, 0.14) !important;
          color: #6ea4ff !important;
        }
        .studio-shell-dark [class*="shadow-"] {
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.22) !important;
        }
        .studio-shell-dark [class*="text-white"] {
          color: #ffffff !important;
        }
      `}</style>
      <div className="flex h-full">
        <div className="hidden lg:block">{sidebar}</div>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className={`absolute inset-0 ${dark ? "bg-black/40 backdrop-blur-[2px]" : "bg-[#1F2937]/20 backdrop-blur-[2px]"}`} onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar" />
            <div className="relative h-full w-[230px] rounded-none shadow-[18px_0_50px_rgba(31,43,77,0.16)]">{sidebar}</div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col p-3">
          <header className="mb-3 flex h-8 items-center justify-between px-1">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`relative flex items-center gap-2 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setActiveDrawer("notifications")}
                    className={`group relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "bg-white/70 text-[#6B7280] shadow-sm hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
                    aria-label="Notifications"
                  >
                    <Bell className="h-[13px] w-[13px]" strokeWidth={2.25} />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF3B6B]" />
                  </button>
                  {notificationsOpen && <NotificationsDropdown align="left" />}
                </div>
                <button
                  onClick={() => setActiveModal("quick-settings")}
                  className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "bg-white/70 text-[#6B7280] shadow-sm hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
                  aria-label="Open settings"
                >
                  <Settings className="h-[13px] w-[13px]" strokeWidth={2.25} />
                </button>
                <div ref={displayRef} className="relative">
                  <button
                    onClick={() => setDisplayOpen((value) => !value)}
                    className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "bg-white/70 text-[#6B7280] shadow-sm hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
                    aria-label="Display preview"
                  >
                    <Monitor className="h-[13px] w-[13px]" strokeWidth={2.25} />
                  </button>
                  {displayOpen && <DisplayDropdown />}
                </div>
              </div>
              <h1 className={`truncate text-[15px] font-semibold tracking-[-0.01em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{currentTitle}</h1>
            </div>
            <Link
              href="/account"
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold tracking-[-0.02em] transition-colors ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#7DD3FC] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "bg-white text-[#4284FF] shadow-sm hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
              aria-label="Open account profile"
            >
              AL
            </Link>
          </header>

          <section
            className={[
              activeRoute === "ai-assistant" ? "min-h-0 flex-1 rounded-[12px]" : "min-h-0 flex-1 rounded-3xl",
              activeRoute === "ai-assistant" ? "overflow-hidden flex flex-col" : "overflow-auto",
              activeRoute === "ai-assistant" ? "p-0" : activeRoute === "code-builder" ? "px-4 py-4" : "px-8 py-8",
              dark
                ? "border border-[rgba(255,255,255,0.08)] bg-[#17191D] shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                : "border border-[#E8EEF2] bg-white shadow-[0_24px_60px_rgba(31,43,77,0.06)]",
              activeRoute === "ai-assistant" ? "border-transparent bg-white shadow-none" : "",
            ].join(" ")}
          >
            <div className={
              activeRoute === "ai-assistant"
                ? "flex min-h-0 w-full flex-1 flex-col"
                : activeRoute === "code-builder"
                  ? "w-full"
                  : "mx-auto w-full max-w-[1180px]"
            }>
              {children}
            </div>
          </section>
        </main>
      </div>

      {signOutOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ? "bg-black/45" : "bg-[#1F2937]/20"}`}>
          <div className={`w-full max-w-sm rounded-3xl border p-5 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_24px_70px_rgba(0,0,0,0.28)]" : "border-[#E5E7EB] bg-white shadow-[0_24px_70px_rgba(31,43,77,0.16)]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-[16px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Sign out</h2>
                <p className={`mt-2 text-[13px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Are you sure you want to sign out?</p>
              </div>
              <button onClick={() => setSignOutOpen(false)} className={`rounded-lg p-1 ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSignOutOpen(false)} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"}`}>
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={`rounded-xl px-4 py-2 text-[12px] font-semibold text-white shadow-[0_10px_22px_rgba(74,155,255,0.22)] ${dark ? "bg-[#3BA7FF] hover:bg-[#2D8FF0]" : "bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal && <StudioModal modal={activeModal} onClose={() => setActiveModal(null)} />}
      {activeDrawer && <StudioDrawer drawer={activeDrawer} onClose={() => setActiveDrawer(null)} />}
      {activeRecent && <RecentOutputDrawer recent={activeRecent} onClose={() => setActiveRecent(null)} />}
      {toast && <StudioToast message={toast} />}
      </div>
      </StudioActionContext.Provider>
    </StudioThemeContext.Provider>
  );
}

function StudioModal({ modal, onClose }: { modal: StudioModalKey; onClose: () => void }) {
  const { theme, toggleTheme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const content = getModalContent(modal);

  const submitAction = () => {
    showToast(content.success);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ? "bg-black/45" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <div
        className={`w-full max-w-xl rounded-3xl border p-5 shadow-[0_24px_70px_rgba(31,43,77,0.16)] transition-all ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{content.title}</h2>
            <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{content.description}</p>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {modal === "search" && <SearchFrame />}
        {modal === "quick-settings" && (
          <div className="mt-5 space-y-3">
            <ModalRow icon={theme === "dark" ? Moon : Sun} title={`${theme === "dark" ? "Dark" : "Light"} mode`} desc="Toggle the workspace appearance." action="Toggle" onClick={toggleTheme} />
            <ModalRow icon={Bell} title="Notifications" desc="Review workspace notification preferences." action="Open" onClick={() => showToast("Notification settings opened")} />
            <ModalRow icon={UserRound} title="Account settings" desc="Manage your profile and plan." action="Settings" href="/settings" />
            <ModalRow icon={Shield} title="Workspace settings" desc="Manage the Personal workspace." action="Manage" href="/settings" />
          </div>
        )}
        {modal === "upgrade" && <UpgradeFrame />}
        {modal === "workspace-switch" && <ChoiceList items={["Personal", "Studio Team", "Client Workspace"]} active="Personal" />}
        {modal === "workspace-create" && <SimpleForm placeholder="New workspace name" />}
        {modal === "prompt-editor" && <PromptEditorFrame />}
        {modal === "project-create" && <SimpleForm placeholder="Project name" extra="Choose a short project name and start from a clean workspace." />}
        {modal === "asset-upload" && <UploadFrame kind="asset" />}
        {modal === "upload-file" && <UploadFrame kind="file" />}
        {modal === "upload-image" && <UploadFrame kind="image" />}
        {modal === "upload-document" && <UploadFrame kind="document" />}
        {modal === "support" && <SimpleForm placeholder="How can support help?" extra="Send a short support request. The team will follow up in your workspace." />}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"}`}>Cancel</button>
          <button onClick={submitAction} className="rounded-xl bg-[#4A9BFF] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_10px_22px_rgba(74,155,255,0.22)] transition-all hover:bg-[#2D8FF0] active:scale-[0.98]">
            {content.action}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudioDrawer({ drawer, onClose }: { drawer: StudioDrawerKey; onClose: () => void }) {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const title = drawer === "profile" ? "Profile" : drawer === "notifications" ? "Notifications" : drawer === "asset-preview" ? "Asset details" : drawer === "project-detail" ? "Project details" : "Help article";

  return (
    <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ? "bg-black/35" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <aside
        className={`h-full w-full max-w-md border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] transition-all ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</h2>
            <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>A clean side panel for contextual workspace actions.</p>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close drawer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {drawer === "profile" && (
          <div className="mt-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5E7EB] bg-[#FCFDFE]"}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Personal workspace</p>
                  <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Trial plan - 12 days left</p>
                </div>
              </div>
            </div>
            <DrawerAction icon={Settings} label="Account settings" href="/settings" />
            <DrawerAction icon={CreditCard} label="Billing and plan" href="/settings" />
            <DrawerAction icon={RefreshCw} label="Switch workspace" onClick={() => showToast("Workspace switcher opened")} />
            <DrawerAction icon={Upload} label="Sign out" onClick={() => showToast("Use the sidebar Sign Out confirmation")} />
          </div>
        )}

        {drawer === "notifications" && (
          <div className="mt-5 space-y-3">
            <button onClick={() => showToast("All notifications marked as read")} className="mb-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] active:scale-[0.98]">Mark all as read</button>
            {["Prompt Lab has 2 drafts ready", "Latest export is available", "Workspace settings synced"].map((item) => (
              <div key={item} className={`rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5E7EB] bg-[#FCFDFE]"}`}>
                <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{item}</p>
                <p className={`mt-1 text-[10.5px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Just now</p>
              </div>
            ))}
          </div>
        )}

        {drawer !== "profile" && drawer !== "notifications" && (
          <div className={`mt-5 rounded-2xl border border-dashed p-6 text-center ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5E7EB] bg-[#FCFDFE]"}`}>
            <Sparkles className="mx-auto h-6 w-6 text-[#4A9BFF]" />
            <p className={`mt-3 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Details will appear here</p>
            <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Select an item to inspect it without leaving the workspace.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function RecentOutputDrawer({ recent, onClose }: { recent: GeneratedRecent; onClose: () => void }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const RecentIcon = recent.icon;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ? "bg-black/35" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <aside
        className={`h-full w-full max-w-md border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] transition-all ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
              <RecentIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${dark ? "text-[#6F7782]" : "text-[#8A94A3]"}`}>{recent.tool}</p>
              <h2 className={`mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{recent.title}</h2>
              <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{recent.meta} - {recent.time}</p>
            </div>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close recent output">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`mt-5 rounded-3xl border p-4 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-[#FCFDFE]"}`}>
          <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Generated output</p>
          <p className={`mt-3 text-[12px] leading-6 ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>{recent.output}</p>
        </div>

        <div className={`mt-4 rounded-3xl border border-dashed p-6 text-center ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#DCEBFA] bg-white"}`}>
          <RecentIcon className="mx-auto h-7 w-7 text-[#4A9BFF]" />
          <p className={`mt-3 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Ready to continue</p>
          <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Review the generated output, then continue refining it from the matching workspace.</p>
        </div>
      </aside>
    </div>
  );
}

function StudioToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] rounded-2xl border border-[#DCEBFA] bg-white px-4 py-3 text-[12px] font-semibold text-[#171717] shadow-[0_18px_48px_rgba(31,43,77,0.14)]">
      {message}
    </div>
  );
}

function getModalContent(modal: StudioModalKey) {
  const map: Record<StudioModalKey, { title: string; description: string; action: string; success: string }> = {
    search: { title: "Search workspace", description: "Find projects, prompts, assets, exports, and help without leaving this screen.", action: "Search", success: "Search opened" },
    "quick-settings": { title: "Quick settings", description: "Adjust common workspace preferences or jump into full settings.", action: "Done", success: "Settings updated" },
    "workspace-switch": { title: "Switch workspace", description: "Choose another workspace or continue in Personal.", action: "Switch", success: "Workspace switched" },
    "workspace-create": { title: "Create workspace", description: "Start a clean workspace for a new client, team, or project.", action: "Create", success: "Workspace created" },
    upgrade: { title: "Upgrade to Pro", description: "Review your current trial and unlock higher limits for production workflows.", action: "Upgrade", success: "Upgrade flow started" },
    "upload-file": { title: "Import file", description: "Upload common project files and attach them to the current workspace.", action: "Upload", success: "File added" },
    "upload-image": { title: "Upload image", description: "Add an image reference with preview support.", action: "Upload image", success: "Image added" },
    "upload-document": { title: "Upload document", description: "Attach PDFs, docs, text files, and markdown documents.", action: "Upload document", success: "Document added" },
    "prompt-editor": { title: "Create prompt", description: "Save a reusable prompt template for future workflows.", action: "Save prompt", success: "Prompt saved" },
    "project-create": { title: "Create project", description: "Create a project container for generated outputs and assets.", action: "Create project", success: "Project created" },
    "asset-upload": { title: "Upload asset", description: "Add images, 3D models, CAD files, documents, or generated outputs.", action: "Upload asset", success: "Asset uploaded" },
    support: { title: "Contact support", description: "Send a short support request from your workspace.", action: "Send request", success: "Support request sent" },
  };
  return map[modal];
}

function SearchFrame() {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#E5EAF0] bg-[#FCFDFE] px-4">
        <Search className="h-4 w-4 text-[#9CA3AF]" />
        <input autoFocus className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Search projects, prompts, assets, exports, and help..." />
        <span className="rounded-md bg-[#F3F6F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">Enter</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {["Recent searches", "Suggested actions", "Projects", "Assets"].map((title) => (
          <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3">
            <p className="text-[12px] font-semibold text-[#171717]">{title}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">No results yet. Start typing to preview matches.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadFrame({ kind }: { kind: "file" | "image" | "document" | "asset" }) {
  const label = kind === "image" ? "PNG, JPG, WEBP" : kind === "document" ? "PDF, DOCX, TXT, MD" : kind === "asset" ? "Images, 3D models, CAD files, documents" : "Any supported workspace file";
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#CFE8F8] bg-[#FAFCFD] p-6 text-center">
      <Upload className="mx-auto h-7 w-7 text-[#4A9BFF]" />
      <p className="mt-3 text-[13px] font-semibold text-[#171717]">Drop files here or browse</p>
      <p className="mt-2 text-[12px] text-[#6B7280]">{label}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF7FC]">
        <div className="h-full w-[18%] rounded-full bg-[#4A9BFF]" />
      </div>
    </div>
  );
}

function UpgradeFrame() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {["More generations", "Larger exports", "Priority workspace"].map((benefit) => (
        <div key={benefit} className="rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3">
          <CheckCircle2 className="h-4 w-4 text-[#4A9BFF]" />
          <p className="mt-3 text-[12px] font-semibold text-[#171717]">{benefit}</p>
        </div>
      ))}
    </div>
  );
}

function ChoiceList({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="mt-5 space-y-2">
      {items.map((item) => (
        <button key={item} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[12px] font-semibold transition-all active:scale-[0.99] ${item === active ? "border-[#CFE8F8] bg-[#EEF7FF] text-[#171717]" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8]"}`}>
          {item}
          {item === active && <CheckCircle2 className="h-4 w-4 text-[#4A9BFF]" />}
        </button>
      ))}
    </div>
  );
}

function SimpleForm({ placeholder, extra }: { placeholder: string; extra?: string }) {
  return (
    <div className="mt-5 space-y-3">
      <input className="h-11 w-full rounded-2xl border border-[#E5EAF0] bg-white px-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]" placeholder={placeholder} />
      {extra && <p className="text-[11px] leading-5 text-[#6B7280]">{extra}</p>}
    </div>
  );
}

function PromptEditorFrame() {
  return (
    <div className="mt-5 space-y-3">
      <input className="h-11 w-full rounded-2xl border border-[#E5EAF0] bg-white px-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]" placeholder="Prompt title" />
      <textarea className="min-h-[120px] w-full resize-none rounded-2xl border border-[#E5EAF0] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]" placeholder="Write the reusable prompt..." />
    </div>
  );
}

function ModalRow({ icon: Icon, title, desc, action, onClick, href }: { icon: LucideIcon; title: string; desc: string; action: string; onClick?: () => void; href?: string }) {
  const content = (
    <>
      <Icon className="h-4 w-4 text-[#4A9BFF]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-[#171717]">{title}</span>
        <span className="mt-1 block text-[10.5px] leading-4 text-[#6B7280]">{desc}</span>
      </span>
      <span className="text-[11px] font-semibold text-[#4A9BFF]">{action}</span>
    </>
  );
  if (href) {
    return <Link href={href} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3 transition-all hover:border-[#CFE8F8] active:scale-[0.99]">{content}</Link>;
  }
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3 text-left transition-all hover:border-[#CFE8F8] active:scale-[0.99]">{content}</button>;
}

function DrawerAction({ icon: Icon, label, href, onClick }: { icon: LucideIcon; label: string; href?: string; onClick?: () => void }) {
  const className = "flex h-10 w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] px-3 text-[12px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] active:scale-[0.99]";
  const content = (
    <>
      <Icon className="h-4 w-4 text-[#4A9BFF]" />
      {label}
    </>
  );
  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button onClick={onClick} className={className}>{content}</button>;
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: Pick<NavItem, "href" | "icon" | "label" | "badge">;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={[
        "group flex h-8 items-center rounded-xl border border-transparent text-left text-[12px] font-medium transition-all",
        dark ? "hover:border-[rgba(66,132,255,0.24)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]" : "hover:border-[#B7DDF4] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]",
        collapsed ? "mx-auto w-8 justify-center px-0" : "w-full gap-2 px-2.5",
      ].join(" ")}
      style={{
        background: active ? (dark ? "rgba(59,167,255,0.14)" : "#FFFFFF") : undefined,
        borderColor: active ? (dark ? "rgba(59,167,255,0.18)" : "rgba(229,231,235,0.95)") : undefined,
        boxShadow: active ? (dark ? "0 10px 24px rgba(0,0,0,0.22)" : "0 8px 18px rgba(31,43,77,0.06)") : undefined,
        color: active ? (dark ? "#F4F6F8" : "#171717") : undefined,
      }}
    >
      <Icon className={`h-[13px] w-[13px] flex-shrink-0 ${dark ? "group-hover:text-[#6EA4FF]" : "group-hover:text-[#1D9BF0]"} ${active ? "text-[#1D9BF0]" : dark ? "text-[#A8B0BA]" : "text-[#64748B]"}`} strokeWidth={2.25} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3B6B] px-1 text-[10px] font-bold text-white">{item.badge}</span>
      )}
    </Link>
  );
}

function DropdownPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className={`absolute z-50 rounded-2xl border p-1.5 shadow-[0_18px_48px_rgba(31,43,77,0.12)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_18px_48px_rgba(0,0,0,0.24)]" : "border-[#E8EEF2] bg-white"} ${className}`}>
      {children}
    </div>
  );
}

function DropdownButton({ icon: Icon, label, onClick, muted }: { icon: LucideIcon; label: string; onClick?: () => void; muted?: boolean }) {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  return (
    <button
      onClick={() => (onClick ? onClick() : showToast(`${label} is ready to configure`))}
      className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-medium transition-colors ${dark ? "text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.14)] hover:text-[#6EA4FF]" : "text-[#4B5563] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
    >
      <Icon className={`h-3.5 w-3.5 ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#6B7280] group-hover:text-[#4A9BFF]"}`} strokeWidth={2.25} />
      <span>{label}</span>
      {muted && <span className={`ml-auto text-[10px] ${dark ? "text-[#6F7782]" : "text-[#A1A7B0]"}`}>Soon</span>}
    </button>
  );
}

function NotificationsDropdown({ align = "right" }: { align?: "left" | "right" }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <DropdownPanel className={`${align === "left" ? "left-0" : "right-0"} top-9 w-72`}>
      <div className="px-3 py-2">
        <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Notifications</p>
        <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Recent workspace updates</p>
      </div>
      {[
        ["Prompt Lab", "2 prompts are ready for review."],
        ["Exports", "Latest render is queued for download."],
        ["Workspace", "Personal workspace synced locally."],
      ].map(([title, desc]) => (
        <div key={title} className={`rounded-xl px-3 py-2 ${dark ? "hover:bg-[rgba(255,255,255,0.06)]" : "hover:bg-[#F4F8FB]"}`}>
          <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</p>
          <p className={`mt-0.5 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{desc}</p>
        </div>
      ))}
    </DropdownPanel>
  );
}

function DisplayDropdown() {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
    showToast("Fullscreen requested");
  };

  return (
    <DropdownPanel className="right-0 top-9 w-60">
      <div className="px-3 py-2">
        <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Display preview</p>
        <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Layout and preview controls</p>
      </div>
      <DropdownButton icon={Monitor} label="Preview workspace" onClick={enterFullscreen} />
      <DropdownButton icon={Grid2X2} label="Compact density" onClick={() => showToast("Compact density applied")} />
      <DropdownButton icon={CheckCircle2} label={`${theme === "dark" ? "Dark" : "Light"} mode active`} />
    </DropdownPanel>
  );
}

function StudioContent({ route, assistantTool }: { route: StudioRouteKey; assistantTool?: AssistantToolKey }) {
  switch (route) {
    case "studio-overview":
      return <OverviewPage />;
    case "Cedium-design":
      return <CediumDesignPage />;
    case "autocad-design":
      return <AutoCADPage />;
    case "code-builder":
      return <CodeBuilderPage />;
    case "blender-3d":
      return <BlenderPage />;
    case "asset-library":
      return <AssetLibraryPage />;
    case "prompt-lab":
      return <PromptLabPage />;
    case "projects":
      return <ProjectsPage />;
    case "exports":
      return <ExportsPage />;
    case "settings":
      return <SettingsPage />;
    case "help-center":
      return <HelpCenterPage />;
    case "ai-assistant":
    default:
      if (assistantTool) return <ToolWorkspace config={toolWorkspaces[assistantTool]} />;
      return <AIAssistantPage />;
  }
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className={`text-[26px] font-semibold tracking-[-0.03em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</h2>
        <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return <div className={`rounded-2xl border p-4 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)]" : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.035)]"} ${className}`}>{children}</div>;
}

function ClickableSoftCard({ children, className = "", onClick, ariaLabel }: { children: ReactNode; className?: string; onClick: () => void; ariaLabel: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:border-[rgba(59,167,255,0.24)]" : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.035)] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"} ${className}`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: LucideIcon; onClick?: () => void }) {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  return (
    <button onClick={() => (onClick ? onClick() : showToast("Action opened"))} className={`inline-flex h-9 items-center gap-2 rounded-xl px-4 text-[12px] font-semibold transition-all active:scale-[0.98] ${dark ? "bg-[#3BA7FF] text-white shadow-[0_12px_24px_rgba(59,167,255,0.24)] hover:bg-[#2D8FF0]" : "bg-[#4A9BFF] text-white shadow-[0_12px_24px_rgba(74,155,255,0.22)] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: LucideIcon; onClick?: () => void }) {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  return (
    <button onClick={() => (onClick ? onClick() : showToast("Action opened"))} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:border-[rgba(59,167,255,0.24)] hover:text-[#F4F6F8]" : "border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm hover:border-[#CFE8F8] hover:text-[#171717]"}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function ToolWorkspace({ config }: { config: ToolWorkspaceConfig }) {
  const { theme } = useStudioTheme();
  const { openModal, showToast } = useStudioActions();
  const dark = theme === "dark";
  const Icon = config.icon;
  const [activeTab, setActiveTab] = useState(config.previewTabs?.[0] ?? "Preview");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);

  const runWorkspaceAction = () => {
    if (!prompt.trim()) {
      showToast("Describe what you want to create first");
      return;
    }
    setIsGenerating(true);
    window.setTimeout(() => {
      setHasOutput(true);
      setIsGenerating(false);
      showToast(`${config.title} request prepared`);
    }, 900);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`flex items-center gap-1.5 text-[12px] font-medium ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
          <Link href="/ai-assistant" className={`${dark ? "hover:text-[#F4F6F8]" : "hover:text-[#171717]"}`}>AI Assistant</Link>
          <span>/</span>
          <span className={dark ? "text-[#F4F6F8]" : "text-[#171717]"}>{config.title}</span>
        </div>
        <Link
          href="/ai-assistant"
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.24)] hover:text-[#F4F6F8]" : "border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm hover:border-[#CFE8F8] hover:text-[#171717]"}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to AI Assistant
        </Link>
      </div>

      <div className={`rounded-3xl border p-5 shadow-[0_18px_44px_rgba(31,43,77,0.05)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E8EEF2] bg-[#FCFDFE]"}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_16px_34px_rgba(29,161,242,0.24)]">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-[25px] font-semibold tracking-[-0.03em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{config.title}</h2>
              <p className={`mt-2 max-w-2xl text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{config.description}</p>
            </div>
          </div>
          <div className={`flex min-h-[58px] w-full items-center gap-2 rounded-2xl border px-3 py-2 lg:max-w-[460px] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white shadow-[0_12px_30px_rgba(31,43,77,0.04)]"}`}>
            <Sparkles className="h-4 w-4 flex-shrink-0 text-[#4A9BFF]" />
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className={`min-w-0 flex-1 bg-transparent text-[12px] outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "text-[#171717] placeholder:text-[#A1A7B0]"}`}
              placeholder={config.placeholder}
            />
            <button onClick={runWorkspaceAction} disabled={isGenerating} className={`inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-full px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(74,155,255,0.22)] transition-all active:scale-[0.98] disabled:opacity-60 ${dark ? "bg-[#3BA7FF] hover:bg-[#2D8FF0]" : "bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}>
              {isGenerating ? "Working..." : config.actionLabel}
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {config.quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.title}
              onClick={() => {
                setPrompt(action.title);
                showToast(`${action.title} selected`);
              }}
              className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:border-[rgba(59,167,255,0.24)]" : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.035)] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ? "bg-[rgba(59,167,255,0.14)] text-[#6EA4FF]" : "bg-[#EEF7FF] text-[#4A9BFF]"}`}>
                  <ActionIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{action.title}</span>
                  <span className={`mt-1 block text-[10.5px] leading-4 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{action.desc}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid min-h-[460px] gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SoftCard className="flex flex-col gap-4">
          <div>
            <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Prompt builder</p>
            <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Refine the request before generation.</p>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={7}
            placeholder={config.placeholder}
            className={`w-full resize-none rounded-2xl border p-3 text-[12px] leading-5 outline-none transition-colors focus:border-[#9BD2FF] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782]" : "border-[#E5EAF0] bg-white text-[#171717] placeholder:text-[#A1A7B0]"}`}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {config.selectors.map((selector) => (
              <label key={selector.label} className="block">
                <span className={`mb-1.5 block text-[11px] font-semibold ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>{selector.label}</span>
                <select className={`h-10 w-full rounded-xl border px-3 text-[12px] outline-none focus:border-[#9BD2FF] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]" : "border-[#E5EAF0] bg-white text-[#171717]"}`}>
                  {selector.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            {[
              { label: "Image", icon: ImageIcon },
              { label: "File", icon: Paperclip },
              { label: "Document", icon: FileText },
            ].map((attachment) => {
              const AttachmentIcon = attachment.icon;
              return (
                <button key={attachment.label} onClick={() => openModal(attachment.label === "Image" ? "upload-image" : attachment.label === "Document" ? "upload-document" : "upload-file")} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8] hover:text-[#171717]"}`}>
                  <AttachmentIcon className="h-3.5 w-3.5" />
                  {attachment.label}
                </button>
              );
            })}
          </div>
        </SoftCard>

        <SoftCard className="flex min-h-[420px] flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{config.previewType === "code" ? "Code output" : config.previewType === "blender" ? "3D preview" : "CAD preview"}</p>
              <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Outputs stay empty until you run an action.</p>
            </div>
            {config.previewTabs && (
              <div className={`flex rounded-xl border p-1 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
                {config.previewTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`h-7 rounded-lg px-3 text-[11px] font-semibold transition-all ${activeTab === tab ? "bg-[#4A9BFF] text-white shadow-[0_8px_16px_rgba(74,155,255,0.18)]" : dark ? "text-[#A8B0BA] hover:text-[#F4F6F8]" : "text-[#6B7280] hover:text-[#171717]"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolPreviewPlaceholder config={config} activeTab={activeTab} hasOutput={hasOutput} prompt={prompt} />
        </SoftCard>
      </div>

      <SoftCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Recent projects</p>
            <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Saved outputs and recent prompts for this workspace.</p>
          </div>
          <button onClick={() => showToast("Recent projects browser opened")} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5E7EB] bg-white text-[#6B7280]"}`}>
            <Search className="h-3.5 w-3.5" />
            Browse
          </button>
        </div>
        <div className={`mt-4 flex min-h-[96px] items-center justify-center rounded-2xl border border-dashed text-center ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5EAF0] bg-[#FAFCFD] text-[#6B7280]"}`}>
          <p className="px-4 text-[12px] leading-5">No recent items yet. Start with a prompt or quick action to create your first saved output.</p>
        </div>
      </SoftCard>
    </div>
  );
}

function ToolPreviewPlaceholder({ config, activeTab, hasOutput, prompt }: { config: ToolWorkspaceConfig; activeTab: string; hasOutput: boolean; prompt: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const Icon = config.icon;
  const gridColor = dark ? "rgba(255,255,255,0.055)" : "rgba(74,155,255,0.105)";
  const cleanPrompt = prompt.trim() || "your request";

  if (config.previewType === "code" && hasOutput) {
    return (
      <div className={`relative min-h-[340px] flex-1 overflow-hidden rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
        <div className={`flex gap-1.5 border-b px-4 py-3 ${dark ? "border-[rgba(255,255,255,0.08)] text-[#6F7782]" : "border-[#EEF2F5] text-[#CBD5E1]"}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
        {activeTab === "Plan" && (
          <div className="p-5">
            <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Generated plan</p>
            <div className="mt-4 grid gap-3">
              {[
                ["1", `Clarify scope for "${cleanPrompt}".`],
                ["2", "Create the component/page structure and required states."],
                ["3", "Wire interactions, accessibility labels, loading and empty states."],
                ["4", "Verify responsive layout and run checks before shipping."],
              ].map(([step, text]) => (
                <div key={step} className={`flex gap-3 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-[#FCFDFE]"}`}>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4A9BFF] text-[11px] font-bold text-white">{step}</span>
                  <p className={`text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "Code" && (
          <pre className={`m-5 overflow-auto rounded-2xl border p-4 text-[12px] leading-6 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#111318] text-[#DDE7F2]" : "border-[#E5EAF0] bg-[#FAFCFD] text-[#334155]"}`}>
{`export function GeneratedFeature() {
  return (
    <section className="rounded-2xl border bg-white p-4">
      <h2>${cleanPrompt}</h2>
      <p>Generated starter structure is ready to refine.</p>
    </section>
  );
}`}
          </pre>
        )}
        {activeTab === "Preview" && (
          <div className="flex min-h-[280px] items-center justify-center p-5">
            <div className={`w-full max-w-md rounded-3xl border p-5 text-center shadow-[0_18px_42px_rgba(31,43,77,0.06)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-[#FCFDFE]"}`}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className={`mt-4 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Preview draft ready</p>
              <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
                A clean preview frame for <span className={dark ? "text-[#F4F6F8]" : "text-[#171717]"}>{cleanPrompt}</span> is ready for the next refinement step.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const emptyCopy =
    config.previewType === "code" && activeTab === "Plan"
      ? "Your generated implementation plan will appear here."
      : config.previewType === "code" && activeTab === "Code"
        ? "Your generated code will appear here."
        : config.previewType === "code" && activeTab === "Preview"
          ? "Your generated preview will appear here."
          : config.emptyState;

  return (
    <div
      className={`relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}
      style={{
        backgroundImage:
          config.previewType === "code"
            ? undefined
            : `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: config.previewType === "autocad" ? "26px 26px" : "32px 32px",
      }}
    >
      {config.previewType === "code" && (
        <div className={`absolute left-4 top-4 flex gap-1.5 ${dark ? "text-[#6F7782]" : "text-[#CBD5E1]"}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
          <span className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      )}
      {config.previewType === "autocad" && (
        <>
          <div className={`absolute left-[12%] top-[16%] h-20 w-32 rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E8EEF2] bg-[#FCFDFE]"}`} />
          <div className={`absolute bottom-[18%] right-[12%] h-28 w-44 rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E8EEF2] bg-[#FCFDFE]"}`} />
        </>
      )}
      {config.previewType === "blender" && (
        <div className="absolute inset-x-[14%] bottom-[22%] h-px bg-gradient-to-r from-transparent via-[#8EC9FF] to-transparent" />
      )}
      <div className="relative z-10 flex max-w-xs flex-col items-center px-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_16px_34px_rgba(29,161,242,0.22)]">
          <Icon className="h-6 w-6" />
        </div>
        <p className={`mt-4 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Ready when you are</p>
        <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{emptyCopy}</p>
      </div>
    </div>
  );
}

function OverviewPage() {
  const router = useRouter();
  const { openModal, showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="Studio Overview" subtitle="Overview of workspace activity." />
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Active projects", "12", "+3 this week"],
          ["Design files", "48", "6 updated today"],
          ["Builds", "19", "4 ready"],
          ["Exports", "27", "9 delivered"],
        ].map(([label, value, meta]) => (
          <SoftCard key={label}>
            <p className="text-[11px] font-medium text-[#6B7280]">{label}</p>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#171717]">{value}</p>
            <p className="mt-1 text-[10px] text-[#8A94A3]">{meta}</p>
          </SoftCard>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Recent activity</h3>
          <div className="mt-4 space-y-3">
            {["AutoCAD homepage concept updated", "Code Builder prepared landing route", "Blender material preview generated"].map((item) => (
              <button key={item} onClick={() => showToast(`${item} opened`)} className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2 text-left transition-all hover:bg-[#F8FAFC] active:scale-[0.99]">
                <span className="h-2 w-2 rounded-full bg-[#1DA1F2]" />
                <span className="text-[12px] text-[#4B5563]">{item}</span>
              </button>
            ))}
          </div>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Quick actions</h3>
          <div className="mt-4 grid gap-2">
            <SecondaryButton icon={Plus} onClick={() => openModal("project-create")}>New project</SecondaryButton>
            <SecondaryButton icon={Upload} onClick={() => openModal("asset-upload")}>Import asset</SecondaryButton>
            <SecondaryButton icon={Sparkles} onClick={() => router.push("/ai-assistant")}>Start AI task</SecondaryButton>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}

function CediumDesignPage() {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const [prototypes, setPrototypes] = useState<PrototypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [quality, setQuality] = useState<PrototypeQuality>("high-fidelity");
  const [prototypeType, setPrototypeType] = useState<Exclude<PrototypeType, "design-system">>("website");
  const [brief, setBrief] = useState("");
  const [briefTags, setBriefTags] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Recent" | "Your designs" | "Design systems">("Recent");
  const [selectedPrototype, setSelectedPrototype] = useState<PrototypeItem | null>(null);
  const [designSystem, setDesignSystem] = useState<DesignSystemSettings>(defaultDesignSystem);
  const [editingPreset, setEditingPreset] = useState<keyof DesignSystemSettings | null>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const shell = dark
    ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
    : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_18px_42px_rgba(31,43,77,0.06)]";
  const muted = dark ? "text-[#A8B0BA]" : "text-[#6B7280]";
  const strong = dark ? "text-[#F4F6F8]" : "text-[#171717]";
  const qualityModes: Array<{ value: PrototypeQuality; label: string; icon: LucideIcon; desc: string }> = [
    { value: "wireframe", label: "Wireframe", icon: Grid2X2, desc: "Fast layout" },
    { value: "high-fidelity", label: "High fidelity", icon: PenLine, desc: "Visual polish" },
  ];
  const typeModes: Array<{ value: Exclude<PrototypeType, "design-system">; label: string; icon: LucideIcon; desc: string }> = [
    { value: "website", label: "Website", icon: Monitor, desc: "Landing pages" },
    { value: "mobile-app", label: "Mobile app", icon: Layers3, desc: "iOS/Android" },
  ];

  useEffect(() => {
    try {
      setPrototypes(prototypeRepository.list());
      setLoadError(null);
    } catch {
      setLoadError("Could not load prototypes from this browser.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistPrototypes = useCallback((nextPrototypes: PrototypeItem[]) => {
    setPrototypes(nextPrototypes);
    prototypeRepository.saveAll(nextPrototypes);
  }, []);

  const filteredPrototypes = useMemo(() => {
    const sorted = [...prototypes].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    if (activeTab === "Your designs") return sorted.filter((item) => item.origin === "user");
    if (activeTab === "Design systems") return sorted.filter((item) => item.type === "design-system");
    return sorted;
  }, [activeTab, prototypes]);

  const handleBriefChip = (chip: string) => {
    setBriefTags((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
    setBrief((current) => {
      const line = chipToBriefLine(chip);
      return current.includes(line) ? current : `${current.trim()}${current.trim() ? "\n" : ""}${line}`;
    });
  };

  const createPrototype = (event: FormEvent) => {
    event.preventDefault();
    if (!projectName.trim()) {
      setFormError("Project name is required.");
      showToast("Add a project name before creating.");
      projectInputRef.current?.focus();
      return;
    }

    try {
      const created = prototypeRepository.create({
        name: projectName.trim(),
        type: prototypeType,
        quality,
        brief: brief.trim(),
        tags: briefTags,
        designSystem,
      });
      persistPrototypes([created, ...prototypes]);
      setProjectName("");
      setBrief("");
      setBriefTags([]);
      setFormError(null);
      setActiveTab("Recent");
      setSelectedPrototype(created);
      showToast(`${created.name} created`);
    } catch {
      setFormError("Prototype could not be saved in this browser.");
      showToast("Prototype could not be saved.");
    }
  };

  const updatePrototype = (updated: PrototypeItem) => {
    const next = prototypes.map((item) => (item.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : item));
    persistPrototypes(next);
    setSelectedPrototype(next.find((item) => item.id === updated.id) ?? null);
  };

  const deletePrototype = (prototypeId: string) => {
    persistPrototypes(prototypes.filter((item) => item.id !== prototypeId));
    setSelectedPrototype(null);
    showToast("Prototype deleted");
  };

  const duplicatePrototype = (item: PrototypeItem) => {
    const duplicate = prototypeRepository.duplicate(item);
    persistPrototypes([duplicate, ...prototypes]);
    setSelectedPrototype(duplicate);
    showToast("Prototype duplicated");
  };

  const updateDesignSystem = (key: keyof DesignSystemSettings, value: string) => {
    const next = { ...designSystem, [key]: value } as DesignSystemSettings;
    setDesignSystem(next);
    setEditingPreset(null);
    if (selectedPrototype) {
      updatePrototype({ ...selectedPrototype, designSystem: next });
    }
    showToast("Design system updated");
  };

  return (
    <div>
      <PageHeader
        title="Cedium Design"
        subtitle="Design website, app, and mobile prototypes in the same Cedium AI workspace."
        action={<PrimaryButton icon={Sparkles} onClick={() => projectInputRef.current?.focus()}>Create prototype</PrimaryButton>}
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <form onSubmit={createPrototype} className={`rounded-[28px] border p-4 ${shell}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_14px_30px_rgba(29,161,242,0.24)]">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${strong}`}>New prototype</p>
              <p className={`text-[11px] ${muted}`}>Website, app, mobile UI</p>
            </div>
          </div>

          <div className={`mt-5 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
            <label htmlFor="prototype-name" className={`text-[11px] font-semibold ${strong}`}>Project name</label>
            <input
              id="prototype-name"
              ref={projectInputRef}
              value={projectName}
              onChange={(event) => {
                setProjectName(event.target.value);
                if (formError) setFormError(null);
              }}
              className={`mt-2 h-10 w-full rounded-xl border px-3 text-[12px] outline-none ${formError ? "border-[#FF3B6B]" : dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8] placeholder:text-[#6F7782]" : "border-[#E5E7EB] bg-[#FAFCFD] text-[#171717] placeholder:text-[#A1A7B0]"}`}
              placeholder="Marketplace mobile refresh"
              aria-invalid={Boolean(formError)}
            />
            {formError && <p className="mt-2 text-[10.5px] font-semibold text-[#FF3B6B]">{formError}</p>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[...qualityModes, ...typeModes].map(({ label, icon: Icon, desc, value }) => {
              const selected = value === quality || value === prototypeType;
              return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (value === "wireframe" || value === "high-fidelity") setQuality(value);
                  else setPrototypeType(value as Exclude<PrototypeType, "design-system">);
                }}
                className={`group min-h-[108px] rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] ${selected ? "border-[#9BD2FF] bg-[#EEF7FF]" : dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] hover:border-[rgba(59,167,255,0.24)]" : "border-[#E5EAF0] bg-white hover:border-[#CFE8F8]"}`}
                aria-pressed={selected}
              >
                <div className={`mb-3 flex h-10 items-center justify-center rounded-xl ${selected ? "bg-white text-[#4A9BFF]" : dark ? "bg-[#202328] text-[#A8B0BA]" : "bg-[#F4F8FB] text-[#6B7280]"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`text-[12px] font-semibold ${selected ? "text-[#171717]" : strong}`}>{label}</p>
                <p className={`mt-1 text-[10px] ${selected ? "text-[#4B5563]" : muted}`}>{desc}</p>
              </button>
            );
            })}
          </div>

          <button type="submit" className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4A9BFF] to-[#1DA1F2] text-[12px] font-semibold text-white shadow-[0_16px_34px_rgba(29,161,242,0.24)] transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <Plus className="h-4 w-4" />
            Create
          </button>
          <p className={`mt-3 text-center text-[10px] ${muted}`}>Only you can see your prototype by default.</p>
        </form>

        <section className="space-y-4">
          <div className={`rounded-[28px] border p-4 ${shell}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-[13px] font-semibold ${strong}`}>Designs</p>
                <p className={`mt-1 text-[11px] ${muted}`}>Recent prototypes and UI systems generated with Cedium AI.</p>
              </div>
              <div className={`flex rounded-2xl p-1 ${dark ? "bg-[#181B20]" : "bg-[#EEF3F7]"}`}>
                {(["Recent", "Your designs", "Design systems"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold ${activeTab === tab ? "bg-white text-[#171717] shadow-sm" : muted}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {isLoading && <StudioInlineState icon={RefreshCw} title="Loading prototypes" text="Reading saved design work from this browser." />}
            {loadError && <StudioInlineState icon={AlertTriangle} title="Prototype error" text={loadError} />}
            {!isLoading && !loadError && filteredPrototypes.length === 0 && (
              <StudioInlineState icon={Monitor} title="No designs yet" text={activeTab === "Your designs" ? "Create a prototype and it will appear here." : "No items match this tab yet."} />
            )}
            {!isLoading && !loadError && filteredPrototypes.length > 0 && (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {filteredPrototypes.map((prototype) => (
                  <PrototypeCard key={prototype.id} prototype={prototype} onOpen={() => setSelectedPrototype(prototype)} />
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-[28px] border p-4 ${shell}`}>
              <label htmlFor="prototype-brief" className={`text-[13px] font-semibold ${strong}`}>Prototype brief</label>
              <textarea
                id="prototype-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                className={`mt-3 min-h-[118px] w-full resize-none rounded-2xl border p-4 text-[13px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782]" : "border-[#E5EAF0] bg-white text-[#171717] placeholder:text-[#A1A7B0]"}`}
                placeholder="Describe the website, dashboard, mobile flow, or app screen you want Cedium Design to create..."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {["Responsive", "Design tokens", "Components", "Prototype flow"].map((chip) => (
                  <button key={chip} type="button" onClick={() => handleBriefChip(chip)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${briefTags.includes(chip) ? "border-[#9BD2FF] bg-[#EEF7FF] text-[#171717]" : dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#A8B0BA]" : "border-[#E5EAF0] bg-[#FAFCFD] text-[#4B5563]"}`}>{chip}</button>
                ))}
              </div>
            </div>

            <div className={`rounded-[28px] border p-4 ${shell}`}>
              <p className={`text-[13px] font-semibold ${strong}`}>Design system</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Color", "colorPreset", designSystem.colorPreset, "#4A9BFF"],
                  ["Typography", "typographyPreset", designSystem.typographyPreset, "#171717"],
                  ["Spacing", "spacingPreset", designSystem.spacingPreset, "#CFE8F8"],
                ].map(([label, key, desc, color]) => (
                  <button key={label} type="button" onClick={() => setEditingPreset(key as keyof DesignSystemSettings)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:border-[#CFE8F8] active:scale-[0.99] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
                    <span className="h-9 w-9 rounded-xl" style={{ background: color }} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[12px] font-semibold ${strong}`}>{label}</span>
                      <span className={`mt-0.5 block text-[10.5px] ${muted}`}>{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      {editingPreset && (
        <PresetEditor
          presetKey={editingPreset}
          value={designSystem[editingPreset]}
          onSave={(value) => updateDesignSystem(editingPreset, value)}
          onClose={() => setEditingPreset(null)}
        />
      )}
      {selectedPrototype && (
        <PrototypeDetailDrawer
          prototype={selectedPrototype}
          onClose={() => setSelectedPrototype(null)}
          onUpdate={updatePrototype}
          onDelete={() => deletePrototype(selectedPrototype.id)}
          onDuplicate={() => duplicatePrototype(selectedPrototype)}
          onOpen={() => showToast(`${selectedPrototype.name} opened`)}
        />
      )}
    </div>
  );
}

function chipToBriefLine(chip: string) {
  const map: Record<string, string> = {
    Responsive: "- Responsive layout across desktop, tablet, and mobile.",
    "Design tokens": "- Tokenized color, type, and spacing decisions.",
    Components: "- Reusable UI components for repeated product sections.",
    "Prototype flow": "- Connected screens that show the primary user flow.",
  };
  return map[chip] ?? `- ${chip}`;
}

function prototypeTypeLabel(type: PrototypeType) {
  if (type === "mobile-app") return "Mobile app";
  if (type === "design-system") return "Design system";
  return "Website";
}

function prototypeQualityLabel(quality: PrototypeQuality) {
  return quality === "high-fidelity" ? "High fidelity" : "Wireframe";
}

function formatStudioDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatRelativeStudioDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diff = Date.now() - date.getTime();
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) return "Today";
  if (diff < day * 2) return "Yesterday";
  return `${Math.max(2, Math.floor(diff / day))}d ago`;
}

function StudioInlineState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className={`mt-5 rounded-2xl border border-dashed p-6 text-center ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#DCEBFA] bg-white"}`}>
      <Icon className="mx-auto h-6 w-6 text-[#4A9BFF]" />
      <p className={`mt-3 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</p>
      <p className={`mt-2 text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{text}</p>
    </div>
  );
}

function PrototypeCard({ prototype, onOpen }: { prototype: PrototypeItem; onOpen: () => void }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const strong = dark ? "text-[#F4F6F8]" : "text-[#171717]";
  const muted = dark ? "text-[#A8B0BA]" : "text-[#6B7280]";
  const tag = prototype.type === "design-system" ? "System" : prototype.type === "mobile-app" ? "App" : "Checkout";

  return (
    <ClickableSoftCard className="overflow-hidden p-0" onClick={onOpen} ariaLabel={`Open ${prototype.name}`}>
      <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#DDF2FF] via-[#F8FBFF] to-[#EAF7F2]">
        <div className="absolute left-4 top-4 h-16 w-24 rounded-2xl border border-white/80 bg-white/70 shadow-[0_10px_24px_rgba(31,43,77,0.08)]" />
        <div className="absolute bottom-4 right-4 h-20 w-28 rounded-2xl border border-white/80 bg-white/82 p-2 shadow-[0_12px_28px_rgba(31,43,77,0.10)]">
          <div className="h-2 w-14 rounded-full bg-[#4A9BFF]" />
          <div className="mt-2 h-2 w-20 rounded-full bg-[#D7E5EF]" />
          <div className="mt-2 h-8 rounded-xl bg-[#F7BFA3]" />
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/82 px-2 py-1 text-[10px] font-semibold text-[#4A5563]">{tag}</span>
      </div>
      <div className="p-4">
        <p className={`text-[12px] font-semibold ${strong}`}>{prototype.name}</p>
        <p className={`mt-1 text-[10.5px] ${muted}`}>{prototypeTypeLabel(prototype.type)} - {formatRelativeStudioDate(prototype.createdAt)}</p>
      </div>
    </ClickableSoftCard>
  );
}

function PresetEditor({
  presetKey,
  value,
  onSave,
  onClose,
}: {
  presetKey: keyof DesignSystemSettings;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const [draft, setDraft] = useState(value);
  const options: Record<keyof DesignSystemSettings, string[]> = {
    colorPreset: ["Sky / Paper / Graphite", "Ocean / Paper / Ink", "Mono / Cloud / Graphite"],
    typographyPreset: ["Clean UI scale", "Platform scale", "Compact product scale"],
    spacingPreset: ["8px rhythm", "6px compact rhythm", "12px spacious rhythm"],
  };
  const title = presetKey === "colorPreset" ? "Color preset" : presetKey === "typographyPreset" ? "Typography preset" : "Spacing preset";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ? "bg-black/45" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <div className={`w-full max-w-sm rounded-3xl border p-5 shadow-[0_24px_70px_rgba(31,43,77,0.16)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[16px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</h2>
            <p className={`mt-2 text-[12px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Choose the default for new prototypes.</p>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close preset editor">
            <X className="h-4 w-4" />
          </button>
        </div>
        <select value={draft} onChange={(event) => setDraft(event.target.value)} className={`mt-5 h-11 w-full rounded-2xl border px-3 text-[12px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]" : "border-[#E5EAF0] bg-white text-[#171717]"}`}>
          {options[presetKey].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5E7EB] bg-white text-[#4B5563]"}`}>Cancel</button>
          <button onClick={() => onSave(draft)} className="rounded-xl bg-[#4A9BFF] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_10px_22px_rgba(74,155,255,0.22)]">Save</button>
        </div>
      </div>
    </div>
  );
}

function PrototypeDetailDrawer({
  prototype,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpen,
}: {
  prototype: PrototypeItem;
  onClose: () => void;
  onUpdate: (prototype: PrototypeItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpen: () => void;
}) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const [name, setName] = useState(prototype.name);

  useEffect(() => {
    setName(prototype.name);
  }, [prototype.id, prototype.name]);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ? "bg-black/35" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <aside className={`h-full w-full max-w-md overflow-y-auto border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Prototype details</h2>
            <p className={`mt-2 text-[12px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{prototype.status} - {prototype.visibility}</p>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close prototype details">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className={`text-[11px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Name</label>
            <div className="mt-2 flex gap-2">
              <input value={name} onChange={(event) => setName(event.target.value)} className={`h-10 min-w-0 flex-1 rounded-xl border px-3 text-[12px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]" : "border-[#E5EAF0] bg-white text-[#171717]"}`} />
              <button onClick={() => name.trim() && onUpdate({ ...prototype, name: name.trim() })} className="rounded-xl bg-[#4A9BFF] px-3 text-[11px] font-semibold text-white">Save</button>
            </div>
          </div>
          <DetailRows
            rows={[
              ["Type", prototypeTypeLabel(prototype.type)],
              ["Quality", prototypeQualityLabel(prototype.quality)],
              ["Status", prototype.status],
              ["Created", formatStudioDate(prototype.createdAt)],
              ["Visibility", prototype.visibility],
            ]}
          />
          <div className={`rounded-2xl border p-4 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-[#FCFDFE]"}`}>
            <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Brief</p>
            <p className={`mt-2 whitespace-pre-wrap text-[12px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>{prototype.brief || "No brief saved."}</p>
          </div>
          <DetailRows
            rows={[
              ["Color", prototype.designSystem.colorPreset],
              ["Typography", prototype.designSystem.typographyPreset],
              ["Spacing", prototype.designSystem.spacingPreset],
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onOpen} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">Open</button>
            <button onClick={onDuplicate} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">Duplicate</button>
            <button onClick={onDelete} className="col-span-2 rounded-xl border border-[#FFD7DF] px-3 py-2 text-[11px] font-semibold text-[#D92D52]">Delete</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailRows({ rows }: { rows: Array<[string, string]> }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className={`overflow-hidden rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.08)]" : "border-[#E5EAF0]"}`}>
      {rows.map(([label, value]) => (
        <div key={label} className={`flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-[#FCFDFE]"}`}>
          <span className={`text-[10.5px] font-semibold ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{label}</span>
          <span className={`text-right text-[11px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function AutoCADPage() {
  const { openModal, showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="AutoCAD Design" subtitle="Create CAD drawings, technical plans, and export-ready drafting files." action={<PrimaryButton icon={Upload} onClick={() => openModal("upload-file")}>Import AutoCAD file</PrimaryButton>} />
      <button onClick={() => openModal("upload-file")} className="mb-5 flex min-h-[150px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAECEF] bg-[#FCFDFE] p-4 text-center shadow-[0_10px_24px_rgba(31,43,77,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#CFE8F8] active:scale-[0.99]">
        <PenLine className="h-8 w-8 text-[#1DA1F2]" />
        <p className="mt-3 text-[13px] font-semibold text-[#171717]">Upload or import an AutoCAD file</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Drop a DWG, DXF, PDF, or technical reference file here.</p>
      </button>
      <h3 className="mb-3 text-[13px] font-semibold text-[#171717]">Recent drawings</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {["Floor plan study", "Workspace elevation", "System detail"].map((name) => (
          <ClickableSoftCard key={name} className="min-h-[130px]" onClick={() => showToast(`${name} drawing opened`)} ariaLabel={`Open ${name}`}>
            <div className="mb-4 h-16 rounded-xl bg-[#EEF7FC]" />
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-1 text-[10px] text-[#6B7280]">No generated preview yet.</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
  );
}

function CodeBuilderPage() {
  const { openModal, showToast } = useStudioActions();
  const [phase, setPhase] = useState<CodeBuilderPhase>("idle");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<CodeBuilderPlan | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<CodeBuilderLayer["id"]>("hero");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const generatePlan = async (event?: FormEvent) => {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setPhase("error");
      setErrorMessage("Write a website prompt before generating a plan.");
      promptRef.current?.focus();
      return;
    }

    setPhase("generatingPlan");
    setErrorMessage(null);

    const openPlan = (nextPlan: CodeBuilderPlan, toastMessage: string) => {
      setPlan(nextPlan);
      setActiveLayerId(nextPlan.layers[1]?.id ?? nextPlan.layers[0]?.id ?? "hero");
      setPhase("planReady");
      showToast(toastMessage);
    };

    try {
      const response = await fetch("/api/code/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          input: { workflow: "website_builder_plan" },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const apiError = data.error as { code?: string; message?: string } | undefined;
      if (!response.ok) {
        if (response.status === 401 || apiError?.code === "UNAUTHENTICATED") {
          openPlan(generateWebsitePlanFromPrompt(cleanPrompt), "Local code plan generated");
          return;
        }
        throw new Error(apiError?.message ?? "Plan generation failed.");
      }

      const job = data.job as { output?: { plan?: unknown } } | undefined;
      const nextPlan =
        normalizeCodeBuilderPlan(data.plan, cleanPrompt) ??
        normalizeCodeBuilderPlan(job?.output?.plan, cleanPrompt) ??
        generateWebsitePlanFromPrompt(cleanPrompt);

      openPlan(nextPlan, "Code plan generated");
    } catch (error) {
      setPhase("error");
      setErrorMessage(error instanceof Error ? error.message : "Plan generation failed.");
    }
  };

  if (phase === "planReady" && plan) {
    return (
      <CodeBuilderWorkspace
        plan={plan}
        activeLayerId={activeLayerId}
        onSelectLayer={setActiveLayerId}
        onRegenerate={() => void generatePlan()}
        onSave={() => showToast("Workspace saved")}
        onExport={() => showToast("Export prepared")}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-2">
      <PageHeader title="Code Builder" subtitle="Describe a website and generate a plan-ready builder workspace." />
      <form onSubmit={generatePlan} className="overflow-hidden rounded-[8px] border border-[#E1E6EA] bg-[#FCFDFE] shadow-[0_18px_44px_rgba(31,43,77,0.05)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border-b border-[#E8EEF2] p-5 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EEF7FC] text-[#1DA1F2]">
                <Code2 className="h-4 w-4" />
              </span>
              <div>
                <label htmlFor="code-builder-prompt" className="text-[13px] font-semibold text-[#171717]">Project prompt</label>
                <p className="mt-1 text-[11px] text-[#6B7280]">This creates the first website plan, layers, and preview canvas.</p>
              </div>
            </div>
            <textarea
              ref={promptRef}
              id="code-builder-prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (phase === "error") setErrorMessage(null);
              }}
              disabled={phase === "generatingPlan"}
              className="min-h-[170px] w-full resize-none rounded-[8px] border border-[#E5EAF0] bg-white p-4 text-[13px] leading-6 text-[#171717] outline-none transition-colors placeholder:text-[#A1A7B0] focus:border-[#9BD2FF] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Describe the website you want to build. Example: a modern SaaS landing page for a design automation platform with pricing, testimonials, and a strong CTA."
            />
            {errorMessage && (
              <p className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#B42318]">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errorMessage}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={!prompt.trim() || phase === "generatingPlan"}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#4A9BFF] px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(74,155,255,0.18)] transition-all hover:bg-[#2D8FF0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === "generatingPlan" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Code2 className="h-3.5 w-3.5" />}
                {phase === "generatingPlan" ? "Generating plan..." : "Generate plan"}
              </button>
              <button
                type="button"
                onClick={() => openModal("project-create")}
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717] active:scale-[0.98]"
              >
                <Folder className="h-3.5 w-3.5" />
                Open recent project
              </button>
            </div>
          </div>
          <div className="bg-[#F7FAFC] p-5">
            <p className="text-[12px] font-semibold text-[#171717]">Builder output</p>
            <div className="mt-4 space-y-3">
              {["Plan summary", "Code layers", "Live preview"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] border border-[#E5EAF0] bg-white px-3 py-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${phase === "generatingPlan" && index === 0 ? "bg-[#4A9BFF] text-white" : "bg-[#EEF7FC] text-[#1DA1F2]"}`}>
                    {phase === "generatingPlan" && index === 0 ? <RefreshCw className="h-3 w-3 animate-spin" /> : index + 1}
                  </span>
                  <span className="text-[12px] font-medium text-[#4B5563]">{item}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setPrompt("Modern website building template with a strong hero, feature cards, pricing, testimonials, and a clean footer.");
                promptRef.current?.focus();
              }}
              disabled={phase === "generatingPlan"}
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#4A9BFF]" />
              Use website template prompt
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

type BuilderChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type CodeBuilderFile = {
  path: string;
  language: "tsx" | "css";
  content: string;
};

function createCodeBuilderFiles(plan: CodeBuilderPlan): CodeBuilderFile[] {
  const navItems = plan.pages.slice(0, 4).map((page) => `"${page}"`).join(", ");
  const featureCards = plan.layers
    .slice(0, 3)
    .map((layer) => `  { title: "${layer.canvasLabel}", description: "${layer.description}" }`)
    .join(",\n");

  return [
    {
      path: "app/page.tsx",
      language: "tsx",
      content: `import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";

const sections = [
${featureCards}
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <Navbar />
      <Hero />
      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-16 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{section.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`,
    },
    {
      path: "app/layout.tsx",
      language: "tsx",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${plan.projectName}",
  description: "${plan.summary}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
    },
    {
      path: "components/Hero.tsx",
      language: "tsx",
      content: `export function Hero() {
  return (
    <section className="bg-neutral-600 px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
        ${plan.websiteType}
      </p>
      <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-tight text-black">
        Website Building Template
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/70">
        ${plan.designDirection}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <a className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white" href="#start">
          Launch preview
        </a>
        <a className="rounded-lg border border-black/20 px-5 py-3 text-sm font-semibold text-black" href="#plan">
          View plan
        </a>
      </div>
    </section>
  );
}
`,
    },
    {
      path: "components/Navbar.tsx",
      language: "tsx",
      content: `const navItems = [${navItems}];

export function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 rounded-lg bg-neutral-950" />
        <span className="text-sm font-semibold">${plan.projectName}</span>
      </div>
      <nav className="hidden items-center gap-6 text-xs font-semibold text-neutral-500 md:flex">
        {navItems.map((item) => (
          <a key={item} href={\`#\${item.toLowerCase()}\`}>{item}</a>
        ))}
      </nav>
    </header>
  );
}
`,
    },
    {
      path: "app/globals.css",
      language: "css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #ffffff;
}
`,
    },
  ];
}

function CodeBuilderWorkspace({
  plan,
  activeLayerId,
  onSelectLayer,
  onRegenerate,
  onSave,
  onExport,
}: {
  plan: CodeBuilderPlan;
  activeLayerId: CodeBuilderLayer["id"];
  onSelectLayer: (layerId: CodeBuilderLayer["id"]) => void;
  onRegenerate: () => void;
  onSave: () => void;
  onExport: () => void;
}) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<BuilderChatMessage[]>([
    { id: "assistant-ready", role: "assistant", content: "Plan generated. Select a layer or describe the next adjustment." },
  ]);
  const [files, setFiles] = useState<CodeBuilderFile[]>(() => createCodeBuilderFiles(plan));
  const [activeFilePath, setActiveFilePath] = useState(() => createCodeBuilderFiles(plan)[0]?.path ?? "app/page.tsx");
  const activeLayer = plan.layers.find((layer) => layer.id === activeLayerId) ?? plan.layers[0];
  const activeFile = files.find((file) => file.path === activeFilePath) ?? files[0];

  useEffect(() => {
    const nextFiles = createCodeBuilderFiles(plan);
    setFiles(nextFiles);
    setActiveFilePath(nextFiles[0]?.path ?? "app/page.tsx");
  }, [plan]);

  const sendChatMessage = () => {
    const content = chatInput.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content },
    ]);
    setChatInput("");
  };

  const updateActiveFile = (content: string) => {
    setFiles((current) =>
      current.map((file) => (file.path === activeFile.path ? { ...file, content } : file)),
    );
  };

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-[720px] w-full flex-col overflow-hidden rounded-[8px] border border-[#DDE3EA] bg-[#F2F5F8] shadow-[0_18px_44px_rgba(31,43,77,0.08)]">
      <BuilderHeader plan={plan} onRegenerate={onRegenerate} onSave={onSave} onExport={onExport} />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <CodeLayerSidebar
          plan={plan}
          activeLayerId={activeLayerId}
          onSelectLayer={onSelectLayer}
          messages={messages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={sendChatMessage}
        />
        <main className="min-h-0 overflow-hidden bg-[#E9EDF1]">
          <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
            <GeneratedPlanSummary plan={plan} activeLayer={activeLayer} />
            <div className="grid min-h-0 gap-3 p-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] 2xl:grid-cols-[minmax(0,1.1fr)_minmax(520px,0.9fr)]">
              <PreviewCanvas plan={plan} activeLayerId={activeLayerId} />
              <CodeWorkspace
                files={files}
                activeFile={activeFile}
                onSelectFile={setActiveFilePath}
                onChangeFile={updateActiveFile}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function BuilderHeader({ plan, onRegenerate, onSave, onExport }: { plan: CodeBuilderPlan; onRegenerate: () => void; onSave: () => void; onExport: () => void }) {
  return (
    <header className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 border-b border-[#DDE3EA] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EEF7FC] text-[#1DA1F2]">
          <Monitor className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-[15px] font-semibold text-[#171717]">{plan.projectName || "Website Building Template"}</h2>
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[#BFE6D1] bg-[#EEFDF4] px-2 text-[10px] font-semibold text-[#087443]">
              <CheckCircle2 className="h-3 w-3" />
              Plan generated
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{plan.websiteType}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <BuilderToolButton icon={Monitor} label="Preview" onClick={() => undefined} />
        <BuilderToolButton icon={Download} label="Export" onClick={onExport} />
        <BuilderToolButton icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />
        <button onClick={onSave} className="inline-flex h-8 items-center gap-2 rounded-[8px] bg-[#171717] px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#2B2F34] active:scale-[0.98]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Save
        </button>
      </div>
    </header>
  );
}

function BuilderToolButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717] active:scale-[0.98]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function CodeLayerSidebar({
  plan,
  activeLayerId,
  onSelectLayer,
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
}: {
  plan: CodeBuilderPlan;
  activeLayerId: CodeBuilderLayer["id"];
  onSelectLayer: (layerId: CodeBuilderLayer["id"]) => void;
  messages: BuilderChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#DDE3EA] bg-[#FBFCFD]">
      <div className="border-b border-[#E5EAF0] p-4">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-[#1DA1F2]" />
          <h3 className="text-[18px] font-semibold text-[#171717]">Code Layer Space</h3>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">{plan.layers.length} generated layers</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {plan.layers.map((layer) => {
            const active = activeLayerId === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onSelectLayer(layer.id)}
                className={`flex w-full items-start gap-3 rounded-[8px] border px-3 py-3 text-left transition-all active:scale-[0.99] ${active ? "border-[#9BD2FF] bg-[#EEF7FC] shadow-[0_10px_24px_rgba(74,155,255,0.08)]" : "border-transparent bg-transparent hover:border-[#E5EAF0] hover:bg-white"}`}
              >
                <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] ${active ? "bg-[#4A9BFF] text-white" : "bg-[#EEF2F5] text-[#6B7280]"}`}>
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-[#171717]">{layer.label}</span>
                  <span className="mt-1 block text-[10.5px] leading-4 text-[#6B7280]">{layer.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <BuilderChatPanel messages={messages} input={chatInput} onInputChange={onChatInputChange} onSubmit={onSendMessage} />
    </aside>
  );
}

function BuilderChatPanel({ messages, input, onInputChange, onSubmit }: { messages: BuilderChatMessage[]; input: string; onInputChange: (value: string) => void; onSubmit: () => void }) {
  return (
    <div className="border-t border-[#E5EAF0] bg-white p-3">
      <div className="mb-3 max-h-[132px] space-y-2 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div key={message.id} className={`rounded-[8px] px-3 py-2 text-[11px] leading-5 ${message.role === "user" ? "ml-5 bg-[#EEF7FC] text-[#1F2937]" : "mr-5 bg-[#F3F6F8] text-[#4B5563]"}`}>
            {message.content}
          </div>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex min-h-[88px] items-end gap-2 rounded-[8px] border border-[#D4DAE1] bg-[#F3F4F6] p-3 focus-within:border-[#9BD2FF]"
      >
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          rows={2}
          className="min-w-0 flex-1 resize-none bg-transparent text-[12px] leading-5 text-[#171717] outline-none placeholder:text-[#6B7280]"
          placeholder="Chat for building website from prompt"
        />
        <button type="submit" disabled={!input.trim()} aria-label="Send builder message" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#1497BC] text-white transition-all hover:bg-[#0F7898] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

function CodeWorkspace({
  files,
  activeFile,
  onSelectFile,
  onChangeFile,
}: {
  files: CodeBuilderFile[];
  activeFile: CodeBuilderFile;
  onSelectFile: (path: string) => void;
  onChangeFile: (content: string) => void;
}) {
  const lines = activeFile.content.split("\n");

  return (
    <section className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#CCD4DD] bg-[#F7F9FB] shadow-[0_12px_32px_rgba(31,43,77,0.08)]">
      <div className="flex min-h-[46px] items-center justify-between gap-3 border-b border-[#DDE3EA] bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[#EEF7FC] text-[#1DA1F2]">
            <Code2 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-[#171717]">{activeFile.path}</p>
            <p className="text-[10px] font-semibold uppercase text-[#8A94A3]">{activeFile.language}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#E5EAF0] bg-white px-2.5 text-[10px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717]">
            <RefreshCw className="h-3 w-3" />
            Format
          </button>
          <button className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#171717] px-2.5 text-[10px] font-semibold text-white transition-all hover:bg-[#2B2F34]">
            <CheckCircle2 className="h-3 w-3" />
            Apply
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[190px_minmax(0,1fr)]">
        <div className="border-b border-[#DDE3EA] bg-[#FBFCFD] p-2 xl:border-b-0 xl:border-r">
          <div className="flex gap-1 overflow-x-auto xl:block xl:space-y-1">
            {files.map((file) => {
              const active = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => onSelectFile(file.path)}
                  className={`flex min-w-[150px] items-center gap-2 rounded-[7px] px-2.5 py-2 text-left transition-all xl:w-full xl:min-w-0 ${active ? "bg-[#EEF7FC] text-[#171717]" : "text-[#6B7280] hover:bg-white hover:text-[#171717]"}`}
                >
                  <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${active ? "text-[#1DA1F2]" : "text-[#A1A7B0]"}`} />
                  <span className="min-w-0 truncate text-[11px] font-semibold">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid min-h-[360px] min-w-0 grid-cols-[44px_minmax(0,1fr)] bg-[#111318] font-mono text-[12px] leading-5">
          <div className="select-none border-r border-white/10 bg-[#0D0F13] px-2 py-3 text-right text-[#6F7782]">
            {lines.map((_, index) => (
              <div key={`${activeFile.path}-${index}`}>{index + 1}</div>
            ))}
          </div>
          <textarea
            value={activeFile.content}
            onChange={(event) => onChangeFile(event.target.value)}
            spellCheck={false}
            className="h-full min-h-[360px] w-full resize-none overflow-auto bg-[#111318] px-4 py-3 font-mono text-[12px] leading-5 text-[#DDE7F2] outline-none placeholder:text-[#6F7782]"
            aria-label={`Edit ${activeFile.path}`}
          />
        </div>
      </div>
    </section>
  );
}

function GeneratedPlanSummary({ plan, activeLayer }: { plan: CodeBuilderPlan; activeLayer?: CodeBuilderLayer }) {
  return (
    <section className="border-b border-[#DDE3EA] bg-[#F9FAFB] p-4">
      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Generated plan</p>
          <p className="mt-2 text-[13px] leading-5 text-[#171717]">{plan.summary}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PlanMetric label="Website type" value={plan.websiteType} />
          <PlanMetric label="Pages" value={plan.pages.join(", ")} />
        </div>
        <div className="rounded-[8px] border border-[#E5EAF0] bg-white p-3">
          <p className="text-[11px] font-semibold text-[#171717]">{activeLayer?.label ?? "Selected layer"}</p>
          <p className="mt-1 text-[10.5px] leading-4 text-[#6B7280]">{activeLayer?.description ?? plan.designDirection}</p>
        </div>
      </div>
    </section>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#E5EAF0] bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A3]">{label}</p>
      <p className="mt-1 truncate text-[11px] font-semibold text-[#171717]">{value}</p>
    </div>
  );
}

function PreviewCanvas({ plan, activeLayerId }: { plan: CodeBuilderPlan; activeLayerId: CodeBuilderLayer["id"] }) {
  return (
    <section className="h-full min-h-[420px] min-w-0 overflow-auto rounded-[8px] border border-[#CCD4DD] bg-[#D7DBDF] p-4 shadow-[0_12px_32px_rgba(31,43,77,0.08)]">
      <div className="mx-auto min-h-full w-full rounded-[8px] border border-[#C8D0D8] bg-[#D7DBDF] p-4">
        <div className="overflow-hidden rounded-[8px] border border-[#C8D0D8] bg-white shadow-[0_12px_30px_rgba(31,43,77,0.08)]">
          <PreviewNavbar plan={plan} active={activeLayerId === "header"} />
          <PreviewHero plan={plan} active={activeLayerId === "hero"} />
          <PreviewFeatureGrid plan={plan} active={activeLayerId === "features"} />
          {plan.layers.some((layer) => layer.id === "pricing") && <PreviewPricing active={activeLayerId === "pricing"} />}
          <PreviewTestimonials active={activeLayerId === "testimonials"} />
          <PreviewCta active={activeLayerId === "cta"} />
          <PreviewFooter plan={plan} active={activeLayerId === "footer"} />
        </div>
      </div>
    </section>
  );
}

function previewSectionClass(active: boolean, extra = "") {
  return `transition-all ${active ? "ring-2 ring-[#4A9BFF] ring-inset" : ""} ${extra}`;
}

function PreviewNavbar({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
  return (
    <div className={previewSectionClass(active, "flex items-center justify-between border-b border-[#E5EAF0] bg-white px-7 py-4")}>
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-[7px] bg-[#171717]" />
        <span className="text-[13px] font-semibold text-[#171717]">{plan.projectName}</span>
      </div>
      <div className="hidden items-center gap-5 text-[11px] font-semibold text-[#6B7280] sm:flex">
        {plan.pages.slice(0, 4).map((page) => <span key={page}>{page}</span>)}
      </div>
      <span className="rounded-[8px] bg-[#171717] px-3 py-2 text-[11px] font-semibold text-white">Start</span>
    </div>
  );
}

function PreviewHero({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
  return (
    <section className={previewSectionClass(active, "bg-[#727272] px-7 py-16 text-center")}>
      <p className="mx-auto max-w-md text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{plan.websiteType}</p>
      <h1 className="mx-auto mt-3 max-w-xl text-[34px] font-semibold leading-tight text-black">Website Building Template</h1>
      <p className="mx-auto mt-4 max-w-lg text-[13px] leading-6 text-black/70">{plan.designDirection}</p>
      <div className="mt-7 flex justify-center gap-2">
        <span className="rounded-[8px] bg-black px-4 py-2 text-[12px] font-semibold text-white">Launch preview</span>
        <span className="rounded-[8px] border border-black/20 bg-white/60 px-4 py-2 text-[12px] font-semibold text-black">View plan</span>
      </div>
    </section>
  );
}

function PreviewFeatureGrid({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
  const cards = plan.layers.slice(0, 3);
  return (
    <section className={previewSectionClass(active, "bg-[#666666] px-7 py-8")}>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((layer) => (
          <div key={layer.id} className="min-h-[132px] rounded-[8px] bg-[#D9D9D9] p-4">
            <p className="text-[12px] font-semibold text-[#171717]">{layer.canvasLabel}</p>
            <p className="mt-3 text-[11px] leading-5 text-[#4B5563]">{layer.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewPricing({ active }: { active: boolean }) {
  return (
    <section className={previewSectionClass(active, "bg-[#F2F4F6] px-7 py-9")}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h3 className="text-[20px] font-semibold text-[#171717]">Pricing Section</h3>
        <span className="text-[11px] font-semibold text-[#6B7280]">3 plans</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["Starter", "Growth", "Scale"].map((tier) => (
          <div key={tier} className="rounded-[8px] border border-[#E5EAF0] bg-white p-4">
            <p className="text-[12px] font-semibold text-[#171717]">{tier}</p>
            <div className="mt-4 h-2 w-20 rounded-full bg-[#D9D9D9]" />
            <div className="mt-2 h-2 w-28 rounded-full bg-[#E5EAF0]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewTestimonials({ active }: { active: boolean }) {
  return (
    <section className={previewSectionClass(active, "bg-white px-7 py-9")}>
      <h3 className="text-[20px] font-semibold text-[#171717]">Testimonials</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-[8px] border border-[#E5EAF0] bg-[#FCFDFE] p-4">
            <div className="h-2 w-24 rounded-full bg-[#D9D9D9]" />
            <div className="mt-3 h-2 w-full rounded-full bg-[#E5EAF0]" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-[#E5EAF0]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewCta({ active }: { active: boolean }) {
  return (
    <section className={previewSectionClass(active, "bg-[#D9D9D9] px-7 py-10 text-center")}>
      <h3 className="text-[24px] font-semibold text-[#171717]">CTA Area</h3>
      <p className="mx-auto mt-3 max-w-md text-[12px] leading-5 text-[#4B5563]">Final conversion section generated from the website plan.</p>
    </section>
  );
}

function PreviewFooter({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
  return (
    <footer className={previewSectionClass(active, "flex flex-wrap items-center justify-between gap-3 bg-[#171717] px-7 py-5 text-white")}>
      <span className="text-[12px] font-semibold">{plan.projectName}</span>
      <span className="text-[11px] text-white/60">{plan.pages.join(" / ")}</span>
    </footer>
  );
}

function BlenderPage() {
  const { openModal, showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="Blender 3D" subtitle="Generate, import, and organize 3D production assets." action={<PrimaryButton icon={Box} onClick={() => showToast("New Blender task prepared")}>New 3D task</PrimaryButton>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <button onClick={() => openModal("asset-upload")} className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAECEF] bg-[#FCFDFE] p-4 text-center shadow-[0_10px_24px_rgba(31,43,77,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#CFE8F8] active:scale-[0.99]">
          <Layers3 className="h-8 w-8 text-[#1DA1F2]" />
          <p className="mt-3 text-[13px] font-semibold text-[#171717]">Upload asset or model</p>
          <p className="mt-1 text-[11px] text-[#6B7280]">OBJ, FBX, GLB, and blend files can be staged here.</p>
        </button>
        <SoftCard>
          <label className="text-[12px] font-semibold text-[#171717]">Generation prompt</label>
          <textarea className="mt-3 min-h-[116px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Describe the model, material, lighting, or scene..." />
          <PrimaryButton icon={Sparkles} onClick={() => showToast("Blender generation prepared")}>Prepare generation</PrimaryButton>
        </SoftCard>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {["Material study", "Product scene", "Workspace lab", "Character base"].map((name) => (
          <ClickableSoftCard key={name} className="min-h-[120px]" onClick={() => showToast(`${name} asset opened`)} ariaLabel={`Open ${name}`}>
            <div className="mb-3 h-14 rounded-xl bg-[#EEF7FC]" />
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
  );
}

function AssetLibraryPage() {
  const { showToast } = useStudioActions();
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | AssetType>("all");
  const [sortMode, setSortMode] = useState<"recent" | "oldest" | "az" | "za" | "largest" | "smallest">("recent");
  const [selectedAsset, setSelectedAsset] = useState<StudioAsset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 25 * 1024 * 1024;

  useEffect(() => {
    setAssets(assetRepository.list());
    setIsLoading(false);
  }, []);

  const persistAssets = useCallback((nextAssets: StudioAsset[]) => {
    setAssets(nextAssets);
    assetRepository.saveAll(nextAssets);
  }, []);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return assets
      .filter((asset) => {
        const matchesType = typeFilter === "all" || asset.type === typeFilter;
        const matchesQuery =
          !normalizedQuery ||
          [asset.name, asset.type, asset.filename, ...asset.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        if (sortMode === "oldest") return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        if (sortMode === "az") return a.name.localeCompare(b.name);
        if (sortMode === "za") return b.name.localeCompare(a.name);
        if (sortMode === "largest") return b.size - a.size;
        if (sortMode === "smallest") return a.size - b.size;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [assets, searchQuery, sortMode, typeFilter]);

  const handleFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const accepted: StudioAsset[] = [];
    let error: string | null = null;

    files.forEach((file) => {
      if (file.size > maxFileSize) {
        error = `${file.name} is larger than 25 MB.`;
        return;
      }
      const detectedType = detectAssetType(file);
      if (!detectedType) {
        error = `${file.name} is not a supported asset type.`;
        return;
      }
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : URL.createObjectURL(file);
      accepted.push(assetRepository.fromFile(file, detectedType, previewUrl));
    });

    if (accepted.length > 0) {
      persistAssets([...accepted, ...assets]);
      setUploadError(null);
      showToast(`${accepted.length} asset${accepted.length > 1 ? "s" : ""} uploaded`);
    }
    if (error) {
      setUploadError(error);
      showToast(error);
    }
  };

  const updateAsset = (updated: StudioAsset) => {
    const next = assets.map((asset) => (asset.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : asset));
    persistAssets(next);
    setSelectedAsset(next.find((asset) => asset.id === updated.id) ?? null);
  };

  const deleteAsset = (assetId: string) => {
    persistAssets(assets.filter((asset) => asset.id !== assetId));
    setSelectedAsset(null);
    showToast("Asset deleted");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortMode("recent");
  };
  const showCategoryShortcuts = assets.length === 0 && !searchQuery && typeFilter === "all";

  return (
    <div>
      <PageHeader title="Asset Library" subtitle="Search, filter, and upload creative assets." action={<PrimaryButton icon={Upload} onClick={() => fileInputRef.current?.click()}>Upload asset</PrimaryButton>} />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleFiles(event.target.files);
          event.target.value = "";
        }}
        aria-label="Upload assets"
      />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`mb-5 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row ${isDragging ? "border-[#9BD2FF] bg-[#EEF7FF]" : "border-[#EAECEF] bg-[#FCFDFE]"}`}
      >
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]"
            placeholder="Search assets..."
            aria-label="Search assets"
          />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | AssetType)} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] outline-none">
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="vector">Vectors</option>
          <option value="model">Models</option>
          <option value="document">Documents</option>
          <option value="texture">Textures</option>
          <option value="reference">References</option>
          <option value="export">Exports</option>
          <option value="audio">Audio</option>
        </select>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] outline-none">
          <option value="recent">Recent first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">Name A-Z</option>
          <option value="za">Name Z-A</option>
          <option value="largest">Largest first</option>
          <option value="smallest">Smallest first</option>
        </select>
      </div>
      {uploadError && (
        <div className="mb-4 rounded-2xl border border-[#FFD7DF] bg-[#FFF7F9] px-4 py-3 text-[12px] font-semibold text-[#D92D52]">{uploadError}</div>
      )}
      {isLoading && <StudioInlineState icon={RefreshCw} title="Loading assets" text="Reading saved asset metadata from this browser." />}
      {!isLoading && showCategoryShortcuts && (
        <div className="grid gap-3 md:grid-cols-4">
          {assetTypeOptions.map((category) => {
            const Icon = category.icon;
            return (
              <ClickableSoftCard key={category.type} onClick={() => setTypeFilter(category.type)} ariaLabel={`Filter ${category.label} assets`}>
                <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-[12px] font-semibold text-[#171717]">{category.label} asset</p>
                <p className="mt-1 text-[10px] text-[#6B7280]">Upload or filter this category</p>
              </ClickableSoftCard>
            );
          })}
        </div>
      )}
      {!isLoading && !showCategoryShortcuts && filteredAssets.length === 0 && (
        <StudioInlineState icon={Search} title="No assets found" text="No uploaded assets match the current search or filters." />
      )}
      {!isLoading && filteredAssets.length > 0 && (
        <div className="grid gap-3 md:grid-cols-4">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onOpen={() => setSelectedAsset(asset)} />
          ))}
        </div>
      )}
      {!isLoading && !showCategoryShortcuts && filteredAssets.length === 0 && (
        <button onClick={resetFilters} className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] shadow-sm transition-all hover:border-[#CFE8F8]">Reset filters</button>
      )}
      {selectedAsset && (
        <AssetDetailDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={updateAsset}
          onDelete={() => deleteAsset(selectedAsset.id)}
        />
      )}
    </div>
  );
}

const assetTypeOptions: Array<{ type: AssetType; label: string; icon: LucideIcon }> = [
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "vector", label: "Vector", icon: PenLine },
  { type: "model", label: "Model", icon: Box },
  { type: "document", label: "Document", icon: FileText },
  { type: "texture", label: "Texture", icon: Layers3 },
  { type: "reference", label: "Reference", icon: Paperclip },
  { type: "export", label: "Export", icon: Upload },
  { type: "audio", label: "Audio", icon: MessageCircle },
];

function assetTypeLabel(type: AssetType) {
  return assetTypeOptions.find((option) => option.type === type)?.label ?? type;
}

function AssetCard({ asset, onOpen }: { asset: StudioAsset; onOpen: () => void }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  const Icon = assetTypeOptions.find((option) => option.type === asset.type)?.icon ?? FileText;
  const isImagePreview = asset.type === "image" || asset.type === "vector";

  return (
    <ClickableSoftCard onClick={onOpen} ariaLabel={`Open ${asset.name}`}>
      <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
        {isImagePreview && asset.previewUrl ? (
          <img src={asset.previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </div>
      <p className={`truncate text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{asset.name}</p>
      <p className={`mt-1 text-[10px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{assetTypeLabel(asset.type)} - {formatFileSize(asset.size)}</p>
    </ClickableSoftCard>
  );
}

function AssetDetailDrawer({
  asset,
  onClose,
  onUpdate,
  onDelete,
}: {
  asset: StudioAsset;
  onClose: () => void;
  onUpdate: (asset: StudioAsset) => void;
  onDelete: () => void;
}) {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const [name, setName] = useState(asset.name);
  const Icon = assetTypeOptions.find((option) => option.type === asset.type)?.icon ?? FileText;
  const canOpen = Boolean(asset.previewUrl);

  useEffect(() => {
    setName(asset.name);
  }, [asset.id, asset.name]);

  const openAsset = () => {
    if (!asset.previewUrl) {
      showToast("This asset has metadata only in local storage.");
      return;
    }
    window.open(asset.previewUrl, "_blank", "noopener,noreferrer");
  };

  const copyAssetId = async () => {
    try {
      await navigator.clipboard.writeText(asset.id);
      showToast("Asset id copied");
    } catch {
      showToast("Could not copy asset id");
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ? "bg-black/35" : "bg-[#1F2937]/20"}`} onMouseDown={onClose}>
      <aside className={`h-full w-full max-w-md overflow-y-auto border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Asset details</h2>
            <p className={`mt-2 text-[12px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{assetTypeLabel(asset.type)} - {asset.status}</p>
          </div>
          <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close asset details">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-[#EEF7FC] text-[#1DA1F2]">
            {(asset.type === "image" || asset.type === "vector") && asset.previewUrl ? (
              <img src={asset.previewUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <Icon className="h-10 w-10" />
            )}
          </div>
          <div>
            <label className={`text-[11px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Asset name</label>
            <div className="mt-2 flex gap-2">
              <input value={name} onChange={(event) => setName(event.target.value)} className={`h-10 min-w-0 flex-1 rounded-xl border px-3 text-[12px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]" : "border-[#E5EAF0] bg-white text-[#171717]"}`} />
              <button onClick={() => name.trim() && onUpdate({ ...asset, name: name.trim() })} className="rounded-xl bg-[#4A9BFF] px-3 text-[11px] font-semibold text-white">Save</button>
            </div>
          </div>
          <DetailRows
            rows={[
              ["File", asset.filename],
              ["Type", assetTypeLabel(asset.type)],
              ["Size", formatFileSize(asset.size)],
              ["Uploaded", formatStudioDate(asset.createdAt)],
              ["MIME", asset.mimeType],
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={openAsset} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">{canOpen ? "Open" : "Preview unavailable"}</button>
            {asset.previewUrl ? (
              <a href={asset.previewUrl} download={asset.filename} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-center text-[11px] font-semibold text-[#4B5563]">Download</a>
            ) : (
              <button onClick={() => showToast("Binary file is not persisted without backend storage")} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">Download</button>
            )}
            <button onClick={copyAssetId} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">Copy id</button>
            <button onClick={onDelete} className="rounded-xl border border-[#FFD7DF] px-3 py-2 text-[11px] font-semibold text-[#D92D52]">Delete</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
  dark,
}: {
  mode: "agent" | "workflow";
  onChange: (next: "agent" | "workflow") => void;
  dark: boolean;
}) {
  const containerClass = dark
    ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
    : "border-[#E5E7EB] bg-white shadow-[0_10px_24px_rgba(31,43,77,0.06)]";
  const inactiveClass = dark
    ? "text-[#A8B0BA] hover:text-[#F4F6F8]"
    : "text-[#4B5563] hover:text-[#171717]";
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border p-1 ${containerClass}`} role="tablist" aria-label="Build mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "agent"}
        onClick={() => onChange("agent")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-all active:scale-[0.98] ${
          mode === "agent"
            ? "bg-[#1D9BF0] text-white shadow-[0_8px_20px_rgba(29,155,240,0.32)]"
            : inactiveClass
        }`}
      >
        <CircleSlash className="h-3.5 w-3.5" />
        Agent
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "workflow"}
        onClick={() => onChange("workflow")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-all active:scale-[0.98] ${
          mode === "workflow"
            ? "bg-[#1D9BF0] text-white shadow-[0_8px_20px_rgba(29,155,240,0.32)]"
            : inactiveClass
        }`}
      >
        <Network className="h-3.5 w-3.5" />
        Workflow
      </button>
    </div>
  );
}

type StarterCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  prompt: string;
};

const agentStarters: StarterCard[] = [
  {
    title: "Create workflow",
    description: "Powerful automations speed up your processes with ease and security in mind.",
    icon: Workflow,
    prompt: "Help me create a workflow that ",
  },
  {
    title: "Create autonomous agent",
    description: "Intelligent agent that can handle basic requests and approvals.",
    icon: Bot,
    prompt: "Build an autonomous agent that ",
  },
  {
    title: "Computer-using agent",
    description: "Let agents accomplish even more across apps and websites.",
    icon: Monitor,
    prompt: "Set up a computer-using agent that ",
  },
];

const workflowStarters: StarterCard[] = [
  {
    title: "Blank workflow",
    description: "Start from scratch and design every step of your automation.",
    icon: Workflow,
    prompt: "Design a blank workflow that ",
  },
  {
    title: "Scheduled run",
    description: "Trigger workflows on a cron-style schedule with built-in retries.",
    icon: RefreshCw,
    prompt: "Create a scheduled workflow that ",
  },
  {
    title: "Connect apps",
    description: "Move data between tools with secure connectors and approvals.",
    icon: Plug,
    prompt: "Connect two apps with a workflow that ",
  },
];

function StarterPanel({
  mode,
  dark,
  onOpen,
}: {
  mode: "agent" | "workflow";
  dark: boolean;
  onOpen: (card: StarterCard) => void;
}) {
  const cards = mode === "agent" ? agentStarters : workflowStarters;
  const heading = mode === "agent" ? "Start building from scratch" : "Start a new workflow";
  const cardBase = dark
    ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:border-[rgba(59,167,255,0.24)] hover:bg-[#23262C] hover:shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
    : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.035)] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]";

  return (
    <div className="w-full text-left">
      <p className={`mb-3 text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{heading}</p>
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => onOpen(card)}
              className={`group flex min-h-[88px] items-start gap-3 rounded-[14px] border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${cardBase}`}
            >
              <span className={`flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[8px] transition-colors ${dark ? "bg-[rgba(59,167,255,0.18)] text-[#7DD3FC] group-hover:bg-[#1D9BF0] group-hover:text-white" : "bg-[#DDE3FF] text-[#1D9BF0] group-hover:bg-[#1D9BF0] group-hover:text-white"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[14px] font-semibold leading-[1.12] tracking-[-0.02em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>
                  {card.title}
                </span>
                <span className={`mt-1.5 block text-[10.5px] leading-3.5 ${dark ? "text-[#A8B0BA]" : "text-[#30343A]"}`}>
                  {card.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CardDetailView({
  card,
  dark,
  onBack,
  onLaunch,
}: {
  card: StarterCard;
  dark: boolean;
  onBack: () => void;
  onLaunch: (prompt: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<"manual" | "scheduled" | "event">("manual");
  const [schedule, setSchedule] = useState("daily");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [runMode, setRunMode] = useState<"interactive" | "headless">("interactive");
  const [sourceApp, setSourceApp] = useState("");
  const [destApp, setDestApp] = useState("");

  const Icon = card.icon;

  const buildPrompt = () => {
    switch (card.title) {
      case "Create workflow":
        return `Help me create a workflow named "${name || "My Workflow"}" that ${description || "automates a business process"}. Trigger type: ${trigger}.`;
      case "Create autonomous agent":
        return `Build an autonomous agent named "${name || "My Agent"}" to ${description || "handle tasks automatically"}. Capabilities: ${capabilities.length ? capabilities.join(", ") : "general purpose"}.`;
      case "Computer-using agent":
        return `Set up a computer-using agent to control "${target || "a web app"}". Task: ${description || "perform automated actions"}. Run mode: ${runMode}.`;
      case "Blank workflow":
        return `Design a blank workflow named "${name || "My Workflow"}"${description ? ` for: ${description}` : ""}. I will define each step myself.`;
      case "Scheduled run":
        return `Create a scheduled workflow named "${name || "My Schedule"}" that runs ${schedule} and performs: ${description || "a recurring task"}.`;
      case "Connect apps":
        return `Connect ${sourceApp || "App A"} to ${destApp || "App B"} and transfer or sync: ${description || "relevant data between them"}.`;
      default:
        return `${card.prompt} ${description}`.trim();
    }
  };

  const containerClass = dark
    ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
    : "border-[#E5E7EB] bg-white shadow-[0_18px_42px_rgba(31,43,77,0.06)]";
  const labelClass = `mb-1.5 block text-[11px] font-semibold ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`;
  const inputClass = `h-10 w-full rounded-xl border px-3 text-[12px] outline-none transition-colors ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#4B5563] focus:border-[#3BA7FF]" : "border-[#E5EAF0] bg-[#FAFBFC] text-[#171717] placeholder:text-[#A1A7B0] focus:border-[#4A9BFF]"}`;
  const textareaClass = `w-full resize-none rounded-xl border px-3 py-2.5 text-[12px] outline-none transition-colors ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#4B5563] focus:border-[#3BA7FF]" : "border-[#E5EAF0] bg-[#FAFBFC] text-[#171717] placeholder:text-[#A1A7B0] focus:border-[#4A9BFF]"}`;
  const chipBase = (active: boolean) =>
    `h-7 rounded-full px-3 text-[11px] font-medium transition-all ${active ? "bg-[#1D9BF0] text-white shadow-[0_4px_12px_rgba(29,155,240,0.28)]" : dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]" : "border border-[#E5EAF0] bg-[#FAFBFC] text-[#4B5563] hover:border-[#CFE8F8]"}`;

  const renderFields = () => {
    switch (card.title) {
      case "Create workflow":
        return (
          <>
            <div>
              <label className={labelClass}>Workflow name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>What should this workflow do?</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this workflow automates..." rows={3} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Trigger type</label>
              <div className="flex gap-2">
                {(["manual", "scheduled", "event"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTrigger(t)} className={chipBase(trigger === t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case "Create autonomous agent":
        return (
          <>
            <div>
              <label className={labelClass}>Agent name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agent" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>What goal should this agent accomplish?</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the agent's goal and tasks..." rows={3} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Capabilities</label>
              <div className="flex flex-wrap gap-2">
                {["Web browsing", "Code execution", "File management", "API calls", "Email"].map((cap) => {
                  const active = capabilities.includes(cap);
                  return (
                    <button key={cap} type="button" onClick={() => setCapabilities((prev) => active ? prev.filter((c) => c !== cap) : [...prev, cap])} className={chipBase(active)}>
                      {cap}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );

      case "Computer-using agent":
        return (
          <>
            <div>
              <label className={labelClass}>Target app or URL</label>
              <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://example.com or app name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Task description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what the agent should do on this app..." rows={3} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Run mode</label>
              <div className="flex gap-2">
                {(["interactive", "headless"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setRunMode(m)} className={chipBase(runMode === m)}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case "Blank workflow":
        return (
          <>
            <div>
              <label className={labelClass}>Workflow name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this workflow do?" rows={3} className={textareaClass} />
            </div>
          </>
        );

      case "Scheduled run":
        return (
          <>
            <div>
              <label className={labelClass}>Workflow name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Schedule" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Run frequency</label>
              <div className="flex flex-wrap gap-2">
                {["Hourly", "Daily", "Weekly", "Monthly", "Custom"].map((s) => (
                  <button key={s} type="button" onClick={() => setSchedule(s.toLowerCase())} className={chipBase(schedule === s.toLowerCase())}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>What should run?</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task to run on schedule..." rows={3} className={textareaClass} />
            </div>
          </>
        );

      case "Connect apps":
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Source app</label>
                <input value={sourceApp} onChange={(e) => setSourceApp(e.target.value)} placeholder="e.g. Slack, Gmail" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Destination app</label>
                <input value={destApp} onChange={(e) => setDestApp(e.target.value)} placeholder="e.g. Notion, Sheets" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>What data should move?</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what data to sync or transform..." rows={3} className={textareaClass} />
            </div>
          </>
        );

      default:
        return (
          <div>
            <label className={labelClass}>Describe your goal</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you want to accomplish?" rows={4} className={textareaClass} />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onBack}
        className={`mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors ${dark ? "text-[#A8B0BA] hover:text-[#F4F6F8]" : "text-[#6B7280] hover:text-[#171717]"}`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>
      <div className={`w-full rounded-3xl border p-5 ${containerClass}`}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#DDEEFF] text-[#1D9BF0]">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className={`text-[14px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{card.title}</p>
            <p className={`text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{card.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {renderFields()}
          <button
            type="button"
            onClick={() => onLaunch(buildPrompt())}
            className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1D9BF0] text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(29,155,240,0.28)] transition-all hover:bg-[#1A8CD8] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Launch with AI
          </button>
        </div>
      </div>
    </div>
  );
}

function AIAssistantPage() {
  const { theme } = useStudioTheme();
  const { openModal, showToast, isTemporaryChat, temporaryChatId, newChatId, endTemporaryChat } = useStudioActions();
  const dark = theme === "dark";
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "like" | "dislike">>({});
  const [aiProviderLabel, setAiProviderLabel] = useState("Checking AI provider");
  const [aiChatCount, setAiChatCount] = useState<number>(0);
  const [planNoticeDismissed, setPlanNoticeDismissed] = useState<boolean>(false);
  const [assistantMode, setAssistantMode] = useState<"agent" | "workflow">("agent");
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const hasConversation = messages.length > 0;
  const showPlanEndingNotice = aiChatCount >= 3 && !planNoticeDismissed;

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = Number(window.localStorage.getItem("Cedium-ai-chat-count") || "0");
    if (Number.isFinite(stored) && stored > 0) setAiChatCount(stored);
    const dismissed = window.localStorage.getItem("Cedium-ai-plan-notice-dismissed");
    if (dismissed === "1") setPlanNoticeDismissed(true);
  }, []);

  useEffect(() => {
    if (!temporaryChatId) return;
    setMessages([]);
    setInput("");
    setAttachments([]);
    setMessageFeedback({});
    setIsSending(false);
  }, [temporaryChatId]);

  useEffect(() => {
    if (!newChatId) return;
    setMessages([]);
    setInput("");
    setAttachments([]);
    setMessageFeedback({});
    setIsSending(false);
  }, [newChatId]);

  useEffect(() => {
    let isMounted = true;

    const loadAIStatus = async () => {
      try {
        const response = await fetch("/api/ai-chat", { cache: "no-store" });
        const data = (await response.json()) as { provider?: string; model?: string; configured?: boolean };
        if (!isMounted) return;

        const providerName =
          data.provider === "openai"
            ? "OpenAI"
            : data.provider === "gemini"
              ? "Gemini"
              : "local fallback";
        const modelName = typeof data.model === "string" && data.model ? ` (${data.model})` : "";
        setAiProviderLabel(
          data.configured
            ? `Connected to ${providerName}${modelName} via /api/ai-chat`
            : "Using local fallback via /api/ai-chat. Add OPENAI_API_KEY or GEMINI_API_KEY for live AI.",
        );
      } catch {
        if (isMounted) setAiProviderLabel("AI provider status unavailable");
      }
    };

    void loadAIStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const closeTemporaryChat = () => {
    setMessages([]);
    setInput("");
    setAttachments([]);
    setMessageFeedback({});
    setIsSending(false);
    endTemporaryChat();
  };

  const onFiles = (event: ChangeEvent<HTMLInputElement>, kind: Attachment["kind"]) => {
    const files = Array.from(event.target.files ?? []);
    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${kind}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        kind,
      })),
    ]);
    if (files.length) showToast(`${files.length} ${kind} attachment${files.length > 1 ? "s" : ""} added`);
    event.target.value = "";
  };

  const sendPrompt = async (promptOverride?: string) => {
    const prompt = (promptOverride !== undefined ? promptOverride : input).trim();
    if (!prompt) {
      showToast("Write a prompt before sending");
      return;
    }

    const conversationHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: prompt },
    ]);
    if (promptOverride === undefined) setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          conversationHistory,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to get response");
      }

      const answerText =
        typeof data?.content === "string"
          ? data.content
          : typeof data?.answer === "string"
            ? data.answer
            : "No response received.";

      const isFallback = data?.provider === "local" && data?.fallbackFrom;
      const finalContent = answerText;

      if (isFallback) {
        setAiProviderLabel(`${String(data.fallbackFrom).toUpperCase()} fallback active. Using local assistant.`);
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: finalContent,
        },
      ]);
      setAiChatCount((current) => {
        const next = current + 1;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("Cedium-ai-chat-count", String(next));
        }
        return next;
      });
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "I couldn't complete that request. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const copyAssistantMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast("Response copied");
    } catch {
      showToast("Copy failed");
    }
  };

  const shareAssistantMessage = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Cedium AI response", text: content });
        showToast("Response shared");
        return;
      }
      await navigator.clipboard.writeText(content);
      showToast("Share unavailable. Response copied");
    } catch {
      showToast("Share cancelled");
    }
  };

  const downloadAssistantMessage = (message: { id: string; content: string }) => {
    const blob = new Blob([message.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cedium-ai-response-${message.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Response downloaded");
  };

  const regenerateAssistantMessage = async (messageId: string) => {
    if (isSending) return;

    const assistantIndex = messages.findIndex((message) => message.id === messageId);
    const promptIndex = messages
      .slice(0, assistantIndex)
      .map((message, index) => ({ message, index }))
      .reverse()
      .find((item) => item.message.role === "user")?.index;

    if (assistantIndex < 0 || promptIndex === undefined) {
      showToast("No prompt found to regenerate");
      return;
    }

    const promptMessage = messages[promptIndex];
    const conversationHistory = messages.slice(0, promptIndex).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setIsSending(true);
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage.content,
          conversationHistory,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to regenerate response");

      const nextContent =
        typeof data?.content === "string"
          ? data.content
          : typeof data?.answer === "string"
            ? data.answer
            : "No response received.";

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, content: nextContent } : message,
        ),
      );
      showToast("Response regenerated");
    } catch (error) {
      console.error("AI Assistant regenerate error:", error);
      showToast("Regenerate failed");
    } finally {
      setIsSending(false);
    }
  };

  const assistantChips = [
    { label: "Summary", icon: CircleSlash },
    { label: "Code", icon: Code2 },
    { label: "Design", icon: PenLine },
    { label: "Research", icon: Network },
  ];

  const dismissPlanNotice = () => {
    setPlanNoticeDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("Cedium-ai-plan-notice-dismissed", "1");
    }
  };

  const compactComposer = (
    <div className="w-full">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-2">
          {attachments.map((attachment) => (
            <span key={attachment.id} className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-medium ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm"}`}>
              <span className="truncate">{attachment.name}</span>
              <button
                onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                className={`rounded-full ${dark ? "text-[#6F7782] hover:text-[#F4F6F8]" : "text-[#9CA3AF] hover:text-[#171717]"}`}
                aria-label={`Remove ${attachment.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={`flex min-h-[82px] w-full items-center gap-3 rounded-[30px] border px-3 py-3 ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#202328]" : "border-[#D9D9D9] bg-white shadow-[0_12px_30px_rgba(31,43,77,0.05)]"}`}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-[20px] transition-colors ${dark ? "bg-[#181B20] text-[#DDE3EA] hover:bg-[#252A31]" : "bg-[#F0F0F0] text-[#4B5563] hover:bg-[#E7E7E7]"}`}
          aria-label="Attach file"
          title="Attach file"
        >
          <Plus className="h-6 w-6" strokeWidth={1.8} />
        </button>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendPrompt();
            }
          }}
          aria-label="Message Cedium"
          rows={1}
          className={`min-h-[42px] flex-1 resize-none bg-transparent px-2 py-3 text-[15px] leading-5 outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "text-[#171717] placeholder:text-[#A1A1A1]"}`}
          style={{ letterSpacing: 0 }}
        />
        <button
          type="button"
          className={`flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-[20px] transition-colors ${dark ? "bg-[#181B20] text-[#F4F6F8] hover:bg-[#252A31]" : "bg-[#F0F0F0] text-[#171717] hover:bg-[#E7E7E7]"}`}
          aria-label="Voice input"
          title="Voice input"
        >
          <Mic className="h-6 w-6" strokeWidth={2} />
        </button>
        <button
          onClick={() => void sendPrompt()}
          disabled={isSending || !input.trim()}
          aria-label="Send prompt"
          className="flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-[20px] bg-[#1292E8] text-white transition-colors hover:bg-[#0F83D2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
        <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
      </div>
    </div>
  );

  const composer = hasConversation ? compactComposer : (
    <div className="w-full">
      {showPlanEndingNotice && (
        <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-6 py-3 text-[12px] ${dark ? "border-[rgba(255,170,0,0.32)] bg-[rgba(255,170,0,0.08)] text-[#F4F6F8]" : "border-[#FCD7A1] bg-[#FFF8EC] text-[#171717]"}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ? "bg-[rgba(255,170,0,0.16)] text-[#FFB454]" : "bg-[#FFEBC9] text-[#B7791F]"}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">Your free plan is wrapping up</p>
              <p className={`mt-0.5 text-[11px] leading-5 ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>
                You have used Cedium AI {aiChatCount} {aiChatCount === 1 ? "time" : "times"} on your free trial. Upgrade to keep your chats, attachments, and Voice Speak going without interruption.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openModal("upgrade")}
              className="inline-flex h-9 items-center rounded-xl bg-[#1292E8] px-4 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(18,146,232,0.32)] transition-colors hover:bg-[#0F83D2]"
            >
              Upgrade Now
            </button>
            <button
              type="button"
              onClick={dismissPlanNotice}
              aria-label="Dismiss free plan notice"
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "text-[#9CA3AF] hover:bg-white hover:text-[#171717]"}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className={`relative w-full overflow-hidden rounded-2xl border text-left ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#DCDCDC] bg-white shadow-[0_14px_34px_rgba(31,43,77,0.05)]"}`}>
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#181B20] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.36)] hover:bg-[rgba(59,167,255,0.16)] hover:text-[#7DD3FC]" : "border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm hover:border-[#9BD2FF] hover:bg-[#DDEEFF] hover:text-[#1D9BF0]"}`}
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#181B20] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.36)] hover:bg-[rgba(59,167,255,0.16)] hover:text-[#7DD3FC]" : "border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm hover:border-[#9BD2FF] hover:bg-[#DDEEFF] hover:text-[#1D9BF0]"}`}
            aria-label="Voice input"
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex min-h-[166px] flex-col px-8 pb-4 pt-6">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendPrompt();
              }
            }}
            placeholder="What do you want me to help you with?"
            rows={2}
            className={`min-h-[70px] min-w-0 flex-1 resize-none bg-transparent pr-24 text-[14px] font-semibold leading-5 outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "placeholder:text-[#C7C7C7]"}`}
            style={{ color: dark ? "#F4F6F8" : "#171717", letterSpacing: 0 }}
          />
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <span key={attachment.id} className={`inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-medium ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5E7EB] bg-[#F8FAFC] text-[#4B5563]"}`}>
                  <span className="truncate">{attachment.name}</span>
                  <button
                    onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                    className={`rounded-full ${dark ? "text-[#6F7782] hover:text-[#F4F6F8]" : "text-[#9CA3AF] hover:text-[#171717]"}`}
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className={`mt-auto flex items-center gap-2 pt-2 max-sm:flex-wrap ${dark ? "text-[#A8B0BA]" : "text-[#4B463E]"}`}>
            <button
              type="button"
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-colors ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#DDE3EA] hover:border-[rgba(59,167,255,0.28)]" : "border-[#D8D8D8] bg-white text-[#A1A1A1] hover:border-[#CACACA]"}`}
            >
              Codex Plus 5.5
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
            <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
            <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
            <button
              onClick={() => void sendPrompt()}
              disabled={isSending}
              aria-label="Send prompt"
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1292E8] text-white transition-colors hover:bg-[#0F83D2] disabled:opacity-70"
            >
              {isSending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {assistantChips.map((item) => {
          const Icon = item.icon;
          return (
              <button
                key={item.label}
                type="button"
              className={`inline-flex h-10 min-w-[128px] items-center justify-center gap-2 rounded-2xl border px-4 text-[13px] font-bold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.28)]" : "border-[#DCDCDC] bg-white text-[#AAAAAA] shadow-[0_6px_14px_rgba(31,43,77,0.03)] hover:border-[#D1D5DB]"}`}
              >
              <Icon className="h-4 w-4" />
                {item.label}
              </button>
          );
        })}
      </div>
    </div>
  );

  const temporaryChatNotice = isTemporaryChat ? (
    <div className="flex w-full justify-center">
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]" : "border-[#E5EAF0] bg-[#F6F8FB] text-[#4B5563]"}`}>
        <Ghost className={`h-3.5 w-3.5 ${dark ? "text-[#7DD3FC]" : "text-[#1D9BF0]"}`} strokeWidth={2} />
        <span className={`font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Temporary chat</span>
        <span className="hidden sm:inline">— this conversation won&apos;t be saved.</span>
        <button
          type="button"
          onClick={closeTemporaryChat}
          className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${dark ? "bg-[rgba(255,255,255,0.06)] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#F4F6F8]" : "bg-white text-[#4B5563] shadow-sm hover:text-[#171717]"}`}
        >
          End
        </button>
      </div>
    </div>
  ) : null;

  if (!hasConversation) {
    return (
      <div className={`flex min-h-full items-start justify-center px-0 pb-2 pt-[138px] max-xl:pt-[108px] max-sm:pt-8 ${dark ? "bg-transparent" : "bg-white"}`}>
        <div className="flex w-full max-w-[700px] flex-col">
          <div className="flex flex-col items-center text-center">
            <h2 className={`text-[28px] font-medium leading-tight tracking-[0] max-sm:text-[23px] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>
              Good Morning, Toby
            </h2>
            <p className={`mt-1 text-[25px] font-medium leading-tight tracking-[0] max-sm:text-[20px] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>
              How Can I <span className="text-[#1DA1F2]">Assist You Today?</span>
            </p>
          </div>

          {temporaryChatNotice && <div className="mt-5 w-full">{temporaryChatNotice}</div>}

          <div className="mt-7 flex w-full justify-center">
            <ModeToggle mode={assistantMode} onChange={setAssistantMode} dark={dark} />
          </div>

          <div className="mt-5 w-full">
            <StarterPanel
              mode={assistantMode}
              dark={dark}
              onOpen={(card) => setInput(card.prompt)}
            />
          </div>

          <div className="mt-4 w-full">{composer}</div>

          <div className={`mt-5 text-center text-[10px] ${dark ? "text-[#6F7782]" : "text-[#B4A99A]"}`}>
            {aiProviderLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1080px] flex-col px-4">
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        role="log"
        aria-label="AI assistant conversation"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={isSending}
      >
        <div className="flex min-h-full flex-col justify-start gap-5 pb-4 pt-8">
          {temporaryChatNotice}
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_12px_26px_rgba(29,161,242,0.28)]">
                  <Sparkles className="h-4 w-4 fill-current" />
                </div>
              )}
              <div className={`flex max-w-[720px] flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`break-words rounded-[24px] px-4 py-3 text-[13px] leading-6 shadow-[0_10px_28px_rgba(31,43,77,0.04)] ${
                    message.role === "user"
                      ? dark
                        ? "border border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8]"
                        : "border border-[#E5E7EB] bg-white text-[#171717]"
                      : dark
                        ? "text-[#F4F6F8]"
                        : "text-[#171717]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "assistant" && (
                  <div className={`mt-2 flex items-center gap-1 rounded-full border px-1.5 py-1 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]/80 text-[#A8B0BA]" : "border-[#E5E7EB] bg-white/80 text-[#9CA3AF] shadow-sm"}`}>
                    <button
                      onClick={() => void copyAssistantMessage(message.content)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Copy response"
                      title="Copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMessageFeedback((current) => {
                          const next = { ...current };
                          if (next[message.id] === "like") delete next[message.id];
                          else next[message.id] = "like";
                          return next;
                        });
                        showToast("Feedback saved");
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${messageFeedback[message.id] === "like" ? "bg-[#DDEEFF] text-[#1D9BF0]" : dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Like response"
                      title="Like"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMessageFeedback((current) => {
                          const next = { ...current };
                          if (next[message.id] === "dislike") delete next[message.id];
                          else next[message.id] = "dislike";
                          return next;
                        });
                        showToast("Feedback saved");
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${messageFeedback[message.id] === "dislike" ? "bg-[#FFE8ED] text-[#D92D52]" : dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Dislike response"
                      title="Dislike"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => void regenerateAssistantMessage(message.id)}
                      disabled={isSending}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Regenerate response"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => void shareAssistantMessage(message.content)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Share response"
                      title="Share"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => downloadAssistantMessage(message)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#F4F8FB] hover:text-[#171717]"}`}
                      aria-label="Download response"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_12px_26px_rgba(29,161,242,0.28)]">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <div className={`rounded-[24px] px-4 py-3 text-[13px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
          <div className={`text-center text-[11px] ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`}>
            {aiProviderLabel}
          </div>
        </div>
      </div>

      <div className="pb-7 pt-3">
        {composer}
      </div>
    </div>
  );
}

function PromptLabPage() {
  const { openModal, showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="Prompt Lab" subtitle="Test, save, and organize reusable prompt workflows." action={<PrimaryButton icon={Plus} onClick={() => openModal("prompt-editor")}>Create new prompt</PrimaryButton>} />
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", "Design", "Code", "3D", "Research"].map((filter) => (
          <button key={filter} onClick={() => showToast(`${filter} prompts selected`)} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] active:scale-[0.98]">
            {filter}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["Website audit", "Component builder", "Scene generator", "Copy polish", "Budget planner", "Asset namer"].map((name) => (
          <ClickableSoftCard key={name} onClick={() => openModal("prompt-editor")} ariaLabel={`Edit ${name} prompt`}>
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Prompt card placeholder for testing and reuse.</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsPage() {
  const { openDrawer, openModal } = useStudioActions();

  return (
    <div>
      <PageHeader title="Projects" subtitle="Manage studio projects and production status." action={<PrimaryButton icon={Plus} onClick={() => openModal("project-create")}>New project</PrimaryButton>} />
      <div className="grid gap-3 md:grid-cols-3">
        {["Cedium command center", "Automation workflow", "3D product system"].map((name) => (
          <ClickableSoftCard key={name} className="min-h-[150px]" onClick={() => openDrawer("project-detail")} ariaLabel={`Open ${name} project`}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
              <Folder className="h-5 w-5" />
            </div>
            <p className="text-[13px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] text-[#6B7280]">Project card placeholder</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
  );
}

function ExportsPage() {
  const { showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="Exports" subtitle="Review exported files and download history." />
      <SoftCard className="overflow-hidden p-0">
        {[
          ["homepage-preview.png", "Ready", "Image"],
          ["model-pack.glb", "Processing", "3D"],
          ["prompt-library.pdf", "Ready", "Document"],
        ].map(([name, status, type]) => (
          <div key={name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#EEF2F5] px-4 py-3 last:border-b-0">
            <div>
              <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
              <p className="mt-1 text-[10px] text-[#6B7280]">{type}</p>
            </div>
            <span className="rounded-full bg-[#EEF7FC] px-2.5 py-1 text-[10px] font-semibold text-[#1DA1F2]">{status}</span>
            <button onClick={() => showToast(status === "Ready" ? `${name} download started` : `${name} is still processing`)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] transition-all hover:border-[#CFE8F8] hover:text-[#171717] active:scale-[0.98]" aria-label={`Download ${name}`}>
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </SoftCard>
    </div>
  );
}

function SettingsPage() {
  const { theme, toggleTheme } = useStudioTheme();
  const isDark = theme === "dark";

  const frameClass = isDark
    ? "border-[rgba(255,255,255,0.08)] bg-[#1F1F1F] text-[#F5F5F5] shadow-[0_32px_80px_rgba(0,0,0,0.34)]"
    : "border-[#E5E7EB] bg-white text-[#101113] shadow-[0_32px_80px_rgba(15,23,42,0.08)]";
  const panelClass = isDark ? "bg-[rgba(31,31,31,0.9)]" : "bg-[rgba(255,255,255,0.92)]";
  const borderClass = isDark ? "border-[#333333]" : "border-[#E5E7EB]";

  return (
    <div className="mx-auto flex w-full justify-center py-3">
      <div className={`min-h-[620px] w-full max-w-[784px] overflow-hidden rounded-2xl border backdrop-blur-xl ${frameClass}`}>
        <main className={`h-full px-8 py-6 ${panelClass}`}>
          <div className={`flex items-center justify-between border-b pb-5 ${borderClass}`}>
            <h1 className="text-[18px] font-medium tracking-[-0.01em]">General</h1>
            <button
              onClick={toggleTheme}
              className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12px] font-medium transition-colors ${isDark ? "border-[#3A3A3A] bg-[#262626] text-[#F5F5F5] hover:bg-[#303030]" : "border-[#E5E7EB] bg-[#F7F8FA] text-[#111827] hover:bg-white"}`}
            >
              {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {isDark ? "Dark mode" : "Light mode"}
            </button>
          </div>

          <div className={`divide-y ${isDark ? "divide-[#333333]" : "divide-[#E5E7EB]"}`}>
            <GeneralSettingRow label="Appearance" control={<SettingSelectValue value={isDark ? "Dark" : "Light"} />} />
            <GeneralSettingRow label="Contrast" control={<SettingSelectValue value="System" />} />
            <GeneralSettingRow label="Accent color" control={<SettingSelectValue value="Default" dot />} />
            <GeneralSettingRow label="Language" control={<SettingSelectValue value="Auto-detect" />} />
            <GeneralSettingRow
              label="Enable Dictation"
              description="Use dictation in the chat composer."
              control={<SettingsSwitch enabled label="Enable Dictation" />}
            />
            <GeneralSettingRow
              label="Spoken language"
              description="For best results, select the language you mainly speak. If it is not listed, it may still be supported via auto-detection."
              control={<SettingSelectValue value="Auto-detect" />}
            />
            <VoiceSettingRow />
            <GeneralSettingRow
              label="Separate Voice"
              description="Keep Cedium Voice in a separate full screen, without real time transcripts and visuals."
              control={<SettingsSwitch enabled={false} label="Separate Voice" />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function GeneralSettingRow({ label, description, control }: { label: string; description?: string; control: ReactNode }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4">
      <div className="min-w-0">
        <p className={`text-[14px] font-medium ${dark ? "text-[#F5F5F5]" : "text-[#111827]"}`}>{label}</p>
        {description && <p className={`mt-1 max-w-[360px] text-[12px] leading-5 ${dark ? "text-[#AFAFAF]" : "text-[#6B7280]"}`}>{description}</p>}
      </div>
      <div className="flex items-center justify-end">{control}</div>
    </div>
  );
}

function SettingSelectValue({ value, dot = false }: { value: string; dot?: boolean }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <button className={`inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium transition-colors ${dark ? "text-[#F4F4F4] hover:bg-[#2B2B2B]" : "text-[#111827] hover:bg-[#F3F4F6]"}`}>
      {dot && <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-[#A3A3A3]" : "bg-[#9CA3AF]"}`} />}
      <span>{value}</span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function SettingsSwitch({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <button
      aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
      className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${enabled ? "justify-end bg-[#1D9BF0]" : "justify-start bg-[#5B5B5B]"}`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)]" />
    </button>
  );
}

function VoiceSettingRow() {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4">
      <p className={`text-[14px] font-medium ${dark ? "text-[#F5F5F5]" : "text-[#111827]"}`}>Voice</p>
      <div className="flex items-center gap-4">
        <button className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors ${dark ? "bg-[#303030] text-white hover:bg-[#3A3A3A]" : "bg-[#F3F4F6] text-[#111827] hover:bg-[#E9EDF2]"}`}>
          <Play className="h-3.5 w-3.5 fill-current" />
          Play
        </button>
        <SettingSelectValue value="Arbor" />
      </div>
    </div>
  );
}

function HelpCenterPage() {
  const { openDrawer, openModal } = useStudioActions();

  return (
    <div>
      <PageHeader title="Help Center" subtitle="Find help articles and contact support." />
      <div className="mb-5 flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] px-4">
        <Search className="h-4 w-4 text-[#9CA3AF]" />
        <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Search help..." />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["How do imports work?", "Where are exports saved?", "How do I manage workspaces?"].map((question) => (
          <ClickableSoftCard key={question} onClick={() => openDrawer("help-preview")} ariaLabel={`Open help article ${question}`}>
            <p className="text-[12px] font-semibold text-[#171717]">{question}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">FAQ card placeholder with concise support guidance.</p>
          </ClickableSoftCard>
        ))}
      </div>
      <SoftCard className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#171717]">Contact support</p>
          <p className="mt-1 text-[11px] text-[#6B7280]">Support request placeholder for the Personal workspace.</p>
        </div>
        <SecondaryButton onClick={() => openModal("support")}>Open support</SecondaryButton>
      </SoftCard>
    </div>
  );
}

function getRouteTitle(route: StudioRouteKey) {
  return (
    [...studioNavigation, ...bottomNavigation].find((item) => item.key === route)?.label ??
    "AI Assistant"
  );
}
