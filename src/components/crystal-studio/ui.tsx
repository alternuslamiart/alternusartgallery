"use client";

import { Box, ChevronDown, Compass, Layers3, PanelRightClose, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode, SelectHTMLAttributes } from "react";
import type { StudioMode } from "./types";
import { SegmentedControl, StudioButton } from "./kit";

type ToolIcon = ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;

export function IconButton({ icon: Icon, label, active, disabled, onClick, className = "" }: {
  icon: ToolIcon; label: string; active?: boolean; disabled?: boolean; onClick?: () => void; className?: string;
}) {
  return <StudioButton size="icon" variant="ghost" active={active} disabled={disabled} onClick={onClick}
    aria-label={label} title={label} className={`studio-icon-btn ref-toolbar-icon-btn ${className}`}><Icon size={16} strokeWidth={1.8} /></StudioButton>;
}

export function SelectField({ label, className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className={`studio-select-field cs-select-field ${className}`}>
    <span>{label}</span><select {...props} aria-label={label}>{children}</select><ChevronDown size={14} aria-hidden="true" />
  </label>;
}

export function SectionTitle({ children, action, className = "" }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return <div className={`studio-section-header cs-section-heading ${className}`}><h2>{children}</h2>{action}</div>;
}

export function StudioModeNav({ activeStudio, onStudioModeChange }: {
  activeStudio: "modeling" | "floor-plan" | "infrastructure"; onStudioModeChange?: (mode: StudioMode) => void;
}) {
  const modes = [
    { id: "modeling", name: "3D Studio", href: "/casynus", icon: Box },
    { id: "floor-plan", name: "Interior", href: "/interior", icon: Layers3 },
    { id: "infrastructure", name: "Infra", href: "/infrastructure", icon: Compass },
  ] as const;
  return <nav className="studio-mode-switcher" aria-label="Switch Casynus studio">
    {modes.map(({ id, name, href, icon: Icon }) => onStudioModeChange && id !== "infrastructure"
      ? <button type="button" key={id} aria-pressed={activeStudio === id} onClick={() => onStudioModeChange(id)} title={name}
          className={`studio-mode-pill ${activeStudio === id ? "is-active" : ""}`}><Icon size={14} /><span>{name}</span></button>
      : <Link key={id} href={href} title={name} aria-current={activeStudio === id ? "page" : undefined}
          className={`studio-mode-pill ${activeStudio === id ? "is-active" : ""}`}><Icon size={14} /><span>{name}</span></Link>)}
  </nav>;
}

export function BinaryToggle({ label, value, onChange, onLabel, offLabel, trueLabel, falseLabel, leadingAction }: {
  label?: string; value: boolean; onChange: (next: boolean) => void; onLabel?: string; offLabel?: string; trueLabel?: string; falseLabel?: string; leadingAction?: ReactNode;
}) {
  const control = <SegmentedControl label={label ?? "Setting"} value={String(value)} onChange={next => onChange(next === "true")}
    options={[{ value: "true", label: trueLabel ?? onLabel ?? "Yes" }, { value: "false", label: falseLabel ?? offLabel ?? "No" }]} />;
  return label ? <div className="ref-prop-row ref-setting-row" role="group" aria-label={label}>
    <span className="ref-prop-label ref-setting-label">{label}</span><div className="ref-prop-control-group flex items-center gap-1.5">{leadingAction}{control}</div>
  </div> : control;
}

export function InspectorCollaboratorBar({ onInvite, onAction, actionLabel = "Copy link", onCollapse }: {
  onInvite?: () => void; onAction?: () => void; actionLabel?: string; onCollapse?: () => void;
}) {
  return <div className="ref-collab-header cs-inspector-header">
    <span className="cs-inspector-title"><SlidersHorizontal size={15} />Properties</span>
    <div className="flex items-center gap-1">
      <StudioButton size="sm" variant="ghost" onClick={() => {
        if (onInvite) onInvite(); else if (onAction) onAction(); else void navigator.clipboard?.writeText(window.location.href);
      }} title={actionLabel}>{actionLabel}</StudioButton>
      {onCollapse && <StudioButton size="icon" variant="ghost" onClick={onCollapse} aria-label="Collapse inspector" title="Collapse inspector"><PanelRightClose size={15} /></StudioButton>}
    </div>
  </div>;
}
