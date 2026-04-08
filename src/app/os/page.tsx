"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Desktop Operating System
// Fixed viewport, windowed apps, no scrolling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";
type WinId = "ai" | "terminal" | "code" | "files" | "settings" | "music" | "weather" | "calendar" | "notes" | "browser" | "store" | "movies" | "word" | "clock" | "calculator" | "accounts" | "downloads" | "controlpanel" | "studio" | "recovery" | "news" | "dashboard" | "tasks" | "mail" | "monaco" | "aihub" | "imagegen" | "aivoice" | "writer" | "knowledge" | "sysmon";

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

// ━━━━ Container-aware scaling hook ━━━━━━━━━━━━━━━━━━━━━━━━
function useContainerSize(baseW: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: baseW, h: 400 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims(prev => {
        if (Math.abs(prev.w - width) < 10 && Math.abs(prev.h - height) < 10) return prev;
        return { w: width, h: height };
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(0.85, Math.min(1.5, dims.w / baseW));
  return { ref, w: dims.w, h: dims.h, scale };
}

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
  chevD: "M6 9l6 6 6-6",
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
  newspaper: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM8 10h8M8 14h4M8 18h6M16 14h2v4h-2z",
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
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  checkSquare: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  wand: "M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19.2 13.2M17.8 6.2L19.2 4.8M3 21L12 12M12.2 6.2L10.8 4.8",
  brain: "M9.5 2A2.5 2.5 0 007 4.5v.5H5a3 3 0 000 6h.5v.5a3.5 3.5 0 007 0V11h.5a3 3 0 000-6H13v-.5A2.5 2.5 0 0010.5 2h-1zM15 8a4 4 0 014 4v1a4 4 0 01-4 4",
  messageCircle: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  bookOpen: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  edit3: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
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
  mode,
}: {
  title: string;
  c: typeof palette.dark;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  isFrozen?: boolean;
  onForceQuit?: () => void;
  mode?: ThemeMode;
}) {
  const dk = (mode || "dark") === "dark";
  const iconStroke = dk ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  const iconStrokeHover = "#fff";

  /* shared glass button style */
  const btnBase: React.CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  return (
    <div
      onMouseDown={onMouseDown}
      className="flex items-center justify-between h-10 px-3 select-none cursor-move flex-shrink-0"
      style={{ background: "transparent", borderBottom: "none" }}
    >
      <span style={{ color: isFrozen ? c.warning : c.textSec }} className="text-[11px] font-medium truncate max-w-[180px]">
        {title}{isFrozen ? " (Not Responding)" : ""}
      </span>
      <div className="flex items-center gap-[5px]">
        {/* ● Minimize — circle */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMinimize}
          style={btnBase}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "rgba(74,222,128,0.85)";
            el.style.borderColor = "rgba(74,222,128,0.4)";
            el.style.boxShadow = "0 0 12px rgba(74,222,128,0.35), inset 0 1px 0 rgba(255,255,255,0.25)";
            const s = el.querySelector("circle"); if (s) s.setAttribute("stroke", iconStrokeHover);
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
            el.style.borderColor = dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
            el.style.boxShadow = "none";
            const s = el.querySelector("circle"); if (s) s.setAttribute("stroke", iconStroke);
          }}
        >
          {/* Gloss reflection */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: "9px 9px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)", pointerEvents: "none" }} />
          <svg width={11} height={11} viewBox="0 0 10 10" style={{ position: "relative", zIndex: 1 }}>
            <circle cx="5" cy="5" r="3.5" fill="none" stroke={iconStroke} strokeWidth="1.4" />
          </svg>
        </button>

        {/* ■ Maximize — rounded square */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onMaximize}
          style={btnBase}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "rgba(91,163,230,0.85)";
            el.style.borderColor = "rgba(91,163,230,0.4)";
            el.style.boxShadow = "0 0 12px rgba(91,163,230,0.35), inset 0 1px 0 rgba(255,255,255,0.25)";
            const s = el.querySelector("rect"); if (s) s.setAttribute("stroke", iconStrokeHover);
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
            el.style.borderColor = dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
            el.style.boxShadow = "none";
            const s = el.querySelector("rect"); if (s) s.setAttribute("stroke", iconStroke);
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: "9px 9px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)", pointerEvents: "none" }} />
          <svg width={11} height={11} viewBox="0 0 10 10" style={{ position: "relative", zIndex: 1 }}>
            <rect x="2" y="2" width="6" height="6" rx="1.2" fill="none" stroke={iconStroke} strokeWidth="1.4" />
          </svg>
        </button>

        {/* ▲ Close — triangle */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          style={btnBase}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "rgba(248,113,113,0.85)";
            el.style.borderColor = "rgba(248,113,113,0.4)";
            el.style.boxShadow = "0 0 12px rgba(248,113,113,0.35), inset 0 1px 0 rgba(255,255,255,0.25)";
            const s = el.querySelector("polygon"); if (s) s.setAttribute("stroke", iconStrokeHover);
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
            el.style.borderColor = dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
            el.style.boxShadow = "none";
            const s = el.querySelector("polygon"); if (s) s.setAttribute("stroke", iconStroke);
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: "9px 9px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)", pointerEvents: "none" }} />
          <svg width={11} height={11} viewBox="0 0 10 10" style={{ position: "relative", zIndex: 1 }}>
            <polygon points="5,1.8 8.8,8.2 1.2,8.2" fill="none" stroke={iconStroke} strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
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
  onSnapPreview,
  onFileDrop,
  onOpenApp,
  mode,
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
  onSnap?: (side: "left" | "right" | "top") => void;
  onForceQuit?: () => void;
  onSnapPreview?: (zone: "left" | "right" | "top" | null) => void;
  onFileDrop?: (name: string) => void;
  onOpenApp?: (id: WinId) => void;
  mode?: ThemeMode;
}) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [aiBarHover, setAiBarHover] = useState(false);
  const [aiBarQuery, setAiBarQuery] = useState("");
  const aiBarRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    dragging.current = true;
    offset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    onFocus();

    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onMove(ev.clientX - offset.current.x, ev.clientY - offset.current.y);
      // Snap preview
      if (onSnapPreview) {
        if (ev.clientX <= 8) onSnapPreview("left");
        else if (ev.clientX >= window.innerWidth - 8) onSnapPreview("right");
        else if (ev.clientY <= 8) onSnapPreview("top");
        else onSnapPreview(null);
      }
    };
    const up = (ev: MouseEvent) => {
      dragging.current = false;
      if (onSnapPreview) onSnapPreview(null);
      // Snap to edges
      if (onSnap) {
        if (ev.clientX <= 8) onSnap("left");
        else if (ev.clientX >= window.innerWidth - 8) onSnap("right");
        else if (ev.clientY <= 8) onSnap("top");
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

  const isAI = win.id === "ai";

  const style: React.CSSProperties = win.isMaximized
    ? { position: "absolute", top: 6, left: 6, right: isAI ? 6 : 58, bottom: 6, zIndex: win.zIndex }
    : { position: "absolute", top: win.y, left: win.x, width: win.w, height: win.h, zIndex: win.zIndex };

  const isDark = (mode || "dark") === "dark";

  return (
    <div
      style={{
        ...style,
        background: isAI ? "transparent" : isDark ? "rgba(36,36,36,0.6)" : "rgba(255,255,255,0.6)",
        backdropFilter: isAI ? "none" : "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: isAI ? "none" : "blur(20px) saturate(1.4)",
        border: isAI ? "none" : isDragOver ? `1px solid ${c.accent}` : `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        borderRadius: 16,
        boxShadow: isAI ? "none" : isDark
          ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.15s ease",
        pointerEvents: isAI ? "none" : "auto",
      }}
      onMouseEnter={e => { if (!isAI) { e.currentTarget.style.boxShadow = isDark ? "0 12px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)"; } }}
      onMouseLeave={e => { if (!isAI) { e.currentTarget.style.boxShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)"; } }}
      onClick={isAI ? undefined : onFocus}
      onDragOver={onFileDrop ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setIsDragOver(true); } : undefined}
      onDragLeave={onFileDrop ? () => setIsDragOver(false) : undefined}
      onDrop={onFileDrop ? (e) => { e.preventDefault(); setIsDragOver(false); const name = e.dataTransfer.getData("text/plain"); if (name) onFileDrop(name); } : undefined}
    >
      {!isAI && <TitleBar
        title={win.title}
        c={c}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onMouseDown={handleMouseDown}
        isFrozen={win.isFrozen}
        onForceQuit={onForceQuit}
        mode={mode}
      />}
      {/* ━━━━ AI Hover Bar — appears on mouse enter below title bar ━━━━ */}
      {!isAI && (
        <div
          className="flex-shrink-0"
          onMouseEnter={() => { setAiBarHover(true); setTimeout(() => aiBarRef.current?.focus(), 100); }}
          onMouseLeave={() => { if (!aiBarQuery) setAiBarHover(false); }}
          style={{ position: "relative", zIndex: 10 }}
        >
          {/* Thin hover trigger strip — always visible */}
          <div
            className="flex items-center justify-center transition-all duration-200"
            style={{
              height: aiBarHover ? 0 : 3,
              opacity: aiBarHover ? 0 : 0.5,
              overflow: "hidden",
              cursor: "default",
            }}
          >
            <div style={{ width: 32, height: 2, borderRadius: 1, background: c.border }} />
          </div>

          {/* Expanded AI bar */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: aiBarHover ? 120 : 0,
              opacity: aiBarHover ? 1 : 0,
            }}
          >
            <div
              className="mx-2 mb-1 rounded-xl overflow-hidden"
              style={{
                background: (mode || "dark") === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${(mode || "dark") === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
              }}
            >
              {/* Search row */}
              <div className="flex items-center gap-2 px-3 py-1.5">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, filter: "drop-shadow(0 0 3px rgba(59,130,246,0.3))" }}>
                  <path d={ic.sparkle} fill={c.accent} />
                </svg>
                <input
                  ref={aiBarRef}
                  className="flex-1 bg-transparent outline-none text-[11px]"
                  style={{ color: c.text, caretColor: c.accent }}
                  placeholder="Ask AI anything..."
                  value={aiBarQuery}
                  onChange={e => setAiBarQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Escape") { setAiBarHover(false); setAiBarQuery(""); }
                  }}
                  onMouseDown={e => e.stopPropagation()}
                />
                {aiBarQuery && (
                  <button onClick={() => setAiBarQuery("")} onMouseDown={e => e.stopPropagation()} className="p-0.5 rounded transition-colors" style={{ color: c.textMuted }}>
                    <I d={ic.close} s={10} />
                  </button>
                )}
              </div>
              {/* Quick action chips */}
              <div className="flex items-center gap-1 px-3 pb-2 flex-wrap">
                {[
                  { label: "Write", icon: ic.pen, app: "word" as WinId },
                  { label: "Edit", icon: ic.code, app: "code" as WinId },
                  { label: "Browse", icon: ic.globe, app: "browser" as WinId },
                  { label: "Files", icon: ic.folder, app: "files" as WinId },
                  { label: "Notes", icon: ic.note, app: "notes" as WinId },
                  { label: "AI Chat", icon: ic.sparkle, app: "ai" as WinId },
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => { if (onOpenApp) onOpenApp(chip.app); setAiBarHover(false); setAiBarQuery(""); }}
                    onMouseDown={e => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all"
                    style={{
                      background: (mode || "dark") === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      color: c.textMuted,
                      border: `1px solid ${(mode || "dark") === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = (mode || "dark") === "dark" ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)";
                      e.currentTarget.style.borderColor = (mode || "dark") === "dark" ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)";
                      e.currentTarget.style.color = c.accentText;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = (mode || "dark") === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                      e.currentTarget.style.borderColor = (mode || "dark") === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
                      e.currentTarget.style.color = c.textMuted;
                    }}
                  >
                    <I d={chip.icon} s={9} />{chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", margin: isAI ? 0 : "6px", pointerEvents: isAI ? "auto" : undefined }}>
        <div style={{ background: isAI ? "transparent" : isDark ? "rgba(44,44,44,0.5)" : "rgba(255,255,255,0.45)", borderRadius: isAI ? 0 : 12, border: isAI ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}`, height: "100%", overflow: "auto", position: "relative" }}>
        {children}
        {/* Drag-over file drop overlay */}
        {isDragOver && onFileDrop && (
          <div className="absolute inset-0 flex items-center justify-center z-[50] pointer-events-none" style={{ background: "rgba(59,130,246,0.12)", border: "2px dashed rgba(59,130,246,0.5)", borderRadius: 10 }}>
            <div className="flex flex-col items-center gap-2">
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.9)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
              <span className="text-[11px] font-medium" style={{ color: "rgba(96,165,250,0.9)" }}>Drop file here</span>
            </div>
          </div>
        )}
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
        <img src="/alternus-os.png" alt="AI" className="w-5 h-5 rounded-full object-cover" />
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
type FileType = "video" | "photo" | "document" | "folder" | "word" | "excel" | "figma" | null;
type FileDestination = "VideoFile" | "PhotoFile" | "Document" | "Folder" | "Word" | "Excel" | "Figma.file";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
  fileType?: FileType;
  fileName?: string;
  routed?: FileDestination | null;
  appAction?: WinId;
  appLabel?: string;
}

const fileRouteButtons: { type: FileType; emoji: string; label: string; dest: FileDestination; color: string }[] = [
  { type: "video", emoji: "\uD83C\uDFA5", label: "D\u00EBrgo te VideoFile", dest: "VideoFile", color: "#EF4444" },
  { type: "photo", emoji: "\uD83D\uDCF8", label: "D\u00EBrgo te PhotoFile", dest: "PhotoFile", color: "#8B5CF6" },
  { type: "document", emoji: "\uD83D\uDCC4", label: "D\u00EBrgo te Document", dest: "Document", color: "#3B82F6" },
  { type: "folder", emoji: "\uD83D\uDCC1", label: "D\u00EBrgo te Folder", dest: "Folder", color: "#F59E0B" },
  { type: "word", emoji: "\uD83D\uDCDD", label: "D\u00EBrgo te Word/DOCX", dest: "Word", color: "#2563EB" },
  { type: "excel", emoji: "\uD83D\uDCCA", label: "D\u00EBrgo te Excel", dest: "Excel", color: "#10B981" },
  { type: "figma", emoji: "\uD83C\uDFA8", label: "D\u00EBrgo te Figma.file", dest: "Figma.file", color: "#EC4899" },
];

// Renders AI text with basic markdown: **bold**, bullet points, newlines
function AIFormattedText({ text, c }: { text: string; c: typeof palette.dark }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        const trimmed = line.trim();
        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("\u2022 ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^[-\u2022*]\s*/, "");
          return (
            <div key={li} className="flex gap-2 ml-2 my-1">
              <span style={{ color: c.textMuted }}>{"\u2022"}</span>
              <span><BoldText text={content} c={c} /></span>
            </div>
          );
        }
        // Empty line
        if (!trimmed) return <div key={li} className="h-3" />;
        // Normal line with bold support
        return <p key={li} className="my-0.5"><BoldText text={line} c={c} /></p>;
      })}
    </>
  );
}

// Renders **bold** segments within text
function BoldText({ text, c }: { text: string; c: typeof palette.dark }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ color: c.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function AIChat({ c, mode, setMode, onOpenApp }: { c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void; onOpenApp?: (id: WinId) => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [toast, setToast] = useState<{ text: string; color: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const hasMessages = msgs.length > 0;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const routeFile = (msgIdx: number, dest: FileDestination, color: string) => {
    setMsgs(p => p.map((m, i) => i === msgIdx ? { ...m, routed: dest } : m));
    const msg = msgs[msgIdx];
    setToast({ text: `${msg.fileName || "File"} \u2192 ${dest}`, color });
  };

  const getButtonsForType = (ft: FileType) => {
    if (!ft) return fileRouteButtons;
    const primary = fileRouteButtons.find(b => b.type === ft);
    return primary ? [primary] : fileRouteButtons;
  };

  const send = async (text?: string) => {
    const m = (text || input).trim();
    if (!m || isTyping) return;
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);

    // Check if user is trying to open an app
    const lower = m.toLowerCase();
    const matchedApp = appKeywords.find(a => a.keywords.some(k => lower.includes(k)));
    if (matchedApp) {
      setMsgs(p => [...p, { role: "ai", text: `Opening ${matchedApp.label} for you.`, appAction: matchedApp.id, appLabel: matchedApp.label }]);
      return;
    }

    setIsTyping(true);

    try {
      const conversationHistory = msgs.map(msg => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: m, conversationHistory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMsgs(p => [...p, { role: "ai", text: data.content }]);
    } catch {
      setMsgs(p => [...p, { role: "ai", text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const newChat = () => {
    setMsgs([]);
    setInput("");
  };

  const defaultChips = [
    { id: "explore-gallery", label: "Explore gallery", icon: ic.image },
    { id: "art-styles", label: "Art styles", icon: ic.sparkle },
    { id: "commission-art", label: "Commission art", icon: ic.pen },
    { id: "help-choose", label: "Help me choose", icon: ic.search },
    { id: "art-care", label: "Art care tips", icon: ic.shield },
  ];

  const addableChips = [
    { id: "generate-image", label: "Generate image", icon: ic.sparkle },
    { id: "art-news", label: "Art news today", icon: ic.globe },
    { id: "price-guide", label: "Art price guide", icon: ic.store },
    { id: "frame-advice", label: "Framing advice", icon: ic.image },
    { id: "color-palette", label: "Color palette ideas", icon: ic.pen },
    { id: "gift-ideas", label: "Art gift ideas", icon: ic.store },
  ];

  const [landingChips, setLandingChips] = useState(defaultChips);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load chips from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alternus_os_chips");
      if (saved) setLandingChips(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist chips
  useEffect(() => {
    localStorage.setItem("alternus_os_chips", JSON.stringify(landingChips));
  }, [landingChips]);

  const removeChip = (id: string) => {
    setLandingChips(prev => prev.filter(ch => ch.id !== id));
  };

  const addChip = (chip: typeof defaultChips[0]) => {
    setLandingChips(prev => {
      if (prev.some(ch => ch.id === chip.id)) return prev;
      return [...prev, chip];
    });
    setShowAddMenu(false);
  };

  const appKeywords: { keywords: string[]; id: WinId; label: string }[] = [
    { keywords: ["browser", "web", "internet", "browse"], id: "browser", label: "Browser" },
    { keywords: ["clock", "time", "alarm"], id: "clock", label: "Clock" },
    { keywords: ["code", "editor", "programming", "dev"], id: "code", label: "Code Editor" },
    { keywords: ["studio", "3d", "design", "blender", "model"], id: "studio", label: "Studio" },
    { keywords: ["files", "file", "folder", "explorer"], id: "files", label: "Files" },
    { keywords: ["terminal", "console", "shell", "cmd"], id: "terminal", label: "Terminal" },
    { keywords: ["music", "player", "song"], id: "music", label: "Music" },
    { keywords: ["weather", "forecast"], id: "weather", label: "Weather" },
    { keywords: ["calendar", "date", "schedule"], id: "calendar", label: "Calendar" },
    { keywords: ["notes", "note", "notepad"], id: "notes", label: "Notes" },
    { keywords: ["word", "document", "doc"], id: "word", label: "Word" },
    { keywords: ["store", "shop", "app store"], id: "store", label: "Store" },
    { keywords: ["movies", "movie", "video", "cinema"], id: "movies", label: "Movies" },
    { keywords: ["calculator", "calc", "math"], id: "calculator", label: "Calculator" },
    { keywords: ["settings", "preferences", "config"], id: "settings", label: "Settings" },
    { keywords: ["control", "panel", "system"], id: "controlpanel", label: "Control Panel" },
    { keywords: ["downloads", "download"], id: "downloads", label: "Downloads" },
  ];

  return (
    <div className="flex h-full" style={{ background: "transparent" }}>
      {/* Toast notification */}
      {toast && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium shadow-lg"
          style={{ background: toast.color, color: "#fff", animation: "fadeInUp 0.3s ease" }}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: "transparent" }}>
        {/* Account panel (toggleable) */}
        {showAccount && (
          <div className="p-4 space-y-3" style={{ borderBottom: `1px solid ${c.border}`, background: c.cardAlt }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: c.accent }}>
                  <I d={ic.user} s={20} c="#fff" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>Alternus User</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>user@alternusos.com</p>
                </div>
              </div>
              <button onClick={() => setShowAccount(false)} className="p-1 rounded-lg" style={{ color: c.textMuted }}>
                <I d={ic.close} s={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl" style={{ background: c.bg }}>
                <p className="text-[10px]" style={{ color: c.textMuted }}>Plan</p>
                <p className="text-xs font-semibold" style={{ color: c.text }}>Pro</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: c.bg }}>
                <p className="text-[10px]" style={{ color: c.textMuted }}>Messages</p>
                <p className="text-xs font-semibold" style={{ color: c.text }}>{"\u221E"} Unlimited</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: c.bg }}>
                <p className="text-[10px]" style={{ color: c.textMuted }}>Storage</p>
                <p className="text-xs font-semibold" style={{ color: c.text }}>50 GB</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl text-[11px] font-medium" style={{ background: c.accentSoft, color: c.accentText }}>Edit Profile</button>
              <button className="flex-1 py-2 rounded-xl text-[11px] font-medium" style={{ background: c.bg, color: c.danger }}>Sign Out</button>
            </div>
          </div>
        )}

        {!hasMessages ? (
          /* ===== GEMINI-STYLE LANDING ===== */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-[620px] -mt-8 text-center">
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
              {/* Greeting */}
              <h1 className="text-[36px] font-light mb-8" style={{ color: c.text }}>Where should we start?</h1>

              {/* Input box */}
              <div className="flex items-center gap-2 pl-5 pr-2 py-2 rounded-2xl mb-5"
                style={{
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  boxShadow: mode === "dark" ? "0 2px 16px rgba(0,0,0,0.15)" : "0 2px 16px rgba(0,0,0,0.06)",
                }}>
                <I d={ic.search} s={20} c={c.textMuted} />
                <input
                  className="flex-1 bg-transparent outline-none text-base py-2"
                  style={{ color: c.text }}
                  placeholder="Search or ask AI anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                />
                {/* + Add button inside search bar */}
                <div className="relative">
                  <button onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    style={{ color: c.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = c.accent; e.currentTarget.style.background = c.cardAlt; }}
                    onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; e.currentTarget.style.background = "transparent"; }}
                    title="Add quick action"
                  >
                    <I d={ic.plus} s={18} />
                  </button>

                  {/* Add menu dropdown */}
                  {showAddMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
                      <div className="absolute top-full mt-2 right-0 w-52 rounded-xl py-1 shadow-xl z-20"
                        style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                        <p className="px-3 py-2 text-[11px] font-medium" style={{ color: c.textMuted }}>Add quick action</p>
                        <div style={{ height: 1, background: c.border }} />
                        {addableChips.filter(a => !landingChips.some(ch => ch.id === a.id)).length === 0 ? (
                          <p className="px-3 py-3 text-[11px] text-center" style={{ color: c.textMuted }}>All actions added</p>
                        ) : (
                          addableChips
                            .filter(a => !landingChips.some(ch => ch.id === a.id))
                            .map(chip => (
                              <button key={chip.id} onClick={() => addChip(chip)}
                                className="flex items-center gap-2 px-3 py-2.5 text-[12px] transition-colors text-left rounded-lg"
                                style={{ color: c.textSec, margin: "2px 6px", width: "calc(100% - 12px)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                <I d={ic.plus} s={14} c={c.textMuted} />
                                {chip.label}
                              </button>
                            ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button onClick={() => send()} disabled={!input.trim()} className="px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex-shrink-0"
                  style={{ background: c.accent }}>
                  <I d={ic.send} s={16} c="#fff" />
                </button>
              </div>

              {/* App shortcut chips */}
              <div className="flex flex-wrap gap-2 justify-center items-center">
                {landingChips.map(chip => (
                  <div key={chip.id} className="relative group inline-flex">
                    <button onClick={() => send(chip.label)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] transition-colors"
                      style={{ background: c.cardAlt, color: c.textSec, border: `1px solid ${c.border}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textSec; }}>
                      <I d={chip.icon} s={14} />
                      {chip.label}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeChip(chip.id); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                      style={{ background: "#ef4444" }}
                      title="Remove"
                    >
                      <I d={ic.close} s={10} c="#fff" />
                    </button>
                  </div>
                ))}

              </div>
            </div>
          </div>
        ) : (
          /* ===== GEMINI-STYLE CONVERSATION VIEW ===== */
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>
              <div className="max-w-[720px] mx-auto space-y-6">
                {msgs.map((m, i) => (
                  m.role === "user" ? (
                    /* User message — right-aligned dark pill */
                    <div key={i} className="flex justify-end">
                      <div className="px-5 py-3 rounded-3xl text-[14px] leading-relaxed" style={{ background: c.cardAlt, color: c.text }}>
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    /* AI message — sparkle icon + open text */
                    <div key={i} className="flex gap-4 items-start">
                      <img src="/alternus-os.png" alt="AI" className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] leading-[1.8]" style={{ color: c.text }}>
                          <AIFormattedText text={m.text} c={c} />
                        </div>
                        {/* File routing buttons */}
                        {m.fileType && !m.routed && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {getButtonsForType(m.fileType).map((btn, bi) => (
                              <button key={bi} onClick={() => routeFile(i, btn.dest, btn.color)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
                                style={{ background: c.cardAlt, color: c.text, border: `1px solid ${c.border}` }}
                                onMouseEnter={e => { e.currentTarget.style.background = btn.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = btn.color; }}
                                onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; e.currentTarget.style.borderColor = c.border; }}>
                                <span>{btn.emoji}</span>
                                <span>{btn.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Routed confirmation */}
                        {m.routed && (
                          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl text-[11px]"
                            style={{ background: c.accentSoft, border: `1px solid ${c.accent}` }}>
                            <span style={{ color: c.accentText }}>{"\u2713"} Routed to {m.routed}</span>
                          </div>
                        )}
                        {/* App open action */}
                        {m.appAction && (
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={() => { if (onOpenApp) onOpenApp(m.appAction!); }}
                              className="px-4 py-2 rounded-xl text-[12px] font-medium transition-all hover:opacity-90"
                              style={{ background: c.accent, color: "#fff" }}>
                              Open {m.appLabel}
                            </button>
                            <button onClick={() => setMsgs(p => p.filter((_, idx) => idx !== i))}
                              className="px-3 py-2 rounded-xl text-[12px] transition-colors"
                              style={{ color: c.textMuted }}
                              onMouseEnter={e => { e.currentTarget.style.color = c.text; }}
                              onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; }}>
                              Dismiss
                            </button>
                          </div>
                        )}
                        {/* Action buttons — Gemini-style */}
                        {!m.appAction && <div className="flex items-center gap-1 mt-3">
                          {[
                            { icon: "M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3", title: "Good response" },
                            { icon: "M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17", title: "Bad response" },
                            { icon: ic.refresh, title: "Regenerate" },
                            { icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6v4H9z", title: "Copy" },
                          ].map((action, ai) => (
                            <button key={ai}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: c.textMuted }}
                              title={action.title}
                              onClick={() => {
                                if (action.title === "Copy") {
                                  navigator.clipboard.writeText(m.text);
                                  setToast({ text: "Copied to clipboard", color: c.accent });
                                }
                                if (action.title === "Regenerate") {
                                  const lastUserMsg = msgs.slice(0, i).reverse().find(msg => msg.role === "user");
                                  if (lastUserMsg) {
                                    setMsgs(p => p.filter((_, idx) => idx < i));
                                    setTimeout(() => send(lastUserMsg.text), 100);
                                  }
                                }
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.cardAlt; }}
                              onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; e.currentTarget.style.background = "transparent"; }}>
                              <I d={typeof action.icon === "string" ? action.icon : ""} s={14} />
                            </button>
                          ))}
                        </div>}
                      </div>
                    </div>
                  )
                ))}

                {/* Typing indicator — Gemini-style with sparkle */}
                {isTyping && (
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: c.accentSoft }}>
                      <I d={ic.sparkle} s={16} c={c.accent} />
                    </div>
                    <div className="flex gap-1.5 pt-2.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: c.textMuted, animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: c.textMuted, animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: c.textMuted, animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </div>

            {/* Gemini-style input bar */}
            <div className="px-6 pb-4 pt-2">
              <div className="max-w-[720px] mx-auto">
                <div className="rounded-2xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
                  <input
                    className="w-full bg-transparent outline-none text-[14px] px-5 pt-4 pb-2"
                    style={{ color: c.text }}
                    placeholder="Ask Alternus AI..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") send(); }}
                  />
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg" style={{ color: c.textMuted }} title="Attach"
                        onMouseEnter={e => { e.currentTarget.style.color = c.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; }}>
                        <I d={ic.plus} s={16} />
                      </button>
                    </div>
                    <button onClick={() => send()} disabled={!input.trim() || isTyping}
                      className="p-1.5 rounded-lg transition-opacity"
                      style={{ background: input.trim() ? c.accent : c.cardAlt, opacity: (!input.trim() || isTyping) ? 0.3 : 1 }}>
                      <I d={ic.send} s={14} c="#fff" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right sidebar — Icon bar with border + expandable panel */}
      <div className="flex-shrink-0 flex" style={{ borderLeft: `1px solid ${c.border}` }}>
        {/* Icon strip */}
        <div className="w-[52px] flex flex-col items-center py-4 gap-1" style={{ background: c.surface }}>
          {/* Alternus AI icon */}
          <img src="/alternus-os.png" alt="Alternus AI" className="w-8 h-8 rounded-full object-cover mb-1" />

          {/* New chat button */}
          <button onClick={newChat} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group" style={{ background: c.accent }} title="New chat">
            <I d={ic.plus} s={18} c="#fff" />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              New chat
            </span>
          </button>

          <div className="w-6 my-1" style={{ borderTop: `1px solid ${c.border}` }} />

          {/* App icons */}
          {[
            { label: "Code Editor", icon: ic.code, id: "code" as WinId },
            { label: "Music", icon: ic.music, id: "music" as WinId },
            { label: "Weather", icon: ic.cloud, id: "weather" as WinId },
            { label: "Calendar", icon: ic.calendar, id: "calendar" as WinId },
            { label: "Notes", icon: ic.note, id: "notes" as WinId },
            { label: "Word", icon: ic.fileText, id: "word" as WinId },
            { label: "Store", icon: ic.store, id: "store" as WinId },
            { label: "Movies", icon: ic.film, id: "movies" as WinId },
            { label: "Calculator", icon: ic.calc, id: "calculator" as WinId },
            { label: "Downloads", icon: ic.download, id: "downloads" as WinId },
          ].map(item => (
            <button key={item.label} onClick={() => { if (onOpenApp) onOpenApp(item.id); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
              style={{ color: c.textMuted }}
              title={item.label}
              onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
              <I d={item.icon} s={16} />
              <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                {item.label}
              </span>
            </button>
          ))}

          <div className="w-6 my-1" style={{ borderTop: `1px solid ${c.border}` }} />

          {/* System icons */}
          {[
            { label: "Control Panel", icon: ic.monitor, id: "controlpanel" as WinId },
            { label: "Settings", icon: ic.settings, id: "settings" as WinId },
            { label: "Accounts", icon: ic.user, id: "accounts" as WinId },
          ].map(item => (
            <button key={item.label} onClick={() => { if (onOpenApp) onOpenApp(item.id); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
              style={{ color: c.textMuted }}
              title={item.label}
              onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
              <I d={item.icon} s={16} />
              <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                {item.label}
              </span>
            </button>
          ))}

          <div className="flex-1" />

          <div className="w-6 my-1" style={{ borderTop: `1px solid ${c.border}` }} />

          {/* Bottom icons: profile, wifi, power, expand */}
          <button onClick={() => setShowAccount(!showAccount)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
            style={{ color: c.textMuted }}
            title="My account"
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.user} s={16} />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              My account
            </span>
          </button>

          <button onClick={() => send("Fix WiFi")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
            style={{ color: c.textMuted }}
            title="WiFi"
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.wifi} s={16} />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              WiFi
            </span>
          </button>

          <button onClick={() => { if (onOpenApp) onOpenApp("settings"); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
            style={{ color: c.textMuted }}
            title="Power"
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.power} s={16} />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              Power
            </span>
          </button>

          {/* Arrow up-down */}
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group"
            style={{ color: c.textMuted }}
            title="Expand"
            onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l-5 5h10zM12 19l-5-5h10z" />
            </svg>
            <span className="absolute right-full mr-2 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              Expand
            </span>
          </button>
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
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <p className="text-[13px] font-semibold" style={{ color: c.text }}>Library</p>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto py-2 px-3" style={{ scrollbarWidth: "none" }}>
        {tracks.map((t, i) => (
          <button key={i} onClick={() => { setCurrent(i); setPlaying(true); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all mb-1"
            style={{ borderRadius: "12px", background: i === current ? c.accentSoft : "transparent", border: i === current ? `1px solid ${c.accent}40` : "1px solid transparent" }}
            onMouseEnter={e => { if (i !== current) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (i !== current) e.currentTarget.style.background = "transparent"; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: i === current ? c.accent : c.cardAlt, boxShadow: i === current ? `0 0 16px ${c.accent}50` : "none" }}>
              <I d={ic.music} s={14} c={i === current ? "#fff" : c.textMuted} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: i === current ? c.accentText : c.text }}>{t.name}</p>
              <p className="text-[11px]" style={{ color: c.textMuted }}>{t.artist}</p>
            </div>
            <span className="text-[11px] font-mono" style={{ color: c.textMuted }}>{t.dur}</span>
          </button>
        ))}
      </div>

      {/* Now Playing */}
      <div className="flex-shrink-0 px-4 pt-3 pb-4" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: c.accent, boxShadow: `0 0 16px ${c.accent}50` }}>
            <I d={ic.music} s={14} c="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: c.text }}>{tracks[current].name}</p>
            <p className="text-[11px]" style={{ color: c.textMuted }}>{tracks[current].artist}</p>
          </div>
        </div>
        <div className="w-full h-1 rounded-full mb-4" style={{ background: c.cardAlt }}>
          <div className="h-full rounded-full" style={{ background: c.accent, width: playing ? "45%" : "0%", transition: "width 0.3s" }} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p > 0 ? p - 1 : tracks.length - 1)}><I d={ic.skip} s={16} /></button>
          <button className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
            style={{ background: c.accent, boxShadow: `0 0 20px ${c.accent}60` }}
            onClick={() => setPlaying(!playing)}>
            <I d={playing ? ic.pause : ic.play} s={16} c="#fff" />
          </button>
          <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p < tracks.length - 1 ? p + 1 : 0)}><I d={ic.skip} s={16} /></button>
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
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [cities] = useState([
    { name: "New York", condition: "Golden Sun", temp: 25, icon: ic.sun },
    { name: "London", condition: "Partly Cloudy", temp: 14, icon: ic.cloud },
    { name: "Tokyo", condition: "Clear Sky", temp: 22, icon: ic.sun },
  ]);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const city = cities[activeCityIdx];

  const modes = [
    { id: "hot", label: "Hot", icon: ic.sun },
    { id: "fan", label: "Fan", icon: "M12 12c-1.5-3-4.5-5-7-4s-2 5 1 7c-3 1.5-5 4.5-4 7s5 2 7-1c1.5 3 4.5 5 7 4s2-5-1-7c3-1.5 5-4.5 4-7s-5-2-7 1z" },
    { id: "cold", label: "Cold", icon: "M12 2v20M17 7l-5 5-5-5M7 17l5-5 5 5M2 12h20M7 7l-5 5 5 5M17 7l5 5-5 5" },
    { id: "damp", label: "Damp", icon: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {/* Header card */}
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: c.accentSoft, border: `1px solid ${c.border}` }}>
          <div>
            <p className="text-lg font-semibold" style={{ color: c.text }}>{city.name}</p>
            <p className="text-[11px]" style={{ color: c.textMuted }}>{city.condition}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold" style={{ color: c.accentText }}>{city.temp}°C</p>
            <I d={city.icon} s={28} c={c.accentText} />
          </div>
        </div>

        {/* City selector */}
        <div className="flex gap-2">
          {cities.map((ct, i) => (
            <button key={i} onClick={() => setActiveCityIdx(i)}
              className="flex-1 py-2 rounded-xl text-[10px] font-medium transition-colors"
              style={{ background: i === activeCityIdx ? c.accent : c.cardAlt, color: i === activeCityIdx ? "#fff" : c.textSec }}>
              {ct.name}
            </button>
          ))}
        </div>

        {/* Mode buttons */}
        <div className="flex gap-2">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(activeMode === m.id ? null : m.id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors"
              style={{ background: activeMode === m.id ? c.accentSoft : c.cardAlt, border: activeMode === m.id ? `1px solid ${c.accent}` : `1px solid transparent` }}
            >
              <I d={m.icon} s={18} c={activeMode === m.id ? c.accentText : c.textSec} />
              <span className="text-[10px] font-medium" style={{ color: activeMode === m.id ? c.accentText : c.textSec }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Consumption", value: "1.5 kWh", icon: ic.cpu },
            { label: "Humidity", value: "48%", icon: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" },
            { label: "Wind", value: "12 km/h", icon: "M12 12c-1.5-3-4.5-5-7-4s-2 5 1 7c-3 1.5-5 4.5-4 7s5 2 7-1c1.5 3 4.5 5 7 4s2-5-1-7c3-1.5 5-4.5 4-7s-5-2-7 1z" },
            { label: "UV Index", value: "3 Low", icon: ic.sun },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: c.cardAlt }}>
              <div className="flex items-center gap-1.5 mb-1">
                <I d={s.icon} s={12} c={c.textMuted} />
                <p className="text-[10px]" style={{ color: c.textMuted }}>{s.label}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: c.text }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* 5-day forecast */}
        <div>
          <p className="text-[10px] font-medium px-1 mb-2" style={{ color: c.textMuted }}>5-Day Forecast</p>
          <div className="flex gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: i === 2 ? c.accentSoft : c.cardAlt }}>
                <span className="text-[9px] font-medium" style={{ color: i === 2 ? c.accentText : c.textMuted }}>{d}</span>
                <I d={[ic.sun, ic.cloud, ic.sun, ic.cloud, ic.sun][i]} s={14} c={i === 2 ? c.accentText : c.textSec} />
                <span className="text-[10px] font-medium" style={{ color: i === 2 ? c.accentText : c.text }}>{[15, 14, city.temp, 16, 19][i]}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add city bar */}
      <div className="flex-shrink-0 px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
          <I d={ic.search} s={14} c={c.textMuted} />
          <input
            type="text"
            placeholder="Add city for weather"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: c.text }}
          />
          <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: c.accentSoft }}
            onMouseEnter={e => { e.currentTarget.style.background = c.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = c.accentSoft; }}>
            <I d={ic.plus} s={14} c={c.accentText} />
          </button>
        </div>
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
                { bg: "", img: "/wallpapers/OSwp5.png", label: "OSwp5" },
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
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all overflow-hidden"
              style={{ boxShadow: showAIPanel ? "0 0 8px rgba(139,92,246,0.4)" : "none" }}>
              <img src="/alternus-os.png" alt="AI" className="w-6 h-6 rounded-full object-cover" />
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
            <img src="/alternus-os.png" alt="AI" className="w-5 h-5 rounded-full object-cover" />
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

