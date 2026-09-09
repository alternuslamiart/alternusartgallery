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
import { useState } from "react";

type SidebarItem = { label: string; href: string; icon: LucideIcon; badge?: string; onClick?: () => void };

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
  items = primary,
  sectionTitle,
  searchValue,
  onSearch,
}: {
  activePath?: string;
  collapsed?: boolean;
  onCollapse?: () => void;
  className?: string;
  items?: SidebarItem[];
  sectionTitle?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
}) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = onCollapse ? collapsed : localCollapsed;
  const toggleCollapse = () => {
    if (onCollapse) onCollapse();
    else setLocalCollapsed((value) => !value);
  };
  const compactItems = [...items, ...(items === primary ? [...favorites, ...records] : [])];

  if (isCollapsed) {
    return (
      <aside className={`flex h-full w-[60px] flex-col items-center overflow-hidden bg-[#171717] py-3 ${className}`}>
        <button type="button" onClick={toggleCollapse} aria-label="Expand sidebar" className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#242424] text-white hover:bg-[#242424]">
          <Sparkles size={16} />
        </button>
        <button type="button" onClick={toggleCollapse} aria-label="Expand sidebar" className="mt-4 grid h-8 w-8 place-items-center rounded-[7px] border border-[#333333] bg-[#242424] text-[#a4a6ab] hover:bg-[#242424]">
          <Search size={14} />
        </button>
        <nav className="mt-3 flex flex-col items-center gap-1" aria-label="Collapsed workspace navigation">
          {compactItems.map(({ label, href, icon: Icon, badge, onClick }) => (
            <Link key={label} href={href} onClick={onClick} aria-label={label} title={label} className={`relative grid h-7 w-8 place-items-center rounded-[6px] ${activePath === href ? "bg-[#242424] text-white" : "text-[#898c93] hover:bg-[#242424] hover:text-white"}`}>
              <Icon size={14} strokeWidth={1.8} />
              {badge === "✦" && <span className="absolute -right-0.5 -top-0.5 text-[9px] text-[#b86dff]">✦</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link href="/account" aria-label="Open profile" className="grid h-8 w-8 place-items-center rounded-full bg-[#d99e72] text-[10px] font-bold text-[#27211c]">LS</Link>
        </div>
      </aside>
    );
  }

  const renderItems = (items: SidebarItem[]) => items.map(({ label, href, icon: Icon, badge, onClick }) => {
    const active = activePath === href;
    return (
      <Link key={label} href={href} onClick={onClick} className={`group flex h-[29px] items-center gap-2 rounded-[6px] px-2 text-[13px] transition ${active ? "bg-[#242424] text-[#f4f4f5]" : "text-[#c2c3c6] hover:bg-[#242424] hover:text-white"}`}>
        <Icon size={14} strokeWidth={1.8} className="shrink-0 text-[#8d9097] group-hover:text-[#c8cbd2]" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge && <span className={`text-[10px] ${badge === "✦" ? "text-[#b86dff]" : "rounded bg-[#535458] px-1 text-[#e4e4e5]"}`}>{badge}</span>}
      </Link>
    );
  });

  return (
    <aside className={`flex h-full w-[234px] shrink-0 flex-col overflow-hidden rounded-[9px] bg-[#171717] px-[14px] py-[12px] text-[#f4f4f5] ${className}`}>
      <div className="flex items-center gap-2 px-1">
        <button type="button" onClick={toggleCollapse} aria-label="Collapse sidebar" title="Collapse sidebar" className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#242424] text-white transition hover:bg-[#242424]"><Sparkles size={17} /></button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-4">DesignHub</p>
          <p className="text-[10px] text-[#9b9da3]">● 21 members</p>
        </div>
        <button type="button" onClick={toggleCollapse} aria-label="Collapse sidebar" className="rounded-md p-1.5 text-[#b6b8bd] hover:bg-[#242424]">
          <PanelLeftClose size={15} />
        </button>
      </div>

      <label className="mt-4 flex h-[28px] items-center gap-2 rounded-[6px] border border-[#333333] bg-[#242424] px-2 text-left text-[11px] text-[#94969d]">
        <Search size={14} />
        <input value={searchValue ?? ""} onChange={(event) => onSearch?.(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#94969d]" />
        <kbd className="rounded border border-[#4b4d52] px-1 text-[9px]">⌘K</kbd>
      </label>

      <nav className="mt-3 space-y-0.5" aria-label="Workspace navigation">
        {sectionTitle && <div className="mb-2 px-2 text-[11px] font-medium text-[#e8e8e8]">{sectionTitle}</div>}
        {renderItems(items)}
      </nav>

      {items === primary && <><SidebarSection title="Favorites" items={favorites} renderItems={renderItems} /><SidebarSection title="Records" items={records} renderItems={renderItems} /></>}

      <div className="mt-auto space-y-2 pt-3">
        <div className="rounded-[7px] border border-[#3d3e42] bg-[#17181a] p-3">
          <p className="text-[12px] font-semibold">New version available</p>
          <p className="mt-2 text-[10px] leading-[14px] text-[#a5a6aa]">An improved version of App is available. Please restart now to upgrade.</p>
          <Link href="/download" className="mt-2 inline-flex text-[11px] font-medium text-white hover:text-[#a77bff]">Update →</Link>
        </div>
        <Link href="/account" className="flex items-center gap-2 rounded-[7px] px-1 py-1.5 hover:bg-[#242424]">
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
