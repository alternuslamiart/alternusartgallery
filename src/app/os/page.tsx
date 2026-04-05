"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Desktop Operating System
// Fixed viewport, windowed apps, no scrolling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";
type WinId = "ai" | "terminal" | "code" | "files" | "settings" | "music" | "weather" | "calendar" | "notes" | "browser" | "store" | "movies" | "word" | "clock" | "calculator" | "accounts" | "downloads";

interface WinState {
  id: WinId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isFrozen?: boolean;
}

type BootPhase = "bios" | "hardware" | "kernel" | "services" | "desktop" | "done";
type SystemModal = { type: "error" | "warning" | "info"; title: string; message: string } | null;

interface AINotification {
  id: string;
  title: string;
  message: string;
  icon: string;
  time: string;
  type: "security" | "suggestion" | "cleanup" | "summary" | "system";
  actions?: { label: string; handler: string }[];
  read?: boolean;
}

interface TimelineEvent {
  time: string;
  action: string;
  app: string;
  icon: string;
}

// ━━━━ AI Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const aiWorkspaceRules: Record<string, WinId[]> = {
  code: ["terminal", "browser"],
  word: ["browser", "notes"],
  terminal: ["code", "files"],
  browser: ["notes"],
};

const aiContextualApps: Record<string, { combo: WinId[]; suggest: WinId; label: string }[]> = {
  snap: [
    { combo: ["word", "browser"], suggest: "ai", label: "Open AI Assistant for research?" },
    { combo: ["code", "terminal"], suggest: "browser", label: "Open docs browser?" },
    { combo: ["notes", "browser"], suggest: "word", label: "Open Word for formal writing?" },
    { combo: ["code", "browser"], suggest: "terminal", label: "Open Terminal for testing?" },
  ],
};

const aiFileIndex = [
  { name: "Budget Report Q1.docx", path: "Documents", content: "budget expenses quarterly revenue financial analysis may june", tags: ["finance", "report"] },
  { name: "Project Proposal.docx", path: "Documents", content: "project proposal timeline milestones deliverables team allocation", tags: ["project", "proposal"] },
  { name: "Meeting Notes.md", path: "Documents", content: "meeting discussion decisions action items follow up team sync", tags: ["meeting", "notes"] },
  { name: "Invoice_March.pdf", path: "Documents", content: "invoice payment amount due billing march services rendered", tags: ["finance", "invoice"] },
  { name: "Contract_2025.pdf", path: "Documents", content: "contract agreement terms conditions parties obligations legal binding", tags: ["legal", "contract"] },
  { name: "Design System.fig", path: "Projects", content: "design system components colors typography spacing layout grid", tags: ["design", "ui"] },
  { name: "API Documentation.md", path: "Projects", content: "api endpoints authentication requests responses status codes", tags: ["dev", "api"] },
  { name: "Personal Notes.txt", path: "Documents", content: "personal ideas thoughts reminders goals new year resolution", tags: ["personal"] },
  { name: "Invoice_April.pdf", path: "Documents", content: "invoice payment billing april consulting hours rate total", tags: ["finance", "invoice"] },
  { name: "NDA_Agreement.pdf", path: "Documents", content: "non disclosure agreement confidential information parties nda", tags: ["legal", "contract"] },
];

// ━━━━ Colors ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const palette = {
  dark: {
    bg: "#242424",
    surface: "#2C2C2C",
    card: "#2C2C2C",
    cardAlt: "#333333",
    border: "#3A3A3A",
    text: "#F1F5F9",
    textSec: "#A0A0A0",
    textMuted: "#707070",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.15)",
    accentText: "#60A5FA",
    success: "#34D399",
    successSoft: "rgba(52,211,153,0.15)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.15)",
    danger: "#F87171",
    purple: "#A78BFA",
    purpleSoft: "rgba(167,139,250,0.15)",
    titlebar: "#2C2C2C",
    titlebarBorder: "#3A3A3A",
  },
  light: {
    bg: "#F2F2F4",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardAlt: "#EDEDF0",
    border: "#DDDDE0",
    text: "#1A1A1A",
    textSec: "#555555",
    textMuted: "#888888",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.12)",
    accentText: "#2563EB",
    success: "#10B981",
    successSoft: "rgba(16,185,129,0.12)",
    warning: "#F59E0B",
    warningSoft: "rgba(245,158,11,0.12)",
    danger: "#EF4444",
    purple: "#8B5CF6",
    purpleSoft: "rgba(139,92,246,0.12)",
    titlebar: "#F0F0F2",
    titlebarBorder: "#D4D4D8",
  },
};

// ━━━━ Simple SVG Icon ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function I({ d, s = 16, c, w, f }: { d: string; s?: number; c?: string; w?: number; f?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={f ? (c || "currentColor") : "none"} stroke={f ? "none" : (c || "currentColor")} strokeWidth={f ? 0 : (w || 2)} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  sparkle: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  music: "M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z",
  cloud: "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  calendar: "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  note: "M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8zM15 3v4a2 2 0 002 2h4",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  moon: "M12 3a6 6 0 009 9 9 9 0 11-9-9z",
  wifi: "M5 13a10 10 0 0114 0M8.5 16.5a5 5 0 017 0M2 8.82a15 15 0 0120 0M12 20h.01",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  chevR: "M9 18l6-6-6-6",
  chevL: "M15 18l-6-6 6-6",
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6zM14 4h4v16h-4z",
  skip: "M5 4l10 8-10 8V4zM19 5v14",
  minimize: "M5 12h14",
  maximize: "M3 3h18v18H3z",
  close: "M18 6L6 18M6 6l12 12",
  search: "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3",
  power: "M12 2v10M16.24 7.76a6 6 0 11-8.49 0",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  store: "M3 3h18l-2 13H5L3 3zM16 16a2 2 0 100 4 2 2 0 000-4zM9 16a2 2 0 100 4 2 2 0 000-4z",
  film: "M2 2h20v20H2zM7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5",
  fileText: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  type: "M4 7V4h16v3M9 20h6M12 4v16",
  pen: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  plus: "M12 5v14M5 12h14",
  alignLeft: "M17 10H3M21 6H3M21 14H3M17 18H3",
  alignCenter: "M18 10H6M21 6H3M21 14H3M18 18H6",
  alignRight: "M21 10H7M21 6H3M21 14H3M21 18H7",
  alignJustify: "M21 10H3M21 6H3M21 14H3M21 18H3",
  bluetooth: "M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11",
  mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2",
  monitor: "M2 3h20v14H2zM8 21h8M12 17v4",
  mouse: "M12 2a5 5 0 00-5 5v10a5 5 0 0010 0V7a5 5 0 00-5-5zM12 2v6",
  volume: "M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07",
  alertTriangle: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  battery: "M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2zM23 13v-2",
  cpu: "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  hdd: "M22 12H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11zM6 16h.01M10 16h.01",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-6 0h6",
  clock: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2",
  calc: "M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zM8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01M8 6h8",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  menu: "M3 12h18M3 6h18M3 18h18",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
  voice: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  // Filled icon variants
  globeF: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  codeF: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  terminalF: "M4 17l6-6-6-6M12 19h8",
  cloudF: "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  calendarF: "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  storeF: "M3 3h18l-2 13H5L3 3zM16 16a2 2 0 100 4 2 2 0 000-4zM9 16a2 2 0 100 4 2 2 0 000-4z",
  filmF: "M2 2h20v20H2zM7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5",
  bellF: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  settingsF: "M12 8a4 4 0 100 8 4 4 0 000-8zM12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  wifiF: "M12 20h.01M8.5 16.5a5 5 0 017 0M5 13a10 10 0 0114 0M2 8.82a15 15 0 0120 0",
  batteryF: "M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2zM23 13v-2M7 10v4M10 10v4M13 10v4",
  moonF: "M12 3a6 6 0 009 9 9 9 0 11-9-9z",
  sunF: "M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  image: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21",
};

// ━━━━ Window Title Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TitleBar({
  title,
  c,
  onClose,
  onMinimize,
  onMaximize,
  onMouseDown,
  isFrozen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onForceQuit,
}: {
  title: string;
  c: typeof palette.dark;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  isFrozen?: boolean;
  onForceQuit?: () => void;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="flex items-center justify-between h-9 px-3 select-none cursor-move flex-shrink-0"
      style={{ background: c.titlebar, borderBottom: `1px solid ${c.titlebarBorder}` }}
    >
      <span style={{ color: isFrozen ? c.warning : c.textSec }} className="text-xs font-medium">
        {title}{isFrozen ? " (Not Responding)" : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMinimize}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          onMouseEnter={e => { e.currentTarget.style.background = "#4ADE80"; const s = e.currentTarget.querySelector("circle"); if (s) s.setAttribute("stroke", "#fff"); }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; const s = e.currentTarget.querySelector("circle"); if (s) s.setAttribute("stroke", c.textMuted); }}
        >
          <svg width={10} height={10} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke={c.textMuted} strokeWidth="1.5" /></svg>
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMaximize}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          onMouseEnter={e => { e.currentTarget.style.background = "#5BA3E6"; const s = e.currentTarget.querySelector("rect"); if (s) s.setAttribute("stroke", "#fff"); }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; const s = e.currentTarget.querySelector("rect"); if (s) s.setAttribute("stroke", c.textMuted); }}
        >
          <svg width={10} height={10} viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" rx="1.5" fill="none" stroke={c.textMuted} strokeWidth="1.5" /></svg>
        </button>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          onMouseEnter={e => { e.currentTarget.style.background = "#F87171"; const s = e.currentTarget.querySelector("polygon"); if (s) s.setAttribute("stroke", "#fff"); }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; const s = e.currentTarget.querySelector("polygon"); if (s) s.setAttribute("stroke", c.textMuted); }}
        >
          <svg width={10} height={10} viewBox="0 0 10 10"><polygon points="5,1.5 9,8.5 1,8.5" fill="none" stroke={c.textMuted} strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

// ━━━━ Draggable/Resizable Window ━━━━━━━━━━━━━━━━━━━━━━━━
function AppWindow({
  win,
  c,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  onSnap,
  onForceQuit,
}: {
  win: WinState;
  c: typeof palette.dark;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize?: (w: number, h: number) => void;
  onSnap?: (side: "left" | "right") => void;
  onForceQuit?: () => void;
}) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    dragging.current = true;
    offset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    onFocus();

    const move = (ev: MouseEvent) => {
      if (dragging.current) {
        onMove(ev.clientX - offset.current.x, ev.clientY - offset.current.y);
      }
    };
    const up = (ev: MouseEvent) => {
      dragging.current = false;
      // Snap to edges
      if (onSnap) {
        if (ev.clientX <= 5) onSnap("left");
        else if (ev.clientX >= window.innerWidth - 5) onSnap("right");
      }
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.w;
    const startH = win.h;
    const startPosX = win.x;
    const startPosY = win.y;

    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newW = startW, newH = startH, newX = startPosX, newY = startPosY;
      if (corner.includes("r")) newW = Math.max(280, startW + dx);
      if (corner.includes("b")) newH = Math.max(200, startH + dy);
      if (corner.includes("l")) { newW = Math.max(280, startW - dx); newX = startPosX + dx; }
      if (corner.includes("t")) { newH = Math.max(200, startH - dy); newY = startPosY + dy; }
      if (onResize) onResize(newW, newH);
      if (corner.includes("l") || corner.includes("t")) onMove(newX, newY);
    };
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  if (!win.isOpen || win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: win.zIndex }
    : { position: "absolute", top: win.y, left: win.x, width: win.w, height: win.h, zIndex: win.zIndex };

  return (
    <div
      style={{
        ...style,
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: win.isMaximized ? 0 : 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={onFocus}
    >
      <TitleBar
        title={win.title}
        c={c}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onMouseDown={handleMouseDown}
        isFrozen={win.isFrozen}
        onForceQuit={onForceQuit}
      />
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
        {/* Frozen overlay */}
        {win.isFrozen && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 999 }}>
            <div className="text-center p-6 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <I d={ic.alertTriangle} s={32} c={c.warning} />
              <p className="text-sm font-medium mt-3" style={{ color: c.text }}>Application Not Responding</p>
              <p className="text-xs mt-1 mb-4" style={{ color: c.textMuted }}>{win.title} has stopped responding</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { if (onForceQuit) onForceQuit(); }} className="px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: c.danger, color: "#fff" }}>Force Quit</button>
                <button className="px-4 py-1.5 rounded-lg text-xs" style={{ background: c.cardAlt, color: c.text }}>Wait</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Resize handles */}
      {!win.isMaximized && (
        <>
          <div onMouseDown={e => handleResizeMouseDown(e, "r")} className="absolute top-2 right-0 bottom-2 w-1.5 cursor-ew-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "b")} className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "l")} className="absolute top-2 left-0 bottom-2 w-1.5 cursor-ew-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "br")} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "bl")} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "tr")} className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize" />
          <div onMouseDown={e => handleResizeMouseDown(e, "tl")} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize" />
        </>
      )}
    </div>
  );
}

// ━━━━ Universal AI Panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AIPanel({ c, context, onAction }: { c: typeof palette.dark; context: string; onAction?: (cmd: string) => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: `AI ready for ${context}. How can I help?` },
  ]);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setTimeout(() => {
      let r = `I'll help with that in ${context}.`;
      const l = q.toLowerCase();
      if (l.includes("help")) r = `In ${context}, I can:\n• Automate tasks\n• Search & organize\n• Generate content\n• Answer questions\n• Voice commands`;
      else if (l.includes("organize") || l.includes("sort")) r = "Done! I've organized everything by date and category.";
      else if (l.includes("find") || l.includes("search")) r = `Searching ${context}... Found 3 relevant results.`;
      else if (l.includes("create") || l.includes("new")) r = "Created! The new item is ready.";
      else if (l.includes("delete") || l.includes("remove")) r = "Removed. You can undo this in the next 30 seconds.";
      else if (l.includes("explain")) r = `This ${context} section manages your data and preferences. Everything is synced with Alternus Cloud.`;
      if (onAction) onAction(q);
      setMsgs(p => [...p, { role: "ai", text: r }]);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: `1px solid ${c.border}`, background: c.bg }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#3B82F6" }}>
          <I d={ic.sparkle} s={10} c="#fff" />
        </div>
        <span className="text-[10px] font-bold flex-1" style={{ color: c.text }}>AI</span>
        <button onClick={() => { setListening(!listening); if (!listening) setTimeout(() => { send("help"); setListening(false); }, 1500); }}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ background: listening ? "#EF444420" : "transparent", color: listening ? "#EF4444" : c.textMuted }}
          title="Voice">
          <I d={ic.voice} s={12} />
          {listening && <span className="absolute w-6 h-6 rounded-full animate-ping opacity-30" style={{ background: "#EF4444" }} />}
        </button>
      </div>
      {/* Quick chips */}
      <div className="flex flex-wrap gap-1 px-2 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {["Organize", "Search", "Create", "Help"].map(chip => (
          <button key={chip} onClick={() => send(chip.toLowerCase())}
            className="px-2 py-0.5 rounded-full text-[8px] font-medium transition-colors"
            style={{ background: c.cardAlt, color: c.textSec }}
            onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.textSec; }}>
            {chip}
          </button>
        ))}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5" style={{ scrollbarWidth: "none" }}>
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className="max-w-[92%] px-2.5 py-1.5 rounded-xl text-[9px] leading-relaxed"
              style={m.role === "user" ? { background: c.accent, color: "#fff" } : { background: c.cardAlt, color: c.text }}>
              <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {/* Input */}
      <div className="px-2 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          <input className="flex-1 bg-transparent outline-none text-[9px]" style={{ color: c.text }}
            placeholder="Ask AI..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }} />
          <button onClick={() => send()} className="p-1 rounded-lg" style={{ background: c.accent }}><I d={ic.send} s={8} c="#fff" /></button>
        </div>
      </div>
    </div>
  );
}

// ━━━━ App Contents ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AIChat({ c, onOpenApp }: { c: typeof palette.dark; onOpenApp?: (id: WinId) => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Welcome to Alternus OS. I'm your AI assistant. Ask me to create apps, write code, or design anything." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const m = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);
    setTimeout(() => {
      let r = "I understand. Let me work on that for you.";
      const l = m.toLowerCase();
      if (l.includes("create") || l.includes("build")) r = "I can build that. Let me generate the code. Which framework: React, Python, or something else?";
      else if (l.includes("code") || l.includes("function")) r = "Here's an approach:\n\n```js\nfunction solve(data) {\n  return data.map(process);\n}\n```\n\nShall I expand this?";
      else if (l.includes("hello") || l.includes("hi")) r = "Hello! I'm Alternus AI. What would you like to build today?";
      else if (l.includes("illustrat") || l.includes("draw") || l.includes("design") || l.includes("sketch")) r = "I can help with design! Describe what you'd like to create and I'll generate a concept or open the design tools.";
      else if (l.includes("video") || l.includes("edit video") || l.includes("clip")) r = "I can help with video editing. Describe the video you want to create or edit.";
      else if (l.includes("image") || l.includes("photo") || l.includes("picture")) r = "I can help with images. Describe the image you want or I can edit an existing one.";
      else if (l.includes("search") || l.includes("find") || l.includes("google")) r = "I'll search for that. What exactly would you like to find?";
      else if (l.includes("classify") || l.includes("organize") || l.includes("sort")) r = "AI Classification complete:\n\n📁 Documents → 12 files\n📁 Media → 8 files\n📁 Code → 6 files\n📁 Archives → 4 files\n\nAll files tagged and sorted.";
      else if (l.includes("file") || l.includes("document")) r = "I can help manage your files. Want me to classify, find duplicates, or clean up?";
      setMsgs(p => [...p, { role: "ai", text: r }]);
    }, 600);
  };

  const sideTools = [
    { icon: ic.settings, label: "Settings", action: "settings" as WinId },
    { icon: ic.user, label: "Profile", action: "settings" as WinId },
    { icon: ic.pen, label: "Illustrate", action: null },
    { icon: ic.film, label: "Video", action: null },
    { icon: ic.image, label: "Image", action: null },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar tools */}
      <div className="w-[40px] flex-shrink-0 flex flex-col items-center py-2 gap-0.5" style={{ borderRight: `1px solid ${c.border}` }}>
        {sideTools.map((tool, i) => (
          <button key={i} onClick={() => {
            if (tool.action && onOpenApp) onOpenApp(tool.action);
            else { setMsgs(p => [...p, { role: "user", text: tool.label }, { role: "ai", text: `${tool.label} mode activated. Describe what you'd like to create.` }]); }
          }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: c.textMuted }}
            title={tool.label}
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.accentText; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={tool.icon} s={14} />
          </button>
        ))}
        <div className="flex-1" />
        {/* Search web button */}
        <button onClick={() => { if (onOpenApp) onOpenApp("browser"); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: c.accentSoft, color: c.accentText }}
          title="Search Web"
          onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = c.accentSoft; e.currentTarget.style.color = c.accentText; }}>
          <I d={ic.globe} s={14} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                style={m.role === "user" ? { background: c.accent, color: "#fff" } : { background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }}
              >
                <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {/* Input bar */}
        <div className="px-3 py-2" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: c.text }}
              placeholder="Ask AI anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            {/* Attach file */}
            <button onClick={() => { if (onOpenApp) onOpenApp("files"); }}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: c.textMuted }}
              title="Attach file"
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = c.textMuted)}>
              <I d={ic.fileText} s={14} />
            </button>
            <button onClick={send} className="p-1.5 rounded-lg" style={{ background: c.accent }}>
              <I d={ic.send} s={14} c="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TerminalApp({ c }: { c: typeof palette.dark }) {
  const [tabs, setTabs] = useState([{ id: 0, name: "bash", lines: ["Welcome to Alternus OS Terminal v2.0", "AI-powered shell · Type 'help' for commands", ""] }]);
  const [activeTab, setActiveTab] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lines = tabs.find(t => t.id === activeTab)?.lines || [];
  const linesLen = lines.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [linesLen]);

  const addTab = () => {
    const id = Date.now();
    setTabs(p => [...p, { id, name: "bash", lines: ["New terminal session", ""] }]);
    setActiveTab(id);
  };
  const closeTab = (id: number) => {
    const t = tabs.filter(t => t.id !== id);
    setTabs(t.length ? t : [{ id: 0, name: "bash", lines: [""] }]);
    if (activeTab === id) setActiveTab(t[0]?.id || 0);
  };

  const pushLines = (newLines: string[]) => {
    setTabs(p => p.map(t => t.id === activeTab ? { ...t, lines: [...t.lines, ...newLines] } : t));
  };

  const exec = () => {
    const cmd = input.trim();
    setInput("");
    if (!cmd) { pushLines([`\x1b[32madmin@alternus\x1b[0m:\x1b[34m${cwd}\x1b[0m$ `]); return; }
    setHistory(p => [...p, cmd]);
    setHistIdx(-1);
    const prompt = `admin@alternus:${cwd}$ ${cmd}`;
    const output = [prompt];
    const l = cmd.toLowerCase();
    const args = cmd.split(" ").slice(1).join(" ");

    if (l === "help") output.push("Built-in commands:\n  help       Show this message\n  clear      Clear terminal\n  date       Current date/time\n  whoami     Current user\n  hostname   System hostname\n  pwd        Print working directory\n  ls         List files\n  cd <dir>   Change directory\n  cat <file> View file contents\n  echo <txt> Print text\n  mkdir <n>  Create directory\n  touch <n>  Create file\n  rm <file>  Remove file\n  grep <pat> Search text\n  neofetch   System info\n  uptime     System uptime\n  ping <h>   Ping host\n  curl <url> Fetch URL\n  npm <cmd>  Package manager\n  git <cmd>  Version control\n  python     Python REPL\n  node       Node.js REPL\n  ai <query> Ask AI assistant");
    else if (l === "clear") { setTabs(p => p.map(t => t.id === activeTab ? { ...t, lines: [] } : t)); return; }
    else if (l === "date") output.push(new Date().toString());
    else if (l === "whoami") output.push("admin");
    else if (l === "hostname") output.push("alternus-os");
    else if (l === "pwd") output.push(`/home/admin${cwd === "~" ? "" : cwd.replace("~", "")}`);
    else if (l === "uptime") output.push(`up ${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 59)}m, 1 user, load average: 0.${Math.floor(Math.random() * 99)}`);
    else if (l === "ls" || l === "ls -la") output.push(cwd === "~" ? "Documents/  Projects/  Downloads/  Desktop/  Pictures/  .config/  .ssh/" : ".");
    else if (l.startsWith("cd ")) { const d = args || "~"; setCwd(d === ".." ? "~" : d === "~" ? "~" : `~/${d}`); }
    else if (l.startsWith("cat ")) output.push(`Contents of ${args}:\n[file contents would appear here]`);
    else if (l.startsWith("echo ")) output.push(args);
    else if (l.startsWith("mkdir ")) output.push(`Created directory: ${args}`);
    else if (l.startsWith("touch ")) output.push(`Created file: ${args}`);
    else if (l.startsWith("rm ")) output.push(`Removed: ${args}`);
    else if (l.startsWith("grep ")) output.push(`Searching for "${args}"...\nNo matches found.`);
    else if (l === "neofetch") output.push(`  ╭─────────╮\n  │ Alternus │   admin@alternus-os\n  │   OS     │   OS: Alternus OS v2.0\n  ╰─────────╯   Kernel: AlternusCore 6.2\n                Shell: atsh 2.0\n                Resolution: ${window.innerWidth}x${window.innerHeight}\n                Theme: ${c === palette.dark ? "Dark" : "Light"}\n                CPU: AlternusCPU 12-Core\n                Memory: 16 GB DDR5\n                GPU: AlternusGPU Pro\n                Uptime: ${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 59)}m`);
    else if (l.startsWith("ping ")) { output.push(`PING ${args} (${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1):`); for (let i = 0; i < 3; i++) output.push(`  64 bytes: time=${Math.floor(Math.random()*50)+5}ms`); output.push(`3 packets, 0% loss, avg ${Math.floor(Math.random()*30)+10}ms`); }
    else if (l.startsWith("curl ")) output.push(`Fetching ${args}...\nHTTP/1.1 200 OK\nContent-Type: text/html\n[Response body]`);
    else if (l.startsWith("npm ")) output.push(l.includes("install") ? `Installing packages...\nadded ${Math.floor(Math.random()*200)+50} packages in ${Math.floor(Math.random()*5)+1}s` : l.includes("run") ? `> Running script...\n✓ Done` : `npm v10.0.0`);
    else if (l.startsWith("git ")) output.push(l.includes("status") ? "On branch main\nnothing to commit, working tree clean" : l.includes("log") ? `commit abc${Math.floor(Math.random()*9999)} (HEAD -> main)\nAuthor: Admin\nDate: ${new Date().toLocaleDateString()}\n\n  Latest commit` : `git version 2.42.0`);
    else if (l === "python" || l === "python3") output.push("Python 3.12.0 (Alternus)\n>>> Use Ctrl+C to exit");
    else if (l === "node") output.push("Node.js v22.0.0 (Alternus)\n> Use Ctrl+C to exit");
    else if (l.startsWith("ai ")) { output.push(`AI: Processing "${args}"...`); setTimeout(() => pushLines([`AI: I'd suggest using a modular approach. Would you like me to generate code for that?`]), 500); }
    else output.push(`bash: ${cmd.split(" ")[0]}: command not found\nTry 'help' for available commands`);
    pushLines(output);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") exec();
    else if (e.key === "ArrowUp" && history.length) {
      const idx = histIdx < history.length - 1 ? histIdx + 1 : histIdx;
      setHistIdx(idx);
      setInput(history[history.length - 1 - idx]);
    } else if (e.key === "ArrowDown") {
      if (histIdx > 0) { setHistIdx(histIdx - 1); setInput(history[history.length - histIdx]); }
      else { setHistIdx(-1); setInput(""); }
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setTabs(p => p.map(t => t.id === activeTab ? { ...t, lines: [] } : t)); }
    else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); pushLines([`admin@alternus:${cwd}$ ${input}^C`]); setInput(""); }
  };

  return (
    <div className="flex flex-col h-full font-mono" style={{ background: "#0A0A0C" }} onClick={() => inputRef.current?.focus()}>
      {/* Tab bar */}
      <div className="flex items-center flex-shrink-0" style={{ background: "#101014", borderBottom: "1px solid #2A2A35" }}>
        {tabs.map(t => (
          <div key={t.id} className="flex items-center group"
            style={{ background: t.id === activeTab ? "#0A0A0C" : "transparent", borderBottom: t.id === activeTab ? "2px solid #5A8A5A" : "2px solid transparent" }}>
            <button onClick={() => setActiveTab(t.id)} className="px-3 py-1.5 text-[10px]" style={{ color: t.id === activeTab ? "#7AAF7A" : "#444" }}>
              {t.name}
            </button>
            {tabs.length > 1 && <button onClick={() => closeTab(t.id)} className="pr-2 opacity-0 group-hover:opacity-100" style={{ color: "#555" }}><I d={ic.close} s={8} /></button>}
          </div>
        ))}
        <button onClick={addTab} className="px-2 py-1.5" style={{ color: "#555" }} title="New Tab"><I d={ic.plus} s={12} /></button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-3 py-2 text-[11px] leading-5" style={{ scrollbarWidth: "none" }}>
        {lines.map((l, i) => {
          const isPrompt = l.includes("admin@alternus");
          const isError = l.startsWith("bash:") || l.startsWith("✗");
          const isSuccess = l.startsWith("✓") || l.startsWith("✓");
          return (
            <div key={i} className="whitespace-pre-wrap" style={{ color: isPrompt ? "#7AAF7A" : isError ? "#BF6A6A" : isSuccess ? "#7AAF7A" : "#808088" }}>
              {l}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0" style={{ borderTop: "1px solid #2A2A35" }}>
        <span className="text-[10px]" style={{ color: "#7AAF7A" }}>admin@alternus</span>
        <span className="text-[10px]" style={{ color: "#6A6A75" }}>:{cwd}$</span>
        <input ref={inputRef}
          className="flex-1 bg-transparent outline-none text-[11px] ml-1"
          style={{ color: "#E4E4E7" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}

function MusicApp({ c }: { c: typeof palette.dark }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tracks = [
    { name: "Focus Flow", artist: "Ambient AI", dur: "3:42" },
    { name: "Deep Work", artist: "Neural Beats", dur: "4:15" },
    { name: "Code Session", artist: "Synthwave", dur: "5:01" },
    { name: "Creative Space", artist: "Lo-Fi Engine", dur: "3:58" },
    { name: "Night Coding", artist: "Chill Pulse", dur: "4:33" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {tracks.map((t, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPlaying(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
            style={{ background: i === current ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (i !== current) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (i !== current) e.currentTarget.style.background = "transparent"; }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: i === current ? c.accent : c.cardAlt }}>
              <I d={ic.music} s={14} c={i === current ? "#fff" : c.textMuted} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: i === current ? c.accentText : c.text }}>{t.name}</p>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{t.artist}</p>
            </div>
            <span className="text-[10px]" style={{ color: c.textMuted }}>{t.dur}</span>
          </button>
        ))}
      </div>
      <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <p className="text-xs font-medium mb-1" style={{ color: c.text }}>{tracks[current].name}</p>
        <p className="text-[10px] mb-3" style={{ color: c.textMuted }}>{tracks[current].artist}</p>
        <div className="w-full h-1 rounded-full mb-3" style={{ background: c.cardAlt }}>
          <div className="h-full rounded-full" style={{ background: c.accent, width: playing ? "45%" : "0%", transition: "width 0.3s" }} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p > 0 ? p - 1 : tracks.length - 1)}><I d={ic.skip} s={14} /></button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.accent }} onClick={() => setPlaying(!playing)}>
            <I d={playing ? ic.pause : ic.play} s={14} c="#fff" />
          </button>
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p < tracks.length - 1 ? p + 1 : 0)}><I d={ic.skip} s={14} /></button>
        </div>
      </div>
    </div>
  );
}

