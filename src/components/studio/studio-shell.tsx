"use client";

import Link from"next/link";
import { usePathname, useRouter } from"next/navigation";
import { signOut } from"next-auth/react";
import {
 AlertTriangle,
 AudioLines,
 Bell,
 Box,
 CheckCircle2,
 ChevronDown,
 ChevronLeft,
 ChevronRight,
 CircleSlash,
 Clock,
 Code2,
 CornerDownLeft,
 Copy,
 CreditCard,
 Download,
 FileText,
 Folder,
 Gamepad2,
 Ghost,
 Globe,
 Grid2X2,
 ImageIcon,
 Layers3,
 MessageCircle,
 Mic,
 Monitor,
 Moon,
 MoreHorizontal,
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
 Trash2,
 Upload,
 UserRound,
 Workflow,
 X,
 type LucideIcon,
} from"lucide-react";
import { ChangeEvent, FormEvent, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from"react";
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
} from"@/lib/studio-repositories";
import {
 type CodeBuilderLayer,
 type CodeBuilderPhase,
 type CodeBuilderPlan,
 generateWebsitePlanFromPrompt,
 normalizeCodeBuilderPlan,
} from"@/lib/code-builder-plan";

export type StudioRouteKey =
 |"studio-overview"
 |"cedium-design"
 |"autocad-design"
 |"code-builder"
 |"blender-3d"
 |"asset-library"
 |"ai-assistant"
 |"prompt-lab"
 |"projects"
 |"exports"
 |"settings"
 |"help-center";

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
 { key:"ai-assistant", label:"AI Assistant", href:"/ai-assistant", icon: Sparkles },
 { key:"studio-overview", label:"Studio Overview", href:"/studio-overview", icon: Grid2X2 },
 { key:"cedium-design", label:"Cedium Design", href:"/cedium-design", icon: Monitor },
 { key:"autocad-design", label:"AutoCAD Design", href:"/autocad-design", icon: PenLine },
 { key:"code-builder", label:"Code Builder", href:"/code-builder", icon: Code2 },
 { key:"blender-3d", label:"Blender 3D", href:"/blender-3d", icon: Layers3 },
 { key:"asset-library", label:"Asset Library", href:"/asset-library", icon: ImageIcon },
 { key:"prompt-lab", label:"Prompt Lab", href:"/prompt-lab", icon: FileText, badge:"2"},
 { key:"projects", label:"Projects", href:"/projects", icon: Folder },
 { key:"exports", label:"Exports", href:"/exports", icon: Upload },
];

const bottomNavigation = [
 { key:"settings"as const, label:"Settings", href:"/settings", icon: Settings },
 { key:"help-center"as const, label:"Help Center", href:"/help-center", icon: AlertTriangle },
];

const assistantRailSections = [
 { id: "assistant-overview", label: "Overview" },
 { id: "assistant-greeting", label: "Greeting" },
 { id: "assistant-mode", label: "Mode" },
 { id: "assistant-starters", label: "Starters" },
 { id: "assistant-workflows", label: "Workflows" },
 { id: "assistant-summary", label: "Summary" },
 { id: "assistant-code", label: "Code" },
 { id: "assistant-design", label: "Design" },
 { id: "assistant-composer", label: "Composer" },
 { id: "assistant-provider", label: "Provider" },
];

const sidebarRecentItems: GeneratedRecent[] = [
 {
 id:"recent-workflow-brief",
 title:"Workflow brief",
 tool:"AI Assistant",
 meta:"Prompt plan",
 time:"Today",
 icon: Workflow,
 output:"A saved workflow brief with trigger logic, required inputs, approval steps, and production notes.",
 },
 {
 id:"recent-landing-page",
 title:"SaaS landing page",
 tool:"Code Builder",
 meta:"React page",
 time:"Yesterday",
 icon: Code2,
 output:"A recent landing page generation with hero copy, pricing structure, component notes, and responsive layout direction.",
 },
 {
 id:"recent-game-scene",
 title:"Cyberpunk city scene",
 tool:"Blender 3D",
 meta:"Environment concept",
 time:"2 days ago",
 icon: Layers3,
 output:"A saved game environment concept with lighting direction, modular asset list, NPC route notes, and optimization checklist.",
 },
];

const routeByPath: Record<string, StudioRouteKey> = {
"/main":"studio-overview",
"/studio-overview":"studio-overview",
"/cedium-design":"cedium-design",
"/autocad-design":"autocad-design",
"/code-builder":"code-builder",
"/blender-3d":"blender-3d",
"/asset-library":"asset-library",
"/ai-assistant":"ai-assistant",
"/prompt-lab":"prompt-lab",
"/projects":"projects",
"/exports":"exports",
"/settings":"settings",
"/help-center":"help-center",
"/ai-assistant/tools/code":"ai-assistant",
"/ai-assistant/tools/blender":"ai-assistant",
"/ai-assistant/tools/autocad":"ai-assistant",
};

type StudioPageProps = {
 route?: StudioRouteKey;
 assistantTool?: AssistantToolKey;
};

type Attachment = {
 id: string;
 name: string;
 kind:"file"|"image"|"document";
};

type StudioTheme ="light"|"dark";
type AssistantToolKey ="code"|"blender"|"autocad";
type StudioModalKey =
 |"search"
 |"quick-settings"
 |"workspace-switch"
 |"workspace-create"
 |"upgrade"
 |"upload-file"
 |"upload-image"
 |"upload-document"
 |"prompt-editor"
 |"project-create"
 |"asset-upload"
 |"voice-dictation"
 |"voice-speak"
 |"support";
type StudioDrawerKey ="profile"|"notifications"|"asset-preview"|"project-detail"|"help-preview";

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
 previewType:"code"|"blender"|"autocad";
 emptyState: string;
};

const assistantToolByPath: Record<string, AssistantToolKey> = {
"/ai-assistant/tools/code":"code",
"/ai-assistant/tools/blender":"blender",
"/ai-assistant/tools/autocad":"autocad",
};

