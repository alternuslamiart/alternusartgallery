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
  Code2,
  Download,
  FileText,
  Folder,
  Grid2X2,
  ImageIcon,
  Layers3,
  Menu,
  Monitor,
  Paperclip,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

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
  { key: "studio-overview", label: "Studio Overview", href: "/studio-overview", icon: Grid2X2 },
  { key: "figma-design", label: "Figma Design", href: "/figma-design", icon: PenLine },
  { key: "code-builder", label: "Code Builder", href: "/code-builder", icon: Code2 },
  { key: "blender-3d", label: "Blender 3D", href: "/blender-3d", icon: Layers3 },
  { key: "asset-library", label: "Asset Library", href: "/asset-library", icon: ImageIcon },
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
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
        "flex h-full flex-shrink-0 flex-col border-r border-white/70 bg-[linear-gradient(180deg,#EAF3F8_0%,#F6FAFC_100%)] px-3 py-3 transition-all duration-200 ease-out",
        isCollapsed ? "w-[76px]" : "w-[230px]",
      ].join(" ")}
    >
      <div ref={workspaceRef} className="relative mb-4 flex items-center justify-between px-1">
        <button
          onClick={() => setWorkspaceOpen((value) => !value)}
          className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-[13px] font-semibold text-[#1F2937] hover:bg-white/60"
          aria-expanded={workspaceOpen}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1DA1F2] text-white">
            <Shield className="h-[11px] w-[11px]" />
          </span>
          {!isCollapsed && (
            <>
              <span className="truncate">Personal</span>
              <ChevronDown className="h-3 w-3 text-[#6B7280]" />
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2 text-[#6B7280]">
            <div ref={sidebarNotificationRef} className="relative">
              <button
                onClick={() => setNotificationsOpen((value) => !value)}
                className="relative flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/70"
                aria-label="Notifications"
              >
                <Bell className="h-[13px] w-[13px]" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF3B6B]" />
              </button>
              {notificationsOpen && <NotificationsDropdown align="left" />}
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/70"
              aria-label="Settings"
            >
              <Settings className="h-[13px] w-[13px]" />
            </button>
          </div>
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
            <button className="mt-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#171717] shadow-sm hover:border-[#CFE8F8]">
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
              "flex h-8 w-full items-center rounded-lg px-2.5 text-[12px] font-medium text-[#4B5563] hover:bg-white/65",
              isCollapsed ? "justify-center" : "gap-2",
            ].join(" ")}
          >
            <Upload className="h-[13px] w-[13px] rotate-90 text-[#6B7280]" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F6FAFC] font-sans text-[#171717]">
      <div className="flex h-full">
        <div className="hidden lg:block">{sidebar}</div>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button className="absolute inset-0 bg-[#1F2937]/20 backdrop-blur-[2px]" onClick={() => setIsMobileOpen(false)} aria-label="Close sidebar" />
            <div className="relative h-full w-[230px] shadow-[18px_0_50px_rgba(31,43,77,0.16)]">{sidebar}</div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col p-3">
          <header className="mb-3 flex h-8 items-center justify-between px-1">
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
              onClick={toggleMenu}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#6B7280] shadow-sm hover:bg-[#FAFCFD]"
              aria-label="Toggle navigation"
            >
              <Menu className="h-[15px] w-[15px]" />
            </button>
          </header>

          <section className="min-h-0 flex-1 overflow-auto rounded-3xl border border-[#E8EEF2] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(31,43,77,0.06)]">
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
        "flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[12px] font-medium transition-colors",
        collapsed ? "justify-center" : "gap-2",
      ].join(" ")}
      style={{
        background: active ? "#FFFFFF" : "transparent",
        border: active ? "1px solid rgba(229,231,235,0.95)" : "1px solid transparent",
        boxShadow: active ? "0 8px 18px rgba(31,43,77,0.06)" : "none",
        color: active ? "#171717" : "#4B5563",
      }}
    >
      <Icon className="h-[13px] w-[13px] flex-shrink-0" color={active ? "#1DA1F2" : "#6B7280"} />
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
  return (
    <DropdownPanel className="right-0 top-9 w-60">
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold text-[#171717]">Display preview</p>
        <p className="mt-1 text-[11px] text-[#6B7280]">Layout and preview controls</p>
      </div>
      <DropdownButton icon={Monitor} label="Preview workspace" muted />
      <DropdownButton icon={Grid2X2} label="Compact density" muted />
      <DropdownButton icon={CheckCircle2} label="Light mode active" />
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => [
      { title: "Smart Budget", desc: "Create a budget that adapts to your lifestyle and goals." },
      { title: "Calculation", desc: "Easily crunch the numbers for clearer money choices." },
      { title: "Spending", desc: "See your spending habits and spot useful patterns." },
    ],
    [],
  );

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

  return (
    <div className="flex min-h-full items-center justify-center py-8">
      <div className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div className="mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#1D9BF0] text-white shadow-[0_16px_38px_rgba(29,161,242,0.32)]">
          <Sparkles className="h-7 w-7 fill-current" />
        </div>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#171717]">Good Morning, Julie!</h2>
        <p className="mt-3 text-[12px] leading-5 text-[#6B7280]">Your money story today starts with Lumen - clear, simple, and made for you.</p>

        <div className="mt-7 w-full overflow-visible rounded-3xl border border-[#E5E7EB] bg-white text-left shadow-[0_18px_42px_rgba(31,43,77,0.08)]">
          <div className="flex items-center gap-3 border-b border-[#EEF2F5] bg-[#FAFCFD] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7DD3FC] to-[#1DA1F2] text-white shadow-[0_8px_18px_rgba(29,161,242,0.25)]">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#171717]">Work with GPT-5.0 &amp; Gemini 2.5</p>
              <p className="mt-0.5 text-[10px] text-[#6B7280]">Great for deep research and calculation</p>
            </div>
          </div>
          <div className="relative flex min-h-[118px] flex-col px-4 py-3">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-[13px] w-[13px] fill-[#1DA1F2] text-[#1DA1F2]" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
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
            <div className="mt-auto flex items-center gap-3 pt-5 text-[#A1A7B0]">
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
                disabled={!input.trim()}
                aria-label="Send prompt"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#4A9BFF] text-white shadow-[0_12px_24px_rgba(74,155,255,0.28)] transition-colors disabled:opacity-70 hover:bg-[#DDEEFF] hover:text-[#4A9BFF]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
          {suggestions.map((card) => (
            <button key={card.title} className="rounded-2xl border border-[#EAECEF] bg-[#FCFDFE] p-4 text-left shadow-[0_10px_24px_rgba(31,43,77,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#D4EAF8] hover:bg-white">
              <p className="text-[12px] font-semibold text-[#171717]">{card.title}</p>
              <p className="mt-2 text-[10.5px] leading-4 text-[#6B7280]">{card.desc}</p>
            </button>
          ))}
        </div>

        <button className="mt-4 self-start text-[11px] font-medium text-[#6B7280] hover:text-[#171717]">
          <span className="inline-flex items-center gap-1">
            Refresh prompts <RefreshCw className="h-[11px] w-[11px]" />
          </span>
        </button>
      </div>
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
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage profile, workspace, plan, and preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Profile settings</h3>
          <p className="mt-2 text-[11px] text-[#6B7280]">Name, email, avatar, and account details placeholder.</p>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Workspace settings</h3>
          <p className="mt-2 text-[11px] text-[#6B7280]">Personal workspace controls and collaboration settings.</p>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Billing and plan</h3>
          <p className="mt-2 text-[11px] text-[#6B7280]">Trial status, upgrade placeholder, and billing history.</p>
        </SoftCard>
        <SoftCard>
          <h3 className="text-[13px] font-semibold text-[#171717]">Preferences</h3>
          <p className="mt-2 text-[11px] text-[#6B7280]">Light interface, notifications, and workspace defaults.</p>
        </SoftCard>
      </div>
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
