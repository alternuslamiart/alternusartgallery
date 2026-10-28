"use client";

import {
  Box,
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  PanelLeftClose,
  Search,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { StudioProfileMenu } from "@/components/crystal-studio/StudioSidebarFooter";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  onClick?: () => void;
};

const primary: SidebarItem[] = [
  { label: "Dashboard", href: "/project", icon: LayoutDashboard },
  { label: "Modeling", href: "/casynus", icon: Box },
  { label: "Sketch", href: "/interior", icon: LayoutGrid },
  { label: "Infrastructure", href: "/infrastructure", icon: Globe2 },
  { label: "Workflows", href: "/workflow", icon: Workflow },
  { label: "AI Chat", href: "/aichat", icon: Sparkles },
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
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = onCollapse ? collapsed : localCollapsed;
  const toggleCollapse = () => {
    if (onCollapse) onCollapse();
    else setLocalCollapsed((value) => !value);
  };

  const initial = (
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    "C"
  )
    .charAt(0)
    .toUpperCase();

  if (isCollapsed) {
    return (
      <aside
        className={`workspace-sidebar flex h-full w-[60px] min-w-[60px] flex-col items-center overflow-hidden rounded-[10px] border border-[#333333] bg-[#161616] py-3 ${className}`}
      >
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label="Expand sidebar"
          className="grid h-9 w-9 place-items-center rounded-[8px] bg-[#242424] text-white hover:bg-[#303030]"
        >
          <Sparkles size={16} />
        </button>
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label="Search"
          className="mt-4 grid h-9 w-9 place-items-center rounded-xl border border-[#333333] bg-[#202124] text-[#94969d] hover:bg-[#2a2b2f]"
        >
          <Search size={14} />
        </button>
        <nav
          className="mt-3 flex flex-col items-center gap-1"
          aria-label="Collapsed workspace navigation"
        >
          {items.map(({ label, href, icon: Icon, badge, onClick }) => {
            const active =
              activePath === href ||
              (href.includes("?") &&
                activePath?.startsWith(href.split("?")[0] ?? "") === true);
            return (
              <Link
                key={label}
                href={href}
                onClick={onClick}
                aria-label={label}
                title={label}
                className={`relative grid h-8 w-9 place-items-center rounded-[6px] ${
                  active
                    ? "bg-[#2b2b2b] text-white"
                    : "text-[#898c93] hover:bg-[#242424] hover:text-white"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {badge === "✦" && (
                  <span className="absolute -right-0.5 -top-0.5 text-[9px] text-[#b86dff]">
                    ✦
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="relative mt-auto">
          <button
            type="button"
            aria-label="Open profile menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="grid h-8 w-8 place-items-center rounded-xl bg-[#2B2B2B] border border-[#383838] text-[12px] font-semibold text-white transition hover:bg-[#2B2B2B]"
          >
            {initial}
          </button>
          <StudioProfileMenu
            open={profileOpen}
            placement="bottom-left"
            onClose={() => setProfileOpen(false)}
            onOpenProfile={() => {
              window.location.href = "/account?section=organization";
            }}
            onOpenUpgrade={() => {
              window.location.href = "/pricing";
            }}
            onOpenBilling={() => {
              window.location.href = "/account?section=billing";
            }}
            onOpenSettings={() => {
              window.location.href = "/account?section=privacy";
            }}
          />
        </div>
      </aside>
    );
  }

  const renderItems = (itemList: SidebarItem[]) =>
    itemList.map(({ label, href, icon: Icon, badge, onClick }) => {
      const active =
        activePath === href ||
        (href.includes("?") &&
          activePath?.startsWith(href.split("?")[0] ?? "") === true);
      return (
        <Link
          key={label}
          href={href}
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          className={`group flex h-8 items-center gap-2 rounded-[6px] px-2 text-[13px] transition ${
            active
              ? "bg-[#2b2b2b] text-[#f4f4f5]"
              : "text-[#c2c3c6] hover:bg-[#242424] hover:text-white"
          }`}
        >
          <Icon
            size={14}
            strokeWidth={1.8}
            className="shrink-0 text-[#8d9097] group-hover:text-[#c8cbd2]"
          />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge && (
            <span
              className={`text-[10px] ${
                badge === "✦"
                  ? "text-[#b86dff]"
                  : "rounded bg-[#535458] px-1 text-[#e4e4e5]"
              }`}
            >
              {badge}
            </span>
          )}
        </Link>
      );
    });

  return (
    <aside
      className={`workspace-sidebar flex h-full w-[234px] min-w-0 shrink-0 flex-col overflow-hidden rounded-[10px] border border-[#333333] bg-[#161616] px-[14px] py-[12px] text-[#f4f4f5] shadow-[0_8px_24px_rgba(0,0,0,0.16)] ${className}`}
    >
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#242424] text-white transition hover:bg-[#242424]"
        >
          <Sparkles size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-4">DesignHub</p>
          <p className="text-[10px] text-[#9b9da3]">● 21 members</p>
        </div>
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label="Collapse sidebar"
          className="rounded-md p-1.5 text-[#b6b8bd] hover:bg-[#242424]"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <label className="group mt-4 flex h-9 w-full items-center gap-2 rounded-xl border border-[#333333] bg-[#202124] px-3 text-left text-xs text-[#94969d] transition hover:border-[#4a4a4a] hover:bg-[#26272b] focus-within:border-[#4284ff]">
        <Search size={14} className="shrink-0 text-[#94969d]" />
        <input
          value={searchValue ?? ""}
          onChange={(event) => onSearch?.(event.target.value)}
          placeholder="Search chats, tools, pages..."
          className="min-w-0 flex-1 bg-transparent text-xs text-[#f4f4f5] outline-none placeholder:text-[#94969d]"
        />
        <kbd className="rounded border border-[#4b4d52] px-1.5 py-0.5 text-[9px] text-[#94969d]">
          ⌘K
        </kbd>
      </label>

      <nav className="mt-3 space-y-0.5" aria-label="Workspace navigation">
        {sectionTitle && (
          <div className="mb-2 px-2 text-[11px] font-medium text-[#e8e8e8]">
            {sectionTitle}
          </div>
        )}
        {renderItems(items)}
      </nav>

      <div className="mt-auto pt-3">
        <div className="relative">
          <button
            type="button"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-[#383838] bg-[#2B2B2B] p-2 text-left transition hover:border-[#4a4a4a] hover:bg-[#2B2B2B]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#4284ff] text-[12px] font-semibold text-white">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-[#f4f4f5]">
                {session?.user?.name || "Casynus Creator"}
              </span>
              <span className="block truncate text-[10px] text-[#9b9da3]">
                {session?.user?.email || "Workspace account"}
              </span>
            </span>
            <span className="text-xs text-[#9b9da3]">⌄</span>
          </button>
          <StudioProfileMenu
            open={profileOpen}
            placement="top-left"
            onClose={() => setProfileOpen(false)}
            onOpenProfile={() => {
              window.location.href = "/account?section=organization";
            }}
            onOpenUpgrade={() => {
              window.location.href = "/pricing";
            }}
            onOpenBilling={() => {
              window.location.href = "/account?section=billing";
            }}
            onOpenSettings={() => {
              window.location.href = "/account?section=privacy";
            }}
          />
        </div>
      </div>
    </aside>
  );
}