const toolWorkspaces: Record<AssistantToolKey, ToolWorkspaceConfig> = {
 code: {
 key:"code",
 href:"/ai-assistant/tools/code",
 title:"AI for Code",
 description:"Build websites, apps, and digital tools with guided AI coding support.",
 icon: Code2,
 placeholder:"Describe the app, component, bug, or feature you want to build...",
 actionLabel:"Generate",
 quickActions: [
 { title:"Create React Component", desc:"Draft a reusable UI component.", icon: Code2 },
 { title:"Build Landing Page", desc:"Plan a polished conversion page.", icon: Monitor },
 { title:"Fix Code Issue", desc:"Debug errors or broken behavior.", icon: AlertTriangle },
 { title:"Generate API Endpoint", desc:"Create route logic and payloads.", icon: Plug },
 { title:"Explain Existing Code", desc:"Understand files and patterns.", icon: FileText },
 { title:"Convert Design to Code", desc:"Translate UI into components.", icon: PenLine },
 ],
 selectors: [
 { label:"Project type", options: ["Website","Web App","API","Component","Bug Fix"] },
 { label:"Tech stack", options: ["React","Next.js","Vue","Node.js","Go","Rust"] },
 ],
 previewTabs: ["Plan","Code","Preview"],
 previewType:"code",
 emptyState:"Your generated plan, code, or preview will appear here.",
 },
 blender: {
 key:"blender",
 href:"/ai-assistant/tools/blender",
 title:"Blender 3D",
 description:"Create 3D models, scenes, and visual assets from text prompts.",
 icon: Layers3,
 placeholder:"Describe the 3D object, scene, material, or animation you want to create...",
 actionLabel:"Create",
 quickActions: [
 { title:"Create 3D Model", desc:"Generate a focused object brief.", icon: Box },
 { title:"Generate Product Scene", desc:"Stage products with lighting.", icon: Grid2X2 },
 { title:"Design Character", desc:"Shape a stylized character.", icon: Sparkles },
 { title:"Create Materials", desc:"Define textures and surfaces.", icon: ImageIcon },
 { title:"Lighting Setup", desc:"Prepare mood and render lighting.", icon: Monitor },
 { title:"Export Asset", desc:"Package assets for delivery.", icon: Download },
 ],
 selectors: [
 { label:"Asset type", options: ["Object","Scene","Character","Product","Environment"] },
 { label:"Style", options: ["Realistic","Low-poly","Stylized","Isometric","Game-ready"] },
 { label:"Output format", options: ["BLEND","FBX","OBJ","GLB"] },
 ],
 previewType:"blender",
 emptyState:"Your 3D preview or generated asset will appear here.",
 },
 autocad: {
 key:"autocad",
 href:"/ai-assistant/tools/autocad",
 title:"AutoCAD",
 description:"Create CAD drawings, technical layouts, and clean drafting plans with guided AI support.",
 icon: PenLine,
 placeholder:"Describe the CAD drawing, dimensions, layers, or technical plan you want to create...",
 actionLabel:"Draft",
 quickActions: [
 { title:"Create CAD Drawing", desc:"Start a clean technical drawing.", icon: PenLine },
 { title:"Floor Plan Layout", desc:"Draft rooms, walls, and dimensions.", icon: Grid2X2 },
 { title:"Layer Setup", desc:"Organize geometry and annotations.", icon: Layers3 },
 { title:"Dimension Plan", desc:"Prepare measurements and units.", icon: Monitor },
 { title:"DXF Cleanup", desc:"Review imported CAD structure.", icon: FileText },
 { title:"Export DWG/DXF", desc:"Package drawings for delivery.", icon: Upload },
 ],
 selectors: [
 { label:"Drawing type", options: ["Floor Plan","Elevation","Section","Site Plan","Detail"] },
 { label:"Units", options: ["Millimeters","Centimeters","Meters","Inches","Feet"] },
 { label:"Layer options", options: ["Standard","Architecture","Mechanical","Electrical","Custom"] },
 ],
 previewType:"autocad",
 emptyState:"Your CAD drawing preview will appear here.",
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
 const activeRoute = route ?? routeByPath[pathname] ??"ai-assistant";
 const assistantHome = activeRoute ==="ai-assistant"&& !activeTool;

 return (
 <StudioShell activeRoute={activeRoute} assistantHome={assistantHome}>
 <StudioContent route={activeRoute} assistantTool={activeTool} />
 </StudioShell>
 );
}

function StudioShell({ activeRoute, assistantHome = false, children }: { activeRoute: StudioRouteKey; assistantHome?: boolean; children: ReactNode }) {
 const router = useRouter();
 const [theme, setTheme] = useState<StudioTheme>("light");
 const dark = theme ==="dark";
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [isMobileOpen, setIsMobileOpen] = useState(false);
 const [workspaceOpen, setWorkspaceOpen] = useState(false);
 const [notificationsOpen, setNotificationsOpen] = useState(false);
 const [displayOpen, setDisplayOpen] = useState(false);
 const [signOutOpen, setSignOutOpen] = useState(false);
 const [activeModal, setActiveModal] = useState<StudioModalKey | null>(null);
 const [activeDrawer, setActiveDrawer] = useState<StudioDrawerKey | null>(null);
 const [activeRecent, setActiveRecent] = useState<GeneratedRecent | null>(null);
 const [recentItems, setRecentItems] = useState<GeneratedRecent[]>(sidebarRecentItems);
 const [recentMenuId, setRecentMenuId] = useState<string | null>(null);
 const [toast, setToast] = useState<string | null>(null);
 const [isTemporaryChat, setIsTemporaryChat] = useState(false);
 const [temporaryChatId, setTemporaryChatId] = useState<number | null>(null);
 const [newChatId, setNewChatId] = useState<number | null>(null);
 const workspaceRef = useRef<HTMLDivElement>(null);
 const sidebarNotificationRef = useRef<HTMLDivElement>(null);
 const notificationRef = useRef<HTMLDivElement>(null);
 const displayRef = useRef<HTMLDivElement>(null);
 const currentTitle = getRouteTitle(activeRoute);
 const normalizedSidebarSearch ="";
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
 if (savedTheme ==="light"|| savedTheme ==="dark") {
 setTheme(savedTheme);
 }
 const savedDensity = window.localStorage.getItem("Cedium-studio-density");
 if (savedDensity ==="compact"|| savedDensity ==="comfortable") {
 document.documentElement.dataset.studioDensity = savedDensity;
 }
 }, []);

 useEffect(() => {
 window.localStorage.setItem("Cedium-studio-theme", theme);
 }, [theme]);

 const themeValue = useMemo(
 () => ({
 theme,
 setTheme,
 toggleTheme: () => setTheme((value) => (value ==="dark"?"light":"dark")),
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

 const shareRecent = useCallback(async (recent: GeneratedRecent) => {
 const text = `${recent.title}\n${recent.output}`;
 try {
 if (navigator.share) {
 await navigator.share({ title: recent.title, text });
 showToast("Recent item shared");
 return;
 }
 await navigator.clipboard.writeText(text);
 showToast("Recent item copied");
 } catch {
 showToast("Share cancelled");
 }
 }, [showToast]);

 const deleteRecent = useCallback((recentId: string) => {
 setRecentItems((items) => items.filter((item) => item.id !== recentId));
 setRecentMenuId(null);
 setActiveRecent((current) => (current?.id === recentId ? null : current));
 showToast("Recent item deleted");
 }, [showToast]);

 const openRecentWorkspace = useCallback((recent: GeneratedRecent) => {
 setRecentMenuId(null);
 setActiveRecent(null);
 setIsMobileOpen(false);
 router.push(getWorkspaceHrefForRecent(recent));
 }, [router]);

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
 if (event.key ==="Escape") {
 setActiveModal(null);
 setActiveDrawer(null);
 setActiveRecent(null);
 setActionsOpenSafe();
 }
 if (event.key ==="/"&& !event.metaKey && !event.ctrlKey && !event.altKey) {
 const target = event.target as HTMLElement | null;
 const isTyping =
 target?.tagName ==="INPUT"||
 target?.tagName ==="TEXTAREA"||
 target?.getAttribute("contenteditable") ==="true";
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
 ?"bg-[#181A1F]"
 :"bg-[#EAF3F8]",
 isCollapsed ?"w-[60px]":"w-[230px]",
 ].join(" ")}
 >
 <div className={isCollapsed ?"flex min-h-0 flex-1 flex-col px-2":"flex min-h-0 flex-1 flex-col px-3"}>
 <div ref={workspaceRef} className="relative mb-4 flex items-center justify-between">
 {isCollapsed ? (
 <button
 onClick={toggleMenu}
 className={`group mx-auto flex h-7 w-7 items-center justify-center rounded-lg ${dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Expand sidebar"
 >
 <PanelLeft className="h-[14px] w-[14px]"strokeWidth={2.25} />
 </button>
 ) : (
 <>
 <button
 onClick={() => setWorkspaceOpen((value) => !value)}
 className={`group flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-[13px] font-semibold transition-colors ${dark ?"text-[#F4F6F8] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#1F2937] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-expanded={workspaceOpen}
 >
 <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white">
 <Shield className="h-[11px] w-[11px]"strokeWidth={2.25} />
 </span>
 <span className="truncate">Personal</span>
 <ChevronDown className={`h-3 w-3 ${dark ?"text-[#A8B0BA] group-hover:text-[#6EA4FF]":"text-[#64748B] group-hover:text-[#1D9BF0]"}`} strokeWidth={2.25} />
 </button>
 <button
 onClick={startTemporaryChat}
 className={`group flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${isTemporaryChat ? (dark ?"bg-[rgba(59,167,255,0.18)] text-[#3BA7FF]":"bg-[#CFE8F8] text-[#1D9BF0]") : (dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]")}`}
 aria-label="Temporary Chat"
 title="Start temporary chat"
 >
 <MessageCircle className="h-[14px] w-[14px]"strokeWidth={2.25} />
 </button>
 <button
 onClick={toggleMenu}
 className={`group flex h-7 w-7 items-center justify-center rounded-lg ${dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#64748B] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Collapse sidebar"
 >
 <PanelLeft className="h-[14px] w-[14px]"strokeWidth={2.25} />
 </button>
 </>
 )}

 {workspaceOpen && !isCollapsed && (
 <DropdownPanel className="left-0 top-9 w-56">
 <div className="px-3 py-2">
 <p className={`text-[10px] font-medium ${dark ?"text-[#6F7782]":"text-[#8A94A3]"}`}>Current workspace</p>
 <p className={`mt-1 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Personal</p>
 </div>
 <DropdownButton onClick={() => router.push("/settings")} icon={Settings} label="Workspace settings"/>
 <DropdownButton icon={RefreshCw} label="Switch workspace"onClick={() => setActiveModal("workspace-switch")} />
 <DropdownButton icon={Plus} label="Create workspace"onClick={() => setActiveModal("workspace-create")} />
 </DropdownPanel>
 )}
 </div>

 {!isCollapsed && (
 <>
 <button
 type="button"
 onClick={() => setActiveModal("search")}
 className={`mb-3 flex h-10 w-full items-center gap-2 rounded-2xl border px-3 text-left transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] hover:border-[rgba(59,167,255,0.34)]":"border-white/80 bg-white/72 hover:border-[#9BD2FF]"}`}
 aria-label="Open search"
 >
 <Search className={`h-[13px] w-[13px] ${dark ?"text-[#6F7782]":"text-[#9CA3AF]"}`} strokeWidth={2.25} />
 <span className={`min-w-0 flex-1 truncate text-[12px] ${dark ?"text-[#6F7782]":"text-[#A1A7B0]"}`}>Search...</span>
 <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${dark ?"bg-[#202328] text-[#A8B0BA]":"bg-[#F3F6F8] text-[#9CA3AF]"}`}>/</span>
 </button>
 <button
 onClick={startNewChat}
 className="mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#1DA1F2] text-[11px] font-semibold text-white transition-all hover:from-[#2FB2EE] hover:to-[#168ED8]"
 >
 <Plus className="h-3.5 w-3.5"strokeWidth={2.25} />
 New Chat
 <Sparkles className="h-3.5 w-3.5"strokeWidth={2.25} />
 </button>
 </>
 )}

 <nav className="space-y-1">
 {visibleMainNavigation.map((item) => (
 <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
 ))}
 {!isCollapsed && normalizedSidebarSearch && visibleMainNavigation.length === 0 && visibleBottomNavigation.length === 0 && (
 <p className={`px-2.5 py-2 text-[11px] ${dark ?"text-[#6F7782]":"text-[#8A94A3]"}`}>No navigation matches.</p>
 )}
 </nav>

 <div className="mt-3 pt-3">
 {!isCollapsed && <p className={`mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${dark ?"text-[#6F7782]":"text-[#8A94A3]"}`}>Recents</p>}
 {!isCollapsed && (
 <div className="space-y-1">
 {recentItems.map((recent) => (
 <RecentSidebarItem
 key={recent.id}
 recent={recent}
 active={activeRecent?.id === recent.id}
 menuOpen={recentMenuId === recent.id}
 onOpen={() => {
 setRecentMenuId(null);
 setActiveRecent(recent);
 }}
 onMenuToggle={() => setRecentMenuId((current) => (current === recent.id ? null : recent.id))}
 onShare={() => {
 setRecentMenuId(null);
 void shareRecent(recent);
 }}
 onOpenWorkspace={() => openRecentWorkspace(recent)}
 onDelete={() => deleteRecent(recent.id)}
 />
 ))}
 {recentItems.length === 0 && (
 <p className={`px-2.5 py-2 text-[11px] ${dark ?"text-[#6F7782]":"text-[#8A94A3]"}`}>No recents yet.</p>
 )}
 </div>
 )}
 </div>

 <div className="mt-auto">
 <div className="space-y-1 pb-1">
 {visibleBottomNavigation.map((item) => (
 <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
 ))}
 <button
 onClick={() => setSignOutOpen(true)}
 className={[
"group flex h-8 items-center rounded-xl border border-transparent text-left text-[12px] font-medium transition-all",
 dark ?"text-[#A8B0BA] hover:border-[rgba(66,132,255,0.24)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#4B5563] hover:border-[#B7DDF4] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]",
 isCollapsed ?"mx-auto w-8 justify-center px-0":"w-full gap-2 px-2.5",
 ].join("")}
 >
 <Upload className={`h-[13px] w-[13px] rotate-90 ${dark ?"text-[#6F7782] group-hover:text-[#6EA4FF]":"text-[#64748B] group-hover:text-[#1D9BF0]"}`} strokeWidth={2.25} />
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
 <div className={`fixed inset-0 overflow-hidden font-sans ${assistantHome ? dark ?"bg-[#0F1013] text-[#F4F6F8] studio-shell-dark":"bg-white text-[#171717]" : dark ?"bg-[#0F1013] text-[#F4F6F8] studio-shell-dark":"bg-[#F6FAFC] text-[#171717]"}`}>
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
 background: #181a1f !important;
 border: none !important;
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
 .studio-shell-dark .studio-main-frame {
 background: #17191d !important;
 border-color: rgba(255, 255, 255, 0.08) !important;
 }
 .studio-shell-dark section.studio-content-surface {
 background: transparent !important;
 border-color: transparent !important;
 box-shadow: none !important;
 }
 `}</style>
 <div className="flex h-full">
 <div className={assistantHome ?"hidden":"hidden lg:block"}>{sidebar}</div>
 {!assistantHome && isMobileOpen && (
 <div className="fixed inset-0 z-40 lg:hidden">
 <button className={`absolute inset-0 ${dark ?"bg-black/40 backdrop-blur-[2px]":"bg-[#1F2937]/20 backdrop-blur-[2px]"}`} onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar"/>
 <div className="relative h-full w-[230px] rounded-none shadow-[18px_0_50px_rgba(31,43,77,0.16)]">{sidebar}</div>
 </div>
 )}

 <main className={`flex min-w-0 flex-1 flex-col ${assistantHome ? dark ?"bg-[#0F1013] p-0":"bg-white p-0" : `p-[6px] pl-0 ${dark ? "bg-[#181A1F]" : "bg-[#EAF3F8]"}`}`}>
 <div className={`studio-main-frame flex min-h-0 flex-1 flex-col overflow-hidden ${assistantHome ? dark ?"rounded-none border-0 bg-[#0F1013]":"rounded-none border-0 bg-white" : dark ?"rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[#17191D]":"rounded-[8px] border border-[#DDE7EE] bg-white"}`}>
 {!assistantHome && <header className={`flex h-11 items-center justify-between border-b px-3 ${dark ?"border-[rgba(255,255,255,0.08)]":"border-[#E8EEF2]"}`}>
 <div className="flex min-w-0 items-center gap-3">
 <div className={`relative flex items-center gap-2 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>
 <div ref={notificationRef} className="relative">
 <button
 onClick={() => setActiveDrawer("notifications")}
 className={`group relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ?"border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"bg-white/70 text-[#6B7280] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Notifications"
 >
 <Bell className="h-[13px] w-[13px]"strokeWidth={2.25} />
 <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF3B6B]"/>
 </button>
 {notificationsOpen && <NotificationsDropdown align="left"/>}
 </div>
 <button
 onClick={() => setActiveModal("quick-settings")}
 className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ?"border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"bg-white/70 text-[#6B7280] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Open settings"
 >
 <Settings className="h-[13px] w-[13px]"strokeWidth={2.25} />
 </button>
 <div ref={displayRef} className="relative">
 <button
 onClick={() => setDisplayOpen((value) => !value)}
 className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${dark ?"border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"bg-white/70 text-[#6B7280] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Display preview"
 >
 <Monitor className="h-[13px] w-[13px]"strokeWidth={2.25} />
 </button>
 {displayOpen && <DisplayDropdown />}
 </div>
 </div>
 <h1 className={`truncate text-[15px] font-semibold tracking-[-0.01em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{currentTitle}</h1>
 </div>
 <Link
 href="/account"
 className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold tracking-[-0.02em] transition-colors ${dark ?"border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#7DD3FC] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"bg-white text-[#4284FF] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]"}`}
 aria-label="Open account profile"
 >
 AL
 </Link>
 </header>}

 <section
 className={[
 "studio-content-surface",
 activeRoute ==="ai-assistant"?"min-h-0 flex-1":"min-h-0 flex-1",
 activeRoute ==="ai-assistant"?"overflow-hidden flex flex-col":"overflow-auto",
 activeRoute ==="ai-assistant"?"p-0": activeRoute ==="code-builder"?"px-4 py-4":"px-8 py-8",
 dark ?"bg-transparent":"bg-transparent",
 ].join(" ")}
 >
 <div className={
 activeRoute ==="ai-assistant"
 ?"flex min-h-0 w-full flex-1 flex-col"
 : activeRoute ==="code-builder"
 ?"w-full"
 :"mx-auto w-full max-w-[1180px]"
 }>
 {children}
 </div>
 </section>
 </div>
 </main>
 </div>

 {signOutOpen && (
 <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ?"bg-black/45":"bg-[#1F2937]/20"}`}>
 <div className={`w-full max-w-sm rounded-3xl border p-5 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[16px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Sign out</h2>
 <p className={`mt-2 text-[13px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Are you sure you want to sign out?</p>
 </div>
 <button onClick={() => setSignOutOpen(false)} className={`rounded-lg p-1 ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`}>
 <X className="h-4 w-4"/>
 </button>
 </div>
 <div className="mt-6 flex justify-end gap-2">
 <button onClick={() => setSignOutOpen(false)} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"}`}>
 Cancel
 </button>
 <button
 onClick={() => signOut({ callbackUrl:"/login"})}
 className={`rounded-xl px-4 py-2 text-[12px] font-semibold text-white ${dark ?"bg-[#3BA7FF] hover:bg-[#2D8FF0]":"bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
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
 const { showToast, openDrawer } = useStudioActions();
 const dark = theme ==="dark";
 const content = getModalContent(modal);

 const submitAction = () => {
 showToast(content.success);
 onClose();
 };

 return (
 <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ?"bg-black/45":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <div
 className={`w-full max-w-xl rounded-3xl border p-5 transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`}
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{content.title}</h2>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{content.description}</p>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close">
 <X className="h-4 w-4"/>
 </button>
 </div>

 {modal ==="search"&& <SearchFrame onClose={onClose} />}
 {modal ==="quick-settings"&& (
 <div className="mt-5 space-y-3">
 <ModalRow icon={theme ==="dark"? Moon : Sun} title={`${theme ==="dark"?"Dark":"Light"} mode`} desc="Toggle the workspace appearance."action="Toggle"onClick={toggleTheme} />
 <ModalRow icon={Bell} title="Notifications"desc="Review workspace notification preferences."action="Open"onClick={() => { onClose(); openDrawer("notifications"); }} />
 <ModalRow icon={UserRound} title="Account settings"desc="Manage your profile and plan."action="Settings"href="/settings"/>
 <ModalRow icon={Shield} title="Workspace settings"desc="Manage the Personal workspace."action="Manage"href="/settings"/>
 </div>
 )}
 {modal ==="upgrade"&& <UpgradeFrame />}
 {modal ==="workspace-switch"&& <ChoiceList items={["Personal","Studio Team","Client Workspace"]} active="Personal"/>}
 {modal ==="workspace-create"&& <SimpleForm placeholder="New workspace name"/>}
 {modal ==="prompt-editor"&& <PromptEditorFrame />}
 {modal ==="project-create"&& <SimpleForm placeholder="Project name"extra="Choose a short project name and start from a clean workspace."/>}
 {modal ==="asset-upload"&& <UploadFrame kind="asset"/>}
 {modal ==="upload-file"&& <UploadFrame kind="file"/>}
 {modal ==="upload-image"&& <UploadFrame kind="image"/>}
 {modal ==="upload-document"&& <UploadFrame kind="document"/>}
 {modal ==="voice-dictation"&& <VoiceFrame mode="dictation"/>}
 {modal ==="voice-speak"&& <VoiceFrame mode="speak"/>}
 {modal ==="support"&& <SimpleForm placeholder="How can support help?"extra="Send a short support request. The team will follow up in your workspace."/>}

 <div className="mt-6 flex justify-end gap-2">
 <button onClick={onClose} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"}`}>Cancel</button>
 <button onClick={submitAction} className="rounded-xl bg-[#4A9BFF] px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-[#2D8FF0]">
 {content.action}
 </button>
 </div>
 </div>
 </div>
 );
}

function StudioDrawer({ drawer, onClose }: { drawer: StudioDrawerKey; onClose: () => void }) {
 const { theme } = useStudioTheme();
 const { showToast, openModal } = useStudioActions();
 const dark = theme ==="dark";
 const title = drawer ==="profile"?"Profile": drawer ==="notifications"?"Notifications": drawer ==="asset-preview"?"Asset details": drawer ==="project-detail"?"Project details":"Help article";

 return (
 <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ?"bg-black/35":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <aside
 className={`h-full w-full max-w-md border-l p-5 transition-all shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`}
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{title}</h2>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>A clean side panel for contextual workspace actions.</p>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close drawer">
 <X className="h-4 w-4"/>
 </button>
 </div>

 {drawer ==="profile"&& (
 <div className="mt-5 space-y-3">
 <div className={`rounded-2xl border p-4 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5E7EB] bg-[#FCFDFE]"}`}>
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <UserRound className="h-5 w-5"/>
 </div>
 <div>
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Personal workspace</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Trial plan - 12 days left</p>
 </div>
 </div>
 </div>
 <DrawerAction icon={Settings} label="Account settings"href="/settings"/>
 <DrawerAction icon={CreditCard} label="Billing and plan"href="/settings"/>
 <DrawerAction icon={RefreshCw} label="Switch workspace"onClick={() => { onClose(); openModal("workspace-switch"); }} />
 <DrawerAction icon={Upload} label="Sign out"onClick={() => signOut({ callbackUrl:"/login"})} />
 </div>
 )}

 {drawer ==="notifications"&& (
 <div className="mt-5 space-y-3">
 <button onClick={() => showToast("All notifications marked as read")} className="mb-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8]">Mark all as read</button>
 {["Prompt Lab has 2 drafts ready","Latest export is available","Workspace settings synced"].map((item) => (
 <div key={item} className={`rounded-2xl border p-3 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5E7EB] bg-[#FCFDFE]"}`}>
 <p className={`text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{item}</p>
 <p className={`mt-1 text-[10.5px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Just now</p>
 </div>
 ))}
 </div>
 )}

 {drawer !=="profile"&& drawer !=="notifications"&& (
 <div className={`mt-5 rounded-2xl border border-dashed p-6 text-center ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5E7EB] bg-[#FCFDFE]"}`}>
 <Sparkles className="mx-auto h-6 w-6 text-[#4A9BFF]"/>
 <p className={`mt-3 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Details will appear here</p>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Select an item to inspect it without leaving the workspace.</p>
 </div>
 )}
 </aside>
 </div>
 );
}

function RecentOutputDrawer({ recent, onClose }: { recent: GeneratedRecent; onClose: () => void }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 const RecentIcon = recent.icon;

 return (
 <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ?"bg-black/35":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <aside
 className={`h-full w-full max-w-md border-l p-5 transition-all shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`}
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex min-w-0 items-start gap-3">
 <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <RecentIcon className="h-5 w-5"/>
 </div>
 <div className="min-w-0">
 <p className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${dark ?"text-[#6F7782]":"text-[#8A94A3]"}`}>{recent.tool}</p>
 <h2 className={`mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{recent.title}</h2>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{recent.meta} - {recent.time}</p>
 </div>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close recent output">
 <X className="h-4 w-4"/>
 </button>
 </div>

 <div className={`mt-5 rounded-3xl border p-4 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-[#FCFDFE]"}`}>
 <p className={`text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Generated output</p>
 <p className={`mt-3 text-[12px] leading-6 ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`}>{recent.output}</p>
 </div>

 <div className={`mt-4 rounded-3xl border border-dashed p-6 text-center ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#DCEBFA] bg-white"}`}>
 <RecentIcon className="mx-auto h-7 w-7 text-[#4A9BFF]"/>
 <p className={`mt-3 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Ready to continue</p>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Review the generated output, then continue refining it from the matching workspace.</p>
 </div>
 </aside>
 </div>
 );
}

function StudioToast({ message }: { message: string }) {
 return (
 <div className="fixed bottom-5 right-5 z-[60] rounded-2xl border border-[#DCEBFA] bg-white px-4 py-3 text-[12px] font-semibold text-[#171717]">
 {message}
 </div>
 );
}

function getModalContent(modal: StudioModalKey) {
 const map: Record<StudioModalKey, { title: string; description: string; action: string; success: string }> = {
 search: { title:"Search workspace", description:"Find projects, prompts, assets, exports, and help without leaving this screen.", action:"Search", success:"Search opened"},
"quick-settings": { title:"Quick settings", description:"Adjust common workspace preferences or jump into full settings.", action:"Done", success:"Settings updated"},
"workspace-switch": { title:"Switch workspace", description:"Choose another workspace or continue in Personal.", action:"Switch", success:"Workspace switched"},
"workspace-create": { title:"Create workspace", description:"Start a clean workspace for a new client, team, or project.", action:"Create", success:"Workspace created"},
 upgrade: { title:"Upgrade to Pro", description:"Review your current trial and unlock higher limits for production workflows.", action:"Upgrade", success:"Upgrade flow started"},
"upload-file": { title:"Import file", description:"Upload common project files and attach them to the current workspace.", action:"Upload", success:"File added"},
"upload-image": { title:"Upload image", description:"Add an image reference with preview support.", action:"Upload image", success:"Image added"},
"upload-document": { title:"Upload document", description:"Attach PDFs, docs, text files, and markdown documents.", action:"Upload document", success:"Document added"},
"prompt-editor": { title:"Create prompt", description:"Save a reusable prompt template for future workflows.", action:"Save prompt", success:"Prompt saved"},
"project-create": { title:"Create project", description:"Create a project container for generated outputs and assets.", action:"Create project", success:"Project created"},
"asset-upload": { title:"Upload asset", description:"Add images, 3D models, CAD files, documents, or generated outputs.", action:"Upload asset", success:"Asset uploaded"},
"voice-dictation": { title:"Voice dictation", description:"Speak directly into the composer and turn speech into a clean prompt draft.", action:"Start dictation", success:"Voice dictation ready"},
"voice-speak": { title:"Voice Speak", description:"Open a focused voice frame for hands-free conversation with Cedium.", action:"Start voice", success:"Voice Speak ready"},
 support: { title:"Contact support", description:"Send a short support request from your workspace.", action:"Send request", success:"Support request sent"},
 };
 return map[modal];
}

function SearchFrame({ onClose }: { onClose: () => void }) {
 const [query, setQuery] = useState("");
 const searchTargets = [
 ...studioNavigation.map((item) => ({ title: item.label, desc: "Open studio workspace", href: item.href, icon: item.icon })),
 ...bottomNavigation.map((item) => ({ title: item.label, desc: "Open workspace settings area", href: item.href, icon: item.icon })),
 { title:"AI for Code", desc:"Open guided code assistant", href:"/ai-assistant/tools/code", icon: Code2 },
 { title:"AI for Blender", desc:"Open guided 3D assistant", href:"/ai-assistant/tools/blender", icon: Layers3 },
 { title:"AI for AutoCAD", desc:"Open guided CAD assistant", href:"/ai-assistant/tools/autocad", icon: PenLine },
 { title:"Workspace Files", desc:"Open file workspace", href:"/workspace/files", icon: Folder },
 ];
 const normalizedQuery = query.trim().toLowerCase();
 const results = normalizedQuery
 ? searchTargets.filter((item) => `${item.title} ${item.desc}`.toLowerCase().includes(normalizedQuery)).slice(0, 6)
 : searchTargets.slice(0, 6);

 return (
 <div className="mt-5 space-y-4">
 <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#E5EAF0] bg-[#FCFDFE] px-4">
 <Search className="h-4 w-4 text-[#9CA3AF]"/>
 <input
 autoFocus
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]"
 placeholder="Search projects, prompts, assets, exports, and help..."
 />
 <span className="rounded-md bg-[#F3F6F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">Enter</span>
 </div>
 <div className="grid gap-2">
 {results.map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={`${item.title}-${item.href}`}
 href={item.href}
 onClick={onClose}
 className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3 transition-all hover:border-[#BBD4FF] hover:bg-[#F8FBFF]"
 >
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Icon className="h-4 w-4"/>
 </span>
 <span className="min-w-0 flex-1">
 <span className="block text-[12px] font-semibold text-[#171717]">{item.title}</span>
 <span className="mt-1 block text-[10.5px] leading-4 text-[#6B7280]">{item.desc}</span>
 </span>
 <ChevronRight className="h-4 w-4 text-[#9CA3AF]"/>
 </Link>
 );
 })}
 {results.length === 0 && (
 <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FCFDFE] p-4 text-center">
 <p className="text-[12px] font-semibold text-[#171717]">No matches</p>
 <p className="mt-1 text-[11px] text-[#6B7280]">Try searching for assistant, code, project, asset, export, or settings.</p>
 </div>
 )}
 </div>
 </div>
 );
}

function UploadFrame({ kind }: { kind:"file"|"image"|"document"|"asset"}) {
 const label = kind ==="image"?"PNG, JPG, WEBP": kind ==="document"?"PDF, DOCX, TXT, MD": kind ==="asset"?"Images, 3D models, CAD files, documents":"Any supported workspace file";
 return (
 <div className="mt-5 rounded-2xl border border-dashed border-[#CFE8F8] bg-[#FAFCFD] p-6 text-center">
 <Upload className="mx-auto h-7 w-7 text-[#4A9BFF]"/>
 <p className="mt-3 text-[13px] font-semibold text-[#171717]">Drop files here or browse</p>
 <p className="mt-2 text-[12px] text-[#6B7280]">{label}</p>
 <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF7FC]">
 <div className="h-full w-[18%] rounded-full bg-[#4A9BFF]"/>
 </div>
 </div>
 );
}

function VoiceFrame({ mode }: { mode:"dictation"|"speak" }) {
 const bars = mode ==="dictation"
 ? [12, 28, 18, 34, 46, 24, 40, 58, 32, 20, 36, 52, 26, 18]
 : [18, 36, 54, 28, 62, 42, 74, 48, 68, 34, 56, 30, 44, 22];
 const isDictation = mode ==="dictation";

 return (
 <div className="mt-5 overflow-hidden rounded-3xl border border-[#DCEBFA] bg-[linear-gradient(180deg,#F8FCFF_0%,#FFFFFF_100%)]">
 <div className="p-5">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4FB] text-[#1D9BF0]">
 {isDictation ? <Mic className="h-5 w-5"/> : <AudioLines className="h-5 w-5"/>}
 </span>
 <div>
 <p className="text-[13px] font-semibold text-[#171717]">{isDictation ? "Composer microphone" : "Live voice session"}</p>
 <p className="mt-1 text-[11px] text-[#6B7280]">{isDictation ? "Records your instruction as editable text." : "Starts a spoken assistant frame."}</p>
 </div>
 </div>
 <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F4FB] px-3 py-1 text-[11px] font-semibold text-[#1D9BF0]">
 <span className="h-2 w-2 rounded-full bg-[#1D9BF0]"/>
 Ready
 </span>
 </div>

 <div className="mt-6 flex h-24 items-center justify-center gap-1.5 rounded-3xl border border-[#E5EAF0] bg-white">
 {bars.map((height, index) => (
 <span
 key={`${height}-${index}`}
 className="w-1.5 rounded-full bg-[#1D9BF0]"
 style={{ height: `${height}%`, opacity: 0.35 + ((index % 5) * 0.12) }}
 />
 ))}
 </div>

 <div className="mt-4 grid gap-3 sm:grid-cols-3">
 {(isDictation
 ? [
 { label:"Language", value:"Auto detect" },
 { label:"Output", value:"Prompt draft" },
 { label:"Privacy", value:"No storage" },
 ]
 : [
 { label:"Mode", value:"Conversation" },
 { label:"Interruptions", value:"Enabled" },
 { label:"Transcript", value:"Workspace only" },
 ]
 ).map((item) => (
 <div key={item.label} className="rounded-2xl border border-[#E5EAF0] bg-[#FCFDFE] p-3">
 <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A94A3]">{item.label}</p>
 <p className="mt-1 text-[12px] font-semibold text-[#171717]">{item.value}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

function UpgradeFrame() {
 return (
 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 {["More generations","Larger exports","Priority workspace"].map((benefit) => (
 <div key={benefit} className="rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3">
 <CheckCircle2 className="h-4 w-4 text-[#4A9BFF]"/>
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
 <button key={item} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[12px] font-semibold transition-all ${item === active ?"border-[#CFE8F8] bg-[#EEF7FF] text-[#171717]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8]"}`}>
 {item}
 {item === active && <CheckCircle2 className="h-4 w-4 text-[#4A9BFF]"/>}
 </button>
 ))}
 </div>
 );
}

function SimpleForm({ placeholder, extra }: { placeholder: string; extra?: string }) {
 return (
 <div className="mt-5 space-y-3">
 <input className="h-11 w-full rounded-2xl border border-[#E5EAF0] bg-white px-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]"placeholder={placeholder} />
 {extra && <p className="text-[11px] leading-5 text-[#6B7280]">{extra}</p>}
 </div>
 );
}

function PromptEditorFrame() {
 return (
 <div className="mt-5 space-y-3">
 <input className="h-11 w-full rounded-2xl border border-[#E5EAF0] bg-white px-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]"placeholder="Prompt title"/>
 <textarea className="min-h-[120px] w-full resize-none rounded-2xl border border-[#E5EAF0] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0] focus:border-[#9BD2FF]"placeholder="Write the reusable prompt..."/>
 </div>
 );
}

function ModalRow({ icon: Icon, title, desc, action, onClick, href }: { icon: LucideIcon; title: string; desc: string; action: string; onClick?: () => void; href?: string }) {
 const content = (
 <>
 <Icon className="h-4 w-4 text-[#4A9BFF]"/>
 <span className="min-w-0 flex-1">
 <span className="block text-[12px] font-semibold text-[#171717]">{title}</span>
 <span className="mt-1 block text-[10.5px] leading-4 text-[#6B7280]">{desc}</span>
 </span>
 <span className="text-[11px] font-semibold text-[#4A9BFF]">{action}</span>
 </>
 );
 if (href) {
 return <Link href={href} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3 transition-all hover:border-[#CFE8F8]">{content}</Link>;
 }
 return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] p-3 text-left transition-all hover:border-[#CFE8F8]">{content}</button>;
}

function DrawerAction({ icon: Icon, label, href, onClick }: { icon: LucideIcon; label: string; href?: string; onClick?: () => void }) {
 const className ="flex h-10 w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] px-3 text-[12px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8]";
 const content = (
 <>
 <Icon className="h-4 w-4 text-[#4A9BFF]"/>
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
 item: Pick<NavItem,"href"|"icon"|"label"|"badge">;
 active: boolean;
 collapsed: boolean;
 onNavigate: () => void;
}) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 const Icon = item.icon;

 return (
 <Link
 href={item.href}
 onClick={onNavigate}
 title={collapsed ? item.label : undefined}
 className={[
"group flex h-8 items-center rounded-xl border border-transparent text-left text-[12px] font-medium transition-all",
 dark ?"hover:border-[rgba(66,132,255,0.24)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"hover:border-[#B7DDF4] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]",
 collapsed ?"mx-auto w-8 justify-center px-0":"w-full gap-2 px-2.5",
 ].join("")}
 style={{
 background: active ? (dark ?"rgba(59,167,255,0.14)":"#FFFFFF") : undefined,
 borderColor: active ? (dark ?"rgba(59,167,255,0.18)":"rgba(229,231,235,0.95)") : undefined,
 boxShadow: active ? (dark ?"0 10px 24px rgba(0,0,0,0.22)":"0 8px 18px rgba(31,43,77,0.06)") : undefined,
 color: active ? (dark ?"#F4F6F8":"#171717") : undefined,
 }}
 >
 <Icon className={`h-[13px] w-[13px] flex-shrink-0 ${dark ?"group-hover:text-[#6EA4FF]":"group-hover:text-[#1D9BF0]"} ${active ?"text-[#1D9BF0]": dark ?"text-[#A8B0BA]":"text-[#64748B]"}`} strokeWidth={2.25} />
 {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
 {!collapsed && item.badge && (
 <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3B6B] px-1 text-[10px] font-bold text-white">{item.badge}</span>
 )}
 </Link>
 );
}

function RecentSidebarItem({
 recent,
 active,
 menuOpen,
 onOpen,
 onMenuToggle,
 onShare,
 onOpenWorkspace,
 onDelete,
}: {
 recent: GeneratedRecent;
 active: boolean;
 menuOpen: boolean;
 onOpen: () => void;
 onMenuToggle: () => void;
 onShare: () => void;
 onOpenWorkspace: () => void;
 onDelete: () => void;
}) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";

 return (
 <div className="group relative">
 <button
 type="button"
 onClick={onOpen}
 title={recent.title}
 className={[
 "flex h-8 w-full items-center rounded-xl border border-transparent pr-8 text-left text-[12px] font-medium transition-all",
 dark ?"text-[#A8B0BA] hover:border-[rgba(66,132,255,0.24)] hover:bg-[rgba(66,132,255,0.2)] hover:text-[#6EA4FF]":"text-[#4B5563] hover:border-[#B7DDF4] hover:bg-[#CFE8F8] hover:text-[#1D9BF0]",
 ].join(" ")}
 style={{
 background: active ? (dark ?"rgba(59,167,255,0.14)":"#FFFFFF") : undefined,
 borderColor: active ? (dark ?"rgba(59,167,255,0.18)":"rgba(229,231,235,0.95)") : undefined,
 boxShadow: active ? (dark ?"0 10px 24px rgba(0,0,0,0.22)":"0 8px 18px rgba(31,43,77,0.06)") : undefined,
 color: active ? (dark ?"#F4F6F8":"#171717") : undefined,
 }}
 >
 <span className="min-w-0 flex-1 truncate px-2.5">{recent.title}</span>
 </button>
 <button
 type="button"
 onClick={(event) => {
 event.stopPropagation();
 onMenuToggle();
 }}
 aria-label={`Open actions for ${recent.title}`}
 className={[
 "absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100",
 menuOpen ? "opacity-100" : "",
 dark ?"text-[#A8B0BA] hover:bg-[#181B20] hover:text-[#F4F6F8]":"text-[#64748B] hover:bg-white hover:text-[#1D9BF0]",
 ].join(" ")}
 >
 <MoreHorizontal className="h-3.5 w-3.5"/>
 </button>
 {menuOpen && (
 <div
 className={`absolute right-0 top-8 z-50 w-36 rounded-2xl border p-1.5 shadow-[0_16px_40px_rgba(31,43,77,0.14)] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E8EEF2] bg-white"}`}
 onClick={(event) => event.stopPropagation()}
 >
 <button
 type="button"
 onClick={onOpenWorkspace}
 className={`flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-left text-[12px] font-semibold transition-colors ${dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.14)] hover:text-[#6EA4FF]":"text-[#4B5563] hover:bg-[#EEF7FF] hover:text-[#1D9BF0]"}`}
 >
 <ChevronRight className="h-3.5 w-3.5"/>
 Open
 </button>
 <button
 type="button"
 onClick={onShare}
 className={`flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-left text-[12px] font-semibold transition-colors ${dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.14)] hover:text-[#6EA4FF]":"text-[#4B5563] hover:bg-[#EEF7FF] hover:text-[#1D9BF0]"}`}
 >
 <Share2 className="h-3.5 w-3.5"/>
 Share
 </button>
 <button
 type="button"
 onClick={onDelete}
 className={`flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-left text-[12px] font-semibold transition-colors ${dark ?"text-[#FCA5A5] hover:bg-[rgba(239,68,68,0.12)]":"text-[#D92D52] hover:bg-[#FFF1F3]"}`}
 >
 <Trash2 className="h-3.5 w-3.5"/>
 Delete
 </button>
 </div>
 )}
 </div>
 );
}

function DropdownPanel({ children, className =""}: { children: ReactNode; className?: string }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <div className={`absolute z-50 rounded-2xl border p-1.5 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E8EEF2] bg-white"} ${className}`}>
 {children}
 </div>
 );
}

function DropdownButton({ icon: Icon, label, onClick, muted }: { icon: LucideIcon; label: string; onClick?: () => void; muted?: boolean }) {
 const { theme } = useStudioTheme();
 const { showToast } = useStudioActions();
 const dark = theme ==="dark";
 return (
 <button
 onClick={() => (onClick ? onClick() : showToast(`${label} is ready to configure`))}
 className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-medium transition-colors ${dark ?"text-[#A8B0BA] hover:bg-[rgba(66,132,255,0.14)] hover:text-[#6EA4FF]":"text-[#4B5563] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}
 >
 <Icon className={`h-3.5 w-3.5 ${dark ?"text-[#6F7782] group-hover:text-[#6EA4FF]":"text-[#6B7280] group-hover:text-[#4A9BFF]"}`} strokeWidth={2.25} />
 <span>{label}</span>
 {muted && <span className={`ml-auto text-[10px] ${dark ?"text-[#6F7782]":"text-[#A1A7B0]"}`}>Soon</span>}
 </button>
 );
}

function NotificationsDropdown({ align ="right"}: { align?:"left"|"right"}) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <DropdownPanel className={`${align ==="left"?"left-0":"right-0"} top-9 w-72`}>
 <div className="px-3 py-2">
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Notifications</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Recent workspace updates</p>
 </div>
 {[
 ["Prompt Lab","2 prompts are ready for review."],
 ["Exports","Latest render is queued for download."],
 ["Workspace","Personal workspace synced locally."],
 ].map(([title, desc]) => (
 <div key={title} className={`rounded-xl px-3 py-2 ${dark ?"hover:bg-[rgba(255,255,255,0.06)]":"hover:bg-[#F4F8FB]"}`}>
 <p className={`text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{title}</p>
 <p className={`mt-0.5 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{desc}</p>
 </div>
 ))}
 </DropdownPanel>
 );
}

function DisplayDropdown() {
 const { theme, toggleTheme } = useStudioTheme();
 const { showToast } = useStudioActions();
 const dark = theme ==="dark";
 const enterFullscreen = () => {
 document.documentElement.requestFullscreen?.();
 showToast("Fullscreen requested");
 };
 const toggleDensity = () => {
 const current = document.documentElement.dataset.studioDensity;
 const next = current ==="compact"?"comfortable":"compact";
 document.documentElement.dataset.studioDensity = next;
 window.localStorage.setItem("Cedium-studio-density", next);
 showToast(`${next ==="compact"?"Compact":"Comfortable"} density applied`);
 };

 return (
 <DropdownPanel className="right-0 top-9 w-60">
 <div className="px-3 py-2">
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Display preview</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Layout and preview controls</p>
 </div>
 <DropdownButton icon={Monitor} label="Preview workspace"onClick={enterFullscreen} />
 <DropdownButton icon={Grid2X2} label="Toggle density"onClick={toggleDensity} />
 <DropdownButton icon={theme ==="dark"? Sun : Moon} label={`Switch to ${theme ==="dark"?"light":"dark"} mode`} onClick={toggleTheme} />
 </DropdownPanel>
 );
}

function StudioContent({ route, assistantTool }: { route: StudioRouteKey; assistantTool?: AssistantToolKey }) {
 switch (route) {
 case"studio-overview":
 return <OverviewPage />;
 case"cedium-design":
 return <CediumDesignPage />;
 case"autocad-design":
 return <AutoCADPage />;
 case"code-builder":
 return <CodeBuilderPage />;
 case"blender-3d":
 return <BlenderPage />;
 case"asset-library":
 return <AssetLibraryPage />;
 case"prompt-lab":
 return <PromptLabPage />;
 case"projects":
 return <ProjectsPage />;
 case"exports":
 return <ExportsPage />;
 case"settings":
 return <SettingsPage />;
 case"help-center":
 return <HelpCenterPage />;
 case"ai-assistant":
 default:
 if (assistantTool) return <ToolWorkspace config={toolWorkspaces[assistantTool]} />;
 return <AIAssistantPage />;
 }
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h2 className={`text-[26px] font-semibold tracking-[-0.03em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{title}</h2>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{subtitle}</p>
 </div>
 {action}
 </div>
 );
}

function SoftCard({ children, className =""}: { children: ReactNode; className?: string }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return <div className={`rounded-2xl border p-4 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#EAECEF] bg-[#FCFDFE]"} ${className}`}>{children}</div>;
}

function ClickableSoftCard({ children, className ="", onClick, ariaLabel }: { children: ReactNode; className?: string; onClick: () => void; ariaLabel: string }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <button
 onClick={onClick}
 aria-label={ariaLabel}
 className={`rounded-2xl border p-4 text-left transition-all duration-200 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328] hover:border-[rgba(59,167,255,0.24)]":"border-[#EAECEF] bg-[#FCFDFE] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"} ${className}`}
 >
 {children}
 </button>
 );
}

function PrimaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: LucideIcon; onClick?: () => void }) {
 const { theme } = useStudioTheme();
 const { showToast } = useStudioActions();
 const dark = theme ==="dark";
 return (
 <button onClick={() => (onClick ? onClick() : showToast("Action opened"))} className={`inline-flex h-9 items-center gap-2 rounded-xl px-4 text-[12px] font-semibold transition-all ${dark ?"bg-[#3BA7FF] text-white hover:bg-[#2D8FF0]":"bg-[#4A9BFF] text-white hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}>
 {Icon && <Icon className="h-3.5 w-3.5"/>}
 {children}
 </button>
 );
}

function SecondaryButton({ children, icon: Icon, onClick }: { children: ReactNode; icon?: LucideIcon; onClick?: () => void }) {
 const { theme } = useStudioTheme();
 const { showToast } = useStudioActions();
 const dark = theme ==="dark";
 return (
 <button onClick={() => (onClick ? onClick() : showToast("Action opened"))} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.24)] hover:text-[#F4F6F8]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8] hover:text-[#171717]"}`}>
 {Icon && <Icon className="h-3.5 w-3.5"/>}
 {children}
 </button>
 );
}

function ToolWorkspace({ config }: { config: ToolWorkspaceConfig }) {
 const { theme } = useStudioTheme();
 const { openModal, showToast } = useStudioActions();
 const dark = theme ==="dark";
 const Icon = config.icon;
 const [activeTab, setActiveTab] = useState(config.previewTabs?.[0] ??"Preview");
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
 <div className={`flex items-center gap-1.5 text-[12px] font-medium ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>
 <Link href="/ai-assistant"className={`${dark ?"hover:text-[#F4F6F8]":"hover:text-[#171717]"}`}>AI Assistant</Link>
 <span>/</span>
 <span className={dark ?"text-[#F4F6F8]":"text-[#171717]"}>{config.title}</span>
 </div>
 <Link
 href="/ai-assistant"
 className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:border-[rgba(59,167,255,0.24)] hover:text-[#F4F6F8]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8] hover:text-[#171717]"}`}
 >
 <ChevronLeft className="h-3.5 w-3.5"/>
 Back to AI Assistant
 </Link>
 </div>

 <div className={`rounded-3xl border p-5 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E8EEF2] bg-[#FCFDFE]"}`}>
 <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex min-w-0 items-start gap-4">
 <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <Icon className="h-5 w-5"/>
 </div>
 <div className="min-w-0">
 <h2 className={`text-[25px] font-semibold tracking-[-0.03em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{config.title}</h2>
 <p className={`mt-2 max-w-2xl text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{config.description}</p>
 </div>
 </div>
 <div className={`flex min-h-[58px] w-full items-center gap-2 rounded-2xl border px-3 py-2 lg:max-w-[460px] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}>
 <Sparkles className="h-4 w-4 flex-shrink-0 text-[#4A9BFF]"/>
 <input
 value={prompt}
 onChange={(event) => setPrompt(event.target.value)}
 className={`min-w-0 flex-1 bg-transparent text-[12px] outline-none ${dark ?"text-[#F4F6F8] placeholder:text-[#6F7782]":"text-[#171717] placeholder:text-[#A1A7B0]"}`}
 placeholder={config.placeholder}
 />
 <button onClick={runWorkspaceAction} disabled={isGenerating} className={`inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-full px-4 text-[12px] font-semibold text-white transition-all disabled:opacity-60 ${dark ?"bg-[#3BA7FF] hover:bg-[#2D8FF0]":"bg-[#4A9BFF] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"}`}>
 {isGenerating ?"Working...": config.actionLabel}
 <Send className="h-3.5 w-3.5"/>
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
 className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328] hover:border-[rgba(59,167,255,0.24)]":"border-[#EAECEF] bg-[#FCFDFE] hover:border-[#CFE8F8] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"}`}
 >
 <div className="flex items-start gap-3">
 <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ?"bg-[rgba(59,167,255,0.14)] text-[#6EA4FF]":"bg-[#EEF7FF] text-[#4A9BFF]"}`}>
 <ActionIcon className="h-4 w-4"/>
 </span>
 <span className="min-w-0">
 <span className={`block text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{action.title}</span>
 <span className={`mt-1 block text-[10.5px] leading-4 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{action.desc}</span>
 </span>
 </div>
 </button>
 );
 })}
 </div>

 <div className="grid min-h-[460px] gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
 <SoftCard className="flex flex-col gap-4">
 <div>
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Prompt builder</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Refine the request before generation.</p>
 </div>
 <textarea
 value={prompt}
 onChange={(event) => setPrompt(event.target.value)}
 rows={7}
 placeholder={config.placeholder}
 className={`w-full resize-none rounded-2xl border p-3 text-[12px] leading-5 outline-none transition-colors focus:border-[#9BD2FF] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782]":"border-[#E5EAF0] bg-white text-[#171717] placeholder:text-[#A1A7B0]"}`}
 />
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
 {config.selectors.map((selector) => (
 <label key={selector.label} className="block">
 <span className={`mb-1.5 block text-[11px] font-semibold ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`}>{selector.label}</span>
 <select className={`h-10 w-full rounded-xl border px-3 text-[12px] outline-none focus:border-[#9BD2FF] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]":"border-[#E5EAF0] bg-white text-[#171717]"}`}>
 {selector.options.map((option) => (
 <option key={option}>{option}</option>
 ))}
 </select>
 </label>
 ))}
 </div>
 <div className="mt-auto flex flex-wrap gap-2">
 {[
 { label:"Image", icon: ImageIcon },
 { label:"File", icon: Paperclip },
 { label:"Document", icon: FileText },
 ].map((attachment) => {
 const AttachmentIcon = attachment.icon;
 return (
 <button key={attachment.label} onClick={() => openModal(attachment.label ==="Image"?"upload-image": attachment.label ==="Document"?"upload-document":"upload-file")} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition-all ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]":"border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#CFE8F8] hover:text-[#171717]"}`}>
 <AttachmentIcon className="h-3.5 w-3.5"/>
 {attachment.label}
 </button>
 );
 })}
 </div>
 </SoftCard>

 <SoftCard className="flex min-h-[420px] flex-col gap-3">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div>
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{config.previewType ==="code"?"Code output": config.previewType ==="blender"?"3D preview":"CAD preview"}</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Outputs stay empty until you run an action.</p>
 </div>
 {config.previewTabs && (
 <div className={`flex rounded-xl border p-1 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}>
 {config.previewTabs.map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 role="tab"
 aria-selected={activeTab === tab}
 className={`h-7 rounded-lg px-3 text-[11px] font-semibold transition-all ${activeTab === tab ?"bg-[#4A9BFF] text-white": dark ?"text-[#A8B0BA] hover:text-[#F4F6F8]":"text-[#6B7280] hover:text-[#171717]"}`}
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
 <p className={`text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Recent projects</p>
 <p className={`mt-1 text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Saved outputs and recent prompts for this workspace.</p>
 </div>
 <button onClick={() => showToast("Recent projects browser opened")} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]":"border-[#E5E7EB] bg-white text-[#6B7280]"}`}>
 <Search className="h-3.5 w-3.5"/>
 Browse
 </button>
 </div>
 <div className={`mt-4 flex min-h-[96px] items-center justify-center rounded-2xl border border-dashed text-center ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]":"border-[#E5EAF0] bg-[#FAFCFD] text-[#6B7280]"}`}>
 <p className="px-4 text-[12px] leading-5">No recent items yet. Start with a prompt or quick action to create your first saved output.</p>
 </div>
 </SoftCard>
 </div>
 );
}

function ToolPreviewPlaceholder({ config, activeTab, hasOutput, prompt }: { config: ToolWorkspaceConfig; activeTab: string; hasOutput: boolean; prompt: string }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 const Icon = config.icon;
 const gridColor = dark ?"rgba(255,255,255,0.055)":"rgba(74,155,255,0.105)";
 const cleanPrompt = prompt.trim() ||"your request";

 if (config.previewType ==="code"&& hasOutput) {
 return (
 <div className={`relative min-h-[340px] flex-1 overflow-hidden rounded-2xl border ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}>
 <div className={`flex gap-1.5 border-b px-4 py-3 ${dark ?"border-[rgba(255,255,255,0.08)] text-[#6F7782]":"border-[#EEF2F5] text-[#CBD5E1]"}`}>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 </div>
 {activeTab ==="Plan"&& (
 <div className="p-5">
 <p className={`text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Generated plan</p>
 <div className="mt-4 grid gap-3">
 {[
 ["1", `Clarify scope for"${cleanPrompt}".`],
 ["2","Create the component/page structure and required states."],
 ["3","Wire interactions, accessibility labels, loading and empty states."],
 ["4","Verify responsive layout and run checks before shipping."],
 ].map(([step, text]) => (
 <div key={step} className={`flex gap-3 rounded-2xl border p-3 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5EAF0] bg-[#FCFDFE]"}`}>
 <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4A9BFF] text-[11px] font-bold text-white">{step}</span>
 <p className={`text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`}>{text}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 {activeTab ==="Code"&& (
 <pre className={`m-5 overflow-auto rounded-2xl border p-4 text-[12px] leading-6 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#111318] text-[#DDE7F2]":"border-[#E5EAF0] bg-[#FAFCFD] text-[#334155]"}`}>
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
 {activeTab ==="Preview"&& (
 <div className="flex min-h-[280px] items-center justify-center p-5">
 <div className={`w-full max-w-md rounded-3xl border p-5 text-center ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5EAF0] bg-[#FCFDFE]"}`}>
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <Icon className="h-5 w-5"/>
 </div>
 <p className={`mt-4 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Preview draft ready</p>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>
 A clean preview frame for <span className={dark ?"text-[#F4F6F8]":"text-[#171717]"}>{cleanPrompt}</span> is ready for the next refinement step.
 </p>
 </div>
 </div>
 )}
 </div>
 );
 }

 const emptyCopy =
 config.previewType ==="code"&& activeTab ==="Plan"
 ?"Your generated implementation plan will appear here."
 : config.previewType ==="code"&& activeTab ==="Code"
 ?"Your generated code will appear here."
 : config.previewType ==="code"&& activeTab ==="Preview"
 ?"Your generated preview will appear here."
 : config.emptyState;

 return (
 <div
 className={`relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-2xl border ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}
 style={{
 backgroundImage:
 config.previewType ==="code"
 ? undefined
 : `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
 backgroundSize: config.previewType ==="autocad"?"26px 26px":"32px 32px",
 }}
 >
 {config.previewType ==="code"&& (
 <div className={`absolute left-4 top-4 flex gap-1.5 ${dark ?"text-[#6F7782]":"text-[#CBD5E1]"}`}>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 <span className="h-2.5 w-2.5 rounded-full bg-current"/>
 </div>
 )}
 {config.previewType ==="autocad"&& (
 <>
 <div className={`absolute left-[12%] top-[16%] h-20 w-32 rounded-2xl border ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E8EEF2] bg-[#FCFDFE]"}`} />
 <div className={`absolute bottom-[18%] right-[12%] h-28 w-44 rounded-2xl border ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E8EEF2] bg-[#FCFDFE]"}`} />
 </>
 )}
 {config.previewType ==="blender"&& (
 <div className="absolute inset-x-[14%] bottom-[22%] h-px bg-gradient-to-r from-transparent via-[#8EC9FF] to-transparent"/>
 )}
 <div className="relative z-10 flex max-w-xs flex-col items-center px-5 text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <Icon className="h-6 w-6"/>
 </div>
 <p className={`mt-4 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Ready when you are</p>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{emptyCopy}</p>
 </div>
 </div>
 );
}

function OverviewPage() {
 const router = useRouter();
 const { theme } = useStudioTheme();
 const { openModal, openDrawer, showToast } = useStudioActions();
 const dark = theme ==="dark";
 const text = dark ?"text-[#F4F6F8]":"text-[#1F1F1F]";
 const muted = dark ?"text-[#A8B0BA]":"text-[#657184]";
 const line = dark ?"border-[rgba(255,255,255,0.08)]":"border-[#E5EAF0]";
 const soft = dark ?"bg-[#181B20]":"bg-white";
 const panel = dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5EAF0] bg-[#FCFDFE]";
 const stats = [
 { label:"Live projects", value:"12", meta:"+3 this week", icon: Folder, trend:"72% active" },
 { label:"Design files", value:"48", meta:"6 updated today", icon: Layers3, trend:"18 reviewed" },
 { label:"Builds", value:"19", meta:"4 ready", icon: Code2, trend:"3 in QA" },
 { label:"Exports", value:"27", meta:"9 delivered", icon: Download, trend:"100% synced" },
 ];
 const pipeline = [
 { name:"AutoCAD homepage concept", type:"Design", owner:"AI Assistant", status:"Review", progress:78 },
 { name:"Cedium landing route", type:"Code", owner:"Code Builder", status:"Building", progress:64 },
 { name:"Product hero scene", type:"3D", owner:"Blender 3D", status:"Ready", progress:92 },
 ];
 const modules = [
 { label:"AI Assistant", desc:"Start directed workspace tasks.", icon: Sparkles, action: () => router.push("/ai-assistant") },
 { label:"Cedium Design", desc:"Create layouts and prototypes.", icon: Monitor, action: () => router.push("/cedium-design") },
 { label:"AutoCAD Design", desc:"Draft plans and technical files.", icon: PenLine, action: () => router.push("/autocad-design") },
 { label:"Code Builder", desc:"Prepare routes and components.", icon: Code2, action: () => router.push("/code-builder") },
 ];
 const activity = [
 { label:"Homepage concept updated", time:"2m ago", tone:"bg-[#4284FF]" },
 { label:"Prompt Lab checklist saved", time:"18m ago", tone:"bg-[#23B26D]" },
 { label:"Blender material preview queued", time:"42m ago", tone:"bg-[#F59E0B]" },
 { label:"Export package delivered", time:"1h ago", tone:"bg-[#8B5CF6]" },
 ];
 const systemHealth = [
 ["Workspace sync","Online","99.9%"],
 ["Agent queue","4 active","2 waiting"],
 ["Storage","64 GB used","128 GB plan"],
 ];

 return (
 <div className="font-roboto">
 <PageHeader
 title="Studio Overview"
 subtitle="Command center for projects, agent work, design files, builds, and exports."
 action={
 <div className="flex flex-wrap items-center gap-2">
 <SecondaryButton icon={Upload} onClick={() => openModal("asset-upload")}>Import asset</SecondaryButton>
 <PrimaryButton icon={Sparkles} onClick={() => router.push("/ai-assistant")}>Start AI task</PrimaryButton>
 </div>
 }
 />

 <div className={`mb-5 overflow-hidden rounded-2xl border ${panel}`}>
 <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
 <div className={`p-5 lg:border-r ${line}`}>
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE1FF] bg-[#EFF6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4284FF]">
 <span className="h-1.5 w-1.5 rounded-full bg-[#4284FF]"/>
 Live workspace
 </span>
 <h3 className={`mt-4 max-w-2xl text-[34px] font-semibold leading-[0.98] tracking-[-0.045em] ${text}`}>Studio Overview for active production.</h3>
 <p className={`mt-3 max-w-xl text-[12px] leading-5 ${muted}`}>Track what is open, where agents are working, and which outputs need review before delivery.</p>
 </div>
 <div className={`rounded-2xl border px-4 py-3 ${line} ${soft}`}>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Today</p>
 <p className={`mt-2 text-[24px] font-semibold tracking-[-0.04em] ${text}`}>8 tasks</p>
 <p className="mt-1 text-[10px] font-semibold text-[#4284FF]">5 on schedule</p>
 </div>
 </div>
 <div className="mt-6 grid gap-3 sm:grid-cols-3">
 {systemHealth.map(([label, value, meta]) => (
 <div key={label} className={`rounded-2xl border px-4 py-3 ${line} ${soft}`}>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${muted}`}>{label}</p>
 <p className={`mt-2 text-[13px] font-semibold ${text}`}>{value}</p>
 <p className={`mt-1 text-[11px] ${muted}`}>{meta}</p>
 </div>
 ))}
 </div>
 </div>
 <div className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Agent status</p>
 <h4 className={`mt-2 text-[15px] font-semibold ${text}`}>Production queue</h4>
 </div>
 <button onClick={() => showToast("Queue refreshed")} className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${line} ${soft} ${dark ?"text-[#A8B0BA] hover:text-[#F4F6F8]":"text-[#657184] hover:text-[#1F1F1F]"}`} aria-label="Refresh queue">
 <RefreshCw className="h-4 w-4"/>
 </button>
 </div>
 <div className="mt-5 space-y-3">
 {["Brief parsed","Assets mapped","Build checks","Export handoff"].map((step, index) => (
 <div key={step} className="flex items-center gap-3">
 <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${index < 3 ?"bg-[#EAF2FF] text-[#4284FF]":"bg-[#F3F4F6] text-[#8A94A3]"}`}>
 {index < 3 ? <CheckCircle2 className="h-4 w-4"/> : <Clock className="h-4 w-4"/>}
 </div>
 <div className="min-w-0 flex-1">
 <p className={`text-[12px] font-semibold ${text}`}>{step}</p>
 <div className={`mt-1 h-1.5 overflow-hidden rounded-full ${dark ?"bg-[#2A3038]":"bg-[#E8EEF7]"}`}>
 <div className="h-full rounded-full bg-[#4284FF]" style={{ width: `${index < 3 ? 100 : 45}%` }}/>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-4">
 {stats.map(({ label, value, meta, icon: Icon, trend }) => (
 <button key={label} onClick={() => showToast(`${label} opened`)} className={`rounded-2xl border p-4 text-left transition-all ${panel} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"}`}>
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className={`text-[11px] font-medium ${muted}`}>{label}</p>
 <p className={`mt-3 text-[28px] font-semibold tracking-[-0.04em] ${text}`}>{value}</p>
 </div>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Icon className="h-4 w-4"/>
 </span>
 </div>
 <div className="mt-3 flex items-center justify-between gap-2">
 <p className={`text-[10px] ${muted}`}>{meta}</p>
 <p className="text-[10px] font-semibold text-[#4284FF]">{trend}</p>
 </div>
 </button>
 ))}
 </div>

 <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
 <SoftCard className="p-0">
 <div className={`flex flex-wrap items-center justify-between gap-3 border-b p-4 ${line}`}>
 <div>
 <h3 className={`text-[14px] font-semibold ${text}`}>Production pipeline</h3>
 <p className={`mt-1 text-[11px] ${muted}`}>Open work across design, code, and 3D.</p>
 </div>
 <SecondaryButton icon={Folder} onClick={() => router.push("/projects")}>View projects</SecondaryButton>
 </div>
 <div className="divide-y divide-[#E5EAF0] dark:divide-[rgba(255,255,255,0.08)]">
 {pipeline.map((item) => (
 <button key={item.name} onClick={() => openDrawer("project-detail")} className={`grid w-full gap-3 px-4 py-3 text-left transition-all md:grid-cols-[1.25fr_0.7fr_0.7fr_0.9fr] md:items-center ${dark ?"hover:bg-[#181B20]":"hover:bg-white"}`}>
 <div>
 <p className={`text-[13px] font-semibold ${text}`}>{item.name}</p>
 <p className={`mt-1 text-[11px] ${muted}`}>{item.type}</p>
 </div>
 <p className={`text-[12px] ${muted}`}>{item.owner}</p>
 <span className="w-fit rounded-full border border-[#CFE1FF] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-semibold text-[#4284FF]">{item.status}</span>
 <div className="min-w-0">
 <div className={`h-2 overflow-hidden rounded-full ${dark ?"bg-[#2A3038]":"bg-[#E8EEF7]"}`}>
 <div className="h-full rounded-full bg-[#4284FF]" style={{ width: `${item.progress}%` }}/>
 </div>
 <p className={`mt-1 text-right text-[10px] ${muted}`}>{item.progress}%</p>
 </div>
 </button>
 ))}
 </div>
 </SoftCard>

 <SoftCard>
 <div className="flex items-center justify-between">
 <div>
 <h3 className={`text-[14px] font-semibold ${text}`}>Quick launch</h3>
 <p className={`mt-1 text-[11px] ${muted}`}>Jump into the right studio.</p>
 </div>
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Workflow className="h-4 w-4"/>
 </span>
 </div>
 <div className="mt-4 grid gap-2">
 {modules.map(({ label, desc, icon: Icon, action }) => (
 <button key={label} onClick={action} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${line} ${soft} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-[#F8FBFF]"}`}>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Icon className="h-4 w-4"/>
 </span>
 <span className="min-w-0">
 <span className={`block text-[12px] font-semibold ${text}`}>{label}</span>
 <span className={`mt-0.5 block text-[10px] ${muted}`}>{desc}</span>
 </span>
 </button>
 ))}
 </div>
 </SoftCard>
 </div>

 <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
 <SoftCard>
 <div className="flex items-center justify-between">
 <h3 className={`text-[14px] font-semibold ${text}`}>Recent activity</h3>
 <button onClick={() => showToast("Activity feed opened")} className="text-[11px] font-semibold text-[#4284FF]">View all</button>
 </div>
 <div className="mt-4 space-y-3">
 {activity.map((item) => (
 <button key={item.label} onClick={() => showToast(`${item.label} opened`)} className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${line} ${soft} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-[#F8FBFF]"}`}>
 <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`}/>
 <span className="min-w-0 flex-1">
 <span className={`block truncate text-[12px] font-medium ${text}`}>{item.label}</span>
 <span className={`mt-0.5 block text-[10px] ${muted}`}>{item.time}</span>
 </span>
 </button>
 ))}
 </div>
 </SoftCard>

 <SoftCard>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h3 className={`text-[14px] font-semibold ${text}`}>Workspace actions</h3>
 <p className={`mt-1 text-[11px] ${muted}`}>Create, import, review, or export without leaving overview.</p>
 </div>
 <Shield className="h-4 w-4 text-[#4284FF]"/>
 </div>
 <div className="mt-4 grid gap-2 sm:grid-cols-2">
 <SecondaryButton icon={Plus} onClick={() => openModal("project-create")}>New project</SecondaryButton>
 <SecondaryButton icon={Upload} onClick={() => openModal("asset-upload")}>Import asset</SecondaryButton>
 <SecondaryButton icon={FileText} onClick={() => router.push("/prompt-lab")}>Prompt Lab</SecondaryButton>
 <SecondaryButton icon={Download} onClick={() => router.push("/exports")}>Exports</SecondaryButton>
 </div>
 </SoftCard>
 </div>
 </div>
 );
}

function CediumDesignPage() {
 const { theme } = useStudioTheme();
 const { showToast } = useStudioActions();
 const dark = theme ==="dark";
 const [prototypes, setPrototypes] = useState<PrototypeItem[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [projectName, setProjectName] = useState("");
 const [quality, setQuality] = useState<PrototypeQuality>("high-fidelity");
 const [prototypeType, setPrototypeType] = useState<Exclude<PrototypeType,"design-system">>("website");
 const [brief, setBrief] = useState("");
 const [briefTags, setBriefTags] = useState<string[]>([]);
 const [formError, setFormError] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<"Recent"|"Your designs"|"Design systems">("Recent");
 const [selectedPrototype, setSelectedPrototype] = useState<PrototypeItem | null>(null);
 const [designSystem, setDesignSystem] = useState<DesignSystemSettings>(defaultDesignSystem);
 const [editingPreset, setEditingPreset] = useState<keyof DesignSystemSettings | null>(null);
 const projectInputRef = useRef<HTMLInputElement>(null);
 const shell = dark
 ?"border-[rgba(255,255,255,0.08)] bg-[#202328]"
 :"border-[#EAECEF] bg-[#FCFDFE]";
 const muted = dark ?"text-[#A8B0BA]":"text-[#6B7280]";
 const strong = dark ?"text-[#F4F6F8]":"text-[#171717]";
 const qualityModes: Array<{ value: PrototypeQuality; label: string; icon: LucideIcon; desc: string }> = [
 { value:"wireframe", label:"Wireframe", icon: Grid2X2, desc:"Fast layout"},
 { value:"high-fidelity", label:"High fidelity", icon: PenLine, desc:"Visual polish"},
 ];
 const typeModes: Array<{ value: Exclude<PrototypeType,"design-system">; label: string; icon: LucideIcon; desc: string }> = [
 { value:"website", label:"Website", icon: Monitor, desc:"Landing pages"},
 { value:"mobile-app", label:"Mobile app", icon: Layers3, desc:"iOS/Android"},
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
 if (activeTab ==="Your designs") return sorted.filter((item) => item.origin ==="user");
 if (activeTab ==="Design systems") return sorted.filter((item) => item.type ==="design-system");
 return sorted;
 }, [activeTab, prototypes]);

 const handleBriefChip = (chip: string) => {
 setBriefTags((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
 setBrief((current) => {
 const line = chipToBriefLine(chip);
 return current.includes(line) ? current : `${current.trim()}${current.trim() ?"\n":""}${line}`;
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
 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
 <Monitor className="h-4 w-4"/>
 </div>
 <div>
 <p className={`text-[13px] font-semibold ${strong}`}>New prototype</p>
 <p className={`text-[11px] ${muted}`}>Website, app, mobile UI</p>
 </div>
 </div>

 <div className={`mt-5 rounded-2xl border p-3 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}>
 <label htmlFor="prototype-name"className={`text-[11px] font-semibold ${strong}`}>Project name</label>
 <input
 id="prototype-name"
 ref={projectInputRef}
 value={projectName}
 onChange={(event) => {
 setProjectName(event.target.value);
 if (formError) setFormError(null);
 }}
 className={`mt-2 h-10 w-full rounded-xl border px-3 text-[12px] outline-none ${formError ?"border-[#FF3B6B]": dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8] placeholder:text-[#6F7782]":"border-[#E5E7EB] bg-[#FAFCFD] text-[#171717] placeholder:text-[#A1A7B0]"}`}
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
 if (value ==="wireframe"|| value ==="high-fidelity") setQuality(value);
 else setPrototypeType(value as Exclude<PrototypeType,"design-system">);
 }}
 className={`group min-h-[108px] rounded-2xl border p-3 text-left transition-all ${selected ?"border-[#9BD2FF] bg-[#EEF7FF]": dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] hover:border-[rgba(59,167,255,0.24)]":"border-[#E5EAF0] bg-white hover:border-[#CFE8F8]"}`}
 aria-pressed={selected}
 >
 <div className={`mb-3 flex h-10 items-center justify-center rounded-xl ${selected ?"bg-white text-[#4A9BFF]": dark ?"bg-[#202328] text-[#A8B0BA]":"bg-[#F4F8FB] text-[#6B7280]"}`}>
 <Icon className="h-4 w-4"/>
 </div>
 <p className={`text-[12px] font-semibold ${selected ?"text-[#171717]": strong}`}>{label}</p>
 <p className={`mt-1 text-[10px] ${selected ?"text-[#4B5563]": muted}`}>{desc}</p>
 </button>
 );
 })}
 </div>

 <button type="submit"className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4A9BFF] to-[#1DA1F2] text-[12px] font-semibold text-white transition-all">
 <Plus className="h-4 w-4"/>
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
 <div className={`flex rounded-2xl p-1 ${dark ?"bg-[#181B20]":"bg-[#EEF3F7]"}`}>
 {(["Recent","Your designs","Design systems"] as const).map((tab) => (
 <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold ${activeTab === tab ?"bg-white text-[#171717]": muted}`}>
 {tab}
 </button>
 ))}
 </div>
 </div>

 {isLoading && <StudioInlineState icon={RefreshCw} title="Loading prototypes"text="Reading saved design work from this browser."/>}
 {loadError && <StudioInlineState icon={AlertTriangle} title="Prototype error"text={loadError} />}
 {!isLoading && !loadError && filteredPrototypes.length === 0 && (
 <StudioInlineState icon={Monitor} title="No designs yet"text={activeTab ==="Your designs"?"Create a prototype and it will appear here.":"No items match this tab yet."} />
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
 <label htmlFor="prototype-brief"className={`text-[13px] font-semibold ${strong}`}>Prototype brief</label>
 <textarea
 id="prototype-brief"
 value={brief}
 onChange={(event) => setBrief(event.target.value)}
 className={`mt-3 min-h-[118px] w-full resize-none rounded-2xl border p-4 text-[13px] outline-none ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782]":"border-[#E5EAF0] bg-white text-[#171717] placeholder:text-[#A1A7B0]"}`}
 placeholder="Describe the website, dashboard, mobile flow, or app screen you want Cedium Design to create..."
 />
 <div className="mt-3 flex flex-wrap gap-2">
 {["Responsive","Design tokens","Components","Prototype flow"].map((chip) => (
 <button key={chip} type="button"onClick={() => handleBriefChip(chip)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${briefTags.includes(chip) ?"border-[#9BD2FF] bg-[#EEF7FF] text-[#171717]": dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#A8B0BA]":"border-[#E5EAF0] bg-[#FAFCFD] text-[#4B5563]"}`}>{chip}</button>
 ))}
 </div>
 </div>

 <div className={`rounded-[28px] border p-4 ${shell}`}>
 <p className={`text-[13px] font-semibold ${strong}`}>Design system</p>
 <div className="mt-4 space-y-3">
 {[
 ["Color","colorPreset", designSystem.colorPreset,"#4A9BFF"],
 ["Typography","typographyPreset", designSystem.typographyPreset,"#171717"],
 ["Spacing","spacingPreset", designSystem.spacingPreset,"#CFE8F8"],
 ].map(([label, key, desc, color]) => (
 <button key={label} type="button"onClick={() => setEditingPreset(key as keyof DesignSystemSettings)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:border-[#CFE8F8] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-white"}`}>
 <span className="h-9 w-9 rounded-xl"style={{ background: color }} />
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
 Responsive:"- Responsive layout across desktop, tablet, and mobile.",
"Design tokens":"- Tokenized color, type, and spacing decisions.",
 Components:"- Reusable UI components for repeated product sections.",
"Prototype flow":"- Connected screens that show the primary user flow.",
 };
 return map[chip] ?? `- ${chip}`;
}

function prototypeTypeLabel(type: PrototypeType) {
 if (type ==="mobile-app") return"Mobile app";
 if (type ==="design-system") return"Design system";
 return"Website";
}

function prototypeQualityLabel(quality: PrototypeQuality) {
 return quality ==="high-fidelity"?"High fidelity":"Wireframe";
}

function formatStudioDate(dateString: string) {
 const date = new Date(dateString);
 if (Number.isNaN(date.getTime())) return"Unknown date";
 return new Intl.DateTimeFormat("en", { month:"short", day:"numeric", year:"numeric"}).format(date);
}

function formatRelativeStudioDate(dateString: string) {
 const date = new Date(dateString);
 if (Number.isNaN(date.getTime())) return"Recently";
 const diff = Date.now() - date.getTime();
 const day = 1000 * 60 * 60 * 24;
 if (diff < day) return"Today";
 if (diff < day * 2) return"Yesterday";
 return `${Math.max(2, Math.floor(diff / day))}d ago`;
}

function StudioInlineState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <div className={`mt-5 rounded-2xl border border-dashed p-6 text-center ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#DCEBFA] bg-white"}`}>
 <Icon className="mx-auto h-6 w-6 text-[#4A9BFF]"/>
 <p className={`mt-3 text-[13px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{title}</p>
 <p className={`mt-2 text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{text}</p>
 </div>
 );
}

function PrototypeCard({ prototype, onOpen }: { prototype: PrototypeItem; onOpen: () => void }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 const strong = dark ?"text-[#F4F6F8]":"text-[#171717]";
 const muted = dark ?"text-[#A8B0BA]":"text-[#6B7280]";
 const tag = prototype.type ==="design-system"?"System": prototype.type ==="mobile-app"?"App":"Checkout";

 return (
 <ClickableSoftCard className="overflow-hidden p-0"onClick={onOpen} ariaLabel={`Open ${prototype.name}`}>
 <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#DDF2FF] via-[#F8FBFF] to-[#EAF7F2]">
 <div className="absolute left-4 top-4 h-16 w-24 rounded-2xl border border-white/80 bg-white/70"/>
 <div className="absolute bottom-4 right-4 h-20 w-28 rounded-2xl border border-white/80 bg-white/82 p-2">
 <div className="h-2 w-14 rounded-full bg-[#4A9BFF]"/>
 <div className="mt-2 h-2 w-20 rounded-full bg-[#D7E5EF]"/>
 <div className="mt-2 h-8 rounded-xl bg-[#F7BFA3]"/>
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
 const dark = theme ==="dark";
 const [draft, setDraft] = useState(value);
 const options: Record<keyof DesignSystemSettings, string[]> = {
 colorPreset: ["Sky / Paper / Graphite","Ocean / Paper / Ink","Mono / Cloud / Graphite"],
 typographyPreset: ["Clean UI scale","Platform scale","Compact product scale"],
 spacingPreset: ["8px rhythm","6px compact rhythm","12px spacious rhythm"],
 };
 const title = presetKey ==="colorPreset"?"Color preset": presetKey ==="typographyPreset"?"Typography preset":"Spacing preset";

 return (
 <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] ${dark ?"bg-black/45":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <div className={`w-full max-w-sm rounded-3xl border p-5 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[16px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{title}</h2>
 <p className={`mt-2 text-[12px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>Choose the default for new prototypes.</p>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close preset editor">
 <X className="h-4 w-4"/>
 </button>
 </div>
 <select value={draft} onChange={(event) => setDraft(event.target.value)} className={`mt-5 h-11 w-full rounded-2xl border px-3 text-[12px] outline-none ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]":"border-[#E5EAF0] bg-white text-[#171717]"}`}>
 {options[presetKey].map((option) => (
 <option key={option} value={option}>{option}</option>
 ))}
 </select>
 <div className="mt-5 flex justify-end gap-2">
 <button onClick={onClose} className={`rounded-xl border px-4 py-2 text-[12px] font-semibold ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]":"border-[#E5E7EB] bg-white text-[#4B5563]"}`}>Cancel</button>
 <button onClick={() => onSave(draft)} className="rounded-xl bg-[#4A9BFF] px-4 py-2 text-[12px] font-semibold text-white">Save</button>
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
 const dark = theme ==="dark";
 const [name, setName] = useState(prototype.name);

 useEffect(() => {
 setName(prototype.name);
 }, [prototype.id, prototype.name]);

 return (
 <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ?"bg-black/35":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <aside className={`h-full w-full max-w-md overflow-y-auto border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Prototype details</h2>
 <p className={`mt-2 text-[12px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{prototype.status} - {prototype.visibility}</p>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close prototype details">
 <X className="h-4 w-4"/>
 </button>
 </div>
 <div className="mt-5 space-y-4">
 <div>
 <label className={`text-[11px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Name</label>
 <div className="mt-2 flex gap-2">
 <input value={name} onChange={(event) => setName(event.target.value)} className={`h-10 min-w-0 flex-1 rounded-xl border px-3 text-[12px] outline-none ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]":"border-[#E5EAF0] bg-white text-[#171717]"}`} />
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
 <div className={`rounded-2xl border p-4 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-[#FCFDFE]"}`}>
 <p className={`text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Brief</p>
 <p className={`mt-2 whitespace-pre-wrap text-[12px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`}>{prototype.brief ||"No brief saved."}</p>
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
 const dark = theme ==="dark";
 return (
 <div className={`overflow-hidden rounded-2xl border ${dark ?"border-[rgba(255,255,255,0.08)]":"border-[#E5EAF0]"}`}>
 {rows.map(([label, value]) => (
 <div key={label} className={`flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]":"border-[#E5EAF0] bg-[#FCFDFE]"}`}>
 <span className={`text-[10.5px] font-semibold ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{label}</span>
 <span className={`text-right text-[11px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{value}</span>
 </div>
 ))}
 </div>
 );
}

function AutoCADPage() {
 const router = useRouter();
 const { theme } = useStudioTheme();
 const { openModal, showToast } = useStudioActions();
 const dark = theme ==="dark";
 const text = dark ?"text-[#F4F6F8]":"text-[#1F1F1F]";
 const muted = dark ?"text-[#A8B0BA]":"text-[#657184]";
 const line = dark ?"border-[rgba(255,255,255,0.08)]":"border-[#E5EAF0]";
 const soft = dark ?"bg-[#181B20]":"bg-white";
 const panel = dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5EAF0] bg-[#FCFDFE]";
 const drawings = [
 { name:"Floor plan study", type:"DWG plan", status:"Review", updated:"12 min ago", progress:84 },
 { name:"Workspace elevation", type:"DXF elevation", status:"Drafting", updated:"38 min ago", progress:62 },
 { name:"System detail", type:"PDF reference", status:"Ready", updated:"1h ago", progress:100 },
 ];
 const standards = [
 ["Units","Millimeters"],
 ["Layer set","Architecture"],
 ["Line weight","ISO 128"],
 ["Export","DWG + PDF"],
 ];
 const draftingTools = [
 { label:"Floor plan", desc:"Rooms, doors, dimensions.", icon: Grid2X2 },
 { label:"Elevation", desc:"Facade and section lines.", icon: Monitor },
 { label:"Layer cleanup", desc:"Normalize names and weights.", icon: Layers3 },
 { label:"DXF audit", desc:"Find missing references.", icon: FileText },
 ];

 return (
 <div className="font-roboto">
 <PageHeader
 title="AutoCAD Design"
 subtitle="Draft, review, clean, and export technical drawing packages from one CAD workspace."
 action={
 <div className="flex flex-wrap items-center gap-2">
 <SecondaryButton icon={Sparkles} onClick={() => router.push("/ai-assistant/tools/autocad")}>AI draft</SecondaryButton>
 <PrimaryButton icon={Upload} onClick={() => openModal("upload-file")}>Import AutoCAD file</PrimaryButton>
 </div>
 }
 />

 <div className={`mb-5 overflow-hidden rounded-2xl border ${panel}`}>
 <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
 <div className={`relative min-h-[330px] overflow-hidden p-5 xl:border-r ${line}`}>
 <div
 className={`absolute inset-0 opacity-80 ${dark ?"bg-[#181B20]":"bg-[#F8FBFF]"}`}
 style={{
 backgroundImage: `linear-gradient(${dark ?"rgba(255,255,255,0.06)":"#DDEBFA"} 1px, transparent 1px), linear-gradient(90deg, ${dark ?"rgba(255,255,255,0.06)":"#DDEBFA"} 1px, transparent 1px)`,
 backgroundSize:"28px 28px",
 }}
 />
 <div className="relative z-10 flex h-full min-h-[290px] flex-col justify-between">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE1FF] bg-[#EFF6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4284FF]">
 <PenLine className="h-3.5 w-3.5"/>
 CAD workspace
 </span>
 <h3 className={`mt-4 max-w-xl text-[34px] font-semibold leading-[0.98] tracking-[-0.045em] ${text}`}>AutoCAD Design for production drawings.</h3>
 <p className={`mt-3 max-w-lg text-[12px] leading-5 ${muted}`}>Import references, generate structured drafts, audit layers, and prepare export-ready DWG, DXF, and PDF packages.</p>
 </div>
 <button onClick={() => openModal("upload-file")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4284FF] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#376FE0]">
 <Upload className="h-4 w-4"/>
 Upload file
 </button>
 </div>

 <div className="relative mt-8 h-[150px] rounded-2xl border border-[#BBD4FF] bg-white/75 shadow-[0_18px_40px_rgba(66,132,255,0.12)]">
 <div className="absolute left-[8%] top-[18%] h-[58%] w-[30%] rounded-sm border-2 border-[#4284FF] bg-[#EFF6FF]/70"/>
 <div className="absolute left-[42%] top-[18%] h-[28%] w-[34%] rounded-sm border-2 border-[#4284FF] bg-white/60"/>
 <div className="absolute left-[42%] top-[52%] h-[24%] w-[20%] rounded-sm border-2 border-[#4284FF] bg-white/60"/>
 <div className="absolute bottom-[18%] right-[10%] h-px w-[26%] bg-[#4284FF]"/>
 <div className="absolute bottom-[17%] right-[35%] h-3 w-px bg-[#4284FF]"/>
 <div className="absolute bottom-[17%] right-[10%] h-3 w-px bg-[#4284FF]"/>
 <span className="absolute bottom-[24%] right-[18%] text-[10px] font-semibold text-[#4284FF]">12.40m</span>
 </div>
 </div>
 </div>

 <div className="p-5">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Drawing setup</p>
 <h4 className={`mt-2 text-[15px] font-semibold ${text}`}>Active standards</h4>
 </div>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Shield className="h-4 w-4"/>
 </span>
 </div>
 <div className="mt-5 grid gap-2">
 {standards.map(([label, value]) => (
 <div key={label} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${line} ${soft}`}>
 <span className={`text-[11px] font-semibold ${muted}`}>{label}</span>
 <span className={`text-[12px] font-semibold ${text}`}>{value}</span>
 </div>
 ))}
 </div>
 <div className="mt-4 grid gap-2 sm:grid-cols-2">
 <SecondaryButton icon={Layers3} onClick={() => showToast("Layer standards opened")}>Layers</SecondaryButton>
 <SecondaryButton icon={Download} onClick={() => showToast("Export package prepared")}>Export</SecondaryButton>
 </div>
 </div>
 </div>
 </div>

 <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
 <SoftCard>
 <div className="flex items-center justify-between gap-3">
 <div>
 <h3 className={`text-[14px] font-semibold ${text}`}>Drafting tools</h3>
 <p className={`mt-1 text-[11px] ${muted}`}>Start common CAD workflows quickly.</p>
 </div>
 <button onClick={() => router.push("/ai-assistant/tools/autocad")} className="text-[11px] font-semibold text-[#4284FF]">Open AI</button>
 </div>
 <div className="mt-4 grid gap-2">
 {draftingTools.map(({ label, desc, icon: Icon }) => (
 <button key={label} onClick={() => showToast(`${label} workflow prepared`)} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${line} ${soft} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-[#F8FBFF]"}`}>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Icon className="h-4 w-4"/>
 </span>
 <span>
 <span className={`block text-[12px] font-semibold ${text}`}>{label}</span>
 <span className={`mt-0.5 block text-[10px] ${muted}`}>{desc}</span>
 </span>
 </button>
 ))}
 </div>
 </SoftCard>

 <SoftCard className="p-0">
 <div className={`flex flex-wrap items-center justify-between gap-3 border-b p-4 ${line}`}>
 <div>
 <h3 className={`text-[14px] font-semibold ${text}`}>Recent drawings</h3>
 <p className={`mt-1 text-[11px] ${muted}`}>Files and generated drafts currently in review.</p>
 </div>
 <SecondaryButton icon={RefreshCw} onClick={() => showToast("Drawings refreshed")}>Refresh</SecondaryButton>
 </div>
 <div className="divide-y divide-[#E5EAF0] dark:divide-[rgba(255,255,255,0.08)]">
 {drawings.map((drawing) => (
 <button key={drawing.name} onClick={() => showToast(`${drawing.name} drawing opened`)} className={`grid w-full gap-3 px-4 py-3 text-left transition-all md:grid-cols-[1.1fr_0.55fr_0.5fr_0.8fr] md:items-center ${dark ?"hover:bg-[#181B20]":"hover:bg-white"}`}>
 <div>
 <p className={`text-[13px] font-semibold ${text}`}>{drawing.name}</p>
 <p className={`mt-1 text-[11px] ${muted}`}>{drawing.type} - {drawing.updated}</p>
 </div>
 <span className="w-fit rounded-full border border-[#CFE1FF] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-semibold text-[#4284FF]">{drawing.status}</span>
 <p className={`text-[11px] font-semibold ${muted}`}>{drawing.progress}%</p>
 <div>
 <div className={`h-2 overflow-hidden rounded-full ${dark ?"bg-[#2A3038]":"bg-[#E8EEF7]"}`}>
 <div className="h-full rounded-full bg-[#4284FF]" style={{ width: `${drawing.progress}%` }}/>
 </div>
 </div>
 </button>
 ))}
 </div>
 </SoftCard>
 </div>

 <div className="mt-5 grid gap-3 md:grid-cols-3">
 {[
 { label:"Import reference", desc:"DWG, DXF, PDF, image, or survey notes.", icon: Upload, action: () => openModal("upload-file") },
 { label:"Generate plan", desc:"Describe rooms, dimensions, and layer rules.", icon: Sparkles, action: () => router.push("/ai-assistant/tools/autocad") },
 { label:"Audit package", desc:"Check missing layers, line weights, and exports.", icon: CheckCircle2, action: () => showToast("CAD audit started") },
 ].map(({ label, desc, icon: Icon, action }) => (
 <button key={label} onClick={action} className={`rounded-2xl border p-4 text-left transition-all ${panel} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-white hover:shadow-[0_16px_34px_rgba(31,43,77,0.08)]"}`}>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Icon className="h-4 w-4"/>
 </span>
 <p className={`mt-4 text-[13px] font-semibold ${text}`}>{label}</p>
 <p className={`mt-2 text-[11px] leading-5 ${muted}`}>{desc}</p>
 </button>
 ))}
 </div>
 </div>
 );
}

function CodeBuilderPage() {
 const router = useRouter();
 const { theme } = useStudioTheme();
 const { openModal, showToast } = useStudioActions();
 const dark = theme ==="dark";
 const text = dark ?"text-[#F4F6F8]":"text-[#1F1F1F]";
 const muted = dark ?"text-[#A8B0BA]":"text-[#657184]";
 const line = dark ?"border-[rgba(255,255,255,0.08)]":"border-[#E5EAF0]";
 const soft = dark ?"bg-[#181B20]":"bg-white";
 const panel = dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5EAF0] bg-[#FCFDFE]";
 const [phase, setPhase] = useState<CodeBuilderPhase>("idle");
 const [prompt, setPrompt] = useState("");
 const [plan, setPlan] = useState<CodeBuilderPlan | null>(null);
 const [activeLayerId, setActiveLayerId] = useState<CodeBuilderLayer["id"]>("hero");
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const promptRef = useRef<HTMLTextAreaElement>(null);
 const promptTemplates = [
 "SaaS landing page with hero, pricing, testimonials, and clean conversion sections.",
 "Portfolio site with project grid, case study detail, contact CTA, and dark header.",
 "Product launch page with feature comparison, FAQ, newsletter capture, and footer.",
 ];
 const outputSteps = [
 { label:"Plan summary", desc:"Pages, sections, and conversion goal." },
 { label:"Code layers", desc:"Components, layout, CSS, and route map." },
 { label:"Live preview", desc:"Editable preview canvas and file workspace." },
 ];
 const codeChecks = [
 { label:"Responsive", value:"Ready" },
 { label:"Components", value:"Layered" },
 { label:"Export", value:"Next.js" },
 ];

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
 setActiveLayerId(nextPlan.layers[1]?.id ?? nextPlan.layers[0]?.id ??"hero");
 setPhase("planReady");
 showToast(toastMessage);
 };

 try {
 const response = await fetch("/api/code/generate", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 prompt: cleanPrompt,
 input: { workflow:"website_builder_plan"},
 }),
 });
 const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
 const apiError = data.error as { code?: string; message?: string } | undefined;
 if (!response.ok) {
 if (response.status === 401 || apiError?.code ==="UNAUTHENTICATED") {
 openPlan(generateWebsitePlanFromPrompt(cleanPrompt),"Local code plan generated");
 return;
 }
 throw new Error(apiError?.message ??"Plan generation failed.");
 }

 const job = data.job as { output?: { plan?: unknown } } | undefined;
 const nextPlan =
 normalizeCodeBuilderPlan(data.plan, cleanPrompt) ??
 normalizeCodeBuilderPlan(job?.output?.plan, cleanPrompt) ??
 generateWebsitePlanFromPrompt(cleanPrompt);

 openPlan(nextPlan,"Code plan generated");
 } catch (error) {
 setPhase("error");
 setErrorMessage(error instanceof Error ? error.message :"Plan generation failed.");
 }
 };

 if (phase ==="planReady"&& plan) {
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
 <div className="flex w-full flex-col gap-5 pb-2 font-roboto">
 <PageHeader
 title="Code Builder"
 subtitle="Turn a website brief into a clean plan, component layers, preview, and export-ready code."
 action={
 <div className="flex flex-wrap items-center gap-2">
 <SecondaryButton icon={Folder} onClick={() => openModal("project-create")}>Open project</SecondaryButton>
 <PrimaryButton icon={Sparkles} onClick={() => router.push("/ai-assistant/tools/code")}>AI code task</PrimaryButton>
 </div>
 }
 />

 <div className={`overflow-hidden rounded-2xl border ${panel}`}>
 <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_360px]">
 <form onSubmit={generatePlan} className={`border-b p-5 xl:border-b-0 xl:border-r ${line}`}>
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE1FF] bg-[#EFF6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4284FF]">
 <Code2 className="h-3.5 w-3.5"/>
 Builder workspace
 </span>
 <h3 className={`mt-4 max-w-2xl text-[34px] font-semibold leading-[0.98] tracking-[-0.045em] ${text}`}>Clean code starts with a clear build plan.</h3>
 <p className={`mt-3 max-w-2xl text-[12px] leading-5 ${muted}`}>Describe the site, then generate a structured workspace with sections, files, layers, and a live preview surface.</p>
 </div>
 <div className={`rounded-2xl border px-4 py-3 ${line} ${soft}`}>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Mode</p>
 <p className={`mt-2 text-[13px] font-semibold ${text}`}>Next.js builder</p>
 <p className="mt-1 text-[10px] font-semibold text-[#4284FF]">Plan-first output</p>
 </div>
 </div>

 <div className="mt-6">
 <label htmlFor="code-builder-prompt"className={`text-[13px] font-semibold ${text}`}>Project prompt</label>
 <p className={`mt-1 text-[11px] ${muted}`}>Include audience, sections, style, conversion goal, and any required pages.</p>
 <textarea
 ref={promptRef}
 id="code-builder-prompt"
 value={prompt}
 onChange={(event) => {
 setPrompt(event.target.value);
 if (phase ==="error") setErrorMessage(null);
 }}
 disabled={phase ==="generatingPlan"}
 className={`mt-3 min-h-[210px] w-full resize-none rounded-2xl border p-4 text-[13px] leading-6 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#6F7782] focus:border-[rgba(66,132,255,0.5)]":"border-[#DDE6F0] bg-white text-[#1F1F1F] placeholder:text-[#9BA5B3] focus:border-[#9FC1FF]"}`}
 placeholder="Example: build a polished SaaS landing page for an AI design platform with hero, feature grid, pricing, testimonials, FAQ, and a footer. Use a calm professional UI and strong conversion CTA."
 />
 {errorMessage && (
 <p className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#B42318]">
 <AlertTriangle className="h-3.5 w-3.5"/>
 {errorMessage}
 </p>
 )}
 </div>

 <div className="mt-4 flex flex-wrap items-center gap-2">
 <button
 type="submit"
 disabled={!prompt.trim() || phase ==="generatingPlan"}
 className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4284FF] px-4 text-[12px] font-semibold text-white transition-all hover:bg-[#376FE0] disabled:cursor-not-allowed disabled:opacity-50"
 >
 {phase ==="generatingPlan"? <RefreshCw className="h-3.5 w-3.5 animate-spin"/> : <Code2 className="h-3.5 w-3.5"/>}
 {phase ==="generatingPlan"?"Generating plan...":"Generate clean plan"}
 </button>
 <button
 type="button"
 onClick={() => openModal("project-create")}
 className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all ${line} ${soft} ${dark ?"text-[#A8B0BA] hover:text-[#F4F6F8]":"text-[#4B5563] hover:border-[#BBD4FF] hover:text-[#1F1F1F]"}`}
 >
 <Folder className="h-3.5 w-3.5"/>
 Open recent project
 </button>
 </div>

 <div className="mt-5 grid gap-2 md:grid-cols-3">
 {promptTemplates.map((template, index) => (
 <button
 key={template}
 type="button"
 onClick={() => {
 setPrompt(template);
 promptRef.current?.focus();
 }}
 disabled={phase ==="generatingPlan"}
 className={`rounded-2xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${line} ${soft} ${dark ?"hover:border-[rgba(66,132,255,0.4)]":"hover:border-[#BBD4FF] hover:bg-[#F8FBFF]"}`}
 >
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 {index + 1}
 </span>
 <span className={`mt-3 block text-[11px] leading-5 ${muted}`}>{template}</span>
 </button>
 ))}
 </div>
 </form>

 <aside className={`p-5 ${dark ?"bg-[#181B20]":"bg-[#F7FAFC]"}`}>
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Builder output</p>
 <h3 className={`mt-2 text-[15px] font-semibold ${text}`}>Generated workspace</h3>
 </div>
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#4284FF]">
 <Workflow className="h-4 w-4"/>
 </span>
 </div>
 <div className="mt-5 space-y-3">
 {outputSteps.map((item, index) => (
 <div key={item.label} className={`rounded-2xl border p-3 ${line} ${soft}`}>
 <div className="flex items-start gap-3">
 <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${phase ==="generatingPlan"&& index === 0 ?"bg-[#4284FF] text-white":"bg-[#EAF2FF] text-[#4284FF]"}`}>
 {phase ==="generatingPlan"&& index === 0 ? <RefreshCw className="h-3 w-3 animate-spin"/> : index + 1}
 </span>
 <div>
 <p className={`text-[12px] font-semibold ${text}`}>{item.label}</p>
 <p className={`mt-1 text-[10.5px] leading-4 ${muted}`}>{item.desc}</p>
 </div>
 </div>
 </div>
 ))}
 </div>

 <div className="mt-5 grid gap-2">
 {codeChecks.map((check) => (
 <div key={check.label} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${line} ${soft}`}>
 <span className={`text-[11px] font-semibold ${muted}`}>{check.label}</span>
 <span className="text-[11px] font-semibold text-[#4284FF]">{check.value}</span>
 </div>
 ))}
 </div>

 <button
 type="button"
 onClick={() => {
 setPrompt("Modern website building template with a strong hero, feature cards, pricing, testimonials, and a clean footer.");
 promptRef.current?.focus();
 }}
 disabled={phase ==="generatingPlan"}
 className={`mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${line} ${soft} ${dark ?"text-[#A8B0BA] hover:text-[#F4F6F8]":"text-[#4B5563] hover:border-[#BBD4FF] hover:text-[#1F1F1F]"}`}
 >
 <Sparkles className="h-3.5 w-3.5 text-[#4284FF]"/>
 Use website template prompt
 </button>
 </aside>
 </div>
 </div>
 </div>
 );
}

type BuilderChatMessage = {
 id: string;
 role:"user"|"assistant";
 content: string;
};

type CodeBuilderFile = {
 path: string;
 language:"tsx"|"css";
 content: string;
};

function createCodeBuilderFiles(plan: CodeBuilderPlan): CodeBuilderFile[] {
 const navItems = plan.pages.slice(0, 4).map((page) => `"${page}"`).join(",");
 const featureCards = plan.layers
 .slice(0, 3)
 .map((layer) => ` { title:"${layer.canvasLabel}", description:"${layer.description}"}`)
 .join(",\n");

 return [
 {
 path:"app/page.tsx",
 language:"tsx",
 content: `import { Hero } from"@/components/Hero";
import { Navbar } from"@/components/Navbar";

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
 path:"app/layout.tsx",
 language:"tsx",
 content: `import type { Metadata } from"next";
import"./globals.css";

export const metadata: Metadata = {
 title:"${plan.projectName}",
 description:"${plan.summary}",
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
 path:"components/Hero.tsx",
 language:"tsx",
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
 <a className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"href="#start">
 Launch preview
 </a>
 <a className="rounded-lg border border-black/20 px-5 py-3 text-sm font-semibold text-black"href="#plan">
 View plan
 </a>
 </div>
 </section>
 );
}
`,
 },
 {
 path:"components/Navbar.tsx",
 language:"tsx",
 content: `const navItems = [${navItems}];

export function Navbar() {
 return (
 <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
 <div className="flex items-center gap-3">
 <span className="h-7 w-7 rounded-lg bg-neutral-950"/>
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
 path:"app/globals.css",
 language:"css",
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
 { id:"assistant-ready", role:"assistant", content:"Plan generated. Select a layer or describe the next adjustment."},
 ]);
 const [files, setFiles] = useState<CodeBuilderFile[]>(() => createCodeBuilderFiles(plan));
 const [activeFilePath, setActiveFilePath] = useState(() => createCodeBuilderFiles(plan)[0]?.path ??"app/page.tsx");
 const activeLayer = plan.layers.find((layer) => layer.id === activeLayerId) ?? plan.layers[0];
 const activeFile = files.find((file) => file.path === activeFilePath) ?? files[0];

 useEffect(() => {
 const nextFiles = createCodeBuilderFiles(plan);
 setFiles(nextFiles);
 setActiveFilePath(nextFiles[0]?.path ??"app/page.tsx");
 }, [plan]);

 const sendChatMessage = () => {
 const content = chatInput.trim();
 if (!content) return;
 setMessages((current) => [
 ...current,
 { id: `user-${Date.now()}`, role:"user", content },
 ]);
 setChatInput("");
 };

 const updateActiveFile = (content: string) => {
 setFiles((current) =>
 current.map((file) => (file.path === activeFile.path ? { ...file, content } : file)),
 );
 };

 return (
 <div className="flex h-[calc(100vh-76px)] min-h-[720px] w-full flex-col overflow-hidden rounded-[8px] border border-[#DDE3EA] bg-[#F2F5F8]">
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
 <Monitor className="h-4 w-4"/>
 </span>
 <div className="min-w-0">
 <div className="flex min-w-0 flex-wrap items-center gap-2">
 <h2 className="truncate text-[15px] font-semibold text-[#171717]">{plan.projectName ||"Website Building Template"}</h2>
 <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[#BFE6D1] bg-[#EEFDF4] px-2 text-[10px] font-semibold text-[#087443]">
 <CheckCircle2 className="h-3 w-3"/>
 Plan generated
 </span>
 </div>
 <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{plan.websiteType}</p>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <BuilderToolButton icon={Monitor} label="Preview"onClick={() => undefined} />
 <BuilderToolButton icon={Download} label="Export"onClick={onExport} />
 <BuilderToolButton icon={RefreshCw} label="Regenerate"onClick={onRegenerate} />
 <button onClick={onSave} className="inline-flex h-8 items-center gap-2 rounded-[8px] bg-[#171717] px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#2B2F34]">
 <CheckCircle2 className="h-3.5 w-3.5"/>
 Save
 </button>
 </div>
 </header>
 );
}

function BuilderToolButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
 return (
 <button onClick={onClick} className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717]">
 <Icon className="h-3.5 w-3.5"/>
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
 <Layers3 className="h-4 w-4 text-[#1DA1F2]"/>
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
 className={`flex w-full items-start gap-3 rounded-[8px] border px-3 py-3 text-left transition-all ${active ?"border-[#9BD2FF] bg-[#EEF7FC]":"border-transparent bg-transparent hover:border-[#E5EAF0] hover:bg-white"}`}
 >
 <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] ${active ?"bg-[#4A9BFF] text-white":"bg-[#EEF2F5] text-[#6B7280]"}`}>
 <FileText className="h-3.5 w-3.5"/>
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
 <div key={message.id} className={`rounded-[8px] px-3 py-2 text-[11px] leading-5 ${message.role ==="user"?"ml-5 bg-[#EEF7FC] text-[#1F2937]":"mr-5 bg-[#F3F6F8] text-[#4B5563]"}`}>
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
 if (event.key ==="Enter"&& !event.shiftKey) {
 event.preventDefault();
 onSubmit();
 }
 }}
 rows={2}
 className="min-w-0 flex-1 resize-none bg-transparent text-[12px] leading-5 text-[#171717] outline-none placeholder:text-[#6B7280]"
 placeholder="Chat for building website from prompt"
 />
 <button type="submit"disabled={!input.trim()} aria-label="Send builder message"className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#1497BC] text-white transition-all hover:bg-[#0F7898] disabled:cursor-not-allowed disabled:opacity-40">
 <Send className="h-3.5 w-3.5"/>
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
 <section className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#CCD4DD] bg-[#F7F9FB]">
 <div className="flex min-h-[46px] items-center justify-between gap-3 border-b border-[#DDE3EA] bg-white px-3">
 <div className="flex min-w-0 items-center gap-2">
 <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[#EEF7FC] text-[#1DA1F2]">
 <Code2 className="h-3.5 w-3.5"/>
 </span>
 <div className="min-w-0">
 <p className="truncate text-[12px] font-semibold text-[#171717]">{activeFile.path}</p>
 <p className="text-[10px] font-semibold uppercase text-[#8A94A3]">{activeFile.language}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#E5EAF0] bg-white px-2.5 text-[10px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8] hover:text-[#171717]">
 <RefreshCw className="h-3 w-3"/>
 Format
 </button>
 <button className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#171717] px-2.5 text-[10px] font-semibold text-white transition-all hover:bg-[#2B2F34]">
 <CheckCircle2 className="h-3 w-3"/>
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
 className={`flex min-w-[150px] items-center gap-2 rounded-[7px] px-2.5 py-2 text-left transition-all xl:w-full xl:min-w-0 ${active ?"bg-[#EEF7FC] text-[#171717]":"text-[#6B7280] hover:bg-white hover:text-[#171717]"}`}
 >
 <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${active ?"text-[#1DA1F2]":"text-[#A1A7B0]"}`} />
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
 <PlanMetric label="Website type"value={plan.websiteType} />
 <PlanMetric label="Pages"value={plan.pages.join(",")} />
 </div>
 <div className="rounded-[8px] border border-[#E5EAF0] bg-white p-3">
 <p className="text-[11px] font-semibold text-[#171717]">{activeLayer?.label ??"Selected layer"}</p>
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
 <section className="h-full min-h-[420px] min-w-0 overflow-auto rounded-[8px] border border-[#CCD4DD] bg-[#D7DBDF] p-4">
 <div className="mx-auto min-h-full w-full rounded-[8px] border border-[#C8D0D8] bg-[#D7DBDF] p-4">
 <div className="overflow-hidden rounded-[8px] border border-[#C8D0D8] bg-white">
 <PreviewNavbar plan={plan} active={activeLayerId ==="header"} />
 <PreviewHero plan={plan} active={activeLayerId ==="hero"} />
 <PreviewFeatureGrid plan={plan} active={activeLayerId ==="features"} />
 {plan.layers.some((layer) => layer.id ==="pricing") && <PreviewPricing active={activeLayerId ==="pricing"} />}
 <PreviewTestimonials active={activeLayerId ==="testimonials"} />
 <PreviewCta active={activeLayerId ==="cta"} />
 <PreviewFooter plan={plan} active={activeLayerId ==="footer"} />
 </div>
 </div>
 </section>
 );
}

function previewSectionClass(active: boolean, extra ="") {
 return `transition-all ${active ?"ring-2 ring-[#4A9BFF] ring-inset":""} ${extra}`;
}

function PreviewNavbar({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
 return (
 <div className={previewSectionClass(active,"flex items-center justify-between border-b border-[#E5EAF0] bg-white px-7 py-4")}>
 <div className="flex items-center gap-2">
 <span className="h-7 w-7 rounded-[7px] bg-[#171717]"/>
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
 <section className={previewSectionClass(active,"bg-[#727272] px-7 py-16 text-center")}>
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
 <section className={previewSectionClass(active,"bg-[#666666] px-7 py-8")}>
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
 <section className={previewSectionClass(active,"bg-[#F2F4F6] px-7 py-9")}>
 <div className="mb-4 flex items-end justify-between gap-4">
 <h3 className="text-[20px] font-semibold text-[#171717]">Pricing Section</h3>
 <span className="text-[11px] font-semibold text-[#6B7280]">3 plans</span>
 </div>
 <div className="grid gap-3 md:grid-cols-3">
 {["Starter","Growth","Scale"].map((tier) => (
 <div key={tier} className="rounded-[8px] border border-[#E5EAF0] bg-white p-4">
 <p className="text-[12px] font-semibold text-[#171717]">{tier}</p>
 <div className="mt-4 h-2 w-20 rounded-full bg-[#D9D9D9]"/>
 <div className="mt-2 h-2 w-28 rounded-full bg-[#E5EAF0]"/>
 </div>
 ))}
 </div>
 </section>
 );
}

function PreviewTestimonials({ active }: { active: boolean }) {
 return (
 <section className={previewSectionClass(active,"bg-white px-7 py-9")}>
 <h3 className="text-[20px] font-semibold text-[#171717]">Testimonials</h3>
 <div className="mt-5 grid gap-3 md:grid-cols-2">
 {[1, 2].map((item) => (
 <div key={item} className="rounded-[8px] border border-[#E5EAF0] bg-[#FCFDFE] p-4">
 <div className="h-2 w-24 rounded-full bg-[#D9D9D9]"/>
 <div className="mt-3 h-2 w-full rounded-full bg-[#E5EAF0]"/>
 <div className="mt-2 h-2 w-3/4 rounded-full bg-[#E5EAF0]"/>
 </div>
 ))}
 </div>
 </section>
 );
}

function PreviewCta({ active }: { active: boolean }) {
 return (
 <section className={previewSectionClass(active,"bg-[#D9D9D9] px-7 py-10 text-center")}>
 <h3 className="text-[24px] font-semibold text-[#171717]">CTA Area</h3>
 <p className="mx-auto mt-3 max-w-md text-[12px] leading-5 text-[#4B5563]">Final conversion section generated from the website plan.</p>
 </section>
 );
}

function PreviewFooter({ plan, active }: { plan: CodeBuilderPlan; active: boolean }) {
 return (
 <footer className={previewSectionClass(active,"flex flex-wrap items-center justify-between gap-3 bg-[#171717] px-7 py-5 text-white")}>
 <span className="text-[12px] font-semibold">{plan.projectName}</span>
 <span className="text-[11px] text-white/60">{plan.pages.join("/")}</span>
 </footer>
 );
}

function BlenderPage() {
 const { openModal, showToast } = useStudioActions();

 return (
 <div>
 <PageHeader title="Blender 3D"subtitle="Generate, import, and organize 3D production assets."action={<PrimaryButton icon={Box} onClick={() => showToast("New Blender task prepared")}>New 3D task</PrimaryButton>} />
 <div className="grid gap-4 lg:grid-cols-2">
 <button onClick={() => openModal("asset-upload")} className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAECEF] bg-[#FCFDFE] p-4 text-center transition-all hover:border-[#CFE8F8]">
 <Layers3 className="h-8 w-8 text-[#1DA1F2]"/>
 <p className="mt-3 text-[13px] font-semibold text-[#171717]">Upload asset or model</p>
 <p className="mt-1 text-[11px] text-[#6B7280]">OBJ, FBX, GLB, and blend files can be staged here.</p>
 </button>
 <SoftCard>
 <label className="text-[12px] font-semibold text-[#171717]">Generation prompt</label>
 <textarea className="mt-3 min-h-[116px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0]"placeholder="Describe the model, material, lighting, or scene..."/>
 <PrimaryButton icon={Sparkles} onClick={() => showToast("Blender generation prepared")}>Prepare generation</PrimaryButton>
 </SoftCard>
 </div>
 <div className="mt-5 grid gap-3 md:grid-cols-4">
 {["Material study","Product scene","Workspace lab","Character base"].map((name) => (
 <ClickableSoftCard key={name} className="min-h-[120px]"onClick={() => showToast(`${name} asset opened`)} ariaLabel={`Open ${name}`}>
 <div className="mb-3 h-14 rounded-xl bg-[#EEF7FC]"/>
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
 const [typeFilter, setTypeFilter] = useState<"all"| AssetType>("all");
 const [sortMode, setSortMode] = useState<"recent"|"oldest"|"az"|"za"|"largest"|"smallest">("recent");
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
 const matchesType = typeFilter ==="all"|| asset.type === typeFilter;
 const matchesQuery =
 !normalizedQuery ||
 [asset.name, asset.type, asset.filename, ...asset.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
 return matchesType && matchesQuery;
 })
 .sort((a, b) => {
 if (sortMode ==="oldest") return Date.parse(a.createdAt) - Date.parse(b.createdAt);
 if (sortMode ==="az") return a.name.localeCompare(b.name);
 if (sortMode ==="za") return b.name.localeCompare(a.name);
 if (sortMode ==="largest") return b.size - a.size;
 if (sortMode ==="smallest") return a.size - b.size;
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
 showToast(`${accepted.length} asset${accepted.length > 1 ?"s":""} uploaded`);
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
 const showCategoryShortcuts = assets.length === 0 && !searchQuery && typeFilter ==="all";

 return (
 <div>
 <PageHeader title="Asset Library"subtitle="Search, filter, and upload creative assets."action={<PrimaryButton icon={Upload} onClick={() => fileInputRef.current?.click()}>Upload asset</PrimaryButton>} />
 <input
 ref={fileInputRef}
 type="file"
 multiple
 className="hidden"
 onChange={(event) => {
 if (event.target.files) handleFiles(event.target.files);
 event.target.value ="";
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
 className={`mb-5 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row ${isDragging ?"border-[#9BD2FF] bg-[#EEF7FF]":"border-[#EAECEF] bg-[#FCFDFE]"}`}
 >
 <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3">
 <Search className="h-4 w-4 text-[#9CA3AF]"/>
 <input
 value={searchQuery}
 onChange={(event) => setSearchQuery(event.target.value)}
 className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]"
 placeholder="Search assets..."
 aria-label="Search assets"
 />
 </div>
 <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as"all"| AssetType)} className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] outline-none">
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
 {isLoading && <StudioInlineState icon={RefreshCw} title="Loading assets"text="Reading saved asset metadata from this browser."/>}
 {!isLoading && showCategoryShortcuts && (
 <div className="grid gap-3 md:grid-cols-4">
 {assetTypeOptions.map((category) => {
 const Icon = category.icon;
 return (
 <ClickableSoftCard key={category.type} onClick={() => setTypeFilter(category.type)} ariaLabel={`Filter ${category.label} assets`}>
 <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
 <Icon className="h-6 w-6"/>
 </div>
 <p className="text-[12px] font-semibold text-[#171717]">{category.label} asset</p>
 <p className="mt-1 text-[10px] text-[#6B7280]">Upload or filter this category</p>
 </ClickableSoftCard>
 );
 })}
 </div>
 )}
 {!isLoading && !showCategoryShortcuts && filteredAssets.length === 0 && (
 <StudioInlineState icon={Search} title="No assets found"text="No uploaded assets match the current search or filters."/>
 )}
 {!isLoading && filteredAssets.length > 0 && (
 <div className="grid gap-3 md:grid-cols-4">
 {filteredAssets.map((asset) => (
 <AssetCard key={asset.id} asset={asset} onOpen={() => setSelectedAsset(asset)} />
 ))}
 </div>
 )}
 {!isLoading && !showCategoryShortcuts && filteredAssets.length === 0 && (
 <button onClick={resetFilters} className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8]">Reset filters</button>
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
 { type:"image", label:"Image", icon: ImageIcon },
 { type:"vector", label:"Vector", icon: PenLine },
 { type:"model", label:"Model", icon: Box },
 { type:"document", label:"Document", icon: FileText },
 { type:"texture", label:"Texture", icon: Layers3 },
 { type:"reference", label:"Reference", icon: Paperclip },
 { type:"export", label:"Export", icon: Upload },
 { type:"audio", label:"Audio", icon: MessageCircle },
];

function assetTypeLabel(type: AssetType) {
 return assetTypeOptions.find((option) => option.type === type)?.label ?? type;
}

function AssetCard({ asset, onOpen }: { asset: StudioAsset; onOpen: () => void }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 const Icon = assetTypeOptions.find((option) => option.type === asset.type)?.icon ?? FileText;
 const isImagePreview = asset.type ==="image"|| asset.type ==="vector";

 return (
 <ClickableSoftCard onClick={onOpen} ariaLabel={`Open ${asset.name}`}>
 <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
 {isImagePreview && asset.previewUrl ? (
 <img src={asset.previewUrl} alt=""className="h-full w-full object-cover"/>
 ) : (
 <Icon className="h-6 w-6"/>
 )}
 </div>
 <p className={`truncate text-[12px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>{asset.name}</p>
 <p className={`mt-1 text-[10px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{assetTypeLabel(asset.type)} - {formatFileSize(asset.size)}</p>
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
 const dark = theme ==="dark";
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
 window.open(asset.previewUrl,"_blank","noopener,noreferrer");
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
 <div className={`fixed inset-0 z-50 flex justify-end backdrop-blur-[2px] ${dark ?"bg-black/35":"bg-[#1F2937]/20"}`} onMouseDown={onClose}>
 <aside className={`h-full w-full max-w-md overflow-y-auto border-l p-5 shadow-[-24px_0_70px_rgba(31,43,77,0.14)] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#202328]":"border-[#E5E7EB] bg-white"}`} onMouseDown={(event) => event.stopPropagation()}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className={`text-[17px] font-semibold tracking-[-0.02em] ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Asset details</h2>
 <p className={`mt-2 text-[12px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{assetTypeLabel(asset.type)} - {asset.status}</p>
 </div>
 <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)]":"text-[#9CA3AF] hover:bg-[#F4F8FB]"}`} aria-label="Close asset details">
 <X className="h-4 w-4"/>
 </button>
 </div>

 <div className="mt-5 space-y-4">
 <div className="flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-[#EEF7FC] text-[#1DA1F2]">
 {(asset.type ==="image"|| asset.type ==="vector") && asset.previewUrl ? (
 <img src={asset.previewUrl} alt=""className="h-full w-full object-contain"/>
 ) : (
 <Icon className="h-10 w-10"/>
 )}
 </div>
 <div>
 <label className={`text-[11px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#171717]"}`}>Asset name</label>
 <div className="mt-2 flex gap-2">
 <input value={name} onChange={(event) => setName(event.target.value)} className={`h-10 min-w-0 flex-1 rounded-xl border px-3 text-[12px] outline-none ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8]":"border-[#E5EAF0] bg-white text-[#171717]"}`} />
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
 <button onClick={openAsset} className="rounded-xl border border-[#E5EAF0] px-3 py-2 text-[11px] font-semibold text-[#4B5563]">{canOpen ?"Open":"Preview unavailable"}</button>
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
 mode:"agent"|"workflow";
 onChange: (next:"agent"|"workflow") => void;
 dark: boolean;
}) {
 const containerClass = dark
 ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]"
 :"border-[#E5E7EB] bg-white";
 const inactiveClass = dark
 ?"text-[#A8B0BA] hover:text-[#F4F6F8]"
 :"text-[#4B5563] hover:text-[#1F1F1F]";
 return (
 <div className={`inline-flex items-center gap-1 rounded-full border p-[2px] shadow-[0_8px_18px_rgba(15,23,42,0.05)] ${containerClass}`} role="tablist"aria-label="Build mode">
 <button
 type="button"
 role="tab"
 aria-selected={mode ==="agent"}
 onClick={() => onChange("agent")}
 className={`inline-flex h-7 items-center gap-1.5 rounded-full px-5 text-[10px] font-semibold transition-all ${
 mode ==="agent"
 ?"bg-[#4284FF] text-white"
 : inactiveClass
 }`}
 >
 <CircleSlash className="h-3 w-3"/>
 Agent
 </button>
 <button
 type="button"
 role="tab"
 aria-selected={mode ==="workflow"}
 onClick={() => onChange("workflow")}
 className={`inline-flex h-7 items-center gap-1.5 rounded-full px-5 text-[10px] font-semibold transition-all ${
 mode ==="workflow"
 ?"bg-[#4284FF] text-white"
 : inactiveClass
 }`}
 >
 <Network className="h-3 w-3"/>
 Workflow
 </button>
 </div>
 );
}

type StarterCard = {
 title: string;
 description: string;
 shortTitle?: string;
 shortDescription?: string;
 icon: LucideIcon;
 prompt: string;
 href?: string;
};

type StarterVisual = {
 image: string;
 preview: string;
 strip: string;
 marker: string;
 meta: string;
};

const starterVisuals: StarterVisual[] = [
 {
 image: "/ai-cards/chat-code.svg",
 preview: "from-[#D4D7DC] via-[#EEF1F5] to-[#FFFFFF]",
 strip: "from-[#19B7A5] via-[#2B8CFF] to-[#BDB4FF]",
 marker: "bg-[#22C55E]",
 meta: "Planning",
 },
 {
 image: "/ai-cards/chat-unity.svg",
 preview: "from-[#073963] via-[#0C82B5] to-[#B8F0FF]",
 strip: "from-[#3758FF] via-[#DE3BFF] to-[#FF8A3D]",
 marker: "bg-[#7C3AED]",
 meta: "Agent",
 },
 {
 image: "/ai-cards/chat-architecture.svg",
 preview: "from-[#DFF8FB] via-[#B6EEF0] to-[#8EE0E4]",
 strip: "from-[#F97316] via-[#FB7185] to-[#FCD34D]",
 marker: "bg-[#F97316]",
 meta: "Browser",
 },
 {
 image: "/ai-cards/code.svg",
 preview: "from-[#0F172A] via-[#2563EB] to-[#93C5FD]",
 strip: "from-[#38BDF8] via-[#2563EB] to-[#1E40AF]",
 marker: "bg-[#38BDF8]",
 meta: "Code",
 },
 {
 image: "/ai-cards/engine.svg",
 preview: "from-[#064E3B] via-[#16A34A] to-[#BEF264]",
 strip: "from-[#22C55E] via-[#84CC16] to-[#FACC15]",
 marker: "bg-[#84CC16]",
 meta: "Engine",
 },
 {
 image: "/ai-cards/autocad.svg",
 preview: "from-[#7F1D1D] via-[#EF4444] to-[#FED7AA]",
 strip: "from-[#EF4444] via-[#F97316] to-[#FDBA74]",
 marker: "bg-[#EF4444]",
 meta: "CAD",
 },
];

const agentStarters: StarterCard[] = [
 {
 title:"AI Code",
 description:"Generate, debug, refactor, and review full-stack code.",
 shortTitle:"Code",
 shortDescription:"Build, debug, and review code.",
 icon: Code2,
 prompt:"Help me write, debug, or review code for",
 href:"/ai-assistant/tools/code",
 },
 {
 title:"Unity / Unreal Engine",
 description:"Plan gameplay, levels, mechanics, NPCs, assets, and optimization.",
 shortTitle:"Unity / Unreal",
 shortDescription:"Design games and real-time scenes.",
 icon: Gamepad2,
 prompt:"Help me plan a Unity or Unreal Engine project with gameplay, levels, assets, and optimization for",
 },
 {
 title:"Architecture",
 description:"Draft architectural layouts, dimensions, rooms, and technical plans.",
 shortTitle:"Architecture",
 shortDescription:"Plan spaces, layouts, and drawings.",
 icon: Network,
 prompt:"Help me create an architectural plan with dimensions, rooms, layers, and notes for",
 href:"/ai-assistant/tools/autocad",
 },
 {
 title:"Blender 3D",
 description:"Create scene briefs, materials, lighting, camera, and render plans.",
 shortTitle:"Blender 3D",
 shortDescription:"Plan scenes and 3D renders.",
 icon: Layers3,
 prompt:"Help me prepare a Blender 3D scene brief for",
 href:"/ai-assistant/tools/blender",
 },
 {
 title:"Cedium Design",
 description:"Shape UI screens, web layouts, prototypes, and design systems.",
 shortTitle:"Design",
 shortDescription:"Create layouts and prototypes.",
 icon: Monitor,
 prompt:"Create a clean design direction, layout, and component plan for",
 href:"/cedium-design",
 },
 {
 title:"Workflow Automation",
 description:"Build secure workflow automations, approvals, and repeatable tasks.",
 shortTitle:"Workflow",
 shortDescription:"Automate tasks securely.",
 icon: Workflow,
 prompt:"Help me create a workflow that automates",
 },
];

const workflowStarters: StarterCard[] = [
 {
 title:"Blank workflow",
 description:"Start from scratch and design every step of your automation.",
 icon: Workflow,
 prompt:"Design a blank workflow that",
 },
 {
 title:"Scheduled run",
 description:"Trigger workflows on a cron-style schedule with built-in retries.",
 icon: RefreshCw,
 prompt:"Create a scheduled workflow that",
 },
 {
 title:"Connect apps",
 description:"Move data between tools with secure connectors and approvals.",
 icon: Plug,
 prompt:"Connect two apps with a workflow that",
 },
];

function StarterPanel({
 mode,
 dark,
 onOpen,
}: {
 mode:"agent"|"workflow";
 dark: boolean;
 onOpen: (card: StarterCard) => void;
}) {
 const cards = mode ==="agent"? agentStarters : workflowStarters;
 const [carouselIndex, setCarouselIndex] = useState(0);
 const visibleCount = Math.min(3, cards.length);
 const showCarouselControls = cards.length > visibleCount;
 const visibleCards = Array.from({ length: visibleCount }, (_, offset) => {
 const index = (carouselIndex + offset) % cards.length;
 return { card: cards[index], index, offset };
 });
 const cardBase = dark
 ?"border-[rgba(255,255,255,0.1)] bg-[#202328] shadow-[0_18px_42px_rgba(0,0,0,0.34)]"
 :"border-[#E1E5EA] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]";

 useEffect(() => {
 setCarouselIndex(0);
 }, [mode]);

 const goToPreviousStarter = () => {
 setCarouselIndex((current) => (current - 1 + cards.length) % cards.length);
 };

 const goToNextStarter = () => {
 setCarouselIndex((current) => (current + 1) % cards.length);
 };

 return (
 <div className="w-full text-left">
 <div className="relative w-full overflow-visible px-0 pb-0 pt-0 max-sm:px-8">
 {showCarouselControls && (
 <button
 type="button"
 onClick={goToPreviousStarter}
 aria-label="Previous AI platform function"
 className={`absolute -left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border transition-colors max-sm:left-0 ${dark ?"border-[rgba(255,255,255,0.1)] bg-[#202328] text-[#DDE3EA] hover:bg-[#252A31]":"border-[#E5E7EB] bg-white text-[#475467] shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:border-[#B9D8FF] hover:text-[#4284FF]"}`}
 >
 <ChevronLeft className="h-4 w-4" />
 </button>
 )}
 <div className="grid w-full grid-cols-3 items-center gap-4 max-sm:grid-cols-1">
 {visibleCards.map(({ card, index, offset }) => {
 const Icon = card.icon;
 const visual = starterVisuals[index % starterVisuals.length];
 const isCenterCard = offset === 1 && visibleCards.length === 3;
 return (
 <button
 key={`${carouselIndex}-${card.title}`}
 type="button"
 onClick={() => onOpen(card)}
 aria-label={card.title}
 className={`group relative flex h-[280px] w-full flex-col overflow-hidden rounded-[8px] border text-left transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4284FF] focus-visible:ring-offset-2 max-sm:h-[250px] ${isCenterCard ?"scale-[1.01]":"scale-100"} ${cardBase}`}
 >
 <span className={`absolute inset-0 bg-gradient-to-br ${visual.preview}`} />
 <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${visual.image})` }} />
 <span className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/[0.06]" />
 <span className={`absolute inset-x-[5px] bottom-[5px] flex h-[82px] items-center gap-3 rounded-[7px] px-5 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ${dark ?"bg-[#F8FAFC]":"bg-white"}`}>
 <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[#4284FF]">
 <Icon className="h-[22px] w-[22px]" strokeWidth={1.9}/>
 </span>
 <span className="min-w-0 flex-1">
 <span className="block truncate text-[12px] font-bold leading-[1.12] text-[#111827]">
 {card.shortTitle ?? card.title}
 </span>
 <span className="mt-2 block max-w-[132px] text-[9px] leading-[1.25] text-[#111827]">
 {card.shortDescription ?? card.description}
 </span>
 </span>
 </span>
 </button>
 );
 })}
 </div>
 {showCarouselControls && (
 <button
 type="button"
 onClick={goToNextStarter}
 aria-label="Next AI platform function"
 className={`absolute -right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border transition-colors max-sm:right-0 ${dark ?"border-[rgba(255,255,255,0.1)] bg-[#202328] text-[#DDE3EA] hover:bg-[#252A31]":"border-[#E5E7EB] bg-white text-[#475467] shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:border-[#B9D8FF] hover:text-[#4284FF]"}`}
 >
 <ChevronRight className="h-4 w-4" />
 </button>
 )}
 </div>
 </div>
 );
}

function StarterPlaygroundView({
 card,
 dark,
 onBack,
}: {
 card: StarterCard;
 dark: boolean;
 onBack: () => void;
 onRun: () => void;
}) {
 const { showToast } = useStudioActions();
 const Icon = card.icon;

 const panels = [
 { label: "Base task", model: "Claude 4.5 Sonnet", accent: dark ? "bg-[#7DD3FC]" : "bg-[#94A3B8]", output: "Summary", score: "< $0.001", latency: "1.1s" },
 { label: "Comparison task", model: "GPT-5", accent: "bg-[#8B5CF6]", output: "Structured plan", score: "$0.001", latency: "1.8s" },
 { label: "Comparison task", model: "Gemini 2.5 Pro", accent: "bg-[#4F7BFF]", output: "Launch checklist", score: "$0.001", latency: "1.8s" },
 ];

 const taskPrompt = `You are a Cedium production analyst. Your task is to review the request and provide a concise plan for: ${card.title}.`;
 const textClass = dark ? "text-[#F4F6F8]" : "text-[#111827]";
 const mutedClass = dark ? "text-[#A8B0BA]" : "text-[#667085]";
 const panelClass = dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white";
 const softClass = dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20]" : "border-[#EDF1F5] bg-[#F8FAFC]";
 const btnBase = dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:bg-[#202328]" : "border-[#DDE5EE] bg-white text-[#344054] hover:bg-[#F8FAFC]";
 const dividerClass = dark ? "border-[rgba(255,255,255,0.08)]" : "border-[#E5EAF0]";

 // ── Top-bar state ──────────────────────────────────────────
 const [diffEnabled, setDiffEnabled] = useState(false);
 const [experimentsOpen, setExperimentsOpen] = useState(false);
 const [isRunning, setIsRunning] = useState(false);
 const [versionSaved, setVersionSaved] = useState(false);

 // ── Per-card state ─────────────────────────────────────────
 const [activeParamsMenu, setActiveParamsMenu] = useState<string | null>(null);
 const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
 const [savedPrompts, setSavedPrompts] = useState<Set<string>>(new Set());
 const [cardPrompts, setCardPrompts] = useState<Record<string, string>>({
  "Claude 4.5 Sonnet": "For each result include a short summary, intent classification, and one practical next step.",
  "GPT-5": "For each result include a short summary, intent classification, and one practical next step.",
  "Gemini 2.5 Pro": "For each result include a short summary, intent classification, and one practical next step.",
 });
 const [cardParams, setCardParams] = useState<Record<string, { temperature: number; maxTokens: number }>>({
  "Claude 4.5 Sonnet": { temperature: 0.7, maxTokens: 1024 },
  "GPT-5": { temperature: 0.7, maxTokens: 1024 },
  "Gemini 2.5 Pro": { temperature: 0.7, maxTokens: 1024 },
 });

 // ── Table state ────────────────────────────────────────────
 const [tableRows, setTableRows] = useState([
  { id: 1, input: "My subscription was charged twice this month. Can you help me get a refund?" },
 ]);
 const [nextRowId, setNextRowId] = useState(2);
 const allColumns = ["Input", "CustomerSupport", "Claude 4.5 Sonnet", "GPT-5", "Gemini 2.5 Pro"];
 const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(allColumns));
 const [rowHeight, setRowHeight] = useState<"compact" | "comfortable" | "expanded">("comfortable");
 const [viewMode, setViewMode] = useState<"table" | "grid">("table");
 const [filterOpen, setFilterOpen] = useState(false);
 const [fieldsOpen, setFieldsOpen] = useState(false);
 const [groupOpen, setGroupOpen] = useState(false);
 const [filterText, setFilterText] = useState("");

 // ── Dropdown refs for click-outside ───────────────────────
 const experimentsRef = useRef<HTMLDivElement>(null);
 const filterRef = useRef<HTMLDivElement>(null);
 const fieldsRef = useRef<HTMLDivElement>(null);
 const groupRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  function onDown(e: MouseEvent) {
   const t = e.target as Node;
   if (experimentsRef.current && !experimentsRef.current.contains(t)) setExperimentsOpen(false);
   if (filterRef.current && !filterRef.current.contains(t)) setFilterOpen(false);
   if (fieldsRef.current && !fieldsRef.current.contains(t)) setFieldsOpen(false);
   if (groupRef.current && !groupRef.current.contains(t)) setGroupOpen(false);
  }
  document.addEventListener("mousedown", onDown);
  return () => document.removeEventListener("mousedown", onDown);
 }, []);

 // ── Handlers ───────────────────────────────────────────────
 const handleRun = async () => {
  if (isRunning) return;
  setIsRunning(true);
  await new Promise<void>((resolve) => setTimeout(resolve, 1800));
  setIsRunning(false);
  showToast("Run complete");
 };

 const handleSaveVersion = () => {
  setVersionSaved(true);
  showToast("Version saved");
  setTimeout(() => setVersionSaved(false), 2500);
 };

 const handleSavePrompt = (model: string) => {
  setSavedPrompts((prev) => new Set(Array.from(prev).concat(model)));
  showToast("Prompt saved");
  setTimeout(() => setSavedPrompts((prev) => { const next = new Set(prev); next.delete(model); return next; }), 2500);
 };

 const addRow = () => {
  setTableRows((rows) => [...rows, { id: nextRowId, input: "" }]);
  setNextRowId((n) => n + 1);
 };

 const cycleRowHeight = () => {
  setRowHeight((h) => h === "compact" ? "comfortable" : h === "comfortable" ? "expanded" : "compact");
 };

 const rowPy = rowHeight === "compact" ? "py-2" : rowHeight === "comfortable" ? "py-4" : "py-6";
 const promptRows = rowHeight === "compact" ? 1 : rowHeight === "comfortable" ? 2 : 4;
 const nonInputVisible = allColumns.filter((c) => c !== "Input" && visibleColumns.has(c));
 const gridCols = `46px 1.35fr ${nonInputVisible.map(() => "1fr").join(" ")}`;
 const filteredRows = filterText
  ? tableRows.filter((r) => r.input.toLowerCase().includes(filterText.toLowerCase()))
  : tableRows;

 return (
  // scroll container — fixes cut-off content
  <div className="h-full overflow-y-auto">
   <div className={`flex min-h-full w-full justify-center px-4 py-5 ${dark ? "bg-transparent" : "bg-[#F6F8FB]"}`}>
    <div className="w-full max-w-[1180px] pb-10">

     {/* ── Breadcrumb & top controls ── */}
     <div className={`mb-3 flex flex-wrap items-center justify-between gap-3 text-[12px] ${mutedClass}`}>
      <div className="flex items-center gap-2">
       <button
        type="button"
        onClick={onBack}
        className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 font-semibold transition-colors ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] hover:bg-[#202328]" : "border-[#DDE5EE] bg-white text-[#344054] hover:bg-[#F8FAFC]"}`}
       >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
       </button>
       <Link href="/studio-overview" className="hover:underline">Acme</Link>
       <ChevronRight className="h-3 w-3" />
       <Link href="/studio-overview" className="hover:underline">AI Studio</Link>
       <ChevronRight className="h-3 w-3" />
       <span className={textClass}>Playgrounds</span>
      </div>

      <div className="flex items-center gap-2">
       <span>Diff</span>
       {/* Diff toggle */}
       <button
        type="button"
        role="switch"
        aria-checked={diffEnabled}
        onClick={() => setDiffEnabled((v) => !v)}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${diffEnabled ? "bg-[#4284FF]" : dark ? "bg-[#2B3037]" : "bg-[#E5E7EB]"}`}
       >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${diffEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
       </button>

       {/* Experiments */}
       <div ref={experimentsRef} className="relative">
        <button
         type="button"
         onClick={() => setExperimentsOpen((v) => !v)}
         className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-3 font-semibold transition-colors ${dark ? "hover:bg-[#202328]" : "hover:bg-white"}`}
        >
         <Plus className="h-3.5 w-3.5" />
         Experiments
        </button>
        {experimentsOpen && (
         <div className={`absolute right-0 top-10 z-20 w-56 rounded-xl border p-4 shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
          <p className={`text-[12px] font-semibold ${textClass}`}>No experiments yet</p>
          <p className={`mt-1 text-[11px] leading-5 ${mutedClass}`}>Run a playground comparison to create one.</p>
         </div>
        )}
       </div>

       {/* Run */}
       <button
        type="button"
        onClick={() => void handleRun()}
        disabled={isRunning}
        className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-3 font-semibold text-white transition-colors ${isRunning ? "cursor-not-allowed bg-[#4284FF]/70" : "bg-[#4284FF] hover:bg-[#376FE0]"}`}
       >
        {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
        {isRunning ? "Running…" : "Run"}
       </button>
      </div>
     </div>

     {/* ── Main panel ── */}
     <div className={`overflow-hidden rounded-[18px] border shadow-[0_18px_60px_rgba(31,43,77,0.08)] ${panelClass}`}>

      {/* Panel header */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${dividerClass}`}>
       <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-[rgba(59,167,255,0.18)] text-[#7DD3FC]" : "bg-[#E8F4FB] text-[#4284FF]"}`}>
         <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
         <h2 className={`text-[15px] font-semibold ${textClass}`}>{card.shortTitle ?? card.title} Playground</h2>
         <p className={`text-[11px] ${mutedClass}`}>Compare prompt behavior before launching in chat.</p>
        </div>
       </div>
       <button
        type="button"
        onClick={handleSaveVersion}
        className={`hidden h-8 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition-colors sm:inline-flex ${versionSaved ? (dark ? "border-[rgba(255,255,255,0.08)] text-[#34D399]" : "border-[#D1FAE5] text-[#059669]") : (dark ? "border-[rgba(255,255,255,0.08)] text-[#A8B0BA] hover:text-[#F4F6F8]" : "border-[#DDE5EE] text-[#344054] hover:bg-[#F8FAFC]")}`}
       >
        {versionSaved && <CheckCircle2 className="h-3.5 w-3.5" />}
        {versionSaved ? "Saved" : "Save version"}
       </button>
      </div>

      {/* ── Model cards ── */}
      <div className="grid gap-1 p-2 lg:grid-cols-3">
       {panels.map((panel) => {
        const isParamsOpen = activeParamsMenu === panel.model;
        const isMenuOpen = activeCardMenu === panel.model;
        const promptSaved = savedPrompts.has(panel.model);
        const params = cardParams[panel.model] ?? { temperature: 0.7, maxTokens: 1024 };
        const promptText = cardPrompts[panel.model] ?? "";
        const diffHighlight = diffEnabled && panel.label !== "Base task";

        return (
         <article
          key={panel.model}
          className={`relative rounded-[14px] border ${softClass} ${diffHighlight ? (dark ? "ring-1 ring-[#3BA7FF]/30" : "ring-1 ring-[#4284FF]/20") : ""}`}
         >
          {/* Card header */}
          <div className={`flex items-center justify-between border-b px-3 py-2.5 ${dividerClass}`}>
           <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${panel.accent}`} />
            <span className={`text-[11px] font-semibold ${panel.label === "Base task" ? mutedClass : "text-[#7C3AED]"}`}>{panel.label}</span>
           </div>
           <div className="relative">
            <button
             type="button"
             aria-label={`Options for ${panel.model}`}
             onClick={() => setActiveCardMenu(isMenuOpen ? null : panel.model)}
             className={`rounded-lg p-1 transition-colors ${dark ? "text-[#A8B0BA] hover:bg-[#202328]" : "text-[#98A2B3] hover:bg-white"}`}
            >
             <MoreHorizontal className="h-4 w-4" />
            </button>
            {isMenuOpen && (
             <div className={`absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
              {[
               { label: "Duplicate task", fn: () => { showToast("Task duplicated"); setActiveCardMenu(null); } },
               { label: "Rename task", fn: () => { showToast("Rename not available yet"); setActiveCardMenu(null); } },
               { label: "Clear prompt", fn: () => { setCardPrompts((p) => ({ ...p, [panel.model]: "" })); setActiveCardMenu(null); showToast("Prompt cleared"); } },
               { label: "Remove task", fn: () => { showToast("Cannot remove base task"); setActiveCardMenu(null); } },
              ].map((item) => (
               <button
                key={item.label}
                type="button"
                onClick={item.fn}
                className={`w-full px-3 py-2 text-left text-[12px] transition-colors ${dark ? "text-[#D8DEE6] hover:bg-[#181B20]" : "text-[#344054] hover:bg-[#F8FAFC]"}`}
               >
                {item.label}
               </button>
              ))}
             </div>
            )}
           </div>
          </div>

          {/* Model row */}
          <div className={`flex items-center justify-between border-b px-3 py-2 ${dividerClass}`}>
           <div className={`flex items-center gap-2 text-[12px] font-semibold ${textClass}`}>
            <Icon className="h-3.5 w-3.5 text-[#4284FF]" />
            {panel.model}
           </div>
           <div className="relative">
            <button
             type="button"
             onClick={() => setActiveParamsMenu(isParamsOpen ? null : panel.model)}
             className={`flex items-center gap-1.5 text-[11px] transition-colors ${mutedClass} hover:${textClass}`}
            >
             Params
             <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isParamsOpen && (
             <div className={`absolute right-0 top-8 z-20 w-52 rounded-xl border p-3 shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
              <p className={`mb-3 text-[11px] font-semibold ${textClass}`}>Parameters</p>
              <div className="space-y-3">
               <div>
                <label className={`block text-[10px] font-medium ${mutedClass}`}>Temperature: {params.temperature.toFixed(1)}</label>
                <input type="range" min="0" max="1" step="0.1" value={params.temperature}
                 onChange={(e) => setCardParams((p) => ({ ...p, [panel.model]: { ...params, temperature: parseFloat(e.target.value) } }))}
                 className="mt-1 w-full accent-[#4284FF]" />
               </div>
               <div>
                <label className={`block text-[10px] font-medium ${mutedClass}`}>Max tokens: {params.maxTokens}</label>
                <input type="range" min="256" max="4096" step="256" value={params.maxTokens}
                 onChange={(e) => setCardParams((p) => ({ ...p, [panel.model]: { ...params, maxTokens: parseInt(e.target.value) } }))}
                 className="mt-1 w-full accent-[#4284FF]" />
               </div>
              </div>
              <button
               type="button"
               onClick={() => setActiveParamsMenu(null)}
               className={`mt-3 w-full rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${dark ? "bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]" : "bg-[#F8FAFC] text-[#344054] hover:bg-[#EDF1F5]"}`}
              >
               Done
              </button>
             </div>
            )}
           </div>
          </div>

          {/* System prompt + editable user prompt */}
          <div className="min-h-[166px] px-4 py-3">
           <div className={`mb-2 flex items-center gap-1 text-[11px] font-medium ${mutedClass}`}>
            System <ChevronDown className="h-3 w-3" />
           </div>
           <p className={`text-[12px] leading-5 ${dark ? "text-[#D8DEE6]" : "text-[#344054]"}`}>{taskPrompt}</p>
           <textarea
            value={promptText}
            onChange={(e) => setCardPrompts((p) => ({ ...p, [panel.model]: e.target.value }))}
            placeholder="Enter your prompt…"
            rows={3}
            className={`mt-3 w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-[11px] leading-5 outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#111317] text-[#A8B0BA] placeholder:text-[#6F7782]" : "border-[#E5EAF0] bg-white text-[#667085] placeholder:text-[#B0BAC6]"}`}
           />
          </div>

          {/* Save prompt footer */}
          <div className={`flex items-center justify-between border-t px-3 py-2 text-[11px] ${dividerClass} ${dark ? "text-[#A8B0BA]" : "text-[#667085]"}`}>
           <button
            type="button"
            onClick={() => handleSavePrompt(panel.model)}
            className={`flex items-center gap-1 transition-colors ${promptSaved ? (dark ? "text-[#34D399]" : "text-[#059669]") : "hover:underline"}`}
           >
            {promptSaved && <CheckCircle2 className="h-3 w-3" />}
            {promptSaved ? "Prompt saved" : "Save prompt"}
           </button>
           <span>{promptText ? "Draft" : "Empty"}</span>
          </div>
         </article>
        );
       })}
      </div>

      {/* ── Table toolbar ── */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-y px-3 py-2 ${dividerClass}`}>
       <div className="flex flex-wrap items-center gap-2">

        <button
         type="button"
         onClick={() => { setFilterText(""); setViewMode("table"); }}
         className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${btnBase}`}
        >
         All rows
        </button>

        <div ref={filterRef} className="relative">
         <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${filterText ? (dark ? "border-[#3BA7FF]/40 bg-[#3BA7FF]/10 text-[#7DD3FC]" : "border-[#4284FF]/30 bg-[#E8F4FB] text-[#4284FF]") : btnBase}`}
         >
          Filter
         </button>
         {filterOpen && (
          <div className={`absolute left-0 top-10 z-20 w-56 rounded-xl border p-3 shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
           <p className={`mb-2 text-[11px] font-semibold ${textClass}`}>Filter rows</p>
           <input
            type="text"
            placeholder="Input contains…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-[11px] outline-none ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#D8DEE6] placeholder:text-[#A8B0BA]" : "border-[#E5EAF0] bg-[#F8FAFC] text-[#344054] placeholder:text-[#98A2B3]"}`}
           />
           {filterText && (
            <button type="button" onClick={() => setFilterText("")} className={`mt-2 text-[10px] hover:underline ${mutedClass}`}>
             Clear filter
            </button>
           )}
          </div>
         )}
        </div>

        <div ref={fieldsRef} className="relative">
         <button
          type="button"
          onClick={() => setFieldsOpen((v) => !v)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${btnBase}`}
         >
          Fields
         </button>
         {fieldsOpen && (
          <div className={`absolute left-0 top-10 z-20 w-52 rounded-xl border p-3 shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
           <p className={`mb-2 text-[11px] font-semibold ${textClass}`}>Visible columns</p>
           <div className="space-y-0.5">
            {allColumns.map((col) => (
             <label key={col} className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-colors ${dark ? "text-[#D8DEE6] hover:bg-[#181B20]" : "text-[#344054] hover:bg-[#F8FAFC]"}`}>
              <input
               type="checkbox"
               checked={visibleColumns.has(col)}
               disabled={col === "Input"}
               onChange={() => {
                if (col === "Input") return;
                setVisibleColumns((prev) => {
                 const next = new Set(prev);
                 if (next.has(col)) next.delete(col); else next.add(col);
                 return next;
                });
               }}
               className="accent-[#4284FF]"
              />
              {col}
             </label>
            ))}
           </div>
          </div>
         )}
        </div>

        <button
         type="button"
         onClick={() => setViewMode((v) => v === "table" ? "grid" : "table")}
         className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${viewMode === "grid" ? (dark ? "border-[#3BA7FF]/40 bg-[#3BA7FF]/10 text-[#7DD3FC]" : "border-[#4284FF]/30 bg-[#E8F4FB] text-[#4284FF]") : btnBase}`}
        >
         <Grid2X2 className="h-3.5 w-3.5" />
         Grid
        </button>

        <div ref={groupRef} className="relative">
         <button
          type="button"
          onClick={() => setGroupOpen((v) => !v)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${btnBase}`}
         >
          Group
         </button>
         {groupOpen && (
          <div className={`absolute left-0 top-10 z-20 w-40 rounded-xl border p-1.5 shadow-lg ${dark ? "border-[rgba(255,255,255,0.08)] bg-[#202328]" : "border-[#E5EAF0] bg-white"}`}>
           {["None", "Model", "Status", "Task"].map((g) => (
            <button
             key={g}
             type="button"
             onClick={() => { showToast(`Grouped by ${g}`); setGroupOpen(false); }}
             className={`w-full rounded-lg px-3 py-1.5 text-left text-[11px] transition-colors ${dark ? "text-[#D8DEE6] hover:bg-[#181B20]" : "text-[#344054] hover:bg-[#F8FAFC]"}`}
            >
             {g}
            </button>
           ))}
          </div>
         )}
        </div>

        <button
         type="button"
         onClick={cycleRowHeight}
         className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${btnBase}`}
        >
         Height: {rowHeight}
        </button>
       </div>

       <button
        type="button"
        onClick={addRow}
        className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors ${btnBase}`}
       >
        <Plus className="h-3.5 w-3.5" />
        Row
       </button>
      </div>

      {/* ── Table / Grid ── */}
      {viewMode === "table" ? (
       <div className="overflow-x-auto">
        <div style={{ minWidth: "900px" }}>
         {/* Header */}
         <div
          className={`grid border-b text-[11px] font-semibold ${dark ? "border-[rgba(255,255,255,0.08)] text-[#A8B0BA]" : "border-[#E5EAF0] text-[#667085]"}`}
          style={{ gridTemplateColumns: gridCols }}
         >
          <div className="px-3 py-2" />
          <div className="px-3 py-2">Input</div>
          {nonInputVisible.map((col) => <div key={col} className="px-3 py-2">{col}</div>)}
         </div>
         {/* Rows */}
         {filteredRows.map((row) => (
          <div
           key={row.id}
           className={`grid border-b text-[12px] last:border-b-0 ${dark ? "border-[rgba(255,255,255,0.06)] text-[#D8DEE6]" : "border-[#EDF1F5] text-[#344054]"}`}
           style={{ gridTemplateColumns: gridCols }}
          >
           <div className={`px-3 ${rowPy} text-[11px] ${mutedClass}`}>{row.id}</div>
           <div className={`px-3 ${rowPy}`}>
            <textarea
             value={row.input}
             onChange={(e) => setTableRows((rows) => rows.map((r) => r.id === row.id ? { ...r, input: e.target.value } : r))}
             placeholder="Enter input…"
             rows={promptRows}
             className={`w-full resize-none rounded bg-transparent text-[12px] leading-5 outline-none ${dark ? "placeholder:text-[#6F7782]" : "placeholder:text-[#B0BAC6]"}`}
            />
           </div>
           {visibleColumns.has("CustomerSupport") && (
            <div className={`px-3 ${rowPy}`}>
             <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${dark ? "bg-[#202328] text-[#A8B0BA]" : "bg-[#EEF2F7] text-[#475467]"}`}>Output</span>
             <p className={`mt-3 text-lg font-semibold ${textClass}`}>Summary</p>
            </div>
           )}
           {panels.filter((p) => visibleColumns.has(p.model)).map((panel) => (
            <div key={panel.model} className={`group relative px-3 ${rowPy}`}>
             {isRunning ? (
              <div className={`flex items-center gap-2 text-[11px] ${mutedClass}`}>
               <RefreshCw className="h-3 w-3 animate-spin" /> Running…
              </div>
             ) : (
              <>
               <div className={`flex items-center gap-3 text-[10px] ${mutedClass}`}>
                <span>Just now</span>
                <span>{panel.latency}</span>
                <span>{panel.score}</span>
               </div>
               <p className={`mt-3 text-lg font-semibold ${textClass}`}>{panel.output}</p>
               <p className={`mt-2 text-[11px] leading-5 ${mutedClass}`}>Clear intent, practical next step, and ready-to-use structure.</p>
               <button
                type="button"
                onClick={() => { void navigator.clipboard.writeText(panel.output); showToast("Copied"); }}
                aria-label="Copy output"
                className={`absolute right-2 top-2 hidden rounded-lg p-1 group-hover:flex ${dark ? "text-[#A8B0BA] hover:bg-[#202328]" : "text-[#98A2B3] hover:bg-[#EDF1F5]"}`}
               >
                <Copy className="h-3.5 w-3.5" />
               </button>
              </>
             )}
            </div>
           ))}
          </div>
         ))}
         {filteredRows.length === 0 && (
          <div className={`px-3 py-8 text-center text-[12px] ${mutedClass}`}>No rows match the current filter.</div>
         )}
        </div>
       </div>
      ) : (
       /* Grid view */
       <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRows.map((row) => (
         <div key={row.id} className={`rounded-[14px] border p-3 ${softClass}`}>
          <p className={`mb-2 text-[11px] font-semibold ${mutedClass}`}>#{row.id} Input</p>
          <p className={`text-[12px] leading-5 ${dark ? "text-[#D8DEE6]" : "text-[#344054]"}`}>{row.input || <span className={mutedClass}>Empty</span>}</p>
          <div className={`mt-3 border-t pt-3 ${dividerClass}`}>
           {panels.map((panel) => (
            <div key={panel.model} className="mt-2 first:mt-0">
             <p className={`text-[10px] font-semibold ${mutedClass}`}>{panel.model}</p>
             {isRunning ? <p className={`text-[11px] ${mutedClass}`}><RefreshCw className="mr-1 inline h-3 w-3 animate-spin" />Running…</p> : <p className={`text-[12px] font-semibold ${textClass}`}>{panel.output}</p>}
            </div>
           ))}
          </div>
         </div>
        ))}
       </div>
      )}
     </div>
    </div>
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
 const [trigger, setTrigger] = useState<"manual"|"scheduled"|"event">("manual");
 const [schedule, setSchedule] = useState("daily");
 const [capabilities, setCapabilities] = useState<string[]>([]);
 const [target, setTarget] = useState("");
 const [runMode, setRunMode] = useState<"interactive"|"headless">("interactive");
 const [sourceApp, setSourceApp] = useState("");
 const [destApp, setDestApp] = useState("");

 const Icon = card.icon;

 const buildPrompt = () => {
 switch (card.title) {
 case"Create workflow":
 return `Help me create a workflow named"${name ||"My Workflow"}"that ${description ||"automates a business process"}. Trigger type: ${trigger}.`;
 case"Create autonomous agent":
 return `Build an autonomous agent named"${name ||"My Agent"}"to ${description ||"handle tasks automatically"}. Capabilities: ${capabilities.length ? capabilities.join(",") :"general purpose"}.`;
 case"Computer-using agent":
 return `Set up a computer-using agent to control"${target ||"a web app"}". Task: ${description ||"perform automated actions"}. Run mode: ${runMode}.`;
 case"Blank workflow":
 return `Design a blank workflow named"${name ||"My Workflow"}"${description ? ` for: ${description}` :""}. I will define each step myself.`;
 case"Scheduled run":
 return `Create a scheduled workflow named"${name ||"My Schedule"}"that runs ${schedule} and performs: ${description ||"a recurring task"}.`;
 case"Connect apps":
 return `Connect ${sourceApp ||"App A"} to ${destApp ||"App B"} and transfer or sync: ${description ||"relevant data between them"}.`;
 default:
 return `${card.prompt} ${description}`.trim();
 }
 };

 const containerClass = dark
 ?"border-[rgba(255,255,255,0.08)] bg-[#202328]"
 :"border-[#E5E7EB] bg-white";
 const labelClass = `mb-1.5 block text-[11px] font-semibold ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`;
 const inputClass = `h-10 w-full rounded-xl border px-3 text-[12px] outline-none transition-colors ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#4B5563] focus:border-[#3BA7FF]":"border-[#E5EAF0] bg-[#FAFBFC] text-[#1F1F1F] placeholder:text-[#A1A7B0] focus:border-[#4284FF]"}`;
 const textareaClass = `w-full resize-none rounded-xl border px-3 py-2.5 text-[12px] outline-none transition-colors ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#F4F6F8] placeholder:text-[#4B5563] focus:border-[#3BA7FF]":"border-[#E5EAF0] bg-[#FAFBFC] text-[#1F1F1F] placeholder:text-[#A1A7B0] focus:border-[#4284FF]"}`;
 const chipBase = (active: boolean) =>
 `h-7 rounded-full px-3 text-[11px] font-medium transition-all ${active ?"bg-[#4284FF] text-white": dark ?"border border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA] hover:text-[#F4F6F8]":"border border-[#E5EAF0] bg-[#FAFBFC] text-[#4B5563] hover:border-[#CFE8F8]"}`;

 const renderFields = () => {
 switch (card.title) {
 case"Create workflow":
 return (
 <>
 <div>
 <label className={labelClass}>Workflow name</label>
 <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>What should this workflow do?</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this workflow automates..."rows={3} className={textareaClass} />
 </div>
 <div>
 <label className={labelClass}>Trigger type</label>
 <div className="flex gap-2">
 {(["manual","scheduled","event"] as const).map((t) => (
 <button key={t} type="button"onClick={() => setTrigger(t)} className={chipBase(trigger === t)}>
 {t.charAt(0).toUpperCase() + t.slice(1)}
 </button>
 ))}
 </div>
 </div>
 </>
 );

 case"Create autonomous agent":
 return (
 <>
 <div>
 <label className={labelClass}>Agent name</label>
 <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agent"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>What goal should this agent accomplish?</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the agent's goal and tasks..."rows={3} className={textareaClass} />
 </div>
 <div>
 <label className={labelClass}>Capabilities</label>
 <div className="flex flex-wrap gap-2">
 {["Web browsing","Code execution","File management","API calls","Email"].map((cap) => {
 const active = capabilities.includes(cap);
 return (
 <button key={cap} type="button"onClick={() => setCapabilities((prev) => active ? prev.filter((c) => c !== cap) : [...prev, cap])} className={chipBase(active)}>
 {cap}
 </button>
 );
 })}
 </div>
 </div>
 </>
 );

 case"Computer-using agent":
 return (
 <>
 <div>
 <label className={labelClass}>Target app or URL</label>
 <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://example.com or app name"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>Task description</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what the agent should do on this app..."rows={3} className={textareaClass} />
 </div>
 <div>
 <label className={labelClass}>Run mode</label>
 <div className="flex gap-2">
 {(["interactive","headless"] as const).map((m) => (
 <button key={m} type="button"onClick={() => setRunMode(m)} className={chipBase(runMode === m)}>
 {m.charAt(0).toUpperCase() + m.slice(1)}
 </button>
 ))}
 </div>
 </div>
 </>
 );

 case"Blank workflow":
 return (
 <>
 <div>
 <label className={labelClass}>Workflow name</label>
 <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>Description (optional)</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this workflow do?"rows={3} className={textareaClass} />
 </div>
 </>
 );

 case"Scheduled run":
 return (
 <>
 <div>
 <label className={labelClass}>Workflow name</label>
 <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Schedule"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>Run frequency</label>
 <div className="flex flex-wrap gap-2">
 {["Hourly","Daily","Weekly","Monthly","Custom"].map((s) => (
 <button key={s} type="button"onClick={() => setSchedule(s.toLowerCase())} className={chipBase(schedule === s.toLowerCase())}>
 {s}
 </button>
 ))}
 </div>
 </div>
 <div>
 <label className={labelClass}>What should run?</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task to run on schedule..."rows={3} className={textareaClass} />
 </div>
 </>
 );

 case"Connect apps":
 return (
 <>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className={labelClass}>Source app</label>
 <input value={sourceApp} onChange={(e) => setSourceApp(e.target.value)} placeholder="e.g. Slack, Gmail"className={inputClass} />
 </div>
 <div>
 <label className={labelClass}>Destination app</label>
 <input value={destApp} onChange={(e) => setDestApp(e.target.value)} placeholder="e.g. Notion, Sheets"className={inputClass} />
 </div>
 </div>
 <div>
 <label className={labelClass}>What data should move?</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what data to sync or transform..."rows={3} className={textareaClass} />
 </div>
 </>
 );

 default:
 return (
 <div>
 <label className={labelClass}>Describe your goal</label>
 <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you want to accomplish?"rows={4} className={textareaClass} />
 </div>
 );
 }
 };

 return (
 <div className="w-full">
 <button
 type="button"
 onClick={onBack}
 className={`mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors ${dark ?"text-[#A8B0BA] hover:text-[#F4F6F8]":"text-[#6B7280] hover:text-[#1F1F1F]"}`}
 >
 <ChevronLeft className="h-3.5 w-3.5"/>
 Back
 </button>
 <div className={`w-full rounded-3xl border p-5 ${containerClass}`}>
 <div className="mb-5 flex items-center gap-3">
 <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#DDEEFF] text-[#4284FF]">
 <Icon className="h-5 w-5"/>
 </span>
 <div>
 <p className={`text-[14px] font-semibold ${dark ?"text-[#F4F6F8]":"text-[#1F1F1F]"}`}>{card.title}</p>
 <p className={`text-[11px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>{card.description}</p>
 </div>
 </div>
 <div className="flex flex-col gap-4">
 {renderFields()}
 <button
 type="button"
 onClick={() => onLaunch(buildPrompt())}
 className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#4284FF] text-[12px] font-semibold text-white transition-all hover:bg-[#376FE0]"
 >
 <Sparkles className="h-3.5 w-3.5 fill-current"/>
 Launch with AI
 </button>
 </div>
 </div>
 </div>
 );
}

function AssistantScrollRail({ dark }: { dark: boolean }) {
 const scrollToSection = (id: string) => {
 const target = document.getElementById(id);
 target?.scrollIntoView({ behavior: "smooth", block: "center" });
 };

 return (
 <nav
 aria-label="AI Assistant sections"
 className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
 >
 <div
 className={`pointer-events-auto flex h-[168px] w-4 flex-col items-center justify-center gap-3 rounded-full ${
 dark ? "bg-[#181B20]/80" : "bg-white/[0.82]"
 }`}
 >
 {assistantRailSections.map((section) => (
 <button
 key={section.id}
 type="button"
 onClick={() => scrollToSection(section.id)}
 className="group relative flex h-1.5 w-4 items-center justify-center rounded-full outline-none"
 aria-label={`Scroll to ${section.label}`}
 title={section.label}
 >
 <span
 className={`block h-1.5 w-4 rounded-full transition-colors ${
 dark
 ? "bg-[rgba(255,255,255,0.22)] group-hover:bg-[#6EA4FF] group-focus-visible:bg-[#6EA4FF]"
 : "bg-[#D9D9D9] group-hover:bg-[#4284FF] group-focus-visible:bg-[#4284FF]"
 }`}
 />
 <span
 className={`pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
 dark
 ? "border border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8]"
 : "border border-[#E5E7EB] bg-white text-[#1F1F1F]"
 }`}
 >
 {section.label}
 </span>
 </button>
 ))}
 </div>
 </nav>
 );
}

function AIAssistantPage() {
 const { theme } = useStudioTheme();
 const { openModal, showToast, isTemporaryChat, temporaryChatId, newChatId, endTemporaryChat } = useStudioActions();
 const router = useRouter();
 const dark = theme ==="dark";
 const [messages, setMessages] = useState<Array<{ id: string; role:"user"|"assistant"; content: string }>>([]);
 const [input, setInput] = useState("");
 const [attachments, setAttachments] = useState<Attachment[]>([]);
 const [isSending, setIsSending] = useState(false);
 const [messageFeedback, setMessageFeedback] = useState<Record<string,"like"|"dislike">>({});
 const [aiProviderLabel, setAiProviderLabel] = useState("Checking AI provider");
 const [aiChatCount, setAiChatCount] = useState<number>(0);
 const [planNoticeDismissed, setPlanNoticeDismissed] = useState<boolean>(false);
 const [assistantMode, setAssistantMode] = useState<"agent"|"workflow">("agent");
 const [activePlaygroundCard, setActivePlaygroundCard] = useState<StarterCard | null>(null);
 const [attachMenuOpen, setAttachMenuOpen] = useState(false);
 const [attachMenuView, setAttachMenuView] = useState<"main"|"recent"|"connections"|"more">("main");
 const attachMenuRef = useRef<HTMLDivElement>(null);
 const conversationEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function onDown(event: MouseEvent) {
 const target = event.target as Node | null;
 if (target && attachMenuRef.current?.contains(target)) return;
 setAttachMenuOpen(false);
 setAttachMenuView("main");
 }
 document.addEventListener("mousedown", onDown);
 return () => document.removeEventListener("mousedown", onDown);
 }, []);
 const fileInputRef = useRef<HTMLInputElement>(null);
 const imageInputRef = useRef<HTMLInputElement>(null);
 const documentInputRef = useRef<HTMLInputElement>(null);
 const allFilesRef = useRef<HTMLInputElement>(null);
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const hasConversation = messages.length > 0;
 const showPlanEndingNotice = hasConversation && aiChatCount >= 3 && !planNoticeDismissed;

 useEffect(() => {
 conversationEndRef.current?.scrollIntoView({ behavior:"smooth", block:"end"});
 }, [messages, isSending]);

 useEffect(() => {
 if (typeof window ==="undefined") return;
 const stored = Number(window.localStorage.getItem("Cedium-ai-chat-count") ||"0");
 if (Number.isFinite(stored) && stored > 0) setAiChatCount(stored);
 const dismissed = window.localStorage.getItem("Cedium-ai-plan-notice-dismissed");
 if (dismissed ==="1") setPlanNoticeDismissed(true);
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
 const response = await fetch("/api/ai-chat", { cache:"no-store"});
 const data = (await response.json()) as { provider?: string; model?: string; configured?: boolean };
 if (!isMounted) return;

 const providerName =
 data.provider ==="openai"
 ?"OpenAI"
 : data.provider ==="groq"
 ?"Groq"
 : data.provider ==="gemini"
 ?"Gemini"
 :"local fallback";
 const modelName = typeof data.model ==="string"&& data.model ? ` (${data.model})` :"";
 setAiProviderLabel(
 data.configured
 ? `Connected to ${providerName}${modelName} via /api/ai-chat`
 :"Using local fallback via /api/ai-chat. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY for live AI.",
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
 if (files.length) showToast(`${files.length} attachment${files.length > 1 ? "s" : ""} added`);
 event.target.value = "";
 };

 const onAllFiles = (event: ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(event.target.files ?? []);
 setAttachments((current) => [
 ...current,
 ...files.map((file) => {
 const kind: Attachment["kind"] = file.type.startsWith("image/") ? "image" : "document";
 return { id: `${kind}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, name: file.name, kind };
 }),
 ]);
 if (files.length) showToast(`${files.length} attachment${files.length > 1 ? "s" : ""} added`);
 event.target.value = "";
 };

 const closeAttachMenu = () => {
 setAttachMenuOpen(false);
 setAttachMenuView("main");
 };

 const focusComposer = () => {
 window.setTimeout(() => textareaRef.current?.focus(), 50);
 };

 const applyPromptTemplate = (template: string) => {
 setInput(template);
 closeAttachMenu();
 focusComposer();
 };

 const attachVirtualFile = (name: string, kind: Attachment["kind"] = "document") => {
 setAttachments((current) => [
 ...current,
 { id: `recent-${name}-${Date.now()}`, name, kind },
 ]);
 closeAttachMenu();
 showToast(`${name} attached`);
 };

 const recentFiles = [
 { name:"Project brief.pdf", meta:"Updated today", kind:"document" as const },
 { name:"Landing copy.md", meta:"Recent workspace note", kind:"document" as const },
 { name:"UI reference.png", meta:"Image asset", kind:"image" as const },
 ];

 const sourceOptions = [
 { name:"Workspace knowledge", prompt:"Use my workspace knowledge as source for: " },
 { name:"Project files", prompt:"Use attached project files as source for: " },
 { name:"Web research", prompt:"Research current web sources about: " },
 ];

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
 { id: `user-${Date.now()}`, role:"user", content: prompt },
 ]);
 if (promptOverride === undefined) setInput("");
 setIsSending(true);

 try {
 const response = await fetch("/api/ai-chat", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 message: prompt,
 conversationHistory,
 }),
 });

 const data = await response.json();
 if (!response.ok) {
 throw new Error(data?.error ||"Failed to get response");
 }

 const answerText =
 typeof data?.content ==="string"
 ? data.content
 : typeof data?.answer ==="string"
 ? data.answer
 :"No response received.";

 const isFallback = data?.provider ==="local"&& data?.fallbackFrom;
 const finalContent = answerText;

 if (isFallback) {
 setAiProviderLabel(`${String(data.fallbackFrom).toUpperCase()} fallback active. Using local assistant.`);
 }

 setMessages((current) => [
 ...current,
 {
 id: `assistant-${Date.now()}`,
 role:"assistant",
 content: finalContent,
 },
 ]);
 setAiChatCount((current) => {
 const next = current + 1;
 if (typeof window !=="undefined") {
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
 role:"assistant",
 content: error instanceof Error ? error.message :"I couldn't complete that request. Please try again.",
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
 await navigator.share({ title:"Cedium AI response", text: content });
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
 const blob = new Blob([message.content], { type:"text/plain;charset=utf-8"});
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
 .find((item) => item.message.role ==="user")?.index;

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
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({
 message: promptMessage.content,
 conversationHistory,
 }),
 });

 const data = await response.json();
 if (!response.ok) throw new Error(data?.error ||"Failed to regenerate response");

 const nextContent =
 typeof data?.content ==="string"
 ? data.content
 : typeof data?.answer ==="string"
 ? data.answer
 :"No response received.";

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

 const dismissPlanNotice = () => {
 setPlanNoticeDismissed(true);
 if (typeof window !=="undefined") {
 window.localStorage.setItem("Cedium-ai-plan-notice-dismissed","1");
 }
 };

 const compactComposer = (
 <div id="assistant-composer" className="w-full">
 {attachments.length > 0 ? (
 /* Expanded card when attachment exists */
 <div className={`w-full overflow-hidden rounded-2xl border ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#202328]" : "border-[#D9D9D9] bg-white"}`}>
 <div className="min-h-[120px] p-4">
 {/* Thumbnails */}
 <div className="mb-3 flex flex-wrap gap-2">
 {attachments.map((attachment) => (
 <div key={attachment.id} className="relative">
 <div className={`h-[80px] w-[80px] rounded-xl border flex items-center justify-center ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#181B20]" : "border-[#E5E7EB] bg-[#F3F4F6]"}`}>
 {attachment.kind === "image" ? (
 <ImageIcon className={`h-7 w-7 ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`} />
 ) : (
 <FileText className={`h-7 w-7 ${dark ? "text-[#6F7782]" : "text-[#9CA3AF]"}`} />
 )}
 </div>
 <button
 onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
 className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${dark ? "border-[rgba(255,255,255,0.15)] bg-[#202328] text-[#A8B0BA] hover:text-[#F4F6F8]" : "border-[#D1D5DB] bg-white text-[#6B7280] hover:text-[#111827]"}`}
 aria-label={`Remove ${attachment.name}`}
 >
 <X className="h-3 w-3" />
 </button>
 </div>
 ))}
 </div>
 {/* Textarea */}
 <textarea
 value={input}
 onChange={(event) => setInput(event.target.value)}
 onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendPrompt(); } }}
 aria-label="Message Cedium"
 rows={2}
 placeholder="Add a message..."
 className={`w-full resize-none bg-transparent text-[14px] leading-5 outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "text-[#1F1F1F] placeholder:text-[#A1A1A1]"}`}
 style={{ letterSpacing: 0 }}
 />
 </div>
 {/* Bottom toolbar */}
 <div className={`flex items-center gap-2 border-t px-4 py-3 ${dark ? "border-[rgba(255,255,255,0.08)]" : "border-[#F3F4F6]"}`}>
 <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${dark ? "bg-[#181B20] text-[#A8B0BA] hover:bg-[#252A31]" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"}`} aria-label="Attach file">
 <Paperclip className="h-4 w-4" />
 </button>
 <div className="flex-1" />
 <button type="button" onClick={() => openModal("voice-dictation")} className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] transition-colors ${dark ? "bg-[#181B20] text-[#A8B0BA] hover:bg-[#252A31]" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"}`} aria-label="Voice input">
 <Mic className="h-4 w-4" strokeWidth={2} />
 </button>
 <button onClick={() => void sendPrompt()} disabled={isSending} aria-label="Send prompt" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#4284FF] text-white transition-all hover:bg-[#376FE0] disabled:opacity-60">
 {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" strokeWidth={2} />}
 </button>
 </div>
 <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
 <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
 <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
 </div>
 ) : (
 /* Compact bar when no attachment */
 <div className={`flex min-h-[45px] w-full items-center gap-2 rounded-[18px] border px-1.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#202328]" : "border-[#D9D9D9] bg-white"}`}>
 <div ref={attachMenuRef} className="relative flex-shrink-0">
 <button type="button" onClick={() => { setAttachMenuOpen((open) => !open); setAttachMenuView("main"); }} className={`flex h-8 w-8 items-center justify-center rounded-[12px] transition-colors ${dark ? "bg-[#181B20] text-[#DDE3EA] hover:bg-[#252A31]" : "bg-[#F0F0F0] text-[#4B5563] hover:bg-[#E7E7E7]"}`} aria-label="Attach file" title="Attach file">
 <Plus className="h-4 w-4" strokeWidth={1.8} />
 </button>
 {attachMenuOpen && (
 <div className={`absolute top-[calc(100%+10px)] left-0 z-50 w-[252px] overflow-hidden rounded-2xl border py-1 ${dark ? "border-[rgba(255,255,255,0.1)] bg-[#202328] shadow-[0_16px_40px_rgba(0,0,0,0.36)]" : "border-[#E5E7EB] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]"}`}>
 {attachMenuView !== "main" ? (
 <div className={`flex items-center gap-2 border-b px-3 py-2 ${dark ? "border-[rgba(255,255,255,0.08)]" : "border-[#EEF2F7]"}`}>
 <button type="button" onClick={() => setAttachMenuView("main")} className={`flex h-8 w-8 items-center justify-center rounded-xl ${dark ? "text-[#A8B0BA] hover:bg-[#181B20] hover:text-[#F4F6F8]" : "text-[#667085] hover:bg-[#F8FAFC] hover:text-[#111827]"}`} aria-label="Back to attach menu">
 <ChevronLeft className="h-4 w-4"/>
 </button>
 <span className={`text-[12px] font-semibold ${dark ? "text-[#F4F6F8]" : "text-[#111827]"}`}>
 {attachMenuView === "recent" ? "Recent files" : attachMenuView === "connections" ? "Connections & sources" : "More options"}
 </span>
 </div>
 ) : null}
 <div className="mx-2 space-y-0.5 py-1">
 {attachMenuView === "main" && [
 { label: "Add photo & files", icon: Paperclip, arrow: false, action: () => { allFilesRef.current?.click(); closeAttachMenu(); } },
 { label: "Recent files", icon: Clock, arrow: true, action: () => setAttachMenuView("recent") },
 { label: "Create image", icon: ImageIcon, arrow: false, action: () => { closeAttachMenu(); router.push("/cedium-design"); } },
 { label: "Deep research", icon: Search, arrow: false, action: () => applyPromptTemplate("Deep research on: ") },
 { label: "Connections & sources", icon: Globe, arrow: true, action: () => setAttachMenuView("connections") },
 { label: "More...", icon: MoreHorizontal, arrow: true, action: () => setAttachMenuView("more") },
 ].map(({ label, icon: Icon, arrow, action }) => (
 <button key={label} type="button" onClick={action} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${dark ? "text-[#A8B0BA] hover:bg-[rgba(59,167,255,0.12)] hover:text-[#6EA4FF]" : "text-[#374151] hover:bg-[#EEF7FF] hover:text-[#4284FF]"}`}>
 <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#9CA3AF] group-hover:text-[#4284FF]"}`} strokeWidth={2} />
 <span className="flex-1">{label}</span>
 {arrow && <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-colors ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#9CA3AF] group-hover:text-[#4284FF]"}`} strokeWidth={2} />}
 </button>
 ))}
 {attachMenuView === "recent" && recentFiles.map((file) => (
 <button key={file.name} type="button" onClick={() => attachVirtualFile(file.name, file.kind)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${dark ? "hover:bg-[rgba(59,167,255,0.12)]" : "hover:bg-[#EEF7FF]"}`}>
 <FileText className={`h-4 w-4 flex-shrink-0 ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#9CA3AF] group-hover:text-[#4284FF]"}`} />
 <span className="min-w-0 flex-1">
 <span className={`block truncate text-[13px] font-medium ${dark ? "text-[#DDE3EA]" : "text-[#374151]"}`}>{file.name}</span>
 <span className={`mt-0.5 block text-[11px] ${dark ? "text-[#6F7782]" : "text-[#98A2B3]"}`}>{file.meta}</span>
 </span>
 </button>
 ))}
 {attachMenuView === "connections" && sourceOptions.map((source) => (
 <button key={source.name} type="button" onClick={() => applyPromptTemplate(source.prompt)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${dark ? "text-[#A8B0BA] hover:bg-[rgba(59,167,255,0.12)] hover:text-[#6EA4FF]" : "text-[#374151] hover:bg-[#EEF7FF] hover:text-[#4284FF]"}`}>
 <Globe className={`h-4 w-4 flex-shrink-0 ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#9CA3AF] group-hover:text-[#4284FF]"}`} />
 <span className="flex-1">{source.name}</span>
 </button>
 ))}
 {attachMenuView === "more" && [
 { label: "Upload document", icon: FileText, action: () => { documentInputRef.current?.click(); closeAttachMenu(); } },
 { label: "Add image only", icon: ImageIcon, action: () => { imageInputRef.current?.click(); closeAttachMenu(); } },
 { label: "Open files workspace", icon: Folder, action: () => { closeAttachMenu(); router.push("/workspace/files"); } },
 { label: "Open asset library", icon: ImageIcon, action: () => { closeAttachMenu(); router.push("/asset-library"); } },
 { label: "Open Prompt Lab", icon: FileText, action: () => { closeAttachMenu(); router.push("/prompt-lab"); } },
 ].map(({ label, icon: Icon, action }) => (
 <button key={label} type="button" onClick={action} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${dark ? "text-[#A8B0BA] hover:bg-[rgba(59,167,255,0.12)] hover:text-[#6EA4FF]" : "text-[#374151] hover:bg-[#EEF7FF] hover:text-[#4284FF]"}`}>
 <Icon className={`h-4 w-4 flex-shrink-0 ${dark ? "text-[#6F7782] group-hover:text-[#6EA4FF]" : "text-[#9CA3AF] group-hover:text-[#4284FF]"}`} />
 <span className="flex-1">{label}</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 <textarea
 ref={textareaRef}
 value={input}
 onChange={(event) => setInput(event.target.value)}
 onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendPrompt(); } }}
 aria-label="Message Cedium"
 rows={1}
 className={`min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-[14px] leading-5 outline-none ${dark ? "text-[#F4F6F8] placeholder:text-[#6F7782]" : "text-[#1F1F1F] placeholder:text-[#A1A1A1]"}`}
 style={{ letterSpacing: 0 }}
 />
 <button type="button" onClick={() => openModal("voice-dictation")} className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[12px] transition-colors ${dark ? "bg-[#181B20] text-[#F4F6F8] hover:bg-[#252A31]" : "bg-[#F0F0F0] text-[#1F1F1F] hover:bg-[#E7E7E7]"}`} aria-label="Voice input" title="Voice input">
 <Mic className="h-4 w-4" strokeWidth={2} />
 </button>
 <button onClick={() => input.trim() ? void sendPrompt() : openModal("voice-speak")} disabled={isSending} aria-label={input.trim() ? "Send prompt" : "Open Voice Speak"} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#178CE8] text-white transition-all hover:bg-[#0F77C9] disabled:cursor-not-allowed disabled:opacity-60">
 {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : input.trim() ? <CornerDownLeft className="h-4 w-4" strokeWidth={2} /> : <Sparkles className="h-4 w-4" strokeWidth={2} />}
 </button>
 <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
 <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
 <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
 <input ref={allFilesRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.md,application/pdf,text/plain" className="hidden" onChange={onAllFiles} />
 </div>
 )}
 </div>
 );

 const composer = compactComposer;

 const planNotice = showPlanEndingNotice ? (
 <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-6 py-3 text-[12px] ${dark ?"border-[rgba(255,170,0,0.32)] bg-[rgba(255,170,0,0.08)] text-[#F4F6F8]":"border-[#FCD7A1] bg-[#FFF8EC] text-[#1F1F1F]"}`}>
 <div className="flex items-start gap-3">
 <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${dark ?"bg-[rgba(255,170,0,0.16)] text-[#FFB454]":"bg-[#FFEBC9] text-[#B7791F]"}`}>
 <AlertTriangle className="h-4 w-4"/>
 </div>
 <div className="min-w-0">
 <p className="text-[13px] font-semibold">Your free plan is wrapping up</p>
 <p className={`mt-0.5 text-[11px] leading-5 ${dark ?"text-[#A8B0BA]":"text-[#4B5563]"}`}>
 You have used Cedium AI {aiChatCount} {aiChatCount === 1 ?"time":"times"} on your free trial. Upgrade to keep your chats, attachments, and Voice Speak going without interruption.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button type="button"onClick={() => openModal("upgrade")} className="inline-flex h-9 items-center rounded-xl bg-[#4284FF] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#376FE0]">Upgrade Now</button>
 <button type="button"onClick={dismissPlanNotice} aria-label="Dismiss free plan notice"className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ?"text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"text-[#9CA3AF] hover:bg-white hover:text-[#1F1F1F]"}`}>
 <X className="h-4 w-4"/>
 </button>
 </div>
 </div>
 ) : null;

 const temporaryChatNotice = isTemporaryChat ? (
 <div className="flex w-full justify-center">
 <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20] text-[#A8B0BA]":"border-[#E5EAF0] bg-[#F6F8FB] text-[#4B5563]"}`}>
 <Ghost className={`h-3.5 w-3.5 ${dark ?"text-[#7DD3FC]":"text-[#4284FF]"}`} strokeWidth={2} />
 <span className={`font-semibold ${dark ?"text-[#F4F6F8]":"text-[#1F1F1F]"}`}>Temporary chat</span>
 <span className="hidden sm:inline">— this conversation won&apos;t be saved.</span>
 <button
 type="button"
 onClick={closeTemporaryChat}
 className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${dark ?"bg-[rgba(255,255,255,0.06)] text-[#A8B0BA] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#F4F6F8]":"bg-white text-[#4B5563] hover:text-[#1F1F1F]"}`}
 >
 End
 </button>
 </div>
 </div>
 ) : null;

 if (!hasConversation) {
 if (activePlaygroundCard) {
 return (
 <>
 <div id="assistant-overview" className="font-roboto">
 <StarterPlaygroundView
 card={activePlaygroundCard}
 dark={dark}
 onBack={() => setActivePlaygroundCard(null)}
 onRun={() => void sendPrompt(activePlaygroundCard.prompt)}
 />
 </div>
 </>
 );
 }

 return (
 <>
 <div id="assistant-overview" className={`flex min-h-full items-start justify-center px-6 pb-6 pt-7 font-roboto max-sm:px-4 max-sm:pt-6 ${dark ?"bg-[#0F1013]":"bg-white text-[#1F1F1F]"}`}>
 <div className="flex w-full max-w-[684px] flex-col">
 <div id="assistant-greeting" className="flex flex-col items-center text-center">
 <h2 className={`text-[21px] font-semibold leading-tight tracking-[0] max-sm:text-[20px] ${dark ?"text-[#F4F6F8]":"text-[#080808]"}`}>
 Good Morning, Toby
 </h2>
 <p className={`mt-1 text-[21px] font-semibold leading-tight tracking-[0] max-sm:text-[20px] ${dark ?"text-[#F4F6F8]":"text-[#080808]"}`}>
 How Can I <span className="text-[#4284FF]">Assist You Today?</span>
 </p>
 </div>

 {temporaryChatNotice && <div className="mt-5 w-full">{temporaryChatNotice}</div>}

 <div id="assistant-mode" className="mt-5 flex w-full justify-center">
 <ModeToggle mode={assistantMode} onChange={setAssistantMode} dark={dark} />
 </div>

 <div id="assistant-starters" className="mt-[26px] w-full">
 <div id="assistant-workflows">
 <StarterPanel
 mode={assistantMode}
 dark={dark}
 onOpen={(card) => {
 if (card.href) {
 router.push(card.href);
 return;
 }
 setActivePlaygroundCard(card);
 }}
 />
 </div>
 </div>

 <div className="mt-12 w-full">
 {planNotice}
 {composer}
 </div>
 </div>
 </div>
 </>
 );
 }

 return (
 <>
 <div id="assistant-overview" className="mx-auto flex h-full w-full max-w-[1080px] flex-col px-4 font-roboto">
 <div
 id="assistant-greeting"
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
 <div key={message.id} className={`flex gap-3 ${message.role ==="user"?"justify-end":"justify-start"}`}>
 {message.role ==="assistant"&& (
 <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#4284FF] text-white">
 <Sparkles className="h-4 w-4 fill-current"/>
 </div>
 )}
 <div className={`flex max-w-[720px] flex-col ${message.role ==="user"?"items-end":"items-start"}`}>
 <div
 className={`break-words rounded-[24px] px-4 py-3 text-[13px] leading-6 ${
 message.role ==="user"
 ? dark
 ?"border border-[rgba(255,255,255,0.08)] bg-[#202328] text-[#F4F6F8]"
 :"border border-[#E5E7EB] bg-white text-[#1F1F1F]"
 : dark
 ?"text-[#F4F6F8]"
 :"text-[#1F1F1F]"
 }`}
 >
 <p className="whitespace-pre-wrap">{message.content}</p>
 </div>
 {message.role ==="assistant"&& (
 <div className={`mt-2 flex items-center gap-1 rounded-full border px-1.5 py-1 ${dark ?"border-[rgba(255,255,255,0.08)] bg-[#181B20]/80 text-[#A8B0BA]":"border-[#E5E7EB] bg-white/80 text-[#9CA3AF]"}`}>
 <button
 onClick={() => void copyAssistantMessage(message.content)}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Copy response"
 title="Copy"
 >
 <Copy className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => {
 setMessageFeedback((current) => {
 const next = { ...current };
 if (next[message.id] ==="like") delete next[message.id];
 else next[message.id] ="like";
 return next;
 });
 showToast("Feedback saved");
 }}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${messageFeedback[message.id] ==="like"?"bg-[#DDEEFF] text-[#4284FF]": dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Like response"
 title="Like"
 >
 <ThumbsUp className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => {
 setMessageFeedback((current) => {
 const next = { ...current };
 if (next[message.id] ==="dislike") delete next[message.id];
 else next[message.id] ="dislike";
 return next;
 });
 showToast("Feedback saved");
 }}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${messageFeedback[message.id] ==="dislike"?"bg-[#FFE8ED] text-[#D92D52]": dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Dislike response"
 title="Dislike"
 >
 <ThumbsDown className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => void regenerateAssistantMessage(message.id)}
 disabled={isSending}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Regenerate response"
 title="Regenerate"
 >
 <RefreshCw className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => void shareAssistantMessage(message.content)}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Share response"
 title="Share"
 >
 <Share2 className="h-3.5 w-3.5"/>
 </button>
 <button
 onClick={() => downloadAssistantMessage(message)}
 className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${dark ?"hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F4F6F8]":"hover:bg-[#F4F8FB] hover:text-[#1F1F1F]"}`}
 aria-label="Download response"
 title="Download"
 >
 <Download className="h-3.5 w-3.5"/>
 </button>
 </div>
 )}
 </div>
 </div>
 ))}
 {isSending && (
 <div className="flex gap-3">
 <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#4284FF] text-white">
 <RefreshCw className="h-4 w-4 animate-spin"/>
 </div>
 <div className={`rounded-[24px] px-4 py-3 text-[13px] ${dark ?"text-[#A8B0BA]":"text-[#6B7280]"}`}>
 Thinking...
 </div>
 </div>
 )}
 <div ref={conversationEndRef} />
 <div id="assistant-provider" className={`text-center text-[11px] ${dark ?"text-[#6F7782]":"text-[#9CA3AF]"}`}>
 {aiProviderLabel}
 </div>
 </div>
 </div>

 <div className="pb-7 pt-3 px-6">
 {composer}
 </div>
 </div>
 </>
 );
}

function PromptLabPage() {
 const { openModal, showToast } = useStudioActions();

 return (
 <div>
 <PageHeader title="Prompt Lab"subtitle="Test, save, and organize reusable prompt workflows."action={<PrimaryButton icon={Plus} onClick={() => openModal("prompt-editor")}>Create new prompt</PrimaryButton>} />
 <div className="mb-5 flex flex-wrap gap-2">
 {["All","Design","Code","3D","Research"].map((filter) => (
 <button key={filter} onClick={() => showToast(`${filter} prompts selected`)} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] transition-all hover:border-[#CFE8F8]">
 {filter}
 </button>
 ))}
 </div>
 <div className="grid gap-3 md:grid-cols-3">
 {["Website audit","Component builder","Scene generator","Copy polish","Budget planner","Asset namer"].map((name) => (
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
 <PageHeader title="Projects"subtitle="Manage studio projects and production status."action={<PrimaryButton icon={Plus} onClick={() => openModal("project-create")}>New project</PrimaryButton>} />
 <div className="grid gap-3 md:grid-cols-3">
 {["Cedium command center","Automation workflow","3D product system"].map((name) => (
 <ClickableSoftCard key={name} className="min-h-[150px]"onClick={() => openDrawer("project-detail")} ariaLabel={`Open ${name} project`}>
 <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
 <Folder className="h-5 w-5"/>
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
 <PageHeader title="Exports"subtitle="Review exported files and download history."/>
 <SoftCard className="overflow-hidden p-0">
 {[
 ["homepage-preview.png","Ready","Image"],
 ["model-pack.glb","Processing","3D"],
 ["prompt-library.pdf","Ready","Document"],
 ].map(([name, status, type]) => (
 <div key={name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#EEF2F5] px-4 py-3 last:border-b-0">
 <div>
 <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
 <p className="mt-1 text-[10px] text-[#6B7280]">{type}</p>
 </div>
 <span className="rounded-full bg-[#EEF7FC] px-2.5 py-1 text-[10px] font-semibold text-[#1DA1F2]">{status}</span>
 <button onClick={() => showToast(status ==="Ready"? `${name} download started` : `${name} is still processing`)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] transition-all hover:border-[#CFE8F8] hover:text-[#171717]"aria-label={`Download ${name}`}>
 <Download className="h-3.5 w-3.5"/>
 </button>
 </div>
 ))}
 </SoftCard>
 </div>
 );
}

function SettingsPage() {
 const { theme, toggleTheme } = useStudioTheme();
 const isDark = theme ==="dark";

 const frameClass = isDark
 ?"border-[rgba(255,255,255,0.08)] bg-[#1F1F1F] text-[#F5F5F5]"
 :"border-[#E5E7EB] bg-white text-[#101113]";
 const panelClass = isDark ?"bg-[rgba(31,31,31,0.9)]":"bg-[rgba(255,255,255,0.92)]";
 const borderClass = isDark ?"border-[#333333]":"border-[#E5E7EB]";

 return (
 <div className="mx-auto flex w-full justify-center py-3">
 <div className={`min-h-[620px] w-full max-w-[784px] overflow-hidden rounded-2xl border backdrop-blur-xl ${frameClass}`}>
 <main className={`h-full px-8 py-6 ${panelClass}`}>
 <div className={`flex items-center justify-between border-b pb-5 ${borderClass}`}>
 <h1 className="text-[18px] font-medium tracking-[-0.01em]">General</h1>
 <button
 onClick={toggleTheme}
 className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12px] font-medium transition-colors ${isDark ?"border-[#3A3A3A] bg-[#262626] text-[#F5F5F5] hover:bg-[#303030]":"border-[#E5E7EB] bg-[#F7F8FA] text-[#111827] hover:bg-white"}`}
 >
 {isDark ? <Moon className="h-3.5 w-3.5"/> : <Sun className="h-3.5 w-3.5"/>}
 {isDark ?"Dark mode":"Light mode"}
 </button>
 </div>

 <div className={`divide-y ${isDark ?"divide-[#333333]":"divide-[#E5E7EB]"}`}>
 <GeneralSettingRow label="Appearance"control={<SettingSelectValue value={isDark ?"Dark":"Light"} />} />
 <GeneralSettingRow label="Contrast"control={<SettingSelectValue value="System"/>} />
 <GeneralSettingRow label="Accent color"control={<SettingSelectValue value="Default"dot />} />
 <GeneralSettingRow label="Language"control={<SettingSelectValue value="Auto-detect"/>} />
 <GeneralSettingRow
 label="Enable Dictation"
 description="Use dictation in the chat composer."
 control={<SettingsSwitch enabled label="Enable Dictation"/>}
 />
 <GeneralSettingRow
 label="Spoken language"
 description="For best results, select the language you mainly speak. If it is not listed, it may still be supported via auto-detection."
 control={<SettingSelectValue value="Auto-detect"/>}
 />
 <VoiceSettingRow />
 <GeneralSettingRow
 label="Separate Voice"
 description="Keep Cedium Voice in a separate full screen, without real time transcripts and visuals."
 control={<SettingsSwitch enabled={false} label="Separate Voice"/>}
 />
 </div>
 </main>
 </div>
 </div>
 );
}

function GeneralSettingRow({ label, description, control }: { label: string; description?: string; control: ReactNode }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <div className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4">
 <div className="min-w-0">
 <p className={`text-[14px] font-medium ${dark ?"text-[#F5F5F5]":"text-[#111827]"}`}>{label}</p>
 {description && <p className={`mt-1 max-w-[360px] text-[12px] leading-5 ${dark ?"text-[#AFAFAF]":"text-[#6B7280]"}`}>{description}</p>}
 </div>
 <div className="flex items-center justify-end">{control}</div>
 </div>
 );
}

function SettingSelectValue({ value, dot = false }: { value: string; dot?: boolean }) {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <button className={`inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium transition-colors ${dark ?"text-[#F4F4F4] hover:bg-[#2B2B2B]":"text-[#111827] hover:bg-[#F3F4F6]"}`}>
 {dot && <span className={`h-2.5 w-2.5 rounded-full ${dark ?"bg-[#A3A3A3]":"bg-[#9CA3AF]"}`} />}
 <span>{value}</span>
 <ChevronDown className="h-4 w-4"/>
 </button>
 );
}

function SettingsSwitch({ enabled, label }: { enabled: boolean; label: string }) {
 return (
 <button
 aria-label={`${enabled ?"Disable":"Enable"} ${label}`}
 className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${enabled ?"justify-end bg-[#1D9BF0]":"justify-start bg-[#5B5B5B]"}`}
 >
 <span className="h-5 w-5 rounded-full bg-white"/>
 </button>
 );
}

function VoiceSettingRow() {
 const { theme } = useStudioTheme();
 const dark = theme ==="dark";
 return (
 <div className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4">
 <p className={`text-[14px] font-medium ${dark ?"text-[#F5F5F5]":"text-[#111827]"}`}>Voice</p>
 <div className="flex items-center gap-4">
 <button className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors ${dark ?"bg-[#303030] text-white hover:bg-[#3A3A3A]":"bg-[#F3F4F6] text-[#111827] hover:bg-[#E9EDF2]"}`}>
 <Play className="h-3.5 w-3.5 fill-current"/>
 Play
 </button>
 <SettingSelectValue value="Arbor"/>
 </div>
 </div>
 );
}

function HelpCenterPage() {
 const { openDrawer, openModal } = useStudioActions();

 return (
 <div>
 <PageHeader title="Help Center"subtitle="Find help articles and contact support."/>
 <div className="mb-5 flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] px-4">
 <Search className="h-4 w-4 text-[#9CA3AF]"/>
 <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]"placeholder="Search help..."/>
 </div>
 <div className="grid gap-3 md:grid-cols-3">
 {["How do imports work?","Where are exports saved?","How do I manage workspaces?"].map((question) => (
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

function getWorkspaceHrefForRecent(recent: GeneratedRecent) {
 const tool = recent.tool.toLowerCase();
 if (tool.includes("code")) return"/code-builder";
 if (tool.includes("blender")|| tool.includes("3d")) return"/blender-3d";
 if (tool.includes("autocad")|| tool.includes("cad")) return"/autocad-design";
 if (tool.includes("asset")) return"/asset-library";
 if (tool.includes("prompt")) return"/prompt-lab";
 if (tool.includes("export")) return"/exports";
 return"/ai-assistant";
}
