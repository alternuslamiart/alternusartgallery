"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Box,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
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
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type StudioRouteKey =
  | "studio-overview"
  | "figma-design"
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

export const studioNavigation: NavItem[] = [
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { key: "studio-overview", label: "Studio Overview", href: "/studio-overview", icon: Grid2X2 },
  { key: "figma-design", label: "Figma Design", href: "/figma-design", icon: PenLine },
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
  "/main": "ai-assistant",
  "/studio-overview": "studio-overview",
  "/figma-design": "figma-design",
  "/code-builder": "code-builder",
  "/blender-3d": "blender-3d",
  "/asset-library": "asset-library",
  "/ai-assistant": "ai-assistant",
  "/prompt-lab": "prompt-lab",
  "/projects": "projects",
  "/exports": "exports",
  "/settings": "settings",
  "/help-center": "help-center",
};

type StudioPageProps = {
  route?: StudioRouteKey;
};

type Attachment = {
  id: string;
  name: string;
  kind: "file" | "image" | "document";
};

type StudioTheme = "light" | "dark";

const StudioThemeContext = createContext<{
  theme: StudioTheme;
  setTheme: (theme: StudioTheme) => void;
  toggleTheme: () => void;
} | null>(null);

function useStudioTheme() {
  const context = useContext(StudioThemeContext);
  if (!context) {
    throw new Error("useStudioTheme must be used inside StudioShell");
  }
  return context;
}

export function StudioRoutePage({ route }: StudioPageProps) {
  const pathname = usePathname();
  const activeRoute = route ?? routeByPath[pathname] ?? "ai-assistant";

  return (
    <StudioShell activeRoute={activeRoute}>
      <StudioContent route={activeRoute} />
    </StudioShell>
  );
}

