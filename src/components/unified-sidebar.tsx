"use client";

import {
  Archive,
  BadgeCheck,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckSquare,
  ChevronDown,
  CirclePlus,
  ClipboardList,
  FileText,
  FolderKanban,
  Grid2X2,
  LayoutDashboard,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type SidebarItem = { label: string; href: string; icon: LucideIcon; badge?: string };

const primary: SidebarItem[] = [
  { label: "Dashboard", href: "/project", icon: LayoutDashboard },
  { label: "Messages", href: "/ai-assistant", icon: Bell, badge: "16" },
  { label: "Tasks", href: "/projects", icon: CheckSquare },
  { label: "Notes", href: "/workspace/knowledge", icon: FileText },
  { label: "Emails", href: "/workspace/mail", icon: Mail },
  { label: "Reports", href: "/exports", icon: ClipboardList },
  { label: "Automations", href: "/workflow", icon: Settings2, badge: "✦" },
  { label: "Workflows", href: "/workflow", icon: Workflow, badge: "✦" },
];

const favorites: SidebarItem[] = [
  { label: "Key Accounts", href: "/projects", icon: BriefcaseBusiness },
  { label: "Strategic Initiatives", href: "/projects", icon: FolderKanban },
  { label: "Focus Areas", href: "/projects", icon: Grid2X2 },
  { label: "Starred Items", href: "/projects", icon: BadgeCheck },
];

const records: SidebarItem[] = [
  { label: "Companies", href: "/projects", icon: BriefcaseBusiness },
  { label: "People", href: "/account", icon: Users },
];

export function UnifiedSidebar({
  activePath,
  collapsed = false,
  onCollapse,
  className = "",
}: {
  activePath?: string;
  collapsed?: boolean;
  onCollapse?: () => void;
  className?: string;
}) {
  if (collapsed) {
    return (
      <aside className={`flex h-full w-[60px] flex-col items-center bg-[#202124] py-4 ${className}`}>
        <button type="button" onClick={onCollapse} aria-label="Expand sidebar" className="rounded-lg p-2 text-[#a4a6ab] hover:bg-[#303136]">
          <PanelLeftOpen size={16} />
        </button>
      </aside>
    );
  }

  const renderItems = (items: SidebarItem[]) => items.map(({ label, href, icon: Icon, badge }) => {
    const active = activePath === href;
    return (
      <Link key={label} href={href} className={`group flex h-[29px] items-center gap-2 rounded-[6px] px-2 text-[13px] transition ${active ? "bg-[#343538] text-[#f4f4f5]" : "text-[#c2c3c6] hover:bg-[#2d2e31] hover:text-white"}`}>
        <Icon size={14} strokeWidth={1.8} className="shrink-0 text-[#8d9097] group-hover:text-[#c8cbd2]" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge && <span className={`text-[10px] ${badge === "✦" ? "text-[#b86dff]" : "rounded bg-[#535458] px-1 text-[#e4e4e5]"}`}>{badge}</span>}
      </Link>
    );
  });

  return (
    <aside className={`flex h-full w-[234px] shrink-0 flex-col overflow-hidden rounded-[9px] bg-[#232427] px-[14px] py-[12px] text-[#f4f4f5] ${className}`}>
      <div className="flex items-center gap-2 px-1">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#34363a] text-white"><Sparkles size={17} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-4">DesignHub</p>
          <p className="text-[10px] text-[#9b9da3]">● 21 members</p>
        </div>
        <button type="button" onClick={onCollapse} aria-label="Collapse sidebar" className="rounded-md p-1.5 text-[#b6b8bd] hover:bg-[#343538]">
          <PanelLeftClose size={15} />
        </button>
      </div>

      <button type="button" className="mt-4 flex h-[28px] items-center gap-2 rounded-[6px] border border-[#3e4045] bg-[#2b2c30] px-2 text-left text-[11px] text-[#94969d]">
        <Search size={14} />
        <span className="flex-1">Search</span>
        <kbd className="rounded border border-[#4b4d52] px-1 text-[9px]">⌘K</kbd>
      </button>

      <nav className="mt-3 space-y-0.5" aria-label="Workspace navigation">{renderItems(primary)}</nav>

      <SidebarSection title="Favorites" items={favorites} renderItems={renderItems} />
      <SidebarSection title="Records" items={records} renderItems={renderItems} />

      <div className="mt-auto space-y-2 pt-3">
        <div className="rounded-[7px] border border-[#3d3e42] bg-[#17181a] p-3">
          <p className="text-[12px] font-semibold">New version available</p>
          <p className="mt-2 text-[10px] leading-[14px] text-[#a5a6aa]">An improved version of App is available. Please restart now to upgrade.</p>
          <Link href="/download" className="mt-2 inline-flex text-[11px] font-medium text-white hover:text-[#a77bff]">Update →</Link>
        </div>
        <Link href="/account" className="flex items-center gap-2 rounded-[7px] px-1 py-1.5 hover:bg-[#303136]">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d99e72] text-[11px] font-bold text-[#27211c]">LS</span>
          <span className="min-w-0 flex-1"><span className="block text-[12px]">Liam Smith⌄</span><span className="block truncate text-[10px] text-[#999ba0]">smith@example.com</span></span>
          <span className="text-[#a7a9ae]">•••</span>
        </Link>
      </div>
    </aside>
  );
}

function SidebarSection({ title, items, renderItems }: { title: string; items: SidebarItem[]; renderItems: (items: SidebarItem[]) => React.ReactNode }) {
  return (
    <section className="mt-4">
      <div className="mb-1 flex items-center justify-between px-2 text-[11px] text-[#999ba1]">
        <span className="flex items-center gap-1"><ChevronDown size={11} />{title}</span>
        <CirclePlus size={14} />
      </div>
      <div className="space-y-0.5">{renderItems(items)}</div>
    </section>
  );
}
