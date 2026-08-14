"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

export function IconButton({ icon: Icon, label, active, onClick, className = "" }: { icon: LucideIcon; label: string; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border transition ${active ? "border-[#1687f7] bg-[#1687f7] text-white" : "border-transparent bg-transparent text-zinc-200 hover:bg-[#343434]"} ${className}`}>
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}

export function SelectField({ label, className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={`relative flex h-8 items-center overflow-hidden rounded-full bg-[#2b2b2b] text-[12px] ${className}`}>
      <span className="pointer-events-none absolute left-4 z-10 text-zinc-100">{label}</span>
      <select aria-label={label} {...props} className="h-full w-full appearance-none bg-transparent pl-[140px] pr-9 text-right text-zinc-100 outline-none">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 text-zinc-400" size={16} />
    </label>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="mb-3 flex items-center justify-between"><h2 className="text-[14px] font-semibold text-zinc-100">{children}</h2>{action}</div>;
}