function StudioShell({ activeRoute, children }: { activeRoute: StudioRouteKey; children: ReactNode }) {
  const router = useRouter();
  const [theme, setTheme] = useState<StudioTheme>("light");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sidebarNotificationRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
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
        "flex h-full flex-shrink-0 flex-col border-r border-white/70 bg-[linear-gradient(180deg,#EAF3F8_0%,#F6FAFC_100%)] py-3 transition-all duration-200 ease-out",
        isCollapsed ? "w-[64px] px-2" : "w-[230px] px-3",
      ].join(" ")}
    >
      <div ref={workspaceRef} className="relative mb-4 flex items-center justify-between px-1">
        {isCollapsed ? (
          <button
            onClick={toggleMenu}
            className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-white/70 hover:text-[#171717]"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-[14px] w-[14px]" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setWorkspaceOpen((value) => !value)}
              className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-[13px] font-semibold text-[#1F2937] hover:bg-white/60"
              aria-expanded={workspaceOpen}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white">
                <Shield className="h-[11px] w-[11px]" />
              </span>
              <span className="truncate">Personal</span>
              <ChevronDown className="h-3 w-3 text-[#6B7280]" />
            </button>
            <button
              onClick={toggleMenu}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-white/70 hover:text-[#171717]"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-[14px] w-[14px]" />
            </button>
          </>
        )}

        {workspaceOpen && !isCollapsed && (
          <DropdownPanel className="left-0 top-9 w-56">
            <div className="px-3 py-2">
              <p className="text-[10px] font-medium text-[#8A94A3]">Current workspace</p>
              <p className="mt-1 text-[13px] font-semibold text-[#171717]">Personal</p>
            </div>
            <DropdownButton onClick={() => router.push("/settings")} icon={Settings} label="Workspace settings" />
            <DropdownButton icon={RefreshCw} label="Switch workspace" muted />
            <DropdownButton icon={Plus} label="Create workspace" muted />
          </DropdownPanel>
        )}
      </div>

      {!isCollapsed && (
        <div className="mb-5 flex h-9 items-center gap-2 rounded-xl border border-white/80 bg-white/72 px-3 shadow-[0_8px_22px_rgba(31,43,77,0.04)]">
          <Search className="h-[13px] w-[13px] text-[#9CA3AF]" />
          <input placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#9CA3AF]" />
          <span className="rounded-md bg-[#F3F6F8] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">/</span>
        </div>
      )}

      <nav className="space-y-1">
        {studioNavigation.map((item) => (
          <SidebarLink key={item.key} item={item} active={item.key === activeRoute} collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
        ))}
      </nav>

      <div className="mt-auto">
        {!isCollapsed && (
          <div className="mb-5 rounded-2xl border border-white/80 bg-white/72 p-3 shadow-[0_14px_36px_rgba(31,43,77,0.07)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white shadow-[0_10px_22px_rgba(29,161,242,0.24)]">
              <Sparkles className="h-[15px] w-[15px] fill-current" />
            </div>
            <p className="text-[12px] font-bold text-[#171717]">Lumen AI Trial</p>
            <p className="mt-1 text-[10px] leading-4 text-[#6B7280]">There are 12 days left for you to enjoy the various features.</p>
            <button
              onClick={() => router.push("/pricing")}
              className="mt-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#171717] shadow-sm hover:border-[#CFE8F8]"
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
              "group flex h-8 w-full items-center rounded-xl px-2.5 text-[12px] font-medium text-[#4B5563] transition-all hover:bg-[#DDEEFF] hover:text-[#4A9BFF]",
              isCollapsed ? "justify-center" : "gap-2",
            ].join(" ")}
          >
            <Upload className="h-[13px] w-[13px] rotate-90 text-[#6B7280] group-hover:text-[#4A9BFF]" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <StudioThemeContext.Provider value={themeValue}>
      <div className={`fixed inset-0 overflow-hidden bg-[#F6FAFC] font-sans text-[#171717] ${theme === "dark" ? "studio-shell-dark" : ""}`}>
      <style jsx global>{`
        .studio-shell-dark {
          background: #141416 !important;
          color: #f5f5f7 !important;
        }
        .studio-shell-dark aside {
          background: linear-gradient(180deg, #1f1f23 0%, #141416 100%) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .studio-shell-dark section {
          background: #1f1f23 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22) !important;
        }
        .studio-shell-dark [class*="bg-white"],
        .studio-shell-dark [class*="bg-\\[\\#FCFDFE\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F8FAFC\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F4F8FB\\]"],
        .studio-shell-dark [class*="bg-\\[\\#F3F6F8\\]"] {
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        .studio-shell-dark [class*="bg-\\[\\#EEF7FC\\]"] {
          background-color: rgba(66, 132, 255, 0.12) !important;
        }
        .studio-shell-dark [class*="text-\\[\\#171717\\]"],
        .studio-shell-dark [class*="text-\\[\\#1F2937\\]"],
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
        .studio-shell-dark [class*="border-white"] {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .studio-shell-dark input,
        .studio-shell-dark textarea,
        .studio-shell-dark select {
          background-color: rgba(255, 255, 255, 0.04) !important;
          color: #f5f5f7 !important;
        }
        .studio-shell-dark input::placeholder,
        .studio-shell-dark textarea::placeholder {
          color: rgba(245, 245, 247, 0.42) !important;
        }
        .studio-shell-dark [class*="hover:bg-\\[\\#DDEEFF\\]"]:hover,
        .studio-shell-dark [class*="hover:bg-white"]:hover,
        .studio-shell-dark [class*="hover:bg-\\[\\#F4F8FB\\]"]:hover {
          background-color: rgba(66, 132, 255, 0.14) !important;
          color: #4284ff !important;
        }
      `}</style>
      <div className="flex h-full">
        <div className="hidden lg:block">{sidebar}</div>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-[#1F2937]/20 backdrop-blur-[2px]" onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar" />
            <div className="relative h-full w-[230px] shadow-[18px_0_50px_rgba(31,43,77,0.16)]">{sidebar}</div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col p-3">
          <header className={`mb-3 flex h-8 items-center justify-between px-1 ${activeRoute === "ai-assistant" ? "max-sm:hidden" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex items-center gap-2 text-[#6B7280]">
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => setNotificationsOpen((value) => !value)}
                    className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 shadow-sm hover:bg-white"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[13px] w-[13px]" />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF3B6B]" />
                  </button>
                  {notificationsOpen && <NotificationsDropdown align="left" />}
                </div>
                <button
                  onClick={() => router.push("/settings")}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 shadow-sm hover:bg-white"
                  aria-label="Open settings"
                >
                  <Settings className="h-[13px] w-[13px]" />
                </button>
                <div ref={displayRef} className="relative">
                  <button
                    onClick={() => setDisplayOpen((value) => !value)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 shadow-sm hover:bg-white"
                    aria-label="Display preview"
                  >
                    <Monitor className="h-[13px] w-[13px]" />
                  </button>
                  {displayOpen && <DisplayDropdown />}
                </div>
              </div>
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#171717]">{currentTitle}</h1>
            </div>
            <button
              onClick={() => router.push("/account")}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#6B7280] shadow-sm hover:bg-[#FAFCFD]"
              aria-label="Open profile"
            >
              <UserRound className="h-[15px] w-[15px]" />
            </button>
          </header>

          <section
            className={[
              "min-h-0 flex-1 overflow-auto rounded-3xl border border-[#E8EEF2] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(31,43,77,0.06)]",
              activeRoute === "ai-assistant" ? "max-sm:px-4 max-sm:py-0" : "",
            ].join(" ")}
          >
            {children}
          </section>
        </main>
      </div>

      {signOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-[0_24px_70px_rgba(31,43,77,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">Sign out</h2>
                <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">Are you sure you want to sign out?</p>
              </div>
              <button onClick={() => setSignOutOpen(false)} className="rounded-lg p-1 text-[#9CA3AF] hover:bg-[#F4F8FB]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSignOutOpen(false)} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]">
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-xl bg-[#4A9BFF] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_10px_22px_rgba(74,155,255,0.22)] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </StudioThemeContext.Provider>
  );
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
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={[
        "group flex h-8 w-full items-center rounded-xl px-2.5 text-left text-[12px] font-medium transition-all hover:bg-[#DDEEFF] hover:text-[#4A9BFF]",
        collapsed ? "justify-center" : "gap-2",
      ].join(" ")}
      style={{
        background: active ? "#FFFFFF" : undefined,
        border: active ? "1px solid rgba(229,231,235,0.95)" : undefined,
        boxShadow: active ? "0 8px 18px rgba(31,43,77,0.06)" : undefined,
        color: active ? "#171717" : undefined,
      }}
    >
      <Icon className={`h-[13px] w-[13px] flex-shrink-0 group-hover:text-[#4A9BFF] ${active ? "text-[#1DA1F2]" : "text-[#6B7280]"}`} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3B6B] px-1 text-[10px] font-bold text-white">{item.badge}</span>
      )}
    </Link>
  );
}

function DropdownPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute z-50 rounded-2xl border border-[#E8EEF2] bg-white p-1.5 shadow-[0_18px_48px_rgba(31,43,77,0.12)] ${className}`}>
      {children}
    </div>
  );
}

function DropdownButton({ icon: Icon, label, onClick, muted }: { icon: LucideIcon; label: string; onClick?: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-medium text-[#4B5563] hover:bg-[#F4F8FB]"
    >
      <Icon className="h-3.5 w-3.5 text-[#6B7280]" />
      <span>{label}</span>
      {muted && <span className="ml-auto text-[10px] text-[#A1A7B0]">Soon</span>}
    </button>
  );
}

function NotificationsDropdown({ align = "right" }: { align?: "left" | "right" }) {
  return (
    <DropdownPanel className={`${align === "left" ? "left-0" : "right-0"} top-9 w-72`}>
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold text-[#171717]">Notifications</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Recent workspace updates</p>
      </div>
      {[
        ["Prompt Lab", "2 prompts are ready for review."],
        ["Exports", "Latest render is queued for download."],
        ["Workspace", "Personal workspace synced locally."],
      ].map(([title, desc]) => (
        <div key={title} className="rounded-xl px-3 py-2 hover:bg-[#F4F8FB]">
          <p className="text-[12px] font-semibold text-[#171717]">{title}</p>
          <p className="mt-0.5 text-[11px] text-[#6B7280]">{desc}</p>
        </div>
      ))}
    </DropdownPanel>
  );
}

function DisplayDropdown() {
  const { theme } = useStudioTheme();

  return (
    <DropdownPanel className="right-0 top-9 w-60">
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold text-[#171717]">Display preview</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Layout and preview controls</p>
      </div>
      <DropdownButton icon={Monitor} label="Preview workspace" muted />
      <DropdownButton icon={Grid2X2} label="Compact density" muted />
      <DropdownButton icon={CheckCircle2} label={`${theme === "dark" ? "Dark" : "Light"} mode active`} />
    </DropdownPanel>
  );
}

function StudioContent({ route }: { route: StudioRouteKey }) {
  switch (route) {
    case "studio-overview":
      return <OverviewPage />;
    case "figma-design":
      return <FigmaPage />;
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
      return <AIAssistantPage />;
  }
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#171717]">{title}</h2>
        <p className="mt-2 text-[12px] leading-5 text-[#6B7280]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#EAECEF] bg-[#FCFDFE] p-4 shadow-[0_10px_24px_rgba(31,43,77,0.035)] ${className}`}>{children}</div>;
}

function PrimaryButton({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#4A9BFF] px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(74,155,255,0.22)] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[12px] font-semibold text-[#4B5563] shadow-sm hover:border-[#CFE8F8] hover:text-[#171717]">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function OverviewPage() {
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
            {["Figma homepage concept updated", "Code Builder prepared landing route", "Blender material preview generated"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#1DA1F2]" />
                <span className="text-[12px] text-[#4B5563]">{item}</span>
              </div>
            ))}
          </div>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Quick actions</h3>
          <div className="mt-4 grid gap-2">
            <SecondaryButton icon={Plus}>New project</SecondaryButton>
            <SecondaryButton icon={Upload}>Import asset</SecondaryButton>
            <SecondaryButton icon={Sparkles}>Start AI task</SecondaryButton>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}

function FigmaPage() {
  return (
    <div>
      <PageHeader title="Figma Design" subtitle="Import files and manage recent design workspaces." action={<PrimaryButton icon={Upload}>Import Figma file</PrimaryButton>} />
      <SoftCard className="mb-5 flex min-h-[150px] flex-col items-center justify-center border-dashed text-center">
        <PenLine className="h-8 w-8 text-[#1DA1F2]" />
        <p className="mt-3 text-[13px] font-semibold text-[#171717]">Upload or import a Figma file</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Drop a design file here or connect a Figma link.</p>
      </SoftCard>
      <h3 className="mb-3 text-[13px] font-semibold text-[#171717]">Recent designs</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {["Landing system", "Mobile checkout", "Gallery cards"].map((name) => (
          <SoftCard key={name} className="min-h-[130px]">
            <div className="mb-4 h-16 rounded-xl bg-[#EEF7FC]" />
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-1 text-[10px] text-[#6B7280]">No synced edits yet.</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function CodeBuilderPage() {
  return (
    <div>
      <PageHeader title="Code Builder" subtitle="Describe a feature and prepare build-ready project work." />
      <SoftCard>
        <label className="text-[12px] font-semibold text-[#171717]">Project prompt</label>
        <textarea className="mt-3 min-h-[130px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Describe the route, component, or app behavior you want to build..." />
        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton icon={Code2}>Generate plan</PrimaryButton>
          <SecondaryButton icon={Folder}>Open recent project</SecondaryButton>
        </div>
      </SoftCard>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {["Studio shell", "Checkout polish", "Asset upload"].map((name) => (
          <SoftCard key={name}>
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] text-[#6B7280]">Recent build placeholder</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function BlenderPage() {
  return (
    <div>
      <PageHeader title="Blender 3D" subtitle="Generate, import, and organize 3D production assets." action={<PrimaryButton icon={Box}>New 3D task</PrimaryButton>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SoftCard className="flex min-h-[180px] flex-col items-center justify-center border-dashed text-center">
          <Layers3 className="h-8 w-8 text-[#1DA1F2]" />
          <p className="mt-3 text-[13px] font-semibold text-[#171717]">Upload asset or model</p>
          <p className="mt-1 text-[11px] text-[#6B7280]">OBJ, FBX, GLB, and blend files can be staged here.</p>
        </SoftCard>
        <SoftCard>
          <label className="text-[12px] font-semibold text-[#171717]">Generation prompt</label>
          <textarea className="mt-3 min-h-[116px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Describe the model, material, lighting, or scene..." />
          <PrimaryButton icon={Sparkles}>Prepare generation</PrimaryButton>
        </SoftCard>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {["Material study", "Product scene", "Gallery room", "Character base"].map((name) => (
          <SoftCard key={name} className="min-h-[120px]">
            <div className="mb-3 h-14 rounded-xl bg-[#EEF7FC]" />
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function AssetLibraryPage() {
  return (
    <div>
      <PageHeader title="Asset Library" subtitle="Search, filter, and upload creative assets." action={<PrimaryButton icon={Upload}>Upload asset</PrimaryButton>} />
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#EAECEF] bg-[#FCFDFE] p-3 sm:flex-row">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Search assets..." />
        </div>
        <SecondaryButton>All types</SecondaryButton>
        <SecondaryButton>Recent</SecondaryButton>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {["Image", "Vector", "Model", "Document", "Texture", "Reference", "Export", "Audio"].map((name) => (
          <SoftCard key={name}>
            <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-[12px] font-semibold text-[#171717]">{name} asset</p>
            <p className="mt-1 text-[10px] text-[#6B7280]">Placeholder</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function AIAssistantPage() {
  const [input, setInput] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [hasConversation, setHasConversation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

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
    event.target.value = "";
  };

  const sendPrompt = () => {
    if (!input.trim()) return;
    setHasConversation(true);
    setInput("");
  };

  const composer = (
    <div className="w-full overflow-visible rounded-3xl border border-[#E5E7EB] bg-white text-left shadow-[0_18px_42px_rgba(31,43,77,0.06)] max-sm:rounded-[1.35rem] max-sm:shadow-[0_12px_30px_rgba(31,43,77,0.08)]">
      <div className="relative flex min-h-[150px] flex-col px-5 py-4 max-sm:min-h-[112px] max-sm:px-4 max-sm:py-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-[13px] w-[13px] fill-[#1DA1F2] text-[#1DA1F2]" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendPrompt();
              }
            }}
            placeholder="Ask Lumen AI Assistant..."
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]"
            style={{ color: "#171717", letterSpacing: 0 }}
          />
        </div>
        {attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span key={attachment.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-medium text-[#4B5563]">
                <span className="truncate">{attachment.name}</span>
                <button
                  onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                  className="rounded-full text-[#9CA3AF] hover:text-[#171717]"
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 pt-5 text-[#A1A7B0] max-sm:gap-1.5 max-sm:pt-3">
          <div className="relative">
            <button onClick={() => setActionsOpen((value) => !value)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DDEEFF] hover:text-[#4A9BFF]" aria-label="Open assistant actions">
              <Plus className="h-[13px] w-[13px]" />
            </button>
            {actionsOpen && (
              <DropdownPanel className="bottom-9 left-0 w-44">
                <DropdownButton icon={Sparkles} label="New task" onClick={() => setActionsOpen(false)} />
                <DropdownButton icon={FileText} label="New prompt" onClick={() => setActionsOpen(false)} />
                <DropdownButton icon={Upload} label="Import file" onClick={() => fileInputRef.current?.click()} />
              </DropdownPanel>
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DDEEFF] hover:text-[#4A9BFF]" aria-label="Attach file">
            <Paperclip className="h-[13px] w-[13px]" />
          </button>
          <button onClick={() => imageInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DDEEFF] hover:text-[#4A9BFF]" aria-label="Attach image">
            <ImageIcon className="h-[13px] w-[13px]" />
          </button>
          <button onClick={() => documentInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DDEEFF] hover:text-[#4A9BFF]" aria-label="Attach document">
            <FileText className="h-[13px] w-[13px]" />
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => onFiles(event, "file")} />
          <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(event) => onFiles(event, "image")} />
          <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => onFiles(event, "document")} />
          <button
            onClick={sendPrompt}
            disabled={!input.trim()}
            aria-label="Send prompt"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#4A9BFF] text-white shadow-[0_12px_24px_rgba(74,155,255,0.28)] transition-colors disabled:opacity-70 hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (!hasConversation) {
    const suggestions = [
      { title: "Smart Budget", desc: "Create a budget that adapts to your lifestyle and goals." },
      { title: "Calculation", desc: "Easily crunch the numbers for clearer money choices." },
      { title: "Spending", desc: "See your spending habits and spot useful patterns." },
    ];
    const mobileSuggestions: { title: string; icon: LucideIcon }[] = [
      { title: "Calculation", icon: Calculator },
      { title: "Smart Budget", icon: Wallet },
      { title: "Spending", icon: CircleDollarSign },
      { title: "Research", icon: FileText },
      { title: "Saving", icon: RefreshCw },
      { title: "Overspend", icon: AlertTriangle },
    ];

    return (
      <div className="flex min-h-full items-center justify-center py-8 max-sm:items-stretch max-sm:justify-start max-sm:py-0">
        <div className="flex w-full max-w-[620px] flex-col items-center text-center max-sm:min-h-full max-sm:max-w-none max-sm:pb-3">
          <div className="hidden h-12 w-full items-center justify-center sm:hidden max-sm:flex">
            <button className="absolute left-1 flex h-9 w-9 items-center justify-center rounded-full text-[#171717] hover:bg-[#F4F8FB]" aria-label="Back">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-[13px] font-medium text-[#171717]">Lumen AI Assistant</p>
          </div>

          <div className="mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_16px_38px_rgba(29,161,242,0.32)] max-sm:mt-24 max-sm:h-[54px] max-sm:w-[54px]">
            <Sparkles className="h-7 w-7 fill-current max-sm:h-6 max-sm:w-6" />
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#171717] max-sm:text-[17px]">Good Morning, Julie!</h2>
          <p className="mt-3 text-[12px] leading-5 text-[#6B7280] max-sm:mt-1 max-sm:text-[11px]">Your money story today starts with Lumen - clear, simple, and made for you.</p>

          <div className="mt-7 hidden w-full sm:block">{composer}</div>

          <div className="mt-4 hidden w-full gap-3 sm:grid sm:grid-cols-3">
            {suggestions.map((card) => (
              <button key={card.title} className="rounded-2xl border border-[#EAECEF] bg-[#FCFDFE] p-4 text-left shadow-[0_10px_24px_rgba(31,43,77,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#D4EAF8] hover:bg-white">
                <p className="text-[12px] font-semibold text-[#171717]">{card.title}</p>
                <p className="mt-2 text-[10.5px] leading-4 text-[#6B7280]">{card.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 hidden flex-wrap justify-center gap-2 max-sm:flex">
            {mobileSuggestions.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.title} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 text-[10.5px] font-medium text-[#171717] shadow-[0_8px_20px_rgba(31,43,77,0.04)]">
                  <Icon className="h-3 w-3 text-[#4B5563]" />
                  {item.title}
                </button>
              );
            })}
          </div>

          <button className="mt-4 self-start text-[11px] font-medium text-[#6B7280] hover:text-[#171717] max-sm:hidden">
            <span className="inline-flex items-center gap-1">
              Refresh prompts <RefreshCw className="h-[11px] w-[11px]" />
            </span>
          </button>

          <div className="mt-auto hidden w-full pt-4 max-sm:block">
            <div className="mb-2 flex items-start gap-2 rounded-2xl border border-[#E8EEF2] bg-[#FCFDFE] px-3 py-2 text-left shadow-[0_10px_24px_rgba(31,43,77,0.04)]">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium text-[#171717]">Collaborate with Nova AI &amp; Orion 2.0</p>
                <p className="mt-0.5 text-[9.5px] leading-3 text-[#6B7280]">Ideal for comprehensive analysis and insights</p>
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
        <div className="mb-10 flex min-h-[250px] items-end justify-end">
          <div className="relative h-[150px] w-[230px]">
            <div className="absolute right-9 top-3 h-[126px] w-[70px] -rotate-6 rounded-[10px] bg-white p-2 text-[5px] leading-[1.15] text-[#111827] opacity-80 shadow-[0_18px_45px_rgba(31,43,77,0.10)] blur-[0.2px]">
              <p className="text-center text-[8px] font-bold">TESCO</p>
              <p className="mt-1">MILK 2.99</p>
              <p>BREAD 1.75</p>
              <p>EGGS 3.40</p>
              <p>COFFEE 8.20</p>
              <p>PASTA 2.10</p>
              <p className="mt-1 border-t border-[#D1D5DB] pt-1 font-bold">TOTAL 592.07</p>
            </div>
            <div className="absolute right-0 top-8 h-[132px] w-[100px] rotate-8 rounded-[14px] bg-[#F9FAFB] p-3 text-center text-[#111827] shadow-[0_22px_50px_rgba(31,43,77,0.13)]">
              <p className="text-[16px] font-semibold tracking-[-0.04em]">Walmart</p>
              <p className="text-[5px] font-medium text-[#6B7280]">Save money. Live better.</p>
              <div className="mt-2 space-y-0.5 text-left text-[5px] leading-[1.05] text-[#111827]">
                <p>HOUSEHOLD 420.00</p>
                <p>CLEANING 88.12</p>
                <p>STORAGE 72.40</p>
                <p>HOME 415.60</p>
                <p className="border-t border-[#D1D5DB] pt-1 font-bold">TOTAL 996.12</p>
              </div>
            </div>
          </div>

          <div className="ml-auto max-w-[440px] rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] text-[#171717] shadow-[0_10px_28px_rgba(31,43,77,0.04)]">
            Hi Lumen, can you help me log 3 shopping receipts today?
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_12px_26px_rgba(29,161,242,0.28)]">
            <Sparkles className="h-4 w-4 fill-current" />
          </div>
          <div className="min-w-0 flex-1 text-[13px] leading-6 text-[#171717]">
            <p className="mb-3">Got it, Julie.</p>
            <div className="border-t border-[#E5E7EB] pt-3">
              <ul className="list-disc space-y-2 pl-4">
                <li>Added Tesco receipt: <strong>$592.07</strong> (Groceries)</li>
                <li>Added Walmart receipt: <strong>$996.12</strong> (Household)</li>
                <li>Added Coffee Shop receipt: <strong>$492.42</strong> (Food &amp; Drink)</li>
              </ul>
              <p className="mt-3">All three have been logged into your transactions for today. Would you like me to create a quick summary?</p>
            </div>

            <div className="my-4 flex justify-end">
              <span className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] shadow-[0_10px_28px_rgba(31,43,77,0.04)]">Yes, please.</span>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4">
              <p>
                Today you&apos;ve spent a total of <strong>$2,080.61</strong>. Most went to household (60%), followed by food &amp; drinks (11%) and groceries (29%).
              </p>
            </div>
            <div className="mt-4 border-t border-[#E5E7EB] pt-4">
              <p>Do you want me to compare this with your weekly average?</p>
            </div>
          </div>
        </div>
      </div>

      {composer}
    </div>
  );
}

function PromptLabPage() {
  return (
    <div>
      <PageHeader title="Prompt Lab" subtitle="Test, save, and organize reusable prompt workflows." action={<PrimaryButton icon={Plus}>Create new prompt</PrimaryButton>} />
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", "Design", "Code", "3D", "Research"].map((filter) => (
          <button key={filter} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:border-[#CFE8F8]">
            {filter}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["Website audit", "Component builder", "Scene generator", "Copy polish", "Budget planner", "Asset namer"].map((name) => (
          <SoftCard key={name}>
            <p className="text-[12px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Prompt card placeholder for testing and reuse.</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div>
      <PageHeader title="Projects" subtitle="Manage studio projects and production status." action={<PrimaryButton icon={Plus}>New project</PrimaryButton>} />
      <div className="grid gap-3 md:grid-cols-3">
        {["Alternus dashboard", "Gallery redesign", "3D catalog"].map((name) => (
          <SoftCard key={name} className="min-h-[150px]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
              <Folder className="h-5 w-5" />
            </div>
            <p className="text-[13px] font-semibold text-[#171717]">{name}</p>
            <p className="mt-2 text-[11px] text-[#6B7280]">Project card placeholder</p>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}

function ExportsPage() {
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
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#171717]" aria-label={`Download ${name}`}>
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
  const isDark = theme === "dark";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage profile, workspace, plan, appearance, and preferences."
        action={
          <button
            onClick={toggleTheme}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-[12px] font-semibold text-[#171717] shadow-sm hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"
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
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
                {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <h3 className="text-[14px] font-semibold text-[#171717]">Appearance</h3>
              <p className="mt-2 max-w-md text-[11px] leading-5 text-[#6B7280]">
                Choose a softer light workspace or a calm dark workspace. Your preference is saved on this browser.
              </p>
            </div>
            <div className="inline-flex rounded-2xl border border-[#E5E7EB] bg-white p-1">
              <button
                onClick={() => setTheme("light")}
                className={[
                  "inline-flex h-8 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition-all",
                  theme === "light" ? "bg-[#DDEEFF] text-[#4A9BFF]" : "text-[#6B7280] hover:bg-[#F4F8FB]",
                ].join(" ")}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={[
                  "inline-flex h-8 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition-all",
                  theme === "dark" ? "bg-[#DDEEFF] text-[#4A9BFF]" : "text-[#6B7280] hover:bg-[#F4F8FB]",
                ].join(" ")}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          </div>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Lumen AI Trial</h3>
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">12 days left on the Personal workspace trial.</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF7FC]">
            <div className="h-full w-[58%] rounded-full bg-[#4A9BFF]" />
          </div>
          <button className="mt-4 inline-flex h-9 items-center rounded-xl bg-[#4A9BFF] px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(74,155,255,0.22)] hover:bg-[#DDEEFF] hover:text-[#4A9BFF]">
            Upgrade plan
          </button>
        </SoftCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SoftCard>
          <SettingCardHeader icon={UserRound} title="Profile settings" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Name, email, avatar, role, and account details placeholder.</p>
          <SettingsRows rows={["Display name: Julie", "Email: personal workspace", "Profile photo placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Shield} title="Workspace settings" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Personal workspace controls, members, permissions, and collaboration settings.</p>
          <SettingsRows rows={["Workspace: Personal", "Member invites placeholder", "Default project: AI Assistant"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={CreditCard} title="Billing and plan" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Trial status, upgrade placeholder, invoices, and billing history.</p>
          <SettingsRows rows={["Current plan: Trial", "Billing history placeholder", "Payment method placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Bell} title="Notifications" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Control alerts for prompt lab updates, exports, and workspace changes.</p>
          <SettingsRows rows={["Prompt Lab badge alerts", "Export completion alerts", "Weekly summary placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={KeyRound} title="Security" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Password, sessions, two-factor authentication, and trusted devices.</p>
          <SettingsRows rows={["Password change placeholder", "Active sessions placeholder", "Two-factor authentication placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Plug} title="Integrations" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Connect Figma, Blender, code repositories, and export destinations.</p>
          <SettingsRows rows={["Figma connection placeholder", "Blender bridge placeholder", "Git provider placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Database} title="Data and exports" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Manage workspace data, download history, retention, and import defaults.</p>
          <SettingsRows rows={["Export archive placeholder", "Import defaults placeholder", "Data retention placeholder"]} />
        </SoftCard>
        <SoftCard>
          <SettingCardHeader icon={Monitor} title="Display defaults" />
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">Sidebar behavior, compact preview, and dashboard density.</p>
          <SettingsRows rows={["Sidebar collapse preference", "Preview mode placeholder", "Density: Comfortable"]} />
        </SoftCard>
      </div>
    </div>
  );
}

function SettingCardHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF7FC] text-[#1DA1F2]">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-[13px] font-semibold text-[#171717]">{title}</h3>
    </div>
  );
}

function SettingsRows({ rows }: { rows: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
          <span className="text-[11px] font-medium text-[#4B5563]">{row}</span>
          <span className="text-[10px] font-semibold text-[#A1A7B0]">Soon</span>
        </div>
      ))}
    </div>
  );
}

function HelpCenterPage() {
  return (
    <div>
      <PageHeader title="Help Center" subtitle="Find help articles and contact support." />
      <div className="mb-5 flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#FCFDFE] px-4">
        <Search className="h-4 w-4 text-[#9CA3AF]" />
        <input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A1A7B0]" placeholder="Search help..." />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["How do imports work?", "Where are exports saved?", "How do I manage workspaces?"].map((question) => (
          <SoftCard key={question}>
            <p className="text-[12px] font-semibold text-[#171717]">{question}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">FAQ card placeholder with concise support guidance.</p>
          </SoftCard>
        ))}
      </div>
      <SoftCard className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#171717]">Contact support</p>
          <p className="mt-1 text-[11px] text-[#6B7280]">Support request placeholder for the Personal workspace.</p>
        </div>
        <SecondaryButton>Open support</SecondaryButton>
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