function FilesApp({ c, onOpenApp, onTrashEmpty, onDragFile }: { c: typeof palette.dark; onOpenApp: (id: WinId) => void; onTrashEmpty?: (files: { name: string; icon: string; size: string; origin: string }[]) => void; onDragFile?: (name: string) => void }) {
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
    if (onTrashEmpty && fileSystem.Trash.length > 0) {
      onTrashEmpty(fileSystem.Trash.map(f => ({ name: f.name, icon: f.icon, size: f.size, origin: "Trash" })));
    }
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
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left transition-all"
            style={{ borderRadius: "8px", background: curPath === item.path ? c.accentSoft : "transparent", borderLeft: curPath === item.path ? `2px solid ${c.accent}` : "2px solid transparent", minHeight: 34 }}
            onMouseEnter={e => { if (curPath !== item.path) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (curPath !== item.path) e.currentTarget.style.background = "transparent"; }}>
            <I d={item.icon} s={14} c={curPath === item.path ? c.accentText : c.textMuted} />
            <span className="text-[11px] font-medium" style={{ color: curPath === item.path ? c.accentText : c.textSec }}>{item.label}</span>
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
            <div key={i} className="relative"
              draggable={f.type === "file"}
              onDragStart={e => { if (f.type === "file") { e.dataTransfer.setData("text/plain", f.name); e.dataTransfer.effectAllowed = "copy"; if (onDragFile) onDragFile(f.name); } }}>
              <button className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-left transition-colors"
                style={{ background: selectedFile === f.name ? c.accentSoft : "transparent", border: selectedFile === f.name ? `1px solid ${c.accent}30` : "1px solid transparent", borderRadius: "8px", minHeight: 38 }}
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

// ─── Brain visualization data (module-level, computed once) ─────────────────
const _BP: [number, number, boolean][] = [
  // [cx, cy, isGold] — SVG viewBox 600 × 400
  // Crown
  [293,65,false],[312,55,true],[330,62,false],[352,72,false],
  // Upper-left curve
  [265,78,false],[248,96,false],[240,120,false],[238,145,false],
  // Upper-right curve
  [376,90,false],[394,112,false],[400,138,false],[394,165,false],
  // Upper-middle band
  [275,88,false],[297,79,false],[318,70,false],[342,82,false],[370,98,false],
  // Interior top folds
  [286,110,false],[306,103,true],[326,109,false],[344,120,false],[302,125,true],[322,132,false],
  // Middle band
  [252,154,false],[270,142,false],[291,147,false],[313,142,false],[334,147,false],[356,154,false],[380,162,false],
  // Interior middle
  [282,162,true],[304,156,false],[324,160,false],[346,166,false],
  // Lower band
  [257,174,false],[275,170,false],[295,175,false],[318,170,false],[340,174,false],[364,180,false],
  // Interior lower
  [268,190,false],[289,187,false],[309,190,false],[331,186,false],[352,192,false],
  // Bottom cerebrum
  [266,212,false],[286,215,false],[306,218,false],[326,213,false],[344,209,false],
  // Cerebellum
  [358,207,false],[372,200,false],[388,210,false],[398,226,false],[390,246,false],[372,252,false],[354,247,false],[344,233,false],
  // Brainstem
  [303,226,false],[301,248,true],[299,270,false],
];
const _BC: [number, number][] = (() => {
  const out: [number, number][] = [];
  _BP.forEach(([ax,ay],i) => _BP.forEach(([bx,by],j) => {
    if (j <= i) return;
    if ((ax-bx)**2+(ay-by)**2 < 58**2) out.push([i,j]);
  }));
  return out;
})();
const _BW = Array.from({length:130},(_,i) =>
  2.5 + Math.abs(Math.sin(i*0.22)*5 + Math.sin(i*0.07)*3.5 + Math.sin(i*0.55)*1.5)
);
// ─────────────────────────────────────────────────────────────────────────────

function BrowserApp({ c }: { c: typeof palette.dark }) {
  const [url, setUrl] = useState("https://alternus.art");
  const [displayUrl, setDisplayUrl] = useState("https://alternus.art");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [history, setHistory] = useState<string[]>(["https://alternus.art"]);
  const [showAIComp, setShowAIComp] = useState(false);
  const bookmarks = [
    { name: "Alternus Art", url: "https://alternus.art", icon: ic.store },
    { name: "GitHub",       url: "https://github.com",  icon: ic.code  },
    { name: "Google",       url: "https://google.com",  icon: ic.search},
    { name: "Stack Overflow",url:"https://stackoverflow.com",icon: ic.terminal},
  ];

  const navigate = (newUrl: string) => {
    let f = newUrl;
    if (!f.startsWith("http")) f = "https://" + f;
    setDisplayUrl(f); setUrl(f);
    setHistory(p => [...p, f]);
    setIsLoading(true); setLoadError(false);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const isAlternus = url.includes("alternus.art");

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>

      {/* ── URL Bar ── */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => { if (history.length > 1) { const h=[...history]; h.pop(); setHistory(h); setUrl(h[h.length-1]); setDisplayUrl(h[h.length-1]); } }}
          className="p-1.5 flex-shrink-0 transition-colors" style={{ color: c.textMuted, borderRadius: "8px" }}
          onMouseEnter={e=>(e.currentTarget.style.background=c.cardAlt)}
          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
          <I d={ic.chevL} s={14} />
        </button>

        {/* URL input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2" style={{ background: c.cardAlt, border: `1px solid ${c.border}`, borderRadius: "12px" }}>
          {isLoading
            ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor:`${c.accent} transparent ${c.accent} ${c.accent}` }} />
            : <I d={ic.globe} s={12} c={c.textMuted} />}
          <input className="flex-1 bg-transparent outline-none text-[12px]" style={{ color: c.text }}
            value={displayUrl} onChange={e=>setDisplayUrl(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") navigate(displayUrl); }} />
        </div>

        {/* AI companion toggle */}
        <button onClick={()=>setShowAIComp(p=>!p)} className="flex items-center gap-0 flex-shrink-0 transition-all"
          style={{ borderRadius: "9999px", padding: "3px 14px 3px 4px",
            background: showAIComp ? c.accentSoft : c.surface,
            border: `1.5px solid ${showAIComp ? c.accent : c.border}`,
            boxShadow: showAIComp ? `0 0 18px ${c.accent}70, 0 0 40px ${c.accent}30` : `0 0 10px ${c.accent}25` }}
          onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 0 18px ${c.accent}70, 0 0 40px ${c.accent}30`; e.currentTarget.style.borderColor=c.accent; }}
          onMouseLeave={e=>{ if(!showAIComp){ e.currentTarget.style.boxShadow=`0 0 10px ${c.accent}25`; e.currentTarget.style.borderColor=c.border; } }}>
          {/* Brain icon circle */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: showAIComp ? c.accent : c.cardAlt, boxShadow: showAIComp ? `0 0 12px ${c.accent}80` : "none", transition: "all 0.2s" }}>
            <I d={ic.sparkle} s={14} c={showAIComp ? "#fff" : c.accentText} />
          </div>
          <span className="text-[12px] font-semibold ml-2" style={{ color: showAIComp ? c.accentText : c.text }}>✦ AI</span>
        </button>
      </div>

      {/* ── Bookmarks bar ── */}
      <div className="flex items-center px-3 py-1 flex-shrink-0" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        {bookmarks.map((b,i) => (
          <button key={i} onClick={()=>navigate(b.url)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{ color: c.textSec, borderRadius: "6px" }}
            onMouseEnter={e=>(e.currentTarget.style.background=c.cardAlt)}
            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <I d={b.icon} s={11} c={c.textMuted} /> {b.name}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[11px] font-medium pr-2" style={{ color: c.textSec }}>AI Companion</span>
      </div>

      {/* ── Content + optional AI panel ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Main content area */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ background: c.cardAlt }}>
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:`${c.accent} transparent ${c.accent} ${c.accent}` }} />
              <p className="text-xs" style={{ color: c.textMuted }}>Loading {displayUrl}…</p>
            </div>
          ) : isAlternus ? (
            /* ── Brain Visualization ── */
            <div className="absolute inset-0 flex flex-col" style={{ background: "radial-gradient(ellipse at 50% 20%, #1B2F50 0%, #0D1929 55%, #080F1C 100%)" }}>
              {/* Top light ray */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 65% 0%, rgba(80,140,255,0.15) 0%, transparent 55%)" }} />

              {/* Neural brain SVG */}
              <div className="flex-1 relative">
                <svg viewBox="0 0 600 330" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="glowGold" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="5" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <radialGradient id="brainGlow" cx="50%" cy="45%" r="50%">
                      <stop offset="0%" stopColor="rgba(100,160,255,0.08)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                  </defs>

                  {/* Ambient glow behind brain */}
                  <ellipse cx="312" cy="155" rx="165" ry="130" fill="url(#brainGlow)" />

                  {/* Neural connections */}
                  {_BC.map(([i,j],k) => (
                    <line key={k}
                      x1={_BP[i][0]} y1={_BP[i][1]} x2={_BP[j][0]} y2={_BP[j][1]}
                      stroke={(_BP[i][2]||_BP[j][2]) ? "rgba(210,168,50,0.30)" : "rgba(90,150,255,0.22)"}
                      strokeWidth={(_BP[i][2]||_BP[j][2]) ? "0.8" : "0.5"} />
                  ))}

                  {/* Neural nodes */}
                  {_BP.map(([x,y,gold],i) => gold ? (
                    <g key={i} filter="url(#glowGold)">
                      <circle cx={x} cy={y} r="4" fill="#D4A832" opacity="0.9" />
                      <circle cx={x} cy={y} r="2" fill="#FFD960" />
                    </g>
                  ) : (
                    <g key={i} filter="url(#glowBlue)">
                      <circle cx={x} cy={y} r="2.5" fill="#5AB4FF" opacity="0.7" />
                      <circle cx={x} cy={y} r="1" fill="#A8D8FF" />
                    </g>
                  ))}

                  {/* Scattered star particles */}
                  {[[40,20],[80,45],[520,30],[560,80],[30,180],[580,200],[50,280],[510,260],[155,15],[430,18],[100,300],[480,305]].map(([px,py],i) => (
                    <circle key={i} cx={px} cy={py} r="1" fill="rgba(200,220,255,0.5)" />
                  ))}
                </svg>
              </div>

              {/* ── Analysis overlay bar ── */}
              <div className="flex-shrink-0 px-6 py-2" style={{ background: "linear-gradient(0deg, rgba(5,10,22,0.95) 0%, rgba(5,10,22,0.6) 100%)" }}>
                <div className="flex items-center gap-6 mb-2">
                  <span className="text-[12px]" style={{ color: "#8CAECE" }}>Analyzing: <strong style={{ color: "#E8F4FF" }}>75%</strong></span>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <span className="text-[12px]" style={{ color: "#8CAECE" }}>Data Sources: <strong style={{ color: "#E8F4FF" }}>GitHub, ArXiv</strong></span>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <span className="text-[12px]" style={{ color: "#8CAECE" }}>Insight Generation: <strong style={{ color: "#E8F4FF" }}>High</strong></span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2" style={{ color: "#8CAECE" }}>
                    <I d={ic.volume} s={13} c="#8CAECE" />
                    <I d={ic.chevR} s={11} c="#8CAECE" />
                  </div>
                </div>
                {/* Waveform */}
                <svg viewBox={`0 0 ${_BW.length * 4.5} 18`} className="w-full" style={{ height: 14 }} preserveAspectRatio="none">
                  {_BW.map((h,i) => (
                    <rect key={i} x={i*4.5} y={(18-h)/2} width="2.5" height={h} rx="1"
                      fill={i>45&&i<80 ? "#C8900A" : "rgba(90,160,255,0.55)"} opacity={0.8} />
                  ))}
                </svg>
                {/* Scale ticks */}
                <div className="flex justify-between mt-0.5" style={{ color: "rgba(100,140,180,0.5)", fontSize: 8 }}>
                  {["0","","","4","","","8","","","12","","","16"].map((t,i)=><span key={i}>{t}</span>)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <iframe src={url} className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Browser" onError={()=>setLoadError(true)} />
              {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: c.cardAlt }}>
                  <I d={ic.globe} s={32} c={c.textMuted} />
                  <p className="text-sm font-medium" style={{ color: c.text }}>Cannot display this page</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>{url} refused to connect</p>
                  <button onClick={()=>navigate(url)} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background: c.accent, color:"#fff" }}>Retry</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── AI Companion panel ── */}
        {showAIComp && (
          <div className="w-[200px] flex-shrink-0 flex flex-col" style={{ background: c.surface, borderLeft: `1px solid ${c.border}` }}>
            <div className="px-3 pt-3 pb-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.accentSoft }}>
                  <I d={ic.sparkle} s={14} c={c.accentText} />
                </div>
                <p className="text-[12px] font-semibold" style={{ color: c.text }}>AI Companion</p>
              </div>
              <p className="text-[10px]" style={{ color: c.textMuted }}>Analyzing current page…</p>
            </div>
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              <div className="rounded-xl p-2.5" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: c.textSec }}>ANALYZING</p>
                <div className="h-1 rounded-full mb-1.5" style={{ background: c.cardAlt }}>
                  <div className="h-full rounded-full" style={{ width: "75%", background: c.accent }} />
                </div>
                <p className="text-[10px]" style={{ color: c.textMuted }}>75% · GitHub, ArXiv</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: c.textSec }}>INSIGHT</p>
                <p className="text-[10px]" style={{ color: c.textMuted }}>Generation: <span style={{ color: c.accentText }}>High</span></p>
              </div>
              {["Summarize this page","Find key facts","Translate content"].map((a,i) => (
                <button key={i} className="w-full text-left px-2.5 py-2 text-[11px] transition-colors"
                  style={{ color: c.textSec, background: "transparent", borderRadius: "8px" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=c.cardAlt)}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  {a}
                </button>
              ))}
            </div>
          </div>
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

// ━━━━ STORE APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StoreApp({ c, installedApps, installingApp, installProgress, handleInstallApp, setPaymentModal }: {
  c: typeof palette.dark;
  installedApps: string[];
  installingApp: string | null;
  installProgress: number;
  handleInstallApp: (name: string) => void;
  setPaymentModal: (app: { name: string; price: string; icon: string; iconBg: string } | null) => void;
}) {
  const { ref, w, scale } = useContainerSize(680);
  const [activeTab, setActiveTab] = useState(0);
  const [activeCat, setActiveCat] = useState(0);

  const storeCats = [
    { icon: ic.sparkle, label: "Discover" },
    { icon: ic.play, label: "Games" },
    { icon: ic.store, label: "Apps" },
    { icon: ic.settings, label: "Categories" },
  ];
  const allApps = [
    { name: "Alternus Paint", desc: "Digital art & illustration", icon: ic.pen, iconBg: "#8B5CF6", price: "Free", rating: "4.9", reviews: "14K" },
    { name: "CloudSync Pro", desc: "Sync files across devices", icon: ic.cloud, iconBg: "#06B6D4", price: "$4.99", rating: "4.7", reviews: "8.2K" },
    { name: "Alternus Chat", desc: "Encrypted messaging", icon: ic.send, iconBg: "#10B981", price: "Free", rating: "4.8", reviews: "22K" },
    { name: "MindMap AI", desc: "AI brainstorming tool", icon: ic.sparkle, iconBg: "#F59E0B", price: "$2.99", rating: "4.6", reviews: "3.1K" },
    { name: "Pixel Quest", desc: "Retro platformer", icon: ic.play, iconBg: "#EF4444", price: "Free", rating: "4.5", reviews: "9.7K" },
    { name: "Neural Racer", desc: "AI racing game", icon: ic.cpu, iconBg: "#8B5CF6", price: "$9.99", rating: "4.4", reviews: "5.6K" },
  ];
  const trendingApps = [
    { name: "Code Breaker", desc: "Logic puzzle game", icon: ic.lock, iconBg: "#3B82F6", price: "Free", rating: "4.7", reviews: "6.3K" },
    { name: "Galaxy Wars", desc: "Space strategy", icon: ic.sparkle, iconBg: "#F59E0B", price: "$5.99", rating: "4.8", reviews: "11K" },
    { name: "AlternusTV", desc: "Stream movies & shows", icon: ic.film, iconBg: "#EF4444", price: "Free", rating: "4.9", reviews: "31K" },
    { name: "Alternus Photos", desc: "AI photo editor", icon: ic.image, iconBg: "#EC4899", price: "Free", rating: "4.6", reviews: "18K" },
  ];
  const editorPicks = [
    { name: "Focus Timer", desc: "Pomodoro & productivity", icon: ic.clock, iconBg: "#10B981", price: "Free", rating: "4.8", reviews: "7.4K" },
    { name: "Sketch AI", desc: "AI-powered drawing", icon: ic.pen, iconBg: "#EC4899", price: "$3.99", rating: "4.7", reviews: "4.2K" },
    { name: "DataVault", desc: "Secure password manager", icon: ic.shield, iconBg: "#6366F1", price: "Free", rating: "4.9", reviews: "15K" },
    { name: "SoundScape", desc: "Ambient sound mixer", icon: ic.music, iconBg: "#F59E0B", price: "$1.99", rating: "4.5", reviews: "2.8K" },
  ];
  const tabs = ["Featured", "Top", "My Apps", "Updates", "Settings"];

  const fs = (base: number) => Math.round(base * scale);
  const cols = w > 900 ? 3 : w > 550 ? 2 : 1;

  const renderAppRow = (app: typeof allApps[0]) => (
    <div key={app.name} className="flex items-center gap-3 rounded-2xl transition-all cursor-pointer group"
      style={{ padding: `${fs(10)}px ${fs(12)}px`, background: c.cardAlt }}
      onMouseEnter={e => { e.currentTarget.style.background = c.border; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${c.accent}15`; }}
      onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ width: fs(44), height: fs(44), background: `radial-gradient(circle at 30% 30%, ${app.iconBg}30, ${app.iconBg}12)`, border: `1px solid ${app.iconBg}20` }}>
        <I d={app.icon} s={fs(20)} c={app.iconBg} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ fontSize: fs(12), color: c.text }}>{app.name}</p>
        <p className="truncate" style={{ fontSize: fs(10), color: c.textMuted, marginTop: 2 }}>{app.desc}</p>
        <p style={{ fontSize: fs(9), color: c.textMuted, marginTop: 3, opacity: 0.7 }}>
          <span style={{ color: "#F59E0B" }}>&#9733;</span> {app.rating} &middot; {app.reviews} ratings
        </p>
      </div>
      {installingApp === app.name ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="rounded-full overflow-hidden" style={{ width: fs(72), height: fs(6), background: c.border }}>
            <div className="h-full rounded-full transition-all duration-200" style={{ width: `${installProgress}%`, background: c.accent }} />
          </div>
          <span className="font-medium" style={{ fontSize: fs(9), color: c.textMuted }}>{Math.round(installProgress)}%</span>
        </div>
      ) : installedApps.includes(app.name) ? (
        <span className="rounded-full font-semibold flex-shrink-0" style={{ fontSize: fs(10), padding: `${fs(4)}px ${fs(14)}px`, background: c.successSoft, color: c.success }}>Open</span>
      ) : (
        <button onClick={() => app.price === "Free" ? handleInstallApp(app.name) : setPaymentModal(app)}
          className="rounded-full font-semibold flex-shrink-0 transition-all"
          style={{
            fontSize: fs(10), padding: `${fs(4)}px ${fs(14)}px`,
            background: app.price === "Free" ? c.accent : "transparent",
            color: app.price === "Free" ? "#fff" : c.accentText,
            border: app.price !== "Free" ? `1px solid ${c.accent}` : "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 16px ${c.accent}40`; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
          {app.price === "Free" ? "Get" : app.price}
        </button>
      )}
    </div>
  );

  return (
    <div ref={ref} className="flex flex-col h-full overflow-hidden">
      {/* Top nav bar */}
      <div className="flex items-center gap-1 flex-shrink-0" style={{ padding: `${fs(8)}px ${fs(16)}px`, borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-1 flex-1">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className="rounded-full font-medium transition-all relative"
              style={{
                padding: `${fs(5)}px ${fs(14)}px`, fontSize: fs(11),
                background: activeTab === i ? "transparent" : "transparent",
                color: activeTab === i ? c.accentText : c.textMuted,
                borderBottom: activeTab === i ? `2px solid ${c.accent}` : "2px solid transparent",
              }}
              onMouseEnter={e => { if (activeTab !== i) e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { if (activeTab !== i) e.currentTarget.style.background = "transparent"; }}>
              {tab}
              {tab === "Updates" && <span className="absolute -top-0.5 -right-0.5 rounded-full" style={{ width: fs(6), height: fs(6), background: c.danger, animation: "pulse 2s infinite" }} />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl" style={{ padding: `${fs(5)}px ${fs(10)}px`, width: `clamp(100px, 25%, 200px)`, background: c.cardAlt, border: `1px solid ${c.border}` }}>
          <I d={ic.search} s={fs(12)} c={c.textMuted} />
          <input className="flex-1 bg-transparent outline-none" style={{ fontSize: fs(11), color: c.text }} placeholder="Search apps..." />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 flex flex-col py-2 px-2" style={{ width: `clamp(110px, 20%, 170px)`, borderRight: `1px solid ${c.border}` }}>
          {storeCats.map((s, i) => (
            <button key={i} onClick={() => setActiveCat(i)}
              className="w-full flex items-center gap-3 rounded-xl text-left transition-all"
              style={{
                padding: `${fs(8)}px ${fs(12)}px`,
                background: activeCat === i ? c.accentSoft : "transparent",
                borderLeft: activeCat === i ? `3px solid ${c.accent}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (activeCat !== i) e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { if (activeCat !== i) e.currentTarget.style.background = "transparent"; }}>
              <I d={s.icon} s={fs(16)} c={activeCat === i ? c.accentText : c.textMuted} />
              <span className="font-medium" style={{ fontSize: fs(12), color: activeCat === i ? c.accentText : c.text }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: `${fs(16)}px`, scrollbarWidth: "none" }}>
          {/* Featured Banner */}
          <div className="rounded-2xl relative overflow-hidden" style={{
            padding: `${fs(20)}px ${fs(22)}px`, marginBottom: fs(20),
            background: `linear-gradient(135deg, ${c.accent}18, ${c.purple}14, transparent 70%), radial-gradient(ellipse at 20% 50%, ${c.accent}12, transparent 60%), radial-gradient(ellipse at 85% 25%, ${c.purple}10, transparent 50%), ${c.cardAlt}`,
            border: `1px solid ${c.accent}12`,
          }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-2xl flex items-center justify-center" style={{
                width: fs(52), height: fs(52),
                background: `radial-gradient(circle at 35% 35%, ${c.accent}35, ${c.accent}15)`,
                boxShadow: `0 4px 20px ${c.accent}20`,
              }}>
                <I d={ic.sparkle} s={fs(26)} c={c.accent} />
              </div>
              <div>
                <p className="font-bold" style={{ fontSize: fs(16), color: c.text }}>Alternus AI Suite</p>
                <p style={{ fontSize: fs(11), color: c.textMuted }}>The complete AI productivity toolkit</p>
              </div>
            </div>
            <p className="leading-relaxed" style={{ fontSize: fs(11), color: c.textSec, marginBottom: fs(14) }}>Create, edit, and automate with AI. Includes Paint, Chat, and MindMap tools in one bundle.</p>
            <button className="rounded-xl font-semibold transition-all" style={{
              padding: `${fs(8)}px ${fs(20)}px`, fontSize: fs(12),
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent}DD)`, color: "#fff",
              boxShadow: `0 2px 12px ${c.accent}30`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${c.accent}50`; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 12px ${c.accent}30`; e.currentTarget.style.transform = "none"; }}>
              Get Bundle &mdash; Free
            </button>
          </div>

          {/* Best Apps and Games */}
          <div className="flex items-center justify-between" style={{ marginBottom: fs(12) }}>
            <p className="font-bold" style={{ fontSize: fs(15), color: c.text }}>Best Apps and Games</p>
            <span className="font-medium cursor-pointer flex items-center gap-1 transition-all" style={{ fontSize: fs(11), color: c.accentText }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              See All <I d={ic.chevR} s={fs(10)} c={c.accentText} />
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: fs(10) }}>
            {allApps.map(renderAppRow)}
          </div>

          {/* Trending Now - horizontal scroll */}
          <div className="flex items-center justify-between" style={{ marginTop: fs(24), marginBottom: fs(12) }}>
            <p className="font-bold" style={{ fontSize: fs(15), color: c.text }}>Trending Now</p>
            <span className="font-medium cursor-pointer flex items-center gap-1" style={{ fontSize: fs(11), color: c.accentText }}>
              See All <I d={ic.chevR} s={fs(10)} c={c.accentText} />
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {trendingApps.map(app => (
              <div key={app.name} className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all group"
                style={{ width: `clamp(155px, 30%, 230px)`, background: c.cardAlt }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${app.iconBg}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div className="relative flex items-center justify-center" style={{
                  height: fs(80),
                  background: `linear-gradient(135deg, ${app.iconBg}20, ${app.iconBg}08), radial-gradient(circle at 40% 30%, ${app.iconBg}25, transparent 60%), ${c.cardAlt}`,
                }}>
                  <I d={app.icon} s={fs(28)} c={app.iconBg + "70"} />
                  <div className="absolute top-2 right-2 rounded-md font-bold" style={{ padding: `${fs(2)}px ${fs(6)}px`, fontSize: fs(8), background: "rgba(0,0,0,0.5)", color: "#F59E0B" }}>&#9733; {app.rating}</div>
                </div>
                <div style={{ padding: `${fs(10)}px ${fs(12)}px` }}>
                  <p className="font-semibold truncate" style={{ fontSize: fs(11), color: c.text }}>{app.name}</p>
                  <p className="truncate" style={{ fontSize: fs(9), color: c.textMuted, marginTop: 2 }}>{app.desc}</p>
                  <button onClick={() => app.price === "Free" ? handleInstallApp(app.name) : setPaymentModal(app)}
                    className="rounded-full font-semibold transition-all" style={{
                    fontSize: fs(9), padding: `${fs(3)}px ${fs(12)}px`, marginTop: fs(8),
                    background: app.price === "Free" ? c.accent : "transparent", color: app.price === "Free" ? "#fff" : c.accentText,
                    border: app.price !== "Free" ? `1px solid ${c.accent}` : "none",
                  }}>
                    {app.price === "Free" ? "Get" : app.price}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Editor's Picks */}
          <div className="flex items-center justify-between" style={{ marginTop: fs(24), marginBottom: fs(12) }}>
            <p className="font-bold" style={{ fontSize: fs(15), color: c.text }}>Editor&apos;s Picks</p>
            <span className="font-medium cursor-pointer flex items-center gap-1" style={{ fontSize: fs(11), color: c.accentText }}>
              See All <I d={ic.chevR} s={fs(10)} c={c.accentText} />
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: fs(10) }}>
            {editorPicks.map(renderAppRow)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━ MOVIES APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MoviesApp({ c }: { c: typeof palette.dark }) {
  const { ref, w, scale } = useContainerSize(720);
  const [activeCat, setActiveCat] = useState(0);

  const movieCats = [
    { icon: ic.play, label: "For You" },
    { icon: ic.film, label: "Movies" },
    { icon: ic.monitor, label: "Series" },
    { icon: ic.sparkle, label: "New" },
    { icon: ic.clock, label: "Watchlist" },
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

  const fs = (base: number) => Math.round(base * scale);
  const gridCols = w > 800 ? 4 : w > 550 ? 3 : 2;

  const movieCard = (m: typeof trending[0], rank?: number) => (
    <div key={m.name} className="rounded-2xl overflow-hidden cursor-pointer transition-all group"
      style={{ background: c.cardAlt }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03) translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${m.color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      {/* Poster - cinematic multi-layer gradient */}
      <div style={{
        height: fs(120), position: "relative", overflow: "hidden",
        background: `linear-gradient(180deg, transparent 30%, ${m.color}60 100%), radial-gradient(ellipse at 50% 0%, ${m.color}30, transparent 70%), radial-gradient(circle at 25% 65%, ${m.color}18, transparent 50%), radial-gradient(circle at 75% 35%, ${c.purple}12, transparent 45%), linear-gradient(135deg, ${c.cardAlt}, ${c.card})`,
        boxShadow: `inset 0 -30px 30px -15px rgba(0,0,0,0.2)`,
      }}>
        {/* Large initial letter as background */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.08 }}>
          <span style={{ fontSize: fs(72), fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.name[0]}</span>
        </div>
        {/* Rank number */}
        {rank && <div className="absolute bottom-1 left-2" style={{ fontSize: fs(32), fontWeight: 900, color: m.color, opacity: 0.25, lineHeight: 1 }}>{rank}</div>}
        {/* Rating badge */}
        <div className="absolute top-2 right-2 rounded-lg font-bold flex items-center gap-1" style={{
          padding: `${fs(2)}px ${fs(7)}px`, fontSize: fs(9),
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }}>
          <span style={{ color: "#F59E0B" }}>&#9733;</span>
          <span style={{ color: "#fff" }}>{m.rating}</span>
        </div>
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: fs(36), height: fs(36), background: c.accent, boxShadow: `0 0 20px ${c.accent}50` }}>
            <I d={ic.play} s={fs(14)} c="#fff" />
          </div>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: `${fs(10)}px ${fs(12)}px` }}>
        <p className="font-semibold truncate" style={{ fontSize: fs(12), color: c.text }}>{m.name}</p>
        <p style={{ fontSize: fs(9), color: c.textMuted, marginTop: fs(3) }}>{m.genre} &middot; {m.year} &middot; {m.duration}</p>
      </div>
    </div>
  );

  // Circular progress ring SVG
  const progressRing = (progress: number, color: string, size: number) => {
    const r = size * 0.4;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.border} strokeWidth={2.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease" }} />
      </svg>
    );
  };

  return (
    <div ref={ref} className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="flex-shrink-0 flex flex-col py-2 px-2" style={{ width: `clamp(95px, 18%, 155px)`, borderRight: `1px solid ${c.border}` }}>
        {movieCats.map((s, i) => (
          <button key={i} onClick={() => setActiveCat(i)}
            className="w-full flex items-center gap-2.5 rounded-xl text-left transition-all"
            style={{
              padding: `${fs(8)}px ${fs(10)}px`,
              background: activeCat === i ? c.accentSoft : "transparent",
              borderLeft: activeCat === i ? `3px solid ${c.accent}` : "3px solid transparent",
            }}
            onMouseEnter={e => { if (activeCat !== i) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { if (activeCat !== i) e.currentTarget.style.background = "transparent"; }}>
            <I d={s.icon} s={fs(15)} c={activeCat === i ? c.accentText : c.textMuted} />
            <span className="font-medium" style={{ fontSize: fs(11), color: activeCat === i ? c.accentText : c.text }}>{s.label}</span>
          </button>
        ))}
        {/* User profile mini */}
        <div className="mt-auto pt-3" style={{ borderTop: `1px solid ${c.border}`, marginTop: fs(12) }}>
          <div className="flex items-center gap-2 rounded-xl" style={{ padding: `${fs(6)}px ${fs(8)}px` }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: fs(24), height: fs(24), background: c.accent + "25" }}>
              <I d={ic.user} s={fs(12)} c={c.accentText} />
            </div>
            <span style={{ fontSize: fs(9), color: c.textMuted }}>My Profile</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: `${fs(14)}px ${fs(16)}px`, scrollbarWidth: "none" }}>
        {/* Featured Hero */}
        <div className="rounded-2xl overflow-hidden relative" style={{
          marginBottom: fs(20), minHeight: fs(180),
          background: `linear-gradient(to top, ${c.surface}EE 0%, transparent 55%), linear-gradient(to right, ${c.surface}DD 0%, transparent 45%), radial-gradient(ellipse at 70% 25%, ${featured.color}35, transparent 65%), radial-gradient(ellipse at 30% 75%, ${featured.color}15, transparent 55%), linear-gradient(135deg, ${featured.color}25, ${c.cardAlt})`,
          border: `1px solid ${featured.color}12`,
        }}>
          {/* Large background letter */}
          <div className="absolute right-6 top-2" style={{ fontSize: fs(100), fontWeight: 900, color: featured.color, opacity: 0.06, lineHeight: 1, pointerEvents: "none" }}>
            {featured.name[0]}
          </div>
          <div style={{ padding: `${fs(24)}px ${fs(22)}px`, position: "relative", zIndex: 1 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: fs(8) }}>
              <span className="rounded-full font-bold flex items-center gap-1" style={{
                fontSize: fs(9), padding: `${fs(3)}px ${fs(10)}px`,
                background: "#F59E0B", color: "#000",
                boxShadow: "0 0 8px rgba(245,158,11,0.3)",
              }}>&#9733; {featured.rating}</span>
              <span style={{ fontSize: fs(10), color: c.textMuted }}>{featured.genre} &middot; {featured.year}</span>
              <span className="rounded-full" style={{ fontSize: fs(9), padding: `${fs(3)}px ${fs(10)}px`, background: c.accent + "18", color: c.accentText }}>Featured</span>
            </div>
            <p className="font-extrabold" style={{
              fontSize: fs(24), color: c.text, marginBottom: fs(6),
              textShadow: `0 2px 8px ${featured.color}20`,
            }}>{featured.name}</p>
            <p className="leading-relaxed" style={{ fontSize: fs(12), color: c.textSec, marginBottom: fs(16), maxWidth: "70%" }}>{featured.desc}</p>
            <div className="flex gap-3 items-center">
              <button className="rounded-xl font-semibold flex items-center gap-2 transition-all" style={{
                padding: `${fs(9)}px ${fs(22)}px`, fontSize: fs(12),
                background: c.accent, color: "#fff",
                boxShadow: `0 2px 16px ${c.accent}35`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${c.accent}55`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 16px ${c.accent}35`; e.currentTarget.style.transform = "none"; }}>
                <I d={ic.play} s={fs(12)} c="#fff" /> Watch Now
              </button>
              <button className="rounded-xl font-medium transition-all" style={{
                padding: `${fs(9)}px ${fs(20)}px`, fontSize: fs(12),
                background: "transparent", color: c.text,
                border: `1px solid ${c.border}`, backdropFilter: "blur(4px)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                + Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (<>
          <div className="flex items-center justify-between" style={{ marginBottom: fs(10) }}>
            <p className="font-bold" style={{ fontSize: fs(14), color: c.text }}>Continue Watching</p>
          </div>
          <div className="flex gap-3" style={{ marginBottom: fs(20) }}>
            {continueWatching.map(m => (
              <div key={m.name} className="flex-1 rounded-2xl cursor-pointer transition-all flex items-center gap-3"
                style={{ padding: `${fs(12)}px ${fs(14)}px`, background: c.cardAlt }}
                onMouseEnter={e => { e.currentTarget.style.background = c.border; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.transform = "none"; }}>
                <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  width: fs(40), height: fs(40),
                  background: `radial-gradient(circle, ${m.color}25, ${m.color}08)`,
                }}>
                  <I d={ic.play} s={fs(16)} c={m.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ fontSize: fs(12), color: c.text }}>{m.name}</p>
                  <p style={{ fontSize: fs(9), color: c.textMuted, marginTop: 2 }}>{m.ep}</p>
                </div>
                <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: fs(34), height: fs(34) }}>
                  {progressRing(m.progress, c.accent, fs(34))}
                  <span className="absolute" style={{ fontSize: fs(8), fontWeight: 700, color: c.text, transform: "rotate(0deg)" }}>{m.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </>)}

        {/* Trending Now */}
        <div className="flex items-center justify-between" style={{ marginBottom: fs(10) }}>
          <p className="font-bold" style={{ fontSize: fs(14), color: c.text }}>Trending Now</p>
          <span className="font-medium cursor-pointer flex items-center gap-1" style={{ fontSize: fs(11), color: c.accentText }}>
            See All <I d={ic.chevR} s={fs(10)} c={c.accentText} />
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: fs(10), marginBottom: fs(20) }}>
          {trending.map(m => movieCard(m))}
        </div>

        {/* Top Rated */}
        <div className="flex items-center justify-between" style={{ marginBottom: fs(10) }}>
          <p className="font-bold" style={{ fontSize: fs(14), color: c.text }}>Top Rated</p>
          <span className="font-medium cursor-pointer flex items-center gap-1" style={{ fontSize: fs(11), color: c.accentText }}>
            See All <I d={ic.chevR} s={fs(10)} c={c.accentText} />
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: fs(10) }}>
          {topRated.map((m, i) => movieCard(m, i + 1))}
        </div>
      </div>
    </div>
  );
}