function CalendarApp({ c }: { c: typeof palette.dark }) {
  const now = new Date();
  const [sel, setSel] = useState(now.getDate());
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const fd = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days: (number | null)[] = [...Array.from({ length: fd }, () => null as null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button style={{ color: c.textMuted }} className="p-1"><I d={ic.chevL} s={14} /></button>
        <p className="text-sm font-semibold" style={{ color: c.text }}>{now.toLocaleString("default", { month: "long" })} {now.getFullYear()}</p>
        <button style={{ color: c.textMuted }} className="p-1"><I d={ic.chevR} s={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} className="text-center text-[10px] font-medium py-1" style={{ color: c.textMuted }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <button key={i} onClick={() => d && setSel(d)} className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
            style={{ background: d === sel ? c.accent : d === now.getDate() && d !== sel ? c.accentSoft : "transparent", color: d === sel ? "#fff" : d === now.getDate() ? c.accentText : d ? c.text : "transparent" }}
            onMouseEnter={e => { if (d && d !== sel) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (d && d !== sel) e.currentTarget.style.background = d === now.getDate() ? c.accentSoft : "transparent"; }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeatherApp({ c }: { c: typeof palette.dark }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-3xl font-light" style={{ color: c.text }}>17°</p>
          <p className="text-xs" style={{ color: c.textMuted }}>Partly Cloudy</p>
        </div>
        <span className="text-4xl">⛅</span>
      </div>
      <div className="flex gap-2 mb-4">
        {["Mon","Tue","Wed","Thu","Fri"].map((d,i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: i === 2 ? c.accentSoft : "transparent" }}>
            <span className="text-[10px] font-medium" style={{ color: i === 2 ? c.accentText : c.textMuted }}>{d}</span>
            <span className="text-sm">{["☀️","⛅","🌤","⛅","☀️"][i]}</span>
            <span className="text-[11px] font-medium" style={{ color: i === 2 ? c.accentText : c.text }}>{[15,14,17,16,19][i]}°</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{l:"Humidity",v:"62%"},{l:"Wind",v:"12 km/h"},{l:"UV Index",v:"3 Low"},{l:"Pressure",v:"1013 hPa"}].map((s,i) => (
          <div key={i} className="p-3 rounded-xl" style={{ background: c.cardAlt }}>
            <p className="text-[10px]" style={{ color: c.textMuted }}>{s.l}</p>
            <p className="text-sm font-semibold" style={{ color: c.text }}>{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsApp({ c, mode, setMode, wallpaper, setWallpaper }: { c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void; wallpaper: number; setWallpaper: (w: number) => void }) {
  const [activeSection, setActiveSection] = useState("Network");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [dndOn, setDndOn] = useState(false);
  const [locOn, setLocOn] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [activeLang, setActiveLang] = useState(0);
  const [connectedNet, setConnectedNet] = useState(0);

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-10 h-5 rounded-full flex items-center px-0.5 transition-colors" style={{ background: on ? c.accent : c.cardAlt }}>
      <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: on ? "18px" : "0px" }} />
    </button>
  );

  const items = [
    { icon: ic.wifi, label: "Network" },
    { icon: ic.bluetooth, label: "Bluetooth" },
    { icon: ic.user, label: "Account" },
    { icon: ic.bell, label: "Notifications" },
    { icon: ic.globe, label: "Language" },
    { icon: ic.moon, label: "Appearance" },
    { icon: ic.hdd, label: "Storage" },
    { icon: ic.battery, label: "Battery" },
    { icon: ic.shield, label: "Privacy" },
    { icon: ic.settings, label: "System" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "Network":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Wi-Fi</p><p className="text-xs" style={{ color: c.textMuted }}>{wifiOn ? "Connected to AlternusNet · 5GHz" : "Disabled"}</p></div>
              <Toggle on={wifiOn} onToggle={() => setWifiOn(!wifiOn)} />
            </div>
            {wifiOn && (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-medium px-1 mb-2" style={{ color: c.textMuted }}>Available Networks</p>
                  {["AlternusNet", "Guest_WiFi", "Office_5G", "Neighbors_Net", "CafeHotspot"].map((net, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer"
                      style={{ background: i === connectedNet ? c.cardAlt : "transparent" }}
                      onClick={() => setConnectedNet(i)}
                      onMouseEnter={e => { if (i !== connectedNet) e.currentTarget.style.background = c.cardAlt; }}
                      onMouseLeave={e => { if (i !== connectedNet) e.currentTarget.style.background = "transparent"; }}>
                      <div className="flex items-center gap-3">
                        <I d={ic.wifi} s={16} c={i <= 2 ? c.textSec : c.textMuted} />
                        <div>
                          <span className="text-sm" style={{ color: c.text }}>{net}</span>
                          {i <= 2 && <p className="text-[9px]" style={{ color: c.textMuted }}>{i === 0 ? "5GHz · Excellent" : i === 1 ? "2.4GHz · Good" : "5GHz · Fair"}</p>}
                        </div>
                      </div>
                      {i === connectedNet && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>Connected</span>}
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium px-1 mb-2" style={{ color: c.textMuted }}>Network Info</p>
                  {[{ l: "IP Address", v: "192.168.1.42" }, { l: "DNS", v: "1.1.1.1" }, { l: "Speed", v: "866 Mbps" }, { l: "Security", v: "WPA3" }].map((info, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg mb-1" style={{ background: c.cardAlt }}>
                      <span className="text-[10px]" style={{ color: c.textMuted }}>{info.l}</span>
                      <span className="text-[10px] font-medium" style={{ color: c.text }}>{info.v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case "Bluetooth":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Bluetooth</p><p className="text-xs" style={{ color: c.textMuted }}>{btOn ? "On · 2 devices connected" : "Disabled"}</p></div>
              <Toggle on={btOn} onToggle={() => setBtOn(!btOn)} />
            </div>
            {btOn && (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-medium px-1 mb-2" style={{ color: c.textMuted }}>Connected Devices</p>
                  {[{ name: "Alternus Keyboard", type: "Input", battery: 85 }, { name: "AirPods Pro", type: "Audio", battery: 62 }].map((dev, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                      <div className="flex items-center gap-3">
                        <I d={ic.bluetooth} s={16} c={c.accent} />
                        <div>
                          <span className="text-sm" style={{ color: c.text }}>{dev.name}</span>
                          <p className="text-[9px]" style={{ color: c.textMuted }}>{dev.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <I d={ic.battery} s={12} c={dev.battery > 50 ? c.success : c.warning} />
                          <span className="text-[10px]" style={{ color: c.textSec }}>{dev.battery}%</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>Connected</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium px-1 mb-2" style={{ color: c.textMuted }}>Available Devices</p>
                  {["Magic Mouse", "JBL Speaker", "Samsung TV"].map((dev, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer"
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div className="flex items-center gap-3">
                        <I d={ic.bluetooth} s={16} c={c.textMuted} />
                        <span className="text-sm" style={{ color: c.text }}>{dev}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full cursor-pointer" style={{ background: c.cardAlt, color: c.textSec }}>Pair</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case "Account":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: c.accentSoft, color: c.accentText }}><I d={ic.user} s={32} /></div>
              <div>
                <p className="text-sm font-medium" style={{ color: c.text }}>Admin</p>
                <p className="text-xs" style={{ color: c.textMuted }}>admin@alternus.art</p>
                <p className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: c.accentSoft, color: c.accentText }}>Administrator</p>
              </div>
            </div>
            {[{ l: "Display Name", v: "Admin" }, { l: "Email", v: "admin@alternus.art" }, { l: "Role", v: "Administrator" }, { l: "Created", v: "January 15, 2025" }, { l: "Last Login", v: "Today at 03:06" }].map((f, i) => (
              <div key={i} className="px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <p className="text-[10px] mb-1" style={{ color: c.textMuted }}>{f.l}</p>
                <p className="text-sm" style={{ color: c.text }}>{f.v}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background: c.cardAlt, color: c.text }}>Edit Profile</button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background: c.cardAlt, color: c.danger }}>Sign Out</button>
            </div>
          </div>
        );
      case "Notifications":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Do Not Disturb</p><p className="text-xs" style={{ color: c.textMuted }}>{dndOn ? "All notifications muted" : "Notifications enabled"}</p></div>
              <Toggle on={dndOn} onToggle={() => setDndOn(!dndOn)} />
            </div>
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>App Notifications</p>
            {[{ app: "AI Assistant", icon: ic.sparkle, on: true }, { app: "Calendar", icon: ic.calendar, on: true }, { app: "Browser", icon: ic.globe, on: false }, { app: "Music", icon: ic.music, on: false }, { app: "System Updates", icon: ic.refresh, on: true }].map((n, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center gap-3">
                  <I d={n.icon} s={16} c={c.textSec} />
                  <span className="text-sm" style={{ color: c.text }}>{n.app}</span>
                </div>
                <div className="w-10 h-5 rounded-full flex items-center px-0.5 transition-colors" style={{ background: n.on ? c.accent : c.cardAlt, border: n.on ? "none" : `1px solid ${c.border}` }}>
                  <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: n.on ? "18px" : "0px" }} />
                </div>
              </div>
            ))}
          </div>
        );
      case "Language":
        return (
          <div className="p-5 space-y-1 overflow-y-auto h-full">
            <p className="text-xs font-medium px-1 mb-3" style={{ color: c.textMuted }}>Select Language</p>
            {["English (US)", "Shqip", "Deutsch", "Français", "Español", "Italiano", "Português", "中文", "日本語", "العربية", "한국어", "Türkçe"].map((lang, i) => (
              <button key={i} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                onClick={() => setActiveLang(i)}
                style={{ background: activeLang === i ? c.accentSoft : "transparent" }}
                onMouseEnter={e => { if (activeLang !== i) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (activeLang !== i) e.currentTarget.style.background = "transparent"; }}>
                <span className="text-sm" style={{ color: activeLang === i ? c.accentText : c.text }}>{lang}</span>
                {activeLang === i && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>Active</span>}
              </button>
            ))}
          </div>
        );
      case "Appearance":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>Theme</p>
            <div className="flex gap-3">
              {(["dark", "light"] as ThemeMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className="flex-1 p-4 rounded-xl text-center transition-all"
                  style={{ background: mode === m ? c.accentSoft : c.cardAlt, border: `2px solid ${mode === m ? c.accent : "transparent"}` }}>
                  <I d={m === "dark" ? ic.moon : ic.sun} s={24} c={mode === m ? c.accentText : c.textSec} />
                  <p className="text-xs mt-2 capitalize" style={{ color: mode === m ? c.accentText : c.text }}>{m}</p>
                </button>
              ))}
            </div>
            <p className="text-xs font-medium px-1 mt-4" style={{ color: c.textMuted }}>Accent Color</p>
            <div className="flex gap-2 px-1">
              {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"].map(col => (
                <div key={col} className="w-8 h-8 rounded-full cursor-pointer transition-transform" style={{ background: col, border: col === c.accent ? "3px solid " + c.text : "3px solid transparent" }} />
              ))}
            </div>
            <p className="text-xs font-medium px-1 mt-4" style={{ color: c.textMuted }}>Wallpaper</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { bg: c.bg, img: "", label: "Default" },
                { bg: "", img: "/wallpapers/OSpw3.png", label: "Flow" },
                { bg: "", img: "/wallpapers/OSwp.png", label: "Aurora" },
                { bg: "", img: "/wallpapers/OSwp2.png", label: "Ocean" },
                { bg: "", img: "/wallpapers/OSwp4.png", label: "Emerald" },
              ].map((wp, i) => (
                <div key={i} onClick={() => setWallpaper(i)}
                  className="h-16 rounded-xl cursor-pointer transition-all relative overflow-hidden"
                  style={{ background: wp.img ? `url('${wp.img}') center/cover no-repeat` : wp.bg, border: wallpaper === i ? `2px solid ${c.accent}` : `2px solid transparent`, boxShadow: wallpaper === i ? `0 0 8px ${c.accent}40` : "none" }}>
                  <span className="absolute bottom-1 left-2 text-[7px] font-semibold" style={{ color: i === 0 ? c.textMuted : "rgba(255,255,255,0.6)" }}>{wp.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium px-1 mt-4" style={{ color: c.textMuted }}>Font Size</p>
            <div className="flex gap-2">
              {["Small", "Medium", "Large"].map((s, i) => (
                <button key={s} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background: i === 1 ? c.accentSoft : c.cardAlt, color: i === 1 ? c.accentText : c.textSec, border: i === 1 ? `1px solid ${c.accent}` : `1px solid transparent` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      case "Storage":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: c.text }}>Internal Storage</p>
                <p className="text-xs" style={{ color: c.textMuted }}>278 GB / 512 GB used</p>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex" style={{ background: c.border }}>
                <div style={{ width: "30%", background: c.accent }} />
                <div style={{ width: "15%", background: c.purple }} />
                <div style={{ width: "8%", background: c.warning }} />
                <div style={{ width: "2%", background: c.danger }} />
              </div>
              <div className="flex gap-4 mt-3 flex-wrap">
                {[{ label: "Apps", color: c.accent, size: "154 GB" }, { label: "Media", color: c.purple, size: "77 GB" }, { label: "Documents", color: c.warning, size: "41 GB" }, { label: "Other", color: c.danger, size: "6 GB" }].map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[10px]" style={{ color: c.textSec }}>{cat.label} · {cat.size}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>Storage Breakdown</p>
            {[{ name: "Applications", size: "154 GB", icon: ic.store }, { name: "Photos & Videos", size: "52 GB", icon: ic.film }, { name: "Music", size: "25 GB", icon: ic.music }, { name: "Documents", size: "41 GB", icon: ic.fileText }, { name: "System", size: "12 GB", icon: ic.settings }, { name: "Cache", size: "3.2 GB", icon: ic.refresh }].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center gap-3">
                  <I d={item.icon} s={16} c={c.textSec} />
                  <span className="text-sm" style={{ color: c.text }}>{item.name}</span>
                </div>
                <span className="text-xs" style={{ color: c.textMuted }}>{item.size}</span>
              </div>
            ))}
          </div>
        );
      case "Battery":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="p-4 rounded-xl text-center" style={{ background: c.cardAlt }}>
              <p className="text-4xl font-bold mb-1" style={{ color: c.success }}>87%</p>
              <p className="text-xs" style={{ color: c.textMuted }}>Estimated 6h 42m remaining</p>
              <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ background: c.border }}>
                <div className="h-full rounded-full" style={{ width: "87%", background: c.success }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-xl text-xs font-medium text-center" style={{ background: c.cardAlt, color: c.text }}>Power Saver</button>
              <button className="flex-1 py-3 rounded-xl text-xs font-medium text-center" style={{ background: c.accentSoft, color: c.accentText, border: `1px solid ${c.accent}` }}>Balanced</button>
              <button className="flex-1 py-3 rounded-xl text-xs font-medium text-center" style={{ background: c.cardAlt, color: c.text }}>Performance</button>
            </div>
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>Battery Usage</p>
            {[{ app: "Browser", pct: 34, icon: ic.globe }, { app: "Code Editor", pct: 22, icon: ic.code }, { app: "AI Assistant", pct: 18, icon: ic.sparkle }, { app: "Display", pct: 15, icon: ic.monitor }, { app: "System", pct: 11, icon: ic.settings }].map((item, i) => (
              <div key={i} className="px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2"><I d={item.icon} s={14} c={c.textSec} /><span className="text-xs" style={{ color: c.text }}>{item.app}</span></div>
                  <span className="text-xs" style={{ color: c.textMuted }}>{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: c.accent }} />
                </div>
              </div>
            ))}
          </div>
        );
      case "Privacy":
        return (
          <div className="p-5 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Location Services</p><p className="text-xs" style={{ color: c.textMuted }}>{locOn ? "Enabled for 3 apps" : "Disabled"}</p></div>
              <Toggle on={locOn} onToggle={() => setLocOn(!locOn)} />
            </div>
            <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>App Permissions</p>
            {[{ app: "Browser", perms: ["Camera", "Location", "Mic"] }, { app: "AI Assistant", perms: ["Files", "Mic"] }, { app: "Weather", perms: ["Location"] }, { app: "Music", perms: ["Storage"] }].map((item, i) => (
              <div key={i} className="px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm" style={{ color: c.text }}>{item.app}</span>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>{item.perms.length} permissions</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {item.perms.map(p => (
                    <span key={p} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-medium px-1" style={{ color: c.textMuted }}>Security</p>
              {[{ l: "Firewall", v: "Active" }, { l: "Encryption", v: "AES-256" }, { l: "Last Scan", v: "Today, 02:14" }, { l: "Threats Found", v: "0" }].map((info, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: c.cardAlt }}>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>{info.l}</span>
                  <span className="text-[10px] font-medium" style={{ color: info.l === "Threats Found" ? c.success : c.text }}>{info.v}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "System":
        return (
          <div className="p-5 space-y-5 overflow-y-auto h-full">
            {/* Quick Toggles */}
            <div className="flex gap-2">
              {[{ icon: ic.wifi, label: "Wi-Fi", active: wifiOn }, { icon: ic.bluetooth, label: "Bluetooth", active: btOn }, { icon: ic.moon, label: "Night", active: false }, { icon: ic.sun, label: "Bright", active: false }].map((t, i) => (
                <button key={i} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                  style={{ background: t.active ? c.accent : c.cardAlt, color: t.active ? "#fff" : c.textSec }}>
                  <I d={t.icon} s={18} />
                  <span className="text-[9px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            {/* Sliders */}
            {[{ label: "Sound", icon: ic.volume, value: 72 }, { label: "Display", icon: ic.monitor, value: 85 }, { label: "Microphone", icon: ic.mic, value: 60 }, { label: "Mouse", icon: ic.mouse, value: 50 }].map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <I d={s.icon} s={13} c={c.textMuted} />
                  <span className="text-xs" style={{ color: c.textSec }}>{s.label}</span>
                </div>
                <div className="relative h-2 rounded-full" style={{ background: c.cardAlt }}>
                  <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${s.value}%`, background: i === 3 ? `linear-gradient(90deg, ${c.accent}, ${c.purple}, ${c.warning}, ${c.danger})` : c.accent }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2" style={{ left: `calc(${s.value}% - 7px)`, background: c.surface, borderColor: i === 3 ? c.danger : c.accent }} />
                </div>
              </div>
            ))}
            {/* Updates */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: c.cardAlt }}>
              <div><p className="text-sm font-medium" style={{ color: c.text }}>Auto Updates</p><p className="text-xs" style={{ color: c.textMuted }}>{autoUpdate ? "Keep system up to date" : "Manual updates only"}</p></div>
              <Toggle on={autoUpdate} onToggle={() => setAutoUpdate(!autoUpdate)} />
            </div>
            {/* System Info */}
            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-medium px-1" style={{ color: c.textMuted }}>System Info</p>
              {[{ l: "OS Version", v: "Alternus OS v1.0" }, { l: "Kernel", v: "AlternusKernel 6.2" }, { l: "CPU", v: "AlternusCPU 12-Core" }, { l: "GPU", v: "AlternusGPU Pro 16GB" }, { l: "Memory", v: "16 GB DDR5" }, { l: "Storage", v: "512 GB — 234 GB free" }, { l: "Uptime", v: "2h 14m" }].map((info, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: c.cardAlt }}>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>{info.l}</span>
                  <span className="text-[10px] font-medium" style={{ color: c.text }}>{info.v}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[170px] flex-shrink-0 flex flex-col py-3 px-2 overflow-y-auto" style={{ borderRight: `1px solid ${c.border}`, scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="flex items-center justify-between px-3 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>Settings</p>
          <div className="flex items-center gap-1">
            <button title="AI Assistant" onClick={() => setShowAIPanel(!showAIPanel)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
              style={{ background: "#3B82F6", boxShadow: showAIPanel ? "0 0 8px rgba(139,92,246,0.4)" : "none" }}>
              <I d={ic.sparkle} s={10} c="#fff" />
            </button>
            <button title="Voice" className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
              style={{ color: c.textMuted }}
              onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.accentText; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
              <I d={ic.voice} s={12} />
            </button>
          </div>
        </div>
        {items.map((it, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors mb-0.5"
            onClick={() => setActiveSection(it.label)}
            style={{ background: activeSection === it.label ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (activeSection !== it.label) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (activeSection !== it.label) e.currentTarget.style.background = "transparent"; }}>
            <I d={it.icon} s={15} c={activeSection === it.label ? c.accentText : c.textSec} />
            <span className="text-[11px] font-medium" style={{ color: activeSection === it.label ? c.accentText : c.text }}>{it.label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      {showAIPanel && (
        <div className="w-[180px] flex-shrink-0 flex flex-col" style={{ borderLeft: `1px solid ${c.border}`, background: c.bg }}>
          <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#3B82F6" }}>
              <I d={ic.sparkle} s={10} c="#fff" />
            </div>
            <span className="text-[10px] font-bold flex-1" style={{ color: c.text }}>AI Assistant</span>
            <button title="Voice" className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ color: c.textMuted }}
              onMouseEnter={e => { e.currentTarget.style.color = c.accentText; }}
              onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; }}>
              <I d={ic.voice} s={11} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Fix Problem", desc: "Diagnose & fix issues" },
              { label: "Check Updates", desc: "Find latest versions" },
              { label: "New Version", desc: "Upgrade Alternus OS" },
              { label: "Optimize", desc: "Speed up your system" },
              { label: "Backup", desc: "Save your settings" },
              { label: "Reset", desc: "Restore defaults" },
            ].map((item, i) => (
              <button key={i} className="w-full text-left px-3 py-2 rounded-xl transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <p className="text-[10px] font-semibold" style={{ color: c.text }}>{item.label}</p>
                <p className="text-[8px]" style={{ color: c.textMuted }}>{item.desc}</p>
              </button>
            ))}
          </div>
          <div className="px-2 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
              <input className="flex-1 bg-transparent outline-none text-[9px]" style={{ color: c.text }} placeholder="Ask AI..." />
              <button className="p-1 rounded-lg" style={{ background: c.accent }}><I d={ic.send} s={8} c="#fff" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WordApp({ c }: { c: typeof palette.dark }) {
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [docContent, setDocContent] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Turpis sit eget faucibus eget. Pulvinar amet varius elementum bibendum massa tristique varius ultrices. Ornare vitae duis non in. Id tortor cras nisl mollis nibh est. Socis tortor id orci vitae nulla eget sed nisi.\n\nUt nisl aliquam dignissim mauris nunc ut diam nec sed. Neque urna vitae velit morbi tristique. Nulla tristique urna gravida orci sagittis vel mauris amet. Ipsum urna id elit volutpat. Enem posuere dictum sed sagittis. In tortor aliquam posuere ultrices fringilla. Magna dictum faucibus praesent ultrices feugiat nec. Vitae tempor augue suscipit sed eget purus.\n\nPraesent urna ante nam mattis dolor imperdiet vitae pellentesque vitae. Leo dapibus non egestas commodo urna tincidunt vitae. Consequat gravida netus fames viverra orci. Vel in sed nec enim hendrerit faucibus. Laoreet tincidunt eget neque dignissim sit egestas adipiscing. Euismod facilisis vestibulum ut in faucibus sed.");
  const [wordCount, setWordCount] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setWordCount(docContent.trim().split(/\s+/).filter(Boolean).length);
  }, [docContent]);

  const ToolBtn = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
    <button title={label} onClick={onClick}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
      style={{ background: active ? c.accentSoft : "transparent", color: active ? c.accentText : c.textMuted }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.cardAlt; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? c.accentSoft : "transparent"; }}>
      <I d={icon} s={13} />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-3 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {["File", "Home", "Insert", "Layout", "View"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-3 py-1 text-[10px] font-medium transition-colors"
            style={{ color: activeTab === tab ? c.accentText : c.textMuted, borderBottom: activeTab === tab ? `2px solid ${c.accent}` : "2px solid transparent" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 flex-shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${c.border}` }}>
        {/* Clipboard */}
        <ToolBtn icon={ic.fileText} label="Paste" />
        <ToolBtn icon={ic.note} label="Copy" />
        <ToolBtn icon={ic.close} label="Cut" />
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        {/* Font */}
        <select className="text-[10px] px-1.5 py-1 rounded-md outline-none" style={{ background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }}>
          <option>Arial</option><option>Times New Roman</option><option>Helvetica</option><option>Georgia</option><option>Courier</option>
        </select>
        <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
          className="text-[10px] w-10 px-1 py-1 rounded-md outline-none" style={{ background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }}>
          {[10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        {/* Format */}
        <ToolBtn icon="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" label="Bold" active={isBold} onClick={() => setIsBold(!isBold)} />
        <ToolBtn icon="M19 4h-9M14 20H5M15 4L9 20" label="Italic" active={isItalic} onClick={() => setIsItalic(!isItalic)} />
        <ToolBtn icon="M6 3v7a6 6 0 0012 0V3M4 21h16" label="Underline" active={isUnderline} onClick={() => setIsUnderline(!isUnderline)} />
        <ToolBtn icon="M17.5 4.5l-15 15M7 4V2M17 4V2M2 7h5M2 17h5M22 7h-5M22 17h-5M17 20v2M7 20v2" label="Strikethrough" />
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        {/* Paragraph */}
        <ToolBtn icon={ic.alignLeft} label="Align Left" />
        <ToolBtn icon={ic.alignCenter} label="Align Center" />
        <ToolBtn icon={ic.alignRight} label="Align Right" />
        <ToolBtn icon={ic.alignJustify} label="Justify" />
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        {/* Actions */}
        <ToolBtn icon={ic.refresh} label="Undo" />
        <ToolBtn icon="M1 20v-6h6M23 4v6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" label="Redo" />
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        <ToolBtn icon={ic.search} label="Find & Replace" />
        <ToolBtn icon={ic.download} label="Save" />
        <ToolBtn icon={ic.upload} label="Export" />
        <div className="w-px h-5 mx-1" style={{ background: c.border }} />
        <button title="AI Assistant" onClick={() => setShowAI(!showAI)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: "#3B82F6", boxShadow: showAI ? "0 0 12px rgba(139,92,246,0.5)" : "0 0 6px rgba(139,92,246,0.25)" }}>
          <I d={ic.sparkle} s={12} c="#fff" />
        </button>
      </div>

      {/* Document + AI sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document area */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: c.bg, scrollbarWidth: "none" }}>
          <div className="max-w-[640px] mx-auto rounded-lg p-8 min-h-full" style={{ background: c.surface, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <input
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              className="w-full text-xl font-bold mb-4 bg-transparent border-none outline-none"
              style={{ color: c.text }}
              placeholder="Document Title"
            />
            <textarea
              value={docContent}
              onChange={e => setDocContent(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none leading-relaxed"
              style={{ color: c.text, minHeight: 400, fontSize, fontWeight: isBold ? "bold" : "normal", fontStyle: isItalic ? "italic" : "normal", textDecoration: isUnderline ? "underline" : "none", scrollbarWidth: "none" as never }}
              placeholder="Start writing..."
            />
          </div>
        </div>

        {/* AI Sidebar */}
        {showAI && (
          <div className="w-[220px] flex-shrink-0 flex flex-col" style={{ borderLeft: `1px solid ${c.border}`, background: c.surface }}>
            <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3B82F6" }}>
                <I d={ic.sparkle} s={10} c="#fff" />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: c.text }}>AI Writer</span>
            </div>
            {/* Quick actions */}
            <div className="px-2 py-2 space-y-0.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              {[
                { label: "Summarize", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Summary: This document contains a placeholder text discussing various topics in 3 paragraphs with 144 words."); setAiLoading(false); }, 800); }},
                { label: "Fix Grammar", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Grammar check complete. 3 corrections applied:\n• \"Enem\" → \"Enim\"\n• Comma added after \"purus\"\n• Period consistency fixed"); setAiLoading(false); }, 600); }},
                { label: "Make Shorter", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Shortened version ready. Reduced from 144 to ~80 words while keeping key points. Click 'Apply' to replace."); setAiLoading(false); }, 700); }},
                { label: "Make Longer", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Expanded version ready. Added details and transitions. Word count increased to ~220 words. Click 'Apply' to replace."); setAiLoading(false); }, 700); }},
                { label: "Translate", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Translation ready (Albanian):\n\nLorem ipsum → Teksti placeholder per dokumentin tuaj..."); setAiLoading(false); }, 900); }},
                { label: "Change Tone", action: () => { setAiLoading(true); setTimeout(() => { setAiResult("Tone options:\n• Professional\n• Casual\n• Academic\n• Creative\n\nSelect a tone to rewrite the document."); setAiLoading(false); }, 500); }},
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                  style={{ color: c.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {item.label}
                </button>
              ))}
            </div>
            {/* AI result */}
            <div className="flex-1 overflow-y-auto px-3 py-2" style={{ scrollbarWidth: "none" }}>
              {aiLoading && (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${c.accent} transparent ${c.accent} ${c.accent}` }} />
                  <span className="text-[10px]" style={{ color: c.textMuted }}>AI thinking...</span>
                </div>
              )}
              {aiResult && !aiLoading && (
                <div className="space-y-2">
                  <pre className="text-[10px] leading-relaxed whitespace-pre-wrap font-sans" style={{ color: c.text }}>{aiResult}</pre>
                  <div className="flex gap-1">
                    <button onClick={() => { setDocContent(prev => prev + "\n\n" + aiResult); setAiResult(null); }}
                      className="flex-1 py-1.5 rounded-lg text-[9px] font-medium" style={{ background: c.accent, color: "#fff" }}>Apply</button>
                    <button onClick={() => setAiResult(null)}
                      className="flex-1 py-1.5 rounded-lg text-[9px] font-medium" style={{ background: c.cardAlt, color: c.text }}>Dismiss</button>
                  </div>
                </div>
              )}
              {!aiResult && !aiLoading && (
                <p className="text-[10px] text-center py-4" style={{ color: c.textMuted }}>Select an action or ask AI below</p>
              )}
            </div>
            {/* Custom prompt */}
            <div className="px-2 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
                <input className="flex-1 bg-transparent outline-none text-[10px]" style={{ color: c.text }}
                  placeholder="Ask AI..."
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && aiPrompt.trim()) {
                      const q = aiPrompt; setAiPrompt(""); setAiLoading(true);
                      setTimeout(() => { setAiResult(`AI response to "${q}":\n\nI've analyzed your document and here's my suggestion based on your request.`); setAiLoading(false); }, 800);
                    }
                  }} />
                <button onClick={() => {
                  if (aiPrompt.trim()) {
                    const q = aiPrompt; setAiPrompt(""); setAiLoading(true);
                    setTimeout(() => { setAiResult(`AI response to "${q}":\n\nI've analyzed your document and here's my suggestion.`); setAiLoading(false); }, 800);
                  }
                }} className="p-1 rounded" style={{ background: c.accent }}><I d={ic.send} s={10} c="#fff" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 h-7 flex-shrink-0" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-4">
          <span className="text-[9px]" style={{ color: c.textMuted }}>Page 1 of 1</span>
          <span className="text-[9px]" style={{ color: c.textMuted }}>{wordCount} words</span>
          <span className="text-[9px]" style={{ color: c.textMuted }}>{docContent.length} characters</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px]" style={{ color: c.textMuted }}>Font: {fontSize}px</span>
          <span className="text-[9px]" style={{ color: c.textMuted }}>UTF-8</span>
        </div>
      </div>
    </div>
  );
}

function FilesApp({ c, onOpenApp }: { c: typeof palette.dark; onOpenApp: (id: WinId) => void }) {
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recent" | "favorites" | "shared">("recent");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; name: string } | null>(null);

  type FileItem = { name: string; type: "folder" | "file"; icon: string; iconColor: string; size: string; modified: string; action?: WinId | string };

  const [fileSystem, setFileSystem] = useState<Record<string, FileItem[]>>({
    Home: [
      { name: "Desktop", type: "folder", icon: ic.monitor, iconColor: "#60A5FA", size: "8 items", modified: "Today", action: "Desktop" },
      { name: "Downloads", type: "folder", icon: ic.download, iconColor: "#34D399", size: "23 items", modified: "Today", action: "Downloads" },
      { name: "Documents", type: "folder", icon: ic.fileText, iconColor: "#FBBF24", size: "12 items", modified: "Yesterday", action: "Documents" },
      { name: "Pictures", type: "folder", icon: ic.image, iconColor: "#A78BFA", size: "48 items", modified: "Apr 2", action: "Pictures" },
      { name: "Music", type: "folder", icon: ic.music, iconColor: "#F472B6", size: "156 items", modified: "Mar 28", action: "Music" },
      { name: "Videos", type: "folder", icon: ic.film, iconColor: "#FB923C", size: "34 items", modified: "Mar 25", action: "Videos" },
      { name: "Projects", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "7 items", modified: "Today", action: "Projects" },
    ],
    Desktop: [
      { name: "Baroque Composition", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "3 items", modified: "Today", action: "Desktop" },
      { name: "screenshot.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "1.2 MB", modified: "Today" },
      { name: "notes.txt", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "2 KB", modified: "Yesterday" },
    ],
    Documents: [
      { name: "Budget Report Q1.docx", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "245 KB", modified: "Mar 15" },
      { name: "Project Proposal.docx", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "180 KB", modified: "Mar 10" },
      { name: "Meeting Notes.md", type: "file", icon: ic.note, iconColor: "#FBBF24", size: "8 KB", modified: "Today", action: "notes" },
      { name: "Invoice_March.pdf", type: "file", icon: ic.fileText, iconColor: "#EF4444", size: "120 KB", modified: "Mar 30" },
      { name: "Contract_2025.pdf", type: "file", icon: ic.fileText, iconColor: "#EF4444", size: "340 KB", modified: "Jan 15" },
      { name: "Personal Notes.txt", type: "file", icon: ic.note, iconColor: c.textSec, size: "4 KB", modified: "Feb 20", action: "notes" },
      { name: "todo.txt", type: "file", icon: ic.note, iconColor: c.textSec, size: "1 KB", modified: "Today", action: "notes" },
    ],
    Downloads: [
      { name: "AlternusOS-installer.dmg", type: "file", icon: ic.download, iconColor: "#34D399", size: "120 MB", modified: "Today" },
      { name: "font-pack.zip", type: "file", icon: ic.folder, iconColor: "#FBBF24", size: "12 MB", modified: "Yesterday" },
      { name: "archive-backup.zip", type: "file", icon: ic.folder, iconColor: "#FBBF24", size: "45 MB", modified: "Mar 28" },
      { name: "design-assets.zip", type: "file", icon: ic.folder, iconColor: "#FBBF24", size: "8 MB", modified: "Mar 20" },
    ],
    Pictures: [
      { name: "Screenshots", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "24 items", modified: "Today", action: "Pictures" },
      { name: "wallpaper.jpg", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "3.8 MB", modified: "Mar 15" },
      { name: "logo.svg", type: "file", icon: ic.pen, iconColor: "#F472B6", size: "4 KB", modified: "Feb 10" },
      { name: "avatar.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "256 KB", modified: "Jan 20" },
    ],
    Music: [
      { name: "Favorites", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "32 songs", modified: "Today", action: "Music" },
      { name: "Chill Vibes.mp3", type: "file", icon: ic.music, iconColor: "#F472B6", size: "8.4 MB", modified: "Mar 20" },
      { name: "Focus Flow.mp3", type: "file", icon: ic.music, iconColor: "#F472B6", size: "6.2 MB", modified: "Mar 18" },
    ],
    Videos: [
      { name: "Screen Recording.mp4", type: "file", icon: ic.film, iconColor: "#FB923C", size: "48 MB", modified: "Today" },
      { name: "Tutorial.mp4", type: "file", icon: ic.film, iconColor: "#FB923C", size: "120 MB", modified: "Mar 10" },
    ],
    Projects: [
      { name: "alternus-os", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "24 files", modified: "Today", action: "Projects" },
      { name: "website", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "18 files", modified: "Yesterday", action: "Projects" },
      { name: "README.md", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "2 KB", modified: "Today", action: "code" },
      { name: "API Documentation.md", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "12 KB", modified: "Mar 28", action: "code" },
      { name: "Design System.fig", type: "file", icon: ic.pen, iconColor: "#A78BFA", size: "18 MB", modified: "Mar 15" },
    ],
    Trash: [
      { name: "old-backup.zip", type: "file", icon: ic.folder, iconColor: c.textMuted, size: "34 MB", modified: "Mar 1" },
      { name: "draft-v1.docx", type: "file", icon: ic.fileText, iconColor: c.textMuted, size: "120 KB", modified: "Feb 15" },
      { name: "temp-screenshot.png", type: "file", icon: ic.image, iconColor: c.textMuted, size: "2.1 MB", modified: "Feb 10" },
    ],
  });

  const deleteFile = (fileName: string) => {
    const curFolder = currentPath[currentPath.length - 1];
    setFileSystem(prev => {
      const file = prev[curFolder]?.find(f => f.name === fileName);
      if (!file) return prev;
      return {
        ...prev,
        [curFolder]: prev[curFolder].filter(f => f.name !== fileName),
        Trash: [...(prev.Trash || []), { ...file, iconColor: c.textMuted, modified: "Just now" }],
      };
    });
    setSelectedFile(null);
    setDeleteConfirm(null);
  };

  const emptyTrash = () => {
    setFileSystem(prev => ({ ...prev, Trash: [] }));
  };

  const sidebarItems = [
    { icon: ic.home, label: "Home", path: "Home" },
    { icon: ic.monitor, label: "Desktop", path: "Desktop" },
    { icon: ic.download, label: "Downloads", path: "Downloads" },
    { icon: ic.fileText, label: "Documents", path: "Documents" },
    { icon: ic.image, label: "Pictures", path: "Pictures" },
    { icon: ic.music, label: "Music", path: "Music" },
    { icon: ic.film, label: "Videos", path: "Videos" },
    { icon: ic.folder, label: "Projects", path: "Projects" },
    { icon: ic.trash, label: "Trash", path: "Trash" },
  ];

  const recentFiles: FileItem[] = [
    { name: "Budget Report Q1.docx", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "245 KB", modified: "2 min ago" },
    { name: "Meeting Notes.md", type: "file", icon: ic.note, iconColor: "#FBBF24", size: "8 KB", modified: "15 min ago", action: "notes" },
    { name: "Design System.fig", type: "file", icon: ic.pen, iconColor: "#A78BFA", size: "18 MB", modified: "1 hour ago" },
    { name: "screenshot.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "1.2 MB", modified: "3 hours ago" },
  ];

  const curPath = currentPath[currentPath.length - 1];
  const currentFiles = fileSystem[curPath] || fileSystem.Home;
  const filteredFiles = searchQuery
    ? Object.values(fileSystem).flat().filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentFiles;

  const navigateTo = (path: string) => {
    setCurrentPath(prev => [...prev, path]);
    setSelectedFile(null);
    setSearchQuery("");
  };

  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => prev.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const handleFileClick = (f: FileItem) => {
    if (f.type === "folder" && f.action && fileSystem[f.action]) {
      navigateTo(f.action);
    } else if (f.action === "notes") {
      onOpenApp("notes");
    } else if (f.action === "code") {
      onOpenApp("code");
    } else if (f.type === "file") {
      setFileContent(`# ${f.name}\n\nSize: ${f.size}\nType: ${f.name.split('.').pop()?.toUpperCase()}\nModified: ${f.modified}\nLocation: ${curPath}\n\n--- Content Preview ---\n\nThis is a preview of ${f.name}.\nFull editing available in the appropriate app.`);
    }
  };

  if (fileContent) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}`, minHeight: 40 }}>
          <button onClick={() => setFileContent(null)} className="p-1 rounded-md" style={{ color: c.textSec }}><I d={ic.chevL} s={14} /></button>
          <span className="text-xs font-medium" style={{ color: c.textSec }}>File Preview</span>
        </div>
        <div className="flex-1 px-4 py-3 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" style={{ color: c.text }}>{fileContent}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[150px] flex-shrink-0 flex flex-col py-1 px-1.5 overflow-y-auto" style={{ borderRight: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
        {sidebarItems.map((item, i) => (
          <button key={i} onClick={() => { setCurrentPath([item.path]); setSelectedFile(null); setSearchQuery(""); }}
            className="w-full flex items-center gap-4 px-3 py-2 rounded-lg text-left transition-colors"
            style={{ background: curPath === item.path ? c.accent : "transparent", minHeight: 36 }}
            onMouseEnter={e => { if (curPath !== item.path) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (curPath !== item.path) e.currentTarget.style.background = curPath === item.path ? c.accent : "transparent"; }}>
            <I d={item.icon} s={15} c={curPath === item.path ? "#fff" : c.textMuted} />
            <span className="text-[11px] font-medium" style={{ color: curPath === item.path ? "#fff" : c.text }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button onClick={goBack} className="p-1.5 rounded-md" style={{ color: currentPath.length > 1 ? c.textSec : c.textMuted, opacity: currentPath.length > 1 ? 1 : 0.4 }}><I d={ic.chevL} s={13} /></button>
          <button onClick={() => setCurrentPath(["Home"])} className="p-1.5 rounded-md" style={{ color: c.textSec }}><I d={ic.home} s={13} /></button>
          <div className="w-px h-4 mx-1" style={{ background: c.border }} />
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {currentPath.map((p, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <I d={ic.chevR} s={10} c={c.textMuted} />}
                <button onClick={() => setCurrentPath(currentPath.slice(0, i + 1))} className="text-[11px] px-1.5 py-0.5 rounded-md truncate"
                  style={{ color: i === currentPath.length - 1 ? c.text : c.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{p}</button>
              </div>
            ))}
          </div>
          {/* AI classify button */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: "#3B82F6", boxShadow: showAIPanel ? "0 0 10px rgba(139,92,246,0.4)" : "0 0 6px rgba(139,92,246,0.25)" }}
            title="AI File Manager"
          >
            <I d={ic.sparkle} s={12} c="#fff" />
          </button>
          {/* Voice */}
          <button title="Voice Command" className="p-1.5 rounded-lg transition-all flex-shrink-0"
            style={{ color: c.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.accentText; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.voice} s={14} />
          </button>
          {/* Search */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg w-[140px]" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
            <I d={ic.search} s={11} c={c.textMuted} />
            <input className="flex-1 bg-transparent outline-none text-[11px]" style={{ color: c.text }}
              placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Quick Access header for Home */}
        {curPath === "Home" && !searchQuery && (
          <div className="px-4 pt-3 pb-1 flex-shrink-0">
            <p className="text-[11px] font-medium" style={{ color: c.textMuted }}>Pinned</p>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 relative" style={{ scrollbarWidth: "none" }} onClick={() => setFileContextMenu(null)}>
          {/* Column header */}
          <div className="flex items-center gap-4 px-4 py-1.5 mb-0.5">
            <span className="flex-1 text-[10px] font-medium" style={{ color: c.textMuted }}>Name</span>
            <span className="w-16 text-[10px] font-medium text-right" style={{ color: c.textMuted }}>Size</span>
            <span className="w-20 text-[10px] font-medium text-right" style={{ color: c.textMuted }}>Modified</span>
          </div>

          {filteredFiles.map((f, i) => (
            <div key={i} className="relative">
              <button className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-left transition-colors"
                style={{ background: selectedFile === f.name ? c.accentSoft : "transparent", minHeight: 40 }}
                onMouseEnter={e => { if (selectedFile !== f.name) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (selectedFile !== f.name) e.currentTarget.style.background = "transparent"; }}
                onClick={() => { setSelectedFile(f.name); setFileContextMenu(null); }}
                onDoubleClick={() => handleFileClick(f)}
                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSelectedFile(f.name); setFileContextMenu({ x: e.clientX, y: e.clientY, name: f.name }); }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: f.type === "folder" ? "transparent" : c.cardAlt }}>
                  <I d={f.icon} s={f.type === "folder" ? 20 : 16} c={f.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: c.text }}>{f.name}</p>
                  {f.type === "folder" && <p className="text-[9px]" style={{ color: c.textMuted }}>{f.size}</p>}
                </div>
                <span className="w-16 text-[10px] text-right flex-shrink-0" style={{ color: c.textMuted }}>{f.type === "file" ? f.size : ""}</span>
                <span className="w-20 text-[10px] text-right flex-shrink-0" style={{ color: c.textMuted }}>{f.modified}</span>
              </button>
            </div>
          ))}

          {/* Trash actions */}
          {curPath === "Trash" && fileSystem.Trash.length > 0 && (
            <div className="flex justify-center py-3">
              <button onClick={emptyTrash} className="text-[10px] px-4 py-1.5 rounded-lg font-medium" style={{ background: "rgba(239,68,68,0.1)", color: c.danger }}>Empty Trash</button>
            </div>
          )}

          {/* File right-click context menu */}
          {fileContextMenu && (
            <div className="fixed z-[500] w-[180px] rounded-xl overflow-hidden py-1"
              style={{ left: fileContextMenu.x, top: fileContextMenu.y, background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              {[
                { icon: ic.fileText, label: "Open", action: () => { const f = filteredFiles.find(f => f.name === fileContextMenu.name); if (f) handleFileClick(f); setFileContextMenu(null); } },
                { icon: ic.pen, label: "Rename", action: () => setFileContextMenu(null) },
                { icon: ic.fileText, label: "Copy", action: () => setFileContextMenu(null) },
                { icon: ic.trash, label: "Delete", action: () => { setDeleteConfirm(fileContextMenu.name); setFileContextMenu(null); }, danger: true },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={item.icon} s={13} c={(item as {danger?: boolean}).danger ? c.danger : c.textMuted} />
                  <span className="text-[11px]" style={{ color: (item as {danger?: boolean}).danger ? c.danger : c.text }}>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Delete confirmation */}
          {deleteConfirm && (
            <div className="absolute inset-0 flex items-center justify-center z-[500]" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="w-72 p-4 rounded-2xl" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                    <I d={ic.trash} s={18} c={c.danger} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: c.text }}>Delete file?</p>
                    <p className="text-[10px]" style={{ color: c.textMuted }}>&quot;{deleteConfirm}&quot; will be moved to Trash.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: c.cardAlt, color: c.textSec }}>Cancel</button>
                  <button onClick={() => deleteFile(deleteConfirm)} className="px-4 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: c.danger, color: "#fff" }}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar - Recent / Favorites / Shared */}
        {curPath === "Home" && !searchQuery && (
          <div className="flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-0 px-3 py-1.5">
              {(["recent", "favorites", "shared"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-1 rounded-full text-[11px] font-medium capitalize transition-colors"
                  style={{ background: activeTab === tab ? c.accent : "transparent", color: activeTab === tab ? "#fff" : c.textMuted }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="px-2 pb-2 max-h-[120px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {recentFiles.map((f, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onDoubleClick={() => handleFileClick(f)}>
                  <I d={f.icon} s={14} c={f.iconColor} />
                  <span className="flex-1 text-[11px] truncate" style={{ color: c.text }}>{f.name}</span>
                  <span className="text-[9px]" style={{ color: c.textMuted }}>{f.modified}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
          <span className="text-[9px]" style={{ color: c.textMuted }}>{filteredFiles.length} items</span>
          <span className="text-[9px]" style={{ color: c.textMuted }}>{curPath}</span>
        </div>
      </div>
      {showAIPanel && <div className="w-[170px] flex-shrink-0"><AIPanel c={c} context="Files" /></div>}
    </div>
  );
}

function NotesApp({ c }: { c: typeof palette.dark }) {
  const [text, setText] = useState("# My Notes\n\nStart typing here...\n\n- Project ideas\n- Meeting notes\n- Quick reminders");
  return (
    <div className="flex flex-col h-full">
      <textarea
        className="flex-1 p-4 bg-transparent outline-none resize-none text-sm leading-relaxed font-mono"
        style={{ color: c.text }}
        value={text}
        onChange={e => setText(e.target.value)}
      />
    </div>
  );
}

function BrowserApp({ c }: { c: typeof palette.dark }) {
  const [url, setUrl] = useState("https://alternus.art");
  const [displayUrl, setDisplayUrl] = useState("https://alternus.art");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [history, setHistory] = useState<string[]>(["https://alternus.art"]);
  const [bookmarks] = useState([
    { name: "Alternus Art", url: "https://alternus.art" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Google", url: "https://google.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" },
  ]);

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;
    setDisplayUrl(finalUrl);
    setUrl(finalUrl);
    setHistory(p => [...p, finalUrl]);
    setIsLoading(true);
    setLoadError(false);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => { if (history.length > 1) { const h = [...history]; h.pop(); setHistory(h); setUrl(h[h.length - 1]); setDisplayUrl(h[h.length - 1]); } }} style={{ color: c.textMuted }} className="p-1 rounded-md hover:bg-white/10 transition-colors">
          <I d={ic.chevL} s={14} />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: `${c.accent} transparent ${c.accent} ${c.accent}` }} />
          ) : (
            <I d={ic.globe} s={12} c={c.textMuted} />
          )}
          <input
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: c.text }}
            value={displayUrl}
            onChange={e => setDisplayUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") navigate(displayUrl); }}
          />
        </div>
        <button className="px-3 py-1.5 rounded-lg text-[9px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0"
          style={{ background: c.accent + "15", color: c.accentText, border: `1px solid ${c.accent}30` }}
          onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = c.accent + "15"; e.currentTarget.style.color = c.accentText; }}>
          <I d={ic.sparkle} s={10} /> Try AI
        </button>
      </div>

      {/* Bookmarks */}
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {bookmarks.map((b, i) => (
          <button key={i} onClick={() => navigate(b.url)} className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors"
            style={{ color: c.textSec }}
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative" style={{ background: c.cardAlt }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${c.accent} transparent ${c.accent} ${c.accent}` }} />
            <p className="text-xs" style={{ color: c.textMuted }}>Loading {displayUrl}...</p>
          </div>
        ) : (
          <>
            <iframe
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Browser"
              onError={() => setLoadError(true)}
            />
            {loadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: c.cardAlt }}>
                <I d={ic.globe} s={32} c={c.textMuted} />
                <p className="text-sm font-medium" style={{ color: c.text }}>Cannot display this page</p>
                <p className="text-xs" style={{ color: c.textMuted }}>{url} refused to connect</p>
                <button onClick={() => navigate(url)} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: c.accent, color: "#fff" }}>Retry</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CodeApp({ c }: { c: typeof palette.dark }) {
  const bg = "#1A1A1F"; const bg2 = "#212126"; const bg3 = "#28282E"; const br = "#333338"; const accent = "#5A5A65";
  const fileTree = [
    { name: "src", type: "folder" as const, open: true, children: [
      { name: "main.js", type: "file" as const, lang: "JavaScript" },
      { name: "app.jsx", type: "file" as const, lang: "React" },
      { name: "utils.js", type: "file" as const, lang: "JavaScript" },
    ]},
    { name: "public", type: "folder" as const, open: false, children: [
      { name: "index.html", type: "file" as const, lang: "HTML" },
    ]},
    { name: "style.css", type: "file" as const, lang: "CSS" },
    { name: "package.json", type: "file" as const, lang: "JSON" },
  ];
  const fileContents: Record<string, { lang: string; code: string }> = {
    "main.js": { lang: "JavaScript", code: `// Alternus Code Editor — AI Integrated\n\nimport { createApp } from './app.jsx';\nimport { formatDate, capitalize } from './utils.js';\n\nfunction greet(name) {\n  return \`Hello, \${capitalize(name)}!\`;\n}\n\nconst app = createApp('Alternus');\nconsole.log(greet("World"));\nconsole.log(formatDate(new Date()));` },
    "app.jsx": { lang: "React", code: `import { useState } from 'react';\n\nexport function createApp(name) {\n  return { name, version: '1.0.0' };\n}\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>Alternus App</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  );\n}` },
    "utils.js": { lang: "JavaScript", code: `export function formatDate(date) {\n  return date.toLocaleDateString('en-US', {\n    weekday: 'long',\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric'\n  });\n}\n\nexport function capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\n\nexport function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}` },
    "index.html": { lang: "HTML", code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width">\n  <title>Alternus App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="src/main.js"></script>\n</body>\n</html>` },
    "style.css": { lang: "CSS", code: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background: #0a0a0f;\n  color: #e4e4e7;\n  min-height: 100vh;\n}\n\n.app {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  border: 1px solid #333;\n  background: #1a1a2e;\n  color: #fff;\n  cursor: pointer;\n}` },
    "package.json": { lang: "JSON", code: `{\n  "name": "alternus-app",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  },\n  "devDependencies": {\n    "vite": "^6.0.0"\n  }\n}` },
  };
  const [activeFile, setActiveFile] = useState("welcome");
  const [openTabs, setOpenTabs] = useState(["welcome", "main.js"]);
  const [codes, setCodes] = useState<Record<string, string>>(Object.fromEntries(Object.entries(fileContents).map(([k, v]) => [k, v.code])));
  const [output, setOutput] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [showExplorer, setShowExplorer] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI coding partner. I can:\n• Write & generate code\n• Fix bugs & errors\n• Explain code logic\n• Refactor & optimize\n\nAsk me anything!" },
  ]);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const code = codes[activeFile] || "";
  const lang = fileContents[activeFile]?.lang || "Text";

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMsgs]);

  const openFile = (name: string) => {
    setActiveFile(name);
    if (!openTabs.includes(name)) setOpenTabs(p => [...p, name]);
  };
  const closeTab = (name: string) => {
    const t = openTabs.filter(n => n !== name);
    setOpenTabs(t);
    if (activeFile === name) setActiveFile(t[t.length - 1] || "main.js");
  };
  const setCode = (val: string | ((prev: string) => string)) => {
    setCodes(p => ({ ...p, [activeFile]: typeof val === "function" ? val(p[activeFile] || "") : val }));
  };

  const runCode = () => {
    setShowTerminal(true);
    setOutput(prev => [...prev, `\n$ node ${activeFile}`, "Compiling..."]);
    setTimeout(() => {
      try {
        const lines: string[] = [];
        const fakeConsole = { log: (...args: unknown[]) => lines.push(args.map(String).join(" ")) };
        const fn = new Function("console", code);
        fn(fakeConsole);
        setOutput(prev => [...prev, ...lines, `✓ Done in 0.${Math.floor(Math.random() * 9)}s`]);
      } catch (err) {
        setOutput(prev => [...prev, `✗ ${(err as Error).message}`, "✗ Process exited (1)"]);
      }
    }, 400);
  };

  const sendAI = () => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim(); setAiInput("");
    setAiMsgs(p => [...p, { role: "user", text: q }]);
    setTimeout(() => {
      let r = "";
      const l = q.toLowerCase();
      if (l.includes("sort") || l.includes("array")) r = "Here's an optimized sort:\n\n```js\nconst sorted = [...arr].sort((a, b) => a - b);\n// For objects: arr.sort((a, b) => a.key.localeCompare(b.key));\n```\n\nClick 'Insert Code' to add to your file.";
      else if (l.includes("fetch") || l.includes("api")) r = "Async fetch with error handling:\n\n```js\nasync function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(res.statusText);\n    return await res.json();\n  } catch (err) {\n    console.error('Fetch failed:', err);\n  }\n}\n```\n\nClick 'Insert Code' to add.";
      else if (l.includes("fix") || l.includes("bug") || l.includes("error")) r = `I've analyzed \`${activeFile}\`:\n\n• Line count: ${code.split("\n").length}\n• No syntax errors detected\n• Suggestion: Add error handling for edge cases\n• Consider adding type checks for function params`;
      else if (l.includes("component") || l.includes("react") || l.includes("button")) r = "```js\nfunction Button({ label, onClick, variant = 'primary' }) {\n  const styles = {\n    primary: 'bg-blue-500 text-white',\n    secondary: 'bg-gray-200 text-gray-800',\n  };\n  return (\n    <button\n      className={`px-4 py-2 rounded-lg ${styles[variant]}`}\n      onClick={onClick}\n    >\n      {label}\n    </button>\n  );\n}\n```\n\nClick 'Insert Code' to add.";
      else if (l.includes("explain")) r = `Explaining \`${activeFile}\`:\n\nThis file contains ${code.split("\n").length} lines of ${lang} code. It ${activeFile.includes("main") ? "serves as the entry point, importing modules and initializing the app" : activeFile.includes("app") ? "defines the main React component with state management" : activeFile.includes("util") ? "provides utility helper functions for formatting and string manipulation" : "handles configuration and styling"}.`;
      else if (l.includes("write") || l.includes("create") || l.includes("generate")) r = "```js\n// Generated by Alternus AI\nclass DataService {\n  #cache = new Map();\n\n  async get(key) {\n    if (this.#cache.has(key)) return this.#cache.get(key);\n    const data = await fetchData(`/api/${key}`);\n    this.#cache.set(key, data);\n    return data;\n  }\n\n  clear() {\n    this.#cache.clear();\n  }\n}\n\nexport default new DataService();\n```\n\nClick 'Insert Code' to add to your file.";
      else if (l.includes("refactor") || l.includes("optimize") || l.includes("improve")) r = `Optimization suggestions for \`${activeFile}\`:\n\n1. Extract repeated logic into helper functions\n2. Use const instead of let where possible\n3. Add JSDoc comments for better documentation\n4. Consider memoization for expensive operations\n\nWant me to apply these changes?`;
      else r = `I'll help with "${q}". Could you be more specific? For example:\n\n• "create a login form"\n• "fix the error on line 5"\n• "explain this code"\n• "write a fetch utility"`;
      setAiMsgs(p => [...p, { role: "ai", text: r }]);
    }, 600);
  };

  const SideIcon = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) => (
    <button title={label} onClick={onClick} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{ color: active ? "#fff" : "#555", background: active ? "#ffffff10" : "transparent" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#aaa"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#555"; }}>
      <I d={icon} s={16} />
    </button>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: bg }}>
      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity bar */}
        <div className="w-10 flex-shrink-0 flex flex-col items-center py-2 gap-1" style={{ background: bg, borderRight: `1px solid ${br}` }}>
          <SideIcon icon={ic.folder} label="Explorer" active={showExplorer} onClick={() => setShowExplorer(!showExplorer)} />
          <SideIcon icon={ic.search} label="Search" active={false} onClick={() => {}} />
          <SideIcon icon={ic.code} label="Source Control" active={false} onClick={() => {}} />
          <SideIcon icon={ic.terminal} label="Terminal" active={showTerminal} onClick={() => setShowTerminal(!showTerminal)} />
          <div className="flex-1" />
          <button title="AI Copilot" onClick={() => setShowAI(!showAI)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: showAI ? "linear-gradient(135deg, #EC4899, #8B5CF6, #06B6D4)" : "transparent", boxShadow: showAI ? "0 0 8px rgba(139,92,246,0.3)" : "none" }}>
            <I d={ic.sparkle} s={14} c={showAI ? "#fff" : "#555"} />
          </button>
          <SideIcon icon={ic.settings} label="Settings" active={false} onClick={() => {}} />
        </div>

        {/* File Explorer */}
        {showExplorer && (
          <div className="w-[140px] flex-shrink-0 flex flex-col overflow-y-auto py-1" style={{ background: bg2, borderRight: `1px solid ${br}`, scrollbarWidth: "none" }}>
            <p className="text-[9px] font-semibold uppercase tracking-wider px-3 py-1.5" style={{ color: "#666" }}>Explorer</p>
            {fileTree.map((item, i) => (
              <div key={i}>
                {item.type === "folder" ? (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-1 text-[10px]" style={{ color: "#aaa" }}>
                      <I d={ic.chevR} s={10} c="#666" /><I d={ic.folder} s={12} c="#E8A838" /><span>{item.name}</span>
                    </div>
                    {item.open && item.children?.map((child, j) => (
                      <button key={j} onClick={() => openFile(child.name)}
                        className="w-full flex items-center gap-1.5 pl-7 pr-3 py-1 text-[10px] text-left transition-colors"
                        style={{ color: activeFile === child.name ? "#fff" : "#888", background: activeFile === child.name ? "#ffffff10" : "transparent" }}
                        onMouseEnter={e => { if (activeFile !== child.name) e.currentTarget.style.background = "#ffffff08"; }}
                        onMouseLeave={e => { if (activeFile !== child.name) e.currentTarget.style.background = "transparent"; }}>
                        <I d={ic.fileText} s={11} c={child.lang === "React" ? "#61DAFB" : child.lang === "JavaScript" ? "#F7DF1E" : "#888"} /><span>{child.name}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <button onClick={() => openFile(item.name)}
                    className="w-full flex items-center gap-1.5 px-3 py-1 text-[10px] text-left transition-colors"
                    style={{ color: activeFile === item.name ? "#fff" : "#888", background: activeFile === item.name ? "#ffffff10" : "transparent" }}
                    onMouseEnter={e => { if (activeFile !== item.name) e.currentTarget.style.background = "#ffffff08"; }}
                    onMouseLeave={e => { if (activeFile !== item.name) e.currentTarget.style.background = "transparent"; }}>
                    <I d={ic.fileText} s={11} c={item.lang === "CSS" ? "#56B6C2" : item.lang === "JSON" ? "#CF8E6D" : "#888"} /><span>{item.name}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Editor panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center flex-shrink-0" style={{ background: bg2, borderBottom: `1px solid ${br}` }}>
            <div className="flex items-center flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {openTabs.map(name => (
                <div key={name} className="flex items-center group"
                  style={{ background: name === activeFile ? bg : "transparent", borderBottom: name === activeFile ? `2px solid ${accent}` : "2px solid transparent" }}>
                  <button onClick={() => setActiveFile(name)}
                    className="px-3 py-1.5 text-[10px] whitespace-nowrap"
                    style={{ color: name === activeFile ? "#fff" : "#666" }}>
                    {name}
                  </button>
                  <button onClick={e => { e.stopPropagation(); closeTab(name); }}
                    className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#555" }}>
                    <I d={ic.close} s={8} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 px-2">
              <button onClick={runCode} title="Run (Ctrl+Enter)" className="px-2.5 py-1 rounded-md text-[9px] font-semibold flex items-center gap-1.5" style={{ background: "#3A4A3F", color: "#8ABF8A" }}>
                <I d={ic.play} s={10} c="#8ABF8A" /> Run
              </button>
            </div>
          </div>

          {/* Welcome / Code editor */}
          {activeFile === "welcome" ? (
            <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: bg }}>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#E4E4E7" }}>Alternus Code v2.0</h1>
              <p className="text-[10px] mb-6" style={{ color: "#666" }}>AI-Integrated Development Environment</p>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: "#3B82F6" }} />
                <span className="text-xs font-semibold" style={{ color: "#999" }}>What&apos;s New</span>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { title: "AI Copilot", desc: "Write code with AI assistance. Generate functions, fix bugs, and refactor with natural language.", color: "#3B82F6" },
                  { title: "Multi-file Editor", desc: "Work across multiple files with tabbed editing. Support for JS, JSX, CSS, HTML, and JSON.", color: "#8B5CF6" },
                  { title: "Integrated Terminal", desc: "Run code directly with Ctrl+Enter. View output with colored status messages.", color: "#10B981" },
                  { title: "Voice Commands", desc: "Use voice to dictate code, ask questions, or navigate files hands-free.", color: "#F59E0B" },
                  { title: "Smart File Explorer", desc: "Browse project files with syntax-aware icons and folder tree navigation.", color: "#EC4899" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: bg3 }}>
                    <div className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5" style={{ background: item.color }} />
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "#D4D4D8" }}>{item.title}</p>
                      <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: "#777" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
                <span className="text-xs font-semibold" style={{ color: "#999" }}>Quick Start</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New File", desc: "Create empty file", icon: ic.plus },
                  { label: "Open Project", desc: "Browse files", icon: ic.folder },
                  { label: "Ask AI", desc: "Get coding help", icon: ic.sparkle },
                  { label: "Run Code", desc: "Execute current file", icon: ic.play },
                ].map((item, i) => (
                  <button key={i} onClick={() => { if (i === 0 || i === 1) openFile("main.js"); else if (i === 2) setShowAI(true); }}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                    style={{ background: bg3 }}
                    onMouseEnter={e => (e.currentTarget.style.background = br)}
                    onMouseLeave={e => (e.currentTarget.style.background = bg3)}>
                    <I d={item.icon} s={16} c="#666" />
                    <div>
                      <p className="text-[10px] font-semibold" style={{ color: "#D4D4D8" }}>{item.label}</p>
                      <p className="text-[8px]" style={{ color: "#555" }}>{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
          <div className="flex flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="w-10 flex-shrink-0 pt-2 text-right pr-3 select-none" style={{ color: "#444", background: bg }}>
              {code.split("\n").map((_, i) => <div key={i} className="text-[11px] leading-5 font-mono">{i + 1}</div>)}
            </div>
            <textarea
              className="flex-1 pt-2 pr-4 bg-transparent outline-none resize-none text-[12px] leading-5 font-mono"
              style={{ color: "#D4D4D4", tabSize: 2, scrollbarWidth: "none" as never }}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              onKeyDown={e => {
                if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget; const s = t.selectionStart; setCode(code.substring(0, s) + "  " + code.substring(t.selectionEnd)); setTimeout(() => { t.selectionStart = t.selectionEnd = s + 2; }, 0); }
                if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); runCode(); }
              }}
            />
          </div>
          )}

          {/* Terminal */}
          {showTerminal && (
            <div className="flex flex-col" style={{ height: 130, borderTop: `1px solid ${br}`, background: "#0A0A0C" }}>
              <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${br}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold" style={{ color: "#8ABF8A" }}>Terminal</span>
                  <span className="text-[8px]" style={{ color: "#444" }}>bash</span>
                </div>
                <button onClick={() => setOutput([])} className="text-[8px] px-1.5 py-0.5 rounded" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#aaa")} onMouseLeave={e => (e.currentTarget.style.color = "#555")}>Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[10px] leading-4" style={{ color: "#ccc", scrollbarWidth: "none" }}>
                {output.length === 0 && <span style={{ color: "#444" }}>$ _</span>}
                {output.map((line, i) => (
                  <div key={i} style={{ color: line.startsWith("✓") ? "#4ade80" : line.startsWith("✗") ? "#f87171" : line.startsWith("$") ? "#6C63FF" : "#aaa" }}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Copilot */}
        {showAI && (
          <div className="w-[230px] flex-shrink-0 flex flex-col" style={{ borderLeft: `1px solid ${br}`, background: bg2 }}>
            <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${br}` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#3B82F6" }}>
                <I d={ic.sparkle} s={10} c="#fff" />
              </div>
              <span className="text-[10px] font-bold flex-1" style={{ color: "#ccc" }}>AI Copilot</span>
              <button title="Voice" className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "#666" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#60a5fa"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#666"; }}>
                <I d={ic.voice} s={11} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2" style={{ scrollbarWidth: "none" }}>
              {aiMsgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className="max-w-[95%] px-3 py-2 rounded-xl text-[10px] leading-relaxed"
                    style={m.role === "user" ? { background: "#3A3A42", color: "#E4E4E7" } : { background: bg3, color: "#9A9AA5", border: `1px solid ${br}` }}>
                    <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                    {m.role === "ai" && m.text.includes("```") && (
                      <button onClick={() => {
                        const match = m.text.match(/```(?:js|jsx|javascript)?\n([\s\S]*?)```/);
                        if (match) setCode(prev => prev + "\n\n" + match[1].trim());
                      }} className="mt-2 px-2.5 py-1 rounded-md text-[9px] font-semibold" style={{ background: "#4A4A55", color: "#E4E4E7" }}>Insert Code</button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={aiEndRef} />
            </div>
            <div className="px-2 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${br}` }}>
              <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={{ background: bg3, border: `1px solid ${br}` }}>
                <input className="flex-1 bg-transparent outline-none text-[10px]" style={{ color: "#ccc" }}
                  placeholder="Ask AI to code..."
                  value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendAI(); }} />
                <button title="Attach file" className="p-1 rounded transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#999")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
                  <I d={ic.fileText} s={10} />
                </button>
                <button onClick={sendAI} className="p-1.5 rounded-lg" style={{ background: "#4A4A55" }}><I d={ic.send} s={10} c="#D4D4D8" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 h-6 flex-shrink-0" style={{ background: bg2, borderTop: `1px solid ${br}` }}>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-medium" style={{ color: "#8A8A95" }}>{lang}</span>
          <span className="text-[9px]" style={{ color: "#5A5A65" }}>Ln {code.split("\n").length}</span>
          <span className="text-[9px]" style={{ color: "#5A5A65" }}>{code.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px]" style={{ color: "#5A5A65" }}>UTF-8</span>
          <span className="text-[9px]" style={{ color: "#5A5A65" }}>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}

// ━━━━ CLOCK APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ClockApp({ c }: { c: typeof palette.dark }) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [tab, setTab] = useState<"clock" | "alarm" | "timer" | "stopwatch">("clock");
  const [time, setTime] = useState(new Date());
  const [timerSec, setTimerSec] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [alarms, setAlarms] = useState([{ time: "07:00", label: "Morning", on: true }, { time: "12:30", label: "Lunch", on: false }]);

  useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (!timerRunning || timerSec <= 0) return; const iv = setInterval(() => setTimerSec(s => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; }), 1000); return () => clearInterval(iv); }, [timerRunning, timerSec]);
  useEffect(() => { if (!swRunning) return; const iv = setInterval(() => setStopwatchMs(s => s + 10), 10); return () => clearInterval(iv); }, [swRunning]);

  const fmtTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const fmtSw = (ms: number) => { const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); const cs = Math.floor((ms % 1000) / 10); return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`; };

  const worldTimes = [
    { city: "New York", tz: "America/New_York" }, { city: "London", tz: "Europe/London" },
    { city: "Tokyo", tz: "Asia/Tokyo" }, { city: "Tirana", tz: "Europe/Tirane" },
  ];

  const timerMax = 1800;

  return (
    <div className="flex h-full">
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {(["clock", "alarm", "timer", "stopwatch"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 text-[10px] font-semibold capitalize text-center rounded-lg transition-colors"
            style={{ color: tab === t ? c.text : c.textMuted, background: tab === t ? c.cardAlt : "transparent" }}>{t}</button>
        ))}
        <button title="AI" onClick={() => setShowAIPanel(!showAIPanel)}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all ml-1 flex-shrink-0"
          style={{ background: "#3B82F6", boxShadow: showAIPanel ? "0 0 8px rgba(139,92,246,0.4)" : "none" }}>
          <I d={ic.sparkle} s={9} c="#fff" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>
        {/* CLOCK */}
        {tab === "clock" && (<>
          <p className="text-6xl font-black font-mono tracking-tight" style={{ color: c.text }}>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</p>
          <p className="text-xs mt-2 mb-6" style={{ color: c.accentText }}>{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          <div className="w-full space-y-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: c.textMuted }}>World Clock</p>
            {worldTimes.map((wt, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: c.cardAlt }}>
                <span className="text-xs font-medium" style={{ color: c.text }}>{wt.city}</span>
                <span className="text-xs font-mono font-bold" style={{ color: c.textSec }}>{new Date().toLocaleTimeString("en-US", { timeZone: wt.tz, hour: "2-digit", minute: "2-digit", hour12: false })}</span>
              </div>
            ))}
          </div>
        </>)}

        {/* ALARM */}
        {tab === "alarm" && (
          <div className="w-full space-y-2">
            {alarms.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: c.cardAlt }}>
                <div>
                  <p className="text-2xl font-bold font-mono" style={{ color: a.on ? c.text : c.textMuted }}>{a.time}</p>
                  <p className="text-[10px]" style={{ color: c.textMuted }}>{a.label}</p>
                </div>
                <button onClick={() => setAlarms(p => p.map((al, j) => j === i ? { ...al, on: !al.on } : al))}
                  className="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors" style={{ background: a.on ? c.accent : c.border }}>
                  <div className="w-5 h-5 rounded-full bg-white transition-all" style={{ marginLeft: a.on ? "18px" : "0px" }} />
                </button>
              </div>
            ))}
            <button onClick={() => setAlarms(p => [...p, { time: "08:00", label: "New Alarm", on: true }])}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-colors"
              style={{ border: `1px dashed ${c.border}`, color: c.accentText }}
              onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>+ Add Alarm</button>
          </div>
        )}

        {/* TIMER */}
        {tab === "timer" && (<>
          {/* Circle progress */}
          <div className="relative mb-4">
            <svg width={160} height={160} viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke={c.border} strokeWidth="6" />
              <circle cx="80" cy="80" r="70" fill="none" stroke={c.accent} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 70} strokeDashoffset={2 * Math.PI * 70 * (1 - timerSec / timerMax)}
                transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 0.3s" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-mono" style={{ color: c.text }}>{fmtTimer(timerSec)}</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>{timerRunning ? "Running" : "Paused"}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setTimerRunning(!timerRunning)} className="px-5 py-2 rounded-xl text-xs font-semibold" style={{ background: timerRunning ? c.cardAlt : c.accent, color: timerRunning ? c.text : "#fff" }}>{timerRunning ? "Pause" : "Start"}</button>
            <button onClick={() => { setTimerRunning(false); setTimerSec(300); }} className="px-5 py-2 rounded-xl text-xs font-semibold" style={{ background: c.cardAlt, color: c.text }}>Reset</button>
          </div>
          <div className="flex gap-1.5">
            {[{ l: "1m", s: 60 }, { l: "5m", s: 300 }, { l: "10m", s: 600 }, { l: "30m", s: 1800 }].map(p => (
              <button key={p.s} onClick={() => { setTimerSec(p.s); setTimerRunning(false); }}
                className="px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors"
                style={{ background: timerSec === p.s ? c.accentSoft : c.cardAlt, color: timerSec === p.s ? c.accentText : c.textMuted }}>{p.l}</button>
            ))}
          </div>
        </>)}

        {/* STOPWATCH */}
        {tab === "stopwatch" && (<>
          <p className="text-5xl font-black font-mono tracking-tight mb-2" style={{ color: c.text }}>{fmtSw(stopwatchMs)}</p>
          <p className="text-[10px] mb-6" style={{ color: c.textMuted }}>{swRunning ? "Running..." : stopwatchMs > 0 ? "Stopped" : "Ready"}</p>
          <div className="flex gap-2">
            <button onClick={() => setSwRunning(!swRunning)} className="px-6 py-2.5 rounded-xl text-xs font-semibold" style={{ background: swRunning ? c.cardAlt : c.accent, color: swRunning ? c.text : "#fff" }}>{swRunning ? "Stop" : "Start"}</button>
            <button onClick={() => { setSwRunning(false); setStopwatchMs(0); }} className="px-6 py-2.5 rounded-xl text-xs font-semibold" style={{ background: c.cardAlt, color: c.text }}>Reset</button>
          </div>
        </>)}
      </div>
    </div>
    {showAIPanel && <div className="w-[160px] flex-shrink-0"><AIPanel c={c} context="Clock" /></div>}
    </div>
  );
}

// ━━━━ CALCULATOR APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CalculatorApp({ c }: { c: typeof palette.dark }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const input = (val: string) => setDisplay(d => d === "0" || d === "Error" ? val : d + val);
  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); };
  const operate = (nextOp: string) => { const n = parseFloat(display); if (prev !== null && op) { const r = op === "+" ? prev + n : op === "-" ? prev - n : op === "×" ? prev * n : op === "÷" ? (n === 0 ? NaN : prev / n) : n; setDisplay(isNaN(r) ? "Error" : String(r)); setPrev(r); } else { setPrev(n); } setOp(nextOp); setDisplay("0"); };
  const equals = () => { const n = parseFloat(display); if (prev !== null && op) { const r = op === "+" ? prev + n : op === "-" ? prev - n : op === "×" ? prev * n : op === "÷" ? (n === 0 ? NaN : prev / n) : n; const expr = `${prev} ${op} ${n} = ${isNaN(r) ? "Error" : r}`; setHistory(p => [expr, ...p.slice(0, 19)]); setDisplay(isNaN(r) ? "Error" : String(r)); setPrev(null); setOp(null); } };
  const percent = () => setDisplay(String(parseFloat(display) / 100));
  const negate = () => setDisplay(String(-parseFloat(display)));

  const Btn = ({ label, wide, type, onClick }: { label: string; wide?: boolean; type?: "op" | "fn" | "eq"; onClick: () => void }) => (
    <button onClick={onClick}
      className={`${wide ? "col-span-2" : ""} rounded-2xl text-sm font-semibold transition-all`}
      style={{
        height: 48,
        background: type === "op" ? c.accent : type === "eq" ? c.accent : type === "fn" ? c.cardAlt : c.surface,
        color: type === "op" || type === "eq" ? "#fff" : type === "fn" ? c.textSec : c.text,
        border: type === "op" || type === "eq" ? "none" : `1px solid ${c.border}`,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>{label}</button>
  );

  return (
    <div className="flex h-full">
      {/* History sidebar */}
      {showHistory && (
        <div className="w-[130px] flex-shrink-0 flex flex-col py-2 px-1.5" style={{ borderRight: `1px solid ${c.border}`, background: c.bg }}>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[9px] font-semibold" style={{ color: c.textMuted }}>History</p>
            <button onClick={() => setHistory([])} className="text-[8px]" style={{ color: c.textMuted }}>Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {history.length === 0 && <p className="text-[9px] px-2 py-4 text-center" style={{ color: c.textMuted }}>No calculations yet</p>}
            {history.map((h, i) => (
              <div key={i} className="px-2 py-1.5 mb-0.5 rounded-lg text-[9px] font-mono transition-colors"
                style={{ color: c.textSec }}
                onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{h}</div>
            ))}
          </div>
        </div>
      )}

      {/* Calculator */}
      <div className="flex-1 flex flex-col">
        {/* Menu button */}
        <div className="flex items-center justify-between px-4 pt-2 flex-shrink-0">
          <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 rounded-lg transition-colors"
            style={{ color: showHistory ? c.accentText : c.textMuted, background: showHistory ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (!showHistory) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (!showHistory) e.currentTarget.style.background = "transparent"; }}>
            <I d={ic.menu} s={14} />
          </button>
        </div>
        {/* Display */}
        <div className="px-5 pt-2 pb-4 flex-shrink-0">
          {op && <p className="text-[11px] text-right mb-1 font-mono" style={{ color: c.textMuted }}>{prev} {op}</p>}
          <p className="text-4xl font-bold text-right truncate font-mono" style={{ color: c.text }}>{display}</p>
        </div>
        {/* Buttons grid */}
        <div className="grid grid-cols-4 gap-2 px-3 pb-3 flex-1 content-end">
          <Btn label="C" type="fn" onClick={clear} />
          <Btn label="±" type="fn" onClick={negate} />
          <Btn label="%" type="fn" onClick={percent} />
          <Btn label="÷" type="op" onClick={() => operate("÷")} />
          <Btn label="7" onClick={() => input("7")} />
          <Btn label="8" onClick={() => input("8")} />
          <Btn label="9" onClick={() => input("9")} />
          <Btn label="×" type="op" onClick={() => operate("×")} />
          <Btn label="4" onClick={() => input("4")} />
          <Btn label="5" onClick={() => input("5")} />
          <Btn label="6" onClick={() => input("6")} />
          <Btn label="-" type="op" onClick={() => operate("-")} />
          <Btn label="1" onClick={() => input("1")} />
          <Btn label="2" onClick={() => input("2")} />
          <Btn label="3" onClick={() => input("3")} />
          <Btn label="+" type="op" onClick={() => operate("+")} />
          <Btn label="0" wide onClick={() => input("0")} />
          <Btn label="." onClick={() => { if (!display.includes(".")) input("."); }} />
          <Btn label="=" type="eq" onClick={equals} />
        </div>
      </div>
    </div>
  );
}

// ━━━━ ACCOUNTS APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AccountsApp({ c }: { c: typeof palette.dark }) {
  const [accounts, setAccounts] = useState([
    { name: "Google", user: "admin@gmail.com", icon: ic.globe, color: "#4285F4" },
    { name: "GitHub", user: "alternuslamiart", icon: ic.code, color: "#8B5CF6" },
    { name: "Alternus Cloud", user: "admin@alternus.art", icon: ic.cloud, color: "#06B6D4" },
    { name: "Microsoft", user: "admin@outlook.com", icon: ic.monitor, color: "#00A4EF" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUser, setNewUser] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <p className="text-xs font-semibold" style={{ color: c.text }}>Saved Accounts</p>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1 rounded-md" style={{ color: c.accentText }}><I d={ic.plus} s={14} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "none" }}>
        {showAdd && (
          <div className="p-3 rounded-xl mb-2 space-y-2" style={{ background: c.cardAlt }}>
            <input className="w-full px-3 py-1.5 rounded-lg text-[11px] bg-transparent outline-none" style={{ color: c.text, border: `1px solid ${c.border}` }} placeholder="Service name..." value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="w-full px-3 py-1.5 rounded-lg text-[11px] bg-transparent outline-none" style={{ color: c.text, border: `1px solid ${c.border}` }} placeholder="Username/Email..." value={newUser} onChange={e => setNewUser(e.target.value)} />
            <button onClick={() => { if (newName && newUser) { setAccounts(p => [...p, { name: newName, user: newUser, icon: ic.key, color: c.accentText }]); setNewName(""); setNewUser(""); setShowAdd(false); } }}
              className="w-full py-1.5 rounded-lg text-[10px] font-medium" style={{ background: c.accent, color: "#fff" }}>Save Account</button>
          </div>
        )}
        {accounts.map((acc, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-0.5"
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: acc.color + "20" }}>
              <I d={acc.icon} s={16} c={acc.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: c.text }}>{acc.name}</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>{acc.user}</p>
            </div>
            <button onClick={() => setAccounts(p => p.filter((_, j) => j !== i))} className="p-1 rounded-md opacity-0 group-hover:opacity-100" style={{ color: c.textMuted }} title="Remove">
              <I d={ic.close} s={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ━━━━ DOWNLOADS APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DownloadsApp({ c }: { c: typeof palette.dark }) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [tab, setTab] = useState<"downloads" | "uploads" | "install">("downloads");
  const [installStep, setInstallStep] = useState(0); // 0=select, 1=policy, 2=installing, 3=done
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const downloads = [
    { name: "AlternusOS-v2.0.dmg", size: "1.2 GB", progress: 100, speed: "", status: "Complete" },
    { name: "font-pack-pro.zip", size: "45 MB", progress: 100, speed: "", status: "Complete" },
    { name: "design-assets-v3.zip", size: "120 MB", progress: 67, speed: "4.2 MB/s", status: "Downloading" },
    { name: "neural-engine-sdk.tar.gz", size: "340 MB", progress: 23, speed: "8.1 MB/s", status: "Downloading" },
  ];

  const uploads = [
    { name: "project-backup.zip", size: "89 MB", progress: 100, status: "Uploaded" },
    { name: "report-final.pdf", size: "2.4 MB", progress: 100, status: "Uploaded" },
    { name: "screenshots.zip", size: "15 MB", progress: 45, status: "Uploading" },
  ];

  const installApps = [
    { name: "Alternus Code Pro", desc: "AI-powered IDE with cloud sync", size: "280 MB", icon: ic.code, color: "#3B82F6" },
    { name: "Alternus Paint Studio", desc: "Professional illustration suite", size: "420 MB", icon: ic.pen, color: "#8B5CF6" },
    { name: "CloudSync Enterprise", desc: "Enterprise file synchronization", size: "85 MB", icon: ic.cloud, color: "#06B6D4" },
    { name: "Neural Engine SDK", desc: "AI/ML development toolkit", size: "340 MB", icon: ic.cpu, color: "#F59E0B" },
  ];

  useEffect(() => {
    if (installStep === 2) {
      const iv = setInterval(() => {
        setInstallProgress(p => {
          if (p >= 100) { clearInterval(iv); setInstallStep(3); return 100; }
          return p + Math.random() * 8 + 2;
        });
      }, 200);
      return () => clearInterval(iv);
    }
  }, [installStep]);

  const startInstall = () => {
    setInstallProgress(0);
    setInstallStep(2);
  };

  return (
    <div className="flex h-full">
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs + AI/Voice */}
      <div className="flex items-center px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {(["downloads", "uploads", "install"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === "install") { setInstallStep(0); setSelectedApp(null); setPolicyAccepted(false); } }}
            className="flex-1 py-1.5 text-[10px] font-semibold capitalize text-center rounded-lg transition-colors"
            style={{ color: tab === t ? c.text : c.textMuted, background: tab === t ? c.cardAlt : "transparent" }}>
            {t === "install" ? "Install App" : t}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <button title="AI Assistant" onClick={() => setShowAIPanel(!showAIPanel)}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{ background: "#3B82F6" }}>
            <I d={ic.sparkle} s={10} c="#fff" />
          </button>
          <button title="Voice" className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ color: c.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.accentText; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.voice} s={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
        {/* DOWNLOADS LIST */}
        {tab === "downloads" && (
          <div className="space-y-2">
            {downloads.map((d, i) => (
              <div key={i} className="p-3 rounded-2xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <I d={ic.download} s={14} c={d.progress === 100 ? c.success : c.accentText} />
                    <p className="text-[11px] font-medium truncate" style={{ color: c.text }}>{d.name}</p>
                  </div>
                  <span className="text-[9px] ml-2" style={{ color: c.textMuted }}>{d.size}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(d.progress, 100)}%`, background: d.progress === 100 ? c.success : c.accent }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px]" style={{ color: d.progress === 100 ? c.success : c.accentText }}>{d.status}</span>
                  <span className="text-[8px]" style={{ color: c.textMuted }}>{d.speed || `${d.progress}%`}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPLOADS LIST */}
        {tab === "uploads" && (
          <div className="space-y-2">
            {uploads.map((u, i) => (
              <div key={i} className="p-3 rounded-2xl" style={{ background: c.cardAlt }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <I d={ic.upload} s={14} c={u.progress === 100 ? c.success : c.accentText} />
                    <p className="text-[11px] font-medium truncate" style={{ color: c.text }}>{u.name}</p>
                  </div>
                  <span className="text-[9px] ml-2" style={{ color: c.textMuted }}>{u.size}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                  <div className="h-full rounded-full" style={{ width: `${u.progress}%`, background: u.progress === 100 ? c.success : c.accent }} />
                </div>
                <span className="text-[8px]" style={{ color: u.progress === 100 ? c.success : c.accentText }}>{u.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* INSTALL WIZARD */}
        {tab === "install" && (
          <>
            {/* Step indicator */}
            <div className="flex items-center mb-5 px-1">
              {["Select", "Policy", "Install", "Done"].map((s, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: installStep >= i ? c.accent : c.cardAlt, color: installStep >= i ? "#fff" : c.textMuted }}>
                      {installStep > i ? "✓" : i + 1}
                    </div>
                    <span className="text-[8px] font-semibold" style={{ color: installStep >= i ? c.text : c.textMuted }}>{s}</span>
                  </div>
                  {i < 3 && <div className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: installStep > i ? c.accent : c.border }} />}
                </div>
              ))}
            </div>

            {/* Step 0: Select App */}
            {installStep === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold mb-2" style={{ color: c.text }}>Select Application</p>
                {installApps.map((app, i) => (
                  <button key={i} onClick={() => setSelectedApp(app.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors"
                    style={{ background: selectedApp === app.name ? c.accentSoft : c.cardAlt, border: selectedApp === app.name ? `1px solid ${c.accent}` : `1px solid transparent` }}
                    onMouseEnter={e => { if (selectedApp !== app.name) e.currentTarget.style.background = c.border; }}
                    onMouseLeave={e => { if (selectedApp !== app.name) e.currentTarget.style.background = selectedApp === app.name ? c.accentSoft : c.cardAlt; }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: app.color + "15" }}>
                      <I d={app.icon} s={18} c={app.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold" style={{ color: c.text }}>{app.name}</p>
                      <p className="text-[8px]" style={{ color: c.textMuted }}>{app.desc}</p>
                    </div>
                    <span className="text-[9px]" style={{ color: c.textMuted }}>{app.size}</span>
                  </button>
                ))}
                <button onClick={() => { if (selectedApp) setInstallStep(1); }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold mt-3"
                  style={{ background: selectedApp ? c.accent : c.cardAlt, color: selectedApp ? "#fff" : c.textMuted }}>
                  Next →
                </button>
              </div>
            )}

            {/* Step 1: Policy */}
            {installStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold" style={{ color: c.text }}>License Agreement</p>
                <div className="p-3 rounded-xl text-[9px] leading-relaxed max-h-[180px] overflow-y-auto" style={{ background: c.cardAlt, color: c.textSec, scrollbarWidth: "none" }}>
                  <p className="font-semibold mb-2">Alternus Software License Agreement</p>
                  <p>By installing this software, you agree to the following terms:</p>
                  <p className="mt-2">1. This software is provided &quot;as is&quot; without warranty of any kind.</p>
                  <p>2. You may use this software for personal and commercial purposes.</p>
                  <p>3. Redistribution requires written permission from Alternus.</p>
                  <p>4. The software may collect anonymous usage analytics.</p>
                  <p>5. Updates will be provided automatically unless disabled.</p>
                  <p className="mt-2">6. You agree not to reverse-engineer or decompile the software.</p>
                  <p>7. Alternus reserves the right to modify these terms.</p>
                  <p className="mt-2">For full terms, visit alternus.art/legal</p>
                </div>
                <label className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setPolicyAccepted(!policyAccepted)}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                    style={{ background: policyAccepted ? c.accent : "transparent", border: `2px solid ${policyAccepted ? c.accent : c.border}` }}>
                    {policyAccepted && <I d="M20 6L9 17l-5-5" s={12} c="#fff" />}
                  </div>
                  <span className="text-[10px]" style={{ color: c.text }}>I accept the license agreement</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setInstallStep(0)} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background: c.cardAlt, color: c.text }}>← Back</button>
                  <button onClick={() => { if (policyAccepted) startInstall(); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: policyAccepted ? c.accent : c.cardAlt, color: policyAccepted ? "#fff" : c.textMuted }}>
                    Install →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Installing */}
            {installStep === 2 && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative mb-6">
                  <svg width={140} height={140} viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke={c.border} strokeWidth="5" />
                    <circle cx="70" cy="70" r="58" fill="none" stroke={c.accent} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - Math.min(installProgress, 100) / 100)}
                      transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 0.2s" }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: c.accent }}>{Math.min(Math.round(installProgress), 100)}%</span>
                  </div>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: c.text }}>Installing {selectedApp}...</p>
                <p className="text-[10px]" style={{ color: c.textMuted }}>
                  {installProgress < 20 ? "Preparing files..." : installProgress < 50 ? "Extracting components..." : installProgress < 80 ? "Configuring application..." : "Finalizing installation..."}
                </p>
              </div>
            )}

            {/* Step 3: Done */}
            {installStep === 3 && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: c.success + "20" }}>
                  <I d="M20 6L9 17l-5-5" s={28} c={c.success} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: c.text }}>Installation Complete</p>
                <p className="text-[10px] mb-4" style={{ color: c.textMuted }}>{selectedApp} has been installed successfully.</p>
                <div className="flex gap-2">
                  <button onClick={() => { setInstallStep(0); setSelectedApp(null); setPolicyAccepted(false); }}
                    className="px-4 py-2 rounded-xl text-[10px] font-medium" style={{ background: c.cardAlt, color: c.text }}>Install Another</button>
                  <button className="px-4 py-2 rounded-xl text-[10px] font-semibold" style={{ background: c.accent, color: "#fff" }}>Open App</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    {showAIPanel && <div className="w-[180px] flex-shrink-0"><AIPanel c={c} context="Downloads" /></div>}
    </div>
  );
}

// ━━━━ MAIN OS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AlternusOS() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [time, setTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState<BootPhase>("bios");
  const [zCounter, setZCounter] = useState(10);
  const [showApps, setShowApps] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWifiPanel, setShowWifiPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [connectedWifi, setConnectedWifi] = useState(0);
  const [showTaskSwitcher, setShowTaskSwitcher] = useState(false);
  const [taskSwitcherIdx, setTaskSwitcherIdx] = useState(0);
  const [systemModal, setSystemModal] = useState<SystemModal>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiActions, setAiActions] = useState<{ label: string; action: WinId }[]>([]);
  // AI features
  const [aiNotifications, setAiNotifications] = useState<AINotification[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<{ message: string; actions: { label: string; action: () => void }[] } | null>(null);
  const [closeChain, setCloseChain] = useState<{ appId: WinId; title: string } | null>(null);
  const [smartDND, setSmartDND] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [installingApp, setInstallingApp] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [paymentModal, setPaymentModal] = useState<{ name: string; price: string; icon: string; iconBg: string } | null>(null);
  const lastMouseMove = useRef(Date.now());

  const c = palette[mode];

  const defaultWins: WinState[] = [
    { id: "ai", title: "Notes", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 0, y: 0, w: 360, h: 800 },
    { id: "terminal", title: "Terminal", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 80, w: 460, h: 340 },
    { id: "code", title: "Code Editor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 50, w: 520, h: 400 },
    { id: "files", title: "Files", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 240, y: 70, w: 520, h: 400 },
    { id: "settings", title: "Settings", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 60, w: 500, h: 380 },
    { id: "music", title: "Music", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 340, h: 360 },
    { id: "weather", title: "Weather", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 350, y: 70, w: 340, h: 360 },
    { id: "calendar", title: "Calendar", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 380, y: 90, w: 320, h: 340 },
    { id: "notes", title: "Notes", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 220, y: 80, w: 400, h: 340 },
    { id: "browser", title: "Browser", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, w: 540, h: 400 },
    { id: "store", title: "Store", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 40, y: 40, w: 540, h: 460 },
    { id: "movies", title: "Movies", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 260, y: 50, w: 480, h: 380 },
    { id: "word", title: "Alternus Word", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 50, w: 540, h: 400 },
    { id: "clock", title: "Clock", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 400, y: 100, w: 360, h: 420 },
    { id: "calculator", title: "Calculator", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 500, y: 80, w: 320, h: 440 },
    { id: "accounts", title: "Accounts", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 90, w: 360, h: 400 },
    { id: "downloads", title: "Downloads", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 350, y: 80, w: 440, h: 480 },
  ];

  const [wins, setWins] = useState<WinState[]>(defaultWins);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Boot animation with phases
  useEffect(() => {
    if (!isBooting) return;
    setBootPhase("bios");
    setBootProgress(0);
    const start = Date.now();
    const duration = 4500;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setBootProgress(progress);
      if (progress < 0.15) setBootPhase("bios");
      else if (progress < 0.35) setBootPhase("hardware");
      else if (progress < 0.6) setBootPhase("kernel");
      else if (progress < 0.85) setBootPhase("services");
      else if (progress < 1) setBootPhase("desktop");
      else setBootPhase("done");
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsBooting(false), 400);
      }
    };
    requestAnimationFrame(animate);
  }, [isBooting]);

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  // ━━━━ AI HELPERS (defined before useEffects that need them) ━━━━
  const addAINotification = useCallback((type: AINotification["type"], title: string, message: string, icon: string, actions?: AINotification["actions"]) => {
    const notif: AINotification = { id: Date.now().toString(), title, message, icon, time: "Just now", type, actions, read: false };
    setAiNotifications(prev => [notif, ...prev.slice(0, 19)]);
  }, []);

  const addTimelineEvent = useCallback((action: string, app: string, icon: string) => {
    const now = new Date();
    const t = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setTimeline(prev => [{ time: t, action, app, icon }, ...prev.slice(0, 49)]);
  }, []);

  // ━━━━ AI ADAPTIVE AUTHENTICATION ━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (isLocked || isBooting) return;
    const hour = new Date().getHours();
    if (hour >= 1 && hour <= 5) {
      const timer = setTimeout(() => {
        if (!smartDND) {
          addAINotification("security", "Adaptive Security", `It's ${hour}:${new Date().getMinutes().toString().padStart(2, "0")} AM. Unusual activity detected. AI is monitoring this session.`, ic.shield);
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBooting, smartDND, addAINotification]);

  // ━━━━ SMART DO NOT DISTURB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (isLocked || isBooting) return;
    const handler = () => { lastMouseMove.current = Date.now(); };
    window.addEventListener("mousemove", handler);
    const interval = setInterval(() => {
      const idle = Date.now() - lastMouseMove.current;
      if (idle > 30000 && !smartDND) {
        setSmartDND(true);
        addAINotification("system", "Focus Mode", "AI detected you're focused. Do Not Disturb enabled. All non-critical notifications paused.", ic.shield);
      } else if (idle < 5000 && smartDND) {
        setSmartDND(false);
      }
    }, 10000);
    return () => { window.removeEventListener("mousemove", handler); clearInterval(interval); };
  }, [isLocked, isBooting, smartDND, addAINotification]);

  const openWin = useCallback((id: WinId) => {
    setZCounter(z => z + 1);
    const sw = typeof window !== "undefined" ? window.innerWidth : 1400;
    const sh = typeof window !== "undefined" ? window.innerHeight - 40 : 700;
    // Per-app ideal sizes
    const sizes: Record<WinId, { w: number; h: number }> = {
      ai: { w: 480, h: 400 },
      terminal: { w: 620, h: 400 },
      code: { w: 900, h: 560 },
      files: { w: 640, h: 460 },
      settings: { w: 660, h: 480 },
      music: { w: 380, h: 420 },
      weather: { w: 380, h: 420 },
      calendar: { w: 360, h: 400 },
      notes: { w: 480, h: 400 },
      browser: { w: 820, h: 540 },
      store: { w: 680, h: 500 },
      movies: { w: 560, h: 440 },
      word: { w: 760, h: 520 },
      clock: { w: 380, h: 460 },
      calculator: { w: 320, h: 460 },
      accounts: { w: 380, h: 440 },
      downloads: { w: 440, h: 480 },
    };
    setWins(p => p.map(w => {
      if (w.id === id) {
        if (!w.isOpen) {
          const s = sizes[id];
          // Fixed positions: Weather top-right, Calendar top-right, others center
          const x = id === "weather" ? sw - s.w - 10 : id === "calendar" ? sw - s.w - 10 : Math.max(0, Math.floor((sw - s.w) / 2));
          const y = id === "weather" ? 10 : id === "calendar" ? 10 : Math.max(0, Math.floor((sh - s.h) / 2));
          return { ...w, isOpen: true, isMinimized: false, zIndex: zCounter + 1, x, y, w: s.w, h: s.h };
        }
        if (w.isMinimized) return { ...w, isMinimized: false, zIndex: zCounter + 1 };
        return { ...w, zIndex: zCounter + 1 };
      }
      return w;
    }));
  }, [zCounter]);

  const closeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
  }, []);

  const minimizeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  const maximizeWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  }, []);

  const focusWin = useCallback((id: WinId) => {
    setZCounter(z => z + 1);
    setWins(p => p.map(w => w.id === id ? { ...w, zIndex: zCounter + 1 } : w));
  }, [zCounter]);

  const moveWin = useCallback((id: WinId, x: number, y: number) => {
    setWins(p => p.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const resizeWin = useCallback((id: WinId, w: number, h: number) => {
    setWins(p => p.map(win => win.id === id ? { ...win, w, h } : win));
  }, []);

  const snapWin = useCallback((id: WinId, side: "left" | "right") => {
    const hw = Math.floor(window.innerWidth / 2);
    const fh = window.innerHeight - 36; // minus top bar
    setWins(p => p.map(w => w.id === id ? { ...w, x: side === "left" ? 0 : hw, y: 0, w: hw, h: fh, isMaximized: false } : w));
  }, []);

  const forceQuitWin = useCallback((id: WinId) => {
    setWins(p => p.map(w => w.id === id ? { ...w, isOpen: false, isFrozen: false, isMinimized: false, isMaximized: false } : w));
    setSystemModal({ type: "info", title: "App Terminated", message: `The application was force quit successfully.` });
    setTimeout(() => setSystemModal(null), 3000);
  }, []);

  // ━━━━ STORE INSTALL HANDLER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleInstallApp = useCallback((appName: string) => {
    if (installedApps.includes(appName) || installingApp) return;
    setInstallingApp(appName);
    setInstallProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setInstallProgress(100);
        setTimeout(() => {
          setInstalledApps(prev => [...prev, appName]);
          setInstallingApp(null);
          setInstallProgress(0);
          setSystemModal({ type: "info", title: "Installed", message: `${appName} has been installed\nsuccessfully.` });
          setTimeout(() => setSystemModal(null), 2500);
        }, 400);
      } else {
        setInstallProgress(Math.min(progress, 99));
      }
    }, 200);
  }, [installedApps, installingApp]);

  const handlePaidInstall = useCallback(() => {
    if (!paymentModal) return;
    const appName = paymentModal.name;
    setPaymentModal(null);
    handleInstallApp(appName);
  }, [paymentModal, handleInstallApp]);

  // ━━━━ PREDICTIVE WORKSPACE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const openWinWithAI = useCallback((id: WinId) => {
    openWin(id);
    addTimelineEvent("Opened", id, (ic as Record<string, string>)[id] || ic.sparkle);

    const related = aiWorkspaceRules[id];
    if (related) {
      const openIds = wins.filter(w => w.isOpen).map(w => w.id);
      const suggestions = related.filter(r => !openIds.includes(r));
      if (suggestions.length > 0 && !smartDND) {
        setTimeout(() => {
          const names = suggestions.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ");
          setAiSuggestion({
            message: `AI: Opening ${id}. Want me to also open ${names}?`,
            actions: [
              { label: `Open ${names}`, action: () => { suggestions.forEach(s => openWin(s)); setAiSuggestion(null); } },
              { label: "No thanks", action: () => setAiSuggestion(null) },
            ],
          });
        }, 1500);
      }
    }

    // Contextual snapping
    const openApps = [...wins.filter(w => w.isOpen && !w.isMinimized).map(w => w.id), id];
    for (const rule of aiContextualApps.snap) {
      if (rule.combo.every(cid => openApps.includes(cid)) && !openApps.includes(rule.suggest)) {
        setTimeout(() => {
          if (!smartDND) addAINotification("suggestion", "Contextual Suggestion", rule.label, ic.sparkle, [{ label: `Open ${rule.suggest}`, handler: rule.suggest }]);
        }, 3000);
        break;
      }
    }
  }, [openWin, wins, smartDND, addTimelineEvent, addAINotification]);

  // ━━━━ ACTION CHAINING (Smart Close) ━━━━━━━━━━━━━━━━━━━
  const closeWinWithAI = useCallback((id: WinId) => {
    const win = wins.find(w => w.id === id);
    if (!win || !win.isOpen) return;
    if (["word", "notes", "code"].includes(id) && !smartDND) {
      setCloseChain({ appId: id, title: win.title });
    } else {
      closeWin(id);
      addTimelineEvent("Closed", id, (ic as Record<string, string>)[id] || ic.sparkle);
    }
  }, [wins, closeWin, smartDND, addTimelineEvent]);

  // Alt+Tab task switcher
  useEffect(() => {
    const openWins = wins.filter(w => w.isOpen && !w.isMinimized);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        if (openWins.length === 0) return;
        if (!showTaskSwitcher) {
          setShowTaskSwitcher(true);
          setTaskSwitcherIdx(0);
        } else {
          setTaskSwitcherIdx(prev => (prev + 1) % openWins.length);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" && showTaskSwitcher) {
        setShowTaskSwitcher(false);
        const openW = wins.filter(w => w.isOpen && !w.isMinimized);
        if (openW[taskSwitcherIdx]) {
          focusWin(openW[taskSwitcherIdx].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [wins, showTaskSwitcher, taskSwitcherIdx, focusWin]);

  const handleDesktopSearch = () => {
    const q = aiInput.trim().toLowerCase();
    if (!q) return;
    addTimelineEvent("Searched", `"${aiInput.trim()}"`, ic.search);

    // ━━━ APP KEYWORD MAP — every keyword opens the right app ━━━
    const appMap: { keys: string[]; response: string; actions: { label: string; action: WinId }[] }[] = [
      // Browser & Web
      { keys: ["google", "browse", "browser", "web", "search", "internet", "url", "website", "http", "youtube", "facebook", "instagram", "twitter", "reddit", "wikipedia", "linkedin", "amazon", "ebay", "netflix", "spotify", "tiktok", "pinterest", "stackoverflow", "github"],
        response: "Opening browser for you.", actions: [{ label: "Open Browser", action: "browser" }] },
      // Code & Development
      { keys: ["code", "program", "develop", "javascript", "python", "html", "css", "react", "typescript", "debug", "compile", "script", "function", "variable", "api", "claude", "ai code", "copilot", "vscode", "editor", "ide", "git", "npm", "node"],
        response: "Ready to code. Opening the code editor.", actions: [{ label: "Open Code Editor", action: "code" }] },
      // Terminal
      { keys: ["terminal", "command", "shell", "bash", "cmd", "console", "cli", "ssh", "ping", "npm run", "yarn", "pip"],
        response: "Opening terminal for command line access.", actions: [{ label: "Open Terminal", action: "terminal" }] },
      // Files & Documents
      { keys: ["file", "document", "folder", "directory", "explorer", "download", "upload", "pdf", "docx", "xlsx", "zip", "rar", "copy", "paste", "move", "rename", "delete file"],
        response: "Opening the file manager.", actions: [{ label: "Open Files", action: "files" }] },
      // Music & Audio
      { keys: ["music", "song", "play", "playlist", "album", "artist", "spotify", "audio", "mp3", "radio", "podcast", "beats", "dj", "sound", "volume"],
        response: "Opening the music player.", actions: [{ label: "Open Music", action: "music" }] },
      // Weather
      { keys: ["weather", "temperature", "rain", "sunny", "cloudy", "forecast", "storm", "snow", "wind", "humidity", "celsius", "fahrenheit", "climate"],
        response: `Currently 17° and partly cloudy in your area. Opening weather for details.`, actions: [{ label: "Open Weather", action: "weather" }] },
      // Calendar & Time
      { keys: ["calendar", "schedule", "event", "meeting", "appointment", "date", "today", "tomorrow", "week", "month", "birthday", "deadline", "planner", "agenda"],
        response: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Opening calendar.`, actions: [{ label: "Open Calendar", action: "calendar" }] },
      // Clock
      { keys: ["alarm", "clock", "timer", "stopwatch", "time", "reminder", "world clock", "countdown"],
        response: "Opening Clock app.", actions: [{ label: "Open Clock", action: "clock" }] },
      // Calculator
      { keys: ["calculator", "calculate", "math", "add", "subtract", "multiply", "divide", "sum", "percentage", "convert"],
        response: "Opening Calculator.", actions: [{ label: "Open Calculator", action: "calculator" }] },
      // Accounts
      { keys: ["account", "login", "password", "credential", "saved account", "sign in", "profile", "username"],
        response: "Opening your saved accounts.", actions: [{ label: "Open Accounts", action: "accounts" }] },
      // Downloads
      { keys: ["download", "upload", "install", "update", "package", "setup", "installer", "transfer"],
        response: "Opening Downloads & Install manager.", actions: [{ label: "Open Downloads", action: "downloads" }] },
      // Notes & Writing
      { keys: ["note", "write", "memo", "todo", "checklist", "list", "journal", "diary", "scratch", "jot", "brainstorm", "idea"],
        response: "Opening Notes for you.", actions: [{ label: "Open Notes", action: "notes" }] },
      // Word & Documents
      { keys: ["word", "document", "letter", "essay", "report", "resume", "cv", "thesis", "article", "blog", "paper", "manuscript", "format", "paragraph", "font", "bold", "italic", "heading"],
        response: "Opening Alternus Word for document editing.", actions: [{ label: "Open Word", action: "word" }] },
      // Settings & System
      { keys: ["setting", "config", "theme", "dark mode", "light mode", "wifi", "bluetooth", "network", "display", "brightness", "language", "notification", "privacy", "security", "update", "system", "preference", "account", "password", "storage", "battery"],
        response: "Opening settings.", actions: [{ label: "Open Settings", action: "settings" }] },
      // Store & Shopping
      { keys: ["store", "shop", "buy", "purchase", "app store", "download app", "install", "marketplace", "shopping", "cart", "order", "product", "price", "deal", "sale", "discount", "ecommerce"],
        response: "Opening the Store for you.", actions: [{ label: "Open Store", action: "store" }] },
      // Movies & Video
      { keys: ["movie", "film", "video", "watch", "stream", "cinema", "series", "tv show", "anime", "documentary", "trailer", "imdb", "popcorn", "subtitle", "episode", "season"],
        response: "Opening Movies. What would you like to watch?", actions: [{ label: "Open Movies", action: "movies" }] },
      // AI Chat
      { keys: ["ai", "chat", "assistant", "help me", "ask", "question", "explain", "translate", "summarize", "generate", "create", "analyze", "solve", "calculate", "math", "gpt", "claude", "chatbot", "conversation"],
        response: "I'm here to help! Opening AI Chat.", actions: [{ label: "Open AI Chat", action: "ai" }] },
      // Design & Illustration
      { keys: ["illustrator", "design", "draw", "paint", "sketch", "art", "photoshop", "figma", "canvas", "graphic", "logo", "icon", "illustration", "vector", "pixel", "color", "gradient", "brush", "layer"],
        response: "For design work, I recommend opening the Code Editor for SVG/CSS design, or the Browser for Figma.", actions: [{ label: "Open Code Editor", action: "code" }, { label: "Open Browser", action: "browser" }] },
    ];

    // ━━━ SEMANTIC FILE SEARCH ━━━
    const fileMatches = aiFileIndex.filter(f => f.content.split(" ").some(w => q.includes(w)) || f.name.toLowerCase().includes(q) || f.tags.some(t => q.includes(t)));
    if (fileMatches.length > 0) {
      const fileList = fileMatches.map(f => `• ${f.name} (${f.path})`).join("\n");
      const tags = Array.from(new Set(fileMatches.flatMap(f => f.tags)));
      const clusterInfo = tags.length > 0 ? `\n\nAI auto-grouped by: ${tags.join(", ")}` : "";
      setAiResponse(`AI found ${fileMatches.length} file${fileMatches.length > 1 ? "s" : ""} matching your search:\n\n${fileList}${clusterInfo}`);
      setAiActions([{ label: "Open Files", action: "files" }]);
      return;
    }

    // ━━━ AI FILE MANAGEMENT ━━━
    if (q.includes("cleanup") || q.includes("clean") || q.includes("archive") || q.includes("unused")) {
      setAiResponse("AI Predictive Cleanup found:\n\n• design_old.fig — not opened in 6 months\n• backup_jan.zip — 45 MB, created 8 months ago\n• draft_v1.docx — superseded by v3\n\nWant me to move these to Archive or delete them?");
      setAiActions([{ label: "Archive All", action: "files" }, { label: "Open Files", action: "files" }]);
      return;
    }
    if (q.includes("classify") || q.includes("organize") || q.includes("sort files") || q.includes("categorize")) {
      setAiResponse("AI Classification complete:\n\n📁 Documents → 12 files (contracts, reports, notes)\n📁 Media → 8 files (images, videos)\n📁 Code → 6 files (scripts, configs)\n📁 Archives → 4 files (zips, backups)\n\nAll files tagged and sorted automatically.");
      setAiActions([{ label: "Open Files", action: "files" }]);
      return;
    }
    if (q.includes("duplicate") || q.includes("find duplicate")) {
      setAiResponse("AI Duplicate Scan:\n\n• report_v2.docx ↔ report_final.docx (98% match)\n• screenshot.png ↔ screenshot_copy.png (identical)\n• backup.zip ↔ backup_old.zip (same content)\n\nTotal: 14 MB can be freed.");
      setAiActions([{ label: "Review in Files", action: "files" }]);
      return;
    }
    if (q.includes("storage") || q.includes("disk") || q.includes("space") || q.includes("usage")) {
      setAiResponse("Storage Report:\n\n💾 Total: 512 GB\n📊 Used: 278 GB (54%)\n📁 Apps: 154 GB\n🎬 Media: 77 GB\n📄 Documents: 41 GB\n🗑️ Cache: 6 GB (clearable)\n\nRecommendation: Clear cache to free 6 GB.");
      setAiActions([{ label: "Open Settings", action: "settings" }, { label: "Open Files", action: "files" }]);
      return;
    }
    if (q.includes("tag") || q.includes("label") || q.includes("auto-tag")) {
      setAiResponse("AI Auto-Tagging complete:\n\n• 5 files tagged as \"Finance\" (invoices, budget)\n• 3 files tagged as \"Legal\" (contracts, NDA)\n• 4 files tagged as \"Project\" (proposals, docs)\n• 2 files tagged as \"Personal\" (notes, ideas)");
      setAiActions([{ label: "Open Files", action: "files" }]);
      return;
    }

    // ━━━ TIMELINE ━━━
    if (q.includes("timeline") || q.includes("history") || q.includes("activity")) {
      setShowTimeline(true);
      setAiResponse("Opening your Unified Timeline — a chronological view of all your actions.");
      setAiActions([]);
      return;
    }

    // ━━━ GREETINGS ━━━
    if (q.match(/^(hello|hi|hey|yo|sup|good morning|good afternoon|good evening|whats up|what's up)$/)) {
      setAiResponse("Hello! I'm Alternus AI. Try searching for anything:\n\n• Apps: \"browser\", \"code\", \"music\", \"movies\"\n• Services: \"google\", \"youtube\", \"github\"\n• Tasks: \"write a letter\", \"design a logo\"\n• System: \"settings\", \"wifi\", \"dark mode\"\n• Files: \"budget\", \"invoice\", \"contract\"");
      setAiActions([]);
      return;
    }

    // ━━━ MATCH APP KEYWORDS ━━━
    for (const entry of appMap) {
      const match = entry.keys.some(k => q.includes(k));
      if (match) {
        setAiResponse(entry.response);
        setAiActions(entry.actions);
        return;
      }
    }

    // ━━━ FALLBACK — open browser to search ━━━
    setAiResponse(`No app found for "${aiInput.trim()}". I can search the web for you.`);
    setAiActions([{ label: "Search on Google", action: "browser" }, { label: "Open AI Chat", action: "ai" }]);
  };

  const winContent: Record<WinId, React.ReactNode> = {
    ai: <NotesApp c={c} />,
    terminal: <TerminalApp c={c} />,
    code: <CodeApp c={c} />,
    files: <FilesApp c={c} onOpenApp={openWin} />,
    settings: <SettingsApp c={c} mode={mode} setMode={setMode} wallpaper={wallpaper} setWallpaper={setWallpaper} />,
    music: <MusicApp c={c} />,
    weather: <WeatherApp c={c} />,
    calendar: <CalendarApp c={c} />,
    notes: <NotesApp c={c} />,
    browser: <BrowserApp c={c} />,
    word: <WordApp c={c} />,
    store: (() => {
      const storeCats = [
        { icon: ic.sparkle, label: "Discover" },
        { icon: ic.play, label: "Games" },
        { icon: ic.store, label: "Apps" },
        { icon: ic.settings, label: "Categories" },
      ];
      const allApps = [
        { name: "Alternus Paint", desc: "Digital art & illustration", icon: ic.pen, iconBg: "#8B5CF6", price: "Free" },
        { name: "CloudSync Pro", desc: "Sync files across devices", icon: ic.cloud, iconBg: "#06B6D4", price: "$4.99" },
        { name: "Alternus Chat", desc: "Encrypted messaging", icon: ic.send, iconBg: "#10B981", price: "Free" },
        { name: "MindMap AI", desc: "AI brainstorming tool", icon: ic.sparkle, iconBg: "#F59E0B", price: "$2.99" },
        { name: "Pixel Quest", desc: "Retro platformer", icon: ic.play, iconBg: "#EF4444", price: "Free" },
        { name: "Neural Racer", desc: "AI racing game", icon: ic.cpu, iconBg: "#8B5CF6", price: "$9.99" },
      ];
      const trendingApps = [
        { name: "Code Breaker", desc: "Logic puzzle game", icon: ic.lock, iconBg: "#3B82F6", price: "Free" },
        { name: "Galaxy Wars", desc: "Space strategy", icon: ic.sparkle, iconBg: "#F59E0B", price: "$5.99" },
        { name: "AlternusTV", desc: "Stream movies", icon: ic.film, iconBg: "#EF4444", price: "Free" },
        { name: "Alternus Photos", desc: "AI photo editor", icon: ic.image, iconBg: "#EC4899", price: "Free" },
      ];
      const editorPicks = [
        { name: "Focus Timer", desc: "Pomodoro & productivity", icon: ic.clock, iconBg: "#10B981", price: "Free" },
        { name: "Sketch AI", desc: "AI-powered drawing", icon: ic.pen, iconBg: "#EC4899", price: "$3.99" },
        { name: "DataVault", desc: "Secure password manager", icon: ic.shield, iconBg: "#6366F1", price: "Free" },
        { name: "SoundScape", desc: "Ambient sound mixer", icon: ic.music, iconBg: "#F59E0B", price: "$1.99" },
      ];
      const tabs = ["Featured", "Top", "My Apps", "Updates", "Settings"];
      const renderAppRow = (app: typeof allApps[0]) => (
        <div key={app.name} className="flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer"
          style={{ background: c.cardAlt }}
          onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
          onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: app.iconBg + "18", border: `1px solid ${app.iconBg}25` }}>
            <I d={app.icon} s={20} c={app.iconBg} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{app.name}</p>
            <p className="text-[8px] mt-0.5" style={{ color: c.textMuted }}>{app.desc}</p>
          </div>
          {installingApp === app.name ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-20 h-2.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                <div className="h-full rounded-full transition-all duration-200" style={{ width: `${installProgress}%`, background: c.accent }} />
              </div>
              <span className="text-[9px] font-medium" style={{ color: c.textMuted }}>{Math.round(installProgress)}%</span>
            </div>
          ) : installedApps.includes(app.name) ? (
            <span className="text-[9px] px-3 py-1 rounded-full font-semibold flex-shrink-0" style={{ background: c.successSoft, color: c.success }}>Open</span>
          ) : (
            <button onClick={() => app.price === "Free" ? handleInstallApp(app.name) : setPaymentModal(app)}
              className="text-[9px] px-3 py-1 rounded-full font-semibold flex-shrink-0 transition-all"
              style={{ background: app.price === "Free" ? c.accent : "transparent", color: app.price === "Free" ? "#fff" : c.accentText, border: app.price !== "Free" ? `1px solid ${c.accent}` : "none" }}>
              {app.price === "Free" ? "Free" : app.price}
            </button>
          )}
        </div>
      );
      return (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top nav bar */}
          <div className="flex items-center gap-1 px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-1 flex-1">
              {tabs.map((tab, i) => (
                <button key={i} className="px-3 py-1 rounded-full text-[10px] font-medium transition-colors relative"
                  style={{ background: i === 0 ? c.accent : "transparent", color: i === 0 ? "#fff" : c.textMuted }}
                  onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = c.cardAlt; }}
                  onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                  {tab}
                  {tab === "Updates" && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: c.danger }} />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg w-[120px]" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
              <I d={ic.search} s={11} c={c.textMuted} />
              <input className="flex-1 bg-transparent outline-none text-[10px]" style={{ color: c.text }} placeholder="Search" />
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-[130px] flex-shrink-0 flex flex-col py-1 px-1.5" style={{ borderRight: `1px solid ${c.border}` }}>
              {storeCats.map((s, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                  style={{ background: i === 0 ? c.accent : "transparent" }}
                  onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = c.cardAlt; }}
                  onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                  <I d={s.icon} s={15} c={i === 0 ? "#fff" : c.textMuted} />
                  <span className="text-[11px] font-medium" style={{ color: i === 0 ? "#fff" : c.text }}>{s.label}</span>
                </button>
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
              {/* Featured Banner */}
              <div className="rounded-2xl p-4 mb-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.accent}20, ${c.purple}20, ${c.accent}10)`, border: `1px solid ${c.accent}15` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: c.accent + "25" }}>
                    <I d={ic.sparkle} s={24} c={c.accent} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: c.text }}>Alternus AI Suite</p>
                    <p className="text-[9px]" style={{ color: c.textMuted }}>The complete AI productivity toolkit</p>
                  </div>
                </div>
                <p className="text-[9px] mb-3 leading-relaxed" style={{ color: c.textSec }}>Create, edit, and automate with AI. Includes Paint, Chat, and MindMap tools.</p>
                <button className="px-4 py-1.5 rounded-xl text-[10px] font-semibold" style={{ background: c.accent, color: "#fff" }}>Get Bundle - Free</button>
              </div>

              {/* Best Apps and Games */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold" style={{ color: c.text }}>Best Apps and Games</p>
                <span className="text-[10px] font-medium cursor-pointer" style={{ color: c.accentText }}>See All</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {allApps.map(renderAppRow)}
              </div>

              {/* Trending Now */}
              <div className="flex items-center justify-between mt-5 mb-3">
                <p className="text-xs font-bold" style={{ color: c.text }}>Trending Now</p>
                <span className="text-[10px] font-medium cursor-pointer" style={{ color: c.accentText }}>See All</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {trendingApps.map(renderAppRow)}
              </div>

              {/* Editor's Picks */}
              <div className="flex items-center justify-between mt-5 mb-3">
                <p className="text-xs font-bold" style={{ color: c.text }}>Editor&apos;s Picks</p>
                <span className="text-[10px] font-medium cursor-pointer" style={{ color: c.accentText }}>See All</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {editorPicks.map(renderAppRow)}
              </div>
            </div>
          </div>
        </div>
      );
    })(),
    movies: (() => {
      const movieCats = [
        { icon: ic.play, label: "For You" },
        { icon: ic.film, label: "Movies" },
        { icon: ic.monitor, label: "Series" },
        { icon: ic.sparkle, label: "New" },
        { icon: ic.sparkle, label: "Watchlist" },
      ];
      const featured = { name: "The Last Algorithm", genre: "Sci-Fi", year: "2025", rating: "9.2", desc: "In a world run by AI, one programmer discovers the code that controls reality.", color: "#6366F1" };
      const trending = [
        { name: "Digital Dreams", genre: "Drama", year: "2024", rating: "7.9", color: "#6366F1", duration: "2h 15m" },
        { name: "Code Runner", genre: "Action", year: "2025", rating: "8.2", color: "#EC4899", duration: "1h 58m" },
        { name: "Neural Path", genre: "Thriller", year: "2024", rating: "8.5", color: "#06B6D4", duration: "2h 03m" },
        { name: "Pixel World", genre: "Animation", year: "2025", rating: "9.1", color: "#F59E0B", duration: "1h 45m" },
      ];
      const topRated = [
        { name: "Binary Love", genre: "Romance", year: "2025", rating: "8.8", color: "#EC4899", duration: "2h 01m" },
        { name: "Kernel Panic", genre: "Horror", year: "2024", rating: "7.6", color: "#EF4444", duration: "1h 52m" },
        { name: "Cloud Atlas II", genre: "Sci-Fi", year: "2025", rating: "8.9", color: "#8B5CF6", duration: "2h 42m" },
        { name: "The Compiler", genre: "Mystery", year: "2024", rating: "8.1", color: "#10B981", duration: "1h 47m" },
      ];
      const continueWatching = [
        { name: "Digital Dreams", progress: 65, color: "#6366F1", ep: "1h 23m left" },
        { name: "Neural Path", progress: 30, color: "#06B6D4", ep: "1h 25m left" },
      ];
      const movieCard = (m: typeof trending[0], size: "sm" | "lg" = "sm") => (
        <div key={m.name} className="rounded-2xl overflow-hidden cursor-pointer transition-all group"
          style={{ background: c.cardAlt }}
>
          {/* Poster */}
          <div className={size === "lg" ? "h-24" : "h-20"} style={{ background: `linear-gradient(135deg, ${m.color}30, ${m.color}10)`, position: "relative" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <I d={ic.film} s={size === "lg" ? 28 : 22} c={m.color + "60"} />
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[7px] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "#F59E0B" }}>★ {m.rating}</div>
            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.accent }}>
                <I d={ic.play} s={14} c="#fff" />
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="p-2.5">
            <p className="text-[10px] font-semibold truncate" style={{ color: c.text }}>{m.name}</p>
            <p className="text-[8px] mt-0.5" style={{ color: c.textMuted }}>{m.genre} · {m.year} · {m.duration}</p>
          </div>
        </div>
      );
      return (
        <div className="flex h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-[110px] flex-shrink-0 flex flex-col py-1 px-1.5" style={{ borderRight: `1px solid ${c.border}` }}>
            {movieCats.map((s, i) => (
              <button key={i} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors"
                style={{ background: i === 0 ? c.accent : "transparent" }}
                onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                <I d={s.icon} s={14} c={i === 0 ? "#fff" : c.textMuted} />
                <span className="text-[10px] font-medium" style={{ color: i === 0 ? "#fff" : c.text }}>{s.label}</span>
              </button>
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
            {/* Featured Hero */}
            <div className="rounded-2xl overflow-hidden mb-4 relative" style={{ background: `linear-gradient(135deg, ${featured.color}25, ${c.cardAlt})`, border: `1px solid ${featured.color}15` }}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#F59E0B", color: "#000" }}>★ {featured.rating}</span>
                  <span className="text-[9px]" style={{ color: c.textMuted }}>{featured.genre} · {featured.year}</span>
                  <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: c.accent + "20", color: c.accentText }}>Featured</span>
                </div>
                <p className="text-base font-bold mb-1" style={{ color: c.text }}>{featured.name}</p>
                <p className="text-[10px] mb-3 leading-relaxed" style={{ color: c.textSec }}>{featured.desc}</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 transition-all" style={{ background: c.accent, color: "#fff" }}><I d={ic.play} s={10} c="#fff" /> Watch Now</button>
                  <button className="px-4 py-2 rounded-xl text-[10px] font-medium transition-all" style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}>+ Watchlist</button>
                </div>
              </div>
            </div>

            {/* Continue Watching */}
            {continueWatching.length > 0 && (<>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold" style={{ color: c.text }}>Continue Watching</p>
              </div>
              <div className="flex gap-2 mb-4">
                {continueWatching.map(m => (
                  <div key={m.name} className="flex-1 p-2.5 rounded-2xl cursor-pointer transition-all" style={{ background: c.cardAlt }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: m.color + "15" }}>
                        <I d={ic.play} s={14} c={m.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate" style={{ color: c.text }}>{m.name}</p>
                        <p className="text-[7px]" style={{ color: c.textMuted }}>{m.ep}</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                      <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: c.accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {/* Trending */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold" style={{ color: c.text }}>Trending Now</p>
              <span className="text-[10px] font-medium cursor-pointer" style={{ color: c.accentText }}>See All</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="mb-4">
              {trending.map(m => movieCard(m))}
            </div>

            {/* Top Rated */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold" style={{ color: c.text }}>Top Rated</p>
              <span className="text-[10px] font-medium cursor-pointer" style={{ color: c.accentText }}>See All</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {topRated.map(m => movieCard(m))}
            </div>
          </div>
        </div>
      );
    })(),
    clock: <ClockApp c={c} />,
    calculator: <CalculatorApp c={c} />,
    accounts: <AccountsApp c={c} />,
    downloads: <DownloadsApp c={c} />,
  };

  const dockApps: { id: WinId; icon: string; label: string; color: string }[] = [
    { id: "terminal", icon: ic.terminal, label: "Terminal", color: c.success },
    { id: "code", icon: ic.code, label: "Code", color: c.purple },
    { id: "files", icon: ic.folder, label: "Files", color: c.warning },
    { id: "browser", icon: ic.globe, label: "Browser", color: c.accentText },
    { id: "store", icon: ic.store, label: "Store", color: c.accent },
    { id: "movies", icon: ic.film, label: "Movies", color: c.purple },
    { id: "music", icon: ic.music, label: "Music", color: "#F472B6" },
    { id: "calendar", icon: ic.calendar, label: "Calendar", color: "#60A5FA" },
    { id: "word", icon: ic.fileText, label: "Word", color: c.accentText },
    { id: "downloads", icon: ic.download, label: "Downloads", color: "#34D399" },
    { id: "calculator", icon: ic.calc, label: "Calc", color: "#8ABF8A" },
    { id: "settings", icon: ic.settings, label: "Settings", color: c.textSec },
  ];

  // ━━━━ BOOT SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isBooting) {
    const bootMessages: Record<BootPhase, string[]> = {
      bios: ["BIOS v2.4 — Alternus Systems", "Checking hardware integrity..."],
      hardware: ["CPU: AlternusCore x86_64 @ 4.2GHz — OK", "RAM: 16 GB DDR5 — OK", "GPU: Integrated — OK", "Storage: 512 GB NVMe — OK"],
      kernel: ["Loading AlternusKernel 6.2...", "Initializing file system...", "Mounting partitions...", "Loading AI Engine v3.0..."],
      services: ["Starting network services...", "Starting display manager...", "Loading user preferences...", "Starting Alternus Shell..."],
      desktop: ["Preparing desktop environment...", "Ready"],
      done: ["Ready"],
    };
    const phaseIdx = ["bios", "hardware", "kernel", "services", "desktop", "done"].indexOf(bootPhase);
    const visibleLines = Object.entries(bootMessages).slice(0, phaseIdx + 1).flatMap(([, msgs]) => msgs);

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a0a" }}>
        {/* Terminal-style boot log - hidden, runs in background */}
        <div className="absolute top-0 left-0 right-0 p-6 overflow-hidden font-mono text-[11px] leading-5 opacity-0 pointer-events-none" style={{ color: "#4ade80" }}>
          {visibleLines.map((line, i) => (
            <p key={i} style={{ opacity: i === visibleLines.length - 1 ? 0.7 : 1 }}>
              {line.includes("OK") || line === "Ready" ? (
                <><span style={{ color: "#666" }}>[</span><span style={{ color: "#4ade80" }}> OK </span><span style={{ color: "#666" }}>]</span> {line.replace(" — OK", "").replace("Ready", "")}</>
              ) : (
                <><span style={{ color: "#666" }}>[</span><span style={{ color: "#3B82F6" }}> .. </span><span style={{ color: "#666" }}>]</span> <span style={{ color: "#aaa" }}>{line}</span></>
              )}
            </p>
          ))}
          {bootPhase !== "done" && <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ background: "#4ade80" }} />}
        </div>

        {/* Center: Logo + Progress */}
        <div className="flex flex-col items-center">
          <h1
            className="text-8xl font-semibold mb-6 select-none bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #666 0%, #eee 50%, #666 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              opacity: 0.6 + bootProgress * 0.4,
            }}
          >
            Alternus
          </h1>
          <div className="w-64 h-[3px] rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
            <div className="h-full rounded-full" style={{
              width: `${bootProgress * 100}%`,
              background: "linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4)",
              boxShadow: "0 0 12px #3B82F6, 0 0 24px rgba(59,130,246,0.4)",
              transition: "width 0.1s linear",
            }} />
          </div>
          <p className="mt-3 text-[10px] font-mono" style={{ color: "#555" }}>
            {bootPhase === "bios" ? "POST check" : bootPhase === "hardware" ? "Hardware scan" : bootPhase === "kernel" ? "Loading kernel" : bootPhase === "services" ? "Starting services" : "Welcome"}
          </p>
        </div>
      </div>
    );
  }

  // ━━━━ LOCK SCREEN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLocked) {
    return (
      <div
        style={{ background: c.bg }}
        className="fixed inset-0 flex flex-col items-center overflow-hidden"
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between px-5 py-3 flex-shrink-0">
          <span className="text-[10px] font-medium" style={{ color: c.textMuted }}>Alternus OS</span>
          <div className="flex items-center gap-3">
            <span style={{ color: c.textMuted }}><I d={ic.wifiF} s={14} f /></span>
            <span style={{ color: c.textMuted }}><I d={ic.batteryF} s={14} /></span>
            <span className="text-[10px]" style={{ color: c.textMuted }}>{fmt(time)}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 relative">
          {/* Clock + Date */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: 60 }}>
            <p style={{ color: c.text }} className="text-8xl font-bold tracking-wide mb-2">{fmt(time)}</p>
            <p style={{ color: c.textMuted }} className="text-base">{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>

          {/* Profile + Button */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ bottom: 60 }}>
            {/* Profile avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: c.accentSoft, border: `2px solid ${c.border}`, color: c.accentText }}
            >
              <I d={ic.user} s={28} />
            </div>
            <p className="text-sm font-medium mb-0.5" style={{ color: c.text }}>Admin</p>
            <p className="text-[11px] mb-5" style={{ color: c.textMuted }}>admin@alternus.art</p>

            {/* Open Desktop button */}
            <button
              onClick={() => { setIsLocked(false); }}
              className="flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer mb-3"
              style={{ background: c.accent, color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = c.accent; }}
            >
              <I d={ic.monitor} s={16} />
              Open Desktop
            </button>

            {/* Welcome message */}
            <p className="text-xs" style={{ color: c.textMuted }}>Welcome back. Your desktop is ready.</p>
          </div>
        </div>
      </div>
    );
  }

  // ━━━━ DESKTOP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const wallpapers = [
    "", // 0: Default — uses c.bg solid color
    "url('/wallpapers/OSpw3.png') center/cover no-repeat",
    "url('/wallpapers/OSwp.png') center/cover no-repeat",
    "url('/wallpapers/OSwp2.png') center/cover no-repeat",
    "url('/wallpapers/OSwp4.png') center/cover no-repeat",
  ];
  const desktopBg = wallpaper === 0 ? c.bg : wallpapers[wallpaper] || c.bg;

  return (
    <div style={{ background: c.bg }} className="fixed inset-0 flex flex-col overflow-hidden">
      <style>{`* { scrollbar-width: none !important; -ms-overflow-style: none !important; } *::-webkit-scrollbar { display: none !important; }`}</style>
      {/* Top Bar */}
      <div className="relative flex items-center justify-between px-4 h-9 flex-shrink-0" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-2">
          <span style={{ color: c.text }} className="text-[11px] font-bold tracking-wider">ALTERNUS</span>
          <span style={{ color: c.textMuted }} className="text-[10px]">OS</span>
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-bold" style={{ color: c.text }}>{fmt(time)} · {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-1">
          {(() => { const ic_ = mode === "dark" ? "#FFFFFF" : "#444444"; return (<>
            {/* Quick launch apps */}
            <button title="Browser" onClick={() => openWin("browser")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.globeF} s={15} f /></button>
            <button title="Settings" onClick={() => openWin("settings")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.settingsF} s={15} f /></button>
            <button title="Code Editor" onClick={() => openWin("code")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.codeF} s={15} f /></button>
            <button title="Terminal" onClick={() => openWin("terminal")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.terminalF} s={15} f /></button>
            <button title="Weather" onClick={() => openWin("weather")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.cloudF} s={15} f /></button>
            <button title="Calendar" onClick={() => openWin("calendar")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.calendarF} s={15} f /></button>
            <button title="Store" onClick={() => openWin("store")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.storeF} s={15} f /></button>
            <button title="Movies" onClick={() => openWin("movies")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.filmF} s={15} f /></button>
            {/* Separator */}
            <div className="w-px h-4 mx-1" style={{ background: c.border }} />
            {/* System tray */}
            <button title="Notifications" onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors relative" style={{ color: ic_ }}>
              <I d={ic.bellF} s={15} f />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: c.danger }} />
            </button>
            <div className="relative">
              <button onClick={() => { setShowWifiPanel(!showWifiPanel); setShowProfilePanel(false); }} title="Wi-Fi" className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}><I d={ic.wifiF} s={15} f /></button>
              {/* WiFi Panel */}
              {showWifiPanel && (
                <div className="absolute top-full right-0 mt-2 w-[280px] rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 999 }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <p className="text-xs font-semibold" style={{ color: c.text }}>Wi-Fi</p>
                    <div className="w-9 h-5 rounded-full flex items-center px-0.5" style={{ background: c.accent }}>
                      <div className="w-4 h-4 rounded-full bg-white" style={{ marginLeft: 16 }} />
                    </div>
                  </div>
                  <div className="py-1 px-1.5">
                    {["AlternusNet", "Guest_WiFi", "Office_5G", "Neighbors_Net"].map((net, i) => (
                      <button key={i} onClick={() => setConnectedWifi(i)}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-lg text-left transition-colors"
                        style={{ background: i === connectedWifi ? c.accentSoft : "transparent" }}
                        onMouseEnter={e => { if (i !== connectedWifi) e.currentTarget.style.background = c.cardAlt; }}
                        onMouseLeave={e => { if (i !== connectedWifi) e.currentTarget.style.background = i === connectedWifi ? c.accentSoft : "transparent"; }}>
                        <I d={ic.wifi} s={14} c={i === connectedWifi ? c.accentText : c.textMuted} />
                        <div className="flex-1">
                          <p className="text-[11px] font-medium" style={{ color: c.text }}>{net}</p>
                          {i === connectedWifi && <p className="text-[9px]" style={{ color: c.accentText }}>Connected · 5GHz</p>}
                        </div>
                        {i === connectedWifi && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: c.accentSoft, color: c.accentText }}>✓</span>}
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2" style={{ borderTop: `1px solid ${c.border}` }}>
                    <button onClick={() => { openWin("settings"); setShowWifiPanel(false); }}
                      className="w-full text-center text-[10px] py-1.5 rounded-lg transition-colors" style={{ color: c.accentText }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      Network Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}>
              <I d={mode === "dark" ? ic.sunF : ic.moonF} s={15} f />
            </button>
            {/* Separator */}
            <div className="w-px h-4 mx-1" style={{ background: c.border }} />
            <div className="relative">
              <button onClick={() => { setShowProfilePanel(!showProfilePanel); setShowWifiPanel(false); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}>
                <I d={ic.user} s={15} />
              </button>
              {/* Profile Panel */}
              {showProfilePanel && (
                <div className="absolute top-full right-0 mt-2 w-[240px] rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 999 }}
                  onClick={e => e.stopPropagation()}>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.accentSoft, color: c.accentText }}>
                      <I d={ic.user} s={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: c.text }}>Admin</p>
                      <p className="text-[10px]" style={{ color: c.textMuted }}>admin@alternus.art</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="py-1 px-1.5">
                    {[
                      { icon: ic.user, label: "My Profile", action: () => { openWin("settings"); setShowProfilePanel(false); } },
                      { icon: ic.settings, label: "Settings", action: () => { openWin("settings"); setShowProfilePanel(false); } },
                      { icon: mode === "dark" ? ic.sun : ic.moon, label: mode === "dark" ? "Light Mode" : "Dark Mode", action: () => { setMode(mode === "dark" ? "light" : "dark"); } },
                      { icon: ic.shield, label: "Privacy & Security", action: () => { openWin("settings"); setShowProfilePanel(false); } },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-lg text-left transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <I d={item.icon} s={14} c={c.textMuted} />
                        <span className="text-[11px]" style={{ color: c.text }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Lock & Power */}
                  <div className="flex gap-1 px-3 py-2" style={{ borderTop: `1px solid ${c.border}` }}>
                    <button onClick={() => { setIsLocked(true); setShowProfilePanel(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-medium transition-colors"
                      style={{ background: c.cardAlt, color: c.text }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.border)}
                      onMouseLeave={e => (e.currentTarget.style.background = c.cardAlt)}>
                      <I d={ic.lock} s={12} c={c.textMuted} /> Lock
                    </button>
                    <button onClick={() => { setIsBooting(true); setIsLocked(true); setShowProfilePanel(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-medium transition-colors"
                      style={{ background: c.cardAlt, color: c.danger }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.border)}
                      onMouseLeave={e => (e.currentTarget.style.background = c.cardAlt)}>
                      <I d={ic.power} s={12} c={c.danger} /> Restart
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => { setIsBooting(true); setIsLocked(true); }} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: ic_ }}>
              <I d={ic.power} s={15} />
            </button>
          </>); })()}
        </div>
      </div>

      {/* Desktop Area - fixed, no scroll */}
      <div className="flex-1 relative overflow-hidden"
        style={{ background: desktopBg }}
        onClick={() => { if (showApps) setShowApps(false); setShowWifiPanel(false); setShowProfilePanel(false); setContextMenu(null); }}
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY - 36 }); setShowApps(false); setShowWifiPanel(false); setShowProfilePanel(false); }}>
        {/* Apps button - top center, always visible */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowApps(!showApps)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: showApps ? c.accent : c.surface,
                border: `1px solid ${showApps ? c.accent : c.border}`,
                color: showApps ? "#fff" : c.textSec,
              }}
              onMouseEnter={e => {
                if (!showApps) {
                  e.currentTarget.style.background = c.accent;
                  e.currentTarget.style.borderColor = c.accent;
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!showApps) {
                  e.currentTarget.style.background = c.surface;
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color = c.textSec;
                }
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showApps ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>

            {/* Apps panel - slides down, horizontal scroll */}
            <div
              className="mt-3 overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: showApps ? 90 : 0,
                opacity: showApps ? 1 : 0,
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl overflow-x-auto"
                style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: mode === "dark" ? "0 4px 24px rgba(0,0,0,0.35)" : "0 4px 24px rgba(0,0,0,0.1)", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}
              >
                {dockApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => { openWinWithAI(app.id); setShowApps(false); }}
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.borderColor = c.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.borderColor = c.border; }}
                  >
                    <I d={app.icon} s={18} c={app.color} />
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* Center: Alternus branding + AI Search - always visible behind windows */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[0]">
          {/* Alternus gradient text */}
          <h1
            className="text-8xl md:text-9xl font-semibold mb-4 select-none bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(90deg, ${c.textMuted} 0%, ${c.text} 50%, ${c.textMuted} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Alternus<span className="text-xl align-super" style={{ WebkitTextFillColor: c.textMuted }}>©</span>
          </h1>

          {/* Welcome message */}
          <p className="text-base font-light mb-10" style={{ color: c.textSec }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}. What would you like to create today?
          </p>

          {/* AI Search Bar */}
          <div className="w-full max-w-2xl">
            <div
              className="flex items-center gap-2 pl-5 pr-2 py-2 rounded-2xl transition-all"
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                boxShadow: mode === "dark" ? "0 2px 16px rgba(0,0,0,0.15)" : "0 2px 16px rgba(0,0,0,0.06)",
              }}
            >
              <I d={ic.search} s={20} c={c.textMuted} />
              <input
                className="flex-1 bg-transparent outline-none text-base py-2"
                style={{ color: c.text }}
                placeholder="Search or ask AI anything..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiInput.trim()) {
                    handleDesktopSearch();
                  }
                }}
              />
              <button
                onClick={() => aiInput.trim() && handleDesktopSearch()}
                className="px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: c.accent }}
              >
                <I d={ic.send} s={16} c="#fff" />
              </button>
            </div>

            {/* AI response - separate below */}
            {aiResponse && (
              <div
                className="mt-3 px-5 py-4 rounded-2xl text-[13px] leading-relaxed relative"
                style={{
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  boxShadow: mode === "dark" ? "0 2px 12px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Copy button */}
                <button
                  onClick={() => { navigator.clipboard.writeText(aiResponse); }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all"
                  style={{ background: c.cardAlt, color: c.textMuted }}
                  title="Copy"
                >
                  <I d={ic.fileText} s={12} c={c.textMuted} />
                </button>
                <pre className="whitespace-pre-wrap font-sans pr-8">{aiResponse}</pre>
                {aiActions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {aiActions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => { openWin(a.action); setAiResponse(null); setAiActions([]); setAiInput(""); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                        style={{ background: c.accentSoft, color: c.accentText }}
                      >
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setAiResponse(null); setAiActions([]); }}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ color: c.textMuted }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Windows */}
        {wins.map(w => (
          <AppWindow
            key={w.id}
            win={w}
            c={c}
            onClose={() => closeWinWithAI(w.id)}
            onMinimize={() => minimizeWin(w.id)}
            onMaximize={() => maximizeWin(w.id)}
            onFocus={() => focusWin(w.id)}
            onMove={(x, y) => moveWin(w.id, x, y)}
            onResize={(nw, nh) => resizeWin(w.id, nw, nh)}
            onSnap={(side) => snapWin(w.id, side)}
            onForceQuit={() => forceQuitWin(w.id)}
          >
            {winContent[w.id]}
          </AppWindow>
        ))}

        {/* Alt+Tab Task Switcher */}
        {showTaskSwitcher && (() => {
          const openW = wins.filter(w => w.isOpen && !w.isMinimized);
          if (openW.length === 0) return null;
          return (
            <div className="absolute inset-0 flex items-center justify-center z-[200]" style={{ background: "rgba(0,0,0,0.4)" }}>
              <div className="flex gap-3 px-6 py-4 rounded-2xl" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                {openW.map((w, i) => (
                  <div key={w.id} className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all"
                    style={{ background: i === taskSwitcherIdx ? c.accentSoft : "transparent", border: i === taskSwitcherIdx ? `2px solid ${c.accent}` : "2px solid transparent" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: c.cardAlt }}>
                      <I d={(ic as Record<string,string>)[w.id] || ic.sparkle} s={22} c={i === taskSwitcherIdx ? c.accentText : c.textSec} />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: i === taskSwitcherIdx ? c.accentText : c.textMuted }}>{w.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* System Modal */}
        {systemModal && (
          <div className="absolute inset-0 flex items-center justify-center z-[300]" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-80 p-5 rounded-2xl" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: systemModal.type === "error" ? "rgba(239,68,68,0.15)" : systemModal.type === "warning" ? c.warningSoft : c.accentSoft }}>
                  <I d={systemModal.type === "error" ? ic.alertTriangle : systemModal.type === "warning" ? ic.alertTriangle : ic.shield} s={20} c={systemModal.type === "error" ? c.danger : systemModal.type === "warning" ? c.warning : c.accentText} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>{systemModal.title}</p>
                  <p className="text-xs whitespace-pre-line" style={{ color: c.textMuted }}>{systemModal.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setSystemModal(null)} className="px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: c.accent, color: "#fff" }}>OK</button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ Payment Modal ━━━━ */}
        {paymentModal && (
          <div className="absolute inset-0 flex items-center justify-center z-[300]" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setPaymentModal(null)}>
            <div className="w-[320px] rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
              <div className="p-5 flex flex-col items-center" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: paymentModal.iconBg + "20" }}>
                  <I d={paymentModal.icon} s={28} c={paymentModal.iconBg} />
                </div>
                <p className="text-sm font-bold mb-0.5" style={{ color: c.text }}>{paymentModal.name}</p>
                <p className="text-2xl font-bold" style={{ color: c.accent }}>{paymentModal.price}</p>
              </div>
              <div className="p-4 space-y-2.5">
                <div>
                  <label className="text-[9px] font-medium mb-1 block" style={{ color: c.textMuted }}>Card Number</label>
                  <input className="w-full px-3 py-2 rounded-lg text-[11px] outline-none" style={{ background: c.cardAlt, border: `1px solid ${c.border}`, color: c.text }} placeholder="4242 4242 4242 4242" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-medium mb-1 block" style={{ color: c.textMuted }}>Expiry</label>
                    <input className="w-full px-3 py-2 rounded-lg text-[11px] outline-none" style={{ background: c.cardAlt, border: `1px solid ${c.border}`, color: c.text }} placeholder="MM/YY" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-medium mb-1 block" style={{ color: c.textMuted }}>CVC</label>
                    <input className="w-full px-3 py-2 rounded-lg text-[11px] outline-none" style={{ background: c.cardAlt, border: `1px solid ${c.border}`, color: c.text }} placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 p-4 pt-2">
                <button onClick={() => setPaymentModal(null)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: c.cardAlt, color: c.textSec, border: `1px solid ${c.border}` }}>Cancel</button>
                <button onClick={handlePaidInstall} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: c.accent, color: "#fff" }}>Pay {paymentModal.price}</button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ AI Suggestion Bar ━━━━ */}
        {aiSuggestion && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-4 px-5 py-3 rounded-2xl max-w-[90%]"
            style={{ background: c.surface, border: `1px solid ${c.accent}40`, boxShadow: `0 0 20px ${c.accent}15, 0 4px 16px rgba(0,0,0,0.12)` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.accent }}>
              <I d={ic.sparkle} s={14} c="#fff" />
            </div>
            <p className="text-[11px] flex-1" style={{ color: c.text }}>{aiSuggestion.message}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {aiSuggestion.actions.map((a, i) => (
                <button key={i} onClick={a.action} className="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all hover:opacity-90"
                  style={{ background: i === 0 ? c.accent : c.cardAlt, color: i === 0 ? "#fff" : c.textSec, border: i > 0 ? `1px solid ${c.border}` : "none" }}>{a.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ━━━━ Action Chain Dialog ━━━━ */}
        {closeChain && (
          <div className="absolute inset-0 flex items-center justify-center z-[300]" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-96 p-5 rounded-2xl" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.accentSoft }}><I d={ic.sparkle} s={20} c={c.accentText} /></div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>AI: Closing {closeChain.title}</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>I&apos;ve auto-saved your changes.</p>
                </div>
              </div>
              <p className="text-xs mb-4 px-1" style={{ color: c.textSec }}>Want me to open a related app or perform any other action?</p>
              <div className="flex gap-2">
                <button onClick={() => { closeWin(closeChain.appId); addTimelineEvent("Closed (saved)", closeChain.appId, ic.close); setCloseChain(null); }} className="px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: c.accent, color: "#fff" }}>Save & Close</button>
                <button onClick={() => { closeWin(closeChain.appId); addTimelineEvent("Closed (no save)", closeChain.appId, ic.close); setCloseChain(null); }} className="px-4 py-1.5 rounded-lg text-xs" style={{ background: c.cardAlt, color: c.text }}>Close Without Saving</button>
                <button onClick={() => setCloseChain(null)} className="px-4 py-1.5 rounded-lg text-xs" style={{ color: c.textMuted }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ Unified Timeline Panel ━━━━ */}
        {showTimeline && (
          <div className="absolute inset-0 flex items-center justify-center z-[250]" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="w-[400px] max-h-[500px] rounded-2xl flex flex-col" style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2"><I d={ic.refresh} s={16} c={c.accentText} /><p className="text-sm font-semibold" style={{ color: c.text }}>Unified Timeline</p></div>
                <button onClick={() => setShowTimeline(false)} className="p-1 rounded-md" style={{ color: c.textMuted }}><I d={ic.close} s={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {timeline.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: c.textMuted }}>No activity recorded yet. Start using apps to see your timeline.</p>
                ) : timeline.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: i === 0 ? c.accentSoft : "transparent" }}>
                    <span className="text-[10px] font-mono w-10 flex-shrink-0" style={{ color: c.textMuted }}>{ev.time}</span>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: c.cardAlt }}><I d={ev.icon} s={12} c={c.textSec} /></div>
                    <span className="text-xs" style={{ color: c.text }}>{ev.action} <span style={{ color: c.accentText }}>{ev.app}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ Right-Click Context Menu ━━━━ */}
        {contextMenu && (
          <div className="absolute z-[200] w-[220px] rounded-xl overflow-hidden py-1.5"
            style={{ left: contextMenu.x, top: contextMenu.y, background: c.surface, border: `1px solid ${c.border}`, boxShadow: mode === "dark" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.08)" }}
            onClick={e => e.stopPropagation()}>
            {/* Quick actions row */}
            <div className="flex items-center gap-1 px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
              {[
                { icon: ic.fileText, label: "Copy", action: () => setContextMenu(null) },
                { icon: ic.note, label: "Paste", action: () => setContextMenu(null) },
                { icon: ic.pen, label: "Rename", action: () => setContextMenu(null) },
                { icon: ic.close, label: "Delete", action: () => setContextMenu(null) },
                { icon: ic.share, label: "Share", action: () => setContextMenu(null) },
              ].map((a, i) => (
                <button key={i} title={a.label} onClick={a.action}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: c.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={a.icon} s={14} />
                </button>
              ))}
            </div>
            {/* Menu items */}
            <div className="py-1 px-1.5">
              {[
                { icon: ic.alignLeft, label: "View", shortcut: "›" },
                { icon: ic.alignJustify, label: "Sort by", shortcut: "›" },
                { icon: ic.refresh, label: "Refresh", shortcut: "" },
              ].map((item, i) => (
                <button key={i} onClick={() => setContextMenu(null)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={item.icon} s={14} c={c.textMuted} />
                  <span className="flex-1 text-[11px]" style={{ color: c.text }}>{item.label}</span>
                  {item.shortcut && <span className="text-[10px]" style={{ color: c.textMuted }}>{item.shortcut}</span>}
                </button>
              ))}
            </div>
            <div className="my-1 mx-3 h-px" style={{ background: c.border }} />
            <div className="py-1 px-1.5">
              {[
                { icon: ic.plus, label: "New", shortcut: "›" },
                { icon: ic.folder, label: "New Folder", shortcut: "" },
              ].map((item, i) => (
                <button key={i} onClick={() => setContextMenu(null)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={item.icon} s={14} c={c.textMuted} />
                  <span className="flex-1 text-[11px]" style={{ color: c.text }}>{item.label}</span>
                  {item.shortcut && <span className="text-[10px]" style={{ color: c.textMuted }}>{item.shortcut}</span>}
                </button>
              ))}
            </div>
            <div className="my-1 mx-3 h-px" style={{ background: c.border }} />
            <div className="py-1 px-1.5">
              {[
                { icon: ic.image, label: "Change wallpaper", action: () => setContextMenu(null) },
                { icon: ic.monitor, label: "Display settings", action: () => { openWin("settings"); setContextMenu(null); } },
                { icon: ic.pen, label: "Personalize", action: () => { openWin("settings"); setContextMenu(null); } },
                { icon: ic.terminal, label: "Open in Terminal", action: () => { openWin("terminal"); setContextMenu(null); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={item.icon} s={14} c={c.textMuted} />
                  <span className="flex-1 text-[11px]" style={{ color: c.text }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ━━━━ AI Notification Sidebar ━━━━ */}
        <div
          className="absolute top-0 right-0 h-full z-[100] transition-colorsduration-300 ease-in-out"
          style={{
            width: 340,
            transform: showNotifications ? "translateX(0)" : "translateX(100%)",
            background: c.surface,
            borderLeft: `1px solid ${c.border}`,
            boxShadow: showNotifications ? (mode === "dark" ? "-4px 0 20px rgba(0,0,0,0.4)" : "-4px 0 20px rgba(0,0,0,0.1)") : "none",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2">
              <I d={ic.sparkle} s={14} c={c.accentText} />
              <p className="text-sm font-semibold" style={{ color: c.text }}>Notifications</p>
              {smartDND && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: c.warningSoft, color: c.warning }}>DND</span>}
            </div>
            <div className="flex items-center gap-1">
              {aiNotifications.length > 3 && (
                <button onClick={() => {
                  const types = aiNotifications.reduce((a, n) => { a[n.type] = (a[n.type] || 0) + 1; return a; }, {} as Record<string, number>);
                  const sum = Object.entries(types).map(([t, cnt]) => `${cnt} ${t}`).join(", ");
                  setAiNotifications([{ id: "summary", title: "AI Summary", message: `You had ${aiNotifications.length} notifications: ${sum}. All caught up!`, icon: ic.sparkle, time: "Now", type: "summary", read: false }]);
                }} className="px-2 py-1 rounded-md text-[10px] font-medium hover:bg-white/10 transition-colors" style={{ color: c.accentText }}>Summarize</button>
              )}
              <button onClick={() => setShowNotifications(false)} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" style={{ color: c.textMuted }}><I d={ic.close} s={14} /></button>
            </div>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto" style={{ height: "calc(100% - 52px)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* AI notifications */}
            {aiNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                style={{ background: !n.read ? c.accentSoft : "transparent" }}
                onMouseEnter={e => { if (n.read) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (n.read) e.currentTarget.style.background = "transparent"; }}
                onClick={() => { setAiNotifications(prev => prev.map(p => p.id === n.id ? { ...p, read: true } : p)); }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: n.type === "security" ? "rgba(239,68,68,0.15)" : n.type === "suggestion" ? c.accentSoft : c.cardAlt }}>
                  <I d={n.icon} s={14} c={n.type === "security" ? c.danger : n.type === "suggestion" ? c.accentText : c.textSec} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: c.text }}>{n.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>{n.message}</p>
                  {n.actions && (
                    <div className="flex gap-1 mt-2">
                      {n.actions.map((a, j) => (
                        <button key={j} onClick={(e) => { e.stopPropagation(); openWin(a.handler as WinId); setAiNotifications(prev => prev.filter(p => p.id !== n.id)); }}
                          className="px-2 py-0.5 rounded text-[9px] font-medium" style={{ background: c.accent, color: "#fff" }}>{a.label}</button>
                      ))}
                    </div>
                  )}
                  <p className="text-[9px] mt-1" style={{ color: c.textMuted }}>{n.time}</p>
                </div>
              </div>
            ))}
            {/* App notifications */}
            {[
              { title: "OpenAI", desc: "GPT-5 is now available. Try the new model with enhanced reasoning capabilities.", time: "Now", color: "#10A37F", initials: "AI" },
              { title: "Claude", desc: "Your conversation has been saved. Continue where you left off anytime.", time: "2m", color: "#D97706", initials: "C" },
              { title: "Facebook", desc: "John tagged you in a photo. Check it out!", time: "5m", color: "#1877F2", initials: "f" },
              { title: "Instagram", desc: "Sarah started a live video. Watch before it ends.", time: "8m", color: "#E4405F", initials: "IG" },
              { title: "Discord", desc: "New message in #general: \"Meeting at 3pm today\"", time: "12m", color: "#5865F2", initials: "D" },
              { title: "System Update", desc: "Alternus OS v1.1 is available with performance improvements.", time: "15m", color: c.accent, initials: "OS" },
            ].map((n, i) => (
              <div key={`app-${i}`} className="flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer"
                style={{ background: c.cardAlt }}
                onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
                onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: n.color + "20" }}>
                  <span className="text-xs font-bold" style={{ color: n.color }}>{n.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold" style={{ color: c.text }}>{n.title}</p>
                    <span className="text-[8px] px-2 py-0.5 rounded-full font-medium" style={{ background: i === 0 ? n.color + "20" : c.surface, color: i === 0 ? n.color : c.textMuted }}>{n.time}</span>
                  </div>
                  <p className="text-[10px] mt-1 leading-relaxed" style={{ color: c.textSec }}>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
