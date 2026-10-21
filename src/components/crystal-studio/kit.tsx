"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { ArrowLeft, ChevronDown, LoaderCircle, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { CrystalThemeToggle } from "./CrystalThemeToggle";

export const StudioButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "primary" | "danger";
  size?: "sm" | "md" | "icon";
  active?: boolean;
  loading?: boolean;
}>(({ className = "", variant = "default", size = "md", active, loading, disabled, children, ...props }, ref) => (
  <button ref={ref} type="button" {...props} aria-pressed={active} aria-busy={loading || undefined}
    disabled={disabled || loading} data-variant={variant} data-size={size}
    className={`cs-button ${active ? "is-active" : ""} ${className}`}>
    {loading && <LoaderCircle size={14} className="cs-spin" aria-hidden="true" />}{children}
  </button>
));
StudioButton.displayName = "StudioButton";

export function StudioPanel({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <aside {...props} className={`cs-panel ${className}`} />;
}

export function StudioHeader({ title, onBack, backHref, onCollapse, actions }: {
  title: string; onBack?: () => void; backHref?: string; onCollapse?: () => void; actions?: ReactNode;
}) {
  return <header className="cs-header">
    {backHref ? <Link href={backHref} className="cs-button" data-size="icon" data-variant="ghost" aria-label="Back to projects" title="Back to projects"><ArrowLeft size={20} /></Link>
      : <StudioButton size="icon" variant="ghost" onClick={onBack} aria-label="Back to projects" title="Back to projects"><ArrowLeft size={20} /></StudioButton>}
    <span className="cs-header-title" title={title}>{title}</span>
    {actions}
    <CrystalThemeToggle />
    {onCollapse && <StudioButton size="icon" variant="ghost" onClick={onCollapse} aria-label="Collapse panel" title="Collapse panel"><PanelLeftClose size={20} /></StudioButton>}
  </header>;
}

export function StudioToolbar({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} role="toolbar" className={`cs-toolbar ${className}`} onKeyDown={event => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled), a[href]'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0 || !items.length) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  }}>{children}</div>;
}

export function ToolbarGroup({ children, label }: { children: ReactNode; label: string }) {
  return <div className="cs-toolbar-group" role="group" aria-label={label}>{children}</div>;
}

export function InspectorSection({ title, children, defaultOpen = true }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  return <details className="cs-inspector-section" open={defaultOpen}>
    <summary><span>{title}</span><ChevronDown size={14} /></summary><div className="cs-section-content">{children}</div>
  </details>;
}

export function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="cs-property-row"><span>{label}</span><div>{children}</div></div>;
}

export function NumberInput({ label, value, onValueChange, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & { label: string; value: number; onValueChange: (value: number) => void }) {
  return <label className="cs-number-field"><span>{label}</span><input {...props} type="number" aria-label={label} value={Number.isFinite(value) ? Number(value.toFixed(3)) : 0} onChange={event => {
    const next = event.currentTarget.valueAsNumber;
    if (Number.isFinite(next)) onValueChange(next);
  }} /></label>;
}

export function SegmentedControl({ label, options, value, onChange }: { label: string; options: Array<{value: string; label: string}>; value: string; onChange: (value: string) => void }) {
  return <div className="cs-segmented" role="group" aria-label={label}>
    {options.map(option => <StudioButton key={option.value} variant="ghost" size="sm" active={value === option.value} onClick={() => onChange(option.value)}>{option.label}</StudioButton>)}
  </div>;
}

export function StudioBadge({ children }: { children: ReactNode }) { return <span className="cs-badge">{children}</span>; }