// ━━━━ Alternus Studio 3D ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StudioApp({ c }: { c: typeof palette.dark }) {
  const { ref, w, scale } = useContainerSize(720);
  const fs = (base: number) => Math.round(base * scale);
  const [activeWS, setActiveWS] = useState(1);
  const [selObj, setSelObj] = useState("Cube");

  const workspaces = ["Layout", "Modeling", "Sculpting", "Shading", "Animation", "Rendering"];
  const menus = ["File", "Edit", "Render", "Window", "Help"];
  const tools = [
    { icon: ic.mouse, tip: "Select Box" },
    { icon: ic.share, tip: "Move" },
    { icon: ic.refresh, tip: "Rotate" },
    { icon: ic.maximize, tip: "Scale" },
    { icon: ic.plus, tip: "Cursor" },
    { icon: ic.pen, tip: "Annotate" },
    { icon: ic.type, tip: "Measure" },
  ];
  const sceneItems = [
    { name: "Camera", icon: ic.film, type: "camera" },
    { name: "Cube", icon: ic.maximize, type: "mesh" },
    { name: "Light", icon: ic.sun, type: "light" },
  ];
  const transform = {
    location: { x: "0.000", y: "0.000", z: "0.000" },
    rotation: { x: "0.00°", y: "0.00°", z: "0.00°" },
    scale: { x: "1.000", y: "1.000", z: "1.000" },
  };

  const gridColor = c.border;
  const panelBg = c.surface;
  const darkBg = c.bg;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: darkBg, color: c.text, fontSize: fs(10), overflow: "hidden", fontFamily: "monospace" }}>

      {/* Top Menu Bar */}
      <div style={{ display: "flex", alignItems: "center", background: panelBg, borderBottom: `1px solid ${c.border}`, height: fs(26), flexShrink: 0, gap: fs(2), padding: `0 ${fs(6)}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: fs(1), marginRight: fs(8) }}>
          <I d={ic.pen} s={fs(12)} c={c.accent} />
          <span style={{ fontSize: fs(10), fontWeight: 700, color: c.accent, marginLeft: fs(3) }}>Studio</span>
        </div>
        {menus.map(m => (
          <div key={m} style={{ padding: `${fs(3)}px ${fs(7)}px`, cursor: "pointer", borderRadius: fs(3), fontSize: fs(10), color: c.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            {m}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {workspaces.map((ws, i) => (
          <div key={ws} onClick={() => setActiveWS(i)} style={{
            padding: `${fs(3)}px ${fs(8)}px`, cursor: "pointer", borderRadius: fs(3), fontSize: fs(10),
            background: activeWS === i ? c.accentSoft : "transparent",
            color: activeWS === i ? c.accent : c.textMuted,
            fontWeight: activeWS === i ? 600 : 400,
          }}
            onMouseEnter={e => { if (activeWS !== i) e.currentTarget.style.background = c.border; }}
            onMouseLeave={e => { if (activeWS !== i) e.currentTarget.style.background = "transparent"; }}>
            {ws}
          </div>
        ))}
      </div>

      {/* Main Area: Left toolbar + Viewport + Right panels */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left Toolbar */}
        <div style={{ width: fs(32), background: panelBg, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: fs(6), gap: fs(2), flexShrink: 0 }}>
          {tools.map((t, i) => (
            <div key={i} title={t.tip} style={{
              width: fs(24), height: fs(24), display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: fs(4), cursor: "pointer", background: i === 0 ? c.accentSoft : "transparent",
            }}
              onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = c.border; }}
              onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = i === 0 ? c.accentSoft : "transparent"; }}>
              <I d={t.icon} s={fs(13)} c={i === 0 ? c.accent : c.textMuted} />
            </div>
          ))}
        </div>

        {/* Center Viewport */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: darkBg }}>
          {/* Grid */}
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.15 }}>
            <defs>
              <pattern id="sgrid" width={fs(30)} height={fs(30)} patternUnits="userSpaceOnUse">
                <path d={`M ${fs(30)} 0 L 0 0 0 ${fs(30)}`} fill="none" stroke={gridColor} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sgrid)" />
            {/* Axis lines */}
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#EF4444" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#22C55E" strokeWidth="0.5" opacity="0.3" />
          </svg>

          {/* Wireframe Cube */}
          <svg width={fs(140)} height={fs(140)} viewBox="0 0 140 140" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            {/* Back face */}
            <polygon points="45,25 105,25 105,85 45,85" fill="none" stroke={c.accent} strokeWidth="1" opacity="0.3" />
            {/* Front face */}
            <polygon points="25,45 85,45 85,115 25,115" fill="none" stroke={c.accent} strokeWidth="1.2" opacity="0.7" />
            {/* Connecting edges */}
            <line x1="25" y1="45" x2="45" y2="25" stroke={c.accent} strokeWidth="0.8" opacity="0.5" />
            <line x1="85" y1="45" x2="105" y2="25" stroke={c.accent} strokeWidth="0.8" opacity="0.5" />
            <line x1="85" y1="115" x2="105" y2="85" stroke={c.accent} strokeWidth="0.8" opacity="0.5" />
            <line x1="25" y1="115" x2="45" y2="85" stroke={c.accent} strokeWidth="0.8" opacity="0.3" />
            {/* Vertices */}
            {[[25,45],[85,45],[85,115],[25,115],[45,25],[105,25],[105,85],[45,85]].map(([cx,cy], vi) => (
              <circle key={vi} cx={cx} cy={cy} r="2" fill={c.accent} opacity="0.8" />
            ))}
          </svg>

          {/* Viewport labels */}
          <div style={{ position: "absolute", top: fs(8), left: fs(8), fontSize: fs(9), color: c.textMuted, opacity: 0.6 }}>
            <div>User Perspective</div>
            <div style={{ fontSize: fs(8), marginTop: fs(2) }}>(numpad 5)</div>
          </div>
          <div style={{ position: "absolute", top: fs(8), right: fs(8), display: "flex", gap: fs(4), alignItems: "center" }}>
            {["X", "Y", "Z"].map((ax, ai) => (
              <div key={ax} style={{ fontSize: fs(9), fontWeight: 700, color: ["#EF4444", "#22C55E", "#3B82F6"][ai], opacity: 0.7 }}>{ax}</div>
            ))}
          </div>
          {/* Watermark */}
          <div style={{ position: "absolute", bottom: fs(30), left: "50%", transform: "translateX(-50%)", fontSize: fs(11), color: c.textMuted, opacity: 0.15, fontWeight: 700, letterSpacing: fs(3), whiteSpace: "nowrap" }}>
            ALTERNUS STUDIO 3D
          </div>
          {/* Camera widget */}
          <div style={{ position: "absolute", top: fs(8), right: fs(60), display: "flex", gap: fs(3) }}>
            <div style={{ width: fs(20), height: fs(20), borderRadius: fs(3), background: c.surface, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <I d={ic.search} s={fs(10)} c={c.textMuted} />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: fs(180), background: panelBg, borderLeft: `1px solid ${c.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>

          {/* Outliner */}
          <div style={{ borderBottom: `1px solid ${c.border}`, padding: fs(6), flexShrink: 0 }}>
            <div style={{ fontSize: fs(10), fontWeight: 600, color: c.textMuted, marginBottom: fs(6), display: "flex", alignItems: "center", gap: fs(4) }}>
              <I d={ic.folder} s={fs(10)} c={c.textMuted} /> Scene Collection
            </div>
            {sceneItems.map(item => (
              <div key={item.name} onClick={() => setSelObj(item.name)} style={{
                display: "flex", alignItems: "center", gap: fs(5), padding: `${fs(3)}px ${fs(4)}px`,
                borderRadius: fs(3), cursor: "pointer", marginBottom: fs(1),
                background: selObj === item.name ? c.accentSoft : "transparent",
                color: selObj === item.name ? c.accent : c.text,
              }}
                onMouseEnter={e => { if (selObj !== item.name) e.currentTarget.style.background = c.border; }}
                onMouseLeave={e => { if (selObj !== item.name) e.currentTarget.style.background = selObj === item.name ? c.accentSoft : "transparent"; }}>
                <I d={item.icon} s={fs(10)} c={selObj === item.name ? c.accent : c.textMuted} />
                <span style={{ fontSize: fs(10) }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Properties */}
          <div style={{ flex: 1, overflow: "auto", padding: fs(6) }}>
            <div style={{ fontSize: fs(10), fontWeight: 600, color: c.textMuted, marginBottom: fs(6), display: "flex", alignItems: "center", gap: fs(4) }}>
              <I d={ic.maximize} s={fs(10)} c={c.accent} /> Transform
            </div>
            {(["location", "rotation", "scale"] as const).map(prop => (
              <div key={prop} style={{ marginBottom: fs(8) }}>
                <div style={{ fontSize: fs(9), color: c.textMuted, textTransform: "capitalize", marginBottom: fs(3) }}>{prop}</div>
                {(["x", "y", "z"] as const).map(axis => (
                  <div key={axis} style={{ display: "flex", alignItems: "center", gap: fs(3), marginBottom: fs(2) }}>
                    <span style={{ fontSize: fs(9), fontWeight: 600, color: { x: "#EF4444", y: "#22C55E", z: "#3B82F6" }[axis], width: fs(10) }}>{axis.toUpperCase()}</span>
                    <div style={{ flex: 1, background: c.cardAlt, borderRadius: fs(2), padding: `${fs(2)}px ${fs(4)}px`, fontSize: fs(9), color: c.text, border: `1px solid ${c.border}` }}>
                      {transform[prop][axis]}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Collapsible sections */}
            {["Relations", "Collections", "Shading", "Visibility"].map(sec => (
              <div key={sec} style={{ display: "flex", alignItems: "center", gap: fs(4), padding: `${fs(3)}px 0`, borderTop: `1px solid ${c.border}`, cursor: "pointer", marginTop: fs(2) }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                <I d={ic.chevR} s={fs(9)} c={c.textMuted} />
                <span style={{ fontSize: fs(9), color: c.textMuted }}>{sec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Timeline */}
      <div style={{ height: fs(36), background: panelBg, borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: fs(4), padding: `0 ${fs(6)}px`, flexShrink: 0 }}>
        {/* Playback controls */}
        <div style={{ display: "flex", gap: fs(2), alignItems: "center", marginRight: fs(6) }}>
          {[{ icon: ic.skip, flip: true }, { icon: ic.play }, { icon: ic.pause }, { icon: ic.skip, flip: false }].map((b, bi) => (
            <div key={bi} style={{
              width: fs(20), height: fs(20), display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: fs(3), cursor: "pointer", background: bi === 1 ? c.accentSoft : "transparent",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
              onMouseLeave={e => { e.currentTarget.style.background = bi === 1 ? c.accentSoft : "transparent"; }}>
              <I d={b.icon} s={fs(10)} c={bi === 1 ? c.accent : c.textMuted} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: fs(9), color: c.textMuted, minWidth: fs(50) }}>Frame: 1</div>
        {/* Timeline track */}
        <div style={{ flex: 1, height: fs(16), background: c.cardAlt, borderRadius: fs(3), position: "relative", overflow: "hidden", border: `1px solid ${c.border}` }}>
          {/* Frame markers */}
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: `${i * 10}%`, top: 0, bottom: 0, width: 1, background: c.border, opacity: 0.5 }}>
              {i % 2 === 0 && <span style={{ position: "absolute", top: fs(1), left: fs(2), fontSize: fs(7), color: c.textMuted }}>{i * 25}</span>}
            </div>
          ))}
          {/* Scrubber */}
          <div style={{ position: "absolute", left: "0.4%", top: 0, bottom: 0, width: fs(2), background: c.accent, borderRadius: fs(1) }} />
        </div>
        <div style={{ fontSize: fs(9), color: c.textMuted, minWidth: fs(60), textAlign: "right" }}>End: 250</div>
      </div>

      {/* Bottom Status Bar */}
      <div style={{ height: fs(20), background: c.cardAlt, borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", padding: `0 ${fs(8)}px`, gap: fs(12), flexShrink: 0 }}>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>Object Mode</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>|</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>Vertices: 8</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>|</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>Faces: 6</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>|</span>
        <span style={{ fontSize: fs(9), color: c.textMuted }}>Edges: 12</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: fs(9), color: c.textMuted }}>Collection: Scene Collection</span>
        <span style={{ fontSize: fs(9), color: c.accent, fontWeight: 600 }}>{selObj}</span>
      </div>
    </div>
  );
}

// ━━━━ Control Panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ControlPanelApp({ c, mode, setMode, onOpenApp }: { c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void; onOpenApp?: (id: WinId) => void }) {
  const [activeSection, setActiveSection] = useState("System");
  const [perfStats, setPerfStats] = useState({ cpu: 23, mem: 58, gpu: 12 });
  const [diagMsg, setDiagMsg] = useState<string | null>(null);

  const refreshStats = () => {
    setPerfStats({ cpu: Math.floor(Math.random() * 35 + 5), mem: Math.floor(Math.random() * 25 + 40), gpu: Math.floor(Math.random() * 18 + 3) });
  };

  const runDiagnostic = () => {
    setDiagMsg("running");
    setTimeout(() => setDiagMsg("ok"), 1600);
    setTimeout(() => setDiagMsg(null), 5000);
  };

  const exportLog = () => {
    const log = `ALTERNUS OS v3.0 — SYSTEM LOG\n---\nCPU: ${perfStats.cpu}%\nMemory: ${perfStats.mem}%\nGPU: ${perfStats.gpu}%\nStatus: Operational\nTimestamp: ${new Date().toISOString()}`;
    const a = document.createElement("a");
    a.href = "data:text/plain," + encodeURIComponent(log);
    a.download = "alternus-log.txt";
    a.click();
  };

  // ── Design tokens — derived from OS palette (dark/light aware) ──
  const dt = {
    bg:      c.bg,
    panel:   c.surface,
    card:    c.card,
    text:    c.text,
    textSec: c.textSec,
    accent:  c.accent,
    success: c.success,
    warning: c.warning,
    error:   c.danger,
    border:  c.border,
    hover:   c.cardAlt,
    font:    "'Inter', sans-serif",
    r:       "4px",
    tr:      "0.1s ease",
  };

  // Shared helpers
  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: dt.card, border: `1px solid ${dt.border}`, borderRadius: dt.r, ...style }}>{children}</div>
  );
  const SectionTitle = ({ label }: { label: string }) => (
    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: dt.textSec, fontFamily: dt.font, marginBottom: 12 }}>{label}</p>
  );
  const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${dt.border}` }}>
      <span style={{ fontSize: 13, color: dt.textSec, fontFamily: dt.font }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: valueColor ?? dt.text, fontFamily: dt.font }}>{value}</span>
    </div>
  );
  const Btn = ({ label, variant, onClick }: { label: string; variant: "accent-outline" | "accent-solid" | "gray-outline"; onClick?: () => void }) => {
    const base: React.CSSProperties = { height: 36, padding: "0 16px", borderRadius: dt.r, fontSize: 14, fontWeight: 500, fontFamily: dt.font, cursor: "pointer", border: "1px solid", transition: dt.tr, flex: 1 };
    const styles = {
      "accent-outline": { ...base, background: "transparent", borderColor: dt.accent, color: dt.accent },
      "accent-solid":   { ...base, background: dt.accent, borderColor: dt.accent, color: "#fff" },
      "gray-outline":   { ...base, background: "transparent", borderColor: dt.border, color: dt.textSec },
    };
    return (
      <button style={styles[variant]} onClick={onClick}
        onMouseEnter={e => { const el = e.currentTarget; if (variant === "accent-outline") { el.style.background = dt.hover; } else if (variant === "accent-solid") { el.style.opacity = "0.85"; } else { el.style.background = dt.hover; } }}
        onMouseLeave={e => { const el = e.currentTarget; if (variant === "accent-outline") { el.style.background = "transparent"; } else if (variant === "accent-solid") { el.style.opacity = "1"; } else { el.style.background = "transparent"; } }}
        onMouseDown={e => (e.currentTarget.style.opacity = "0.7")}
        onMouseUp={e => (e.currentTarget.style.opacity = "1")}>
        {label}
      </button>
    );
  };
  const Bar = ({ pct, color = dt.accent }: { pct: number; color?: string }) => (
    <div style={{ height: 6, background: dt.border, borderRadius: dt.r, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: dt.r, transition: "width 0.5s ease" }} />
    </div>
  );
  const Toggle = ({ on }: { on: boolean }) => (
    <div style={{ width: 32, height: 18, borderRadius: 9, background: on ? dt.accent : dt.border, cursor: "pointer", position: "relative", transition: dt.tr, flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 17 : 3, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: dt.tr }} />
    </div>
  );

  const sections = [
    { label: "System",   icon: ic.monitor },
    { label: "Boot",     icon: ic.power },
    { label: "Security", icon: ic.shield },
    { label: "Display",  icon: ic.sun },
    { label: "Network",  icon: ic.wifi },
    { label: "Storage",  icon: ic.folder },
    { label: "Services", icon: ic.settings },
    { label: "Devices",  icon: ic.cpu },
    { label: "Users",    icon: ic.user },
    { label: "Updates",  icon: ic.refresh },
  ];

  const renderContent = () => {
    const p = { padding: 24, fontFamily: dt.font } as React.CSSProperties;
    switch (activeSection) {

      // ── SYSTEM ──────────────────────────────────────────────
      case "System": return (
        <div style={{ ...p, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 20, fontWeight: 600, color: dt.text, fontFamily: dt.font }}>Control Panel</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: dt.success, fontFamily: dt.font }}>● Operational</span>
          </div>

          {/* System Info — 2-col grid */}
          <Card>
            <div style={{ padding: "14px 16px 6px", borderBottom: `1px solid ${dt.border}` }}>
              <SectionTitle label="System Information" />
            </div>
            <div style={{ padding: "0 16px 8px" }}>
              {([
                ["OS",           "Alternus OS v3.0"],
                ["Kernel",       "AlternusKernel 6.2"],
                ["CPU",          "AlternusCore x86_64 @ 4.2 GHz"],
                ["RAM",          "16 GB DDR5"],
                ["GPU",          "Integrated Graphics"],
                ["Architecture", "64-bit"],
              ] as [string, string][]).map(([label, value], i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${dt.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: dt.textSec }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: dt.text }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance */}
          <Card>
            <div style={{ padding: "14px 16px 6px", borderBottom: `1px solid ${dt.border}` }}>
              <SectionTitle label="Performance" />
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                ["CPU Usage", "cpu"],
                ["Memory",    "mem"],
                ["GPU",       "gpu"],
              ] as [string, keyof typeof perfStats][]).map(([label, key]) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: dt.textSec }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: dt.text }}>{perfStats[key]}%</span>
                  </div>
                  <Bar pct={perfStats[key]} />
                </div>
              ))}
            </div>
          </Card>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Refresh"    variant="accent-outline" onClick={refreshStats} />
            <Btn label="Diagnostic" variant="accent-solid"   onClick={runDiagnostic} />
            <Btn label="Export"     variant="gray-outline"   onClick={exportLog} />
          </div>

          {/* Diagnostic result */}
          {diagMsg && (
            <div style={{ padding: "10px 14px", borderRadius: dt.r, border: `1px solid ${diagMsg === "ok" ? dt.success + "50" : dt.accent + "50"}`, background: diagMsg === "ok" ? dt.success + "12" : dt.accent + "12", fontSize: 13, color: diagMsg === "ok" ? dt.success : dt.text }}>
              {diagMsg === "running" ? "Running diagnostic…" : "✓ All systems passed — no issues detected."}
            </div>
          )}

          {/* Footer row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: `1px solid ${dt.border}` }}>
            <span style={{ fontSize: 12, color: dt.textSec }}>Last check: 2 min ago</span>
            <button style={{ height: 32, padding: "0 14px", borderRadius: dt.r, fontSize: 13, fontWeight: 500, background: "transparent", border: `1px solid ${dt.error}`, color: dt.error, cursor: "pointer", transition: dt.tr }}
              onMouseEnter={e => { e.currentTarget.style.background = `${c.danger}22`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onMouseDown={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseUp={e => (e.currentTarget.style.opacity = "1")}
              onClick={() => onOpenApp && onOpenApp("recovery")}>
              Shutdown
            </button>
          </div>
        </div>
      );

      // ── BOOT ────────────────────────────────────────────────
      case "Boot": return (
        <div style={{ ...p, display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: dt.text }}>Boot</span>
          <Card>
            <div style={{ padding: "14px 16px 6px", borderBottom: `1px solid ${dt.border}` }}><SectionTitle label="Configuration" /></div>
            <div style={{ padding: "0 16px 8px" }}>
              {([["Boot Mode","UEFI"],["Secure Boot","Enabled"],["Fast Boot","Enabled"],["Boot Timeout","5 seconds"],["Default OS","Alternus OS v3.0"]] as [string,string][]).map(([l,v],i,a) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<a.length-1 ? `1px solid ${dt.border}` : "none" }}>
                  <span style={{ fontSize:13, color:dt.textSec }}>{l}</span>
                  <span style={{ fontSize:14, fontWeight:500, color:dt.text }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ padding: "14px 16px 6px", borderBottom: `1px solid ${dt.border}` }}><SectionTitle label="Boot Order" /></div>
            <div style={{ padding: "0 16px 8px" }}>
              {["1. NVMe SSD — Alternus OS","2. USB Drive","3. Network (PXE)","4. Optical Drive"].map((item,i) => (
                <div key={i} style={{ padding:"8px 0", borderBottom: i<3 ? `1px solid ${dt.border}` : "none", fontSize:13, color: i===0 ? dt.accent : dt.textSec }}>{item}</div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ padding: "14px 16px 6px", borderBottom: `1px solid ${dt.border}` }}><SectionTitle label="Startup Programs" /></div>
            <div style={{ padding: "0 16px 8px" }}>
              {([["Alternus Shell",true],["AI Engine",true],["Network Manager",true],["Cloud Sync",true],["Bluetooth Service",false]] as [string,boolean][]).map(([name,on],i,a) => (
                <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<a.length-1 ? `1px solid ${dt.border}` : "none" }}>
                  <span style={{ fontSize:13, color:dt.text }}>{name}</span>
                  <Toggle on={on} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      );

      // ── SECURITY ────────────────────────────────────────────
      case "Security": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Security</span>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:dt.success+"14", border:`1px solid ${dt.success}40`, borderRadius:dt.r }}>
            <I d={ic.shield} s={20} c={dt.success} />
            <div><p style={{ fontSize:14, fontWeight:500, color:dt.text }}>System Protected</p><p style={{ fontSize:12, color:dt.textSec }}>All security features active</p></div>
          </div>
          {[
            { title:"Firewall", rows:[["Status","Active",dt.success],["Inbound Rules","24 rules"],["Outbound Rules","18 rules"],["Blocked (24h)","147"]] as [string,string,string?][] },
            { title:"Encryption", rows:[["Disk","AES-256",dt.success],["Secure Boot","Enabled",dt.success],["TPM","v2.0 Active",dt.success]] as [string,string,string?][] },
          ].map(section => (
            <Card key={section.title}>
              <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}><SectionTitle label={section.title} /></div>
              <div style={{ padding:"0 16px 8px" }}>
                {section.rows.map(([l,v,vc],i,a) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i<a.length-1?`1px solid ${dt.border}`:"none" }}>
                    <span style={{ fontSize:13, color:dt.textSec }}>{l}</span>
                    <span style={{ fontSize:14, fontWeight:500, color:vc??dt.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <Card>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}><SectionTitle label="Privacy" /></div>
            <div style={{ padding:"0 16px 8px" }}>
              {([["Location Services",false],["Camera Access",true],["Microphone",true],["Analytics",false],["Ad Tracking",false]] as [string,boolean][]).map(([name,on],i,a) => (
                <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<a.length-1?`1px solid ${dt.border}`:"none" }}>
                  <span style={{ fontSize:13, color:dt.text }}>{name}</span><Toggle on={on} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      );

      // ── DISPLAY ─────────────────────────────────────────────
      case "Display": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Display</span>
          <Card>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}><SectionTitle label="Settings" /></div>
            <div style={{ padding:"0 16px 8px" }}>
              {([["Resolution","1920 × 1080"],["Refresh Rate","60 Hz"],["Scaling","100%"],["Color Depth","32-bit"]] as [string,string][]).map(([l,v],i,a) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i<a.length-1?`1px solid ${dt.border}`:"none" }}>
                  <span style={{ fontSize:13, color:dt.textSec }}>{l}</span>
                  <span style={{ fontSize:14, fontWeight:500, color:dt.text }}>{v}</span>
                </div>
              ))}
              <div style={{ padding:"8px 0", borderBottom:`1px solid ${dt.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:dt.textSec }}>Brightness</span>
                  <span style={{ fontSize:13, color:dt.text }}>75%</span>
                </div>
                <Bar pct={75} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0" }}>
                <span style={{ fontSize:13, color:dt.textSec }}>Theme</span>
                <div style={{ display:"flex", gap:4 }}>
                  {(["dark","light"] as ThemeMode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{ height:28, padding:"0 12px", borderRadius:dt.r, fontSize:12, fontWeight:500, cursor:"pointer", transition:dt.tr, border:`1px solid ${mode===m ? dt.accent : dt.border}`, background: mode===m ? dt.accent : "transparent", color: mode===m ? "#fff" : dt.textSec }}>{m==="dark"?"Dark":"Light"}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      );

      // ── NETWORK ─────────────────────────────────────────────
      case "Network": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Network</span>
          <Card>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <SectionTitle label="Wi-Fi" />
                <span style={{ fontSize:11, color:dt.success, fontWeight:500, marginTop:-8 }}>● Connected</span>
              </div>
            </div>
            <div style={{ padding:"0 16px 8px" }}>
              {([["Network","Alternus-Net-5G"],["IP Address","192.168.1.105"],["MAC","A1:B2:C3:D4:E5:F6"],["Signal","Excellent (−42 dBm)"],["Speed","866 Mbps"],["DNS","8.8.8.8"]] as [string,string][]).map(([l,v],i,a) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i<a.length-1?`1px solid ${dt.border}`:"none" }}>
                  <span style={{ fontSize:13, color:dt.textSec }}>{l}</span>
                  <span style={{ fontSize:14, fontWeight:500, color:dt.text }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <SectionTitle label="Ethernet" />
                <span style={{ fontSize:11, color:dt.textSec, marginTop:-8 }}>Not connected</span>
              </div>
            </div>
            <div style={{ padding:"12px 16px" }}><span style={{ fontSize:13, color:dt.textSec }}>No cable detected</span></div>
          </Card>
        </div>
      );

      // ── STORAGE ─────────────────────────────────────────────
      case "Storage": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Storage</span>
          <Card>
            <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${dt.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:500, color:dt.text }}>NVMe SSD</span>
                <span style={{ fontSize:12, color:dt.textSec }}>287 GB / 512 GB</span>
              </div>
              <Bar pct={56} />
            </div>
            <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {([["System","42 GB",dt.accent],["Apps","68 GB","#8B5CF6"],["Documents","95 GB",dt.warning],["Media","82 GB",dt.success]] as [string,string,string][]).map(([label,size,color]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:dt.bg, borderRadius:dt.r, border:`1px solid ${dt.border}` }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                  <div><p style={{ fontSize:11, fontWeight:500, color:dt.text }}>{label}</p><p style={{ fontSize:10, color:dt.textSec }}>{size}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );

      // ── SERVICES ────────────────────────────────────────────
      case "Services": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Services</span>
          <Card style={{ overflow:"hidden" }}>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}><SectionTitle label="System Services" /></div>
            {[
              { name:"AlternusShell",    status:"Running", type:"Core",       pid:1 },
              { name:"AI Engine v3.1",   status:"Running", type:"Core",       pid:42 },
              { name:"NetworkManager",   status:"Running", type:"Network",    pid:88 },
              { name:"DisplayServer",    status:"Running", type:"Display",    pid:112 },
              { name:"AudioService",     status:"Running", type:"Media",      pid:156 },
              { name:"CloudSync",        status:"Running", type:"Cloud",      pid:201 },
              { name:"PrintSpooler",     status:"Stopped", type:"Peripheral", pid:0 },
              { name:"BluetoothService", status:"Stopped", type:"Peripheral", pid:0 },
              { name:"BackupAgent",      status:"Running", type:"System",     pid:310 },
            ].map((svc, i, a) => (
              <div key={svc.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 16px", borderBottom: i<a.length-1 ? `1px solid ${dt.border}` : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background: svc.status==="Running" ? dt.success : dt.border, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:dt.text }}>{svc.name}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:11, color:dt.textSec, background:dt.bg, padding:"2px 6px", borderRadius:dt.r }}>{svc.type}</span>
                  <span style={{ fontSize:12, color: svc.status==="Running" ? dt.success : dt.textSec, width:48, textAlign:"right" }}>{svc.status}</span>
                  {svc.pid>0 && <span style={{ fontSize:11, color:dt.textSec, width:32, textAlign:"right" }}>:{svc.pid}</span>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      );

      // ── DEVICES ─────────────────────────────────────────────
      case "Devices": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Devices</span>
          {[
            { cat:"Processors",  devs:[["AlternusCore x86_64 @ 4.2 GHz","OK"]] },
            { cat:"Display",     devs:[["Integrated GPU — AlternusGraphics","OK"],["Monitor — 1920×1080 @60Hz","OK"]] },
            { cat:"Storage",     devs:[["NVMe SSD 512 GB","OK"]] },
            { cat:"Network",     devs:[["Wi-Fi Adapter — Alternus AC","OK"],["Ethernet — Alternus GbE LAN","Disconnected"]] },
            { cat:"Audio",       devs:[["Alternus HD Audio","OK"],["Microphone Array","OK"]] },
            { cat:"Input",       devs:[["Keyboard","OK"],["Mouse / Trackpad","OK"]] },
            { cat:"Bluetooth",   devs:[["Bluetooth 5.3 Adapter","Disabled"]] },
          ].map(({ cat, devs }) => (
            <Card key={cat} style={{ overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:`1px solid ${dt.border}` }}>
                <span style={{ fontSize:12, fontWeight:600, color:dt.textSec, textTransform:"uppercase", letterSpacing:"0.07em" }}>{cat}</span>
              </div>
              {devs.map(([name, status], j) => (
                <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderBottom: j<devs.length-1?`1px solid ${dt.border}`:"none" }}>
                  <span style={{ fontSize:13, color:dt.text }}>{name}</span>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:dt.r, fontWeight:500, background: status==="OK" ? dt.success+"20" : status==="Disabled" ? dt.warning+"20" : dt.error+"20", color: status==="OK" ? dt.success : status==="Disabled" ? dt.warning : dt.error }}>{status}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      );

      // ── USERS ───────────────────────────────────────────────
      case "Users": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Users</span>
          {[
            { name:"Admin", email:"admin@alternus.art", role:"Administrator", active:true },
            { name:"Guest", email:"guest@alternus.art", role:"Guest",         active:false },
          ].map(user => (
            <Card key={user.name} style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:dt.r, display:"flex", alignItems:"center", justifyContent:"center", background: user.active ? dt.accent+"20" : dt.border, flexShrink:0 }}>
                <I d={ic.user} s={18} c={user.active ? dt.accent : dt.textSec} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:500, color:dt.text }}>{user.name}</p>
                <p style={{ fontSize:12, color:dt.textSec }}>{user.email}</p>
              </div>
              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:dt.r, background: user.active ? dt.success+"20" : dt.border, color: user.active ? dt.success : dt.textSec }}>{user.role}</span>
            </Card>
          ))}
          <button style={{ height:36, borderRadius:dt.r, border:`1px solid ${dt.border}`, background:"transparent", color:dt.accent, fontSize:14, fontWeight:500, cursor:"pointer", transition:dt.tr }}
            onMouseEnter={e => (e.currentTarget.style.background = dt.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            + Add User
          </button>
        </div>
      );

      // ── UPDATES ─────────────────────────────────────────────
      case "Updates": return (
        <div style={{ ...p, display:"flex", flexDirection:"column", gap:20 }}>
          <span style={{ fontSize:20, fontWeight:600, color:dt.text }}>Updates</span>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:dt.success+"14", border:`1px solid ${dt.success}40`, borderRadius:dt.r }}>
            <I d={ic.shield} s={20} c={dt.success} />
            <div>
              <p style={{ fontSize:14, fontWeight:500, color:dt.text }}>System is up to date</p>
              <p style={{ fontSize:12, color:dt.textSec }}>Last checked: {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,"0")} today</p>
            </div>
          </div>
          <Card style={{ overflow:"hidden" }}>
            <div style={{ padding:"14px 16px 6px", borderBottom:`1px solid ${dt.border}` }}><SectionTitle label="Recent Updates" /></div>
            {[
              ["Alternus OS v3.0.2",       "Apr 5, 2026"],
              ["Security Patch 04-2026",   "Apr 3, 2026"],
              ["AI Engine v3.1",           "Apr 1, 2026"],
            ].map(([name, date], i, a) => (
              <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom: i<a.length-1?`1px solid ${dt.border}`:"none" }}>
                <div><p style={{ fontSize:13, color:dt.text }}>{name}</p><p style={{ fontSize:11, color:dt.textSec }}>{date}</p></div>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:dt.r, background:dt.success+"20", color:dt.success }}>Installed</span>
              </div>
            ))}
          </Card>
          <button style={{ height:36, borderRadius:dt.r, border:"none", background:dt.accent, color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer", transition:dt.tr }}
            onMouseEnter={e => (e.currentTarget.style.opacity="0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity="1")}>
            Check for Updates
          </button>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden", fontFamily:dt.font, background:dt.bg }}>
      {/* Sidebar */}
      <div style={{ width:156, flexShrink:0, display:"flex", flexDirection:"column", background:dt.panel, borderRight:`1px solid ${dt.border}`, overflowY:"auto", scrollbarWidth:"none" }}>
        {/* Logo */}
        <div style={{ padding:"16px 16px 12px", borderBottom:`1px solid ${dt.border}`, flexShrink:0 }}>
          <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:dt.textSec }}>Control Panel</span>
        </div>
        {/* Nav */}
        <div style={{ flex:1, padding:"6px 6px" }}>
          {sections.map(it => (
            <button key={it.label}
              onClick={() => setActiveSection(it.label)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:dt.r, background: activeSection===it.label ? dt.hover : "transparent", border:"none", cursor:"pointer", textAlign:"left", marginBottom:2, transition:dt.tr, borderLeft: activeSection===it.label ? `2px solid ${dt.accent}` : "2px solid transparent" }}
              onMouseEnter={e => { if (activeSection!==it.label) e.currentTarget.style.background=dt.hover; }}
              onMouseLeave={e => { if (activeSection!==it.label) e.currentTarget.style.background="transparent"; }}
              onMouseDown={e => (e.currentTarget.style.opacity="0.7")}
              onMouseUp={e => (e.currentTarget.style.opacity="1")}>
              <I d={it.icon} s={14} c={activeSection===it.label ? dt.accent : dt.textSec} />
              <span style={{ fontSize:13, fontWeight: activeSection===it.label ? 500 : 400, color: activeSection===it.label ? dt.text : dt.textSec }}>{it.label}</span>
            </button>
          ))}
        </div>
        {/* Version */}
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${dt.border}`, flexShrink:0 }}>
          <span style={{ fontSize:10, color:dt.textSec, display:"block" }}>v3.0 · x86_64</span>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", background:dt.bg, scrollbarWidth:"none" }}>
        {renderContent()}
      </div>
    </div>
  );
}

// ━━━━ NEWS APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function NewsApp({ c }: { c: typeof palette.dark }) {
  const [activeCategory, setActiveCategory] = useState("top");
  const [savedArticles, setSavedArticles] = useState<Set<number>>(new Set());

  const categories = [
    { id: "top", label: "Top Stories" },
    { id: "tech", label: "Technology" },
    { id: "world", label: "World" },
    { id: "business", label: "Business" },
    { id: "science", label: "Science" },
    { id: "sports", label: "Sports" },
  ];

  const articles: Record<string, { id: number; title: string; source: string; time: string; summary: string; category: string; breaking?: boolean; image?: string }[]> = {
    top: [
      { id: 1, title: "Global AI Summit Reaches Historic Agreement on Safety Standards", source: "Reuters", time: "12 min ago", summary: "World leaders have agreed on a landmark framework for AI safety, establishing international standards for development and deployment of advanced AI systems.", category: "Technology", breaking: true },
      { id: 2, title: "Markets Surge as Central Banks Signal Rate Cuts", source: "Bloomberg", time: "45 min ago", summary: "Stock markets worldwide rally as major central banks indicate a coordinated shift toward monetary easing in the coming quarter.", category: "Business" },
      { id: 3, title: "Scientists Discover New Method for Carbon Capture", source: "Nature", time: "1 hour ago", summary: "Researchers at MIT have developed a revolutionary carbon capture technique that is 10x more efficient than current methods.", category: "Science" },
      { id: 4, title: "Historic Peace Deal Signed in Eastern Europe", source: "AP News", time: "2 hours ago", summary: "After months of negotiations, a comprehensive peace agreement has been signed, ending years of regional conflict.", category: "World" },
      { id: 5, title: "SpaceX Launches Largest Satellite Constellation", source: "Space.com", time: "3 hours ago", summary: "SpaceX successfully deploys 120 next-generation satellites in a single mission, breaking its own record.", category: "Technology" },
      { id: 6, title: "World Cup 2026 Venues Officially Announced", source: "ESPN", time: "4 hours ago", summary: "FIFA reveals the complete list of stadiums and host cities for the upcoming World Cup tournament.", category: "Sports" },
    ],
    tech: [
      { id: 10, title: "Apple Unveils Revolutionary AR Glasses", source: "The Verge", time: "30 min ago", summary: "Apple's next-generation AR glasses feature holographic displays and all-day battery life, available next quarter.", category: "Technology", breaking: true },
      { id: 11, title: "Quantum Computing Breakthrough Achieves Error Correction", source: "Wired", time: "2 hours ago", summary: "Google's quantum team demonstrates reliable error correction, bringing practical quantum computing years closer.", category: "Technology" },
      { id: 12, title: "Open Source AI Model Surpasses GPT-5 Benchmarks", source: "TechCrunch", time: "3 hours ago", summary: "A community-developed open source model has outperformed leading proprietary AI systems across multiple benchmarks.", category: "Technology" },
      { id: 13, title: "Cybersecurity Alert: Major Vulnerability Found in IoT Devices", source: "Ars Technica", time: "5 hours ago", summary: "Security researchers discover a critical flaw affecting millions of smart home devices worldwide.", category: "Technology" },
      { id: 14, title: "Tesla Announces Fully Autonomous Robotaxi Service", source: "Reuters", time: "6 hours ago", summary: "Tesla begins rolling out its driverless taxi service in three major US cities starting next month.", category: "Technology" },
    ],
    world: [
      { id: 20, title: "UN General Assembly Adopts Climate Emergency Resolution", source: "BBC", time: "1 hour ago", summary: "The United Nations passes a sweeping resolution declaring a global climate emergency with binding commitments.", category: "World", breaking: true },
      { id: 21, title: "Japan Launches New Bullet Train Connecting Tokyo to Osaka in 1 Hour", source: "NHK", time: "3 hours ago", summary: "The next-generation maglev train begins commercial operations, cutting travel time by more than half.", category: "World" },
      { id: 22, title: "EU Passes Comprehensive Digital Privacy Framework", source: "DW News", time: "5 hours ago", summary: "The European Union enacts the most stringent digital privacy protections in history, affecting global tech companies.", category: "World" },
      { id: 23, title: "African Union Launches Continental Free Trade Zone", source: "Al Jazeera", time: "7 hours ago", summary: "The world's largest free trade area officially begins operations, connecting 1.3 billion people.", category: "World" },
    ],
    business: [
      { id: 30, title: "Nvidia Becomes World's Most Valuable Company", source: "CNBC", time: "1 hour ago", summary: "Nvidia's market cap surpasses $4 trillion as AI chip demand continues to soar beyond expectations.", category: "Business", breaking: true },
      { id: 31, title: "Global Startup Funding Rebounds to Record Highs", source: "Forbes", time: "3 hours ago", summary: "Venture capital investments surge 40% year-over-year, with AI and cleantech leading the charge.", category: "Business" },
      { id: 32, title: "Amazon Opens First Fully Automated Warehouse", source: "WSJ", time: "5 hours ago", summary: "The facility operates with zero human workers, processing 100,000 packages per day using advanced robotics.", category: "Business" },
    ],
    science: [
      { id: 40, title: "James Webb Telescope Discovers Signs of Life on Exoplanet", source: "NASA", time: "2 hours ago", summary: "Atmospheric analysis reveals biosignature gases on a planet 40 light-years away, the strongest evidence yet of extraterrestrial life.", category: "Science", breaking: true },
      { id: 41, title: "CRISPR Gene Therapy Cures Hereditary Blindness in Trial", source: "The Lancet", time: "4 hours ago", summary: "A landmark clinical trial successfully restores vision in patients with inherited retinal disease using gene editing.", category: "Science" },
      { id: 42, title: "Fusion Reactor Achieves Net Energy Gain for 24 Hours", source: "Science", time: "6 hours ago", summary: "European researchers sustain a net-positive fusion reaction for a full day, a major milestone toward clean energy.", category: "Science" },
    ],
    sports: [
      { id: 50, title: "Champions League Final: Historic Comeback Stuns Europe", source: "ESPN", time: "1 hour ago", summary: "In one of the greatest finals ever, the underdog team stages a remarkable 3-goal comeback in the second half.", category: "Sports", breaking: true },
      { id: 51, title: "Olympic Record Shattered in 100m Sprint", source: "BBC Sport", time: "3 hours ago", summary: "A new world record is set in the 100-meter dash, breaking a mark that stood for over a decade.", category: "Sports" },
      { id: 52, title: "NBA Expansion: Two New Teams Announced for 2027", source: "Sports Illustrated", time: "5 hours ago", summary: "The NBA confirms expansion to 32 teams with new franchises in Las Vegas and Seattle.", category: "Sports" },
    ],
  };

  const currentArticles = articles[activeCategory] || articles.top;
  const toggleSave = (id: number) => setSavedArticles(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const sourceColors: Record<string, string> = {
    "Reuters": "#F97316", "Bloomberg": "#FBBF24", "Nature": "#34D399",
    "AP News": "#F87171", "Space.com": "#60A5FA", "ESPN": "#A78BFA",
    "The Verge": "#EC4899", "Wired": "#06B6D4", "TechCrunch": "#22C55E",
    "Ars Technica": "#F59E0B", "BBC": "#E11D48", "NHK": "#EF4444",
    "DW News": "#3B82F6", "Al Jazeera": "#10B981", "CNBC": "#FBBF24",
    "Forbes": "#F97316", "WSJ": "#6366F1", "NASA": "#60A5FA",
    "The Lancet": "#F472B6", "Science": "#34D399", "BBC Sport": "#E11D48",
    "Sports Illustrated": "#F97316",
  };

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Breaking news bar — solid red */}
      {currentArticles.some(a => a.breaking) && (
        <div className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0" style={{ background: "#EF4444" }}>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(0,0,0,0.25)", color: "#fff" }}>BREAKING</span>
          <p className="text-[10px] font-medium truncate" style={{ color: "#fff" }}>
            {currentArticles.find(a => a.breaking)?.title}
          </p>
        </div>
      )}

      {/* Category tabs — underline style */}
      <div className="flex items-center gap-0 px-2 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="px-3 text-[10px] font-medium whitespace-nowrap transition-colors"
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              background: "transparent",
              borderRadius: 0,
              color: activeCategory === cat.id ? c.text : c.textMuted,
              borderBottom: activeCategory === cat.id ? `2px solid ${c.accent}` : "2px solid transparent",
              marginBottom: "-1px",
            }}
            onMouseEnter={e => { if (activeCategory !== cat.id) (e.currentTarget.style.color = c.textSec); }}
            onMouseLeave={e => { if (activeCategory !== cat.id) (e.currentTarget.style.color = c.textMuted); }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles — flat rows with dividers */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {currentArticles.map((article, idx) => (
          <div key={article.id}
            className="px-4 py-3 transition-colors cursor-pointer"
            style={{ borderBottom: idx < currentArticles.length - 1 ? `1px solid ${c.border}` : "none", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {/* Source + time */}
            <div className="flex items-center gap-2 mb-1">
              {article.breaking && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "#16A34A", color: "#fff" }}>LIVE</span>
              )}
              <span className="text-[9px] font-semibold" style={{ color: sourceColors[article.source] ?? c.accentText }}>{article.source}</span>
              <span className="text-[9px]" style={{ color: c.textMuted }}>{article.time}</span>
            </div>
            {/* Title */}
            <p className="text-[12px] font-semibold leading-snug mb-1.5" style={{ color: c.text }}>{article.title}</p>
            {/* Summary */}
            <p className="text-[10px] leading-relaxed mb-2.5" style={{ color: c.textSec }}>{article.summary}</p>
            {/* Category + icons */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: c.cardAlt, color: c.textMuted }}>{article.category}</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: savedArticles.has(article.id) ? c.accent : c.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.border)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" s={13}
                    c={savedArticles.has(article.id) ? c.accent : c.textMuted}
                    f={savedArticles.has(article.id)} />
                </button>
                <button className="p-1 rounded-md transition-colors" style={{ color: c.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.border)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={ic.share} s={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <p className="text-[9px]" style={{ color: c.textMuted }}>Powered by Alternus News · Updated just now</p>
        <button className="text-[10px] font-medium px-2 py-1 rounded-lg transition-colors" style={{ color: c.accentText }}
          onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          Refresh
        </button>
      </div>
    </div>
  );
}

// ━━━━ SYSTEM MONITOR APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SysMonApp({ c }: { c: typeof palette.dark }) {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
  const [stats, setStats] = useState({ cpu: 34, ram: 52, gpu: 18, net: 12, disk: 65, temp: 44 });
  const [history, setHistory] = useState<{ cpu: number[]; ram: number[]; gpu: number[] }>({
    cpu: Array.from({ length: 30 }, () => rand(20, 60)),
    ram: Array.from({ length: 30 }, () => rand(45, 65)),
    gpu: Array.from({ length: 30 }, () => rand(10, 40)),
  });
  const [activeTab, setActiveTab] = useState<"overview" | "processes">("overview");
  useEffect(() => {
    const iv = setInterval(() => {
      const cpu = Math.max(5, Math.min(95, stats.cpu + rand(-8, 8)));
      const gpu = Math.max(2, Math.min(80, stats.gpu + rand(-6, 6)));
      const net = Math.max(1, Math.min(100, stats.net + rand(-10, 10)));
      setStats(s => ({ ...s, cpu, gpu, net, temp: 40 + Math.floor(cpu / 10) }));
      setHistory(h => ({
        cpu: [...h.cpu.slice(1), cpu],
        ram: [...h.ram.slice(1), h.ram[h.ram.length - 1] + rand(-2, 2)],
        gpu: [...h.gpu.slice(1), gpu],
      }));
    }, 1000);
    return () => clearInterval(iv);
  }, [stats.cpu, stats.gpu, stats.net]);

  const processes = [
    { name: "Alternus AI", pid: 1201, cpu: 12.4, ram: 842, status: "running" },
    { name: "Browser", pid: 2340, cpu: 8.1, ram: 1240, status: "running" },
    { name: "Code Editor", pid: 3102, cpu: 4.2, ram: 380, status: "running" },
    { name: "Music", pid: 4023, cpu: 2.1, ram: 120, status: "running" },
    { name: "System (kernel)", pid: 1, cpu: 1.8, ram: 256, status: "system" },
    { name: "News", pid: 5011, cpu: 0.9, ram: 98, status: "running" },
    { name: "Dashboard", pid: 5200, cpu: 0.4, ram: 64, status: "running" },
  ];

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data, 1);
    const w = 200; const h = 40;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#grad-${color.replace("#", "")})`} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {[{ id: "overview", label: "Overview" }, { id: "processes", label: "Processes" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as "overview" | "processes")}
            className="px-4 py-2.5 text-[11px] font-medium transition-colors"
            style={{ color: activeTab === t.id ? c.text : c.textMuted, borderBottom: activeTab === t.id ? `2px solid ${c.accent}` : "2px solid transparent", marginBottom: "-1px" }}>
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center px-3 gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${c.success}20`, color: c.success }}>● Live</span>
          <span className="text-[10px]" style={{ color: c.textMuted }}>{stats.temp}°C</span>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "none" }}>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "CPU", val: stats.cpu, color: c.accent, unit: "%" },
              { label: "RAM", val: stats.ram, color: "#34D399", unit: "%" },
              { label: "GPU", val: stats.gpu, color: "#A78BFA", unit: "%" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: c.textMuted }}>{s.label}</p>
                <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.val}<span className="text-[12px]">{s.unit}</span></p>
              </div>
            ))}
          </div>

          {/* CPU Graph */}
          {[
            { label: "CPU", key: "cpu" as const, color: c.accent, val: stats.cpu },
            { label: "RAM", key: "ram" as const, color: "#34D399", val: stats.ram },
            { label: "GPU", key: "gpu" as const, color: "#A78BFA", val: stats.gpu },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold" style={{ color: c.text }}>{s.label}</p>
                <span className="text-[12px] font-bold" style={{ color: s.color }}>{s.val}%</span>
              </div>
              <Sparkline data={history[s.key]} color={s.color} />
            </div>
          ))}

          {/* Other stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Storage", val: stats.disk, color: c.warning },
              { label: "Network", val: stats.net, color: "#60A5FA" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px]" style={{ color: c.textMuted }}>{s.label}</p>
                  <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.val}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="px-3 py-2 grid grid-cols-4 text-[9px] uppercase tracking-wider" style={{ color: c.textMuted, borderBottom: `1px solid ${c.border}` }}>
            <span>Process</span><span className="text-right">PID</span><span className="text-right">CPU</span><span className="text-right">RAM</span>
          </div>
          {processes.map((p, i) => (
            <div key={i} className="px-3 py-2.5 grid grid-cols-4 items-center transition-colors"
              style={{ borderBottom: `1px solid ${c.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.status === "system" ? c.warning : c.success }} />
                <span className="text-[11px] truncate" style={{ color: c.text }}>{p.name}</span>
              </div>
              <span className="text-right text-[10px] font-mono" style={{ color: c.textMuted }}>{p.pid}</span>
              <span className="text-right text-[11px] font-medium" style={{ color: p.cpu > 8 ? c.danger : c.textSec }}>{p.cpu}%</span>
              <span className="text-right text-[10px]" style={{ color: c.textSec }}>{p.ram} MB</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <p className="text-[9px]" style={{ color: c.textMuted }}>AlternusCore x86_64 · 16 GB DDR5 · Updates every 1s</p>
        <span className="text-[9px] font-mono" style={{ color: c.textMuted }}>Uptime: 3h 42m</span>
      </div>
    </div>
  );
}

