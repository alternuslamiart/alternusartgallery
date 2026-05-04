"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Code2,
  CreditCard,
  Database,
  Download,
  FileText,
  Folder,
  Grid2X2,
  ImageIcon,
  KeyRound,
  Layers3,
  MessageCircle,
  Monitor,
  Moon,
  Paperclip,
  PanelLeft,
  PenLine,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type StudioRouteKey =
  | "studio-overview"
  | "alternus-design"
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

function isPaidStudioPlan() {
  const plan = process.env.NEXT_PUBLIC_ALTERNUS_PLAN?.toLowerCase();
  return plan === "pro" || plan === "team" || plan === "premium" || plan === "paid" || plan === "enterprise";
}

export const studioNavigation: NavItem[] = [
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { key: "studio-overview", label: "Studio Overview", href: "/studio-overview", icon: Grid2X2 },
  { key: "alternus-design", label: "Alternus Design", href: "/alternus-design", icon: Monitor },
  { key: "autocad-design", label: "AutoCAD Design", href: "/autocad-design", icon: PenLine },
  { key: "code-builder", label: "Code Builder", href: "/code-builder", icon: Code2 },
  { key: "blender-3d", label: "Blender 3D", href: "/blender-3d", icon: Layers3 },
  { key: "asset-library", label: "Asset Library", href: "/asset-library", icon: ImageIcon },
  { key: "prompt-lab", label: "Prompt Lab", href: "/prompt-lab", icon: FileText, badge: "2" },
  { key: "projects", label: "Projects", href: "/projects", icon: Folder },
  { key: "exports", label: "Exports", href: "/exports", icon: Upload },
];

const generatedRecents: GeneratedRecent[] = [
  {
    id: "recent-3d-environment",
    title: "Create 3D Environment",
    tool: "Blender 3D",
    meta: "Generated scene",
    time: "14m",
    icon: Layers3,
    output: "A light studio environment with soft grid floor, product lighting, and export-ready GLB scene setup.",
  },
  {
    id: "recent-react-component",
    title: "React Component Draft",
    tool: "AI for Code",
    meta: "Generated plan",
    time: "22m",
    icon: Code2,
    output: "A reusable React component structure with responsive states, accessible controls, and clean Tailwind styling.",
  },
  {
    id: "recent-floor-plan",
    title: "Floor Plan Layer Setup",
    tool: "AutoCAD",
    meta: "CAD draft",
    time: "31m",
    icon: PenLine,
    output: "A CAD floor-plan draft with wall, dimension, annotation, furniture, and export layers prepared.",
  },
];

const bottomNavigation = [
  { key: "settings" as const, label: "Settings", href: "/settings", icon: Settings },
  { key: "help-center" as const, label: "Help Center", href: "/help-center", icon: AlertTriangle },
];

