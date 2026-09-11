"use client";

import Link from "next/link";
import { Bell, Box, ChevronDown, Redo2, Route, Ruler, Share2, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

const studios = [
  { label: "Floor Plan", href: "/crystal", icon: Ruler },
  { label: "Modeling", href: "/3d-studio", icon: Box },
  { label: "Infrastructure", href: "/infrastructure", icon: Route },
];

export function CrystalStudioShell({ studio, left, children, right, dock }: { studio: string; left: ReactNode; children: ReactNode; right: ReactNode; dock?: ReactNode }) {
  return <main className="crystal-workspace-v2">
    <header className="crystal-topbar-v2">
      <div className="crystal-brand-v2"><img src="/Logopng.png" alt="Crystal" /><strong>Crystal</strong><span /><b>{studio} Studio <small>/ Untitled project</small></b></div>
      <nav aria-label="Crystal Studios">{studios.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={studio === label ? "is-active" : ""}><Icon size={14} />{label}</Link>)}</nav>
      <div className="crystal-top-actions-v2"><em><i />Saved locally</em><button aria-label="Undo"><Undo2 size={15} /></button><button aria-label="Redo"><Redo2 size={15} /></button><button aria-label="Share"><Share2 size={15} /></button><button aria-label="Notifications"><Bell size={15} /></button><button className="crystal-avatar-v2">B <ChevronDown size={12} /></button></div>
    </header>
    <div className="crystal-workspace-body-v2"><aside>{left}</aside><section className="crystal-workspace-viewport-v2">{children}{dock && <div className="crystal-dock-v2">{dock}</div>}</section><aside>{right}</aside></div>
  </main>;
}