// ━━━━ DASHBOARD APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardApp({ c }: { c: typeof palette.dark }) {
  const [activeIcon, setActiveIcon] = useState(0);
  const sideIcons = [ic.monitor, ic.menu, ic.refresh, ic.settings, ic.power];

  return (
    <div className="flex h-full overflow-hidden" style={{ background: c.bg }}>
      {/* Slim left icon bar */}
      <div className="w-10 flex-shrink-0 flex flex-col items-center py-3 gap-1" style={{ borderRight: `1px solid ${c.border}` }}>
        {sideIcons.map((icon, i) => (
          <button key={i} onClick={() => setActiveIcon(i)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: i === activeIcon ? c.accentText : c.textMuted, background: i === activeIcon ? c.accentSoft : "transparent" }}
            onMouseEnter={e => { if (i !== activeIcon) { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.color = c.textSec; } }}
            onMouseLeave={e => { if (i !== activeIcon) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textMuted; } }}>
            <I d={icon} s={15} />
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ scrollbarWidth: "none" }}>
        {/* Top row — 3 cards */}
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

          {/* Trend line chart */}
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Trend Charts</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            <p className="text-[20px] font-bold" style={{ color: c.text }}>3,328 <span className="text-[11px]" style={{ color: c.success }}>▲</span></p>
            <svg viewBox="0 0 120 38" className="w-full mt-1" style={{ height: 36 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.accent} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="0,34 20,26 40,29 60,15 80,21 100,11 120,5 120,38 0,38" fill="url(#trendGrad)" />
              <polyline points="0,34 20,26 40,29 60,15 80,21 100,11 120,5" fill="none" stroke={c.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between mt-1">
              {["Jan","Feb","Mar","Apr","May"].map(m => <span key={m} className="text-[9px]" style={{ color: c.textMuted }}>{m}</span>)}
            </div>
          </div>

          {/* KPI + bars */}
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Data Stats</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            <p className="text-[26px] font-bold mb-3" style={{ color: c.text }}>12%</p>
            {([["Revenue", 63, c.accent], ["Total", 43, c.success]] as [string, number, string][]).map(([label, pct, color]) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px]" style={{ color: c.textMuted }}>● {label}</span>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: c.cardAlt }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Donut chart */}
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Data Analyse</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            <div className="flex items-center justify-center my-1">
              <svg viewBox="0 0 80 80" style={{ width: 62, height: 62 }}>
                <circle cx="40" cy="40" r="26" fill="none" stroke={c.cardAlt} strokeWidth="9" />
                <circle cx="40" cy="40" r="26" fill="none" stroke={c.accent} strokeWidth="9"
                  strokeDasharray="103 60" strokeDashoffset="16" strokeLinecap="round" transform="rotate(-90 40 40)" />
                <circle cx="40" cy="40" r="26" fill="none" stroke={c.success} strokeWidth="9"
                  strokeDasharray="55 108" strokeDashoffset="-87" strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
            </div>
            <div className="flex justify-center gap-2">
              <span className="text-[10px]" style={{ color: c.textMuted }}><span style={{ color: c.accent }}>●</span> Rev 63%</span>
              <span className="text-[10px]" style={{ color: c.textMuted }}><span style={{ color: c.success }}>●</span> Total 43%</span>
            </div>
          </div>
        </div>

        {/* Middle row */}
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

          {/* Bar chart */}
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Data Charts</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            <svg viewBox="0 0 120 50" className="w-full" style={{ height: 48 }}>
              {[18,35,28,45,22,38,30,50,25,42,35,48].map((h, i) => (
                <rect key={i} x={i * 10 + 1} y={50 - h} width="8" height={h} rx="2"
                  fill={i === 7 ? c.accent : `${c.accent}35`} />
              ))}
            </svg>
            <div className="flex justify-between mt-1">
              {["Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <span key={m} className="text-[9px]" style={{ color: c.textMuted }}>{m}</span>)}
            </div>
          </div>

          {/* AI Companion card */}
          <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ background: c.accentSoft, border: `1px solid ${c.accent}40`, boxShadow: `0 0 20px ${c.accent}30` }}>
              <I d={ic.play} s={20} c={c.accentText} />
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: c.text }}>AI-companion</p>
            <p className="text-[10px] mb-3 leading-relaxed" style={{ color: c.textMuted }}>Smart analysis &amp; AI account assistant.</p>
            <button className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold transition-all"
              style={{ background: c.accent, color: "#fff", borderRadius: "9999px", boxShadow: `0 0 14px ${c.accent}60` }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              <I d={ic.sparkle} s={10} c="#fff" /> AI Assist
            </button>
          </div>

          {/* Data Analysis bars */}
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Data Analysis</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            {([["Volumes", 50], ["Less", 30], ["Evaluated", 27], ["Floating", 30]] as [string, number][]).map(([label, pct]) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px]" style={{ color: c.textSec }}>{label}</span>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: c.cardAlt }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-medium" style={{ color: c.textSec }}>Data Mans</p>
              <span className="text-[14px]" style={{ color: c.textMuted }}>···</span>
            </div>
            <p className="text-[26px] font-bold" style={{ color: c.text }}>709</p>
            <p className="text-[10px] mt-1" style={{ color: c.success }}>▲ +3.2% this week</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <p className="text-[11px] font-medium mb-2" style={{ color: c.textSec }}>Quick Stats</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[{ label: "Files", val: "1,284" }, { label: "Tasks", val: "12" }, { label: "Emails", val: "8" }, { label: "Alerts", val: "3" }].map(q => (
                <div key={q.label} className="rounded-lg py-1.5 px-2 text-center" style={{ background: c.cardAlt }}>
                  <p className="text-[14px] font-bold" style={{ color: c.text }}>{q.val}</p>
                  <p className="text-[9px]" style={{ color: c.textMuted }}>{q.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━ TASKS APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TasksApp({ c }: { c: typeof palette.dark }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finalize gallery redesign", priority: "high" as const, done: false, deadline: "Today", tag: "Design" },
    { id: 2, text: "Review artist applications", priority: "high" as const, done: false, deadline: "Today", tag: "Review" },
    { id: 3, text: "Update payment integration", priority: "medium" as const, done: false, deadline: "Tomorrow", tag: "Dev" },
    { id: 4, text: "Write blog post", priority: "medium" as const, done: true, deadline: "Dec 10", tag: "Content" },
    { id: 5, text: "Backup database", priority: "low" as const, done: false, deadline: "Dec 15", tag: "Ops" },
    { id: 6, text: "Send invoice to client", priority: "high" as const, done: true, deadline: "Done", tag: "Finance" },
  ]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const priorityColor = { high: c.danger, medium: c.warning, low: c.success };
  const filtered = tasks.filter(t => filter === "all" ? true : filter === "done" ? t.done : !t.done);
  const addTask = () => {
    if (!input.trim()) return;
    setTasks(p => [...p, { id: Date.now(), text: input.trim(), priority: "medium", done: false, deadline: "No deadline", tag: "Task" }]);
    setInput("");
  };
  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Add a task... (Enter to save)"
            className="flex-1 text-[11px] px-3 py-2 rounded-lg outline-none"
            style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
          <button onClick={addTask} className="px-3 py-2 rounded-lg text-[11px] font-medium" style={{ background: c.accent, color: "#fff" }}>Add</button>
        </div>
        <div className="flex gap-1">
          {(["all", "active", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1 rounded-full text-[10px] font-medium capitalize transition-colors"
              style={{ background: filter === f ? c.accentSoft : "transparent", color: filter === f ? c.accentText : c.textMuted }}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-[10px] px-2 py-1 rounded-full" style={{ background: c.cardAlt, color: c.textMuted }}>
            {tasks.filter(t => !t.done).length} remaining
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ scrollbarWidth: "none" }}>
        {filtered.map(task => (
          <div key={task.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: c.surface, border: `1px solid ${c.border}`, opacity: task.done ? 0.6 : 1 }}>
            <button onClick={() => setTasks(p => p.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
              className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-colors"
              style={{ border: `2px solid ${task.done ? c.success : priorityColor[task.priority]}`, background: task.done ? c.success : "transparent" }}>
              {task.done && <I d="M20 6L9 17l-5-5" s={10} c="#fff" w={2.5} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium leading-snug" style={{ color: c.text, textDecoration: task.done ? "line-through" : "none" }}>{task.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: c.cardAlt, color: c.textMuted }}>{task.tag}</span>
                <span className="text-[9px]" style={{ color: c.textMuted }}>⏰ {task.deadline}</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: priorityColor[task.priority] }} />
          </div>
        ))}
      </div>
      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <p className="text-[9px]" style={{ color: c.textMuted }}>{tasks.filter(t => t.done).length}/{tasks.length} completed</p>
        <div className="flex gap-1">
          {[{ col: c.danger, label: "High" }, { col: c.warning, label: "Med" }, { col: c.success, label: "Low" }].map(p => (
            <span key={p.label} className="flex items-center gap-1 text-[9px]" style={{ color: c.textMuted }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.col }} />{p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ━━━━ MAIL APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MailApp({ c }: { c: typeof palette.dark }) {
  const contacts = [
    { id: 1, name: "Jane Bons",     sub: "Chat with your cir...",     time: "1:23 PM", unread: 0, init: "JB", color: "#3B82F6" },
    { id: 2, name: "Rans Smith",    sub: "Openplity with mi...",       time: "1:23 PM", unread: 3, init: "RS", color: "#8B5CF6" },
    { id: 3, name: "Rama Mavdi",    sub: "Mianrut smith",              time: "1:26 PM", unread: 0, init: "RM", color: "#10B981" },
    { id: 4, name: "Jana Bons",     sub: "Maman@gmail.com",            time: "1:28 PM", unread: 0, init: "JB", color: "#F59E0B" },
    { id: 5, name: "Mary Smith",    sub: "Moxl@gmail.com",             time: "1:23 PM", unread: 0, init: "MS", color: "#EF4444" },
    { id: 6, name: "Evan Smith",    sub: "Manages then ort...",        time: "1:33 PM", unread: 0, init: "ES", color: "#06B6D4" },
    { id: 7, name: "Misa Kolanson", sub: "Contact@gmail.com",          time: "1:35 PM", unread: 0, init: "MK", color: "#EC4899" },
    { id: 8, name: "Mark Towsy",    sub: "Boan.gkali.com",             time: "1:35 PM", unread: 0, init: "MT", color: "#84CC16" },
  ];
  const [selId, setSelId] = useState(1);
  const [input, setInput] = useState("");
  const [msgMap, setMsgMap] = useState<Record<number, { me: boolean; text: string; time: string }[]>>({
    1: [
      { me: false, text: "Hello, from renments you to your contact?", time: "1:20 PM" },
      { me: true,  text: "Wov and selectng your contart?",            time: "1:21 PM" },
      { me: false, text: "What does mms?",                            time: "1:22 PM" },
      { me: false, text: "What can I reconnect for your contants??",  time: "1:23 PM" },
      { me: true,  text: "Thank joy your possians?",                  time: "1:28 PM" },
    ],
    2: [
      { me: false, text: "Hey! Are you available for a quick sync?", time: "1:18 PM" },
      { me: true,  text: "Sure, what's up?",                         time: "1:19 PM" },
      { me: false, text: "Let's discuss the new project scope.",      time: "1:23 PM" },
    ],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selId, msgMap]);

  const sel = contacts.find(c => c.id === selId)!;
  const msgs = msgMap[selId] || [{ me: false, text: "Say hi to start a conversation!", time: "" }];

  const sendMsg = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")} PM`;
    setMsgMap(p => ({ ...p, [selId]: [...(p[selId]||[]), { me: true, text: input.trim(), time }] }));
    setInput("");
  };

  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      {/* ── Left sidebar: contact list ── */}
      <div className="flex-shrink-0 flex flex-col" style={{ width: 200, borderRight: `1px solid ${c.border}` }}>
        {/* Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
            <I d={ic.search} s={12} c={c.textMuted} />
            <input className="flex-1 bg-transparent outline-none text-[11px]" style={{ color: c.text }} placeholder="Search" />
            <I d={ic.settings} s={12} c={c.textMuted} />
          </div>
        </div>
        {/* Label */}
        <div className="px-4 py-1 flex-shrink-0">
          <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>Chats</span>
        </div>
        {/* Today divider */}
        <div className="px-4 py-0.5 flex-shrink-0">
          <span className="text-[9px]" style={{ color: c.textMuted }}>Today</span>
        </div>
        {/* Contact list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {contacts.map(ct => (
            <button key={ct.id} onClick={() => setSelId(ct.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
              style={{ background: selId === ct.id ? c.accentSoft : "transparent", borderLeft: selId === ct.id ? `2px solid ${c.accent}` : "2px solid transparent" }}
              onMouseEnter={e => { if (selId !== ct.id) e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { if (selId !== ct.id) e.currentTarget.style.background = "transparent"; }}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                style={{ background: ct.color }}>
                {ct.init}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium truncate" style={{ color: c.text }}>{ct.name}</span>
                  <span className="text-[9px] flex-shrink-0 ml-1" style={{ color: c.textMuted }}>{ct.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] truncate" style={{ color: c.textMuted }}>{ct.sub}</p>
                  {ct.unread > 0 && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ml-1"
                      style={{ background: c.accent }}>{ct.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right panel: chat thread ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: sel.color }}>{sel.init}</div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: c.text }}>{sel.name}</p>
              <p className="text-[10px]" style={{ color: c.success }}>Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: c.textMuted }}
              onMouseEnter={e=>(e.currentTarget.style.background=c.cardAlt)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <I d={ic.volume} s={14} />
            </button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: c.textMuted }}
              onMouseEnter={e=>(e.currentTarget.style.background=c.cardAlt)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <I d={ic.menu} s={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "none" }}>
          {msgs.map((msg, i) => (
            <div key={i} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
              {!msg.me && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mr-2 mt-1 self-end"
                  style={{ background: sel.color }}>{sel.init[0]}</div>
              )}
              <div className="max-w-[65%]">
                <div className="px-3 py-2 rounded-2xl text-[12px] leading-relaxed"
                  style={{
                    background: msg.me ? c.accent : c.cardAlt,
                    color: msg.me ? "#fff" : c.text,
                    borderBottomRightRadius: msg.me ? 4 : undefined,
                    borderBottomLeftRadius: !msg.me ? 4 : undefined,
                  }}>
                  {msg.text}
                </div>
                {msg.time && <p className="text-[9px] mt-0.5 px-1" style={{ color: c.textMuted, textAlign: msg.me ? "right" : "left" }}>{msg.time}</p>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
            <input className="flex-1 bg-transparent outline-none text-[12px]" style={{ color: c.text }}
              placeholder="Type a message" value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") sendMsg(); }} />
            <button style={{ color: c.textMuted }}
              onMouseEnter={e=>(e.currentTarget.style.color=c.accentText)}
              onMouseLeave={e=>(e.currentTarget.style.color=c.textMuted)}>
              <I d={ic.mic} s={14} />
            </button>
          </div>
          <button onClick={sendMsg}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: c.accent, boxShadow: `0 0 10px ${c.accent}50` }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            <I d={ic.send} s={14} c="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━ MONACO CODE EDITOR APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MonacoApp({ c }: { c: typeof palette.dark }) {
  const files = [
    { name: "index.tsx", lang: "tsx" },
    { name: "globals.css", lang: "css" },
    { name: "page.tsx", lang: "tsx" },
    { name: "blog.ts", lang: "ts" },
    { name: ".env.local", lang: "env" },
  ];
  const code = {
    tsx: `import { useState } from "react";\nimport Link from "next/link";\nimport Image from "next/image";\n\nexport default function BlogPage() {\n  const [selected, setSelected] =\n    useState<string | null>(null);\n\n  return (\n    <div className="container mx-auto px-4">\n      <h1 className="text-4xl font-bold">\n        The Alternus Art Journal\n      </h1>\n    </div>\n  );\n}`,
    css: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --background: 0 0% 100%;\n  --foreground: 0 0% 3.9%;\n  --primary: 226 30% 13%;\n}\n\n.font-playfair {\n  font-family: var(--font-playfair),\n    'Playfair Display', serif;\n}`,
    ts: `export interface BlogPost {\n  id: string;\n  title: string;\n  excerpt: string;\n  content: string;\n  image: string;\n  author: string;\n  date: string;\n  category: string;\n  readTime: string;\n}\n\nexport const blogPosts: BlogPost[] = [];`,
    env: `DATABASE_URL="postgresql://..."\nDIRECT_URL="postgresql://..."\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\nGROQ_API_KEY="gsk_..."`,
  };
  const [activeFile, setActiveFile] = useState(files[0]);
  const [content, setContent] = useState(code.tsx);
  const switchFile = (f: typeof files[0]) => {
    setActiveFile(f);
    setContent(code[f.lang as keyof typeof code] ?? "// No content");
  };
  const lines = content.split("\n");
  return (
    <div className="flex flex-col h-full font-mono" style={{ background: "#1e1e1e", color: "#d4d4d4" }}>
      {/* Tab bar */}
      <div className="flex items-center overflow-x-auto flex-shrink-0" style={{ background: "#252526", borderBottom: "1px solid #3c3c3c", scrollbarWidth: "none" }}>
        {files.map(f => (
          <button key={f.name} onClick={() => switchFile(f)}
            className="px-4 py-2 text-[10px] whitespace-nowrap transition-colors flex-shrink-0"
            style={{ background: activeFile.name === f.name ? "#1e1e1e" : "transparent", color: activeFile.name === f.name ? "#ffffff" : "#888", borderRight: "1px solid #3c3c3c", borderTop: activeFile.name === f.name ? "1px solid #007acc" : "1px solid transparent" }}>
            {f.name}
          </button>
        ))}
      </div>
      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div className="py-3 px-2 text-right flex-shrink-0 select-none" style={{ background: "#1e1e1e", minWidth: "36px" }}>
          {lines.map((_, i) => (
            <div key={i} className="text-[10px] leading-5" style={{ color: "#858585" }}>{i + 1}</div>
          ))}
        </div>
        {/* Code area */}
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="flex-1 p-3 text-[11px] leading-5 resize-none outline-none"
          style={{ background: "#1e1e1e", color: "#d4d4d4", fontFamily: "monospace", scrollbarWidth: "none" }}
          spellCheck={false} />
      </div>
      {/* Status bar */}
      <div className="px-4 py-1 flex items-center gap-4 text-[9px] flex-shrink-0" style={{ background: "#007acc", color: "#fff" }}>
        <span>main</span>
        <span>{activeFile.lang.toUpperCase()}</span>
        <span className="ml-auto">Ln {lines.length}, Col 1</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
}

// ━━━━ AI HUB APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AIHubApp({ c }: { c: typeof palette.dark }) {
  const models = [
    { id: "claude", name: "Claude Opus", company: "Anthropic", color: "#F97316", desc: "Best for reasoning & analysis" },
    { id: "gpt4", name: "GPT-4o", company: "OpenAI", color: "#10B981", desc: "Best for general tasks" },
    { id: "gemini", name: "Gemini Ultra", company: "Google", color: "#3B82F6", desc: "Best for multimodal" },
    { id: "llama", name: "Llama 3.1", company: "Meta", color: "#8B5CF6", desc: "Open source, fast" },
  ];
  const [activeModel, setActiveModel] = useState(models[0]);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string; model?: string }[]>([
    { role: "ai", text: `Hello! I'm ${models[0].name} by ${models[0].company}. How can I help you today?`, model: models[0].name },
  ]);
  const [input, setInput] = useState("");
  const responses: Record<string, string[]> = {
    claude: ["I'll analyze that carefully and provide a nuanced response...", "From a reasoning perspective, this involves multiple considerations...", "Let me break this down step by step for you..."],
    gpt4: ["Great question! Here's what I think...", "I can help with that! Let me explain...", "Based on my training, here's a comprehensive answer..."],
    gemini: ["I can process both text and visual information to help...", "Using multimodal analysis, I can see that...", "Let me provide a comprehensive response with multiple perspectives..."],
    llama: ["Processing your request with open-source efficiency...", "Here's my response based on open-source training data...", "As an open model, I'll give you a transparent answer..."],
  };
  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    const opts = responses[activeModel.id];
    const aiMsg = { role: "ai" as const, text: opts[Math.floor(Math.random() * opts.length)] + " " + input.toLowerCase() + ".", model: activeModel.name };
    setMsgs(p => [...p, userMsg, aiMsg]);
    setInput("");
  };
  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Model selector */}
      <div className="px-3 py-2.5 flex gap-1.5 overflow-x-auto flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
        {models.map(m => (
          <button key={m.id} onClick={() => { setActiveModel(m); setMsgs([{ role: "ai", text: `Hello! I'm ${m.name} by ${m.company}. How can I help you?`, model: m.name }]); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{ background: activeModel.id === m.id ? `${m.color}20` : c.surface, color: activeModel.id === m.id ? m.color : c.textMuted, border: `1px solid ${activeModel.id === m.id ? m.color : c.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
            {m.name}
          </button>
        ))}
      </div>
      {/* Active model info */}
      <div className="px-4 py-2 flex-shrink-0" style={{ background: `${activeModel.color}08`, borderBottom: `1px solid ${c.border}` }}>
        <p className="text-[10px]" style={{ color: activeModel.color }}>{activeModel.name} · {activeModel.company} — {activeModel.desc}</p>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] px-3 py-2 rounded-xl text-[11px] leading-relaxed"
              style={{ background: m.role === "user" ? activeModel.color : c.surface, color: m.role === "user" ? "#fff" : c.text, border: m.role === "ai" ? `1px solid ${c.border}` : "none" }}>
              {m.role === "ai" && <p className="text-[9px] font-semibold mb-1" style={{ color: activeModel.color }}>{m.model}</p>}
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="px-3 py-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder={`Message ${activeModel.name}...`}
          className="flex-1 text-[11px] px-3 py-2 rounded-lg outline-none"
          style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
        <button onClick={send} className="px-3 py-2 rounded-lg text-[11px] font-medium" style={{ background: activeModel.color, color: "#fff" }}>
          <I d={ic.send} s={14} c="#fff" />
        </button>
      </div>
    </div>
  );
}

// ━━━━ AI IMAGE GENERATOR APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ImageGenApp({ c }: { c: typeof palette.dark }) {
  const styles = ["Photorealistic", "Oil Painting", "Watercolor", "Anime", "Abstract", "Pixel Art", "Sketch", "3D Render"];
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(false);
  const mockImages = [
    "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=300&q=80",
    "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=300&q=80",
    "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=300&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&q=80",
  ];
  const generate = () => {
    if (!prompt.trim()) return;
    setGenerating(true); setProgress(0); setGenerated(false);
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(iv); setGenerating(false); setGenerated(true); return 100; } return p + 5; });
    }, 80);
  };
  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={2} className="w-full text-[11px] px-3 py-2 rounded-lg outline-none resize-none mb-2"
          style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
        <div className="flex flex-wrap gap-1 mb-2">
          {styles.map(s => (
            <button key={s} onClick={() => setStyle(s)}
              className="px-2 py-0.5 rounded-full text-[9px] transition-colors"
              style={{ background: style === s ? c.accent : c.cardAlt, color: style === s ? "#fff" : c.textMuted }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={generating}
          className="w-full py-2 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: generating ? c.cardAlt : c.accent, color: generating ? c.textMuted : "#fff" }}>
          {generating ? `Generating... ${progress}%` : "✨ Generate Image"}
        </button>
        {generating && (
          <div className="mt-2 h-1.5 rounded-full" style={{ background: c.border }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: c.accent }} />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: "none" }}>
        {generated && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold mb-2" style={{ color: c.text }}>Generated — {style}</p>
            <div className="rounded-xl overflow-hidden aspect-square relative mb-2" style={{ background: c.surface }}>
              <img src={mockImages[Math.floor(Math.random() * mockImages.length)]} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 flex gap-1">
                {["Save", "Upscale"].map(a => (
                  <button key={a} className="px-2 py-1 rounded-lg text-[9px] font-medium" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        <p className="text-[10px] font-semibold mb-2" style={{ color: c.textMuted }}>History</p>
        <div className="grid grid-cols-2 gap-2">
          {mockImages.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-square" style={{ background: c.surface }}>
              <img src={img} alt="" className="w-full h-full object-cover opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ━━━━ AI VOICE APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AIVoiceApp({ c }: { c: typeof palette.dark }) {
  const [mode, setMode] = useState<"stt" | "tts">("stt");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsText, setTtsText] = useState("Type something and I'll speak it aloud.");
  const [voice, setVoice] = useState("Aria");
  const [speaking, setSpeaking] = useState(false);
  const voices = ["Aria", "Nova", "Echo", "Onyx", "Shimmer", "Fable"];
  const mockTranscripts = [
    "Open the gallery application and show me the latest uploads.",
    "Create a new task: Review artist applications by Friday.",
    "What is the weather forecast for tomorrow in New York?",
    "Send an email to Sarah Mitchell about her recent submission.",
  ];
  const toggleListen = () => {
    setListening(p => !p);
    if (!listening) {
      setTimeout(() => {
        setTranscript(mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]);
        setListening(false);
      }, 2500);
    }
  };
  const speak = () => { setSpeaking(true); setTimeout(() => setSpeaking(false), 2000); };
  const bars = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {[{ id: "stt", label: "🎤 Speech → Text" }, { id: "tts", label: "🔊 Text → Speech" }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id as "stt" | "tts")}
            className="flex-1 py-2.5 text-[11px] font-medium transition-colors"
            style={{ background: mode === m.id ? c.surface : "transparent", color: mode === m.id ? c.text : c.textMuted, borderBottom: mode === m.id ? `2px solid ${c.accent}` : "2px solid transparent" }}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === "stt" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <button onClick={toggleListen}
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all"
            style={{ background: listening ? `${c.danger}20` : c.accentSoft, border: `2px solid ${listening ? c.danger : c.accent}`, boxShadow: listening ? `0 0 0 8px ${c.danger}15` : "none" }}>
            <I d={ic.mic} s={36} c={listening ? c.danger : c.accent} />
          </button>
          {/* Waveform */}
          <div className="flex items-center gap-0.5 h-10">
            {bars.map(i => (
              <div key={i} className="w-1 rounded-full transition-all"
                style={{ height: listening ? `${Math.random() * 100}%` : "15%", background: listening ? c.danger : c.border, animation: listening ? `pulse ${0.3 + i * 0.05}s ease-in-out infinite alternate` : "none" }} />
            ))}
          </div>
          <p className="text-[11px] font-medium" style={{ color: c.textSec }}>{listening ? "Listening..." : "Tap to speak"}</p>
          {transcript && (
            <div className="w-full p-3 rounded-xl text-[11px] leading-relaxed" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }}>
              &ldquo;{transcript}&rdquo;
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div>
            <p className="text-[10px] font-semibold mb-1.5" style={{ color: c.textMuted }}>Voice</p>
            <div className="flex flex-wrap gap-1.5">
              {voices.map(v => (
                <button key={v} onClick={() => setVoice(v)}
                  className="px-3 py-1 rounded-full text-[10px] transition-colors"
                  style={{ background: voice === v ? c.accentSoft : c.surface, color: voice === v ? c.accentText : c.textMuted, border: `1px solid ${voice === v ? c.accent : c.border}` }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <textarea value={ttsText} onChange={e => setTtsText(e.target.value)}
            rows={5} className="flex-1 text-[11px] px-3 py-2 rounded-xl outline-none resize-none"
            style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
          <button onClick={speak} disabled={speaking}
            className="py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"
            style={{ background: speaking ? c.cardAlt : c.accent, color: speaking ? c.textMuted : "#fff" }}>
            <I d={ic.volume} s={16} c={speaking ? c.textMuted : "#fff"} />
            {speaking ? "Speaking..." : `Speak as ${voice}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ━━━━ AI WRITER APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WriterApp({ c }: { c: typeof palette.dark }) {
  const [content, setContent] = useState("# Untitled Document\n\nStart writing here...");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [tone, setTone] = useState("Professional");
  const tones = ["Professional", "Casual", "Creative", "Formal", "Friendly"];
  const aiSuggestions = [
    " Furthermore, this approach demonstrates significant potential for growth and innovation in the field.",
    " The data clearly supports this conclusion, with multiple studies confirming these findings.",
    " This presents a unique opportunity to explore new creative directions and expand our artistic vision.",
    " In conclusion, these elements combine to create a cohesive and compelling narrative.",
  ];
  const getSuggestion = () => setSuggestion(aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]);
  const acceptSuggestion = () => { if (suggestion) { setContent(p => p + suggestion); setSuggestion(null); } };
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="px-3 py-2 flex items-center gap-1 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
          {[ic.alignLeft, ic.alignCenter, ic.alignRight, ic.alignJustify].map((d, i) => (
            <button key={i} className="p-1.5 rounded" onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <I d={d} s={13} c={c.textMuted} />
            </button>
          ))}
          <div className="w-px h-4 mx-1" style={{ background: c.border }} />
          {["B", "I", "U"].map(f => (
            <button key={f} className="w-6 h-6 rounded text-[11px] font-bold" style={{ color: c.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative overflow-hidden">
          <textarea value={content} onChange={e => setContent(e.target.value)}
            className="w-full h-full p-5 text-[12px] leading-7 resize-none outline-none"
            style={{ background: c.bg, color: c.text, scrollbarWidth: "none" }} />
          {suggestion && (
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl text-[11px] leading-relaxed"
              style={{ background: `${c.accent}15`, border: `1px solid ${c.accent}40`, color: c.accentText }}>
              <p className="text-[9px] font-semibold mb-1" style={{ color: c.textMuted }}>AI SUGGESTION</p>
              {suggestion}
              <div className="flex gap-2 mt-2">
                <button onClick={acceptSuggestion} className="px-2 py-0.5 rounded text-[9px] font-medium" style={{ background: c.accent, color: "#fff" }}>Accept</button>
                <button onClick={() => setSuggestion(null)} className="px-2 py-0.5 rounded text-[9px] font-medium" style={{ background: c.cardAlt, color: c.textMuted }}>Dismiss</button>
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-1.5 flex items-center gap-4 text-[9px] flex-shrink-0" style={{ borderTop: `1px solid ${c.border}`, color: c.textMuted }}>
          <span>{words} words</span><span>{chars} chars</span>
        </div>
      </div>
      {/* AI sidebar */}
      <div className="w-36 flex-shrink-0 flex flex-col p-3 gap-3" style={{ borderLeft: `1px solid ${c.border}` }}>
        <div>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: c.text }}>Tone</p>
          {tones.map(t => (
            <button key={t} onClick={() => setTone(t)}
              className="w-full text-left px-2 py-1 rounded-lg text-[10px] mb-0.5 transition-colors"
              style={{ background: tone === t ? c.accentSoft : "transparent", color: tone === t ? c.accentText : c.textMuted }}>
              {t}
            </button>
          ))}
        </div>
        <div className="h-px" style={{ background: c.border }} />
        <div>
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: c.text }}>AI Assist</p>
          {["Suggest", "Rephrase", "Expand", "Shorten"].map(a => (
            <button key={a} onClick={a === "Suggest" ? getSuggestion : undefined}
              className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] mb-0.5 transition-colors"
              style={{ background: c.surface, color: c.textSec, border: `1px solid ${c.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = c.surface)}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ━━━━ KNOWLEDGE BASE APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function KnowledgeApp({ c }: { c: typeof palette.dark }) {
  const docs = [
    { name: "Artist Guidelines 2024", size: "245 KB", pages: 12, tags: ["policy", "artists"], indexed: true },
    { name: "Payment Integration Docs", size: "89 KB", pages: 5, tags: ["dev", "payments"], indexed: true },
    { name: "Gallery Exhibition Plan", size: "1.2 MB", pages: 34, tags: ["gallery", "events"], indexed: true },
    { name: "Marketing Strategy Q1", size: "560 KB", pages: 18, tags: ["marketing", "strategy"], indexed: false },
    { name: "Legal Terms & Conditions", size: "120 KB", pages: 8, tags: ["legal"], indexed: true },
  ];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ doc: string; snippet: string; page: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const snippets: Record<string, string> = {
    pay: "...payment is processed via Stripe with 3DS authentication. Funds are held for 7 days before release to artists...",
    art: "...artists must submit a portfolio of at least 5 original works. All pieces must be verified authentic...",
    gall: "...the gallery exhibition runs from March 15 to April 30. Artists are required to attend the opening night...",
    mark: "...Q1 marketing budget is €12,000 with focus on Instagram and Google Ads campaigns targeting collectors...",
    legal: "...users agree to our terms of service. Alternus retains a 20% commission on all successful sales...",
  };
  const search = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const key = Object.keys(snippets).find(k => query.toLowerCase().includes(k)) ?? "art";
      setResults([
        { doc: docs[0].name, snippet: snippets[key] ?? snippets.art, page: 3 },
        { doc: docs[2].name, snippet: "...related context found in the exhibition planning document regarding artists and submissions...", page: 7 },
      ]);
      setSearching(false);
    }, 800);
  };
  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      {/* Document list */}
      <div className="w-44 flex-shrink-0 flex flex-col" style={{ borderRight: `1px solid ${c.border}` }}>
        <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <p className="text-[11px] font-semibold" style={{ color: c.text }}>Documents</p>
          <p className="text-[9px]" style={{ color: c.textMuted }}>{docs.filter(d => d.indexed).length} indexed</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: "none" }}>
          {docs.map((d, i) => (
            <div key={i} className="px-2 py-2 rounded-lg" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <I d={ic.fileText} s={11} c={d.indexed ? c.success : c.textMuted} />
                <span className="text-[9px] font-medium truncate" style={{ color: c.textSec }}>{d.name}</span>
              </div>
              <div className="flex gap-1.5">
                <span className="text-[8px]" style={{ color: c.textMuted }}>{d.size}</span>
                <span className="text-[8px] px-1 rounded" style={{ background: d.indexed ? `${c.success}20` : c.cardAlt, color: d.indexed ? c.success : c.textMuted }}>{d.indexed ? "indexed" : "pending"}</span>
              </div>
            </div>
          ))}
          <button className="w-full py-1.5 rounded-lg text-[10px] text-center" style={{ border: `1px dashed ${c.border}`, color: c.textMuted }}>
            + Add Document
          </button>
        </div>
      </div>
      {/* Search */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <p className="text-[11px] font-semibold mb-2" style={{ color: c.text }}>Semantic Search</p>
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Ask anything about your documents..."
              className="flex-1 text-[11px] px-3 py-2 rounded-lg outline-none"
              style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
            <button onClick={search} className="px-3 py-2 rounded-lg" style={{ background: c.accent }}>
              <I d={ic.search} s={14} c="#fff" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {searching && <p className="text-[11px] text-center py-8" style={{ color: c.textMuted }}>Searching knowledge base...</p>}
          {results.map((r, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold" style={{ color: c.text }}>{r.doc}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>Page {r.page}</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: c.textSec }}>{r.snippet}</p>
              <div className="flex gap-1 mt-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${c.accent}15`, color: c.accentText }}>Relevance: 94%</span>
              </div>
            </div>
          ))}
          {!searching && results.length === 0 && (
            <div className="text-center py-12">
              <I d={ic.bookOpen} s={32} c={c.textMuted} />
              <p className="text-[11px] mt-3" style={{ color: c.textMuted }}>Search your indexed documents with natural language</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━ RECOVERY APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface RecoveryFile {
  name: string;
  icon: string;
  deletedAt: string;
  origin: string;
  size: string;
  status: "recoverable" | "partial";
  integrity: number;
}

function RecoveryApp({ c, files, onRecover, onPermanentDelete, onScan }: {
  c: typeof palette.dark;
  files: RecoveryFile[];
  onRecover: (name: string) => void;
  onPermanentDelete: (name: string) => void;
  onScan: () => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [filter, setFilter] = useState<"all" | "recoverable" | "partial">("all");

  const doScan = () => {
    setScanning(true); setScanProgress(0);
    const iv = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) { clearInterval(iv); setScanning(false); onScan(); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const filtered = files.filter(f => filter === "all" || f.status === filter);
  const totalSize = files.reduce((a, f) => {
    const n = parseFloat(f.size);
    return a + (f.size.includes("MB") ? n : f.size.includes("KB") ? n / 1024 : n / (1024 * 1024));
  }, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)" }}>
              <I d={ic.shield} s={18} c={c.success} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: c.text }}>Recovery Tool</p>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{files.length} file{files.length !== 1 ? "s" : ""} recoverable · {totalSize.toFixed(1)} MB total</p>
            </div>
          </div>
          <button
            onClick={doScan}
            disabled={scanning}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
            style={{ background: scanning ? c.cardAlt : c.accent, color: scanning ? c.textMuted : "#fff" }}
          >
            <I d={ic.refresh} s={13} c={scanning ? c.textMuted : "#fff"} />
            {scanning ? "Scanning..." : "Deep Scan"}
          </button>
        </div>

        {/* Scan progress */}
        {scanning && (
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: c.cardAlt }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(scanProgress, 100)}%`, background: `linear-gradient(90deg, ${c.accent}, ${c.success})` }} />
          </div>
        )}

        {/* Filter tabs */}
        {!scanning && files.length > 0 && (
          <div className="flex gap-1 mt-3">
            {(["all", "recoverable", "partial"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-lg text-[10px] font-medium transition-colors"
                style={{ background: filter === f ? c.accentSoft : "transparent", color: filter === f ? c.accentText : c.textMuted }}>
                {f === "all" ? `All (${files.length})` : f === "recoverable" ? `Recoverable (${files.filter(x => x.status === "recoverable").length})` : `Partial (${files.filter(x => x.status === "partial").length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 && !scanning && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: c.cardAlt }}>
              <I d={ic.shield} s={24} c={c.textMuted} />
            </div>
            <p className="text-sm font-medium" style={{ color: c.text }}>No recoverable files</p>
            <p className="text-xs" style={{ color: c.textMuted }}>Files deleted from Trash will appear here. Run a Deep Scan to search for recoverable data.</p>
            <button onClick={doScan} className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold" style={{ background: c.accent, color: "#fff" }}>
              <I d={ic.refresh} s={13} c="#fff" /> Start Deep Scan
            </button>
          </div>
        )}

        {filtered.map((file, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
            onMouseLeave={e => (e.currentTarget.style.background = c.surface)}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: file.status === "recoverable" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)" }}>
              <I d={file.icon} s={16} c={file.status === "recoverable" ? c.success : c.warning} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: c.text }}>{file.name}</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>
                {file.origin} · {file.deletedAt} · {file.size}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: file.status === "recoverable" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
                  color: file.status === "recoverable" ? c.success : c.warning,
                }}>
                {file.status === "recoverable" ? `${file.integrity}%` : `${file.integrity}%`}
              </span>
              <button onClick={() => onRecover(file.name)}
                className="px-3 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-90"
                style={{ background: c.accent, color: "#fff" }}>
                Recover
              </button>
              <button onClick={() => onPermanentDelete(file.name)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: c.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = c.danger)}
                onMouseLeave={e => (e.currentTarget.style.color = c.textMuted)}>
                <I d={ic.close} s={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
          <button onClick={() => { filtered.forEach(f => onRecover(f.name)); }}
            className="px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90"
            style={{ background: c.accentSoft, color: c.accentText }}>
            Recover All ({filtered.length})
          </button>
          <button onClick={() => { filtered.forEach(f => onPermanentDelete(f.name)); }}
            className="px-4 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ color: c.danger }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            Delete All Permanently
          </button>
        </div>
      )}
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
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [connectedWifi, setConnectedWifi] = useState(0);
  const [showTaskSwitcher, setShowTaskSwitcher] = useState(false);
  const [taskSwitcherIdx, setTaskSwitcherIdx] = useState(0);
  const [systemModal, setSystemModal] = useState<SystemModal>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiActions, setAiActions] = useState<{ label: string; action: WinId }[]>([]);
  const [aiCreation, setAiCreation] = useState<string | null>(null);
  const [aiAppResults, setAiAppResults] = useState<{ id: WinId; title: string; icon: string; description: string }[]>([]);
  const [showAIFrame, setShowAIFrame] = useState(false);
  const aiFrameInputRef = useRef<HTMLInputElement>(null);
  const [showAiFixMenu, setShowAiFixMenu] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatMsgs, setAiChatMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [aiChatHistory, setAiChatHistory] = useState([
    { title: "Create a description", time: "Today" },
    { title: "Write an email", time: "Today" },
    { title: "Explain quantum computing", time: "Yesterday" },
  ]);
  // AI features
  const [aiNotifications, setAiNotifications] = useState<AINotification[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<{ message: string; actions: { label: string; action: () => void }[] } | null>(null);
  const [closeChain, setCloseChain] = useState<{ appId: WinId; title: string } | null>(null);
  const [smartDND, setSmartDND] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);
  const [recoveryFiles, setRecoveryFiles] = useState<RecoveryFile[]>([]);
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [installingApp, setInstallingApp] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [paymentModal, setPaymentModal] = useState<{ name: string; price: string; icon: string; iconBg: string } | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [activeSpace, setActiveSpace] = useState(1);
  const [showSpacesView, setShowSpacesView] = useState(false);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<"left" | "right" | "top" | null>(null);
  const savePosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMouseMove = useRef(Date.now());

  const c = palette[mode];

  const defaultWins: WinState[] = [
    { id: "ai", title: "Alternus AI", isOpen: true, isMinimized: false, isMaximized: true, zIndex: 1, x: 0, y: 0, w: 660, h: 500 },
    { id: "terminal", title: "Terminal", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 80, w: 460, h: 340 },
    { id: "code", title: "Code Editor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 50, w: 520, h: 400 },
    { id: "files", title: "Files", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 240, y: 70, w: 520, h: 400 },
    { id: "settings", title: "Settings", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 60, w: 500, h: 380 },
    { id: "music", title: "Music", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 340, h: 360 },
    { id: "weather", title: "Weather", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 350, y: 70, w: 360, h: 430 },
    { id: "calendar", title: "Calendar", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 380, y: 90, w: 320, h: 340 },
    { id: "notes", title: "Notes", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 220, y: 80, w: 400, h: 340 },
    { id: "browser", title: "Browser", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, w: 540, h: 400 },
    { id: "store", title: "Store", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 40, y: 40, w: 680, h: 500 },
    { id: "movies", title: "Movies", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 40, w: 640, h: 460 },
    { id: "word", title: "Alternus Word", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 50, w: 540, h: 400 },
    { id: "clock", title: "Clock", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 400, y: 100, w: 360, h: 420 },
    { id: "calculator", title: "Calculator", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 500, y: 80, w: 320, h: 440 },
    { id: "accounts", title: "Accounts", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 90, w: 360, h: 400 },
    { id: "downloads", title: "Downloads", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 350, y: 80, w: 440, h: 480 },
    { id: "controlpanel", title: "Control Panel", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 40, w: 580, h: 440 },
    { id: "studio", title: "Alternus Studio", isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1, x: 60, y: 30, w: 720, h: 520 },
    { id: "recovery", title: "Recovery", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 60, w: 520, h: 440 },
    { id: "news", title: "News", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 50, w: 500, h: 480 },
    { id: "dashboard", title: "Dashboard", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 40, w: 520, h: 460 },
    { id: "tasks", title: "Tasks", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 220, y: 60, w: 420, h: 480 },
    { id: "mail", title: "Mail", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 50, w: 580, h: 460 },
    { id: "monaco", title: "Code Editor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 60, y: 30, w: 600, h: 480 },
    { id: "aihub", title: "AI Hub", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 60, w: 480, h: 500 },
    { id: "imagegen", title: "AI Image Generator", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 40, w: 440, h: 520 },
    { id: "aivoice", title: "AI Voice", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 380, h: 440 },
    { id: "writer", title: "AI Writer", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, w: 560, h: 480 },
    { id: "knowledge", title: "Knowledge Base", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, w: 560, h: 480 },
    { id: "sysmon", title: "System Monitor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 50, w: 500, h: 480 },
  ];

  const [wins, setWins] = useState<WinState[]>(defaultWins);

  // Load saved window positions from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("alternus-win-pos") || "[]") as { id: string; x: number; y: number; w: number; h: number; isMaximized: boolean }[];
      if (saved.length > 0) {
        setWins(cur => cur.map(w => {
          const s = saved.find(sv => sv.id === w.id);
          return s ? { ...w, x: s.x, y: s.y, w: s.w, h: s.h, isMaximized: s.isMaximized } : w;
        }));
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist window positions to localStorage (debounced 600ms)
  useEffect(() => {
    if (savePosTimer.current) clearTimeout(savePosTimer.current);
    savePosTimer.current = setTimeout(() => {
      try {
        const toSave = wins.map(w => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h, isMaximized: w.isMaximized }));
        localStorage.setItem("alternus-win-pos", JSON.stringify(toSave));
      } catch { /* ignore */ }
    }, 600);
    return () => { if (savePosTimer.current) clearTimeout(savePosTimer.current); };
  }, [wins]);

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
      store: { w: 780, h: 540 },
      movies: { w: 720, h: 500 },
      word: { w: 760, h: 520 },
      clock: { w: 380, h: 460 },
      calculator: { w: 320, h: 460 },
      accounts: { w: 380, h: 440 },
      downloads: { w: 440, h: 480 },
      controlpanel: { w: 580, h: 440 },
      studio: { w: 720, h: 520 },
      recovery: { w: 520, h: 440 },
      news: { w: 500, h: 480 },
      dashboard: { w: 520, h: 460 },
      tasks: { w: 420, h: 480 },
      mail: { w: 580, h: 460 },
      monaco: { w: 680, h: 500 },
      aihub: { w: 480, h: 500 },
      imagegen: { w: 440, h: 520 },
      aivoice: { w: 380, h: 440 },
      writer: { w: 560, h: 480 },
      knowledge: { w: 580, h: 480 },
      sysmon: { w: 500, h: 480 },
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

  const snapWin = useCallback((id: WinId, side: "left" | "right" | "top") => {
    if (side === "top") {
      setWins(p => p.map(w => w.id === id ? { ...w, isMaximized: true } : w));
      return;
    }
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
      // Spotlight: Ctrl+K or Ctrl+Space
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSpotlight(p => !p);
        setSpotlightQuery("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === " ") {
        e.preventDefault();
        setShowSpotlight(p => !p);
        setSpotlightQuery("");
      }
      // Escape closes spotlight / spaces / panels
      if (e.key === "Escape") {
        setShowSpotlight(false);
        setShowSpacesView(false);
        setShowApps(false);
        setShowNotifications(false);
        setShowWifiPanel(false);
        setShowProfilePanel(false);
        setShowAIFrame(false);
        setShowAiFixMenu(false);
      }
      // Ctrl+1/2/3 switch spaces
      if ((e.ctrlKey || e.metaKey) && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        setActiveSpace(parseInt(e.key));
      }
      // Ctrl+W — close focused (highest z) open window
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        const topWin = [...wins].filter(w => w.isOpen && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (topWin) closeWinWithAI(topWin.id);
      }
      // Ctrl+M — minimize focused window
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        const topWin = [...wins].filter(w => w.isOpen && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (topWin) minimizeWin(topWin.id);
      }
      // Ctrl+H — hide all windows (show desktop)
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setWins(p => p.map(w => w.isOpen && !w.isMinimized ? { ...w, isMinimized: true } : w));
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

  const handleDesktopSearch = (overrideQuery?: string) => {
    const raw = (overrideQuery || aiInput).trim();
    const q = raw.toLowerCase();
    if (!q) return;
    if (overrideQuery) setAiInput(overrideQuery);
    setAiAppResults([]); setAiResponse(null); setAiActions([]); setAiCreation(null);
    addTimelineEvent("Searched", `"${raw}"`, ic.search);

    // ━━━ APP KEYWORD MAP — every keyword opens the right app ━━━
    const appMap: { keys: string[]; id: WinId; title: string; icon: string; description: string; extra?: { id: WinId; title: string; icon: string; description: string } }[] = [
      { keys: ["google", "browse", "browser", "web", "search", "internet", "url", "website", "http", "youtube", "facebook", "instagram", "twitter", "reddit", "wikipedia", "linkedin", "amazon", "ebay", "netflix", "spotify", "tiktok", "pinterest", "stackoverflow", "github"],
        id: "browser", title: "Browser", icon: ic.globe, description: "Browse the web, search, and access websites" },
      { keys: ["code", "program", "develop", "javascript", "python", "html", "css", "react", "typescript", "debug", "compile", "script", "function", "variable", "api", "claude", "ai code", "copilot", "vscode", "editor", "ide", "git", "npm", "node"],
        id: "code", title: "Code Editor", icon: ic.code, description: "Write, edit, and debug code" },
      { keys: ["terminal", "command", "shell", "bash", "cmd", "console", "cli", "ssh", "ping", "npm run", "yarn", "pip"],
        id: "terminal", title: "Terminal", icon: ic.terminal, description: "Command line interface and shell access" },
      { keys: ["file", "document", "folder", "directory", "explorer", "pdf", "docx", "xlsx", "zip", "rar", "copy", "paste", "move", "rename", "delete file"],
        id: "files", title: "Files", icon: ic.folder, description: "Browse and manage your files and folders" },
      { keys: ["music", "song", "play", "playlist", "album", "artist", "audio", "mp3", "radio", "podcast", "beats", "dj", "sound", "volume"],
        id: "music", title: "Music", icon: ic.music, description: "Listen to music, playlists, and audio" },
      { keys: ["weather", "temperature", "rain", "sunny", "cloudy", "forecast", "storm", "snow", "wind", "humidity", "celsius", "fahrenheit", "climate"],
        id: "weather", title: "Weather", icon: ic.cloud, description: "Check current weather and forecasts" },
      { keys: ["calendar", "schedule", "event", "meeting", "appointment", "date", "today", "tomorrow", "week", "month", "birthday", "deadline", "planner", "agenda"],
        id: "calendar", title: "Calendar", icon: ic.calendar, description: "Manage events, schedule, and reminders" },
      { keys: ["alarm", "clock", "timer", "stopwatch", "time", "reminder", "world clock", "countdown"],
        id: "clock", title: "Clock", icon: ic.clock, description: "Alarms, timers, stopwatch, and world clock" },
      { keys: ["calculator", "calculate", "math", "add", "subtract", "multiply", "divide", "sum", "percentage", "convert"],
        id: "calculator", title: "Calculator", icon: ic.calc, description: "Perform calculations and conversions" },
      { keys: ["account", "login", "password", "credential", "saved account", "sign in", "profile", "username"],
        id: "accounts", title: "Accounts", icon: ic.user, description: "Manage your saved accounts and credentials" },
      { keys: ["download", "upload", "install", "update", "package", "setup", "installer", "transfer"],
        id: "downloads", title: "Downloads", icon: ic.download, description: "Downloads and install manager" },
      { keys: ["note", "write", "memo", "todo", "checklist", "list", "journal", "diary", "scratch", "jot", "brainstorm", "idea"],
        id: "notes", title: "Notes", icon: ic.note, description: "Quick notes, memos, and to-do lists" },
      { keys: ["word", "document", "letter", "essay", "report", "resume", "cv", "thesis", "article", "blog", "paper", "manuscript", "format", "paragraph", "font", "bold", "italic", "heading"],
        id: "word", title: "Alternus Word", icon: ic.fileText, description: "Create and edit documents" },
      { keys: ["setting", "config", "theme", "dark mode", "light mode", "wifi", "bluetooth", "network", "display", "brightness", "language", "notification", "privacy", "security", "system", "preference", "storage", "battery"],
        id: "settings", title: "Settings", icon: ic.settings, description: "System settings and preferences" },
      { keys: ["store", "shop", "buy", "purchase", "app store", "download app", "marketplace", "shopping", "cart", "order", "product", "price", "deal", "sale", "discount", "ecommerce"],
        id: "store", title: "Store", icon: ic.store, description: "Browse and install apps" },
      { keys: ["movie", "film", "video", "watch", "stream", "cinema", "series", "tv show", "anime", "documentary", "trailer", "imdb", "popcorn", "subtitle", "episode", "season"],
        id: "movies", title: "Movies", icon: ic.film, description: "Watch movies, series, and videos" },
      { keys: ["ai", "chat", "assistant", "help me", "ask", "question", "explain", "translate", "summarize", "generate", "create", "analyze", "solve", "gpt", "claude", "chatbot", "conversation"],
        id: "ai", title: "Alternus AI", icon: ic.sparkle, description: "AI-powered assistant and chat" },
      { keys: ["illustrator", "design", "draw", "paint", "sketch", "art", "photoshop", "figma", "canvas", "graphic", "logo", "icon", "illustration", "vector", "pixel", "color", "gradient", "brush", "layer"],
        id: "code", title: "Code Editor", icon: ic.code, description: "SVG/CSS design and creative coding", extra: { id: "browser", title: "Browser", icon: ic.globe, description: "Open Figma or design tools in browser" } },
      { keys: ["recovery", "recover", "restore", "undelete", "recycle", "trash", "deleted", "lost file", "deep scan"],
        id: "recovery", title: "Recovery", icon: ic.shield, description: "Recover deleted files and deep scan" },
      { keys: ["news", "breaking", "headline", "article", "press", "journalism", "newspaper", "media", "report", "bbc", "cnn", "reuters", "current events"],
        id: "news", title: "News", icon: ic.newspaper, description: "Breaking news and world headlines" },
      { keys: ["dashboard", "overview", "stats", "system", "monitor", "home", "widgets", "summary", "quick view"],
        id: "dashboard", title: "Dashboard", icon: ic.grid, description: "System overview, stats and widgets" },
      { keys: ["task", "todo", "to-do", "checklist", "priority", "deadline", "reminder", "plan", "agenda", "productivity"],
        id: "tasks", title: "Tasks", icon: ic.checkSquare, description: "Manage tasks with priorities and deadlines" },
      { keys: ["mail", "email", "inbox", "compose", "message", "send", "receive", "smtp", "letter", "newsletter"],
        id: "mail", title: "Mail", icon: ic.mail, description: "Email client with inbox and compose" },
      { keys: ["vscode", "monaco", "ide", "editor", "code editor", "typescript", "javascript", "python", "syntax", "programming"],
        id: "monaco", title: "Code Editor", icon: ic.code, description: "VS Code-style code editor" },
      { keys: ["ai hub", "multi model", "gpt", "claude", "gemini", "llama", "compare", "model", "chat ai", "ai chat"],
        id: "aihub", title: "AI Hub", icon: ic.messageCircle, description: "Multi-model AI chat hub" },
      { keys: ["image gen", "generate image", "dalle", "stable diffusion", "midjourney", "text to image", "art ai", "draw ai"],
        id: "imagegen", title: "AI Image Generator", icon: ic.wand, description: "Generate images with AI" },
      { keys: ["voice", "speech", "microphone", "text to speech", "speech to text", "stt", "tts", "dictate", "transcribe"],
        id: "aivoice", title: "AI Voice", icon: ic.mic, description: "Speech-to-text and text-to-speech" },
      { keys: ["writer", "ai write", "autocomplete", "document ai", "content", "copywriting", "blog writer", "essay ai"],
        id: "writer", title: "AI Writer", icon: ic.edit3, description: "Document editor with AI writing assistance" },
      { keys: ["knowledge", "rag", "search docs", "knowledge base", "semantic search", "index", "upload doc", "qa", "document search"],
        id: "knowledge", title: "Knowledge Base", icon: ic.bookOpen, description: "Semantic search over your documents" },
      { keys: ["system monitor", "cpu", "ram", "gpu", "memory", "performance", "processes", "usage", "task manager", "resources", "temperature"],
        id: "sysmon", title: "System Monitor", icon: ic.activity, description: "Real-time CPU, RAM, GPU monitoring" },
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
      if (entry.keys.some(k => q.includes(k))) {
        const actions: { label: string; action: WinId }[] = [{ label: `Open ${entry.title}`, action: entry.id }];
        if (entry.extra) actions.push({ label: `Open ${entry.extra.title}`, action: entry.extra.id });
        setAiResponse(`Opening ${entry.title.toLowerCase()} for you.`);
        setAiActions(actions);
        setAiInput("");
        return;
      }
    }

    // ━━━ AI CONTENT CREATION ━━━
    const createWords = ["create", "write", "generate", "compose", "draft", "make a", "describe", "explain", "summarize", "translate", "rewrite"];
    if (createWords.some(w => q.includes(w))) {
      setAiCreation(`Here is what I created for you:\n\n${raw.charAt(0).toUpperCase() + raw.slice(1)} — a well-crafted piece generated by Alternus AI.\n\nThis is a detailed, professional response tailored to your request. The content features clear structure, engaging language, and precise formatting.\n\nA slightly more refined version:\n\n${raw.charAt(0).toUpperCase() + raw.slice(1)} delivers a polished, modern approach with attention to detail, subtle elegance, and a professional finish that stands out.\n\nFor a shorter version:\n\nClean, refined, and professional — ${q} at its best.\n\nIf you want, I can turn it into a prompt-style description, product description, or social media caption.`);
      setAiInput("");
      setShowAIFrame(false);
      return;
    }

    // ━━━ FALLBACK — open browser to search ━━━
    setAiResponse(`No app found for "${raw}". I can search the web for you.`);
    setAiActions([{ label: "Search on Google", action: "browser" }, { label: "Open AI Chat", action: "ai" }]);
  };

  const handleRecoveryRecover = (name: string) => {
    const file = recoveryFiles.find(f => f.name === name);
    if (!file) return;
    setRecoveryFiles(prev => prev.filter(f => f.name !== name));
    addTimelineEvent("Recovered", file.name, ic.refresh);
  };
  const handleRecoveryDelete = (name: string) => {
    setRecoveryFiles(prev => prev.filter(f => f.name !== name));
  };
  const handleRecoveryScan = () => {
    const scanResults: RecoveryFile[] = [
      { name: "project-backup.zip", icon: ic.folder, deletedAt: "3 days ago", origin: "Documents", size: "45 MB", status: "recoverable", integrity: 100 },
      { name: "presentation-final.pptx", icon: ic.fileText, deletedAt: "1 week ago", origin: "Documents", size: "12 MB", status: "recoverable", integrity: 98 },
      { name: "vacation-photo.jpg", icon: ic.image, deletedAt: "2 weeks ago", origin: "Pictures", size: "4.2 MB", status: "partial", integrity: 67 },
      { name: "database-export.sql", icon: ic.code, deletedAt: "3 weeks ago", origin: "Projects", size: "8.5 MB", status: "recoverable", integrity: 95 },
      { name: "old-resume.docx", icon: ic.fileText, deletedAt: "1 month ago", origin: "Documents", size: "340 KB", status: "partial", integrity: 43 },
    ];
    setRecoveryFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...scanResults.filter(f => !existing.has(f.name))];
    });
  };
  const handleTrashEmpty = (files: { name: string; icon: string; size: string; origin: string }[]) => {
    const newRecovery: RecoveryFile[] = files.map(f => ({
      ...f,
      deletedAt: "Just now",
      status: Math.random() > 0.3 ? "recoverable" as const : "partial" as const,
      integrity: Math.random() > 0.3 ? Math.floor(Math.random() * 15 + 85) : Math.floor(Math.random() * 40 + 30),
    }));
    setRecoveryFiles(prev => [...prev, ...newRecovery]);
  };

  const winContent: Record<WinId, React.ReactNode> = {
    ai: <AIChat c={c} mode={mode} setMode={setMode} onOpenApp={openWin} />,
    terminal: <TerminalApp c={c} />,
    code: <CodeApp c={c} />,
    files: <FilesApp c={c} onOpenApp={openWin} onTrashEmpty={handleTrashEmpty} onDragFile={name => setDraggedFile(name)} />,
    settings: <SettingsApp c={c} mode={mode} setMode={setMode} wallpaper={wallpaper} setWallpaper={setWallpaper} />,
    music: <MusicApp c={c} />,
    weather: <WeatherApp c={c} />,
    calendar: <CalendarApp c={c} />,
    notes: <NotesApp c={c} />,
    browser: <BrowserApp c={c} />,
    word: <WordApp c={c} />,
    store: <StoreApp c={c} installedApps={installedApps} installingApp={installingApp} installProgress={installProgress} handleInstallApp={handleInstallApp} setPaymentModal={setPaymentModal} />,
    movies: <MoviesApp c={c} />,
    clock: <ClockApp c={c} />,
    calculator: <CalculatorApp c={c} />,
    accounts: <AccountsApp c={c} />,
    downloads: <DownloadsApp c={c} />,
    controlpanel: <ControlPanelApp c={c} mode={mode} setMode={setMode} onOpenApp={openWin} />,
    studio: <StudioApp c={c} />,
    recovery: <RecoveryApp c={c} files={recoveryFiles} onRecover={handleRecoveryRecover} onPermanentDelete={handleRecoveryDelete} onScan={handleRecoveryScan} />,
    news: <NewsApp c={c} />,
    dashboard: <DashboardApp c={c} />,
    tasks: <TasksApp c={c} />,
    mail: <MailApp c={c} />,
    monaco: <MonacoApp c={c} />,
    aihub: <AIHubApp c={c} />,
    imagegen: <ImageGenApp c={c} />,
    aivoice: <AIVoiceApp c={c} />,
    writer: <WriterApp c={c} />,
    knowledge: <KnowledgeApp c={c} />,
    sysmon: <SysMonApp c={c} />,
  };

  const dockApps: { id: WinId; icon: string; label: string; color: string }[] = [
    { id: "terminal", icon: ic.terminal, label: "Terminal", color: c.success },
    { id: "code", icon: ic.code, label: "Code", color: c.purple },
    { id: "files", icon: ic.folder, label: "Files", color: c.warning },
    { id: "browser", icon: ic.globe, label: "Browser", color: c.accentText },
    { id: "store", icon: ic.store, label: "Store", color: c.accent },
    { id: "movies", icon: ic.film, label: "Movies", color: c.purple },
    { id: "music", icon: ic.music, label: "Music", color: "#F472B6" },
    { id: "weather", icon: ic.cloud, label: "Weather", color: "#60A5FA" },
    { id: "calendar", icon: ic.calendar, label: "Calendar", color: "#60A5FA" },
    { id: "notes", icon: ic.note, label: "Notes", color: "#FBBF24" },
    { id: "word", icon: ic.fileText, label: "Word", color: c.accentText },
    { id: "downloads", icon: ic.download, label: "Downloads", color: "#34D399" },
    { id: "calculator", icon: ic.calc, label: "Calc", color: "#8ABF8A" },
    { id: "studio", icon: ic.pen, label: "Studio", color: "#A78BFA" },
    { id: "settings", icon: ic.settings, label: "Settings", color: c.textSec },
    { id: "controlpanel", icon: ic.monitor, label: "Control Panel", color: c.textSec },
    { id: "recovery", icon: ic.shield, label: "Recovery", color: c.success },
    { id: "news", icon: ic.newspaper, label: "News", color: c.danger },
    { id: "dashboard", icon: ic.grid, label: "Dashboard", color: "#60A5FA" },
    { id: "tasks", icon: ic.checkSquare, label: "Tasks", color: "#34D399" },
    { id: "mail", icon: ic.mail, label: "Mail", color: "#F97316" },
    { id: "monaco", icon: ic.code, label: "VS Code", color: "#007ACC" },
    { id: "aihub", icon: ic.messageCircle, label: "AI Hub", color: "#A78BFA" },
    { id: "imagegen", icon: ic.wand, label: "Image AI", color: "#EC4899" },
    { id: "aivoice", icon: ic.mic, label: "AI Voice", color: "#FBBF24" },
    { id: "writer", icon: ic.edit3, label: "AI Writer", color: "#34D399" },
    { id: "knowledge", icon: ic.bookOpen, label: "Knowledge", color: "#F97316" },
    { id: "sysmon", icon: ic.activity, label: "System Monitor", color: "#34D399" },
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
    "url('/wallpapers/OSwp5.png') center/cover no-repeat",
  ];
  const desktopBg = wallpaper === 0 ? c.bg : wallpapers[wallpaper] || c.bg;

  return (
    <div style={{ background: c.bg }} className="fixed inset-0 flex flex-col overflow-hidden">
      <style>{`* { scrollbar-width: none !important; -ms-overflow-style: none !important; } *::-webkit-scrollbar { display: none !important; } .ai-bar-input::placeholder { color: rgba(255,255,255,0.65); }`}</style>
      {/* Top Bar hover trigger zone */}
      <div className="absolute top-0 left-0 right-0 h-2 z-[300]" onMouseEnter={() => setShowTopBar(true)} />
      {/* Top Bar */}
      <div
        className="relative flex items-center justify-between px-4 h-9 flex-shrink-0 transition-all duration-300 z-[200]"
        style={{
          background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          transform: showTopBar ? "translateY(0)" : "translateY(-100%)",
          position: showTopBar ? "relative" : "absolute",
          top: 0, left: 0, right: 0,
        }}
        onMouseEnter={() => setShowTopBar(true)}
        onMouseLeave={() => setShowTopBar(false)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: c.text }} className="text-[11px] font-bold tracking-wider">ALTERNUS</span>
          <span style={{ color: c.textMuted }} className="text-[10px]">OS</span>
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-bold" style={{ color: c.text }}>{fmt(time)} · {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-1">
          {(() => { const ic_ = mode === "dark" ? "#aaaaaa" : "#666666"; const icH = mode === "dark" ? "#ffffff" : "#000000"; return (<>
            {/* Quick launch apps */}
            <button title="Browser" onClick={() => openWin("browser")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.globe} s={15} /></button>
            <button title="Settings" onClick={() => openWin("settings")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.settings} s={15} /></button>
            <button title="Code Editor" onClick={() => openWin("code")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.code} s={15} /></button>
            <button title="Terminal" onClick={() => openWin("terminal")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.terminal} s={15} /></button>
            <button title="Weather" onClick={() => openWin("weather")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.cloud} s={15} /></button>
            <button title="Calendar" onClick={() => openWin("calendar")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.calendar} s={15} /></button>
            <button title="Store" onClick={() => openWin("store")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.store} s={15} /></button>
            <button title="Movies" onClick={() => openWin("movies")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.film} s={15} /></button>
            {/* Separator */}
            <div className="w-px h-4 mx-1" style={{ background: c.border }} />
            {/* System tray */}
            <button title="Notifications" onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 rounded-md transition-colors relative" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}>
              <I d={ic.bell} s={15} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: c.danger }} />
            </button>
            <div className="relative">
              <button onClick={() => { setShowWifiPanel(!showWifiPanel); setShowProfilePanel(false); }} title="Wi-Fi" className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}><I d={ic.wifi} s={15} /></button>
              {/* WiFi Panel */}
              {showWifiPanel && (
                <div className="absolute top-full right-0 mt-2 w-[280px] rounded-xl overflow-hidden" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)", zIndex: 999 }}
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
            <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}>
              <I d={mode === "dark" ? ic.sun : ic.moon} s={15} />
            </button>
            {/* Separator */}
            <div className="w-px h-4 mx-1" style={{ background: c.border }} />
            <div className="relative">
              <button onClick={() => { setShowProfilePanel(!showProfilePanel); setShowWifiPanel(false); }} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}>
                <I d={ic.user} s={15} />
              </button>
              {/* Profile Panel */}
              {showProfilePanel && (
                <div className="absolute top-full right-0 mt-2 w-[240px] rounded-xl overflow-hidden" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)", zIndex: 999 }}
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
            <button onClick={() => { setIsBooting(true); setIsLocked(true); }} className="p-1.5 rounded-md transition-colors" style={{ color: ic_ }} onMouseEnter={e => (e.currentTarget.style.color = icH)} onMouseLeave={e => (e.currentTarget.style.color = ic_)}>
              <I d={ic.power} s={15} />
            </button>
          </>); })()}
        </div>
      </div>

      {/* Desktop Area - fixed, no scroll */}
      <div className="flex-1 relative overflow-hidden"
        style={{ background: desktopBg }}
        onClick={() => { if (showApps) setShowApps(false); setShowWifiPanel(false); setShowProfilePanel(false); setShowAISidebar(false); setContextMenu(null); if (showAIFrame && !aiResponse) setShowAIFrame(false); setShowAiFixMenu(false); }}
        onDoubleClick={() => { setShowAIFrame(true); setShowAiFixMenu(false); setTimeout(() => aiFrameInputRef.current?.focus(), 50); }}
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY - 36 }); setShowApps(false); setShowWifiPanel(false); setShowProfilePanel(false); setShowAISidebar(false); }}>


        {/* ━━━━ Snap Preview Overlay ━━━━ */}
        {snapPreview && (
          <div className="absolute pointer-events-none z-[90] transition-all duration-150" style={{
            ...(snapPreview === "left"  ? { top: 0, left: 0, width: "50%", bottom: 0 } :
                snapPreview === "right" ? { top: 0, right: 0, width: "50%", bottom: 0 } :
                                          { top: 0, left: 0, right: 0, bottom: 0 }),
            background: "rgba(59,130,246,0.15)",
            border: "2px solid rgba(59,130,246,0.5)",
            borderRadius: 12,
            margin: 4,
          }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-lg" style={{ background: "rgba(59,130,246,0.8)", color: "#fff" }}>
                {snapPreview === "top" ? "Maximize" : `Snap ${snapPreview}`}
              </span>
            </div>
          </div>
        )}

        {/* ━━━━ Spotlight Search Overlay ━━━━ */}
        {showSpotlight && (
          <div className="absolute inset-0 z-[500] flex items-start justify-center pt-16" style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setShowSpotlight(false)}>
            <div className="w-[560px] rounded-2xl overflow-hidden" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 24px 64px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)" }}
              onClick={e => e.stopPropagation()}>
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
                <I d={ic.search} s={20} c={c.textMuted} />
                <input autoFocus value={spotlightQuery} onChange={e => setSpotlightQuery(e.target.value)}
                  placeholder="Search apps, files, commands..."
                  className="flex-1 bg-transparent outline-none text-base"
                  style={{ color: c.text }} />
                {spotlightQuery && (
                  <button onClick={() => setSpotlightQuery("")} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>✕</button>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>ESC</span>
              </div>
              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {!spotlightQuery ? (
                  <>
                    <p className="px-5 py-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: c.textMuted }}>Recent & Suggested</p>
                    {[
                      { icon: ic.grid, label: "Dashboard", id: "dashboard", color: "#60A5FA" },
                      { icon: ic.activity, label: "System Monitor", id: "sysmon", color: "#34D399" },
                      { icon: ic.sparkle, label: "Alternus AI", id: "ai", color: c.accent },
                      { icon: ic.mail, label: "Mail", id: "mail", color: "#F97316" },
                      { icon: ic.newspaper, label: "News", id: "news", color: c.danger },
                    ].map(item => (
                      <button key={item.id} onClick={() => { openWinWithAI(item.id as WinId); setShowSpotlight(false); }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 transition-colors text-left"
                        onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                          <I d={item.icon} s={16} c={item.color} />
                        </div>
                        <span className="text-[13px]" style={{ color: c.text }}>{item.label}</span>
                        <span className="ml-auto text-[10px]" style={{ color: c.textMuted }}>App</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {/* App results */}
                    {(() => {
                      const q = spotlightQuery.toLowerCase();
                      const matched = dockApps.filter(a => a.label.toLowerCase().includes(q));
                      return matched.length > 0 ? (
                        <>
                          <p className="px-5 py-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: c.textMuted }}>Apps</p>
                          {matched.map(app => (
                            <button key={app.id} onClick={() => { openWinWithAI(app.id); setShowSpotlight(false); setSpotlightQuery(""); }}
                              className="w-full flex items-center gap-3 px-5 py-2.5 transition-colors text-left"
                              onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${app.color}20` }}>
                                <I d={app.icon} s={16} c={app.color} />
                              </div>
                              <span className="text-[13px]" style={{ color: c.text }}>{app.label}</span>
                              <span className="ml-auto text-[10px]" style={{ color: c.textMuted }}>↵ Open</span>
                            </button>
                          ))}
                        </>
                      ) : null;
                    })()}
                    {/* Calculation */}
                    {/^\d[\d\s\+\-\*\/\.\(\)]*$/.test(spotlightQuery) && (
                      <div className="px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.success}20` }}>
                          <I d={ic.calc} s={16} c={c.success} />
                        </div>
                        <div>
                          <p className="text-[11px]" style={{ color: c.textMuted }}>{spotlightQuery} =</p>
                          <p className="text-[18px] font-bold" style={{ color: c.text }}>
                            {(() => { try { return eval(spotlightQuery); } catch { return "?"; } })()}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* No results */}
                    {dockApps.filter(a => a.label.toLowerCase().includes(spotlightQuery.toLowerCase())).length === 0 &&
                      !/^\d[\d\s\+\-\*\/\.\(\)]*$/.test(spotlightQuery) && (
                      <div className="px-5 py-8 text-center">
                        <p className="text-[13px]" style={{ color: c.textMuted }}>No results for &ldquo;{spotlightQuery}&rdquo;</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="px-5 py-2 flex items-center gap-4 text-[10px]" style={{ borderTop: `1px solid ${c.border}`, color: c.textMuted }}>
                <span>↑↓ Navigate</span><span>↵ Open</span><span>ESC Dismiss</span>
                <div className="ml-auto flex gap-2">
                  {[["Ctrl+Space","Spotlight"],["Ctrl+W","Close"],["Ctrl+M","Min"],["Ctrl+H","Hide all"]].map(([k,l]) => (
                    <span key={k} className="flex items-center gap-1">
                      <span className="px-1 rounded font-mono" style={{ background: c.cardAlt }}>{k}</span>
                      <span>{l}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━ Spaces View (Mission Control) ━━━━ */}
        {showSpacesView && (
          <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-4" style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowSpacesView(false)}>
            <p className="text-[12px] uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Spaces</p>
            <div className="flex gap-4">
              {[1, 2, 3].map(n => (
                <button key={n} onClick={e => { e.stopPropagation(); setActiveSpace(n); setShowSpacesView(false); }}
                  className="flex flex-col items-center gap-2 transition-all"
                  style={{ transform: activeSpace === n ? "scale(1.05)" : "scale(1)" }}>
                  <div className="w-48 h-32 rounded-xl flex items-center justify-center"
                    style={{ background: activeSpace === n ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", border: `2px solid ${activeSpace === n ? c.accent : "rgba(255,255,255,0.1)"}`, backdropFilter: "blur(8px)" }}>
                    <div className="flex flex-wrap gap-1.5 p-2 justify-center">
                      {(n === 1 ? ["terminal", "code", "files"] : n === 2 ? ["aihub", "writer", "knowledge"] : ["mail", "tasks", "dashboard"]).map(id => (
                        <div key={id} className="w-6 h-6 rounded-md" style={{ background: `${(dockApps.find(a => a.id === id)?.color) ?? "#666"}30`, border: `1px solid ${(dockApps.find(a => a.id === id)?.color) ?? "#666"}50` }}>
                          <I d={(dockApps.find(a => a.id === id)?.icon) ?? ic.sparkle} s={12} c={(dockApps.find(a => a.id === id)?.color) ?? "#666"} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: activeSpace === n ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    Space {n}
                  </p>
                  <div className="flex gap-1">
                    {(n === 1 ? ["Dev", "Code"] : n === 2 ? ["AI", "Write"] : ["Org", "Mail"]).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Ctrl+1 · Ctrl+2 · Ctrl+3 to switch · ESC to dismiss</p>
          </div>
        )}

        {/* Apps button - top center, always visible */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowApps(!showApps)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: showApps ? c.accent : mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                border: `1px solid ${showApps ? c.accent : mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                color: showApps ? "#fff" : c.textSec,
                boxShadow: mode === "dark" ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
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
                  e.currentTarget.style.background = mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)";
                  e.currentTarget.style.borderColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
                  e.currentTarget.style.color = c.textSec;
                }
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showApps ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>

            {/* Spotlight + Spaces buttons beside apps button */}
            <div className="absolute -left-24 top-0 flex gap-2">
              <button onClick={() => setShowSpotlight(true)} title="Spotlight (Ctrl+K)"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, color: c.textSec, boxShadow: mode === "dark" ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; e.currentTarget.style.color = c.textSec; }}>
                <I d={ic.search} s={16} />
              </button>
            </div>
            <div className="absolute -right-24 top-0 flex gap-2">
              <button onClick={() => setShowSpacesView(true)} title="Spaces (Ctrl+1/2/3)"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all gap-0.5"
                style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, flexDirection: "column", boxShadow: mode === "dark" ? "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.background = c.accent; e.currentTarget.style.borderColor = c.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; }}>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="w-2 h-2 rounded-sm" style={{ background: activeSpace === n ? c.accent : c.border }} />
                  ))}
                </div>
                <span className="text-[8px]" style={{ color: c.textMuted }}>Space {activeSpace}</span>
              </button>
            </div>

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
                style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}
              >
                {dockApps.map(app => {
                  const dk = mode === "dark";
                  return (
                    <button
                      key={app.id}
                      onClick={() => { openWinWithAI(app.id); setShowApps(false); }}
                      className="flex-shrink-0 relative overflow-hidden transition-all duration-200"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        background: dk
                          ? `linear-gradient(145deg, ${app.color}18 0%, ${app.color}08 100%)`
                          : `linear-gradient(145deg, ${app.color}14 0%, ${app.color}06 100%)`,
                        border: `1px solid ${dk ? `${app.color}25` : `${app.color}18`}`,
                        boxShadow: dk
                          ? `0 2px 8px ${app.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`
                          : `0 2px 8px ${app.color}10, inset 0 1px 0 rgba(255,255,255,0.4)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.background = dk
                          ? `linear-gradient(145deg, ${app.color}35 0%, ${app.color}18 100%)`
                          : `linear-gradient(145deg, ${app.color}28 0%, ${app.color}12 100%)`;
                        el.style.borderColor = dk ? `${app.color}50` : `${app.color}35`;
                        el.style.boxShadow = dk
                          ? `0 4px 16px ${app.color}25, 0 0 20px ${app.color}15, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : `0 4px 16px ${app.color}18, 0 0 20px ${app.color}10, inset 0 1px 0 rgba(255,255,255,0.5)`;
                        el.style.transform = "translateY(-2px) scale(1.05)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.background = dk
                          ? `linear-gradient(145deg, ${app.color}18 0%, ${app.color}08 100%)`
                          : `linear-gradient(145deg, ${app.color}14 0%, ${app.color}06 100%)`;
                        el.style.borderColor = dk ? `${app.color}25` : `${app.color}18`;
                        el.style.boxShadow = dk
                          ? `0 2px 8px ${app.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`
                          : `0 2px 8px ${app.color}10, inset 0 1px 0 rgba(255,255,255,0.4)`;
                        el.style.transform = "translateY(0) scale(1)";
                      }}
                    >
                      {/* Gloss reflection — top half */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                        borderRadius: "13px 13px 0 0",
                        background: dk
                          ? "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
                        pointerEvents: "none",
                      }} />
                      {/* Light spot — top-left corner */}
                      <div style={{
                        position: "absolute", top: 2, left: 3, width: 12, height: 5,
                        borderRadius: "50%",
                        background: dk ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)",
                        filter: "blur(3px)",
                        pointerEvents: "none",
                      }} />
                      {/* Icon with glow */}
                      <div style={{ position: "relative", zIndex: 1, filter: `drop-shadow(0 0 4px ${app.color}40)` }}>
                        <I d={app.icon} s={19} c={app.color} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Center: Alternus branding + AI Button / Frame - only shown when no window is open */}
        {!wins.some(w => w.isOpen) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 1, pointerEvents: "none" }}>

          {/* ━━━━ AI Creation frame — frosted glass ━━━━ */}
          {aiCreation && (
            <div className="w-full max-w-2xl mb-6 px-4 pointer-events-auto">
              <div className="rounded-2xl overflow-hidden" style={{ background: mode === "dark" ? "rgba(44,44,44,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)", maxHeight: 320, overflowY: "auto", scrollbarWidth: "none" }}>
                <div className="px-6 py-5 text-[13px] leading-[1.8] relative" style={{ color: c.text }}>
                  <button onClick={() => { navigator.clipboard.writeText(aiCreation); }} className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors" style={{ background: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: c.textMuted }} title="Copy">
                    <I d={ic.fileText} s={12} c={c.textMuted} />
                  </button>
                  <div className="pr-8 space-y-2">
                    {aiCreation.split("\n").map((line, i) => {
                      const t = line.trim();
                      if (!t) return <div key={i} className="h-1" />;
                      if (t.endsWith(":")) return <p key={i} className="font-semibold mt-1" style={{ color: c.text }}>{t}</p>;
                      return <p key={i} style={{ color: c.textSec }}>{t}</p>;
                    })}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                    <button onClick={() => setAiCreation(null)} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ color: c.textMuted }}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ━━━━ Alternus gradient text ━━━━ */}
          <h1
            className="select-none bg-clip-text transition-all duration-500 ease-out"
            style={{
              fontSize: showAIFrame ? "3rem" : "clamp(5rem, 10vw, 9rem)",
              fontWeight: 600,
              marginBottom: showAIFrame ? 8 : 16,
              backgroundImage: `linear-gradient(90deg, ${c.textMuted} 0%, ${c.text} 50%, ${c.textMuted} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              opacity: showAIFrame ? 0.7 : 1,
            }}
          >
            Alternus<span style={{ fontSize: showAIFrame ? "0.6rem" : "1.2rem", verticalAlign: "super", WebkitTextFillColor: c.textMuted }}>©</span>
          </h1>

          {/* Welcome text — fades out when frame opens */}
          <p
            className="text-base font-light transition-all duration-400 ease-out"
            style={{
              color: c.textSec,
              opacity: showAIFrame ? 0 : 1,
              maxHeight: showAIFrame ? 0 : 40,
              marginBottom: showAIFrame ? 0 : 16,
              overflow: "hidden",
            }}
          >
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}. What would you like to create today?
          </p>

          {/* ━━━━ LARGE AI BUTTON — visible when frame is closed ━━━━ */}
          {!showAIFrame && !aiResponse && !aiAppResults.length && (
            <button
              onClick={() => { setShowAIFrame(true); setTimeout(() => aiFrameInputRef.current?.focus(), 350); }}
              className="group relative flex items-center justify-center transition-all duration-300 ease-out pointer-events-auto"
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: mode === "dark"
                  ? "linear-gradient(145deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.15) 50%, rgba(59,130,246,0.1) 100%)"
                  : "linear-gradient(145deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(59,130,246,0.05) 100%)",
                backdropFilter: "blur(20px) saturate(1.5)",
                WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                border: `1.5px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.2)"}`,
                boxShadow: mode === "dark"
                  ? "0 0 0 1px rgba(59,130,246,0.08), 0 4px 24px rgba(59,130,246,0.15), 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "0 0 0 1px rgba(59,130,246,0.06), 0 4px 24px rgba(59,130,246,0.1), 0 12px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
                cursor: "pointer",
                marginBottom: 12,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = mode === "dark"
                  ? "0 0 0 1px rgba(59,130,246,0.15), 0 6px 32px rgba(59,130,246,0.25), 0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 0 0 1px rgba(59,130,246,0.1), 0 6px 32px rgba(59,130,246,0.18), 0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = mode === "dark"
                  ? "0 0 0 1px rgba(59,130,246,0.08), 0 4px 24px rgba(59,130,246,0.15), 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "0 0 0 1px rgba(59,130,246,0.06), 0 4px 24px rgba(59,130,246,0.1), 0 12px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)";
              }}
            >
              <div className="absolute inset-0 rounded-[22px] opacity-40" style={{ background: `radial-gradient(circle at 50% 40%, ${mode === "dark" ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.15)"} 0%, transparent 70%)` }} />
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 0 8px rgba(59,130,246,0.4))" }}>
                <path d={ic.sparkle} fill={mode === "dark" ? "rgba(147,197,253,0.9)" : "rgba(59,130,246,0.85)"} />
              </svg>
            </button>
          )}

          {/* Label under button */}
          {!showAIFrame && !aiResponse && !aiAppResults.length && (
            <p className="text-[11px] font-medium tracking-wide" style={{ color: c.textMuted, opacity: 0.7 }}>Double-click or click to ask AI</p>
          )}

          {/* ━━━━ EXPANDED AI SEARCH FRAME — frosted glass ━━━━ */}
          <div
            className="w-full transition-all duration-500 ease-out pointer-events-auto"
            style={{
              maxWidth: showAIFrame || aiResponse || aiAppResults.length ? 680 : 0,
              opacity: showAIFrame || aiResponse || aiAppResults.length ? 1 : 0,
              transform: showAIFrame || aiResponse || aiAppResults.length ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
              pointerEvents: showAIFrame || aiResponse || aiAppResults.length ? "auto" : "none",
              padding: "0 16px",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="rounded-3xl overflow-hidden transition-all duration-500"
              style={{
                background: mode === "dark" ? "rgba(38,38,42,0.72)" : "rgba(255,255,255,0.68)",
                backdropFilter: "blur(40px) saturate(1.6)",
                WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                boxShadow: mode === "dark"
                  ? "0 0 0 0.5px rgba(255,255,255,0.04), 0 8px 48px rgba(0,0,0,0.45), 0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 0 0 0.5px rgba(0,0,0,0.02), 0 8px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {/* Glossy top highlight strip */}
              <div style={{
                height: 1,
                background: mode === "dark"
                  ? "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.08) 50%, transparent 90%)"
                  : "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.9) 50%, transparent 90%)",
              }} />

              {/* Search input row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.3))" }}>
                    <path d={ic.sparkle} fill={c.accent} />
                  </svg>
                </div>
                <input
                  ref={aiFrameInputRef}
                  className="flex-1 bg-transparent outline-none text-[15px] font-light"
                  style={{ color: c.text, caretColor: c.accent }}
                  placeholder="Search, ask, or create anything..."
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && aiInput.trim()) handleDesktopSearch();
                    if (e.key === "Escape") { setShowAIFrame(false); setShowAiFixMenu(false); if (!aiResponse) setAiInput(""); }
                  }}
                />
                {aiInput && (
                  <button onClick={() => setAiInput("")} className="p-1 rounded-md transition-colors" style={{ color: c.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <I d={ic.close} s={14} />
                  </button>
                )}
                {/* Chevron dropdown — AI fix options */}
                <div className="relative flex-shrink-0">
                  <button
                    className="flex items-center justify-center rounded-xl transition-all"
                    style={{
                      width: 36, height: 36,
                      background: showAiFixMenu
                        ? (mode === "dark" ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.12)")
                        : (mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                    }}
                    onClick={() => setShowAiFixMenu(p => !p)}
                    title="AI fix options"
                    onMouseEnter={e => { if (!showAiFixMenu) e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
                    onMouseLeave={e => { if (!showAiFixMenu) e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                  >
                    <I d={ic.chevD} s={15} c={showAiFixMenu ? c.accentText : c.textMuted} />
                  </button>
                  {showAiFixMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAiFixMenu(false)} />
                      <div className="absolute top-full mt-2 right-0 w-56 rounded-2xl py-2 shadow-2xl z-20"
                        style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                        <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: c.textMuted }}>Fix with AI</p>
                        {[
                          { label: "Fix grammar", icon: ic.pen, prefix: "Fix the grammar in: " },
                          { label: "Improve writing", icon: ic.edit3, prefix: "Improve this text: " },
                          { label: "Summarize", icon: ic.alignLeft, prefix: "Summarize this: " },
                          { label: "Make shorter", icon: ic.minimize, prefix: "Make this shorter: " },
                          { label: "Make longer", icon: ic.plus, prefix: "Expand this text: " },
                          { label: "Fix code errors", icon: ic.code, prefix: "Fix the code errors in: " },
                          { label: "Translate to English", icon: ic.globe, prefix: "Translate to English: " },
                          { label: "Explain this", icon: ic.sparkle, prefix: "Explain this: " },
                        ].map(opt => (
                          <button key={opt.label}
                            onClick={() => {
                              setAiInput(opt.prefix + (aiInput || ""));
                              setShowAiFixMenu(false);
                              setTimeout(() => aiFrameInputRef.current?.focus(), 50);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] w-full text-left transition-colors"
                            style={{ color: c.textSec }}
                            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <I d={opt.icon} s={14} c={c.textMuted} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => { if (aiInput.trim()) handleDesktopSearch(); else setShowAIFrame(false); }}
                  className="flex items-center justify-center rounded-xl transition-all"
                  style={{
                    width: 36, height: 36,
                    background: aiInput.trim() ? "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" : mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    boxShadow: aiInput.trim() ? "0 2px 12px rgba(59,130,246,0.3)" : "none",
                  }}
                  onMouseEnter={e => { if (!aiInput.trim()) e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { if (!aiInput.trim()) e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; }}
                >
                  <I d={aiInput.trim() ? ic.send : ic.close} s={15} c={aiInput.trim() ? "#fff" : c.textMuted} />
                </button>
              </div>

              {/* Quick suggestion chips — only when no response */}
              {!aiResponse && !aiAppResults.length && showAIFrame && (
                <div className="px-5 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Open Browser", icon: ic.globe, q: "browser" },
                      { label: "Write Code", icon: ic.code, q: "code" },
                      { label: "Play Music", icon: ic.music, q: "play music" },
                      { label: "File Search", icon: ic.search, q: "find files" },
                      { label: "AI Chat", icon: ic.sparkle, q: "open ai chat" },
                    ].map((chip, i) => (
                      <button key={i} onClick={() => { handleDesktopSearch(chip.q); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all"
                        style={{ background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", color: c.textSec, border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)"; e.currentTarget.style.borderColor = mode === "dark" ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"; e.currentTarget.style.color = c.accentText; }}
                        onMouseLeave={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; e.currentTarget.style.color = c.textSec; }}>
                        <I d={chip.icon} s={12} />{chip.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}` }}>
                    <span className="text-[10px]" style={{ color: c.textMuted, opacity: 0.6 }}><kbd className="px-1.5 py-0.5 rounded" style={{ background: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", fontSize: 9 }}>Enter</kbd> to search</span>
                    <span className="text-[10px]" style={{ color: c.textMuted, opacity: 0.6 }}><kbd className="px-1.5 py-0.5 rounded" style={{ background: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", fontSize: 9 }}>Esc</kbd> to close</span>
                  </div>
                </div>
              )}

              {/* App search results — glass cards inside frame */}
              {aiAppResults.length > 0 && (
                <div className="px-5 pb-4 space-y-2">
                  <div className="h-px w-full mb-1" style={{ background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
                  {aiAppResults.map((app, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all"
                      style={{ background: mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"; }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: mode === "dark" ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)" }}>
                        <I d={app.icon} s={20} c={c.accentText} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: c.text }}>{app.title}</p>
                        <p className="text-xs" style={{ color: c.textMuted }}>{app.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { openWin(app.id); setAiAppResults([]); setShowAIFrame(false); }}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", color: "#fff", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }}>
                          Open
                        </button>
                        <button onClick={() => setAiAppResults(prev => prev.filter((_, j) => j !== i))}
                          className="px-3 py-1.5 rounded-xl text-xs transition-colors" style={{ color: c.textMuted }}
                          onMouseEnter={e => (e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Response — inside the glass frame */}
              {aiResponse && (
                <div className="px-5 pb-5">
                  <div className="h-px w-full mb-4" style={{ background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
                  <div className="relative text-[13px] leading-[1.75]" style={{ color: c.text }}>
                    <button onClick={() => { navigator.clipboard.writeText(aiResponse); }} className="absolute top-0 right-0 p-1.5 rounded-lg transition-all" style={{ background: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: c.textMuted }} title="Copy">
                      <I d={ic.fileText} s={12} c={c.textMuted} />
                    </button>
                    <pre className="whitespace-pre-wrap font-sans pr-8" style={{ maxHeight: 220, overflowY: "auto", scrollbarWidth: "none" }}>{aiResponse}</pre>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {aiActions.map((a, i) => (
                        <button key={i} onClick={() => { openWin(a.action); setAiResponse(null); setAiActions([]); setAiInput(""); setShowAIFrame(false); }}
                          className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 100%)", color: c.accentText, border: `1px solid ${mode === "dark" ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"}` }}
                          onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.18) 100%)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 100%)"; }}>
                          {a.label}
                        </button>
                      ))}
                      <button onClick={() => { setAiResponse(null); setAiActions([]); setAiInput(""); setShowAIFrame(false); }}
                        className="px-3 py-1.5 rounded-xl text-[11px] transition-colors" style={{ color: c.textMuted }}
                        onMouseEnter={e => { e.currentTarget.style.color = c.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

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
            onSnapPreview={zone => setSnapPreview(zone)}
            onFileDrop={draggedFile && (w.id === "terminal" || w.id === "notes" || w.id === "word" || w.id === "code") ? (name) => {
              setDraggedFile(null);
              // Notify user with a system modal
              setSystemModal({ type: "info", title: "File Dropped", message: `"${name}" opened in ${w.title}.` });
              setTimeout(() => setSystemModal(null), 2000);
            } : undefined}
            onOpenApp={openWinWithAI}
            mode={mode}
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
              <div className="flex gap-3 px-6 py-4 rounded-2xl" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
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
            <div className="w-80 p-5 rounded-2xl" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
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
            <div className="w-[320px] rounded-2xl overflow-hidden" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }} onClick={e => e.stopPropagation()}>
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
            style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${c.accent}30`, boxShadow: `0 0 20px ${c.accent}15, 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 ${mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)"}` }}>
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
            <div className="w-96 p-5 rounded-2xl" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
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
            <div className="w-[400px] max-h-[500px] rounded-2xl flex flex-col" style={{ background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
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
            style={{ left: contextMenu.x, top: contextMenu.y, background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)" }}
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
                { icon: ic.note, label: "New Note", action: () => { openWin("notes"); setContextMenu(null); } },
                { icon: ic.folder, label: "New Folder", action: () => { openWin("files"); setContextMenu(null); } },
                { icon: ic.fileText, label: "New Document", action: () => { openWin("word"); setContextMenu(null); } },
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
            <div className="my-1 mx-3 h-px" style={{ background: c.border }} />
            <div className="py-1 px-1.5">
              {[
                { icon: ic.image, label: "Change wallpaper", action: () => { setWallpaper(p => (p + 1) % 6); setContextMenu(null); } },
                { icon: ic.monitor, label: "Display settings", action: () => { openWin("settings"); setContextMenu(null); } },
                { icon: ic.terminal, label: "Open Terminal", action: () => { openWin("terminal"); setContextMenu(null); }, shortcut: "" },
                { icon: ic.search, label: "Spotlight", action: () => { setShowSpotlight(true); setContextMenu(null); }, shortcut: "Ctrl+K" },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={item.icon} s={14} c={c.textMuted} />
                  <span className="flex-1 text-[11px]" style={{ color: c.text }}>{item.label}</span>
                  {(item as {shortcut?: string}).shortcut && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>{(item as {shortcut?: string}).shortcut}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ━━━━ AI Full Chat Overlay ━━━━ */}
        {showAiChat && (
          <div className="absolute inset-0 z-[200] flex" style={{ background: mode === "dark" ? "rgba(36,36,36,0.6)" : "rgba(242,242,244,0.6)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }}>
            {/* Sidebar */}
            <div className="w-[220px] flex-shrink-0 flex flex-col" style={{ background: mode === "dark" ? "rgba(44,44,44,0.5)" : "rgba(255,255,255,0.5)", borderRight: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <button className="w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  style={{ background: c.accent, color: "#fff" }}
                  onClick={() => setAiChatMsgs([])}>
                  + New chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>
                {aiChatHistory.map((h, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 rounded-lg text-[11px] truncate transition-colors"
                    style={{ color: c.text }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    {h.title}
                  </button>
                ))}
              </div>
              <div className="px-2 py-2 space-y-0.5" style={{ borderTop: `1px solid ${c.border}` }}>
                {[
                  { icon: ic.moon, label: mode === "dark" ? "Light mode" : "Dark mode" },
                  { icon: ic.user, label: "My account" },
                  { icon: ic.settings, label: "Settings" },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-colors"
                    style={{ color: c.textSec }}
                    onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <I d={item.icon} s={13} c={c.textMuted} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2">
                <I d={ic.sparkle} s={16} c={c.accent} />
                <span className="text-sm font-semibold" style={{ color: c.text }}>Alternus AI</span>
              </div>
              <button onClick={() => setShowAiChat(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: c.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <I d={ic.close} s={16} c={c.textMuted} />
              </button>
            </div>
            {/* Chat area */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {aiChatMsgs.length === 0 ? (
                <div className="flex flex-col items-center justify-end h-full pb-6">
                  {/* Suggestions */}
                  <div className="grid grid-cols-3 gap-3 max-w-lg mb-10">
                    {[
                      { title: "Examples", items: ["\"Explain quantum computing\"", "\"Write a birthday message\"", "\"Create a product description\""] },
                      { title: "Capabilities", items: ["Remembers conversation", "Follow-up corrections", "Declines inappropriate requests"] },
                      { title: "Limitations", items: ["May generate incorrect info", "May produce biased content", "Limited knowledge after 2025"] },
                    ].map((col, ci) => (
                      <div key={ci} className="flex flex-col items-center gap-2">
                        <p className="text-[10px] font-semibold" style={{ color: c.text }}>{col.title}</p>
                        {col.items.map((item, ii) => (
                          <div key={ii} className="w-full px-3 py-2 rounded-xl text-[9px] text-center cursor-pointer transition-colors"
                            style={{ background: c.cardAlt, color: c.textSec }}
                            onMouseEnter={e => { e.currentTarget.style.background = c.border; }}
                            onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {/* Alternus branding */}
                  <h1 className="text-6xl font-semibold mb-2 select-none bg-clip-text"
                    style={{ backgroundImage: `linear-gradient(90deg, ${c.textMuted} 0%, ${c.text} 50%, ${c.textMuted} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
                    Alternus<span className="text-sm align-super" style={{ WebkitTextFillColor: c.textMuted }}>©</span>
                  </h1>
                  <p className="text-sm font-light" style={{ color: c.textSec }}>
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}. What would you like to create today?
                  </p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
                  {aiChatMsgs.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-[1.7]"
                        style={{ background: msg.role === "user" ? c.accent : c.cardAlt, color: msg.role === "user" ? "#fff" : c.text }}>
                        {msg.role === "ai" ? (
                          <div className="space-y-2">
                            {msg.text.split("\n").map((line, li) => {
                              const t = line.trim();
                              if (!t) return <div key={li} className="h-1" />;
                              if (t.endsWith(":")) return <p key={li} className="font-semibold">{t}</p>;
                              if (t.startsWith("•")) return <div key={li} className="flex gap-2 pl-1"><span style={{ color: msg.role === "ai" ? c.accent : "#fff" }}>•</span><span>{t.slice(1).trim()}</span></div>;
                              return <p key={li}>{t}</p>;
                            })}
                          </div>
                        ) : msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Input at bottom */}
            <div className="px-6 pb-5 pt-2 flex-shrink-0">
              <div className="max-w-2xl mx-auto flex items-center gap-2 pl-4 pr-2 py-2 rounded-2xl"
                style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <input
                  className="flex-1 bg-transparent outline-none text-sm py-1.5"
                  style={{ color: c.text }}
                  placeholder="Ask anything..."
                  value={aiChatInput}
                  onChange={e => setAiChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && aiChatInput.trim()) {
                      const userMsg = aiChatInput.trim();
                      setAiChatMsgs(prev => [...prev, { role: "user", text: userMsg }]);
                      setAiChatInput("");
                      setTimeout(() => {
                        const q = userMsg.toLowerCase();
                        let response = `Here is my response to "${userMsg}":\n\nThis is a detailed, well-structured answer from Alternus AI. The content is tailored to your specific request with clear formatting and professional language.\n\nKey points:\n\n• First important insight about your query\n• Second relevant detail with context\n• Third practical recommendation\n\nLet me know if you need more details or a different approach.`;
                        if (q.includes("hello") || q.includes("hi")) response = "Hello! I'm Alternus AI. How can I help you today?";
                        setAiChatMsgs(prev => [...prev, { role: "ai", text: response }]);
                      }, 500);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (!aiChatInput.trim()) return;
                    const userMsg = aiChatInput.trim();
                    setAiChatMsgs(prev => [...prev, { role: "user", text: userMsg }]);
                    setAiChatInput("");
                    setTimeout(() => {
                      setAiChatMsgs(prev => [...prev, { role: "ai", text: `Here is my response to "${userMsg}":\n\nA well-crafted answer from Alternus AI.\n\n• Key insight one\n• Key insight two\n• Key insight three` }]);
                    }, 500);
                  }}
                  className="p-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: c.accent }}
                >
                  <I d={ic.send} s={14} c="#fff" />
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* ━━━━ AI Notification Sidebar ━━━━ */}
        <div
          className="absolute top-0 right-0 h-full z-[100] transition-colorsduration-300 ease-in-out"
          style={{
            width: 340,
            transform: showNotifications ? "translateX(0)" : "translateX(100%)",
            background: mode === "dark" ? "rgba(44,44,44,0.6)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            borderLeft: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            boxShadow: showNotifications ? (mode === "dark" ? "-4px 0 32px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.04)" : "-4px 0 32px rgba(0,0,0,0.08), inset 1px 0 0 rgba(255,255,255,0.5)") : "none",
          }}
        >
          <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <I d={ic.bell} s={14} c={c.accentText} />
              <p className="text-sm font-semibold" style={{ color: c.text }}>Notification Center</p>
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
          {/* Category tabs */}
          <div className="flex px-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
            {["All", "AI", "Apps", "System"].map(tab => (
              <button key={tab} className="px-3 py-2 text-[10px] font-medium transition-colors"
                style={{ color: tab === "All" ? c.text : c.textMuted, borderBottom: tab === "All" ? `2px solid ${c.accent}` : "2px solid transparent", marginBottom: "-1px" }}>
                {tab}
              </button>
            ))}
            <button onClick={() => setAiNotifications([])} className="ml-auto px-2 py-2 text-[9px] transition-colors" style={{ color: c.textMuted }}>
              Clear all
            </button>
          </div>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto" style={{ height: "calc(100% - 96px)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