const routeByPath: Record<string, StudioRouteKey> = {
  "/main": "ai-assistant",
  "/studio-overview": "studio-overview",
  "/alternus-design": "alternus-design",
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<StudioModalKey | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<StudioDrawerKey | null>(null);
  const [activeRecent, setActiveRecent] = useState<GeneratedRecent | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sidebarNotificationRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const currentTitle = getRouteTitle(activeRoute);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("alternus-studio-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("alternus-studio-theme", theme);
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

  const actionValue = useMemo(
    () => ({
      openModal: (modal: StudioModalKey) => setActiveModal(modal),
      closeModal: () => setActiveModal(null),
      openDrawer: (drawer: StudioDrawerKey) => setActiveDrawer(drawer),
      closeDrawer: () => setActiveDrawer(null),
      showToast,
    }),
    [showToast],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
        setActiveDrawer(null);
        setActiveRecent(null);
        setActionsOpenSafe();
      }
    }

    function setActionsOpenSafe() {
      setWorkspaceOpen(false);
      setNotificationsOpen(false);
        setDisplayOpen(false);
        setProfileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
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
        "flex h-full flex-shrink-0 flex-col py-3 transition-all duration-200 ease-out",
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
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "text-[#A8B0BA] hover:bg-white/6 hover:text-[#F4F6F8]" : "text-[#6B7280] hover:bg-white/70 hover:text-[#171717]"}`}
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-[14px] w-[14px]" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setWorkspaceOpen((value) => !value)}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-[13px] font-semibold ${dark ? "text-[#F4F6F8] hover:bg-white/6" : "text-[#1F2937] hover:bg-white/60"}`}
              aria-expanded={workspaceOpen}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white">
                <Shield className="h-[11px] w-[11px]" />
              </span>
              <span className="truncate">Personal</span>
              <ChevronDown className={`h-3 w-3 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`} />
            </button>
            <button
              onClick={() => showToast("Temporary chat started")}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${dark ? "text-[#A8B0BA] hover:bg-white/6 hover:text-[#F4F6F8]" : "text-[#6B7280] hover:bg-white/70 hover:text-[#171717]"}`}
              aria-label="Temporary Chat"
              title="Temporary Chat"
            >
              <MessageCircle className="h-[14px] w-[14px]" />
            </button>
            <button
              onClick={toggleMenu}
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "text-[#A8B0BA] hover:bg-white/6 hover:text-[#F4F6F8]" : "text-[#6B7280] hover:bg-white/70 hover:text-[#171717]"}`}
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-[14px] w-[14px]" />
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
        <button onClick={() => setActiveModal("search")} className={`mb-5 flex h-10 w-full cursor-pointer items-center gap-2 rounded-2xl border px-3 text-left transition-all active:scale-[0.99] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_8px_22px_rgba(0,0,0,0.16)] hover:border-[rgba(59,167,255,0.24)]" : "border-white/80 bg-white/72 shadow-[0_8px_22px_rgba(31,43,77,0.04)] hover:border-[#CFE8F8]"}`} aria-label="Open search">
          <Search className={`h-[13px] w-[13px] ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`} />
          <span className={`min-w-0 flex-1 text-[12px] ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`}>Search...</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${dark ? "bg-[#202328] text-[#A8B0BA]" : "bg-[#F3F6F8] text-[#9CA3AF]"}`}>/</span>
        </button>
      )}

      <nav className="space-y-1">
        {studioNavigation.map((item) => (
          <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
        ))}
      </nav>

      <div className={`mt-3 border-t pt-3 ${dark ? "border-[rgba(255,255,255,0.08)]" : "border-white/70"}`}>
        {!isCollapsed && <p className={`mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${dark ? "text-[#6F7782]" : "text-[#8A94A3]"}`}>Recents</p>}
      </div>

      <div className="mt-auto">
        {!isCollapsed && (
          <div className={`mb-5 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#17191D] shadow-[0_14px_36px_rgba(0,0,0,0.22)]" : "border-white/80 bg-white/72 shadow-[0_14px_36px_rgba(31,43,77,0.07)]"}`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white shadow-[0_10px_22px_rgba(29,161,242,0.24)]">
              <Sparkles className="h-[15px] w-[15px] fill-current" />
            </div>
            <p className={`text-[12px] font-bold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Alternus AI Trial</p>
            <p className={`mt-1 text-[10px] leading-4 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>There are 12 days left for you to enjoy the various features.</p>
            <button
              onClick={() => setActiveModal("upgrade")}
              className={`mt-3 rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:border-[rgba(59,167,255,0.24)]" : "border-[#E5E7EB] bg-white text-[#171717] shadow-sm hover:border-[#CFE8F8]"}`}
            >
              Upgrade to Pro
            </button>
          </div>
        )}
        <div className="space-y-1 pb-1">
          {bottomNavigation.map((item) => (
            <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
          ))}
          <button
            onClick={() => setSignOutOpen(true)}
            className={[
              "group flex h-8 w-full items-center rounded-xl px-2.5 text-left text-[12px] font-medium transition-all",
              dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "text-[#4B5563] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]",
              isCollapsed ? "justify-center" : "gap-2",
            ].join(" ")}
          >
            <Upload className={`h-[13px] w-[13px] rotate-90 ${dark ? "text-[#6F7782] group-hover:text-[#F4F6F8]" : "text-[#6B7280] group-hover:text-[#4A9BFF]"}`} />
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
            <div className="relative h-full w-[230px] shadow-[18px_0_50px_rgba(31,43,77,0.16)]">{sidebar}</div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col p-3">
          <header className={`mb-3 flex h-8 items-center justify-between px-1 ${activeRoute === "ai-assistant" ? "max-sm:hidden" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className={`relative flex items-center gap-2 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setActiveDrawer("notifications")}
                    className={`relative flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(255,255,255,0.06)]" : "bg-white/70 shadow-sm hover:bg-white"}`}
                    aria-label="Notifications"
                  >
                    <Bell className="h-[13px] w-[13px]" />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF3B6B]" />
                  </button>
                  {notificationsOpen && <NotificationsDropdown align="left" />}
                </div>
                <button
                  onClick={() => setActiveModal("quick-settings")}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(255,255,255,0.06)]" : "bg-white/70 shadow-sm hover:bg-white"}`}
                  aria-label="Open settings"
                >
                  <Settings className="h-[13px] w-[13px]" />
                </button>
                <div ref={displayRef} className="relative">
                  <button
                    onClick={() => setDisplayOpen((value) => !value)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(255,255,255,0.06)]" : "bg-white/70 shadow-sm hover:bg-white"}`}
                    aria-label="Display preview"
                  >
                    <Monitor className="h-[13px] w-[13px]" />
                  </button>
                  {displayOpen && <DisplayDropdown />}
                </div>
              </div>
              <h1 className={`truncate text-[15px] font-semibold tracking-[-0.01em] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{currentTitle}</h1>
            </div>
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((value) => !value)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(255,255,255,0.06)]" : "bg-white text-[#6B7280] shadow-sm hover:bg-[#FAFCFD]"}`}
                aria-label="Open profile"
              >
                <UserRound className="h-[15px] w-[15px]" />
              </button>
              {profileOpen && <ProfileDropdown />}
            </div>
          </header>

          <section
            className={[
              "min-h-0 flex-1 overflow-auto rounded-3xl px-8 py-8",
              dark
                ? "border border-[rgba(255,255,255,0.08)] bg-[#17191D] shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                : "border border-[#E8EEF2] bg-white shadow-[0_24px_60px_rgba(31,43,77,0.06)]",
              activeRoute === "ai-assistant" ? "max-sm:px-4 max-sm:py-0" : "",
            ].join(" ")}
          >
            <div className="mx-auto w-full max-w-[1180px]">
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
        "group flex h-8 w-full items-center rounded-xl px-2.5 text-left text-[12px] font-medium transition-all",
        dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#DDEEFF] hover:text-[#4A9BFF]",
        collapsed ? "justify-center" : "gap-2",
      ].join(" ")}
      style={{
        background: active ? (dark ? "rgba(59,167,255,0.14)" : "#FFFFFF") : undefined,
        border: active ? (dark ? "1px solid rgba(59,167,255,0.18)" : "1px solid rgba(229,231,235,0.95)") : undefined,
        boxShadow: active ? (dark ? "0 10px 24px rgba(0,0,0,0.22)" : "0 8px 18px rgba(31,43,77,0.06)") : undefined,
        color: active ? (dark ? "#F4F6F8" : "#171717") : undefined,
      }}
    >
      <Icon className={`h-[13px] w-[13px] flex-shrink-0 ${dark ? "group-hover:text-[#F4F6F8]" : "group-hover:text-[#4A9BFF]"} ${active ? "text-[#3BA7FF]" : dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`} />
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
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-medium ${dark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#4B5563] hover:bg-[#F4F8FB]"}`}
    >
      <Icon className={`h-3.5 w-3.5 ${dark ? "text-[#6F7782]" : "text-[#6B7280]"}`} />
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

function ProfileDropdown() {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";

  return (
    <DropdownPanel className="right-0 top-10 w-64">
      <div className="px-3 py-2">
        <p className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Profile</p>
        <p className={`mt-1 text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Personal workspace - trial plan</p>
      </div>
      <DropdownButton icon={Settings} label="Account settings" onClick={() => showToast("Account settings opened")} />
      <DropdownButton icon={CreditCard} label="Billing and plan" onClick={() => showToast("Billing and plan opened")} />
      <DropdownButton icon={RefreshCw} label="Switch workspace" onClick={() => showToast("Workspace switcher opened")} />
      <DropdownButton icon={Upload} label="Sign out" onClick={() => showToast("Use the sidebar Sign Out confirmation")} />
    </DropdownPanel>
  );
}

function StudioContent({ route, assistantTool }: { route: StudioRouteKey; assistantTool?: AssistantToolKey }) {
  switch (route) {
    case "studio-overview":
      return <OverviewPage />;
    case "alternus-design":
      return <AlternusDesignPage />;
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

function AlternusDesignPage() {
  const { theme } = useStudioTheme();
  const { showToast } = useStudioActions();
  const dark = theme === "dark";
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const isPaidPlan = isPaidStudioPlan() || previewUnlocked;
  const shell = dark
    ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
    : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_18px_42px_rgba(31,43,77,0.06)]";
  const muted = dark ? "text-[#A8B0BA]" : "text-[#6B7280]";
  const strong = dark ? "text-[#F4F6F8]" : "text-[#171717]";
  const prototypeModes: Array<{ label: string; icon: LucideIcon; desc: string }> = [
    { label: "Wireframe", icon: Grid2X2, desc: "Fast layout" },
    { label: "High fidelity", icon: PenLine, desc: "Visual polish" },
    { label: "Website", icon: Monitor, desc: "Landing pages" },
    { label: "Mobile app", icon: Layers3, desc: "iOS/Android" },
  ];

  if (!isPaidPlan) {
    return (
      <div>
        <PageHeader
          title="Alternus Design"
          subtitle="Design website, app, and mobile prototypes in the same Alternus AI workspace."
        />
        <div className={`overflow-hidden rounded-[32px] border p-6 ${shell}`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_18px_36px_rgba(29,161,242,0.24)]">
                <CreditCard className="h-6 w-6" />
              </div>
              <p className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] ${muted}`}>Paid plan required</p>
              <h3 className={`mt-2 max-w-xl text-[30px] font-semibold tracking-[-0.04em] ${strong}`}>Alternus Design is available only on paid plans.</h3>
              <p className={`mt-3 max-w-2xl text-[13px] leading-6 ${muted}`}>
                Free Plan users can use AI Assistant and the basic workspace. Website, app, and mobile prototype generation is reserved for Pro, Team, Premium, or Enterprise plans.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => { setPreviewUnlocked(true); showToast("Alternus Design unlocked for this preview"); }} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#4A9BFF] px-4 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(74,155,255,0.22)] transition-all hover:bg-[#2D8FF0] active:scale-[0.98]">
                  <CreditCard className="h-4 w-4" />
                  Upgrade to Pro
                </button>
                <button onClick={() => showToast("Alternus Design unlocks after a paid plan is active")} className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-[12px] font-semibold transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]" : "border-[#E5EAF0] bg-white text-[#4B5563] hover:border-[#CFE8F8] hover:text-[#171717]"}`}>
                  <KeyRound className="h-4 w-4" />
                  Check access
                </button>
              </div>
            </div>
            <div className={`rounded-[28px] border p-4 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
              <p className={`text-[13px] font-semibold ${strong}`}>Locked features</p>
              <div className="mt-4 grid gap-3">
                {["Website prototype generation", "Mobile app screens", "High fidelity UI systems", "Design token exports"].map((feature) => (
                  <div key={feature} className={`flex items-center gap-3 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-[#FAFCFD]"}`}>
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#4A9BFF]" />
                    <span className={`text-[12px] font-semibold ${strong}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Alternus Design"
        subtitle="Design website, app, and mobile prototypes in the same Alternus AI workspace."
        action={<PrimaryButton icon={Sparkles} onClick={() => showToast("New Alternus Design prototype created")}>Create prototype</PrimaryButton>}
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <section className={`rounded-[28px] border p-4 ${shell}`}>
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
            <label className={`text-[11px] font-semibold ${strong}`}>Project name</label>
            <input className={`mt-2 h-10 w-full rounded-xl border px-3 text-[12px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8] placeholder:text-[#6F7782]" : "border-[#E5E7EB] bg-[#FAFCFD] text-[#171717] placeholder:text-[#A1A7B0]"}`} placeholder="Marketplace mobile refresh" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {prototypeModes.map(({ label, icon: Icon, desc }, index) => (
              <button key={label} onClick={() => showToast(`${label} mode selected`)} className={`group min-h-[108px] rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] ${index === 1 ? "border-[#9BD2FF] bg-[#EEF7FF]" : dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] hover:border-[rgba(59,167,255,0.24)]" : "border-[#E5EAF0] bg-white hover:border-[#CFE8F8]"}`}>
                <div className={`mb-3 flex h-10 items-center justify-center rounded-xl ${index === 1 ? "bg-white text-[#4A9BFF]" : dark ? "bg-[#202328] text-[#A8B0BA]" : "bg-[#F4F8FB] text-[#6B7280]"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`text-[12px] font-semibold ${index === 1 ? "text-[#171717]" : strong}`}>{label}</p>
                <p className={`mt-1 text-[10px] ${index === 1 ? "text-[#4B5563]" : muted}`}>{desc}</p>
              </button>
            ))}
          </div>

          <button onClick={() => showToast("Alternus Design generation queued")} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4A9BFF] to-[#1DA1F2] text-[12px] font-semibold text-white shadow-[0_16px_34px_rgba(29,161,242,0.24)] transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <Plus className="h-4 w-4" />
            Create
          </button>
          <p className={`mt-3 text-center text-[10px] ${muted}`}>Only you can see your prototype by default.</p>
        </section>

        <section className="space-y-4">
          <div className={`rounded-[28px] border p-4 ${shell}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-[13px] font-semibold ${strong}`}>Designs</p>
                <p className={`mt-1 text-[11px] ${muted}`}>Recent prototypes and UI systems generated with Alternus AI.</p>
              </div>
              <div className={`flex rounded-2xl p-1 ${dark ? "bg-[#181B20]" : "bg-[#EEF3F7]"}`}>
                {["Recent", "Your designs", "Design systems"].map((tab, index) => (
                  <button key={tab} onClick={() => showToast(`${tab} selected`)} className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold ${index === 0 ? "bg-white text-[#171717] shadow-sm" : muted}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Gallery checkout redesign", "Website", "Today", "Checkout"],
                ["Collector mobile app", "Mobile app", "Yesterday", "App"],
                ["Artist dashboard system", "Design system", "2d ago", "System"],
              ].map(([title, type, time, tag]) => (
                <ClickableSoftCard key={title} className="overflow-hidden p-0" onClick={() => showToast(`${title} opened`)} ariaLabel={`Open ${title}`}>
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
                    <p className={`text-[12px] font-semibold ${strong}`}>{title}</p>
                    <p className={`mt-1 text-[10.5px] ${muted}`}>{type} - {time}</p>
                  </div>
                </ClickableSoftCard>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-[28px] border p-4 ${shell}`}>
              <p className={`text-[13px] font-semibold ${strong}`}>Prototype brief</p>
              <textarea className={`mt-3 min-h-[118px] w-full resize-none rounded-2xl border p-4 text-[13px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782]" : "border-[#E5EAF0] bg-white text-[#171717] placeholder:text-[#A1A7B0]"}`} placeholder="Describe the website, dashboard, mobile flow, or app screen you want Alternus Design to create..." />
              <div className="mt-3 flex flex-wrap gap-2">
                {["Responsive", "Design tokens", "Components", "Prototype flow"].map((chip) => (
                  <button key={chip} onClick={() => showToast(`${chip} added to brief`)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#A8B0BA]" : "border-[#E5EAF0] bg-[#FAFCFD] text-[#4B5563]"}`}>{chip}</button>
                ))}
              </div>
            </div>

            <div className={`rounded-[28px] border p-4 ${shell}`}>
              <p className={`text-[13px] font-semibold ${strong}`}>Design system</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Color", "Sky, paper, graphite", "#4A9BFF"],
                  ["Typography", "Clean UI scale", "#171717"],
                  ["Spacing", "8px rhythm", "#CFE8F8"],
                ].map(([label, desc, color]) => (
                  <div key={label} className={`flex items-center gap-3 rounded-2xl border p-3 ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5EAF0] bg-white"}`}>
                    <span className="h-9 w-9 rounded-xl" style={{ background: color }} />
                    <span>
                      <span className={`block text-[12px] font-semibold ${strong}`}>{label}</span>
                      <span className={`mt-0.5 block text-[10.5px] ${muted}`}>{desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
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
        {["Floor plan study", "Gallery elevation", "Display detail"].map((name) => (
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

  return (
    <div>
      <PageHeader title="Code Builder" subtitle="Describe a feature and prepare build-ready project work." />
      <SoftCard>
        <label className="text-[12px] font-semibold text-[#171717]">Project prompt</label>
        <textarea className="mt-3 min-h-[130px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Describe the route, component, or app behavior you want to build..." />
        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton icon={Code2} onClick={() => showToast("Code plan generation queued")}>Generate plan</PrimaryButton>
          <SecondaryButton icon={Folder} onClick={() => openModal("project-create")}>Open recent project</SecondaryButton>
        </div>
      </SoftCard>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {["Studio shell", "Checkout polish", "Asset upload"].map((name) => (
          <ClickableSoftCard key={name} onClick={() => showToast(`${name} project opened`)} ariaLabel={`Open ${name}`}>
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] text-[#6B7280]">Recent build placeholder</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
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
        {["Material study", "Product scene", "Gallery room", "Character base"].map((name) => (
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
  const { openDrawer, openModal, showToast } = useStudioActions();

  return (
    <div>
      <PageHeader title="Asset Library" subtitle="Search, filter, and upload creative assets." action={<PrimaryButton icon={Upload} onClick={() => openModal("asset-upload")}>Upload asset</PrimaryButton>} />
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#EAECEF] bg-[#FCFDFE] p-3 sm:flex-row">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Search assets..." />
        </div>
        <SecondaryButton onClick={() => showToast("All asset types selected")}>All types</SecondaryButton>
        <SecondaryButton onClick={() => showToast("Recent assets selected")}>Recent</SecondaryButton>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {["Image", "Vector", "Model", "Document", "Texture", "Reference", "Export", "Audio"].map((name) => (
          <ClickableSoftCard key={name} onClick={() => openDrawer("asset-preview")} ariaLabel={`Preview ${name} asset`}>
            <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-[12px] font-semibold text-[#171717]">{name} asset</p>
            <p className="mt-1 text-[10px] text-[#6B7280]">Placeholder</p>
          </ClickableSoftCard>
        ))}
      </div>
    </div>
  );
}

function AIAssistantPage() {
  const { theme } = useStudioTheme();
  const { openModal, showToast } = useStudioActions();
  const dark = theme === "dark";
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const hasConversation = messages.length > 0;

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

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

  const sendPrompt = async () => {
    if (!input.trim()) {
      showToast("Write a prompt before sending");
      return;
    }

    const prompt = input.trim();
    const conversationHistory = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: prompt },
    ]);
    setInput("");
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

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: typeof data?.content === "string" ? data.content : "No response received.",
        },
      ]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: `I couldn't complete that request. Error: ${errMsg}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const composer = (
    <div className={`w-full overflow-visible rounded-3xl border text-left max-sm:rounded-[1.35rem] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_18px_42px_rgba(0,0,0,0.22)] max-sm:shadow-[0_12px_30px_rgba(0,0,0,0.26)]" : "border-[#E5E7EB] bg-white shadow-[0_18px_42px_rgba(31,43,77,0.06)] max-sm:shadow-[0_12px_30px_rgba(31,43,77,0.08)]"}`}>
      <div className="relative flex min-h-[150px] flex-col px-5 py-4 max-sm:min-h-[112px] max-sm:px-4 max-sm:py-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-[13px] w-[13px] fill-[#1DA1F2] text-[#1DA1F2]" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void sendPrompt();
              }
            }}
            placeholder="Ask Alternus AI Assistant..."
            className={`min-w-0 flex-1 bg-transparent text-[13px] outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "placeholder:text-[#A1A7B0]"}`}
            style={{ color: dark ? "#F4F6F8" : "#171717", letterSpacing: 0 }}
          />
        </div>
        {attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
        <div className={`mt-auto flex items-center gap-3 pt-5 max-sm:gap-1.5 max-sm:pt-3 ${dark ? "text-[#A8B0BA]" : "text-[#A1A7B0]"}`}>
          <div className="relative">
            <button onClick={() => setActionsOpen((value) => !value)} className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`} aria-label="Open assistant actions">
              <Plus className="h-[13px] w-[13px]" />
            </button>
            {actionsOpen && (
              <DropdownPanel className="bottom-9 left-0 w-44">
                <DropdownButton icon={Sparkles} label="New task" onClick={() => { setActionsOpen(false); setInput(""); showToast("New prompt started"); }} />
                <DropdownButton icon={FileText} label="New prompt" onClick={() => { setActionsOpen(false); openModal("prompt-editor"); }} />
                <DropdownButton icon={Folder} label="Create project" onClick={() => { setActionsOpen(false); openModal("project-create"); }} />
                <DropdownButton icon={ImageIcon} label="Upload asset" onClick={() => { setActionsOpen(false); openModal("asset-upload"); }} />
                <DropdownButton icon={Upload} label="Import file" onClick={() => { setActionsOpen(false); openModal("upload-file"); }} />
              </DropdownPanel>
            )}
          </div>
          <button onClick={() => openModal("upload-file")} className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`} aria-label="Attach file">
            <Paperclip className="h-[13px] w-[13px]" />
          </button>
          <button onClick={() => openModal("upload-image")} className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`} aria-label="Attach image">
            <ImageIcon className="h-[13px] w-[13px]" />
          </button>
          <button onClick={() => openModal("upload-document")} className={`flex h-7 w-7 items-center justify-center rounded-lg ${dark ? "hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`} aria-label="Attach document">
            <FileText className="h-[13px] w-[13px]" />
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
          <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
          <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
          <button
            onClick={() => void sendPrompt()}
            disabled={isSending}
            aria-label="Send prompt"
            className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[0_12px_24px_rgba(74,155,255,0.28)] transition-colors disabled:opacity-70 ${dark ? "bg-[#3BA7FF] hover:bg-[#2D8FF0]" : "bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
          >
            {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  if (!hasConversation) {
    const suggestions = [
      toolWorkspaces.code,
      toolWorkspaces.blender,
      toolWorkspaces.autocad,
    ];
    const mobileSuggestions: { title: string; icon: LucideIcon; href?: string }[] = [
      { title: "AI for Code", icon: Code2, href: toolWorkspaces.code.href },
      { title: "Blender 3D", icon: Layers3, href: toolWorkspaces.blender.href },
      { title: "AutoCAD", icon: PenLine, href: toolWorkspaces.autocad.href },
      { title: "Research", icon: FileText },
      { title: "Saving", icon: RefreshCw },
      { title: "Overspend", icon: AlertTriangle },
    ];

    return (
      <div className="flex min-h-full items-center justify-center py-8 max-sm:items-stretch max-sm:justify-start max-sm:py-0">
        <div className="flex w-full max-w-[620px] flex-col items-center text-center max-sm:min-h-full max-sm:max-w-none max-sm:pb-3">
          <div className="hidden h-12 w-full items-center justify-center sm:hidden max-sm:flex">
            <button className={`absolute left-1 flex h-9 w-9 items-center justify-center rounded-full ${dark ? "text-[#F4F6F8] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#171717] hover:bg-[#F4F8FB]"}`} aria-label="Back">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className={`text-[13px] font-medium ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Lumen AI Assistant</p>
          </div>

          <div className="mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_16px_38px_rgba(29,161,242,0.32)] max-sm:mt-24 max-sm:h-[54px] max-sm:w-[54px]">
            <Sparkles className="h-7 w-7 fill-current max-sm:h-6 max-sm:w-6" />
          </div>
          <h2 className={`text-[28px] font-semibold tracking-[-0.03em] max-sm:text-[17px] ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Alternus AI Assistant</h2>
          <p className={`mt-3 text-[12px] leading-5 max-sm:mt-1 max-sm:text-[11px] ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Ask about art, artists, styles, commissions, shipping, or anything else on Alternus.</p>

          <div className="mt-7 hidden w-full sm:block">{composer}</div>

          <div className="mt-4 hidden w-full gap-3 sm:grid sm:grid-cols-3">
            {suggestions.map((card) => (
              <Link key={card.title} href={card.href} className={`cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:border-[rgba(59,167,255,0.24)] hover:bg-[#23262C] hover:shadow-[0_16px_34px_rgba(0,0,0,0.28)]" : "border-[#EAECEF] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.035)] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"}`}>
                <p className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{card.title}</p>
                <p className={`mt-2 text-[10.5px] leading-4 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>{card.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 hidden flex-wrap justify-center gap-2 max-sm:flex">
            {mobileSuggestions.map((item) => {
              const Icon = item.icon;
              const className = `inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[10.5px] font-medium shadow-[0_8px_20px_rgba(31,43,77,0.04)] transition-all active:scale-[0.98] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8]" : "border-[#E5E7EB] bg-white text-[#171717]"}`;
              const content = (
                <>
                  <Icon className={`h-3 w-3 ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`} />
                  {item.title}
                </>
              );
              if (item.href) {
                return (
                  <Link key={item.title} href={item.href} className={className}>
                    {content}
                  </Link>
                );
              }
              return (
                <button key={item.title} className={className}>
                  {content}
                </button>
              );
            })}
          </div>

          <button className={`mt-4 self-start text-[11px] font-medium max-sm:hidden ${dark ? "text-[#A8B0BA] hover:text-[#F4F6F8]" : "text-[#6B7280] hover:text-[#171717]"}`}>
            <span className="inline-flex items-center gap-1">
              Refresh prompts <RefreshCw className="h-[11px] w-[11px]" />
            </span>
          </button>

          <div className="mt-auto hidden w-full pt-4 max-sm:block">
            <div className={`mb-2 flex items-start gap-2 rounded-2xl border px-3 py-2 text-left ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328] shadow-[0_10px_24px_rgba(0,0,0,0.22)]" : "border-[#E8EEF2] bg-[#FCFDFE] shadow-[0_10px_24px_rgba(31,43,77,0.04)]"}`}>
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className={`text-[10.5px] font-medium ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Connected to the live Alternus assistant</p>
                <p className={`mt-0.5 text-[9.5px] leading-3 ${dark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>Your prompts are sent to the same API used by the web chat.</p>
              </div>
            </div>
            {composer}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[900px] flex-col justify-end">
      <div className="flex flex-1 flex-col justify-end pb-6">
        <div className="mb-8 flex flex-1 flex-col justify-end gap-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_12px_26px_rgba(29,161,242,0.28)]">
                  <Sparkles className="h-4 w-4 fill-current" />
                </div>
              )}
              <div
                className={`max-w-[720px] rounded-[24px] px-4 py-3 text-[13px] leading-6 shadow-[0_10px_28px_rgba(31,43,77,0.04)] ${
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
            Connected to `/api/ai-chat`
          </div>
        </div>
      </div>

      {composer}
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
        {["Alternus dashboard", "Gallery redesign", "3D catalog"].map((name) => (
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
  const { theme, setTheme, toggleTheme } = useStudioTheme();
  const { openModal, showToast } = useStudioActions();
  const isDark = theme === "dark";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage profile, workspace, plan, appearance, and preferences."
        action={
          <button
            onClick={toggleTheme}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold ${isDark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]" : "border-[#E5E7EB] bg-white text-[#171717] shadow-sm hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Switch to light" : "Switch to dark"}
          </button>
        }
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <SoftCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-[#181B20] text-[#3BA7FF]" : "bg-[#EEF7FC] text-[#1DA1F2]"}`}>
                {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <h3 className={`text-[14px] font-semibold ${isDark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Appearance</h3>
              <p className={`mt-2 max-w-md text-[11px] leading-5 ${isDark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>
                Choose a softer light workspace or a calm dark workspace. Your preference is saved on this browser.
              </p>
            </div>
            <div className={`inline-flex rounded-2xl border p-1 ${isDark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5E7EB] bg-white"}`}>
              <button
                onClick={() => setTheme("light")}
                className={[
                  "inline-flex h-8 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition-all",
                  theme === "light" ? (isDark ? "bg-[rgba(59,167,255,0.14)] text-[#F4F6F8]" : "bg-[#DDEEFF] text-[#4A9BFF]") : (isDark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#6B7280] hover:bg-[#F4F8FB]"),
                ].join(" ")}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={[
                  "inline-flex h-8 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition-all",
                  theme === "dark" ? (isDark ? "bg-[rgba(59,167,255,0.14)] text-[#F4F6F8]" : "bg-[#DDEEFF] text-[#4A9BFF]") : (isDark ? "text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]" : "text-[#6B7280] hover:bg-[#F4F8FB]"),
                ].join(" ")}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </div>
        </SoftCard>
        <SoftCard>
          <h3 className={`text-[13px] font-semibold ${isDark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>Alternus AI Trial</h3>
          <p className={`mt-2 text-[11px] leading-5 ${isDark ? "text-[#A8B0BA]" : "text-[#6B7280]"}`}>12 days left on the Personal workspace trial.</p>
          <div className={`mt-4 h-2 overflow-hidden rounded-full ${isDark ? "bg-[#181B20]" : "bg-[#EEF7FC]"}`}>
            <div className="h-full w-[58%] rounded-full bg-[#4A9BFF]" />
          </div>
          <button onClick={() => openModal("upgrade")} className={`mt-4 inline-flex h-9 items-center rounded-xl px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(74,155,255,0.22)] transition-all active:scale-[0.98] ${isDark ? "bg-[#3BA7FF] hover:bg-[#2D8FF0]" : "bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}>
            Upgrade plan
          </button>
        </SoftCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SoftCard>
          <SettingCardHeader icon={UserRound} title="Profile settings" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Name, email, avatar, role, and account details placeholder.</p>
          <SettingsRows rows={["Display name: Julie", "Email: personal workspace", "Profile photo placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Shield} title="Workspace settings" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Personal workspace controls, members, permissions, and collaboration settings.</p>
          <SettingsRows rows={["Workspace: Personal", "Member invites placeholder", "Default project: AI Assistant"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={CreditCard} title="Billing and plan" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Trial status, upgrade placeholder, invoices, and billing history.</p>
          <SettingsRows rows={["Current plan: Trial", "Billing history placeholder", "Payment method placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Bell} title="Notifications" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Control alerts for prompt lab updates, exports, and workspace changes.</p>
          <SettingsRows rows={["Prompt Lab badge alerts", "Export completion alerts", "Weekly summary placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={KeyRound} title="Security" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Password, sessions, two-factor authentication, and trusted devices.</p>
          <SettingsRows rows={["Password change placeholder", "Active sessions placeholder", "Two-factor authentication placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Plug} title="Integrations" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Connect AutoCAD, Blender, code repositories, and export destinations.</p>
          <SettingsRows rows={["AutoCAD connection placeholder", "Blender bridge placeholder", "Git provider placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Database} title="Data and exports" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Manage workspace data, download history, retention, and import defaults.</p>
          <SettingsRows rows={["Export archive placeholder", "Import defaults placeholder", "Data retention placeholder"]} onRowClick={showToast} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Monitor} title="Display defaults" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Sidebar behavior, compact preview, and dashboard density.</p>
          <SettingsRows rows={["Sidebar collapse preference", "Preview mode placeholder", "Density: Comfortable"]} onRowClick={showToast} />
        </SoftCard>
      </div>
    </div>
  );
}

function SettingCardHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-[#181B20] text-[#3BA7FF]" : "bg-[#EEF7FC] text-[#1DA1F2]"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className={`text-[13px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#171717]"}`}>{title}</h3>
    </div>
  );
}

function SettingsRows({ rows, onRowClick }: { rows: string[]; onRowClick?: (message: string) => void }) {
  const { theme } = useStudioTheme();
  const dark = theme === "dark";
  return (
    <div className="mt-4 space-y-2">
      {rows.map((row) => (
        <button key={row} onClick={() => onRowClick?.(`${row} opened`)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all hover:border-[#CFE8F8] active:scale-[0.99] ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#E5E7EB] bg-white"}`}>
          <span className={`text-[11px] font-medium ${dark ? "text-[#A8B0BA]" : "text-[#4B5563]"}`}>{row}</span>
          <span className={`text-[10px] font-semibold ${dark ? "text-[#6F7782]" : "text-[#A1A7B0]"}`}>Soon</span>
        </button>
      ))}
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
