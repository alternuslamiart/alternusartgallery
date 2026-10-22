"use client";
import {CircleUserRound,Settings} from "lucide-react";
import {StudioButton} from "./kit";

export function StudioSidebarFooter({onSettings,onProfile}:{onSettings:()=>void;onProfile:()=>void}) {
  return <footer className="cs-sidebar-footer" aria-label="Studio settings and profile">
    <StudioButton size="icon" variant="ghost" aria-label="Studio settings" title="Studio settings" onClick={onSettings}><Settings size={21}/></StudioButton>
    <StudioButton size="icon" variant="ghost" aria-label="Your profile" title="Your profile" onClick={onProfile}><CircleUserRound size={21}/></StudioButton>
  </footer>;
}
