"use client";

import { Box, ChevronDown, Compass, Layers3 } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode, SelectHTMLAttributes } from "react";
import type { StudioMode } from "./types";

type ToolIcon = ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;

export function IconButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  className = "",
}: {
  icon: ToolIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`studio-icon-btn grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1687f7] disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "is-active border-[#1687f7]/60 bg-[#1687f7] text-white shadow-[0_2px_10px_rgba(22,135,247,.28)]"
          : "border-transparent bg-transparent text-zinc-300 hover:border-white/[0.08] hover:bg-[#222730] hover:text-white active:bg-[#2a303b]"
      } ${className}`}
    >
      <Icon size={16} strokeWidth={1.9} />
    </button>
  );
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label
      className={`studio-select-field relative flex h-8 items-center overflow-hidden rounded-[8px] border border-white/[0.07] bg-[#181b21] text-[12px] transition hover:border-white/[0.14] focus-within:border-[#1687f7] ${className}`}
    >
      <span className="pointer-events-none absolute left-3 z-10 text-zinc-300">{label}</span>
      <select
        aria-label={label}
        {...props}
        className="h-full w-full appearance-none bg-transparent pl-[120px] pr-8 text-right text-zinc-100 outline-none"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 text-zinc-400" size={14} />
    </label>
  );
}

export function SectionTitle({
  children,
  action,
  className = "",
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`studio-section-header mb-2.5 flex items-center justify-between ${className}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-400">{children}</h2>
      {action}
    </div>
  );
}

export function StudioModeNav({
  activeStudio,
  onStudioModeChange,
}: {
  activeStudio: "modeling" | "floor-plan" | "infrastructure";
  onStudioModeChange?: (mode: StudioMode) => void;
}) {
  return (
    <nav className="studio-mode-switcher" aria-label="Switch Casynus studio">
      {onStudioModeChange ? (
        <button
          type="button"
          aria-pressed={activeStudio === "modeling"}
          onClick={() => onStudioModeChange("modeling")}
          title="3D Modeling Studio (/casynus)"
          className={`studio-mode-pill ${activeStudio === "modeling" ? "is-active" : ""}`}
        >
          <Box size={13} />
          <span>3D Studio</span>
        </button>
      ) : (
        <Link
          href="/casynus"
          title="3D Modeling Studio (/casynus)"
          className={`studio-mode-pill ${activeStudio === "modeling" ? "is-active" : ""}`}
        >
          <Box size={13} />
          <span>3D Studio</span>
        </Link>
      )}

      {onStudioModeChange ? (
        <button
          type="button"
          aria-pressed={activeStudio === "floor-plan"}
          onClick={() => onStudioModeChange("floor-plan")}
          title="2D Floor Plan Studio (/casynus?mode=floor-plan)"
          className={`studio-mode-pill ${activeStudio === "floor-plan" ? "is-active" : ""}`}
        >
          <Layers3 size={13} />
          <span>Floor Plan</span>
        </button>
      ) : (
        <Link
          href="/casynus?mode=floor-plan"
          title="2D Floor Plan Studio (/casynus?mode=floor-plan)"
          className={`studio-mode-pill ${activeStudio === "floor-plan" ? "is-active" : ""}`}
        >
          <Layers3 size={13} />
          <span>Floor Plan</span>
        </Link>
      )}

      <Link
        href="/infrastructure"
        title="Infrastructure Studio (/infrastructure)"
        aria-current={activeStudio === "infrastructure" ? "page" : undefined}
        className={`studio-mode-pill ${activeStudio === "infrastructure" ? "is-active" : ""}`}
      >
        <Compass size={13} />
        <span>Infra</span>
      </Link>
    </nav>
  );
}
