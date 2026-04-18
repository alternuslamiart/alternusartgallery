"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alternus OS — AI-Powered Desktop Operating System
// Fixed viewport, windowed apps, no scrolling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ThemeMode = "dark" | "light";
type WinId = "ai" | "terminal" | "code" | "files" | "settings" | "music" | "weather" | "calendar" | "notes" | "browser" | "store" | "movies" | "word" | "clock" | "calculator" | "accounts" | "downloads" | "controlpanel" | "studio" | "recovery" | "news" | "dashboard" | "tasks" | "mail" | "monaco" | "aihub" | "aivoice" | "knowledge" | "sysmon" | "business" | "agent";

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

interface OSAIAction {
  type: "open_app" | "close_app" | "minimize_app" | "send_notification";
  payload: Record<string, string>;
}

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
    bg: "#1C1D22",
    surface: "#25262D",
    card: "#2A2B33",
    cardAlt: "#31323B",
    border: "#383942",
    text: "#F0F2F8",
    textSec: "#A4A8B8",
    textMuted: "#6B6F82",
    accent: "#4F8EF7",
    accentSoft: "rgba(79,142,247,0.13)",
    accentText: "#6EA5FA",
    success: "#3DD68C",
    successSoft: "rgba(61,214,140,0.13)",
    warning: "#F5B73B",
    warningSoft: "rgba(245,183,59,0.13)",
    danger: "#F47272",
    purple: "#A78BFA",
    purpleSoft: "rgba(167,139,250,0.13)",
    titlebar: "#25262D",
    titlebarBorder: "#383942",
  },
  light: {
    bg: "#F5F6FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardAlt: "#F0F1F5",
    border: "#E4E5EC",
    text: "#1A1C28",
    textSec: "#5A5E72",
    textMuted: "#8B8FA5",
    accent: "#4F8EF7",
    accentSoft: "rgba(79,142,247,0.10)",
    accentText: "#3672D9",
    success: "#22C07A",
    successSoft: "rgba(34,192,122,0.10)",
    warning: "#E5A117",
    warningSoft: "rgba(229,161,23,0.10)",
    danger: "#E85454",
    purple: "#8B5CF6",
    purpleSoft: "rgba(139,92,246,0.10)",
    titlebar: "#F0F1F5",
    titlebarBorder: "#DCDEE6",
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
let _gradId = 0;
function I({ d, s = 16, c, w, f, grad }: { d: string; s?: number; c?: string; w?: number; f?: boolean; grad?: [string, string] }) {
  const gid = grad ? `ig${++_gradId}` : null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={f ? (gid ? `url(#${gid})` : (c || "currentColor")) : "none"} stroke={f ? "none" : (c || "currentColor")} strokeWidth={f ? 0 : (w || 2)} strokeLinecap="round" strokeLinejoin="round">
      {grad && gid && (
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad[0]} />
            <stop offset="100%" stopColor={grad[1]} />
          </linearGradient>
        </defs>
      )}
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
  chevU: "M18 15l-6-6-6 6",
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
  briefcase: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M2 13h20",
  dollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  trendingUp: "M23 6l-9.5 9.5-5-5L1 18",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  fileInvoice: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2",
  barChart: "M18 20V10M12 20V4M6 20v-6",
  copy: "M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2zM4 8v12a2 2 0 002 2h8",
  thumbUp: "M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-7 11H4a2 2 0 01-2-2v-7a2 2 0 012-2h3",
  thumbDown: "M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17",
  paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  check: "M20 6L9 17l-5-5",
};

// ━━━━ Fill Icon Paths (closed shapes for filled rendering) ━━━━━━━━━━━━━━━━━━
const icFill: Record<string, string> = {
  terminal:     "M3 3h18c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm2.29 4.29a1 1 0 00-1.42 1.42L6.59 11l-2.7 2.71a1 1 0 001.42 1.41l3.41-3.41a1 1 0 000-1.41l-3.41-3.41zM12 14a1 1 0 000 2h5a1 1 0 000-2h-5z",
  code:         "M14.447 3.026a.5.5 0 01.235.32l3.5 14a.5.5 0 01-.966.256L13.757 4.5H10.5l.016.065-3.507 14a.5.5 0 01-.966-.256l3.5-14a.5.5 0 01.484-.37h4a.5.5 0 01.42.087zM3.854 8.146a.5.5 0 010 .708L1.707 11l2.147 2.146a.5.5 0 01-.708.708l-2.5-2.5a.5.5 0 010-.708l2.5-2.5a.5.5 0 01.708 0zm16.292 0a.5.5 0 01.708 0l2.5 2.5a.5.5 0 010 .708l-2.5 2.5a.5.5 0 01-.708-.708L22.293 11l-2.147-2.146a.5.5 0 010-.708z",
  files:        "M3 7a2 2 0 012-2h4.586A2 2 0 0111 5.586L13 7.414A2 2 0 0113.414 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  browser:      "M12 2a10 10 0 100 20A10 10 0 0012 2zm1 5v5.586l3.707 3.707a1 1 0 01-1.414 1.414l-4-4A1 1 0 0111 13V7a1 1 0 012 0z",
  store:        "M1 1.5A.5.5 0 011.5 1h1a.5.5 0 01.485.379L3.89 4h18.01a.5.5 0 01.489.598l-2 10a.5.5 0 01-.49.402H5a.5.5 0 01-.49-.402L2.01 2H1.5a.5.5 0 01-.5-.5zM6 20a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z",
  movies:       "M2 4a2 2 0 00-2 2v12a2 2 0 002 2h20a2 2 0 002-2V6a2 2 0 00-2-2H2zm6 2v2H4V6h4zm2 0h4v2h-4V6zm6 0h4v2h-4V6zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v2H4v-2zm6 0h4v2h-4v-2zm6 0h4v2h-4v-2z",
  music:        "M9 3v11.5a3.5 3.5 0 10-1 2.5V11l10-2v6.5a3.5 3.5 0 10-1 2.5V5L9 3z",
  weather:      "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  calendar:     "M3 6a2 2 0 012-2h14a2 2 0 012 2v2H3V6zM3 10h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10zm5-6a1 1 0 012 0v1a1 1 0 01-2 0V4zm8 0a1 1 0 012 0v1a1 1 0 01-2 0V4z",
  notes:        "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 13h6a1 1 0 010 2H9a1 1 0 010-2zm0-4h2a1 1 0 010 2H9a1 1 0 010-2zm0 8h4a1 1 0 010 2H9a1 1 0 010-2z",
  word:         "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8a1 1 0 010 2H8a1 1 0 010-2zm0-4h8a1 1 0 010 2H8a1 1 0 010-2z",
  downloads:    "M4 17a1 1 0 011-1h14a1 1 0 010 2H5a1 1 0 01-1-1zM12 3a1 1 0 00-1 1v8.586L8.707 10.29a1 1 0 10-1.414 1.42l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.42L13 12.586V4a1 1 0 00-1-1z",
  calculator:   "M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm1 2v3h14V4H5zm0 5v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2zm4 0v6h-2v-6h2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm-4 4v2h2v-2H5zm4 0v2h2v-2H9z",
  studio:       "M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  settings:     "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z",
  controlpanel: "M2 3h20a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm16 18H6a1 1 0 010-2h12a1 1 0 010 2zm-6-4v-2a1 1 0 012 0v2a1 1 0 01-2 0z",
  recovery:     "M12 1l9 4v7c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l9-4zm0 6a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm0 7a1 1 0 100 2 1 1 0 000-2z",
  news:         "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v3h8V6H4zm10 0v8h6V6h-6zM4 11v2h8v-2H4zm0 4v2h8v-2H4z",
  dashboard:    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  tasks:        "M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11a1 1 0 010 2H5v14h14v-7a1 1 0 012 0zm-9.293-.293l7.5-7.5a1 1 0 011.414 1.414l-8.207 8.207a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293z",
  mail:         "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 9L4.8 7h14.4L12 13zm8 5V8.9l-8 5.5-8-5.5V18h16z",
  monaco:       "M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm13.5 5.5a.5.5 0 00-.854-.354L12 11.793l-3.646-3.647a.5.5 0 00-.708.708L11.293 12l-3.647 3.646a.5.5 0 00.708.708L12 12.707l3.646 3.647a.5.5 0 00.708-.708L12.707 12l3.647-3.646a.5.5 0 00.146-.354z",
  aihub:        "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  imagegen:     "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 7a2 2 0 110 4 2 2 0 010-4zM5 19l4-6 3 4 2-3 5 5H5z",
  aivoice:      "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM5 11a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm7 9v-2a9 9 0 009-9h-2a7 7 0 01-14 0H3a9 9 0 009 9v2z",
  writer:       "M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM12 20h9a1 1 0 010 2h-9a1 1 0 010-2z",
  knowledge:    "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  sysmon:       "M2 12h3l3 8 4-16 3 8h7",
  business:     "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM18 14a4 4 0 100 8 4 4 0 000-8z",
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
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
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
    ? { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, zIndex: win.zIndex }
    : { position: "absolute", top: win.y, left: win.x, width: win.w, height: win.h, zIndex: win.zIndex };

  const isDark = (mode || "dark") === "dark";

  return (
    <div
      style={{
        ...style,
        background: isAI ? "transparent" : isDark ? "rgba(30,31,38,0.72)" : "rgba(255,255,255,0.68)",
        backdropFilter: isAI ? "none" : "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: isAI ? "none" : "blur(28px) saturate(1.5)",
        border: isAI ? "none" : isDragOver ? `1px solid ${c.accent}` : `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}`,
        borderRadius: 18,
        boxShadow: isAI ? "none" : isDark
          ? "0 12px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 12px 40px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.15s ease",
        pointerEvents: isAI ? "none" : "auto",
      }}
      onMouseEnter={e => { if (!isAI) { e.currentTarget.style.boxShadow = isDark ? "0 16px 56px rgba(0,0,0,0.45), 0 3px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)" : "0 16px 56px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)"; } }}
      onMouseLeave={e => { if (!isAI) { e.currentTarget.style.boxShadow = isDark ? "0 12px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 12px 40px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)"; } }}
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
      <div style={{ flex: 1, overflow: "hidden", position: "relative", margin: isAI ? 0 : "0 6px 6px 6px", pointerEvents: isAI ? "auto" : undefined }}>
        <div style={{ background: isAI ? "transparent" : isDark ? "rgba(37,38,45,0.6)" : "rgba(255,255,255,0.5)", borderRadius: isAI ? 0 : 14, border: isAI ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`, height: "100%", overflow: "auto", position: "relative" }}>
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

function AIChat({ c, mode, setMode, onOpenApp, onExecuteAIActions, osContext }: {
  c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  onOpenApp?: (id: WinId) => void;
  onExecuteAIActions?: (actions: OSAIAction[]) => void;
  osContext?: { openApps: string[]; theme: "dark" | "light" };
}) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [toast, setToast] = useState<{ text: string; color: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);



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
    const aiMsgId = Date.now().toString();
    setMsgs(p => [...p, { role: "ai", text: "" }]);

    try {
      const conversationHistory = msgs.map(msg => ({
        role: msg.role === "ai" ? "assistant" as const : "user" as const,
        content: msg.text,
      })).slice(-10);

      const response = await fetch("/api/os/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: m,
          conversationHistory,
          osContext: osContext || { openApps: [], theme: mode },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let actionsProcessed = false;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (!actionsProcessed) {
          const newlineIdx = buffer.indexOf("\n");
          if (newlineIdx !== -1) {
            const jsonLine = buffer.slice(0, newlineIdx);
            const rest = buffer.slice(newlineIdx + 1);
            buffer = "";
            try {
              const { actions } = JSON.parse(jsonLine) as { actions: OSAIAction[] };
              if (actions && actions.length > 0 && onExecuteAIActions) {
                onExecuteAIActions(actions);
              }
            } catch { /* ignore */ }
            actionsProcessed = true;
            fullText += rest;
          }
        } else {
          fullText += buffer;
          buffer = "";
        }

        if (fullText) {
          setMsgs(p => {
            const updated = [...p];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "ai") {
              updated[lastIdx] = { ...updated[lastIdx], text: fullText };
            }
            return updated;
          });
        }
      }

      void aiMsgId; // suppress unused var warning
    } catch {
      setMsgs(p => {
        const updated = [...p];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === "ai") {
          updated[lastIdx] = { ...updated[lastIdx], text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." };
        }
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const newChat = () => {
    setMsgs([]);
    setInput("");
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

          </>
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
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2 flex-shrink-0" style={{ background: "#101014", borderBottom: "1px solid #1E1E28" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34D399, #059669)" }}>
          <I d={ic.terminal} s={13} c="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold" style={{ color: "#A0D9A0" }}>Terminal</p>
          <p className="text-[8px]" style={{ color: "#5A6A5A" }}>AI-powered shell environment</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
          <span className="text-[8px]" style={{ color: "#5A6A5A" }}>bash</span>
        </div>
      </div>
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
  const [activePlaylist, setActivePlaylist] = useState("Focus");
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(75);
  const playlists: Record<string, { name: string; artist: string; dur: string }[]> = {
    Focus: [
      { name: "Focus Flow", artist: "Ambient AI", dur: "3:42" },
      { name: "Deep Work", artist: "Neural Beats", dur: "4:15" },
      { name: "Code Session", artist: "Synthwave", dur: "5:01" },
      { name: "Creative Space", artist: "Lo-Fi Engine", dur: "3:58" },
      { name: "Night Coding", artist: "Chill Pulse", dur: "4:33" },
    ],
    Chill: [
      { name: "Sunset Drive", artist: "Lo-Fi Engine", dur: "4:22" },
      { name: "Rainy Afternoon", artist: "Ambient AI", dur: "5:15" },
      { name: "Coffee Break", artist: "Jazz Bytes", dur: "3:48" },
      { name: "Ocean Waves", artist: "Nature Sound", dur: "6:00" },
    ],
    Energy: [
      { name: "Power Up", artist: "Synthwave", dur: "3:20" },
      { name: "Electric Rush", artist: "Neural Beats", dur: "4:05" },
      { name: "Neon City", artist: "Retro Pulse", dur: "3:55" },
    ],
  };
  const tracks = playlists[activePlaylist];
  const totalDur = tracks.reduce((s, t) => { const [m, sec] = t.dur.split(":").map(Number); return s + m * 60 + sec; }, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F472B6, #DB2777)", boxShadow: "0 3px 12px rgba(244,114,182,0.3)" }}>
          <I d={ic.music} s={16} c="#fff" />
        </div>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold" style={{ color: c.text }}>Music</h3>
          <p className="text-[10px]" style={{ color: c.textMuted }}>Curated playlists and ambient sounds</p>
        </div>
        <div className="flex items-center gap-1.5">
          {playing && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F472B6", boxShadow: "0 0 6px rgba(244,114,182,0.5)" }} />}
          <span className="text-[9px] font-medium" style={{ color: c.textMuted }}>{tracks.length} tracks</span>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
      {/* Sidebar — playlists */}
      <div className="w-[140px] flex-shrink-0 flex flex-col py-3 border-r" style={{ borderColor: c.border, background: c.surface }}>
        <p className="px-3 text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>Playlists</p>
        {Object.keys(playlists).map(pl => (
          <button key={pl} onClick={() => { setActivePlaylist(pl); setCurrent(0); }}
            className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium transition-colors"
            style={{ background: activePlaylist === pl ? c.cardAlt : "transparent", color: activePlaylist === pl ? c.text : c.textMuted }}>
            <I d={ic.music} s={12} /> {pl}
            <span className="ml-auto text-[9px]" style={{ color: c.textMuted }}>{playlists[pl].length}</span>
          </button>
        ))}
        <div className="h-px mx-3 my-2" style={{ background: c.border }} />
        <p className="px-3 text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>Library</p>
        {["Liked Songs", "Recent", "Downloads"].map(item => (
          <button key={item} className="flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors" style={{ color: c.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <I d={item === "Liked Songs" ? ic.sparkle : item === "Recent" ? ic.clock : ic.download} s={12} /> {item}
          </button>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Playlist header */}
        <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: c.accentSoft }}>
            <I d={ic.music} s={20} c={c.accent} />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: c.text }}>{activePlaylist}</p>
            <p className="text-[10px]" style={{ color: c.textMuted }}>{tracks.length} tracks · {Math.floor(totalDur / 60)}m {totalDur % 60}s</p>
          </div>
          <button className="ml-auto w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: c.accent, boxShadow: `0 0 16px ${c.accent}50` }} onClick={() => setPlaying(!playing)}>
            <I d={playing ? ic.pause : ic.play} s={14} c="#fff" />
          </button>
        </div>
        {/* Track list */}
        <div className="flex-1 overflow-y-auto py-1 px-2" style={{ scrollbarWidth: "none" }}>
          {tracks.map((t, i) => (
            <button key={i} onClick={() => { setCurrent(i); setPlaying(true); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-all rounded-lg mb-0.5"
              style={{ background: i === current ? c.accentSoft : "transparent", border: i === current ? `1px solid ${c.accent}30` : "1px solid transparent" }}
              onMouseEnter={e => { if (i !== current) e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { if (i !== current) e.currentTarget.style.background = "transparent"; }}>
              <span className="w-5 text-center text-[10px] font-mono" style={{ color: i === current ? c.accent : c.textMuted }}>{i === current && playing ? "▶" : i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: i === current ? c.accentText : c.text }}>{t.name}</p>
                <p className="text-[10px]" style={{ color: c.textMuted }}>{t.artist}</p>
              </div>
              <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>{t.dur}</span>
            </button>
          ))}
        </div>
        {/* Now Playing bar */}
        <div className="flex-shrink-0 px-4 pt-2.5 pb-3" style={{ borderTop: `1px solid ${c.border}`, background: c.surface }}>
          <div className="w-full h-1 rounded-full mb-2.5" style={{ background: c.cardAlt }}>
            <div className="h-full rounded-full" style={{ background: c.accent, width: playing ? "45%" : "0%", transition: "width 0.3s" }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{tracks[current].name}</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>{tracks[current].artist}</p>
            </div>
            <button onClick={() => setShuffle(!shuffle)} style={{ color: shuffle ? c.accent : c.textMuted }}><I d={ic.refresh} s={13} /></button>
            <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p > 0 ? p - 1 : tracks.length - 1)}><I d={ic.skip} s={14} /></button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: c.accent, boxShadow: `0 0 16px ${c.accent}50` }} onClick={() => setPlaying(!playing)}>
              <I d={playing ? ic.pause : ic.play} s={14} c="#fff" />
            </button>
            <button style={{ color: c.textSec }} onClick={() => setCurrent(p => p < tracks.length - 1 ? p + 1 : 0)}><I d={ic.skip} s={14} /></button>
            <button onClick={() => setRepeat(!repeat)} style={{ color: repeat ? c.accent : c.textMuted }}><I d={ic.refresh} s={13} /></button>
            <div className="flex items-center gap-1 ml-1">
              <I d={ic.volume} s={12} c={c.textMuted} />
              <div className="w-16 h-1 rounded-full relative cursor-pointer" style={{ background: c.border }}
                onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100)); }}>
                <div className="h-full rounded-full" style={{ width: `${volume}%`, background: c.accent }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function CalendarApp({ c }: { c: typeof palette.dark }) {
  const [viewDate, setViewDate] = useState(new Date());
  const now = new Date();
  const [sel, setSel] = useState(now.getDate());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events] = useState([
    { id: 1, title: "Team Standup", day: 9, time: "09:00", duration: "30m", color: "#3B82F6", recurring: true },
    { id: 2, title: "Design Review", day: 9, time: "14:00", duration: "1h", color: "#8B5CF6", recurring: false },
    { id: 3, title: "Client Call — Acme", day: 11, time: "11:00", duration: "45m", color: "#F97316", recurring: false },
    { id: 4, title: "Sprint Planning", day: 14, time: "10:00", duration: "2h", color: "#10B981", recurring: true },
    { id: 5, title: "Lunch with Sarah", day: 15, time: "12:30", duration: "1h", color: "#EC4899", recurring: false },
    { id: 6, title: "Deploy v2.1", day: 18, time: "16:00", duration: "1h", color: "#EF4444", recurring: false },
    { id: 7, title: "Gallery Opening", day: 22, time: "18:00", duration: "3h", color: "#F59E0B", recurring: false },
    { id: 8, title: "Investor Meeting", day: 25, time: "09:30", duration: "1.5h", color: "#6366F1", recurring: false },
  ]);
  const [showNewEvent, setShowNewEvent] = useState(false);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const dim = new Date(year, month + 1, 0).getDate();
  const fd = new Date(year, month, 1).getDay();
  const days: (number | null)[] = [...Array.from({ length: fd }, () => null as null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => { setViewDate(new Date()); setSel(now.getDate()); };

  const dayEvents = (d: number) => events.filter(e => e.day === d);
  const selEvents = dayEvents(sel);
  const isToday = (d: number) => d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      {/* Left — Calendar grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 rounded-md transition-colors" style={{ color: c.textMuted }} onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><I d={ic.chevL} s={14} /></button>
            <p className="text-sm font-semibold min-w-[140px] text-center" style={{ color: c.text }}>{monthName} {year}</p>
            <button onClick={nextMonth} className="p-1 rounded-md transition-colors" style={{ color: c.textMuted }} onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><I d={ic.chevR} s={14} /></button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goToday} className="px-2.5 py-1 rounded-lg text-[10px] font-medium" style={{ background: c.accentSoft, color: c.accentText }}>Today</button>
            {(["month", "week", "day"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition-colors"
                style={{ background: view === v ? c.cardAlt : "transparent", color: view === v ? c.text : c.textMuted }}>
                {v}
              </button>
            ))}
            <button onClick={() => setShowNewEvent(true)} className="ml-1 px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1" style={{ background: c.accent, color: "#fff" }}>
              <I d={ic.plus} s={11} c="#fff" /> Event
            </button>
          </div>
        </div>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-px px-3 pt-2" style={{ background: c.bg }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: c.textMuted }}>{d}</div>)}
        </div>
        {/* Month grid */}
        <div className="flex-1 grid grid-cols-7 gap-px px-3 pb-2 auto-rows-fr">
          {days.map((d, i) => {
            const evts = d ? dayEvents(d) : [];
            return (
              <button key={i} onClick={() => d && setSel(d)}
                className="flex flex-col items-start p-1 rounded-lg text-[11px] transition-all overflow-hidden"
                style={{
                  background: d === sel ? c.accentSoft : "transparent",
                  border: isToday(d ?? 0) ? `1.5px solid ${c.accent}` : "1.5px solid transparent",
                }}
                onMouseEnter={e => { if (d && d !== sel) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (d && d !== sel) e.currentTarget.style.background = "transparent"; }}>
                <span className="font-medium" style={{ color: d === sel ? c.accentText : d ? c.text : "transparent" }}>{d}</span>
                {evts.slice(0, 2).map(ev => (
                  <div key={ev.id} className="w-full mt-0.5 px-1 py-0.5 rounded text-[8px] font-medium truncate" style={{ background: ev.color + "20", color: ev.color }}>
                    {ev.title}
                  </div>
                ))}
                {evts.length > 2 && <span className="text-[8px] mt-0.5" style={{ color: c.textMuted }}>+{evts.length - 2} more</span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Right — Day detail & events */}
      <div className="w-[200px] flex-shrink-0 flex flex-col border-l" style={{ borderColor: c.border, background: c.surface }}>
        <div className="p-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <p className="text-[18px] font-bold" style={{ color: c.text }}>{sel}</p>
          <p className="text-[10px]" style={{ color: c.textMuted }}>{new Date(year, month, sel).toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: "none" }}>
          {selEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <I d={ic.calendar} s={24} c={c.textMuted} />
              <p className="text-[10px]" style={{ color: c.textMuted }}>No events</p>
            </div>
          ) : selEvents.map(ev => (
            <div key={ev.id} className="p-2.5 rounded-xl" style={{ background: ev.color + "10", border: `1px solid ${ev.color}25` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
                <span className="text-[11px] font-semibold" style={{ color: c.text }}>{ev.title}</span>
              </div>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{ev.time} · {ev.duration}</p>
              {ev.recurring && <span className="text-[8px] px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: c.cardAlt, color: c.textMuted }}>Recurring</span>}
            </div>
          ))}
        </div>
        {showNewEvent && (
          <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
            <p className="text-[10px] font-semibold mb-2" style={{ color: c.text }}>New Event</p>
            <input placeholder="Event title..." className="w-full px-2 py-1.5 rounded-lg text-[10px] outline-none mb-1.5" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }} />
            <input type="time" className="w-full px-2 py-1.5 rounded-lg text-[10px] outline-none mb-2" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }} />
            <div className="flex gap-1.5">
              <button className="flex-1 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: c.accent, color: "#fff" }}>Save</button>
              <button onClick={() => setShowNewEvent(false)} className="flex-1 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: c.cardAlt, color: c.textMuted }}>Cancel</button>
            </div>
          </div>
        )}
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
  const [settNavHistory, setSettNavHistory] = useState<string[]>(["Network"]);
  const [settNavIdx, setSettNavIdx] = useState(0);
  const [settPageKey, setSettPageKey] = useState(0);
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [dndOn, setDndOn] = useState(false);
  const [locOn, setLocOn] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [activeLang, setActiveLang] = useState(0);
  const [connectedNet, setConnectedNet] = useState(0);
  // Deep navigation: sub-section within each main section
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  const settSubSections: Record<string, { icon: string; label: string; desc: string }[]> = {
    Network:       [{ icon: ic.wifi, label: "Wi-Fi", desc: "Wireless networks" }, { icon: ic.globe, label: "Ethernet", desc: "Wired connections" }, { icon: ic.shield, label: "VPN", desc: "Secure tunnels" }, { icon: ic.settings, label: "Proxy", desc: "Network proxy" }, { icon: ic.shield, label: "Firewall", desc: "Packet filtering" }, { icon: ic.globe, label: "DNS", desc: "Name resolution" }],
    Bluetooth:     [{ icon: ic.bluetooth, label: "Paired Devices", desc: "Manage pairing" }, { icon: ic.bluetooth, label: "Scan", desc: "Discover nearby" }, { icon: ic.music, label: "Audio", desc: "BT audio output" }, { icon: ic.download, label: "Transfer", desc: "File sharing" }],
    Account:       [{ icon: ic.user, label: "Profile", desc: "Name & avatar" }, { icon: ic.shield, label: "Security", desc: "Password & 2FA" }, { icon: ic.globe, label: "Linked Accounts", desc: "OAuth & SSO" }, { icon: ic.bell, label: "Activity", desc: "Login history" }, { icon: ic.hdd, label: "Data & Privacy", desc: "Export / delete" }],
    Notifications: [{ icon: ic.bell, label: "App Alerts", desc: "Per-app settings" }, { icon: ic.music, label: "Sounds", desc: "Alert tones" }, { icon: ic.layers, label: "Banners", desc: "Banner style" }, { icon: ic.moon, label: "Focus Mode", desc: "Do not disturb" }, { icon: ic.clock, label: "Schedules", desc: "Quiet hours" }],
    Language:      [{ icon: ic.globe, label: "Language", desc: "Display language" }, { icon: ic.globe, label: "Region", desc: "Country & format" }, { icon: ic.clock, label: "Time Zone", desc: "Clock zone" }, { icon: ic.settings, label: "Keyboard", desc: "Input layout" }, { icon: ic.fileText, label: "Spell Check", desc: "Auto-correction" }],
    Appearance:    [{ icon: ic.moon, label: "Theme", desc: "Dark / light" }, { icon: ic.image, label: "Wallpaper", desc: "Desktop bg" }, { icon: ic.pen, label: "Fonts", desc: "Typography" }, { icon: ic.layers, label: "Icons", desc: "Icon pack" }, { icon: ic.sparkle, label: "Animations", desc: "Motion effects" }, { icon: ic.settings, label: "Density", desc: "Compact / cozy" }],
    Storage:       [{ icon: ic.hdd, label: "Local Storage", desc: "Disk space" }, { icon: ic.globe, label: "Cloud Backup", desc: "AlternusCloud" }, { icon: ic.trash, label: "Cleanup", desc: "Free up space" }, { icon: ic.download, label: "Backup", desc: "Scheduled backup" }],
    Battery:       [{ icon: ic.battery, label: "Status", desc: "Charge & health" }, { icon: ic.sparkle, label: "Power Saver", desc: "Energy limits" }, { icon: ic.barChart, label: "History", desc: "Usage graph" }, { icon: ic.settings, label: "Sleep Settings", desc: "Idle behavior" }],
    Privacy:       [{ icon: ic.globe, label: "Location", desc: "GPS access" }, { icon: ic.monitor, label: "Camera", desc: "App permissions" }, { icon: ic.voice, label: "Microphone", desc: "Audio capture" }, { icon: ic.fileText, label: "Clipboard", desc: "Paste access" }, { icon: ic.shield, label: "App Permissions", desc: "System access" }, { icon: ic.hdd, label: "Activity Log", desc: "Usage history" }],
    System:        [{ icon: ic.monitor, label: "About", desc: "OS version" }, { icon: ic.download, label: "Updates", desc: "System updates" }, { icon: ic.barChart, label: "Performance", desc: "CPU / RAM" }, { icon: ic.sparkle, label: "Startup", desc: "Boot apps" }, { icon: ic.fileText, label: "Logs", desc: "System log" }, { icon: ic.settings, label: "Advanced", desc: "Developer options" }],
  };

  const settNavigateTo = (section: string) => {
    if (section === activeSection) return;
    const h = [...settNavHistory.slice(0, settNavIdx + 1), section];
    setSettNavHistory(h);
    setSettNavIdx(h.length - 1);
    setActiveSection(section);
    setActiveSubSection(null);
    setSettPageKey(k => k + 1);
  };
  const settGoBack = () => {
    if (activeSubSection) { setActiveSubSection(null); return; }
    if (settNavIdx > 0) { const i = settNavIdx - 1; setSettNavIdx(i); setActiveSection(settNavHistory[i]); setActiveSubSection(null); setSettPageKey(k => k + 1); }
  };
  const settGoForward = () => {
    if (settNavIdx < settNavHistory.length - 1) { const i = settNavIdx + 1; setSettNavIdx(i); setActiveSection(settNavHistory[i]); setActiveSubSection(null); setSettPageKey(k => k + 1); }
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors" style={{ background: on ? c.accent : c.cardAlt }}>
      <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: on ? "18px" : "0px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );

  const items = [
    { icon: ic.wifi, label: "Network", desc: "Wi-Fi & connections" },
    { icon: ic.bluetooth, label: "Bluetooth", desc: "Paired devices" },
    { icon: ic.user, label: "Account", desc: "Profile & identity" },
    { icon: ic.bell, label: "Notifications", desc: "Alerts & sounds" },
    { icon: ic.globe, label: "Language", desc: "Region & locale" },
    { icon: ic.moon, label: "Appearance", desc: "Theme & wallpaper" },
    { icon: ic.hdd, label: "Storage", desc: "Disk usage" },
    { icon: ic.battery, label: "Battery", desc: "Power management" },
    { icon: ic.shield, label: "Privacy", desc: "Security & permissions" },
    { icon: ic.settings, label: "System", desc: "General preferences" },
  ];
  const activeItem = items.find(it => it.label === activeSection) || items[0];

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
            {/* Theme toggle — functional dark/light */}
            <p className="text-[10px] font-semibold uppercase tracking-wider px-1" style={{ color: c.textMuted }}>Theme</p>
            <div className="flex gap-3">
              {(["dark", "light"] as ThemeMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className="flex-1 py-5 rounded-2xl text-center transition-all"
                  style={{ background: mode === m ? c.accentSoft : c.cardAlt, border: `2px solid ${mode === m ? c.accent : "transparent"}`, boxShadow: mode === m ? `0 0 16px ${c.accent}20` : "none" }}>
                  <I d={m === "dark" ? ic.moon : ic.sun} s={28} c={mode === m ? c.accentText : c.textMuted} />
                  <p className="text-xs mt-2.5 capitalize font-semibold" style={{ color: mode === m ? c.accentText : c.textSec }}>{m === "dark" ? "Dark" : "Light"}</p>
                </button>
              ))}
            </div>
            {/* Accent Color */}
            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mt-2" style={{ color: c.textMuted }}>Accent Color</p>
            <div className="flex gap-2.5 px-1">
              {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"].map(col => (
                <div key={col} className="w-9 h-9 rounded-full cursor-pointer transition-transform hover:scale-110"
                  style={{ background: col, border: col === c.accent ? `3px solid ${c.text}` : "3px solid transparent", boxShadow: col === c.accent ? `0 0 8px ${col}60` : "none" }} />
              ))}
            </div>
            {/* Wallpaper */}
            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mt-2" style={{ color: c.textMuted }}>Wallpaper</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { img: "/wallpapers/OSwp.png",      label: "OSwp 1",   idx: 1 },
                { img: "/wallpapers/OSwp2.png",     label: "OSwp 2",   idx: 2 },
                { img: "/wallpapers/OSpw3.png",     label: "OSwp 3",   idx: 3 },
                { img: "/wallpapers/OSwp4.png",     label: "OSwp 4",   idx: 4 },
                { img: "/wallpapers/OSwp5.png",     label: "OSwp 5",   idx: 5 },
              ].map((wp) => (
                <div key={wp.idx} onClick={() => setWallpaper(wp.idx)}
                  className="h-20 rounded-xl cursor-pointer transition-all relative overflow-hidden group"
                  style={{
                    background: wp.img ? `url('${wp.img}') center/cover no-repeat` : c.cardAlt,
                    border: wallpaper === wp.idx ? `2px solid ${c.accent}` : `2px solid ${c.border}`,
                    boxShadow: wallpaper === wp.idx ? `0 0 12px ${c.accent}50` : "none",
                  }}>
                  {/* Selected check */}
                  {wallpaper === wp.idx && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: c.accent }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {/* Label */}
                  <span className="absolute bottom-1 left-2 text-[8px] font-semibold drop-shadow"
                    style={{ color: wp.img ? "rgba(255,255,255,0.85)" : c.textMuted }}>
                    {wp.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Font Size */}
            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mt-2" style={{ color: c.textMuted }}>Font Size</p>
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
      <div className="w-[195px] flex-shrink-0 flex flex-col overflow-y-auto" style={{ borderRight: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
        {/* Sidebar Header */}
        <div className="px-4 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B7280, #4B5563)", boxShadow: "0 3px 10px rgba(107,114,128,0.3)" }}>
              <I d={ic.settings} s={14} c="#fff" />
            </div>
            <div>
              <p className="text-[12px] font-bold" style={{ color: c.text }}>Settings</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>Preferences & Configuration</p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-2 px-2">
          <p className="text-[8px] font-bold uppercase tracking-wider px-3 py-1.5 mb-1" style={{ color: c.textMuted }}>Categories</p>
          {items.map((it, i) => {
            const isActive = activeSection === it.label;
            return (
              <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5"
                onClick={() => settNavigateTo(it.label)}
                style={{ background: isActive ? c.accentSoft : "transparent", borderLeft: isActive ? `3px solid ${c.accent}` : "3px solid transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = c.cardAlt; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? c.accentSoft : "transparent"; }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isActive ? `${c.accent}18` : c.cardAlt }}>
                  <I d={it.icon} s={13} c={isActive ? c.accentText : c.textSec} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold block leading-tight" style={{ color: isActive ? c.accentText : c.text }}>{it.label}</span>
                  <span className="text-[8px] block" style={{ color: c.textMuted }}>{it.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <button onClick={settGoBack} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: "transparent", border: `1px solid ${c.border}`, opacity: settNavIdx > 0 ? 1 : 0.3 }}
            onMouseEnter={e => { if (settNavIdx > 0) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <I d={ic.chevL} s={12} c={c.textSec} />
          </button>
          <button onClick={settGoForward} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: "transparent", border: `1px solid ${c.border}`, opacity: settNavIdx < settNavHistory.length - 1 ? 1 : 0.3 }}
            onMouseEnter={e => { if (settNavIdx < settNavHistory.length - 1) e.currentTarget.style.background = c.cardAlt; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <I d={ic.chevR} s={12} c={c.textSec} />
          </button>
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[10px] font-medium" style={{ color: c.textMuted }}>Settings</span>
            <I d={ic.chevR} s={9} c={c.textMuted} />
            <span className="text-[10px] font-bold" style={{ color: c.text }}>{activeSection}</span>
          </div>
          <span className="text-[8px] font-bold px-2 py-1 rounded-md" style={{ background: c.cardAlt, color: c.textMuted }}>v3.0</span>
        </div>
        {/* Page content with transition */}
        <div key={settPageKey} className="os-page-enter flex-1 overflow-hidden flex flex-col">
          {/* Page header */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c.accent}10`, border: `1px solid ${c.accent}18` }}>
              <I d={activeItem.icon} s={16} c={c.accent} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold leading-tight" style={{ color: c.text }}>{activeSection}</h2>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{activeItem.desc}</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {/* Sub-section tiles if no sub-section selected */}
            {!activeSubSection && settSubSections[activeSection] ? (
              <div className="p-4 overflow-y-auto h-full">
                {activeSection !== "Network" && activeSection !== "Appearance" ? (
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>{activeSection} — Select a sub-section</p>
                ) : null}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {settSubSections[activeSection].map((sub, i) => (
                    <button key={i} onClick={() => setActiveSubSection(sub.label)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = c.card; e.currentTarget.style.borderColor = c.accent + "50"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = c.cardAlt; e.currentTarget.style.borderColor = c.border; }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.accentSoft }}>
                        <I d={sub.icon} s={13} c={c.accentText} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{sub.label}</p>
                        <p className="text-[9px] truncate" style={{ color: c.textMuted }}>{sub.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Quick settings — fully interactive for Appearance, dimmed for others */}
                <div className="pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>Quick settings</p>
                  <div style={{ overflow: "hidden", opacity: activeSection === "Appearance" ? 1 : 0.6, pointerEvents: activeSection === "Appearance" ? "auto" : "none" }}>
                    {renderContent()}
                  </div>
                </div>
              </div>
            ) : activeSubSection ? (
              <div className="p-4 overflow-y-auto h-full">
                {/* Sub-section breadcrumb */}
                <div className="flex items-center gap-1 mb-4">
                  <button onClick={() => setActiveSubSection(null)} className="flex items-center gap-1 text-[10px] transition-colors" style={{ color: c.accentText }}>
                    <I d={ic.chevL} s={11} c={c.accentText} />
                    {activeSection}
                  </button>
                  <I d={ic.chevR} s={9} c={c.textMuted} />
                  <span className="text-[10px] font-semibold" style={{ color: c.text }}>{activeSubSection}</span>
                </div>
                {/* Sub-section content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: c.cardAlt }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.accentSoft }}>
                      <I d={(settSubSections[activeSection]?.find(s => s.label === activeSubSection))?.icon ?? ic.settings} s={14} c={c.accentText} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: c.text }}>{activeSubSection}</p>
                      <p className="text-[9px]" style={{ color: c.textMuted }}>{(settSubSections[activeSection]?.find(s => s.label === activeSubSection))?.desc}</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ background: c.success }} />
                  </div>
                  {/* Generic setting rows for the sub-section */}
                  {[
                    { label: "Enable", value: "On", toggle: true },
                    { label: "Auto-configure", value: "Automatic", toggle: false },
                    { label: "Priority", value: "High", toggle: false },
                    { label: "Notifications", value: "On", toggle: true },
                    { label: "Log level", value: "Info", toggle: false },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
                      <span className="text-[11px]" style={{ color: c.textSec }}>{row.label}</span>
                      {row.toggle ? (
                        <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-colors" style={{ background: i % 2 === 0 ? c.accent : c.card }}>
                          <div className="w-3.5 h-3.5 rounded-full bg-white" style={{ marginLeft: i % 2 === 0 ? "16px" : "0px" }} />
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background: c.accentSoft, color: c.accentText }}>{row.value}</span>
                      )}
                    </div>
                  ))}
                  {/* Advanced sub-sub link */}
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                    <span className="text-[11px]" style={{ color: c.text }}>Advanced options</span>
                    <I d={ic.chevR} s={11} c={c.textMuted} />
                  </button>
                </div>
              </div>
            ) : renderContent()}
          </div>
        </div>
      </div>
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; name: string } | null>(null);

  // ── DB-backed cloud files ──────────────────────────────────
  type DbFile = { id: string; name: string; type: "FILE" | "FOLDER"; path: string; size: number; content?: string | null; createdAt: string; parentId?: string | null };
  const [dbFiles, setDbFiles] = useState<DbFile[]>([]);
  const [dbFolderId, setDbFolderId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [showCloudFiles, setShowCloudFiles] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const fetchDbFiles = useCallback(async (parentId?: string | null) => {
    setDbLoading(true);
    try {
      const params = parentId ? `parentId=${parentId}` : "path=/";
      const res = await fetch(`/api/os/files?${params}`);
      if (!res.ok) return;
      const data: { files: DbFile[] } = await res.json();
      if (data.files.length === 0 && !parentId) {
        // Seed on first load
        await fetch("/api/os/files/seed", { method: "POST" });
        const res2 = await fetch("/api/os/files?path=/");
        if (res2.ok) {
          const data2: { files: DbFile[] } = await res2.json();
          setDbFiles(data2.files);
        }
      } else {
        setDbFiles(data.files);
      }
    } catch { /* ignore */ } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showCloudFiles) {
      fetchDbFiles(dbFolderId);
    }
  }, [showCloudFiles, dbFolderId, fetchDbFiles]);

  const dbCreateFile = async (name: string) => {
    if (!name.trim()) return;
    const res = await fetch("/api/os/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type: "FILE", path: "/", parentId: dbFolderId }),
    });
    if (res.ok) {
      const data: { file: DbFile } = await res.json();
      setDbFiles(prev => [...prev, data.file]);
    }
  };

  const dbDeleteFile = async (id: string) => {
    await fetch(`/api/os/files/${id}`, { method: "DELETE" });
    setDbFiles(prev => prev.filter(f => f.id !== id));
  };

  const dbFileIcon = (f: DbFile) => f.type === "FOLDER" ? ic.folder : f.name.endsWith(".md") ? ic.note : f.name.endsWith(".txt") ? ic.note : ic.fileText;
  const dbFileColor = (f: DbFile) => f.type === "FOLDER" ? "#FBBF24" : f.name.endsWith(".md") ? "#FBBF24" : "#3B82F6";
  const formatDbSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

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
      { name: "Archive", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "3 items", modified: "Dec 2024", action: "Archive" },
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
      { name: "Screenshots", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "5 items", modified: "Today", action: "Screenshots" },
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
      { name: "alternus-os", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "24 files", modified: "Today", action: "proj-alternus-os" },
      { name: "website", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "18 files", modified: "Yesterday", action: "proj-website" },
      { name: "mobile-app", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "11 files", modified: "Mar 30", action: "proj-mobile" },
      { name: "README.md", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "2 KB", modified: "Today", action: "code" },
      { name: "API Documentation.md", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "12 KB", modified: "Mar 28", action: "code" },
      { name: "Design System.fig", type: "file", icon: ic.pen, iconColor: "#A78BFA", size: "18 MB", modified: "Mar 15" },
    ],
    "proj-alternus-os": [
      { name: "src", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "8 folders", modified: "Today", action: "proj-os-src" },
      { name: "public", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "12 files", modified: "Yesterday", action: "proj-os-public" },
      { name: "docs", type: "folder", icon: ic.folder, iconColor: "#34D399", size: "6 files", modified: "Mar 28", action: "proj-os-docs" },
      { name: "node_modules", type: "folder", icon: ic.folder, iconColor: c.textMuted, size: "1,482 pkgs", modified: "Today", action: "proj-os-node" },
      { name: "package.json", type: "file", icon: ic.fileText, iconColor: "#F59E0B", size: "3 KB", modified: "Today", action: "code" },
      { name: "tsconfig.json", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "1 KB", modified: "Mar 20", action: "code" },
      { name: "next.config.mjs", type: "file", icon: ic.fileText, iconColor: "#10B981", size: "1 KB", modified: "Mar 18", action: "code" },
      { name: ".env.local", type: "file", icon: ic.shield, iconColor: c.danger, size: "0.5 KB", modified: "Today" },
    ],
    "proj-os-src": [
      { name: "app", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "12 folders", modified: "Today", action: "proj-os-src-app" },
      { name: "components", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "24 files", modified: "Today", action: "proj-os-src-components" },
      { name: "lib", type: "folder", icon: ic.folder, iconColor: "#F59E0B", size: "8 files", modified: "Yesterday", action: "proj-os-src-lib" },
      { name: "styles", type: "folder", icon: ic.folder, iconColor: "#EC4899", size: "4 files", modified: "Mar 25", action: "proj-os-src-styles" },
      { name: "hooks", type: "folder", icon: ic.folder, iconColor: "#34D399", size: "6 files", modified: "Mar 22", action: "proj-os-src-hooks" },
      { name: "types", type: "folder", icon: ic.folder, iconColor: "#60A5FA", size: "3 files", modified: "Mar 18", action: "proj-os-src-types" },
    ],
    "proj-os-src-app": [
      { name: "(auth)", type: "folder", icon: ic.folder, iconColor: "#F97316", size: "3 files", modified: "Today", action: "proj-os-src-app" },
      { name: "gallery", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "5 files", modified: "Yesterday", action: "proj-os-src-app" },
      { name: "os", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "2 files", modified: "Today", action: "proj-os-src-app" },
      { name: "api", type: "folder", icon: ic.folder, iconColor: "#10B981", size: "8 routes", modified: "Today", action: "proj-os-src-app" },
      { name: "page.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "12 KB", modified: "Today", action: "code" },
      { name: "layout.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "3 KB", modified: "Yesterday", action: "code" },
      { name: "globals.css", type: "file", icon: ic.pen, iconColor: "#EC4899", size: "6 KB", modified: "Mar 22", action: "code" },
    ],
    "proj-os-src-components": [
      { name: "ui", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "18 files", modified: "Today", action: "proj-os-src-components" },
      { name: "header.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "8 KB", modified: "Today", action: "code" },
      { name: "footer.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "4 KB", modified: "Yesterday", action: "code" },
      { name: "ai-chat.tsx", type: "file", icon: ic.fileText, iconColor: "#F97316", size: "32 KB", modified: "Today", action: "code" },
      { name: "gallery-card.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "6 KB", modified: "Yesterday", action: "code" },
      { name: "cart-drawer.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "14 KB", modified: "Mar 28", action: "code" },
      { name: "breadcrumbs.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "2 KB", modified: "Mar 20", action: "code" },
    ],
    "proj-os-src-lib": [
      { name: "ai-assistant.ts", type: "file", icon: ic.fileText, iconColor: "#F97316", size: "48 KB", modified: "Today", action: "code" },
      { name: "prisma.ts", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "1 KB", modified: "Mar 15", action: "code" },
      { name: "auth.ts", type: "file", icon: ic.shield, iconColor: "#10B981", size: "4 KB", modified: "Mar 18", action: "code" },
      { name: "utils.ts", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "3 KB", modified: "Mar 22", action: "code" },
    ],
    "proj-os-src-styles": [
      { name: "globals.css", type: "file", icon: ic.pen, iconColor: "#EC4899", size: "6 KB", modified: "Mar 22", action: "code" },
      { name: "typography.css", type: "file", icon: ic.pen, iconColor: "#EC4899", size: "2 KB", modified: "Mar 15", action: "code" },
      { name: "animations.css", type: "file", icon: ic.pen, iconColor: "#EC4899", size: "4 KB", modified: "Mar 10", action: "code" },
    ],
    "proj-os-src-hooks": [
      { name: "useAuth.ts", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "3 KB", modified: "Mar 20", action: "code" },
      { name: "useCart.ts", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "4 KB", modified: "Mar 18", action: "code" },
      { name: "useDebounce.ts", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "1 KB", modified: "Mar 10", action: "code" },
    ],
    "proj-os-src-types": [
      { name: "index.d.ts", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "5 KB", modified: "Mar 25", action: "code" },
      { name: "api.d.ts", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "3 KB", modified: "Mar 20", action: "code" },
    ],
    "proj-os-public": [
      { name: "images", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "34 files", modified: "Today", action: "proj-os-public" },
      { name: "fonts", type: "folder", icon: ic.folder, iconColor: "#F59E0B", size: "8 files", modified: "Mar 15", action: "proj-os-public" },
      { name: "favicon.ico", type: "file", icon: ic.image, iconColor: "#60A5FA", size: "4 KB", modified: "Mar 10" },
      { name: "og-image.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "120 KB", modified: "Mar 8" },
      { name: "robots.txt", type: "file", icon: ic.fileText, iconColor: c.textSec, size: "0.1 KB", modified: "Jan 15" },
    ],
    "proj-os-docs": [
      { name: "architecture.md", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "24 KB", modified: "Mar 28", action: "code" },
      { name: "api-reference.md", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "48 KB", modified: "Mar 20", action: "code" },
      { name: "deployment.md", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "8 KB", modified: "Mar 15", action: "code" },
      { name: "CHANGELOG.md", type: "file", icon: ic.fileText, iconColor: "#34D399", size: "16 KB", modified: "Today", action: "code" },
    ],
    "proj-os-node": [
      { name: "react", type: "folder", icon: ic.folder, iconColor: "#60A5FA", size: "124 files", modified: "Today", action: "proj-os-node" },
      { name: "next", type: "folder", icon: ic.folder, iconColor: c.textSec, size: "986 files", modified: "Today", action: "proj-os-node" },
      { name: "tailwindcss", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "238 files", modified: "Today", action: "proj-os-node" },
      { name: "prisma", type: "folder", icon: ic.folder, iconColor: "#3B82F6", size: "412 files", modified: "Today", action: "proj-os-node" },
      { name: "@anthropic-ai", type: "folder", icon: ic.folder, iconColor: "#F97316", size: "56 files", modified: "Today", action: "proj-os-node" },
    ],
    "proj-website": [
      { name: "pages", type: "folder", icon: ic.folder, iconColor: "#22D3EE", size: "8 files", modified: "Yesterday", action: "proj-web-pages" },
      { name: "components", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "15 files", modified: "Yesterday", action: "proj-web-pages" },
      { name: "api", type: "folder", icon: ic.folder, iconColor: "#10B981", size: "4 routes", modified: "Mar 28", action: "proj-web-pages" },
      { name: "public", type: "folder", icon: ic.folder, iconColor: "#FBBF24", size: "22 files", modified: "Mar 20", action: "proj-web-pages" },
      { name: "styles", type: "folder", icon: ic.folder, iconColor: "#EC4899", size: "3 files", modified: "Mar 18", action: "proj-web-pages" },
      { name: "package.json", type: "file", icon: ic.fileText, iconColor: "#F59E0B", size: "2 KB", modified: "Yesterday", action: "code" },
    ],
    "proj-web-pages": [
      { name: "index.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "8 KB", modified: "Yesterday", action: "code" },
      { name: "about.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "4 KB", modified: "Mar 28", action: "code" },
      { name: "contact.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "6 KB", modified: "Mar 25", action: "code" },
      { name: "gallery.tsx", type: "file", icon: ic.fileText, iconColor: "#60A5FA", size: "12 KB", modified: "Yesterday", action: "code" },
      { name: "_app.tsx", type: "file", icon: ic.fileText, iconColor: "#F59E0B", size: "3 KB", modified: "Mar 20", action: "code" },
    ],
    "proj-mobile": [
      { name: "android", type: "folder", icon: ic.folder, iconColor: "#34D399", size: "6 files", modified: "Mar 30", action: "proj-mobile" },
      { name: "ios", type: "folder", icon: ic.folder, iconColor: "#60A5FA", size: "5 files", modified: "Mar 30", action: "proj-mobile" },
      { name: "src", type: "folder", icon: ic.folder, iconColor: "#A78BFA", size: "18 files", modified: "Mar 28", action: "proj-mobile" },
      { name: "App.tsx", type: "file", icon: ic.fileText, iconColor: "#F97316", size: "6 KB", modified: "Mar 30", action: "code" },
      { name: "package.json", type: "file", icon: ic.fileText, iconColor: "#F59E0B", size: "3 KB", modified: "Mar 28", action: "code" },
    ],
    Screenshots: [
      { name: "screenshot-2025-04-10.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "1.8 MB", modified: "Today" },
      { name: "screenshot-2025-04-09.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "2.1 MB", modified: "Yesterday" },
      { name: "screenshot-dashboard.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "3.4 MB", modified: "Apr 5" },
      { name: "screenshot-gallery.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "2.6 MB", modified: "Apr 3" },
      { name: "screenshot-mobile.png", type: "file", icon: ic.image, iconColor: "#A78BFA", size: "890 KB", modified: "Mar 28" },
    ],
    Archive: [
      { name: "Budget Report Q4 2024.docx", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "180 KB", modified: "Dec 15" },
      { name: "Old Proposal v1.docx", type: "file", icon: ic.fileText, iconColor: "#3B82F6", size: "90 KB", modified: "Nov 10" },
      { name: "Contracts 2024.pdf", type: "file", icon: ic.fileText, iconColor: "#EF4444", size: "2.1 MB", modified: "Oct 30" },
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
      <div className="w-[168px] flex-shrink-0 flex flex-col overflow-y-auto" style={{ borderRight: `1px solid ${c.border}`, scrollbarWidth: "none" }}>
        {/* Sidebar Header */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FBBF24, #D97706)", boxShadow: "0 2px 8px rgba(251,191,36,0.3)" }}>
              <I d={ic.folder} s={14} c="#fff" />
            </div>
            <div>
              <p className="text-[11px] font-bold" style={{ color: c.text }}>Files</p>
              <p className="text-[9px]" style={{ color: c.textMuted }}>File Manager</p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-1.5 px-1.5">
          <p className="text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 mb-0.5" style={{ color: c.textMuted }}>Locations</p>
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

        {/* Cloud Files (DB-backed) */}
        {curPath === "Home" && (
          <div className="flex-shrink-0 px-3 pt-2 pb-1">
            <button
              onClick={() => setShowCloudFiles(v => !v)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all text-left"
              style={{ background: showCloudFiles ? c.accentSoft : c.cardAlt, border: `1px solid ${showCloudFiles ? c.accent + "40" : c.border}` }}
            >
              <I d={ic.cloudF} s={13} c={showCloudFiles ? c.accentText : c.textSec} />
              <span className="text-[11px] font-medium flex-1" style={{ color: showCloudFiles ? c.accentText : c.textSec }}>Cloud Files (AI)</span>
              {dbLoading && <span className="text-[9px]" style={{ color: c.textMuted }}>loading...</span>}
              <span style={{ transform: showCloudFiles ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-flex" }}><I d={ic.chevR} s={10} c={c.textMuted} /></span>
            </button>

            {showCloudFiles && (
              <div className="mt-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                {/* Breadcrumb for cloud nav */}
                {dbFolderId && (
                  <div className="flex items-center gap-1 px-3 py-1.5" style={{ borderBottom: `1px solid ${c.border}`, background: c.cardAlt }}>
                    <button onClick={() => setDbFolderId(null)} className="text-[10px]" style={{ color: c.accentText }}>Root</button>
                  </div>
                )}
                {/* File list */}
                <div className="max-h-[160px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {dbFiles.length === 0 && !dbLoading && (
                    <p className="text-[10px] text-center py-3" style={{ color: c.textMuted }}>No cloud files yet</p>
                  )}
                  {dbFiles.map(f => (
                    <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 group hover:bg-opacity-50 transition-colors"
                      style={{ borderBottom: `1px solid ${c.border}30` }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <I d={dbFileIcon(f)} s={13} c={dbFileColor(f)} />
                      <button
                        className="flex-1 text-left text-[11px] truncate"
                        style={{ color: c.text }}
                        onClick={() => {
                          if (f.type === "FOLDER") setDbFolderId(f.id);
                          else { setSelectedFile(f.name); setFileContent(f.content || "(empty file)"); }
                        }}
                      >
                        {f.name}
                      </button>
                      <span className="text-[9px]" style={{ color: c.textMuted }}>{formatDbSize(f.size)}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                        style={{ color: c.danger }}
                        onClick={() => dbDeleteFile(f.id)}
                        title="Delete"
                      >
                        <I d={ic.trash} s={11} c={c.danger} />
                      </button>
                    </div>
                  ))}
                </div>
                {/* New file input */}
                {showNewFileInput ? (
                  <div className="flex items-center gap-1 px-3 py-1.5" style={{ borderTop: `1px solid ${c.border}` }}>
                    <input
                      autoFocus
                      className="flex-1 bg-transparent outline-none text-[11px]"
                      style={{ color: c.text }}
                      placeholder="filename.txt"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { dbCreateFile(newFileName); setNewFileName(""); setShowNewFileInput(false); }
                        if (e.key === "Escape") { setShowNewFileInput(false); setNewFileName(""); }
                      }}
                    />
                    <button onClick={() => { dbCreateFile(newFileName); setNewFileName(""); setShowNewFileInput(false); }}
                      className="text-[10px] px-2 py-0.5 rounded" style={{ background: c.accent, color: "#fff" }}>Create</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewFileInput(true)}
                    className="w-full text-[10px] py-1.5 text-center transition-colors"
                    style={{ color: c.accentText, borderTop: `1px solid ${c.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = c.accentSoft)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    + New File
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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
    </div>
  );
}

function NotesApp({ c }: { c: typeof palette.dark }) {
  const [notes, setNotes] = useState([
    { id: 1, title: "Project Ideas", text: "# Project Ideas\n\n- Gallery V2 redesign\n- AI art curation engine\n- Mobile app MVP\n- Artist onboarding flow", folder: "Work", pinned: true, updated: "2 min ago" },
    { id: 2, title: "Meeting Notes", text: "# Meeting Notes — Apr 8\n\nAttendees: Team lead, Designer, Dev\n\n## Action Items\n- Finalize mockups by Friday\n- Deploy staging by Monday\n- Review analytics dashboard", folder: "Work", pinned: true, updated: "1h ago" },
    { id: 3, title: "Quick Reminders", text: "- Call dentist\n- Renew domain alternus.art\n- Order new keyboard\n- Update portfolio", folder: "Personal", pinned: false, updated: "3h ago" },
    { id: 4, title: "API Endpoints", text: "# API Reference\n\nGET /api/v1/artworks\nPOST /api/v1/artworks\nPUT /api/v1/artworks/:id\nDELETE /api/v1/artworks/:id\n\nAuth: Bearer token required", folder: "Dev", pinned: false, updated: "Yesterday" },
    { id: 5, title: "Shopping List", text: "- Milk\n- Coffee beans\n- Bread\n- Pasta\n- Olive oil", folder: "Personal", pinned: false, updated: "2 days ago" },
    { id: 6, title: "Sprint Retro", text: "## What went well\n- Shipped on time\n- Good test coverage\n\n## What to improve\n- Better standup format\n- Reduce context switching", folder: "Work", pinned: false, updated: "3 days ago" },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [searchQ, setSearchQ] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const folders = Array.from(new Set(notes.map(n => n.folder)));
  const active = notes.find(n => n.id === activeId);

  const filtered = notes
    .filter(n => !activeFolder || n.folder === activeFolder)
    .filter(n => !searchQ || n.title.toLowerCase().includes(searchQ.toLowerCase()) || n.text.toLowerCase().includes(searchQ.toLowerCase()));
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  const addNote = () => {
    const id = Date.now();
    const n = { id, title: "Untitled Note", text: "", folder: activeFolder || "Work", pinned: false, updated: "Just now" };
    setNotes(p => [n, ...p]);
    setActiveId(id);
  };
  const updateText = (text: string) => {
    setNotes(p => p.map(n => n.id === activeId ? { ...n, text, updated: "Just now" } : n));
  };
  const togglePin = (id: number) => setNotes(p => p.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const deleteNote = (id: number) => { setNotes(p => p.filter(n => n.id !== id)); if (activeId === id && notes.length > 1) setActiveId(notes.find(n => n.id !== id)?.id ?? 1); };
  const words = active ? active.text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FBBF24, #D97706)", boxShadow: "0 3px 12px rgba(251,191,36,0.3)" }}>
          <I d={ic.note} s={16} c="#fff" />
        </div>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold" style={{ color: c.text }}>Notes</h3>
          <p className="text-[10px]" style={{ color: c.textMuted }}>Quick notes, ideas, and documents</p>
        </div>
        <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: c.cardAlt, color: c.textMuted }}>{notes.length} notes</span>
      </div>
      <div className="flex flex-1 min-h-0">
      {/* Sidebar — note list */}
      <div className="w-[220px] flex-shrink-0 flex flex-col border-r" style={{ borderColor: c.border, background: c.surface }}>
        {/* Search + new */}
        <div className="p-2 flex items-center gap-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <I d={ic.search} s={12} c={c.textMuted} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search notes..."
              className="flex-1 bg-transparent outline-none text-[10px]" style={{ color: c.text }} />
          </div>
          <button onClick={addNote} className="p-1.5 rounded-lg" style={{ background: c.accent }} title="New Note">
            <I d={ic.plus} s={13} c="#fff" />
          </button>
        </div>
        {/* Folder tabs */}
        <div className="flex gap-0.5 px-2 py-1.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setActiveFolder(null)} className="px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap"
            style={{ background: !activeFolder ? c.accentSoft : "transparent", color: !activeFolder ? c.accentText : c.textMuted }}>All</button>
          {folders.map(f => (
            <button key={f} onClick={() => setActiveFolder(f)} className="px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap"
              style={{ background: activeFolder === f ? c.accentSoft : "transparent", color: activeFolder === f ? c.accentText : c.textMuted }}>{f}</button>
          ))}
        </div>
        {/* Note list */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5" style={{ scrollbarWidth: "none" }}>
          {pinned.length > 0 && <p className="text-[8px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: c.textMuted }}>Pinned</p>}
          {pinned.map(n => (
            <button key={n.id} onClick={() => setActiveId(n.id)} className="w-full text-left px-2.5 py-2 rounded-lg transition-colors"
              style={{ background: activeId === n.id ? c.cardAlt : "transparent" }}>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold truncate flex-1" style={{ color: c.text }}>{n.title}</span>
                <span className="text-[8px]" style={{ color: c.warning }}>📌</span>
              </div>
              <p className="text-[9px] truncate mt-0.5" style={{ color: c.textMuted }}>{n.text.split("\n")[0].replace(/#/g, "").trim()}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px]" style={{ color: c.textMuted }}>{n.updated}</span>
                <span className="text-[8px] px-1 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>{n.folder}</span>
              </div>
            </button>
          ))}
          {unpinned.length > 0 && pinned.length > 0 && <p className="text-[8px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: c.textMuted }}>Notes</p>}
          {unpinned.map(n => (
            <button key={n.id} onClick={() => setActiveId(n.id)} className="w-full text-left px-2.5 py-2 rounded-lg transition-colors"
              style={{ background: activeId === n.id ? c.cardAlt : "transparent" }}>
              <span className="text-[10px] font-semibold truncate block" style={{ color: c.text }}>{n.title}</span>
              <p className="text-[9px] truncate mt-0.5" style={{ color: c.textMuted }}>{n.text.split("\n")[0].replace(/#/g, "").trim()}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px]" style={{ color: c.textMuted }}>{n.updated}</span>
                <span className="text-[8px] px-1 rounded" style={{ background: c.cardAlt, color: c.textMuted }}>{n.folder}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
              <input value={active.title} onChange={e => setNotes(p => p.map(n => n.id === activeId ? { ...n, title: e.target.value } : n))}
                className="text-[13px] font-semibold bg-transparent outline-none flex-1" style={{ color: c.text }} />
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => togglePin(activeId)} className="p-1.5 rounded-lg transition-colors" title={active.pinned ? "Unpin" : "Pin"}
                  style={{ color: active.pinned ? c.warning : c.textMuted }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={ic.lock} s={12} />
                </button>
                <button onClick={() => deleteNote(activeId)} className="p-1.5 rounded-lg transition-colors" title="Delete" style={{ color: c.danger }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={ic.trash} s={12} />
                </button>
              </div>
            </div>
            <textarea value={active.text} onChange={e => updateText(e.target.value)}
              className="flex-1 p-4 bg-transparent outline-none resize-none text-[12px] leading-relaxed font-mono"
              style={{ color: c.text, scrollbarWidth: "none" }} />
            <div className="px-4 py-1.5 flex items-center gap-4 text-[9px] flex-shrink-0" style={{ borderTop: `1px solid ${c.border}`, color: c.textMuted }}>
              <span>{words} words</span>
              <span>{active.text.length} chars</span>
              <span className="ml-auto">{active.folder}</span>
              <span>{active.updated}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[12px]" style={{ color: c.textMuted }}>Select a note or create a new one</p>
          </div>
        )}
      </div>
      </div>
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
  const [tab, setTab] = useState<"accounts" | "profile" | "security">("accounts");
  const [accounts, setAccounts] = useState([
    { name: "Google", user: "admin@gmail.com", icon: ic.globe, color: "#4285F4", synced: true, lastSync: "2 min ago" },
    { name: "GitHub", user: "alternuslamiart", icon: ic.code, color: "#8B5CF6", synced: true, lastSync: "5 min ago" },
    { name: "Alternus Cloud", user: "admin@alternus.art", icon: ic.cloud, color: "#06B6D4", synced: true, lastSync: "Just now" },
    { name: "Microsoft", user: "admin@outlook.com", icon: ic.monitor, color: "#00A4EF", synced: false, lastSync: "1h ago" },
    { name: "Stripe", user: "payments@alternus.art", icon: ic.dollarSign, color: "#635BFF", synced: true, lastSync: "10 min ago" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUser, setNewUser] = useState("");

  return (
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-0.5 flex-shrink-0">
        {[{ id: "accounts" as const, label: "Accounts", icon: ic.users }, { id: "profile" as const, label: "Profile", icon: ic.user }, { id: "security" as const, label: "Security", icon: ic.shield }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] font-medium transition-colors"
            style={{ background: tab === t.id ? c.surface : "transparent", color: tab === t.id ? c.text : c.textMuted, borderBottom: tab === t.id ? `2px solid ${c.accent}` : "2px solid transparent" }}>
            <I d={t.icon} s={13} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {tab === "accounts" && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold" style={{ color: c.text }}>Connected Accounts</p>
              <button onClick={() => setShowAdd(!showAdd)} className="px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1" style={{ background: c.accent, color: "#fff" }}>
                <I d={ic.plus} s={11} c="#fff" />Add
              </button>
            </div>
            {showAdd && (
              <div className="p-3 rounded-xl mb-3 space-y-2" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <input className="w-full px-3 py-1.5 rounded-lg text-[11px] bg-transparent outline-none" style={{ color: c.text, border: `1px solid ${c.border}` }} placeholder="Service name..." value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="w-full px-3 py-1.5 rounded-lg text-[11px] bg-transparent outline-none" style={{ color: c.text, border: `1px solid ${c.border}` }} placeholder="Username/Email..." value={newUser} onChange={e => setNewUser(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => { if (newName && newUser) { setAccounts(p => [...p, { name: newName, user: newUser, icon: ic.key, color: c.accentText, synced: false, lastSync: "Never" }]); setNewName(""); setNewUser(""); setShowAdd(false); } }}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: c.accent, color: "#fff" }}>Save</button>
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: c.cardAlt, color: c.textMuted }}>Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: acc.color + "20" }}>
                    <I d={acc.icon} s={18} c={acc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{acc.name}</p>
                    <p className="text-[9px]" style={{ color: c.textMuted }}>{acc.user}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: acc.synced ? c.success : c.warning }} />
                      <span className="text-[8px]" style={{ color: c.textMuted }}>{acc.synced ? "Synced" : "Not synced"} · {acc.lastSync}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg" style={{ color: c.textMuted }} title="Sync"
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.refresh} s={12} />
                    </button>
                    <button onClick={() => setAccounts(p => p.filter((_, j) => j !== i))} className="p-1.5 rounded-lg" style={{ color: c.danger }} title="Remove"
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.trash} s={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "profile" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: c.accentSoft, color: c.accentText }}>BA</div>
              <div>
                <p className="text-[14px] font-bold" style={{ color: c.text }}>Bulzart Aliu</p>
                <p className="text-[11px]" style={{ color: c.textMuted }}>admin@alternus.art</p>
                <button className="mt-1 px-2 py-0.5 rounded text-[9px] font-medium" style={{ background: c.accentSoft, color: c.accentText }}>Change Avatar</button>
              </div>
            </div>
            {[{ label: "Display Name", value: "Bulzart Aliu" }, { label: "Email", value: "admin@alternus.art" }, { label: "Organization", value: "Alternus Art Gallery" }, { label: "Role", value: "Administrator" }, { label: "Timezone", value: "Europe/Tirane (UTC+1)" }].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: c.textMuted }}>{f.label}</p>
                <div className="px-3 py-2 rounded-lg text-[11px]" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }}>{f.value}</div>
              </div>
            ))}
            <button className="w-full py-2 rounded-lg text-[11px] font-medium" style={{ background: c.accent, color: "#fff" }}>Save Changes</button>
          </div>
        )}
        {tab === "security" && (
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <I d={ic.lock} s={14} c={c.accent} />
                  <span className="text-[11px] font-semibold" style={{ color: c.text }}>Password</span>
                </div>
                <button className="px-2 py-1 rounded-lg text-[9px] font-medium" style={{ background: c.accentSoft, color: c.accentText }}>Change</button>
              </div>
              <p className="text-[10px]" style={{ color: c.textMuted }}>Last changed 30 days ago</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <I d={ic.shield} s={14} c={c.success} />
                  <span className="text-[11px] font-semibold" style={{ color: c.text }}>Two-Factor Authentication</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: c.success + "20", color: c.success }}>Enabled</span>
              </div>
              <p className="text-[10px]" style={{ color: c.textMuted }}>Authenticator app · Last verified 2 days ago</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <I d={ic.key} s={14} c={c.warning} />
                <span className="text-[11px] font-semibold" style={{ color: c.text }}>Active Sessions</span>
              </div>
              {[{ device: "MacBook Pro — Chrome", location: "Tirana, AL", active: true }, { device: "iPhone 15 — Safari", location: "Tirana, AL", active: true }, { device: "Windows PC — Edge", location: "Berlin, DE", active: false }].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: c.text }}>{s.device}</p>
                    <p className="text-[9px]" style={{ color: c.textMuted }}>{s.location}</p>
                  </div>
                  {s.active ? <span className="w-2 h-2 rounded-full" style={{ background: c.success }} /> : <button className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: c.danger, background: c.danger + "15" }}>Revoke</button>}
                </div>
              ))}
            </div>
            <button className="w-full py-2 rounded-lg text-[11px] font-medium" style={{ background: c.danger + "15", color: c.danger }}>Sign Out of All Sessions</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━ DOWNLOADS APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DownloadsApp({ c }: { c: typeof palette.dark }) {
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
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34D399, #059669)", boxShadow: "0 3px 12px rgba(52,211,153,0.3)" }}>
            <I d={ic.download} s={16} c="#fff" />
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-bold" style={{ color: c.text }}>Transfer Manager</h3>
            <p className="text-[10px]" style={{ color: c.textMuted }}>Downloads, uploads, and application installer</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: c.cardAlt, color: c.textMuted }}>
              {downloads.filter(d => d.progress < 100).length} active
            </span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1">
          {(["downloads", "uploads", "install"] as const).map(t => {
            const tabIcons = { downloads: ic.download, uploads: ic.upload, install: ic.store };
            return (
              <button key={t} onClick={() => { setTab(t); if (t === "install") { setInstallStep(0); setSelectedApp(null); setPolicyAccepted(false); } }}
                className="flex items-center gap-1.5 flex-1 py-2 text-[10px] font-semibold capitalize text-center rounded-xl transition-all justify-center"
                style={{ color: tab === t ? c.accentText : c.textMuted, background: tab === t ? c.accentSoft : "transparent" }}>
                <I d={tabIcons[t]} s={12} c={tab === t ? c.accentText : c.textMuted} />
                {t === "install" ? "Install" : t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
        {/* DOWNLOADS LIST */}
        {tab === "downloads" && (
          <div className="space-y-2">
            {downloads.map((d, i) => (
              <div key={i} className="p-3.5 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: d.progress === 100 ? `${c.success}12` : `${c.accent}12` }}>
                    <I d={ic.download} s={14} c={d.progress === 100 ? c.success : c.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{d.name}</p>
                    <p className="text-[9px]" style={{ color: c.textMuted }}>{d.size} {d.speed ? `\u00B7 ${d.speed}` : ""}</p>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: d.progress === 100 ? `${c.success}15` : `${c.accent}12`, color: d.progress === 100 ? c.success : c.accentText }}>{d.status}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(d.progress, 100)}%`, background: d.progress === 100 ? c.success : `linear-gradient(90deg, ${c.accent}, #818CF8)` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPLOADS LIST */}
        {tab === "uploads" && (
          <div className="space-y-2">
            {uploads.map((u, i) => (
              <div key={i} className="p-3.5 rounded-xl" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: u.progress === 100 ? `${c.success}12` : `${c.accent}12` }}>
                    <I d={ic.upload} s={14} c={u.progress === 100 ? c.success : c.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: c.text }}>{u.name}</p>
                    <p className="text-[9px]" style={{ color: c.textMuted }}>{u.size}</p>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: u.progress === 100 ? `${c.success}15` : `${c.accent}12`, color: u.progress === 100 ? c.success : c.accentText }}>{u.status}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                  <div className="h-full rounded-full" style={{ width: `${u.progress}%`, background: u.progress === 100 ? c.success : c.accent }} />
                </div>
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
  const [navHistory, setNavHistory] = useState<string[]>(["System"]);
  const [navIdx, setNavIdx] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  const [perfStats, setPerfStats] = useState({ cpu: 23, mem: 58, gpu: 12 });
  const [diagMsg, setDiagMsg] = useState<string | null>(null);

  const navigateTo = (section: string) => {
    if (section === activeSection) return;
    const newHistory = [...navHistory.slice(0, navIdx + 1), section];
    setNavHistory(newHistory);
    setNavIdx(newHistory.length - 1);
    setActiveSection(section);
    setPageKey(k => k + 1);
  };
  const goBack = () => {
    if (navIdx > 0) {
      const newIdx = navIdx - 1;
      setNavIdx(newIdx);
      setActiveSection(navHistory[newIdx]);
      setPageKey(k => k + 1);
    }
  };
  const goForward = () => {
    if (navIdx < navHistory.length - 1) {
      const newIdx = navIdx + 1;
      setNavIdx(newIdx);
      setActiveSection(navHistory[newIdx]);
      setPageKey(k => k + 1);
    }
  };

  const refreshStats = () => {
    setPerfStats({ cpu: Math.floor(Math.random() * 35 + 5), mem: Math.floor(Math.random() * 25 + 40), gpu: Math.floor(Math.random() * 18 + 3) });
  };

  const runDiagnostic = () => {
    setDiagMsg("running");
    setTimeout(() => setDiagMsg("ok"), 1600);
    setTimeout(() => setDiagMsg(null), 5000);
  };

  const exportLog = () => {
    const log = `ALTERNUS OS v3.0 \u2014 SYSTEM LOG\n---\nCPU: ${perfStats.cpu}%\nMemory: ${perfStats.mem}%\nGPU: ${perfStats.gpu}%\nStatus: Operational\nTimestamp: ${new Date().toISOString()}`;
    const a = document.createElement("a");
    a.href = "data:text/plain," + encodeURIComponent(log);
    a.download = "alternus-log.txt";
    a.click();
  };

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
    r:       "8px",
    tr:      "0.15s ease",
  };

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: dt.card, border: `1px solid ${dt.border}`, borderRadius: dt.r, ...style }}>{children}</div>
  );
  const SectionTitle = ({ label }: { label: string }) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: dt.textSec, fontFamily: dt.font, marginBottom: 12 }}>{label}</p>
  );
  const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${dt.border}` }}>
      <span style={{ fontSize: 12, color: dt.textSec, fontFamily: dt.font }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? dt.text, fontFamily: dt.font }}>{value}</span>
    </div>
  );
  const Btn = ({ label, variant, onClick }: { label: string; variant: "accent-outline" | "accent-solid" | "gray-outline"; onClick?: () => void }) => {
    const base: React.CSSProperties = { height: 36, padding: "0 16px", borderRadius: dt.r, fontSize: 12, fontWeight: 600, fontFamily: dt.font, cursor: "pointer", border: "1px solid", transition: dt.tr, flex: 1 };
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
    <div style={{ width: 34, height: 20, borderRadius: 10, background: on ? dt.accent : dt.border, cursor: "pointer", position: "relative", transition: dt.tr, flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 17 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: dt.tr, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );

  const sections = [
    { label: "System",   icon: ic.monitor, desc: "Hardware info & performance" },
    { label: "Boot",     icon: ic.power, desc: "Startup configuration" },
    { label: "Security", icon: ic.shield, desc: "Firewall & encryption" },
    { label: "Display",  icon: ic.sun, desc: "Resolution & appearance" },
    { label: "Network",  icon: ic.wifi, desc: "Connections & DNS" },
    { label: "Storage",  icon: ic.folder, desc: "Disk usage & partitions" },
    { label: "Services", icon: ic.settings, desc: "System processes" },
    { label: "Devices",  icon: ic.cpu, desc: "Hardware peripherals" },
    { label: "Users",    icon: ic.user, desc: "Accounts & permissions" },
    { label: "Updates",  icon: ic.refresh, desc: "System updates" },
  ];

  const activeSec = sections.find(s => s.label === activeSection) || sections[0];

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
      <div style={{ width:200, flexShrink:0, display:"flex", flexDirection:"column", background:dt.panel, borderRight:`1px solid ${dt.border}`, overflowY:"auto", scrollbarWidth:"none" as const }}>
        {/* Header */}
        <div style={{ padding:"16px 16px 14px", borderBottom:`1px solid ${dt.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
              <I d={ic.monitor} s={16} c="#fff" />
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:dt.text, lineHeight:"1.2" }}>Control Panel</p>
              <p style={{ fontSize:10, color:dt.textSec, marginTop:1 }}>System Configuration</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:3, background:dt.success, boxShadow:`0 0 6px ${dt.success}` }} />
            <span style={{ fontSize:9, fontWeight:600, color:dt.success }}>All systems operational</span>
          </div>
        </div>
        {/* Nav */}
        <div style={{ flex:1, padding:"8px 8px" }}>
          <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:dt.textSec, padding:"6px 10px", marginBottom:2 }}>Navigate</p>
          {sections.map(it => {
            const isActive = activeSection === it.label;
            return (
              <button key={it.label}
                onClick={() => navigateTo(it.label)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:10, background: isActive ? `${dt.accent}12` : "transparent", border:"none", cursor:"pointer", textAlign:"left" as const, marginBottom:2, transition:dt.tr, borderLeft: isActive ? `3px solid ${dt.accent}` : "3px solid transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background=dt.hover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background= isActive ? `${dt.accent}12` : "transparent"; }}>
                <div style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background: isActive ? `${dt.accent}18` : dt.hover }}>
                  <I d={it.icon} s={14} c={isActive ? dt.accent : dt.textSec} />
                </div>
                <div>
                  <span style={{ fontSize:12, fontWeight: isActive ? 700 : 500, color: isActive ? dt.text : dt.textSec, display:"block", lineHeight:"1.2" }}>{it.label}</span>
                  <span style={{ fontSize:9, color: dt.textSec, display:"block", marginTop:1 }}>{it.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        {/* Sidebar Footer */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${dt.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:9, color:dt.textSec }}>Alternus OS v3.0</span>
            <span style={{ fontSize:8, fontWeight:700, padding:"2px 8px", borderRadius:6, background:dt.hover, color:dt.textSec }}>x86_64</span>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Breadcrumb + Navigation Bar */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderBottom:`1px solid ${dt.border}`, flexShrink:0 }}>
          {/* Back/Forward */}
          <button onClick={goBack} style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:`1px solid ${dt.border}`, cursor: navIdx > 0 ? "pointer" : "default", opacity: navIdx > 0 ? 1 : 0.3, transition:dt.tr }}
            onMouseEnter={e => { if (navIdx > 0) e.currentTarget.style.background = dt.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <I d={ic.chevL} s={13} c={dt.textSec} />
          </button>
          <button onClick={goForward} style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", border:`1px solid ${dt.border}`, cursor: navIdx < navHistory.length - 1 ? "pointer" : "default", opacity: navIdx < navHistory.length - 1 ? 1 : 0.3, transition:dt.tr }}
            onMouseEnter={e => { if (navIdx < navHistory.length - 1) e.currentTarget.style.background = dt.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <I d={ic.chevR} s={13} c={dt.textSec} />
          </button>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flex:1 }}>
            <button onClick={() => navigateTo("System")} style={{ fontSize:11, fontWeight:500, color:dt.textSec, background:"transparent", border:"none", cursor:"pointer", padding:"2px 4px", borderRadius:4 }}
              onMouseEnter={e => { e.currentTarget.style.background = dt.hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              Control Panel
            </button>
            <I d={ic.chevR} s={10} c={dt.textSec} />
            <span style={{ fontSize:11, fontWeight:700, color:dt.text, padding:"2px 4px" }}>{activeSection}</span>
          </div>
          {/* Contextual actions */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={refreshStats} style={{ height:28, padding:"0 12px", borderRadius:8, fontSize:10, fontWeight:600, background:"transparent", border:`1px solid ${dt.border}`, color:dt.textSec, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:dt.tr }}
              onMouseEnter={e => { e.currentTarget.style.background = dt.hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <I d={ic.refresh} s={11} c={dt.textSec} /> Refresh
            </button>
            <button onClick={exportLog} style={{ height:28, padding:"0 12px", borderRadius:8, fontSize:10, fontWeight:600, background:"transparent", border:`1px solid ${dt.border}`, color:dt.textSec, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:dt.tr }}
              onMouseEnter={e => { e.currentTarget.style.background = dt.hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <I d={ic.download} s={11} c={dt.textSec} /> Export
            </button>
          </div>
        </div>
        {/* Page Content with transition */}
        <div key={pageKey} className="os-page-enter" style={{ flex:1, overflowY:"auto", scrollbarWidth:"none" as const }}>
          {/* Page Header */}
          <div style={{ padding:"20px 24px 0", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:`${dt.accent}12`, border:`1px solid ${dt.accent}18` }}>
              <I d={activeSec.icon} s={18} c={dt.accent} />
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:700, color:dt.text, lineHeight:"1.2", margin:0 }}>{activeSection}</h2>
              <p style={{ fontSize:11, color:dt.textSec, margin:0, marginTop:2 }}>{activeSec.desc}</p>
            </div>
          </div>
          {renderContent()}
        </div>
        {/* Status Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 20px", borderTop:`1px solid ${dt.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:9, color:dt.textSec }}>CPU: {perfStats.cpu}%</span>
            <span style={{ fontSize:9, color:dt.textSec }}>RAM: {perfStats.mem}%</span>
            <span style={{ fontSize:9, color:dt.textSec }}>GPU: {perfStats.gpu}%</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {diagMsg === "running" && <span style={{ fontSize:9, color:dt.warning }}>Diagnostic running...</span>}
            {diagMsg === "ok" && <span style={{ fontSize:9, color:dt.success }}>All checks passed</span>}
            <span style={{ fontSize:9, color:dt.textSec }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", boxShadow: "0 3px 12px rgba(239,68,68,0.3)" }}>
          <I d={ic.newspaper} s={16} c="#fff" />
        </div>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold" style={{ color: c.text }}>News</h3>
          <p className="text-[10px]" style={{ color: c.textMuted }}>Real-time headlines and world updates</p>
        </div>
        <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: c.cardAlt, color: c.textMuted }}>Live</span>
      </div>
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

// ━━━━ BUSINESS MANAGER APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BusinessManagerApp({ c }: { c: typeof palette.dark }) {
  type Customer = { id: number; name: string; email: string; phone: string; status: string };
  type Transaction = { id: number; type: "income" | "expense"; amount: number; category: string; desc: string; date: string };
  type Task = { id: number; title: string; priority: "E ulët" | "Normale" | "E lartë" | "Urgjente"; status: "Në pritje" | "Në progres" | "Përfunduar"; due: string };

  const load = <T,>(key: string, def: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
  const save = <T,>(key: string, v: T) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };

  const [tab, setTab] = useState<"dash" | "customers" | "finance" | "tasks">("dash");
  const [customers, setCustomers]     = useState<Customer[]>(() => load("bm_customers", []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => load("bm_transactions", []));
  const [tasks, setTasks]             = useState<Task[]>(() => load("bm_tasks", []));

  // Forms
  const [cForm, setCForm] = useState({ name: "", email: "", phone: "", status: "Aktiv" });
  const [tForm, setTForm] = useState<{ type: "income" | "expense"; amount: string; category: string; desc: string; date: string }>({ type: "income", amount: "", category: "Shitje", desc: "", date: new Date().toISOString().slice(0, 10) });
  const [tkForm, setTkForm] = useState({ title: "", priority: "Normale" as Task["priority"], due: "" });

  const nextId = (arr: { id: number }[]) => arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;

  const addCustomer = () => {
    if (!cForm.name.trim()) return;
    const updated = [...customers, { id: nextId(customers), ...cForm }];
    setCustomers(updated); save("bm_customers", updated);
    setCForm({ name: "", email: "", phone: "", status: "Aktiv" });
  };
  const delCustomer = (id: number) => { const u = customers.filter(x => x.id !== id); setCustomers(u); save("bm_customers", u); };

  const addTransaction = () => {
    const amt = parseFloat(tForm.amount);
    if (!amt || amt <= 0) return;
    const updated = [...transactions, { id: nextId(transactions), type: tForm.type, amount: amt, category: tForm.category, desc: tForm.desc, date: tForm.date }];
    setTransactions(updated); save("bm_transactions", updated);
    setTForm(f => ({ ...f, amount: "", desc: "" }));
  };
  const delTransaction = (id: number) => { const u = transactions.filter(x => x.id !== id); setTransactions(u); save("bm_transactions", u); };

  const addTask = () => {
    if (!tkForm.title.trim()) return;
    const updated = [...tasks, { id: nextId(tasks), title: tkForm.title, priority: tkForm.priority, status: "Në pritje" as Task["status"], due: tkForm.due }];
    setTasks(updated); save("bm_tasks", updated);
    setTkForm({ title: "", priority: "Normale", due: "" });
  };
  const advanceTask = (id: number) => {
    const map: Record<string, Task["status"]> = { "Në pritje": "Në progres", "Në progres": "Përfunduar" };
    const u = tasks.map(t => t.id === id && t.status !== "Përfunduar" ? { ...t, status: map[t.status] } : t);
    setTasks(u); save("bm_tasks", u);
  };
  const delTask = (id: number) => { const u = tasks.filter(x => x.id !== id); setTasks(u); save("bm_tasks", u); };

  const income  = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const fs = (n: number) => `${n}px`;
  const tabBtn = (key: typeof tab, label: string) => (
    <button key={key} onClick={() => setTab(key)}
      style={{ padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
        background: tab === key ? c.accent : c.cardAlt, color: tab === key ? "#fff" : c.textSec }}>
      {label}
    </button>
  );

  const pColors: Record<string, string> = { "E ulët": c.textMuted, "Normale": c.accent, "E lartë": c.warning, "Urgjente": c.danger };
  const sColors: Record<string, string> = { "Në pritje": c.textMuted, "Në progres": c.accent, "Përfunduar": c.success };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: c.bg, color: c.text, fontFamily: "Segoe UI, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 8px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>💼 Work Manager</span>
          <div style={{ display: "flex", gap: 4 }}>
            {(["dash", "customers", "finance", "tasks"] as const).map(k =>
              tabBtn(k, { dash: "📊 Dashboard", customers: "👥 Klientët", finance: "💰 Financat", tasks: "📋 Detyrat" }[k])
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dash" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "👥 Klientë", val: customers.length.toString(), color: c.accent },
                { label: "💰 Të Ardhura", val: `€${income.toFixed(2)}`, color: c.success },
                { label: "💸 Shpenzime", val: `€${expense.toFixed(2)}`, color: c.danger },
                { label: "📊 Bilanci", val: `€${balance.toFixed(2)}`, color: balance >= 0 ? c.success : c.danger },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: c.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}` }}>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: c.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}` }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12 }}>📋 Detyrat e fundit</div>
                {tasks.slice(-4).reverse().map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${c.border}`, fontSize: 12 }}>
                    <span style={{ color: c.text }}>{t.title}</span>
                    <span style={{ color: sColors[t.status], fontSize: 11 }}>{t.status}</span>
                  </div>
                ))}
                {tasks.length === 0 && <div style={{ color: c.textMuted, fontSize: 12 }}>Nuk ka detyra.</div>}
              </div>
              <div style={{ background: c.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${c.border}` }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12 }}>💳 Transaksionet e fundit</div>
                {transactions.slice(-4).reverse().map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${c.border}`, fontSize: 12 }}>
                    <span style={{ color: c.text }}>{t.category}</span>
                    <span style={{ color: t.type === "income" ? c.success : c.danger, fontWeight: 600 }}>
                      {t.type === "income" ? "+" : "-"}€{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && <div style={{ color: c.textMuted, fontSize: 12 }}>Nuk ka transaksione.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {(["name", "email", "phone"] as const).map(f => (
                <input key={f} placeholder={{ name: "Emri *", email: "Email", phone: "Telefon" }[f]}
                  value={cForm[f]} onChange={e => setCForm(p => ({ ...p, [f]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addCustomer()}
                  style={{ flex: 1, minWidth: 100, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12, outline: "none" }} />
              ))}
              <button onClick={addCustomer} style={{ padding: "6px 16px", borderRadius: 8, background: c.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Shto</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {customers.length === 0 && <div style={{ color: c.textMuted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Nuk ka klientë akoma.</div>}
              {customers.map(cu => (
                <div key={cu.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: c.surface, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: c.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{cu.name[0]?.toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cu.name}</div>
                    <div style={{ fontSize: 11, color: c.textMuted }}>{cu.email}{cu.phone ? ` · ${cu.phone}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 11, color: c.success, background: c.successSoft, padding: "2px 8px", borderRadius: 6 }}>{cu.status}</span>
                  <button onClick={() => delCustomer(cu.id)} style={{ background: "none", border: "none", color: c.danger, cursor: "pointer", fontSize: 14, padding: "2px 6px" }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FINANCE ── */}
        {tab === "finance" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[{ l: "💰 Të Ardhura", v: `€${income.toFixed(2)}`, col: c.success }, { l: "💸 Shpenzime", v: `€${expense.toFixed(2)}`, col: c.danger }, { l: "📊 Bilanci", v: `€${balance.toFixed(2)}`, col: balance >= 0 ? c.success : c.danger }].map(({ l, v, col }) => (
                <div key={l} style={{ background: c.surface, borderRadius: 8, padding: "10px 12px", border: `1px solid ${c.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: c.textMuted }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <select value={tForm.type} onChange={e => setTForm(p => ({ ...p, type: e.target.value as "income" | "expense" }))}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12 }}>
                <option value="income">⬆ Të Ardhura</option>
                <option value="expense">⬇ Shpenzim</option>
              </select>
              <input placeholder="Shuma €" value={tForm.amount} onChange={e => setTForm(p => ({ ...p, amount: e.target.value }))}
                style={{ width: 90, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12, outline: "none" }} />
              <input placeholder="Kategoria" value={tForm.category} onChange={e => setTForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: 110, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12, outline: "none" }} />
              <input placeholder="Përshkrimi" value={tForm.desc} onChange={e => setTForm(p => ({ ...p, desc: e.target.value }))}
                style={{ flex: 1, minWidth: 100, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12, outline: "none" }} />
              <input type="date" value={tForm.date} onChange={e => setTForm(p => ({ ...p, date: e.target.value }))}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12 }} />
              <button onClick={addTransaction} style={{ padding: "6px 16px", borderRadius: 8, background: tForm.type === "income" ? c.success : c.danger, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Shto</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {transactions.length === 0 && <div style={{ color: c.textMuted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Nuk ka transaksione akoma.</div>}
              {[...transactions].reverse().map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", background: c.surface, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 14 }}>{t.type === "income" ? "⬆" : "⬇"}</span>
                  <span style={{ fontWeight: 700, color: t.type === "income" ? c.success : c.danger, minWidth: 80 }}>€{t.amount.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: c.textMuted, flex: 1 }}>{t.category}{t.desc ? ` — ${t.desc}` : ""}</span>
                  <span style={{ fontSize: 11, color: c.textMuted }}>{t.date}</span>
                  <button onClick={() => delTransaction(t.id)} style={{ background: "none", border: "none", color: c.danger, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TASKS ── */}
        {tab === "tasks" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input placeholder="Titulli i detyrës *" value={tkForm.title} onChange={e => setTkForm(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addTask()}
                style={{ flex: 1, minWidth: 150, padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12, outline: "none" }} />
              <select value={tkForm.priority} onChange={e => setTkForm(p => ({ ...p, priority: e.target.value as Task["priority"] }))}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12 }}>
                {["E ulët", "Normale", "E lartë", "Urgjente"].map(p => <option key={p}>{p}</option>)}
              </select>
              <input type="date" value={tkForm.due} onChange={e => setTkForm(p => ({ ...p, due: e.target.value }))}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.cardAlt, color: c.text, fontSize: 12 }} />
              <button onClick={addTask} style={{ padding: "6px 16px", borderRadius: 8, background: c.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Shto</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {tasks.length === 0 && <div style={{ color: c.textMuted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Nuk ka detyra akoma.</div>}
              {tasks.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: c.surface, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <button onClick={() => advanceTask(t.id)}
                    style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sColors[t.status]}`, background: t.status === "Përfunduar" ? sColors[t.status] : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.status === "Përfunduar" && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                  </button>
                  <span style={{ flex: 1, fontSize: 13, textDecoration: t.status === "Përfunduar" ? "line-through" : "none", color: t.status === "Përfunduar" ? c.textMuted : c.text }}>{t.title}</span>
                  <span style={{ fontSize: 10, color: pColors[t.priority], background: `${pColors[t.priority]}20`, padding: "2px 8px", borderRadius: 6 }}>{t.priority}</span>
                  <span style={{ fontSize: 10, color: sColors[t.status] }}>{t.status}</span>
                  {t.due && <span style={{ fontSize: 10, color: c.textMuted }}>📅 {t.due}</span>}
                  <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", color: c.danger, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34D399, #059669)", boxShadow: "0 3px 12px rgba(52,211,153,0.3)" }}>
          <I d={ic.activity} s={16} c="#fff" />
        </div>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold" style={{ color: c.text }}>System Monitor</h3>
          <p className="text-[10px]" style={{ color: c.textMuted }}>Real-time hardware performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: `${c.success}12`, color: c.success }}><div className="w-1.5 h-1.5 rounded-full" style={{ background: c.success, boxShadow: `0 0 6px ${c.success}` }} />Live</span>
          <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: c.cardAlt, color: c.textMuted }}>{stats.temp}°C</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        {[{ id: "overview", label: "Overview" }, { id: "processes", label: "Processes" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as "overview" | "processes")}
            className="px-4 py-2 text-[11px] font-medium transition-colors"
            style={{ color: activeTab === t.id ? c.text : c.textMuted, borderBottom: activeTab === t.id ? `2px solid ${c.accent}` : "2px solid transparent", marginBottom: "-1px" }}>
            {t.label}
          </button>
        ))}
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
    { id: 1, text: "Finalize gallery redesign", desc: "Update layout, typography, and color scheme for the main gallery page", priority: "high" as const, done: false, deadline: "Today", tag: "Design" },
    { id: 2, text: "Review artist applications", desc: "Evaluate 12 new portfolio submissions for Q1 exhibition", priority: "high" as const, done: false, deadline: "Today", tag: "Review" },
    { id: 3, text: "Update payment integration", desc: "Migrate from Stripe v2 to v3 API with 3DS authentication", priority: "medium" as const, done: false, deadline: "Tomorrow", tag: "Dev" },
    { id: 4, text: "Write blog post", desc: "Draft article about emerging digital art trends for newsletter", priority: "medium" as const, done: true, deadline: "Dec 10", tag: "Content" },
    { id: 5, text: "Backup database", desc: "Run full PostgreSQL backup and verify restore procedure", priority: "low" as const, done: false, deadline: "Dec 15", tag: "Ops" },
    { id: 6, text: "Send invoice to client", desc: "Generate and send invoice #1042 for commissioned artwork", priority: "high" as const, done: true, deadline: "Done", tag: "Finance" },
  ]);
  const [input, setInput]       = useState("");
  const [filter, setFilter]     = useState<"all" | "active" | "done">("all");
  const [view, setView]         = useState<"list" | "board">("list");
  const [search, setSearch]     = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [animIn, setAnimIn]     = useState<Set<number>>(new Set());
  const [animOut, setAnimOut]   = useState<Set<number>>(new Set());
  const [justChecked, setJustChecked]   = useState<Set<number>>(new Set());
  const [priorityAnim, setPriorityAnim] = useState<Set<number>>(new Set());

  const priorityColor = { high: c.danger, medium: c.warning, low: c.success };
  const priorityLabel = { high: "Urgent", medium: "Medium", low: "Low" };
  const priorityNext: Record<string, "high" | "medium" | "low"> = { high: "medium", medium: "low", low: "high" };

  const filtered = tasks
    .filter(t => filter === "all" ? true : filter === "done" ? t.done : !t.done)
    .filter(t => !search || t.text.toLowerCase().includes(search.toLowerCase()) || t.tag.toLowerCase().includes(search.toLowerCase()));

  const completedPct = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

  // ── Smart Animate helpers ──
  const addTask = () => {
    if (!input.trim()) return;
    const newId = Date.now();
    setTasks(p => [...p, { id: newId, text: input.trim(), desc: "", priority: "medium" as const, done: false, deadline: "No deadline", tag: "Task" }]);
    setAnimIn(s => { const n = new Set(s); n.add(newId); return n; });
    setTimeout(() => setAnimIn(s => { const n = new Set(s); n.delete(newId); return n; }), 480);
    setInput("");
  };
  const deleteTask = (id: number) => {
    setAnimOut(s => { const n = new Set(s); n.add(id); return n; });
    setTimeout(() => {
      setTasks(p => p.filter(t => t.id !== id));
      setAnimOut(s => { const n = new Set(s); n.delete(id); return n; });
    }, 300);
  };
  const toggleTask = (id: number) => {
    setJustChecked(s => { const n = new Set(s); n.add(id); return n; });
    setTimeout(() => setJustChecked(s => { const n = new Set(s); n.delete(id); return n; }), 420);
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  const cyclePriority = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityAnim(s => { const n = new Set(s); n.add(id); return n; });
    setTimeout(() => setPriorityAnim(s => { const n = new Set(s); n.delete(id); return n; }), 360);
    setTasks(p => p.map(t => t.id === id ? { ...t, priority: priorityNext[t.priority] } : t));
  };

  // Board columns
  const boardCols = [
    { key: "urgent",   label: "Urgent",      color: c.danger,  dot: c.danger,  tasks: tasks.filter(t => !t.done && t.priority === "high") },
    { key: "progress", label: "In Progress", color: c.warning, dot: c.warning, tasks: tasks.filter(t => !t.done && t.priority !== "high") },
    { key: "done",     label: "Completed",   color: c.success, dot: c.success, tasks: tasks.filter(t => t.done) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: c.bg }}>
      <style>{`
        @keyframes task-slide-in {
          from { opacity:0; transform:translateY(10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes task-slide-out {
          from { opacity:1; transform:translateX(0) scale(1); max-height:120px; margin-bottom:7px; }
          to   { opacity:0; transform:translateX(38px) scale(0.94); max-height:0; margin-bottom:0; padding-top:0; padding-bottom:0; }
        }
        @keyframes check-pop {
          0%  { transform:scale(1); }
          38% { transform:scale(1.45); }
          68% { transform:scale(0.82); }
          100%{ transform:scale(1); }
        }
        @keyframes pri-flip {
          0%  { transform:scale(1) rotate(0deg); }
          50% { transform:scale(1.22) rotate(-10deg); }
          100%{ transform:scale(1) rotate(0deg); }
        }
        @keyframes view-fade {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .task-new   { animation: task-slide-in 0.38s cubic-bezier(.22,.68,0,1.12) both; }
        .task-gone  { animation: task-slide-out 0.30s cubic-bezier(.4,0,1,1) forwards; overflow:hidden; }
        .check-anim { animation: check-pop 0.4s cubic-bezier(.22,.68,0,1.2) both; }
        .pri-anim   { animation: pri-flip 0.34s cubic-bezier(.22,.68,0,1.2) both; }
        .view-enter { animation: view-fade 0.2s ease both; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "13px 14px 10px", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 3px 12px rgba(16,185,129,0.35)", flexShrink: 0 }}>
            <I d={ic.checkSquare} s={15} c="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>Task Manager</p>
            <p style={{ fontSize: 9, color: c.textMuted }}>Smart organize · prioritize · track</p>
          </div>
          {/* View toggle */}
          <div style={{ display: "flex", background: c.surface, borderRadius: 8, border: `1px solid ${c.border}`, overflow: "hidden" }}>
            {([
              { id: "list"  as const, d: "M4 6h16M4 11h16M4 16h16" },
              { id: "board" as const, d: "M3 3h5v18H3zM9.5 3h5v18h-5zM16 3h5v18h-5z" },
            ] as { id: "list" | "board"; d: string }[]).map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                style={{ padding: "5px 9px", background: view === v.id ? c.accent : "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s" }}>
                <I d={v.d} s={13} c={view === v.id ? "#fff" : c.textMuted} />
              </button>
            ))}
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: "flex", gap: 5, marginBottom: 9, alignItems: "center" }}>
          {[
            { label: "Urgent", count: tasks.filter(t => !t.done && t.priority === "high").length, color: c.danger },
            { label: "Active", count: tasks.filter(t => !t.done).length, color: c.warning },
            { label: "Done",   count: tasks.filter(t => t.done).length,  color: c.success },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, background: `${s.color}12`, borderRadius: 6, padding: "3px 7px", border: `1px solid ${s.color}28` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.count}</span>
              <span style={{ fontSize: 8, color: c.textMuted }}>{s.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: c.accent }}>{completedPct}%</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 4, background: c.border, marginBottom: 9, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${completedPct}%`, background: "linear-gradient(90deg,#10B981,#3B82F6)", transition: "width 0.55s cubic-bezier(.4,0,.2,1)" }} />
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 9, padding: "0 10px", height: 30, marginBottom: 7 }}>
          <I d={ic.search} s={12} c={c.textMuted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, color: c.text, flex: 1 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><I d={ic.close} s={11} c={c.textMuted} /></button>}
        </div>

        {/* Add task */}
        <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="What needs to be done?"
            style={{ flex: 1, fontSize: 11, padding: "0 12px", height: 32, borderRadius: 9, background: c.surface, border: `1px solid ${c.border}`, color: c.text, outline: "none" }} />
          <button onClick={addTask}
            style={{ width: 32, height: 32, borderRadius: 9, background: c.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${c.accent}40`, flexShrink: 0 }}>
            <I d={ic.plus} s={14} c="#fff" />
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {(["all", "active", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "4px 10px", borderRadius: 7, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: filter === f ? c.accentSoft : "transparent", color: filter === f ? c.accentText : c.textMuted, textTransform: "capitalize", transition: "all 0.15s" }}>
              {f} ({f === "all" ? tasks.length : f === "active" ? tasks.filter(t => !t.done).length : tasks.filter(t => t.done).length})
            </button>
          ))}
        </div>
      </div>

      {/* ── Content (key=view triggers fade animation on switch) ── */}
      <div className="view-enter" key={view} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* LIST VIEW */}
        {view === "list" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "9px 11px", scrollbarWidth: "none" }}>
            {filtered.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 100, color: c.textMuted, gap: 8 }}>
                <I d={ic.checkSquare} s={26} c={c.border} />
                <p style={{ fontSize: 11 }}>{search ? "No matching tasks" : "All clear!"}</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {filtered.map(task => {
                const isNew      = animIn.has(task.id);
                const isGone     = animOut.has(task.id);
                const isChecked  = justChecked.has(task.id);
                const isPriAnim  = priorityAnim.has(task.id);
                const isExpanded = expandedId === task.id;
                return (
                  <div key={task.id}
                    className={isNew ? "task-new" : isGone ? "task-gone" : ""}
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    style={{ background: c.surface, border: `1px solid ${task.done ? c.border : `${priorityColor[task.priority]}22`}`, borderRadius: 11, padding: "9px 11px", opacity: task.done ? 0.62 : 1, transition: "opacity 0.25s, border-color 0.25s", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      {/* Checkbox */}
                      <button
                        className={isChecked ? "check-anim" : ""}
                        onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                        style={{ marginTop: 2, width: 17, height: 17, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${task.done ? c.success : priorityColor[task.priority]}`, background: task.done ? c.success : "transparent", cursor: "pointer", transition: "background 0.2s, border-color 0.2s" }}>
                        {task.done && <I d="M20 6L9 17l-5-5" s={9} c="#fff" w={2.5} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: c.text, textDecoration: task.done ? "line-through" : "none", lineHeight: 1.3, transition: "text-decoration 0.2s" }}>{task.text}</p>
                        {/* Collapsed desc preview */}
                        {task.desc && !isExpanded && (
                          <p style={{ fontSize: 9, color: c.textMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.desc}</p>
                        )}
                        {/* Expanded desc */}
                        {isExpanded && task.desc && (
                          <p style={{ fontSize: 10, color: c.textSec, marginTop: 5, lineHeight: 1.5, animation: "task-slide-in 0.2s ease both" }}>{task.desc}</p>
                        )}
                        {/* Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                          <button
                            className={isPriAnim ? "pri-anim" : ""}
                            onClick={e => cyclePriority(task.id, e)}
                            title="Click to change priority"
                            style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 5, background: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority], border: "none", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}>
                            {priorityLabel[task.priority]}
                          </button>
                          <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 5, background: c.card, color: c.textMuted }}>{task.tag}</span>
                          <span style={{ fontSize: 8, color: c.textMuted, display: "flex", alignItems: "center", gap: 3 }}>
                            <I d={ic.clock} s={8} c={c.textMuted} />{task.deadline}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                        style={{ padding: 4, borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: c.textMuted, flexShrink: 0, transition: "color 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = c.danger; }}
                        onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; }}>
                        <I d={ic.trash} s={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOARD VIEW */}
        {view === "board" && (
          <div style={{ flex: 1, display: "flex", gap: 8, padding: "10px 10px", overflowX: "auto", overflowY: "hidden" }}>
            {boardCols.map(col => (
              <div key={col.key} style={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column", background: c.surface, borderRadius: 11, border: `1px solid ${col.color}28`, overflow: "hidden" }}>
                {/* Column header */}
                <div style={{ padding: "9px 11px 8px", borderBottom: `2px solid ${col.color}38`, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: col.color, flex: 1 }}>{col.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: c.textMuted, background: c.card, borderRadius: 5, padding: "1px 6px" }}>{col.tasks.length}</span>
                </div>
                {/* Cards */}
                <div style={{ flex: 1, overflowY: "auto", padding: 7, display: "flex", flexDirection: "column", gap: 6, scrollbarWidth: "none" }}>
                  {col.tasks.length === 0 && (
                    <div style={{ textAlign: "center", color: c.textMuted, fontSize: 9, padding: "14px 0", opacity: 0.5 }}>Empty</div>
                  )}
                  {col.tasks.map(task => (
                    <div key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{ background: c.card, borderRadius: 9, padding: "8px 9px", border: `1px solid ${c.border}`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.22)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: task.done ? c.textMuted : c.text, lineHeight: 1.35, textDecoration: task.done ? "line-through" : "none", marginBottom: 5 }}>{task.text}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority] }}>{priorityLabel[task.priority]}</span>
                        <span style={{ fontSize: 7, color: c.textMuted, marginLeft: "auto", display: "flex", alignItems: "center", gap: 2 }}><I d={ic.clock} s={7} c={c.textMuted} />{task.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "7px 14px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <p style={{ fontSize: 9, color: c.textMuted }}>{tasks.filter(t => t.done).length} of {tasks.length} completed</p>
        <button
          onClick={() => { tasks.filter(t => t.done).forEach(t => deleteTask(t.id)); }}
          style={{ fontSize: 9, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: `${c.danger}0A`, color: c.danger, border: "none", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = `${c.danger}18`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${c.danger}0A`; }}>
          Clear completed
        </button>
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
    <div className="flex flex-col h-full" style={{ background: c.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 3px 12px rgba(249,115,22,0.3)" }}>
          <I d={ic.mail} s={16} c="#fff" />
        </div>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold" style={{ color: c.text }}>Mail</h3>
          <p className="text-[10px]" style={{ color: c.textMuted }}>Messages and conversations</p>
        </div>
        {contacts.some(ct => ct.unread > 0) && (
          <span className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: `${c.danger}15`, color: c.danger }}>
            {contacts.reduce((s, ct) => s + ct.unread, 0)} new
          </span>
        )}
      </div>
      <div className="flex flex-1 min-h-0">
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
    { id: "claude", name: "Claude Opus", company: "Anthropic", color: "#F97316", desc: "Advanced reasoning and deep analysis", params: "2T", ctx: "200K", badge: "Flagship", initials: "CO", online: true },
    { id: "gpt4", name: "GPT-4o", company: "OpenAI", color: "#10B981", desc: "Versatile general-purpose intelligence", params: "1.8T", ctx: "128K", badge: "Popular", initials: "G4", online: true },
    { id: "gemini", name: "Gemini Ultra", company: "Google", color: "#3B82F6", desc: "Multimodal vision, audio, and text", params: "1.5T", ctx: "1M", badge: "Multimodal", initials: "GU", online: true },
    { id: "llama", name: "Llama 3.1", company: "Meta", color: "#8B5CF6", desc: "Open-source with transparent weights", params: "405B", ctx: "128K", badge: "Open Source", initials: "L3", online: false },
    { id: "mistral", name: "Mistral Large", company: "Mistral AI", color: "#EC4899", desc: "Fast, European frontier model", params: "123B", ctx: "32K", badge: "Fast", initials: "ML", online: false },
    { id: "deepseek", name: "DeepSeek R1", company: "DeepSeek", color: "#06B6D4", desc: "Reasoning-focused chain-of-thought model", params: "671B", ctx: "64K", badge: "Reasoning", initials: "DS", online: false },
  ];
  const [activeModel, setActiveModel] = useState(models[0]);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string; model?: string }[]>([
    { role: "ai", text: `Hello! I'm ${models[0].name} by ${models[0].company}. I specialize in ${models[0].desc.toLowerCase()}. How can I assist you today?`, model: models[0].name },
  ]);
  const [input, setInput] = useState("");
  const [navSection, setNavSection] = useState<"chats" | "models" | "marketplace" | "archive">("chats");
  const [callActive, setCallActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [convTab, setConvTab] = useState<"recent" | "favorite">("recent");
  const hubEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { hubEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Agent-style sidebar color vars (matches AlternusAgentApp exactly)
  const dk = c.bg === "#1C1D22";
  const agSidebarBg = dk ? c.surface : "linear-gradient(175deg,#F0EAFF 0%,#EDE8FF 40%,#EFF4FF 100%)";
  const agBorder = dk ? c.border : "rgba(120,80,220,0.10)";
  const agText = dk ? c.text : "#1a1525";
  const agTextSec = dk ? c.textSec : "#5a5470";
  const agTextMuted = dk ? c.textMuted : "#9896ab";
  const agAccent = "#7C3AED";
  const agAccentSoft = dk ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.10)";
  const agSelected = dk ? "rgba(79,142,247,0.14)" : "rgba(124,58,237,0.10)";

  const responses: Record<string, string[]> = {
    claude: ["I'll analyze that carefully and provide a nuanced response...", "From a reasoning perspective, this involves multiple considerations...", "Let me break this down step by step for you..."],
    gpt4: ["Great question! Here's what I think...", "I can help with that! Let me explain...", "Based on my training, here's a comprehensive answer..."],
    gemini: ["I can process both text and visual information to help...", "Using multimodal analysis, I can see that...", "Let me provide a comprehensive response with multiple perspectives..."],
    llama: ["Processing your request with open-source efficiency...", "Here's my response based on open-source training data...", "As an open model, I'll give you a transparent answer..."],
    mistral: ["Fast analysis complete. Here's what I found...", "Running fast inference — here's the result...", "European model response: here's my structured answer..."],
    deepseek: ["Let me think step by step through your question...", "Applying chain-of-thought reasoning to your query...", "Deep analysis complete. Here's my reasoned answer..."],
  };
  const capabilities = [
    { icon: ic.messageCircle, title: "Natural Conversation", desc: "Context-aware dialogue with memory across sessions", color: "#3B82F6" },
    { icon: ic.code, title: "Code Generation", desc: "Write, debug, and refactor code in 50+ languages", color: "#10B981" },
    { icon: ic.image, title: "Image Analysis", desc: "Understand and describe visual content in detail", color: "#F59E0B" },
    { icon: ic.fileText, title: "Document Processing", desc: "Summarize, extract, and transform documents", color: "#8B5CF6" },
    { icon: ic.globe, title: "Research & Analysis", desc: "Deep topic research with source attribution", color: "#EC4899" },
    { icon: ic.layers, title: "Translation", desc: "Fluent translation across 100+ language pairs", color: "#06B6D4" },
  ];
  const communities = [
    { id: "c1", name: "AI Researchers", members: "12.4k", color: "#7C3AED" },
    { id: "c2", name: "LLM Builders", members: "8.9k", color: "#3B82F6" },
    { id: "c3", name: "Prompt Engineers", members: "5.2k", color: "#10B981" },
  ];
  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    const opts = responses[activeModel.id] || responses.claude;
    const aiMsg = { role: "ai" as const, text: opts[Math.floor(Math.random() * opts.length)] + " " + input.toLowerCase() + ".", model: activeModel.name };
    setMsgs(p => [...p, userMsg, aiMsg]);
    setInput("");
  };
  const selectModel = (m: typeof models[0]) => {
    setActiveModel(m);
    setMsgs([{ role: "ai", text: `Hello! I'm ${m.name} by ${m.company}. I specialize in ${m.desc.toLowerCase()}. How can I assist?`, model: m.name }]);
    setCallActive(false);
  };

  // fullscreen voice call — no sidebars
  if (callActive) return (
    <div className="flex flex-col h-full" style={{ background: "#0d0d14", fontFamily: "'Segoe UI Variable','Segoe UI',system-ui,-apple-system,sans-serif" }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button onClick={() => setCallActive(false)} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.7)" }}>
          <I d={ic.chevL} s={14} c="rgba(255,255,255,0.7)" />
          <span className="text-[10px]">Back</span>
        </button>
        <div className="text-center">
          <p className="text-[11px] font-semibold text-white">{activeModel.name}</p>
          <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>AI Session · {new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex gap-1.5">
          <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}><I d={ic.user} s={12} c="white" /></button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}><I d={ic.menu} s={12} c="white" /></button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white"
            style={{ background: `linear-gradient(135deg,${activeModel.color},${activeModel.color}99)`, boxShadow: `0 0 60px ${activeModel.color}40` }}>
            {activeModel.initials}
          </div>
          <p className="text-white text-[13px] font-semibold">{activeModel.name}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{activeModel.company}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10B981" }} />
            <span className="text-[9px]" style={{ color: "#10B981" }}>AI Session Active</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 w-20 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
          {camOn ? <span className="text-[9px] text-white/60">Camera</span> : <I d={ic.user} s={20} c="rgba(255,255,255,0.3)" />}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 py-4 flex-shrink-0">
        {[
          { icon: ic.monitor, color: "rgba(255,255,255,0.1)", label: "Screen", toggle: undefined as undefined | (() => void) },
          { icon: ic.mic, color: micOn ? "rgba(255,255,255,0.1)" : "#EF4444", label: "Mic", toggle: () => setMicOn(p => !p) },
          { icon: ic.film, color: camOn ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)", label: "Cam", toggle: () => setCamOn(p => !p) },
          { icon: ic.volume, color: "rgba(255,255,255,0.1)", label: "Sound", toggle: undefined },
          { icon: ic.power, color: "#EF4444", label: "End", toggle: () => setCallActive(false) },
        ].map((btn, i) => (
          <button key={i} onClick={btn.toggle} className="flex flex-col items-center gap-1" title={btn.label}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: btn.color }}>
              <I d={btn.icon} s={16} c="white" />
            </div>
            <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.4)" }}>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ background: c.bg, fontFamily: "'Segoe UI Variable','Segoe UI',system-ui,-apple-system,sans-serif" }}>

      {/* ── LEFT SIDEBAR (identical to AlternusAgentApp) ── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 230, background: agSidebarBg, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRight: `1px solid ${agBorder}` }}>

        {/* Header */}
        <div className="px-3 pt-3 pb-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: agAccentSoft, border: `1px solid ${agAccent}22` }}>
              <I d={ic.sparkle} s={14} c={agAccent} f />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-tight" style={{ color: agText }}>Alternus Agent</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                <p className="text-[7.5px]" style={{ color: agTextMuted }}>{activeModel.name} · Active</p>
              </div>
            </div>
            <button className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <I d={ic.settings} s={11} c={agTextMuted} />
            </button>
          </div>
          {/* New task button */}
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10.5px] font-medium transition-all"
            style={{ background: dk ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)", color: agText, border: `1px solid ${agBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            onMouseEnter={e => (e.currentTarget.style.background = dk ? "rgba(255,255,255,0.10)" : "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = dk ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)")}>
            <span className="text-[15px] leading-none font-light" style={{ color: agAccent }}>+</span>
            <span className="flex-1 text-left">New task</span>
            <span className="text-[8.5px]" style={{ color: agTextMuted }}>⌘ N</span>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "chats",       icon: ic.sparkle,       label: "All tasks",   badge: msgs.filter(m => m.role === "user").length },
            { id: "models",      icon: ic.mail,          label: "Email",       badge: 0 },
            { id: "marketplace", icon: ic.fileText,      label: "Documents",   badge: 0 },
            { id: "archive",     icon: ic.folder,        label: "Files",       badge: 0 },
          ].map(item => (
            <button key={item.id} onClick={() => setNavSection(item.id as typeof navSection)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all"
              style={{ background: navSection === item.id ? agAccentSoft : "transparent" }}
              onMouseEnter={e => { if (navSection !== item.id) e.currentTarget.style.background = agSelected; }}
              onMouseLeave={e => { if (navSection !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <I d={item.icon} s={13} c={navSection === item.id ? agAccent : agTextMuted} />
              <span className="text-[10.5px] font-medium flex-1" style={{ color: navSection === item.id ? agAccent : agTextSec }}>{item.label}</span>
              {item.badge > 0 && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: agAccent, color: "#fff" }}>{item.badge}</span>
              )}
            </button>
          ))}
          {/* Settings row */}
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all"
            style={{ background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <I d={ic.settings} s={13} c={agTextMuted} />
            <span className="text-[10.5px] font-medium" style={{ color: agTextSec }}>Settings</span>
          </button>

          <div className="mx-2 my-2.5" style={{ height: 1, background: agBorder }} />
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] px-2 pb-1.5" style={{ color: agTextMuted }}>Quick Actions</p>
          {[
            { icon: ic.monitor, label: "Open Apps",  action: () => {} },
            { icon: ic.code,    label: "Terminal",   action: () => setInput("Open the terminal") },
            { icon: ic.image,   label: "Wallpaper",  action: () => setInput("Change wallpaper") },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <I d={item.icon} s={13} c={agTextMuted} />
              <span className="text-[10.5px] font-medium" style={{ color: agTextSec }}>{item.label}</span>
            </button>
          ))}

          <div className="mx-2 my-2.5" style={{ height: 1, background: agBorder }} />
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] px-2 pb-1.5" style={{ color: agTextMuted }}>Teams</p>
          {[
            { name: "Design Team", members: 5, color: "#3B82F6" },
            { name: "Dev Team", members: 8, color: "#10B981" },
            { name: "Marketing", members: 3, color: "#F59E0B" },
          ].map(team => (
            <button key={team.name}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left mb-0.5 transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: `${team.color}14`, border: `1px solid ${team.color}22` }}>
                <I d={ic.users} s={10} c={team.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold truncate" style={{ color: agText }}>{team.name}</p>
                <p className="text-[7px]" style={{ color: agTextMuted }}>{team.members} members</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${agBorder}` }}>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
            style={{ background: dk ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.05)", border: `1px solid ${agBorder}` }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: agAccentSoft }}>
              <I d={ic.brain} s={10} c={agAccent} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold truncate" style={{ color: agText }}>{activeModel.name}</p>
              <p className="text-[7px]" style={{ color: agTextMuted }}>{activeModel.ctx} ctx · Real OS actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHAT PANEL (flex-1, middle) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${activeModel.color},${activeModel.color}99)`, boxShadow: `0 6px 20px ${activeModel.color}45` }}>
                    {activeModel.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15px] font-semibold tracking-tight" style={{ color: c.text, letterSpacing: "-0.01em" }}>{activeModel.name}</p>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: `${activeModel.color}15`, color: activeModel.color, border: `1px solid ${activeModel.color}28` }}>
                        {activeModel.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeModel.online ? "#10B981" : c.textMuted }} />
                      <p className="text-[10px]" style={{ color: activeModel.online ? "#10B981" : c.textMuted }}>
                        {activeModel.online ? "Online" : "Offline"}
                      </p>
                      <span style={{ color: c.border }}>·</span>
                      <p className="text-[10px]" style={{ color: c.textMuted }}>{activeModel.company}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCallActive(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all"
                    style={{ background: "#10B98112", color: "#10B981", border: "1px solid #10B98122" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#10B98120")} onMouseLeave={e => (e.currentTarget.style.background = "#10B98112")}>
                    <I d={ic.mic} s={12} c="#10B981" /> Voice
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all"
                    style={{ background: `${activeModel.color}12`, color: activeModel.color, border: `1px solid ${activeModel.color}22` }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${activeModel.color}20`)} onMouseLeave={e => (e.currentTarget.style.background = `${activeModel.color}12`)}>
                    <I d={ic.monitor} s={12} c={activeModel.color} /> Share
                  </button>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <I d={ic.menu} s={14} c={c.textMuted} />
                  </button>
                </div>
              </div>
              {/* Metrics strip */}
              <div className="flex items-center px-5 pb-3 gap-0">
                {[
                  { label: "Params", value: activeModel.params },
                  { label: "Context", value: activeModel.ctx },
                  { label: "Latency", value: "<20ms" },
                  { label: "Provider", value: activeModel.company },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    {i > 0 && <div className="w-px h-3.5 mx-3" style={{ background: c.border }} />}
                    <span className="text-[9px]" style={{ color: c.textMuted }}>{stat.label}</span>
                    <span className="text-[9px] font-semibold ml-1" style={{ color: c.text }}>{stat.value}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#10B98110" }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10B981" }} />
                  <span className="text-[9px] font-semibold" style={{ color: "#10B981" }}>Live</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: "none" }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-3"}`}>
                  {m.role === "ai" && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white mt-0.5"
                      style={{ background: `linear-gradient(135deg,${activeModel.color},${activeModel.color}AA)`, boxShadow: `0 3px 10px ${activeModel.color}30` }}>
                      {activeModel.initials}
                    </div>
                  )}
                  <div className="max-w-[70%]">
                    {m.role === "ai" && (
                      <p className="text-[9.5px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: activeModel.color }}>
                        {m.model}
                        <span className="font-normal text-[9px]" style={{ color: c.textMuted }}>· just now</span>
                      </p>
                    )}
                    <div className="px-4 py-3 text-[12px] leading-relaxed"
                      style={{
                        background: m.role === "user" ? `linear-gradient(135deg,${activeModel.color},${activeModel.color}CC)` : c.card,
                        color: m.role === "user" ? "#fff" : c.text,
                        border: m.role === "ai" ? `1px solid ${c.border}` : "none",
                        borderLeft: m.role === "ai" ? `3px solid ${activeModel.color}40` : undefined,
                        borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                        boxShadow: m.role === "user" ? `0 4px 14px ${activeModel.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
                      }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Capabilities grid — shown when fresh */}
              {msgs.filter(m => m.role === "user").length === 0 && (
                <div className="mt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: c.textMuted, letterSpacing: "0.12em" }}>Capabilities</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {capabilities.map(cap => (
                      <button key={cap.title} onClick={() => setInput(cap.title)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                        style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${cap.color}50`; e.currentTarget.style.boxShadow = `0 4px 16px ${cap.color}18`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cap.color}14` }}>
                          <I d={cap.icon} s={16} c={cap.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold leading-tight" style={{ color: c.text }}>{cap.title}</p>
                          <p className="text-[8.5px] leading-snug mt-0.5" style={{ color: c.textMuted }}>{cap.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={hubEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${c.border}`, background: c.surface }}>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                style={{ background: c.card, border: `1.5px solid ${input.trim() ? activeModel.color + "60" : c.border}`, boxShadow: input.trim() ? `0 4px 20px ${activeModel.color}18` : "0 1px 8px rgba(0,0,0,0.06)", transition: "border-color 0.15s, box-shadow 0.15s" }}>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={ic.plus} s={14} c={c.textMuted} />
                </button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder={`Message ${activeModel.name}...`}
                  className="flex-1 bg-transparent outline-none text-[12px]"
                  style={{ color: c.text }} />
                <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <I d={ic.mic} s={13} c={c.textMuted} />
                </button>
                <button onClick={send}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: input.trim() ? `linear-gradient(135deg,${activeModel.color},${activeModel.color}CC)` : c.cardAlt, boxShadow: input.trim() ? `0 2px 12px ${activeModel.color}40` : "none" }}>
                  <I d={ic.send} s={13} c={input.trim() ? "#fff" : c.textMuted} />
                </button>
              </div>
            </div>
      </div>

      {/* ── RIGHT PANEL (Conversations + Model list) ── */}
      <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 210, borderLeft: `1px solid ${c.border}`, background: c.surface }}>

        {/* Conversations */}
        <div className="px-3 pt-3 pb-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <p className="text-[10.5px] font-bold mb-2" style={{ color: c.text }}>Conversations</p>
          <div className="flex gap-0.5 mb-2 p-0.5 rounded-lg" style={{ background: c.cardAlt }}>
            {(["recent", "favorite"] as const).map(t => (
              <button key={t} onClick={() => setConvTab(t)}
                className="flex-1 py-1 rounded-md text-[9px] font-semibold capitalize transition-all"
                style={{ background: convTab === t ? c.surface : "transparent", color: convTab === t ? c.text : c.textMuted, boxShadow: convTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-0.5">
            {msgs.filter(m => m.role === "user").slice(-5).reverse().map((m, i) => (
              <button key={i} onClick={() => setInput(m.text)}
                className="w-full text-left px-2 py-1.5 rounded-lg transition-all"
                onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <p className="text-[9.5px] truncate" style={{ color: c.textSec }}>{m.text}</p>
              </button>
            ))}
            {msgs.filter(m => m.role === "user").length === 0 && (
              <p className="text-[9px] px-2 py-1" style={{ color: c.textMuted }}>No conversations yet</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: c.cardAlt, border: `1px solid ${c.border}` }}>
            <I d={ic.search} s={10} c={c.textMuted} />
            <input placeholder="Search models..." className="flex-1 bg-transparent outline-none text-[9.5px]" style={{ color: c.text }} />
          </div>
        </div>

        {/* Story avatars */}
        <div className="flex gap-2 px-3 pb-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          {models.slice(0, 5).map(m => (
            <button key={m.id} onClick={() => selectModel(m)} className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg,${m.color},${m.color}99)`,
                    boxShadow: activeModel.id === m.id ? `0 0 0 2px ${m.color}` : `0 2px 8px ${m.color}28`,
                    outline: activeModel.id === m.id ? `2px solid ${c.bg}` : "none",
                    outlineOffset: "1px",
                  }}>
                  {m.initials}
                </div>
                {m.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: "#10B981", borderColor: c.bg }} />}
              </div>
              <span className="text-[7px] truncate w-9 text-center" style={{ color: c.textMuted }}>{m.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <div className="mx-3 mb-1" style={{ height: 1, background: c.border }} />

        {/* Model list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {models.map(m => (
            <button key={m.id} onClick={() => selectModel(m)}
              className="w-full flex items-center gap-2 px-3 py-2 transition-all text-left relative"
              style={{ background: activeModel.id === m.id ? `${m.color}18` : "transparent" }}
              onMouseEnter={e => { if (activeModel.id !== m.id) e.currentTarget.style.background = c.cardAlt; }}
              onMouseLeave={e => { if (activeModel.id !== m.id) e.currentTarget.style.background = "transparent"; }}>
              {activeModel.id === m.id && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: m.color }} />}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)`, boxShadow: `0 2px 6px ${m.color}28` }}>
                  {m.initials}
                </div>
                {m.online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "#10B981", border: `1.5px solid ${c.bg}` }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] truncate" style={{ color: c.text, fontWeight: activeModel.id === m.id ? 700 : 600 }}>{m.name}</span>
                  <span className="text-[6.5px] font-semibold px-1 py-0.5 rounded flex-shrink-0 ml-1"
                    style={{ background: activeModel.id === m.id ? m.color : `${m.color}14`, color: activeModel.id === m.id ? "#fff" : m.color }}>{m.badge}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[7px]" style={{ color: c.textMuted }}>{m.params}</span>
                  <span className="text-[6px]" style={{ color: c.border }}>·</span>
                  <span className="text-[7px]" style={{ color: c.textMuted }}>{m.ctx}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
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
    { name: "Artist Guidelines 2024", size: "245 KB", pages: 12, tags: ["policy", "artists"], indexed: true, icon: ic.fileText, color: "#3B82F6" },
    { name: "Payment Integration Docs", size: "89 KB", pages: 5, tags: ["dev", "payments"], indexed: true, icon: ic.dollarSign, color: "#10B981" },
    { name: "Gallery Exhibition Plan", size: "1.2 MB", pages: 34, tags: ["gallery", "events"], indexed: true, icon: ic.image, color: "#8B5CF6" },
    { name: "Marketing Strategy Q1", size: "560 KB", pages: 18, tags: ["marketing", "strategy"], indexed: false, icon: ic.trendingUp, color: "#F59E0B" },
    { name: "Legal Terms & Conditions", size: "120 KB", pages: 8, tags: ["legal"], indexed: true, icon: ic.shield, color: "#EF4444" },
  ];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ doc: string; snippet: string; page: number; relevance: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const snippets: Record<string, string> = {
    pay: "...payment is processed via Stripe with 3DS authentication. Funds are held for 7 days before release to artists...",
    art: "...artists must submit a portfolio of at least 5 original works. All pieces must be verified authentic...",
    gall: "...the gallery exhibition runs from March 15 to April 30. Artists are required to attend the opening night...",
    mark: "...Q1 marketing budget is \u20AC12,000 with focus on Instagram and Google Ads campaigns targeting collectors...",
    legal: "...users agree to our terms of service. Alternus retains a 20% commission on all successful sales...",
  };
  const search = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const key = Object.keys(snippets).find(k => query.toLowerCase().includes(k)) ?? "art";
      setResults([
        { doc: docs[0].name, snippet: snippets[key] ?? snippets.art, page: 3, relevance: 94 },
        { doc: docs[2].name, snippet: "...related context found in the exhibition planning document regarding artists and submissions...", page: 7, relevance: 78 },
      ]);
      setSearching(false);
    }, 800);
  };
  const indexedCount = docs.filter(d => d.indexed).length;
  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col" style={{ borderRight: `1px solid ${c.border}` }}>
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 2px 8px rgba(249,115,22,0.3)" }}>
              <I d={ic.bookOpen} s={14} c="#fff" />
            </div>
            <div>
              <h3 className="text-[11px] font-bold" style={{ color: c.text }}>Knowledge Base</h3>
              <p className="text-[9px]" style={{ color: c.textMuted }}>Semantic document search</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full" style={{ background: c.border }}>
              <div className="h-full rounded-full" style={{ width: `${(indexedCount / docs.length) * 100}%`, background: c.success }} />
            </div>
            <span className="text-[8px] font-bold" style={{ color: c.success }}>{indexedCount}/{docs.length}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5" style={{ scrollbarWidth: "none" }}>
          <p className="text-[9px] font-bold uppercase tracking-wider px-1 mb-1" style={{ color: c.textMuted }}>Documents</p>
          {docs.map((d, i) => (
            <div key={i} className="px-2.5 py-2.5 rounded-xl transition-all" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}12` }}>
                  <I d={d.icon} s={11} c={d.color} />
                </div>
                <span className="text-[10px] font-semibold truncate flex-1" style={{ color: c.text }}>{d.name}</span>
              </div>
              <div className="flex items-center gap-1.5 pl-8">
                <span className="text-[8px]" style={{ color: c.textMuted }}>{d.size} \u00B7 {d.pages} pages</span>
                <span className="text-[7px] font-bold px-1 py-0.5 rounded" style={{ background: d.indexed ? `${c.success}15` : `${c.warning}15`, color: d.indexed ? c.success : c.warning }}>
                  {d.indexed ? "Indexed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
          <button className="w-full py-2 rounded-xl text-[10px] font-medium text-center flex items-center justify-center gap-1.5 transition-all"
            style={{ border: `1px dashed ${c.border}`, color: c.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.accentText; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textMuted; }}>
            <I d={ic.plus} s={12} /> Upload Document
          </button>
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <h3 className="text-[12px] font-bold mb-1" style={{ color: c.text }}>Semantic Search</h3>
          <p className="text-[10px] mb-3" style={{ color: c.textMuted }}>Ask natural language questions across all your indexed documents</p>
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
              placeholder="What are the artist submission requirements?"
              className="flex-1 text-[11px] px-4 py-2.5 rounded-xl outline-none"
              style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
            <button onClick={search} className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold transition-all hover:scale-105"
              style={{ background: c.accent, color: "#fff", boxShadow: `0 2px 8px ${c.accent}40` }}>
              <I d={ic.search} s={13} c="#fff" />
              Search
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {searching && (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${c.accent}12` }}>
                <I d={ic.search} s={18} c={c.accent} />
              </div>
              <p className="text-[11px] font-medium" style={{ color: c.text }}>Searching knowledge base...</p>
              <p className="text-[9px] mt-1" style={{ color: c.textMuted }}>Analyzing {indexedCount} documents with semantic matching</p>
            </div>
          )}
          {results.map((r, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <I d={ic.fileText} s={13} c={c.accent} />
                  <p className="text-[11px] font-bold" style={{ color: c.text }}>{r.doc}</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: c.cardAlt, color: c.textMuted }}>Page {r.page}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: r.relevance > 90 ? `${c.success}15` : `${c.accent}12`, color: r.relevance > 90 ? c.success : c.accentText }}>{r.relevance}% match</span>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: c.textSec }}>{r.snippet}</p>
            </div>
          ))}
          {!searching && results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <I d={ic.bookOpen} s={26} c={c.textMuted} />
              </div>
              <p className="text-[12px] font-bold mb-1" style={{ color: c.text }}>Search Your Knowledge</p>
              <p className="text-[10px] max-w-[280px] mx-auto" style={{ color: c.textMuted }}>Ask questions in natural language and get instant answers from your indexed documents</p>
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

// ━━━━ BUSINESS MANAGER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BusinessApp({ c }: { c: typeof palette.dark }) {
  type Tab = "dashboard" | "clients" | "invoices" | "projects";
  const [tab, setTab] = useState<Tab>("dashboard");
  const [clients] = useState([
    { id: 1, name: "Acme Corp", contact: "John Smith", email: "john@acme.com", revenue: 48500, status: "active" as const, deals: 3 },
    { id: 2, name: "TechFlow Inc", contact: "Sarah Lee", email: "sarah@techflow.io", revenue: 32000, status: "active" as const, deals: 2 },
    { id: 3, name: "GlobalNet", contact: "Mike Chen", email: "mike@globalnet.com", revenue: 19200, status: "lead" as const, deals: 1 },
    { id: 4, name: "DataPrime", contact: "Ana Torres", email: "ana@dataprime.co", revenue: 67800, status: "active" as const, deals: 5 },
    { id: 5, name: "CloudAxis", contact: "Omar Patel", email: "omar@cloudaxis.dev", revenue: 12400, status: "lead" as const, deals: 1 },
    { id: 6, name: "NovaBuild", contact: "Lena Ivanova", email: "lena@novabuild.eu", revenue: 55100, status: "active" as const, deals: 4 },
    { id: 7, name: "Zentrix Labs", contact: "James Park", email: "james@zentrix.ai", revenue: 8900, status: "inactive" as const, deals: 0 },
    { id: 8, name: "Meridian Group", contact: "Fatima Al-Rashid", email: "fatima@meridian.sa", revenue: 91200, status: "active" as const, deals: 7 },
  ]);
  const [invoices] = useState([
    { id: "INV-001", client: "Acme Corp", amount: 12500, date: "2026-04-01", due: "2026-04-30", status: "paid" as const },
    { id: "INV-002", client: "TechFlow Inc", amount: 8400, date: "2026-03-28", due: "2026-04-28", status: "pending" as const },
    { id: "INV-003", client: "DataPrime", amount: 24000, date: "2026-03-15", due: "2026-04-15", status: "overdue" as const },
    { id: "INV-004", client: "NovaBuild", amount: 15600, date: "2026-04-05", due: "2026-05-05", status: "pending" as const },
    { id: "INV-005", client: "GlobalNet", amount: 6200, date: "2026-04-08", due: "2026-05-08", status: "draft" as const },
    { id: "INV-006", client: "Meridian Group", amount: 31000, date: "2026-03-20", due: "2026-04-20", status: "paid" as const },
    { id: "INV-007", client: "Acme Corp", amount: 18700, date: "2026-04-02", due: "2026-05-02", status: "pending" as const },
    { id: "INV-008", client: "CloudAxis", amount: 4800, date: "2026-03-10", due: "2026-04-10", status: "overdue" as const },
  ]);
  const [projects] = useState([
    { id: 1, name: "Website Redesign", client: "Acme Corp", progress: 78, budget: 25000, spent: 19500, deadline: "2026-05-15", status: "on-track" as const },
    { id: 2, name: "Mobile App v2", client: "TechFlow Inc", progress: 45, budget: 60000, spent: 27000, deadline: "2026-06-30", status: "on-track" as const },
    { id: 3, name: "Data Migration", client: "DataPrime", progress: 92, budget: 18000, spent: 17200, deadline: "2026-04-20", status: "at-risk" as const },
    { id: 4, name: "Cloud Infrastructure", client: "NovaBuild", progress: 30, budget: 45000, spent: 13500, deadline: "2026-07-01", status: "on-track" as const },
    { id: 5, name: "API Integration", client: "GlobalNet", progress: 15, budget: 12000, spent: 1800, deadline: "2026-05-30", status: "on-track" as const },
    { id: 6, name: "ERP System", client: "Meridian Group", progress: 60, budget: 120000, spent: 72000, deadline: "2026-09-01", status: "at-risk" as const },
  ]);

  const totalRevenue = clients.reduce((s, cl) => s + cl.revenue, 0);
  const activeClients = clients.filter(cl => cl.status === "active").length;
  const pendingInvoices = invoices.filter(inv => inv.status === "pending" || inv.status === "overdue");
  const pendingAmount = pendingInvoices.reduce((s, inv) => s + inv.amount, 0);
  const activeProjects = projects.filter(p => p.progress < 100).length;

  const fmt = (n: number) => "$" + n.toLocaleString();

  const statusColor = (s: string) => {
    switch (s) {
      case "active": case "paid": case "on-track": return c.success;
      case "lead": case "pending": case "draft": return c.warning;
      case "inactive": case "overdue": case "at-risk": return c.danger;
      default: return c.textMuted;
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: ic.barChart },
    { id: "clients", label: "Clients", icon: ic.users },
    { id: "invoices", label: "Invoices", icon: ic.fileInvoice },
    { id: "projects", label: "Projects", icon: ic.layers },
  ];

  const revenueByMonth = [
    { month: "Nov", value: 42000 },
    { month: "Dec", value: 38000 },
    { month: "Jan", value: 51000 },
    { month: "Feb", value: 47000 },
    { month: "Mar", value: 63000 },
    { month: "Apr", value: 55000 },
  ];
  const maxRevenue = Math.max(...revenueByMonth.map(r => r.value));

  return (
    <div className="flex h-full" style={{ background: c.bg, color: c.text }}>
      {/* Sidebar nav */}
      <div className="w-[200px] flex-shrink-0 flex flex-col border-r py-4" style={{ borderColor: c.border, background: c.surface }}>
        <div className="px-4 mb-4 flex items-center gap-2">
          <I d={ic.briefcase} s={20} c={c.accent} />
          <span className="font-semibold text-sm">Business Manager</span>
        </div>
        <div className="flex flex-col gap-0.5 px-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left"
              style={{ background: tab === t.id ? c.cardAlt : "transparent", color: tab === t.id ? c.text : c.textMuted }}>
              <I d={t.icon} s={15} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="px-4 py-3 mx-3 rounded-xl text-[11px]" style={{ background: c.cardAlt }}>
          <div className="font-semibold text-[12px] mb-1" style={{ color: c.text }}>Quick Stats</div>
          <div style={{ color: c.textMuted }}>{activeClients} active clients</div>
          <div style={{ color: c.textMuted }}>{activeProjects} active projects</div>
          <div style={{ color: c.warning }}>{pendingInvoices.length} pending invoices</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === "dashboard" && (
          <div>
            <h2 className="text-lg font-bold mb-4">Business Overview</h2>
            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total Revenue", value: fmt(totalRevenue), icon: ic.dollarSign, color: c.success, sub: "+12.5% from last month" },
                { label: "Active Clients", value: String(activeClients), icon: ic.users, color: c.accent, sub: `${clients.length} total` },
                { label: "Pending Amount", value: fmt(pendingAmount), icon: ic.fileInvoice, color: c.warning, sub: `${pendingInvoices.length} invoices` },
                { label: "Active Projects", value: String(activeProjects), icon: ic.layers, color: c.purple, sub: `${projects.length} total` },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-4 border" style={{ background: c.card, borderColor: c.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium" style={{ color: c.textMuted }}>{kpi.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.color + "18" }}>
                      <I d={kpi.icon} s={15} c={kpi.color} />
                    </div>
                  </div>
                  <div className="text-xl font-bold mb-0.5">{kpi.value}</div>
                  <div className="text-[11px]" style={{ color: c.textMuted }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue chart + Recent invoices */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Revenue chart */}
              <div className="rounded-xl border p-4" style={{ background: c.card, borderColor: c.border }}>
                <div className="text-[13px] font-semibold mb-3">Monthly Revenue</div>
                <div className="flex items-end gap-2 h-[140px]">
                  {revenueByMonth.map((r, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-medium" style={{ color: c.textMuted }}>{fmt(r.value).replace("$", "")}</div>
                      <div className="w-full rounded-t-md transition-all"
                        style={{ height: `${(r.value / maxRevenue) * 100}px`, background: i === revenueByMonth.length - 1 ? c.accent : c.accent + "50" }} />
                      <div className="text-[10px]" style={{ color: c.textMuted }}>{r.month}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent invoices */}
              <div className="rounded-xl border p-4" style={{ background: c.card, borderColor: c.border }}>
                <div className="text-[13px] font-semibold mb-3">Recent Invoices</div>
                <div className="flex flex-col gap-2">
                  {invoices.slice(0, 5).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: c.cardAlt }}>
                      <div>
                        <div className="text-[12px] font-medium">{inv.id}</div>
                        <div className="text-[11px]" style={{ color: c.textMuted }}>{inv.client}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-semibold">{fmt(inv.amount)}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: statusColor(inv.status) + "20", color: statusColor(inv.status) }}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project progress */}
            <div className="rounded-xl border p-4" style={{ background: c.card, borderColor: c.border }}>
              <div className="text-[13px] font-semibold mb-3">Project Progress</div>
              <div className="grid grid-cols-3 gap-3">
                {projects.map(p => (
                  <div key={p.id} className="rounded-lg p-3 border" style={{ borderColor: c.border, background: c.cardAlt }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[12px] font-semibold">{p.name}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: statusColor(p.status) + "20", color: statusColor(p.status) }}>
                        {p.status.replace("-", " ")}
                      </span>
                    </div>
                    <div className="text-[11px] mb-2" style={{ color: c.textMuted }}>{p.client}</div>
                    <div className="w-full h-1.5 rounded-full mb-1" style={{ background: c.border }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: statusColor(p.status) }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: c.textMuted }}>
                      <span>{p.progress}%</span>
                      <span>{fmt(p.spent)} / {fmt(p.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "clients" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Clients</h2>
              <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5" style={{ background: c.accent, color: "#fff" }}>
                <I d={ic.plus} s={13} c="#fff" /> Add Client
              </button>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: c.border }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: c.cardAlt }}>
                    {["Company", "Contact", "Email", "Revenue", "Deals", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: c.textMuted, borderBottom: `1px solid ${c.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(cl => (
                    <tr key={cl.id} className="transition-colors" style={{ borderBottom: `1px solid ${c.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-2.5 font-medium">{cl.name}</td>
                      <td className="px-4 py-2.5" style={{ color: c.textMuted }}>{cl.contact}</td>
                      <td className="px-4 py-2.5" style={{ color: c.accent }}>{cl.email}</td>
                      <td className="px-4 py-2.5 font-semibold">{fmt(cl.revenue)}</td>
                      <td className="px-4 py-2.5">{cl.deals}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: statusColor(cl.status) + "20", color: statusColor(cl.status) }}>
                          {cl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invoices</h2>
              <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5" style={{ background: c.accent, color: "#fff" }}>
                <I d={ic.plus} s={13} c="#fff" /> New Invoice
              </button>
            </div>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total Invoiced", value: fmt(invoices.reduce((s, i) => s + i.amount, 0)), color: c.text },
                { label: "Paid", value: fmt(invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0)), color: c.success },
                { label: "Pending", value: fmt(invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0)), color: c.warning },
                { label: "Overdue", value: fmt(invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0)), color: c.danger },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 border" style={{ borderColor: c.border, background: c.card }}>
                  <div className="text-[11px] mb-1" style={{ color: c.textMuted }}>{s.label}</div>
                  <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: c.border }}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ background: c.cardAlt }}>
                    {["Invoice", "Client", "Amount", "Date", "Due Date", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: c.textMuted, borderBottom: `1px solid ${c.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="transition-colors" style={{ borderBottom: `1px solid ${c.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.cardAlt)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: c.accent }}>{inv.id}</td>
                      <td className="px-4 py-2.5">{inv.client}</td>
                      <td className="px-4 py-2.5 font-semibold">{fmt(inv.amount)}</td>
                      <td className="px-4 py-2.5" style={{ color: c.textMuted }}>{inv.date}</td>
                      <td className="px-4 py-2.5" style={{ color: c.textMuted }}>{inv.due}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: statusColor(inv.status) + "20", color: statusColor(inv.status) }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Projects</h2>
              <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5" style={{ background: c.accent, color: "#fff" }}>
                <I d={ic.plus} s={13} c="#fff" /> New Project
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p.id} className="rounded-xl border p-4" style={{ borderColor: c.border, background: c.card }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[14px] font-semibold">{p.name}</div>
                      <div className="text-[11px]" style={{ color: c.textMuted }}>{p.client}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: statusColor(p.status) + "20", color: statusColor(p.status) }}>
                      {p.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full mb-2" style={{ background: c.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: statusColor(p.status) }} />
                  </div>
                  <div className="flex justify-between text-[11px] mb-3" style={{ color: c.textMuted }}>
                    <span>{p.progress}% complete</span>
                    <span>Due {p.deadline}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg p-2 text-center" style={{ background: c.cardAlt }}>
                      <div className="text-[10px]" style={{ color: c.textMuted }}>Budget</div>
                      <div className="text-[12px] font-semibold">{fmt(p.budget)}</div>
                    </div>
                    <div className="flex-1 rounded-lg p-2 text-center" style={{ background: c.cardAlt }}>
                      <div className="text-[10px]" style={{ color: c.textMuted }}>Spent</div>
                      <div className="text-[12px] font-semibold" style={{ color: p.spent > p.budget * 0.9 ? c.danger : c.text }}>{fmt(p.spent)}</div>
                    </div>
                    <div className="flex-1 rounded-lg p-2 text-center" style={{ background: c.cardAlt }}>
                      <div className="text-[10px]" style={{ color: c.textMuted }}>Remaining</div>
                      <div className="text-[12px] font-semibold" style={{ color: c.success }}>{fmt(p.budget - p.spent)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━ ALTERNUS AI AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type AgentActionType = "openApp" | "changeTheme" | "changeWallpaper" | "draftEmail" | "createDoc" | "readFile" | "runCommand" | "changeSetting" | "search" | "schedule";
interface AgentStep { label: string; status: "pending" | "running" | "done" | "error"; detail?: string }
interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  steps?: AgentStep[];
  workspace?: { type: "email" | "doc" | "file" | "terminal" | "settings" | "info"; title: string; content: string };
  timestamp: Date;
}

function AlternusAgentApp({ c, mode, setMode, wallpaper, setWallpaper, onOpenApp, onExecuteAIActions, osContext }: {
  c: typeof palette.dark; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  wallpaper: number; setWallpaper: (w: number) => void; onOpenApp: (id: WinId) => void;
  onExecuteAIActions?: (actions: OSAIAction[]) => void;
  osContext?: { openApps: string[]; theme: "dark" | "light" };
}) {
  const [msgs, setMsgs] = useState<AgentMessage[]>([{
    id: "welcome", role: "agent", timestamp: new Date(),
    text: "Hi! I'm **Alternus AI Agent** — your intelligent OS assistant.\n\nI can perform real actions such as:\n- 📂 Open & manage files\n- 📧 Draft & send email\n- 📄 Create & edit documents\n- ⚙️ Change system settings\n- 🖥️ Launch applications\n- 💻 Run terminal commands\n\nWhat would you like me to do today?",
  }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<AgentMessage["workspace"] | null>(null);
  const [agentCapability, setAgentCapability] = useState<"all" | "files" | "email" | "docs" | "settings">("all");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const QUICK_ACTIONS = [
    { label: "📂 Open Files", task: "Open the Files application" },
    { label: "📧 Draft Email", task: "Write a professional email to the team about the project progress" },
    { label: "📄 Create Document", task: "Create a new Word document with a professional structure" },
    { label: "🌙 Dark Mode", task: "Switch to dark mode" },
    { label: "☀️ Light Mode", task: "Switch to light mode" },
    { label: "🖥️ Change Wallpaper", task: "Change the wallpaper to OSwp 2" },
    { label: "💻 Terminal", task: "Open the terminal and check the system status" },
    { label: "📊 Dashboard", task: "Open the business dashboard" },
  ];

  const addStepUpdate = (msgId: string, stepIdx: number, status: AgentStep["status"]) => {
    setMsgs(prev => prev.map(m => {
      if (m.id !== msgId || !m.steps) return m;
      const steps = [...m.steps];
      steps[stepIdx] = { ...steps[stepIdx], status };
      return { ...m, steps };
    }));
  };

  const execute = async (userText: string) => {
    const msgId = Date.now().toString();

    // Show thinking steps immediately
    const steps: AgentStep[] = [
      { label: "Analyzing request...", status: "running" },
      { label: "Planning actions", status: "pending" },
      { label: "Executing", status: "pending" },
    ];

    const agentMsg: AgentMessage = { id: msgId, role: "agent", timestamp: new Date(), text: "", steps };
    setMsgs(prev => [...prev, agentMsg]);
    setIsThinking(true);

    try {
      // Build conversation history (last 10 turns, skip welcome message)
      const conversationHistory = msgs
        .filter(m => m.id !== "welcome" && m.text.trim().length > 0)
        .map(m => ({ role: m.role === "agent" ? "assistant" as const : "user" as const, content: m.text }))
        .slice(-10);

      const response = await fetch("/api/os/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          conversationHistory,
          osContext: osContext || { openApps: [], theme: "dark" },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.status}`);
      }

      addStepUpdate(msgId, 0, "done");
      addStepUpdate(msgId, 1, "running");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let actionsProcessed = false;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        if (!actionsProcessed) {
          // First newline-terminated line is the JSON actions object
          const newlineIdx = buffer.indexOf("\n");
          if (newlineIdx !== -1) {
            const jsonLine = buffer.slice(0, newlineIdx);
            const rest = buffer.slice(newlineIdx + 1);
            buffer = "";
            try {
              const { actions } = JSON.parse(jsonLine) as { actions: OSAIAction[] };
              if (actions && actions.length > 0 && onExecuteAIActions) {
                onExecuteAIActions(actions);
                addStepUpdate(msgId, 1, "done");
                addStepUpdate(msgId, 2, "running");
              } else {
                addStepUpdate(msgId, 1, "done");
                addStepUpdate(msgId, 2, "running");
              }
            } catch {
              addStepUpdate(msgId, 1, "done");
              addStepUpdate(msgId, 2, "running");
            }
            actionsProcessed = true;
            fullText += rest;
          }
        } else {
          fullText += buffer;
          buffer = "";
        }

        // Stream text into message in real-time
        if (fullText) {
          setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m));
        }
      }

      addStepUpdate(msgId, 2, "done");

      // Remove steps after a short delay for clean UI
      setTimeout(() => {
        setMsgs(prev => prev.map(m => m.id === msgId ? { ...m, steps: undefined } : m));
      }, 1200);

    } catch (error) {
      console.error("Agent execute error:", error);
      setMsgs(prev => prev.map(m =>
        m.id === msgId ? {
          ...m,
          text: "An error occurred while processing your request. Please try again.",
          steps: undefined,
        } : m
      ));
    } finally {
      setIsThinking(false);
    }
  };

  const send = async (text?: string) => {
    const m = (text || input).trim();
    if (!m || isThinking) return;
    setInput("");
    const userMsg: AgentMessage = { id: `u${Date.now()}`, role: "user", text: m, timestamp: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    await execute(m);
  };

  const statusColors: Record<AgentStep["status"], string> = {
    pending: c.textMuted, running: c.accent, done: c.success, error: c.danger,
  };

  // ── New state for redesigned UI ────────────────────────────
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatType, setFormatType] = useState("Text");
  const [toField, setToField] = useState("team@alternusart.com");
  const [subjectField, setSubjectField] = useState("");
  const [editContent, setEditContent] = useState("");

  // When workspace changes, populate editable content
  useEffect(() => {
    if (activeWorkspace) {
      setEditContent(activeWorkspace.content);
      if (activeWorkspace.type === "email") {
        const lines = activeWorkspace.content.split("\n");
        const subjLine = lines.find(l => l.startsWith("Subject:"));
        if (subjLine) setSubjectField(subjLine.replace("Subject:", "").trim());
      }
    }
  }, [activeWorkspace]);

  const dk = mode === "dark";
  const agBg = dk ? c.bg : "#F7F5FF";
  const agSidebarBg = dk ? c.surface : "linear-gradient(175deg,#F0EAFF 0%,#EDE8FF 40%,#EFF4FF 100%)";
  const agCardBg = dk ? c.card : "#FFFFFF";
  const agBorder = dk ? c.border : "rgba(120,80,220,0.10)";
  const agText = dk ? c.text : "#1a1525";
  const agTextSec = dk ? c.textSec : "#5a5470";
  const agTextMuted = dk ? c.textMuted : "#9896ab";
  const agAccent = "#7C3AED";
  const agAccentSoft = dk ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.10)";
  const agSelected = dk ? "rgba(79,142,247,0.14)" : "rgba(124,58,237,0.10)";

  // Format menu items
  const formatItems = [
    { id: "Text", label: "Text", shortcut: "" },
    { id: "H1", label: "Heading 1", shortcut: "H₁" },
    { id: "H2", label: "Heading 2", shortcut: "H₂" },
    { id: "H3", label: "Heading 3", shortcut: "H₃" },
    { id: "bullet", label: "Bulleted list", shortcut: "≡" },
    { id: "numbered", label: "Numbered list", shortcut: "#" },
    { id: "image", label: "Image", shortcut: "🖼" },
    { id: "attach", label: "Attachment", shortcut: "📎" },
  ];

  // Thread items from messages for sidebar
  const threadItems = msgs.filter(m => m.id !== "welcome").slice(-12).reverse();

  // Static inbox groups for sidebar (Image #4 style)
  const inboxGroups = [
    {
      id: "projects", label: "Projects", iconBg: "#5B6CF9", iconChar: "P",
      threads: [
        { id: "t1", sender: "Linda", tag: "[main]", preview: "Needs a review before...", avatar: "L", avatarBg: "#F97316" },
        { id: "t2", sender: "Newsletter", tag: "", preview: "", avatar: "N", avatarBg: "#10B981", isGroup: true, children: [
          { id: "t2a", sender: "Linda", tag: "", preview: "Linear auto-closed...", avatar: "L", avatarBg: "#F97316" },
          { id: "t2b", sender: "Linda", tag: "[main]", preview: "Needs a hover effect", avatar: "L", avatarBg: "#F97316" },
        ]},
      ],
    },
    {
      id: "design", label: "Design", iconBg: "#0EA5E9", iconChar: "D",
      threads: [],
    },
    {
      id: "team", label: "My team", iconBg: "#6B7280", iconChar: "T",
      threads: [
        { id: "t3", sender: "Necati, João, Me", tag: "", preview: "Hello, what's the update?", avatar: "N", avatarBg: "#7C3AED" },
        { id: "t4", sender: "Necati, Batu, Me", tag: "", preview: "UI feedback from client", avatar: "N", avatarBg: "#7C3AED" },
      ],
    },
  ];

  return (
    <div className="flex h-full overflow-hidden" style={{ background: agBg, fontFamily: "'Segoe UI Variable','Segoe UI',system-ui,-apple-system,sans-serif" }}>
      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 230, background: agSidebarBg, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRight: `1px solid ${agBorder}` }}>

        {/* Header */}
        <div className="px-3 pt-3 pb-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: agAccentSoft, border: `1px solid ${agAccent}22` }}>
              <I d={ic.sparkle} s={14} c={agAccent} f />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-tight" style={{ color: agText }}>Alternus Agent</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                <p className="text-[7.5px]" style={{ color: agTextMuted }}>Claude Opus 4.6 · Active</p>
              </div>
            </div>
            <button className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <I d={ic.settings} s={11} c={agTextMuted} />
            </button>
          </div>
          <button onClick={() => { setInput(""); inputRef.current?.focus(); setActiveWorkspace(null); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10.5px] font-medium transition-all"
            style={{ background: dk ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)", color: agText, border: `1px solid ${agBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            onMouseEnter={e => (e.currentTarget.style.background = dk ? "rgba(255,255,255,0.10)" : "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = dk ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)")}>
            <span className="text-[15px] leading-none font-light" style={{ color: agAccent }}>+</span>
            <span className="flex-1 text-left">New task</span>
            <span className="text-[8.5px]" style={{ color: agTextMuted }}>⌘ N</span>
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "none" }}>

          {/* Primary capability nav */}
          {[
            { id: "all",      icon: ic.sparkle,  label: "All tasks",  badge: msgs.filter(m => m.role === "user").length },
            { id: "email",    icon: ic.mail,     label: "Email",      badge: 0 },
            { id: "docs",     icon: ic.fileText, label: "Documents",  badge: 0 },
            { id: "files",    icon: ic.folder,   label: "Files",      badge: 0 },
            { id: "settings", icon: ic.settings, label: "Settings",   badge: 0 },
          ].map(item => (
            <button key={item.id} onClick={() => setAgentCapability(item.id as typeof agentCapability)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all"
              style={{ background: agentCapability === item.id ? agAccentSoft : "transparent" }}
              onMouseEnter={e => { if (agentCapability !== item.id) e.currentTarget.style.background = agSelected; }}
              onMouseLeave={e => { if (agentCapability !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <I d={item.icon} s={13} c={agentCapability === item.id ? agAccent : agTextMuted} />
              <span className="text-[10.5px] font-medium flex-1" style={{ color: agentCapability === item.id ? agAccent : agTextSec }}>{item.label}</span>
              {item.badge > 0 && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: agAccent, color: "#fff" }}>{item.badge}</span>
              )}
            </button>
          ))}

          <div className="mx-2 my-2.5" style={{ height: 1, background: agBorder }} />
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] px-2 pb-1.5" style={{ color: agTextMuted }}>Quick Actions</p>

          {[
            { icon: ic.monitor, label: "Open Apps",    task: "What applications can you open?" },
            { icon: ic.code,    label: "Terminal",     task: "Open the terminal" },
            { icon: ic.image,   label: "Wallpaper",    task: "Change the wallpaper to OSwp 2" },
          ].map(item => (
            <button key={item.label} onClick={() => send(item.task)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left mb-0.5 transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = agSelected)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <I d={item.icon} s={13} c={agTextMuted} />
              <span className="text-[10.5px] font-medium" style={{ color: agTextSec }}>{item.label}</span>
            </button>
          ))}

          {msgs.filter(m => m.role === "user").length > 0 && (
            <>
              <div className="mx-2 my-2.5" style={{ height: 1, background: agBorder }} />
              <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] px-2 pb-1.5" style={{ color: agTextMuted }}>Recent</p>
              {msgs.filter(m => m.role === "user").slice(-4).reverse().map(m => (
                <button key={m.id}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left mb-0.5 transition-all"
                  onMouseEnter={e => (e.currentTarget.style.background = agSelected)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agTextMuted }} />
                  <p className="text-[9px] truncate" style={{ color: agTextSec }}>{m.text}</p>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer model info */}
        <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${agBorder}` }}>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
            style={{ background: dk ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.05)", border: `1px solid ${agBorder}` }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: agAccentSoft }}>
              <I d={ic.brain} s={10} c={agAccent} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold truncate" style={{ color: agText }}>Claude Opus 4.6</p>
              <p className="text-[7px]" style={{ color: agTextMuted }}>200K ctx · Real OS actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: agCardBg }}>
        {activeWorkspace ? (
          /* ── WORKSPACE VIEW (email / doc / terminal) ── */
          <div className="flex flex-col h-full">

            {/* ── EMAIL COMPOSE VIEW ── */}
            {activeWorkspace.type === "email" && (
              <div className="flex flex-col h-full">
                {/* From chip */}
                <div className="px-6 pt-5 pb-2 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C3AED, #4F8EF7)" }}>
                      <I d={ic.sparkle} s={11} c="#fff" f />
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold" style={{ color: agText }}>Alternus AI Agent</span>
                      <span className="text-[11px] ml-2" style={{ color: agTextMuted }}>agent@alternusart.com</span>
                    </div>
                  </div>
                </div>
                {/* To / Cc */}
                <div className="px-6 py-2 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
                  <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                    {/* To avatars */}
                    {["Necati Koçlu", "João Almeida"].map(name => (
                      <div key={name} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: agAccentSoft, color: agAccent, border: `1px solid ${agAccent}22` }}>
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: agAccent, opacity: 0.8 }}>
                          <span className="text-[7px] text-white font-bold">{name[0]}</span>
                        </div>
                        <span>{name}</span>
                        <button className="ml-0.5 opacity-50 hover:opacity-100" style={{ color: agAccent }}>×</button>
                      </div>
                    ))}
                    <input value={toField} onChange={e => setToField(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-[11px] min-w-[80px]"
                      style={{ color: agText }} placeholder="Add recipient..." />
                  </div>
                  <button className="text-[10px] font-medium flex-shrink-0" style={{ color: agTextSec }}>Cc / Bcc</button>
                </div>
                {/* Subject */}
                <div className="px-6 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
                  <input value={subjectField} onChange={e => setSubjectField(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] font-semibold"
                    style={{ color: agText }} placeholder="Subject" />
                </div>
                {/* Body */}
                <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                    className="w-full h-full bg-transparent outline-none resize-none text-[12px] leading-relaxed"
                    style={{ color: agText, fontFamily: "-apple-system, 'Inter', sans-serif" }} />
                </div>
                {/* Rich text toolbar */}
                <div className="flex-shrink-0 px-4 py-2 flex items-center gap-1.5 relative" style={{ borderTop: `1px solid ${agBorder}` }}>
                  {/* Rewrite with AI */}
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
                    style={{ background: agAccentSoft, color: agAccent, border: `1px solid ${agAccent}25` }}
                    onMouseEnter={e => (e.currentTarget.style.background = agAccent + "18")}
                    onMouseLeave={e => (e.currentTarget.style.background = agAccentSoft)}>
                    <I d={ic.sparkle} s={11} c={agAccent} f /> Rewrite with AI
                  </button>
                  {/* Divider */}
                  <div className="w-px h-4 flex-shrink-0 mx-0.5" style={{ background: agBorder }} />
                  {/* Format dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowFormatMenu(v => !v)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{ background: showFormatMenu ? agSelected : "transparent", color: agTextSec, border: `1px solid ${showFormatMenu ? agBorder : "transparent"}` }}
                      onMouseEnter={e => { if (!showFormatMenu) e.currentTarget.style.background = agSelected + "60"; }}
                      onMouseLeave={e => { if (!showFormatMenu) e.currentTarget.style.background = "transparent"; }}>
                      {formatType} <I d={ic.chevD} s={9} c={agTextMuted} />
                    </button>
                    {showFormatMenu && (
                      <div className="absolute bottom-full left-0 mb-1 w-44 rounded-xl overflow-hidden z-50 py-1"
                        style={{ background: agCardBg, border: `1px solid ${agBorder}`, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
                        {formatItems.map(fi => (
                          <button key={fi.id} onClick={() => { setFormatType(fi.label); setShowFormatMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-1.5 text-[11px] transition-all text-left"
                            style={{ color: agText }}
                            onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <span className="w-4 text-center text-[10px]" style={{ color: agTextMuted }}>{fi.shortcut}</span>
                            <span className="flex-1">{fi.label}</span>
                            {formatType === fi.label && <span style={{ color: agAccent }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Divider */}
                  <div className="w-px h-4 flex-shrink-0 mx-0.5" style={{ background: agBorder }} />
                  {/* Format buttons */}
                  {[
                    { label: "B", title: "Bold", style: { fontWeight: 700 } },
                    { label: "I", title: "Italic", style: { fontStyle: "italic" } },
                    { label: "U", title: "Underline", style: { textDecoration: "underline" } },
                    { label: "S", title: "Strikethrough", style: { textDecoration: "line-through" } },
                  ].map(btn => (
                    <button key={btn.label} title={btn.title}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] transition-all"
                      style={{ color: agTextSec, ...btn.style }}
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {btn.label}
                    </button>
                  ))}
                  <button title="Link" className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                    onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <I d={ic.globe} s={12} c={agTextSec} />
                  </button>
                  <button title="Clear formatting" className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{ color: agTextSec }}
                    onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    T<span style={{ fontSize: 7, verticalAlign: "super", opacity: 0.5 }}>x</span>
                  </button>
                </div>
                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${agBorder}` }}>
                  <div className="flex items-center gap-2">
                    <button className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.trash} s={13} c={agTextMuted} />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{ color: agTextSec, border: `1px solid ${agBorder}` }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = agAccent + "50")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = agBorder)}>
                      + Add
                    </button>
                  </div>
                  {/* Send button */}
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
                    <button className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold"
                      style={{ background: dk ? c.text : "#111", color: dk ? c.bg : "#fff" }}>
                      <I d={ic.send} s={11} c={dk ? c.bg : "#fff"} /> Send
                    </button>
                    <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.2)" }} />
                    <button className="px-2 py-2" style={{ background: dk ? c.text : "#111", color: dk ? c.bg : "#fff" }}>
                      <I d={ic.chevD} s={9} c={dk ? c.bg : "#fff"} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOCUMENT VIEW ── */}
            {activeWorkspace.type === "doc" && (
              <div className="flex flex-col h-full">
                <div className="px-6 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
                  <input value={subjectField || activeWorkspace.title} onChange={e => setSubjectField(e.target.value)}
                    className="w-full bg-transparent outline-none text-[17px] font-bold"
                    style={{ color: agText }} placeholder="Document title" />
                </div>
                <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                    className="w-full h-full bg-transparent outline-none resize-none text-[12px] leading-relaxed"
                    style={{ color: agText, fontFamily: "-apple-system, 'Inter', sans-serif" }} />
                </div>
                {/* Toolbar (same as email) */}
                <div className="flex-shrink-0 px-4 py-2 flex items-center gap-1.5" style={{ borderTop: `1px solid ${agBorder}` }}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                    style={{ background: agAccentSoft, color: agAccent, border: `1px solid ${agAccent}25` }}>
                    <I d={ic.sparkle} s={11} c={agAccent} f /> Rewrite with AI
                  </button>
                  <div className="w-px h-4 mx-0.5" style={{ background: agBorder }} />
                  {["B", "I", "U"].map(b => (
                    <button key={b} className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold transition-all"
                      style={{ color: agTextSec }}
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected + "80")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{b}</button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    {[{ label: "💾 Save DOCX", primary: true }, { label: "📤 Export PDF" }].map(({ label, primary }) => (
                      <button key={label} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: primary ? (dk ? c.text : "#111") : agCardBg, color: primary ? (dk ? c.bg : "#fff") : agTextSec, border: `1px solid ${primary ? "transparent" : agBorder}` }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TERMINAL / INFO / SETTINGS VIEW ── */}
            {(activeWorkspace.type === "terminal" || activeWorkspace.type === "info" || activeWorkspace.type === "settings") && (
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}` }}>
                  <span className="text-[12px] font-semibold" style={{ color: agText }}>{activeWorkspace.title}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {[{ label: "📋 Copy" }, { label: "💾 Save" }, { label: "🔄 Refresh" }].map(({ label }) => (
                      <button key={label} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                        style={{ background: agAccentSoft, color: agTextSec, border: `1px solid ${agBorder}` }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = agAccent + "50")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = agBorder)}>
                        {label}
                      </button>
                    ))}
                    <button onClick={() => setActiveWorkspace(null)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ color: agTextMuted }}
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.close} s={11} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-auto" style={{ scrollbarWidth: "none" }}>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: activeWorkspace.type === "terminal" ? c.success : agTextSec, fontFamily: activeWorkspace.type === "terminal" ? "monospace" : "inherit" }}>
                    {activeWorkspace.content}
                  </pre>
                </div>
              </div>
            )}
          </div>

        ) : (
          /* ── CHAT + INPUT VIEW (no workspace) ── */
          <div className="flex flex-col h-full" onClick={() => setShowFormatMenu(false)}>
            {msgs.filter(m => m.role === "user").length === 0 && !isThinking ? (
              /* ── DASHBOARD VIEW ── */
              <div className="flex flex-col h-full">
                {/* Scrollable content — full width, no header */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", background: dk ? agBg : "#F7F8FA" }}>
                  <div style={{ maxWidth: 948, margin: "0 auto", padding: "48px 32px 32px 32px" }}>

                  {/* Big input card */}
                  <div className="mb-7 rounded-2xl overflow-hidden" style={{ background: dk ? c.card : "#fff", border: `1px solid ${agBorder}`, boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
                    <div className="px-5 pt-5 pb-3">
                      <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Ask me to do anything on your OS — email, files, apps, system..."
                        className="w-full bg-transparent outline-none text-[13px]"
                        style={{ color: agText, caretColor: agAccent }} />
                    </div>
                    <div className="px-5 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {[
                          { icon: ic.upload, label: "Upload", color: "#8B5CF6" },
                          { icon: ic.globe,  label: "Research", color: "#3B82F6" },
                          { icon: ic.code,   label: "Code", color: "#10B981" },
                          { icon: ic.image,  label: "Image", color: "#F97316" },
                        ].map(btn => (
                          <button key={btn.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9.5px] font-medium transition-all"
                            style={{ color: agTextMuted, border: `1px solid ${agBorder}` }}
                            onMouseEnter={e => { e.currentTarget.style.color = btn.color; e.currentTarget.style.borderColor = btn.color + "50"; e.currentTarget.style.background = btn.color + "0D"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = agTextMuted; e.currentTarget.style.borderColor = agBorder; e.currentTarget.style.background = "transparent"; }}>
                            <I d={btn.icon} s={11} c={agTextMuted} /> {btn.label}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => send()} disabled={!input.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: input.trim() ? agAccent : (dk ? c.cardAlt : "#EFEFEF"), boxShadow: input.trim() ? `0 2px 14px ${agAccent}44` : "none" }}>
                        <I d={ic.send} s={14} c={input.trim() ? "#fff" : agTextMuted} />
                      </button>
                    </div>
                  </div>

                  {/* Core capabilities */}
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: agTextMuted }}>What I can do</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { icon: ic.mail,     label: "Email",     desc: "Draft & send messages",  color: "#F97316", bg: "#FFF4ED", task: "Draft a professional email to the team" },
                      { icon: ic.fileText, label: "Documents", desc: "Create & edit docs",      color: "#3B82F6", bg: "#EFF6FF", task: "Create a new Word document" },
                      { icon: ic.folder,   label: "Files",     desc: "Manage & organize",       color: "#10B981", bg: "#ECFDF5", task: "Show me what you can do with files" },
                      { icon: ic.globe,    label: "Research",  desc: "Browse & analyze info",   color: "#8B5CF6", bg: "#F5F3FF", task: "Research the latest AI trends" },
                      { icon: ic.monitor,  label: "Apps",      desc: "Launch & control apps",   color: "#06B6D4", bg: "#ECFEFF", task: "What applications can you open?" },
                      { icon: ic.terminal, label: "Terminal",  desc: "Run system commands",     color: "#6B7280", bg: "#F9FAFB", task: "Open the terminal" },
                    ].map(cap => (
                      <button key={cap.label} onClick={() => send(cap.task)}
                        className="flex flex-col gap-3 p-5 rounded-2xl text-left"
                        style={{ background: dk ? c.card : "#fff", border: `1px solid ${agBorder}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "all 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${cap.color}22`; e.currentTarget.style.borderColor = cap.color + "40"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = agBorder; e.currentTarget.style.transform = "translateY(0)"; }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: dk ? c.cardAlt : cap.bg }}>
                          <I d={cap.icon} s={16} c={cap.color} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold leading-snug" style={{ color: agText }}>{cap.label}</p>
                          <p className="text-[8.5px] leading-snug mt-1" style={{ color: agTextMuted }}>{cap.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* System / OS agent functions */}
                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { icon: ic.sun,      label: "Theme",        desc: "Switch dark / light",      color: "#F59E0B", bg: "#FFFBEB", task: "Switch to dark mode" },
                      { icon: ic.image,    label: "Wallpaper",    desc: "Change desktop background", color: "#EC4899", bg: "#FDF2F8", task: "Change the wallpaper to OSwp 2" },
                      { icon: ic.wifi,     label: "Network",      desc: "WiFi & connection info",    color: "#0EA5E9", bg: "#F0F9FF", task: "Show me the network and WiFi status" },
                      { icon: ic.cpu,      label: "System",       desc: "CPU, memory & status",      color: "#64748B", bg: "#F8FAFC", task: "Show me the current system status and performance" },
                      { icon: ic.calendar, label: "Calendar",     desc: "Schedule & events",         color: "#7C3AED", bg: "#F5F3FF", task: "Open the calendar and show today's schedule" },
                      { icon: ic.power,    label: "Power",        desc: "Restart or shut down",      color: "#EF4444", bg: "#FEF2F2", task: "Show me power and restart options" },
                    ].map(cap => (
                      <button key={cap.label} onClick={() => send(cap.task)}
                        className="flex flex-col gap-3 p-5 rounded-2xl text-left"
                        style={{ background: dk ? c.card : "#fff", border: `1px solid ${agBorder}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "all 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${cap.color}22`; e.currentTarget.style.borderColor = cap.color + "40"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = agBorder; e.currentTarget.style.transform = "translateY(0)"; }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: dk ? c.cardAlt : cap.bg }}>
                          <I d={cap.icon} s={16} c={cap.color} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold leading-snug" style={{ color: agText }}>{cap.label}</p>
                          <p className="text-[8.5px] leading-snug mt-1" style={{ color: agTextMuted }}>{cap.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quick fire actions */}
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: agTextMuted }}>Quick actions</p>
                  <div className="flex flex-wrap gap-2 mb-7">
                    {[
                      { label: "🌙 Dark mode",          task: "Switch to dark mode" },
                      { label: "☀️ Light mode",         task: "Switch to light mode" },
                      { label: "🖼 Change wallpaper",   task: "Change the wallpaper to OSwp 2" },
                      { label: "📊 Open dashboard",     task: "Open the business dashboard" },
                      { label: "💻 Open terminal",      task: "Open the terminal" },
                      { label: "📂 Open files",         task: "Open the Files application" },
                      { label: "📧 Draft email",        task: "Write a professional email to the team about the project progress" },
                      { label: "📄 New document",       task: "Create a new Word document with a professional structure" },
                    ].map(qa => (
                      <button key={qa.label} onClick={() => send(qa.task)}
                        className="px-3 py-1.5 rounded-full text-[9.5px] font-medium transition-all"
                        style={{ background: dk ? c.card : "#fff", color: agTextSec, border: `1px solid ${agBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = agAccentSoft; e.currentTarget.style.color = agAccent; e.currentTarget.style.borderColor = agAccent + "40"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = dk ? c.card : "#fff"; e.currentTarget.style.color = agTextSec; e.currentTarget.style.borderColor = agBorder; }}>
                        {qa.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-[8px] pb-2" style={{ color: agTextMuted }}>
                    Powered by <span style={{ color: agAccent, fontWeight: 700 }}>Claude Opus 4.6</span> · Real OS actions
                  </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── CHAT VIEW (has messages) ── */
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${agBorder}`, background: dk ? c.surface : "#FAFAFA" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#4F8EF7)", boxShadow: "0 2px 8px rgba(124,58,237,0.28)" }}>
                    <I d={ic.sparkle} s={13} c="#fff" f />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-bold leading-tight" style={{ color: agText }}>Alternus AI Agent</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10B981" }} />
                      <p className="text-[8px]" style={{ color: agTextMuted }}>Active · Claude Opus 4.6</p>
                    </div>
                  </div>
                  <button onClick={() => setMsgs([{ id: "welcome", role: "agent", timestamp: new Date(), text: "" }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium transition-all flex-shrink-0"
                    style={{ color: agTextMuted, border: `1px solid ${agBorder}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <I d={ic.plus} s={10} c={agTextMuted} /> New
                  </button>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <I d={ic.menu} s={12} c={agTextMuted} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-5" style={{ scrollbarWidth: "none" }}>
                  <div className="flex-1" />
                  {msgs.map(m => (
                    <div key={m.id}>
                      {m.id === "welcome" ? (
                        /* ── Welcome card ── */
                        <div className="flex flex-col items-center text-center py-4 px-2">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                            style={{ background: "linear-gradient(135deg,#7C3AED,#4F8EF7)", boxShadow: "0 6px 24px rgba(124,58,237,0.28)" }}>
                            <I d={ic.sparkle} s={22} c="#fff" f />
                          </div>
                          <p className="text-[16px] font-bold mb-1" style={{ color: agText }}>
                            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
                          </p>
                          <p className="text-[10.5px] mb-5" style={{ color: agTextMuted }}>
                            I'm your intelligent OS assistant — ready to act on your system
                          </p>
                          <div className="grid grid-cols-3 gap-2 w-full" style={{ maxWidth: 420 }}>
                            {[
                              { icon: ic.mail,     label: "Draft Email",   color: "#F97316", bg: "#FFF4ED", task: "Draft a professional email to the team" },
                              { icon: ic.fileText, label: "New Document",  color: "#3B82F6", bg: "#EFF6FF", task: "Create a new Word document" },
                              { icon: ic.folder,   label: "Open Files",   color: "#10B981", bg: "#ECFDF5", task: "Open the Files application" },
                              { icon: ic.sun,      label: "Dark Mode",    color: "#F59E0B", bg: "#FFFBEB", task: "Switch to dark mode" },
                              { icon: ic.monitor,  label: "Launch App",   color: "#06B6D4", bg: "#ECFEFF", task: "What applications can you open?" },
                              { icon: ic.cpu,      label: "System Info",  color: "#8B5CF6", bg: "#F5F3FF", task: "Show me the current system status" },
                            ].map(cap => (
                              <button key={cap.label} onClick={() => send(cap.task)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                                style={{ background: dk ? c.card : cap.bg, border: `1px solid ${agBorder}` }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 14px ${cap.color}22`; e.currentTarget.style.borderColor = cap.color + "40"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = agBorder; e.currentTarget.style.transform = "translateY(0)"; }}>
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: dk ? c.cardAlt : "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                                  <I d={cap.icon} s={12} c={cap.color} />
                                </div>
                                <span className="text-[9.5px] font-semibold leading-snug" style={{ color: agText }}>{cap.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* ── Regular message ── */
                        <div className={`flex ${m.role === "user" ? "justify-end" : "gap-2.5"}`}>
                          {m.role === "agent" && (
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: "linear-gradient(135deg,#7C3AED,#4F8EF7)", boxShadow: "0 2px 8px rgba(124,58,237,0.28)" }}>
                              <I d={ic.sparkle} s={11} c="#fff" f />
                            </div>
                          )}
                          <div style={{ maxWidth: "78%" }}>
                            {m.steps && m.steps.length > 0 && (
                              <div className="mb-2 px-3 py-2.5 rounded-xl space-y-1.5" style={{ background: agAccentSoft, border: `1px solid ${agAccent}18` }}>
                                {m.steps.map((s, si) => (
                                  <div key={si} className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: statusColors[s.status] + "22" }}>
                                      {s.status === "done" ? (
                                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={c.success} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                      ) : s.status === "running" ? (
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: agAccent }} />
                                      ) : (
                                        <div className="w-1 h-1 rounded-full" style={{ background: agTextMuted }} />
                                      )}
                                    </div>
                                    <span className="text-[9px]" style={{ color: s.status === "running" ? agAccent : agTextSec }}>{s.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {m.text.trim().length > 0 && (
                              <div className="px-4 py-3 text-[11px] leading-relaxed"
                                style={{
                                  background: m.role === "user" ? "linear-gradient(135deg,#7C3AED,#5B6CF9)" : (dk ? c.surface : "#fff"),
                                  color: m.role === "user" ? "#fff" : agText,
                                  border: m.role === "agent" ? `1px solid ${agBorder}` : "none",
                                  borderLeft: m.role === "agent" ? `3px solid ${agAccent}30` : undefined,
                                  boxShadow: m.role === "user" ? "0 3px 14px rgba(124,58,237,0.28)" : "0 1px 6px rgba(0,0,0,0.05)",
                                  whiteSpace: "pre-line",
                                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                                }}>
                                <AIFormattedText text={m.text} c={c} />
                              </div>
                            )}
                            {m.workspace && (
                              <button onClick={() => setActiveWorkspace(m.workspace!)}
                                className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl text-[9.5px] font-medium w-full transition-all"
                                style={{ background: dk ? c.cardAlt : "#EDE8FF", color: agAccent, border: `1px solid ${agAccent}20` }}
                                onMouseEnter={e => (e.currentTarget.style.background = agAccentSoft)}
                                onMouseLeave={e => (e.currentTarget.style.background = dk ? c.cardAlt : "#EDE8FF")}>
                                <I d={ic.layers} s={10} c={agAccent} />
                                <span className="flex-1 text-left truncate font-semibold">{m.workspace.title}</span>
                                <span className="opacity-50 text-[11px]">→</span>
                              </button>
                            )}
                            <p className="text-[7px] mt-1 px-1" style={{ color: agTextMuted }}>
                              {m.timestamp.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#7C3AED,#4F8EF7)", boxShadow: "0 2px 8px rgba(124,58,237,0.28)" }}>
                        <I d={ic.sparkle} s={11} c="#fff" f />
                      </div>
                      <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
                        style={{ background: dk ? c.surface : "#fff", border: `1px solid ${agBorder}`, borderLeft: `3px solid ${agAccent}30`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", borderRadius: "4px 16px 16px 16px" }}>
                        {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: agAccent, animationDelay: `${i * 0.15}s` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Quick actions */}
                <div className="flex-shrink-0 px-4 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none", borderTop: `1px solid ${agBorder}` }}>
                  <span className="text-[7.5px] font-bold uppercase tracking-widest flex-shrink-0 mr-1" style={{ color: agTextMuted }}>Quick:</span>
                  {[
                    { icon: ic.folder,   label: "Files",      color: "#10B981", task: "Open the Files application" },
                    { icon: ic.mail,     label: "Email",      color: "#F97316", task: "Write a professional email to the team about the project progress" },
                    { icon: ic.fileText, label: "Document",   color: "#3B82F6", task: "Create a new Word document with a professional structure" },
                    { icon: ic.moon,     label: "Dark",       color: "#6366F1", task: "Switch to dark mode" },
                    { icon: ic.sun,      label: "Light",      color: "#F59E0B", task: "Switch to light mode" },
                    { icon: ic.image,    label: "Wallpaper",  color: "#EC4899", task: "Change the wallpaper to OSwp 2" },
                    { icon: ic.terminal, label: "Terminal",   color: "#6B7280", task: "Open the terminal" },
                    { icon: ic.grid,     label: "Dashboard",  color: "#8B5CF6", task: "Open the business dashboard" },
                  ].map(qa => (
                    <button key={qa.label} onClick={() => send(qa.task)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-medium flex-shrink-0 transition-all"
                      style={{ background: dk ? c.card : "#fff", color: agTextSec, border: `1px solid ${agBorder}` }}
                      onMouseEnter={e => { e.currentTarget.style.background = qa.color + "14"; e.currentTarget.style.color = qa.color; e.currentTarget.style.borderColor = qa.color + "45"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = dk ? c.card : "#fff"; e.currentTarget.style.color = agTextSec; e.currentTarget.style.borderColor = agBorder; }}>
                      <I d={qa.icon} s={10} c={qa.color} />
                      {qa.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex-shrink-0 px-4 pb-4 pt-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                    style={{ background: dk ? c.surface : "#fff", border: `1.5px solid ${input.trim() ? agAccent + "55" : agBorder}`, boxShadow: input.trim() ? "0 4px 20px rgba(124,58,237,0.12)" : "0 1px 8px rgba(0,0,0,0.05)", transition: "border-color 0.15s, box-shadow 0.15s" }}>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ color: agTextMuted }}
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.plus} s={14} c={agTextMuted} />
                    </button>
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder="Ask the agent to do anything on your OS..."
                      disabled={isThinking}
                      className="flex-1 bg-transparent outline-none text-[11px]" style={{ color: agText }} />
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      onMouseEnter={e => (e.currentTarget.style.background = agSelected)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <I d={ic.mic} s={13} c={agTextMuted} />
                    </button>
                    <button onClick={() => send()} disabled={isThinking || !input.trim()}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                      style={{ background: input.trim() && !isThinking ? "linear-gradient(135deg,#7C3AED,#4F8EF7)" : (dk ? c.cardAlt : "#EFEFEF"), boxShadow: input.trim() && !isThinking ? "0 2px 10px rgba(124,58,237,0.40)" : "none", opacity: isThinking ? 0.5 : 1 }}>
                      <I d={ic.send} s={12} c={input.trim() && !isThinking ? "#fff" : agTextMuted} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━ MAIN OS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AlternusOS() {
  const [mode, setMode] = useState<ThemeMode>("light");
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
  const [showCtrlAi, setShowCtrlAi] = useState(false);
  const [ctrlAiInput, setCtrlAiInput] = useState("");
  const [ctrlAiChips, setCtrlAiChips] = useState(true);
  const ctrlAiInputRef = useRef<HTMLInputElement>(null);
  const [ctrlAiMode, setCtrlAiMode] = useState<"chat" | "write" | "code" | "image" | "research" | "translate">("chat");
  const [ctrlAiTab, setCtrlAiTab] = useState<"suggestions" | "recent" | "tools">("suggestions");
  const [ctrlAiRecent] = useState([
    { text: "Summarize this document", icon: ic.fileText },
    { text: "Write a professional email", icon: ic.mail },
    { text: "Debug my code", icon: ic.code },
    { text: "Generate a creative story", icon: ic.pen },
  ]);
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
  const [wallpaper, setWallpaper] = useState(1);
  const [recoveryFiles, setRecoveryFiles] = useState<RecoveryFile[]>([]);
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [installingApp, setInstallingApp] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [paymentModal, setPaymentModal] = useState<{ name: string; price: string; icon: string; iconBg: string } | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [launchSearch, setLaunchSearch] = useState("");
  const [launchCategory, setLaunchCategory] = useState<"all" | "ai" | "productivity" | "media" | "system" | "web">("all");
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [activeSpace, setActiveSpace] = useState(1);
  const [showSpacesView, setShowSpacesView] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
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
    { id: "aihub", title: "AI Studio", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 40, w: 720, h: 520 },
    { id: "aivoice", title: "AI Voice", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 300, y: 80, w: 380, h: 440 },
    { id: "knowledge", title: "Knowledge Base", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 50, w: 560, h: 480 },
    { id: "sysmon", title: "System Monitor", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 50, w: 500, h: 480 },
    { id: "business", title: "Business Manager", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 30, w: 820, h: 540 },
    { id: "agent", title: "Alternus AI Agent", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 60, y: 30, w: 900, h: 600 },
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
      aihub: { w: 720, h: 520 },
      aivoice: { w: 380, h: 440 },
      knowledge: { w: 580, h: 480 },
      sysmon: { w: 500, h: 480 },
      business: { w: 820, h: 540 },
      agent: { w: 900, h: 600 },
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

  // ━━━━ AI ACTIONS EXECUTOR (called by AI Agent & AI Chat) ━━
  const executeAIActions = useCallback((actions: OSAIAction[]) => {
    for (const action of actions) {
      switch (action.type) {
        case "open_app":
          openWin(action.payload.app_id as WinId);
          break;
        case "close_app":
          closeWin(action.payload.app_id as WinId);
          break;
        case "minimize_app":
          minimizeWin(action.payload.app_id as WinId);
          break;
        case "send_notification":
          addAINotification("suggestion", action.payload.title || "AI", action.payload.message || "", ic.sparkle);
          break;
      }
    }
  }, [openWin, closeWin, minimizeWin, addAINotification]);

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
      // Ctrl+A — open AI overlay over focused window
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        setShowCtrlAi(p => { if (!p) setTimeout(() => ctrlAiInputRef.current?.focus(), 50); return !p; });
        setCtrlAiChips(true);
        setCtrlAiInput("");
      }
      // Escape closes spotlight / spaces / panels
      if (e.key === "Escape") {
        setShowLaunchpad(false);
        setShowSpotlight(false);
        setShowSpacesView(false);
        setShowTaskView(false);
        setShowApps(false);
        setShowNotifications(false);
        setShowWifiPanel(false);
        setShowProfilePanel(false);
        setShowAIFrame(false);
        setShowAiFixMenu(false);
        setShowCtrlAi(false);
        setCtrlAiChips(false);
        setShowAiChat(false);
        setShowAISidebar(false);
        setContextMenu(null);
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
      // Ctrl+T — Task View (all open windows)
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        setShowTaskView(p => !p);
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
      { keys: ["ai hub", "ai studio", "multi model", "gpt", "claude", "gemini", "llama", "compare", "model", "chat ai", "ai chat"],
        id: "aihub", title: "AI Studio", icon: ic.sparkle, description: "Multi-model AI studio" },
      { keys: ["voice", "speech", "microphone", "text to speech", "speech to text", "stt", "tts", "dictate", "transcribe"],
        id: "aivoice", title: "AI Voice", icon: ic.mic, description: "Speech-to-text and text-to-speech" },
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
    ai: <AIChat c={c} mode={mode} setMode={setMode} onOpenApp={openWin} onExecuteAIActions={executeAIActions} osContext={{ openApps: wins.filter(w => w.isOpen && !w.isMinimized).map(w => w.id), theme: mode }} />,
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
    aivoice: <AIVoiceApp c={c} />,
    knowledge: <KnowledgeApp c={c} />,
    sysmon: <SysMonApp c={c} />,
    business: <BusinessApp c={c} />,
    agent: <AlternusAgentApp c={c} mode={mode} setMode={setMode} wallpaper={wallpaper} setWallpaper={setWallpaper} onOpenApp={openWin} onExecuteAIActions={executeAIActions} osContext={{ openApps: wins.filter(w => w.isOpen && !w.isMinimized).map(w => w.id), theme: mode }} />,
  };

  const dockApps: { id: WinId; icon: string; label: string; color: string; category: "ai" | "productivity" | "media" | "system" | "web" }[] = [
    { id: "agent", icon: ic.sparkle, label: "Alternus AI Agent", color: "#7C3AED", category: "ai" },
    { id: "aihub", icon: ic.sparkle, label: "AI Studio", color: "#A78BFA", category: "ai" },
    { id: "aivoice", icon: ic.mic, label: "AI Voice", color: "#FBBF24", category: "ai" },
    { id: "knowledge", icon: ic.bookOpen, label: "Knowledge", color: "#F97316", category: "ai" },
    { id: "code", icon: ic.code, label: "Code", color: c.purple, category: "productivity" },
    { id: "monaco", icon: ic.code, label: "VS Code", color: "#007ACC", category: "productivity" },
    { id: "word", icon: ic.fileText, label: "Word", color: c.accentText, category: "productivity" },
    { id: "notes", icon: ic.note, label: "Notes", color: "#FBBF24", category: "productivity" },
    { id: "tasks", icon: ic.checkSquare, label: "Tasks", color: "#34D399", category: "productivity" },
    { id: "calculator", icon: ic.calc, label: "Calc", color: "#8ABF8A", category: "productivity" },
    { id: "calendar", icon: ic.calendar, label: "Calendar", color: "#60A5FA", category: "productivity" },
    { id: "dashboard", icon: ic.grid, label: "Dashboard", color: "#60A5FA", category: "productivity" },
    { id: "movies", icon: ic.film, label: "Movies", color: c.purple, category: "media" },
    { id: "music", icon: ic.music, label: "Music", color: "#F472B6", category: "media" },
    { id: "studio", icon: ic.pen, label: "Studio", color: "#A78BFA", category: "media" },
    { id: "terminal", icon: ic.terminal, label: "Terminal", color: c.success, category: "system" },
    { id: "files", icon: ic.folder, label: "Files", color: c.warning, category: "system" },
    { id: "settings", icon: ic.settings, label: "Settings", color: c.textSec, category: "system" },
    { id: "controlpanel", icon: ic.monitor, label: "Control Panel", color: c.textSec, category: "system" },
    { id: "recovery", icon: ic.shield, label: "Recovery", color: c.success, category: "system" },
    { id: "downloads", icon: ic.download, label: "Downloads", color: "#34D399", category: "system" },
    { id: "sysmon", icon: ic.activity, label: "System Monitor", color: "#34D399", category: "system" },
    { id: "browser", icon: ic.globe, label: "Browser", color: c.accentText, category: "web" },
    { id: "weather", icon: ic.cloud, label: "Weather", color: "#60A5FA", category: "web" },
    { id: "news", icon: ic.newspaper, label: "News", color: c.danger, category: "web" },
    { id: "mail", icon: ic.mail, label: "Mail", color: "#F97316", category: "web" },
    { id: "store", icon: ic.store, label: "Store", color: c.accent, category: "web" },
    { id: "business", icon: ic.briefcase, label: "Business", color: "#6366F1", category: "web" },
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
      <style>{`
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        .ai-bar-input::placeholder { color: rgba(255,255,255,0.65); }
        @keyframes os-page-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes os-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .os-page-enter { animation: os-page-in 0.18s cubic-bezier(0.4,0,0.2,1) both; }
        .os-fade-enter { animation: os-fade-in 0.15s ease both; }
      `}</style>
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
        onClick={() => { if (showApps) setShowApps(false); setShowWifiPanel(false); setShowProfilePanel(false); setShowAISidebar(false); setContextMenu(null); if (showAIFrame && !aiResponse) setShowAIFrame(false); setShowAiFixMenu(false); setShowNotifications(false); setShowCtrlAi(false); setShowSpotlight(false); setShowSpacesView(false); setShowAiChat(false); }}
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
                      {(n === 1 ? ["terminal", "code", "files"] : n === 2 ? ["aihub", "ai", "knowledge"] : ["mail", "tasks", "dashboard"]).map(id => (
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

        {/* ━━━━ Task View (Ctrl+T) ━━━━ */}
        {showTaskView && (() => {
          const openW = wins.filter(w => w.isOpen);
          const topZ = Math.max(...openW.map(w => w.zIndex), 0);
          const closeView = () => setShowTaskView(false);
          return (
            <div
              className="absolute inset-0 z-[300] flex flex-col"
              style={{ backdropFilter: "blur(26px)", WebkitBackdropFilter: "blur(26px)", background: "rgba(0,0,0,0.60)" }}
              onClick={closeView}
            >
              <style>{`
                @keyframes tv-in {
                  from { opacity:0; transform:scale(0.94) translateY(16px); }
                  to   { opacity:1; transform:scale(1) translateY(0); }
                }
                @keyframes tv-card-in {
                  from { opacity:0; transform:translateY(20px) scale(0.95); }
                  to   { opacity:1; transform:translateY(0) scale(1); }
                }
                .tv-root  { animation: tv-in 0.26s cubic-bezier(.22,.68,0,1.1) both; }
                .tv-card  { animation: tv-card-in 0.28s cubic-bezier(.22,.68,0,1.1) both; }
              `}</style>

              {/* Header */}
              <div className="tv-root" style={{ textAlign: "center", paddingTop: 44, paddingBottom: 0, flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Task View</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>
                  {openW.length === 0 ? "No open windows" : `${openW.length} window${openW.length !== 1 ? "s" : ""} open`} · Ctrl+T or Esc to close
                </p>
              </div>

              {/* Window cards grid */}
              <div
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 60px 48px" }}
              >
                {openW.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <I d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" s={28} c="rgba(255,255,255,0.25)" />
                    </div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>No windows open</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Open an app from the dock or All Apps</p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: openW.length <= 3 ? `repeat(${openW.length}, 260px)` : openW.length <= 6 ? "repeat(3, 260px)" : "repeat(4, 230px)",
                    gap: 20,
                    justifyContent: "center",
                  }}>
                    {openW.sort((a, b) => b.zIndex - a.zIndex).map((w, i) => {
                      const app = dockApps.find(a => a.id === w.id);
                      const color = app?.color ?? c.accent;
                      const icon = app?.icon ?? ic.sparkle;
                      const isActive = w.zIndex === topZ;
                      const isMinimized = w.isMinimized;
                      return (
                        <div
                          key={w.id}
                          className="tv-card"
                          style={{ animationDelay: `${i * 0.04}s`, cursor: "pointer" }}
                          onClick={() => {
                            if (isMinimized) setWins(p => p.map(ww => ww.id === w.id ? { ...ww, isMinimized: false } : ww));
                            focusWin(w.id);
                            closeView();
                          }}
                        >
                          {/* Preview card */}
                          <div style={{
                            borderRadius: 14,
                            overflow: "hidden",
                            border: `2px solid ${isActive ? c.accent : "rgba(255,255,255,0.12)"}`,
                            boxShadow: isActive ? `0 0 0 1px ${c.accent}40, 0 16px 40px rgba(0,0,0,0.45)` : "0 8px 28px rgba(0,0,0,0.4)",
                            transition: "transform 0.15s, box-shadow 0.15s",
                            background: c.bg,
                            position: "relative",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = isActive ? `0 0 0 1px ${c.accent}60, 0 22px 48px rgba(0,0,0,0.55)` : "0 18px 44px rgba(0,0,0,0.55)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = isActive ? `0 0 0 1px ${c.accent}40, 0 16px 40px rgba(0,0,0,0.45)` : "0 8px 28px rgba(0,0,0,0.4)"; }}
                          >
                            {/* Fake window preview */}
                            <div style={{ height: 22, background: c.surface, display: "flex", alignItems: "center", paddingLeft: 10, gap: 5, borderBottom: `1px solid ${c.border}` }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF5F57" }} />
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBD2E" }} />
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28CA41" }} />
                              <span style={{ fontSize: 9, color: c.textMuted, marginLeft: 6, fontWeight: 500 }}>{w.title}</span>
                            </div>
                            {/* App visual area */}
                            <div style={{ height: 140, background: `linear-gradient(135deg, ${color}14 0%, ${c.bg} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                              {/* Background pattern */}
                              <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 30% 40%, ${color}18 0%, transparent 60%)`, pointerEvents: "none" }} />
                              <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(145deg, ${color}EE, ${color}77)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${color}50`, position: "relative", zIndex: 1 }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%", borderRadius: "16px 16px 60% 60%", background: "linear-gradient(180deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 100%)" }} />
                                <I d={icon} s={22} f c={`${color}00`} grad={["rgba(255,255,255,0.97)", "rgba(255,255,255,0.75)"]} />
                              </div>
                              {/* Minimized badge */}
                              {isMinimized && (
                                <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", borderRadius: 5, padding: "2px 6px" }}>
                                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>Minimized</span>
                                </div>
                              )}
                            </div>
                            {/* Active glow bar */}
                            {isActive && <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }} />}
                          </div>

                          {/* Label + close */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, padding: "0 4px" }}>
                            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                              {w.title}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); closeWinWithAI(w.id); if (openW.length === 1) closeView(); }}
                              style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.12s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.7)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                            >
                              <I d={ic.close} s={9} c="#fff" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ━━━━ Search Button — top center ━━━━ */}
        <button
          onClick={() => { setShowSpotlight(true); setSpotlightQuery(""); }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200"
          style={{
            background: mode === "dark" ? "rgba(30,30,30,0.55)" : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            boxShadow: mode === "dark"
              ? "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
            color: c.textMuted,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = mode === "dark" ? "rgba(40,40,40,0.7)" : "rgba(255,255,255,0.7)";
            e.currentTarget.style.boxShadow = mode === "dark"
              ? "0 6px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 6px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)";
            e.currentTarget.style.transform = "translateX(-50%) scale(1.03)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = mode === "dark" ? "rgba(30,30,30,0.55)" : "rgba(255,255,255,0.5)";
            e.currentTarget.style.boxShadow = mode === "dark"
              ? "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)";
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
          }}
        >
          <I d={ic.search} s={15} />
          <span className="text-[12px] font-medium" style={{ color: c.textMuted }}>Search</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md ml-1" style={{ background: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: c.textMuted }}>⌘K</span>
        </button>

        {/* ━━━━ Bottom Dock Bar — Minimal pill, mode-aware ━━━━ */}
        {(() => {
          const dockBg = mode === "dark" ? "rgba(14,16,24,0.82)" : "rgba(240,242,250,0.84)";
          const dockBorder = mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
          const dockShadow = mode === "dark"
            ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)";
          const iconColor = mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(28,30,42,0.62)";
          const hoverBg   = mode === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
          const dotColor  = mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(28,30,42,0.4)";
          return (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[50]" onClick={e => e.stopPropagation()}>
              <div
                className="flex items-center gap-5 px-5"
                style={{
                  height: 64,
                  borderRadius: 28,
                  background: dockBg,
                  backdropFilter: "blur(28px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(28px) saturate(1.5)",
                  border: `1px solid ${dockBorder}`,
                  boxShadow: dockShadow,
                  transition: "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
                }}
              >
                {/* Home */}
                {(() => {
                  const isAnyOpen = wins.some(w => w.isOpen && !w.isMinimized);
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        title="Show Desktop"
                        onClick={() => setWins(p => p.map(w => w.isOpen && !w.isMinimized ? { ...w, isMinimized: true } : w))}
                        className="flex items-center justify-center transition-all duration-180"
                        style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <I d={ic.home} s={19} c={iconColor} />
                      </button>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: isAnyOpen ? dotColor : "transparent", transition: "all 200ms" }} />
                    </div>
                  );
                })()}

                {/* App Grid / Launchpad */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    title="All Apps"
                    onClick={() => setShowLaunchpad(true)}
                    className="flex items-center justify-center transition-all duration-180"
                    style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <I d={ic.grid} s={19} c={iconColor} />
                  </button>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "transparent" }} />
                </div>

                {/* Search */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    title="Search (⌘K)"
                    onClick={() => setShowSpotlight(true)}
                    className="flex items-center justify-center transition-all duration-180"
                    style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <I d={ic.search} s={19} c={iconColor} />
                  </button>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "transparent" }} />
                </div>

                {/* Glowing Orb — AI Hub (center piece) */}
                {(() => {
                  const isAiOpen = wins.some(w => w.id === "aihub" && w.isOpen);
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        title="AI Hub"
                        onClick={() => openWinWithAI("aihub")}
                        className="flex items-center justify-center transition-all duration-200"
                        style={{
                          width: 52, height: 52,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 38% 35%, #c8e8ff 0%, #7abcff 22%, #4a90e2 48%, #7b5ea7 78%, #3a2060 100%)",
                          boxShadow: mode === "dark"
                            ? "0 0 18px 6px rgba(120,180,255,0.55), 0 0 40px 12px rgba(100,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.45)"
                            : "0 0 14px 5px rgba(100,160,255,0.4), 0 0 30px 8px rgba(80,120,255,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
                          border: "none",
                          position: "relative",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "scale(1.08)";
                          e.currentTarget.style.boxShadow = mode === "dark"
                            ? "0 0 26px 10px rgba(120,180,255,0.7), 0 0 55px 16px rgba(100,140,255,0.35), inset 0 1px 0 rgba(255,255,255,0.5)"
                            : "0 0 22px 8px rgba(100,160,255,0.55), 0 0 46px 12px rgba(80,120,255,0.28), inset 0 1px 0 rgba(255,255,255,0.55)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = mode === "dark"
                            ? "0 0 18px 6px rgba(120,180,255,0.55), 0 0 40px 12px rgba(100,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.45)"
                            : "0 0 14px 5px rgba(100,160,255,0.4), 0 0 30px 8px rgba(80,120,255,0.18), inset 0 1px 0 rgba(255,255,255,0.5)";
                        }}
                      >
                        {/* Specular glint */}
                        <div style={{ position: "absolute", top: "14%", left: "22%", width: "28%", height: "18%", borderRadius: "50%", background: "rgba(255,255,255,0.45)", filter: "blur(2px)", pointerEvents: "none" }} />
                      </button>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: isAiOpen ? "rgba(120,170,255,0.7)" : "transparent", boxShadow: isAiOpen ? "0 0 6px rgba(120,170,255,0.6)" : "none", transition: "all 200ms" }} />
                    </div>
                  );
                })()}

                {/* Files */}
                {(() => {
                  const isOpen = wins.some(w => w.id === "files" && w.isOpen);
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        title="Files"
                        onClick={() => openWinWithAI("files")}
                        className="flex items-center justify-center transition-all duration-180"
                        style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <I d={ic.folder} s={19} c={iconColor} />
                      </button>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: isOpen ? dotColor : "transparent", transition: "all 200ms" }} />
                    </div>
                  );
                })()}

                {/* Browser */}
                {(() => {
                  const isOpen = wins.some(w => w.id === "browser" && w.isOpen);
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        title="Browser"
                        onClick={() => openWinWithAI("browser")}
                        className="flex items-center justify-center transition-all duration-180"
                        style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <I d={ic.refresh} s={19} c={iconColor} />
                      </button>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: isOpen ? dotColor : "transparent", transition: "all 200ms" }} />
                    </div>
                  );
                })()}

                {/* Settings */}
                {(() => {
                  const isOpen = wins.some(w => w.id === "settings" && w.isOpen);
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        title="Settings"
                        onClick={() => openWinWithAI("settings")}
                        className="flex items-center justify-center transition-all duration-180"
                        style={{ width: 38, height: 38, borderRadius: 10, background: "transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <I d={ic.settings} s={19} c={iconColor} />
                      </button>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: isOpen ? dotColor : "transparent", transition: "all 200ms" }} />
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}


        {/* ━━━━ Ctrl+A Global AI Overlay ━━━━ */}
        {showCtrlAi && (() => {
          const focusedWin = [...wins].filter(w => w.isOpen && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
          const ox = focusedWin ? focusedWin.x + focusedWin.w / 2 : window.innerWidth / 2;
          const oy = focusedWin ? focusedWin.y + 40 : window.innerHeight / 2 - 140;
          const barBg = mode === "dark" ? "rgba(36,38,50,0.94)" : "rgba(210,213,232,0.92)";
          const inputColor = mode === "dark" ? "#e8eaf6" : "#1e2140";
          const panelBg = mode === "dark" ? "rgba(22,24,36,0.97)" : "rgba(235,237,248,0.97)";
          const cardBg = mode === "dark" ? "rgba(44,47,62,0.7)" : "rgba(255,255,255,0.75)";
          const cardBorder = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          const dividerColor = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
          const mutedColor = mode === "dark" ? "#6b7094" : "#8890ab";
          const textColor = mode === "dark" ? "#e0e3f0" : "#1a1d35";
          const subtextColor = mode === "dark" ? "#8891b0" : "#6e7599";
          const hoverBg = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

          const aiModes: { id: typeof ctrlAiMode; label: string; desc: string; icon: string; color: string; gradient: string }[] = [
            { id: "chat", label: "Chat", desc: "General assistant", icon: ic.messageCircle, color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
            { id: "write", label: "Write", desc: "Content & docs", icon: ic.pen, color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)" },
            { id: "code", label: "Code", desc: "Dev assistant", icon: ic.code, color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #059669)" },
            { id: "image", label: "Image", desc: "Visual creation", icon: ic.image, color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
            { id: "research", label: "Research", desc: "Deep analysis", icon: ic.globe, color: "#EC4899", gradient: "linear-gradient(135deg, #EC4899, #DB2777)" },
            { id: "translate", label: "Translate", desc: "Multi-language", icon: ic.layers, color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
          ];

          const modeObj = aiModes.find(m => m.id === ctrlAiMode)!;
          const modeAccent = modeObj.color;
          const modeGrad = modeObj.gradient;

          const modePlaceholders: Record<typeof ctrlAiMode, string> = {
            chat: "Ask me anything \u2014 I can help with tasks, ideas, and answers...",
            write: "Tell me what to write \u2014 emails, docs, stories, posts...",
            code: "Describe what you need \u2014 components, functions, debugging...",
            image: "Describe your vision \u2014 style, subject, mood, details...",
            research: "What should I investigate \u2014 topics, data, comparisons...",
            translate: "Paste text or describe what to translate...",
          };

          type SuggItem = { title: string; desc: string; icon: string };
          type SuggGroup = { label: string; headline: string; icon: string; items: SuggItem[] };
          const suggestionGroups: Record<typeof ctrlAiMode, SuggGroup[]> = {
            chat: [
              { label: "Productivity", headline: "Get things done faster", icon: ic.zap, items: [
                { title: "Summarize Page", desc: "Condense any content into key takeaways", icon: ic.fileText },
                { title: "To-Do List", desc: "Organize tasks with priorities and deadlines", icon: ic.checkSquare },
                { title: "Set Reminder", desc: "Schedule alerts for important events", icon: ic.bell },
                { title: "Quick Reply", desc: "Draft professional responses instantly", icon: ic.send },
              ] },
              { label: "Creative", headline: "Spark new ideas", icon: ic.wand, items: [
                { title: "Write a Poem", desc: "Generate poetry in any style or theme", icon: ic.pen },
                { title: "Story Ideas", desc: "Get plot concepts and character sketches", icon: ic.bookOpen },
                { title: "Name Generator", desc: "Creative names for brands, projects, or characters", icon: ic.type },
                { title: "Brainstorm", desc: "Explore concepts with mind-mapping prompts", icon: ic.brain },
              ] },
              { label: "Analysis", headline: "Understand deeply", icon: ic.activity, items: [
                { title: "Explain Topic", desc: "Break down complex subjects simply", icon: ic.bookOpen },
                { title: "Compare Options", desc: "Side-by-side analysis of choices", icon: ic.barChart },
                { title: "Pros & Cons", desc: "Balanced evaluation of any decision", icon: ic.layers },
                { title: "Fact Check", desc: "Verify claims with source references", icon: ic.shield },
              ] },
            ],
            write: [
              { label: "Documents", headline: "Professional writing", icon: ic.fileText, items: [
                { title: "Email", desc: "Draft polished business correspondence", icon: ic.mail },
                { title: "Cover Letter", desc: "Tailored applications for any role", icon: ic.briefcase },
                { title: "Meeting Notes", desc: "Structured summaries from discussions", icon: ic.alignLeft },
                { title: "Proposal", desc: "Persuasive project or business proposals", icon: ic.fileInvoice },
              ] },
              { label: "Creative", headline: "Content creation", icon: ic.pen, items: [
                { title: "Blog Post", desc: "SEO-friendly articles on any topic", icon: ic.newspaper },
                { title: "Social Caption", desc: "Platform-optimized engaging posts", icon: ic.share },
                { title: "Short Story", desc: "Narrative fiction with your parameters", icon: ic.bookOpen },
                { title: "Product Copy", desc: "Compelling descriptions that convert", icon: ic.dollarSign },
              ] },
              { label: "Edit & Refine", headline: "Polish your text", icon: ic.edit3, items: [
                { title: "Proofread", desc: "Grammar, spelling, and punctuation fixes", icon: ic.checkSquare },
                { title: "Shorten", desc: "Condense while keeping the core message", icon: ic.minimize },
                { title: "Formal Tone", desc: "Elevate casual text to professional", icon: ic.briefcase },
                { title: "Clarity Pass", desc: "Simplify complex or confusing sentences", icon: ic.sun },
              ] },
            ],
            code: [
              { label: "Generate", headline: "Build from scratch", icon: ic.terminal, items: [
                { title: "React Component", desc: "Typed, styled, production-ready JSX", icon: ic.code },
                { title: "API Endpoint", desc: "RESTful routes with validation and error handling", icon: ic.globe },
                { title: "Database Query", desc: "Optimized SQL or ORM operations", icon: ic.hdd },
                { title: "Unit Test", desc: "Comprehensive test suites with edge cases", icon: ic.checkSquare },
              ] },
              { label: "Debug", headline: "Find and fix issues", icon: ic.alertTriangle, items: [
                { title: "Fix Error", desc: "Diagnose and resolve runtime exceptions", icon: ic.alertTriangle },
                { title: "Find Bug", desc: "Trace logic errors through code flow", icon: ic.search },
                { title: "Explain Code", desc: "Line-by-line breakdown of any snippet", icon: ic.bookOpen },
                { title: "Optimize", desc: "Performance improvements and best practices", icon: ic.zap },
              ] },
              { label: "Refactor", headline: "Improve existing code", icon: ic.refresh, items: [
                { title: "Clean Up", desc: "Remove dead code and improve structure", icon: ic.trash },
                { title: "Add Types", desc: "TypeScript annotations for type safety", icon: ic.shield },
                { title: "Async/Await", desc: "Convert callbacks and promises", icon: ic.refresh },
                { title: "Extract Logic", desc: "Break large functions into composable pieces", icon: ic.layers },
              ] },
            ],
            image: [
              { label: "Art Styles", headline: "Choose your aesthetic", icon: ic.image, items: [
                { title: "Photorealistic", desc: "Ultra-detailed lifelike renders", icon: ic.monitor },
                { title: "Digital Art", desc: "Modern illustration and concept art", icon: ic.pen },
                { title: "Watercolor", desc: "Soft, organic painted textures", icon: ic.wand },
                { title: "3D Render", desc: "Volumetric lighting and materials", icon: ic.cpu },
              ] },
              { label: "Subjects", headline: "What to create", icon: ic.wand, items: [
                { title: "Portrait", desc: "Character studies and headshots", icon: ic.user },
                { title: "Landscape", desc: "Scenic environments and vistas", icon: ic.sun },
                { title: "Abstract", desc: "Non-representational forms and patterns", icon: ic.grid },
                { title: "Logo Design", desc: "Brand marks and visual identities", icon: ic.sparkle },
              ] },
              { label: "Edit & Modify", headline: "Transform images", icon: ic.edit3, items: [
                { title: "Remove BG", desc: "Isolate subjects with clean edges", icon: ic.image },
                { title: "Recolor", desc: "Shift palette and mood of any image", icon: ic.wand },
                { title: "Text Overlay", desc: "Add typography with style presets", icon: ic.type },
                { title: "Social Resize", desc: "Crop for Instagram, X, LinkedIn formats", icon: ic.share },
              ] },
            ],
            research: [
              { label: "Business", headline: "Strategic intelligence", icon: ic.barChart, items: [
                { title: "Market Research", desc: "Industry size, trends, and opportunity maps", icon: ic.trendingUp },
                { title: "Competitors", desc: "Strengths, weaknesses, and positioning analysis", icon: ic.users },
                { title: "Trend Report", desc: "Emerging patterns and future forecasts", icon: ic.activity },
                { title: "SWOT Analysis", desc: "Structured strategic assessment framework", icon: ic.grid },
              ] },
              { label: "Learning", headline: "Deep understanding", icon: ic.bookOpen, items: [
                { title: "ELI5", desc: "Complex topics in simple, clear language", icon: ic.messageCircle },
                { title: "Deep Dive", desc: "Comprehensive exploration with sources", icon: ic.search },
                { title: "History Of...", desc: "Timeline and evolution of any subject", icon: ic.clock },
                { title: "How It Works", desc: "Mechanism breakdowns with diagrams", icon: ic.cpu },
              ] },
              { label: "Data", headline: "Extract insights", icon: ic.trendingUp, items: [
                { title: "Summarize", desc: "Distill articles into core findings", icon: ic.fileText },
                { title: "Key Points", desc: "Extract the most important takeaways", icon: ic.zap },
                { title: "Find Sources", desc: "Locate authoritative references", icon: ic.globe },
                { title: "Verify Claim", desc: "Cross-reference facts and statistics", icon: ic.shield },
              ] },
            ],
            translate: [
              { label: "Popular", headline: "Frequently used pairs", icon: ic.globe, items: [
                { title: "EN \u2192 Albanian", desc: "Natural, culturally adapted Albanian text", icon: ic.layers },
                { title: "Albanian \u2192 EN", desc: "Fluent English with context preserved", icon: ic.layers },
                { title: "EN \u2192 Spanish", desc: "Latin American or European variants", icon: ic.layers },
                { title: "EN \u2192 French", desc: "Formal or conversational register", icon: ic.layers },
              ] },
              { label: "Context", headline: "Set the right tone", icon: ic.alignLeft, items: [
                { title: "Formal", desc: "Business, legal, and academic register", icon: ic.briefcase },
                { title: "Casual", desc: "Everyday conversational language", icon: ic.messageCircle },
                { title: "Technical", desc: "Industry-specific terminology preserved", icon: ic.code },
                { title: "Legal", desc: "Precise legal language and clauses", icon: ic.shield },
              ] },
              { label: "Tools", headline: "Language utilities", icon: ic.settings, items: [
                { title: "Detect Language", desc: "Identify source text language automatically", icon: ic.search },
                { title: "Pronunciation", desc: "Phonetic guides and audio references", icon: ic.voice },
                { title: "Grammar Check", desc: "Fix errors in any supported language", icon: ic.checkSquare },
                { title: "Localize", desc: "Adapt content for regional audiences", icon: ic.globe },
              ] },
            ],
          };

          const quickTools: { icon: string; label: string; desc: string; action: () => void; color: string }[] = [
            { icon: ic.mic, label: "Voice Input", desc: "Speak your prompt naturally", action: () => {}, color: "#EF4444" },
            { icon: ic.upload, label: "Upload File", desc: "Attach documents for context", action: () => {}, color: "#8B5CF6" },
            { icon: ic.image, label: "Paste Image", desc: "Analyze or edit visuals", action: () => {}, color: "#F59E0B" },
            { icon: ic.bookOpen, label: "Knowledge", desc: "Browse the AI knowledge base", action: () => { openWin("knowledge" as WinId); setShowCtrlAi(false); }, color: "#10B981" },
            { icon: ic.clock, label: "History", desc: "View previous conversations", action: () => setCtrlAiTab("recent"), color: "#6366F1" },
            { icon: ic.settings, label: "Settings", desc: "Configure AI preferences", action: () => { openWin("settings"); setShowCtrlAi(false); }, color: "#64748B" },
          ];

          const currentGroups = suggestionGroups[ctrlAiMode];

          return (
            <>
              <style>{`
                @keyframes ctrlai-in {
                  from { opacity: 0; transform: translateY(14px) scale(0.95); }
                  to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes ctrlai-card {
                  from { opacity: 0; transform: translateY(8px) scale(0.98); }
                  to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes ctrlai-fade {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                @keyframes ctrlai-glow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 1; }
                }
                .ctrlai-panel { animation: ctrlai-in 0.28s cubic-bezier(.22,.68,0,1.12) both; }
                .ctrlai-card  { animation: ctrlai-card 0.22s cubic-bezier(.22,.68,0,1.15) both; }
                .ctrlai-fade  { animation: ctrlai-fade 0.18s ease both; }
                .ctrlai-tool:hover .ctrlai-tool-icon { transform: scale(1.08) translateY(-1px); }
                .ctrlai-sugg:hover .ctrlai-sugg-icon { transform: scale(1.1); }
                .ctrlai-sugg:hover .ctrlai-sugg-arrow { opacity: 1; transform: translateX(0); }
              `}</style>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[490] ctrlai-fade" style={{ background: mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)" }} onClick={() => { setShowCtrlAi(false); setCtrlAiChips(true); setCtrlAiTab("suggestions"); }} />
              {/* Panel */}
              <div
                className="absolute z-[491] ctrlai-panel"
                style={{ left: Math.min(Math.max(ox - 290, 8), window.innerWidth - 588), top: Math.max(oy, 8), width: 580 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Search Bar */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl mb-2"
                  style={{ background: barBg, backdropFilter: "blur(20px) saturate(1.5)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.65)"}`, boxShadow: mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)" : "0 4px 24px rgba(100,110,180,0.18)" }}>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: modeGrad, boxShadow: `0 2px 12px ${modeAccent}60` }}
                    onClick={() => { if (ctrlAiInput.trim()) { openWin("ai"); setShowCtrlAi(false); } }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d={ic.sparkle} fill="#fff" /></svg>
                  </button>
                  <input
                    ref={ctrlAiInputRef}
                    className="flex-1 bg-transparent outline-none text-[13.5px] font-light"
                    style={{ color: inputColor, caretColor: modeAccent }}
                    placeholder={modePlaceholders[ctrlAiMode]}
                    value={ctrlAiInput}
                    onChange={e => setCtrlAiInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Escape") { setShowCtrlAi(false); setCtrlAiChips(true); setCtrlAiTab("suggestions"); }
                      if (e.key === "Enter" && ctrlAiInput.trim()) { openWin("ai"); setShowCtrlAi(false); }
                    }}
                  />
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 hover:bg-opacity-20"
                    style={{ background: mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
                    title="Attach file">
                    <I d={ic.upload} s={14} c={mutedColor} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
                    title="Voice input">
                    <I d={ic.mic} s={14} c={mutedColor} />
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: modeGrad, boxShadow: `0 2px 12px ${modeAccent}60` }}
                    onClick={() => setCtrlAiChips(p => !p)}>
                    <I d={ctrlAiChips ? ic.chevU : ic.chevD} s={16} c="#fff" />
                  </button>
                </div>

                {/* Expanded Panel */}
                {ctrlAiChips && (
                  <div className="rounded-2xl overflow-hidden ctrlai-card"
                    style={{ background: panelBg, backdropFilter: "blur(28px) saturate(1.6)", border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.7)"}`, boxShadow: mode === "dark" ? "0 16px 56px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 12px 40px rgba(100,110,180,0.18), inset 0 1px 0 rgba(255,255,255,0.8)" }}>

                    {/* Header - AI Identity */}
                    <div className="px-5 pt-4 pb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: modeGrad, boxShadow: `0 4px 16px ${modeAccent}40` }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d={ic.sparkle} fill="#fff" /></svg>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center" style={{ background: "#10B981", borderColor: panelBg }}>
                            <div className="w-1 h-1 rounded-full bg-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[14px] font-bold tracking-tight" style={{ color: textColor }}>Alternus AI</h3>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider" style={{ background: `${modeAccent}18`, color: modeAccent }}>{modeObj.label}</span>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: subtextColor }}>Intelligent assistant powered by neural architecture. Ready to help.</p>
                        </div>
                        <button className="p-2 rounded-xl transition-all" style={{ color: mutedColor }}
                          onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          onClick={() => { openWin("ai"); setShowCtrlAi(false); }}>
                          <I d={ic.maximize} s={13} />
                        </button>
                      </div>

                      {/* AI Mode Selector - pill cards */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                        {aiModes.map(m => (
                          <button key={m.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap group"
                            style={{
                              background: ctrlAiMode === m.id ? modeGrad : "transparent",
                              border: ctrlAiMode === m.id ? "none" : `1px solid ${cardBorder}`,
                              boxShadow: ctrlAiMode === m.id ? `0 3px 12px ${m.color}45` : "none",
                              minWidth: 0,
                            }}
                            onMouseEnter={e => { if (ctrlAiMode !== m.id) { e.currentTarget.style.background = hoverBg; e.currentTarget.style.borderColor = `${m.color}40`; } }}
                            onMouseLeave={e => { if (ctrlAiMode !== m.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = cardBorder; } }}
                            onClick={() => { setCtrlAiMode(m.id); setCtrlAiTab("suggestions"); }}>
                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: ctrlAiMode === m.id ? "rgba(255,255,255,0.2)" : `${m.color}15` }}>
                              <I d={m.icon} s={11} c={ctrlAiMode === m.id ? "#fff" : m.color} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-[11px] font-semibold leading-none" style={{ color: ctrlAiMode === m.id ? "#fff" : textColor }}>{m.label}</p>
                              <p className="text-[9px] leading-none mt-0.5" style={{ color: ctrlAiMode === m.id ? "rgba(255,255,255,0.7)" : mutedColor }}>{m.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ height: 1, background: dividerColor }} />

                    {/* Tab switcher */}
                    <div className="flex items-center gap-1 px-5 pt-2.5 pb-1">
                      {(["suggestions", "recent", "tools"] as const).map(tab => {
                        const tabIcon = tab === "suggestions" ? ic.sparkle : tab === "recent" ? ic.clock : ic.grid;
                        return (
                          <button key={tab}
                            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all capitalize"
                            style={{
                              background: ctrlAiTab === tab ? `${modeAccent}12` : "transparent",
                              color: ctrlAiTab === tab ? modeAccent : mutedColor,
                            }}
                            onMouseEnter={e => { if (ctrlAiTab !== tab) e.currentTarget.style.background = hoverBg; }}
                            onMouseLeave={e => { if (ctrlAiTab !== tab) e.currentTarget.style.background = "transparent"; }}
                            onClick={() => setCtrlAiTab(tab)}>
                            <I d={tabIcon} s={11} c={ctrlAiTab === tab ? modeAccent : mutedColor} />
                            {tab}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="px-4 pb-3" style={{ maxHeight: 360, overflowY: "auto", scrollbarWidth: "none" }}>

                      {/* Suggestions Tab */}
                      {ctrlAiTab === "suggestions" && (
                        <div className="space-y-4 pt-1">
                          {currentGroups.map((group, gi) => (
                            <div key={group.label} className="ctrlai-card" style={{ animationDelay: `${gi * 0.06}s` }}>
                              {/* Section Header */}
                              <div className="flex items-center gap-2 px-1 mb-2">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${modeAccent}12` }}>
                                  <I d={group.icon} s={11} c={modeAccent} />
                                </div>
                                <div>
                                  <span className="text-[11px] font-bold" style={{ color: textColor }}>{group.label}</span>
                                  <span className="text-[10px] ml-2" style={{ color: mutedColor }}>{group.headline}</span>
                                </div>
                              </div>
                              {/* Suggestion Cards */}
                              <div className="grid grid-cols-2 gap-2">
                                {group.items.map((item, ii) => (
                                  <button key={item.title}
                                    className="ctrlai-card ctrlai-sugg flex items-start gap-2.5 p-3 rounded-xl text-left transition-all group"
                                    style={{
                                      background: cardBg,
                                      border: `1px solid ${cardBorder}`,
                                      animationDelay: `${(gi * 4 + ii) * 0.03}s`,
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.borderColor = `${modeAccent}50`;
                                      e.currentTarget.style.boxShadow = `0 4px 16px ${modeAccent}15, 0 0 0 1px ${modeAccent}15`;
                                      e.currentTarget.style.background = mode === "dark" ? `rgba(${parseInt(modeAccent.slice(1,3),16)},${parseInt(modeAccent.slice(3,5),16)},${parseInt(modeAccent.slice(5,7),16)},0.08)` : `rgba(${parseInt(modeAccent.slice(1,3),16)},${parseInt(modeAccent.slice(3,5),16)},${parseInt(modeAccent.slice(5,7),16)},0.06)`;
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.borderColor = cardBorder;
                                      e.currentTarget.style.boxShadow = "none";
                                      e.currentTarget.style.background = cardBg;
                                    }}
                                    onClick={() => { setCtrlAiInput(item.title + ": "); setTimeout(() => ctrlAiInputRef.current?.focus(), 10); }}>
                                    <div className="ctrlai-sugg-icon w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform"
                                      style={{ background: `${modeAccent}12`, border: `1px solid ${modeAccent}18` }}>
                                      <I d={item.icon} s={14} c={modeAccent} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: textColor }}>{item.title}</p>
                                        <span className="ctrlai-sugg-arrow opacity-0 transform -translate-x-1 transition-all" style={{ color: modeAccent }}>
                                          <I d={ic.chevR} s={10} c={modeAccent} />
                                        </span>
                                      </div>
                                      <p className="text-[10px] leading-snug mt-0.5" style={{ color: subtextColor }}>{item.desc}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recent Tab */}
                      {ctrlAiTab === "recent" && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: mutedColor }}>Recent Prompts</p>
                          {ctrlAiRecent.map((item, i) => (
                            <button key={i}
                              className="ctrlai-card flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-left transition-all"
                              style={{ animationDelay: `${i * 0.04}s`, border: `1px solid ${cardBorder}` }}
                              onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.borderColor = `${modeAccent}30`; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = cardBorder; }}
                              onClick={() => { setCtrlAiInput(item.text); setTimeout(() => ctrlAiInputRef.current?.focus(), 10); }}>
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cardBg }}>
                                <I d={item.icon} s={15} c={mutedColor} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium truncate" style={{ color: textColor }}>{item.text}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: mutedColor }}>Used recently</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: hoverBg, color: mutedColor }}>Reuse</span>
                                <I d={ic.chevR} s={11} c={mutedColor} />
                              </div>
                            </button>
                          ))}
                          {ctrlAiRecent.length === 0 && (
                            <div className="flex flex-col items-center py-10">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: hoverBg }}>
                                <I d={ic.clock} s={22} c={mutedColor} />
                              </div>
                              <p className="text-[12px] font-medium" style={{ color: textColor }}>No recent prompts</p>
                              <p className="text-[10px] mt-1" style={{ color: mutedColor }}>Your conversation history will appear here</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tools Tab */}
                      {ctrlAiTab === "tools" && (
                        <div className="pt-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: mutedColor }}>Quick Tools</p>
                          <div className="grid grid-cols-3 gap-2">
                            {quickTools.map((tool, i) => (
                              <button key={tool.label}
                                className="ctrlai-card ctrlai-tool flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all text-center"
                                style={{ animationDelay: `${i * 0.04}s`, border: `1px solid ${cardBorder}` }}
                                onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.borderColor = `${tool.color}35`; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = cardBorder; }}
                                onClick={tool.action}>
                                <div className="ctrlai-tool-icon w-11 h-11 rounded-xl flex items-center justify-center transition-transform"
                                  style={{ background: `${tool.color}12`, border: `1px solid ${tool.color}22` }}>
                                  <I d={tool.icon} s={19} c={tool.color} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold" style={{ color: textColor }}>{tool.label}</p>
                                  <p className="text-[9px] mt-0.5 leading-snug" style={{ color: mutedColor }}>{tool.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ height: 1, background: dividerColor }} />
                    <div className="flex items-center justify-between px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
                          <span className="text-[10px] font-semibold" style={{ color: mutedColor }}>Online</span>
                        </div>
                        <div className="w-px h-3" style={{ background: dividerColor }} />
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: hoverBg, color: mutedColor }}>Neural v4.2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: hoverBg, color: mutedColor }}>Ctrl+A</span>
                        <button className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                          style={{ background: `${modeAccent}12`, color: modeAccent }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${modeAccent}20`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${modeAccent}12`; }}
                          onClick={() => { openWin("ai"); setShowCtrlAi(false); }}>
                          <I d={ic.maximize} s={10} c={modeAccent} />
                          Open Full AI
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* ━━━━ Launchpad Overlay — Full-screen Library ━━━━ */}
        {showLaunchpad && (() => {
          const closeLaunchpad = () => { setShowLaunchpad(false); setLaunchSearch(""); setLaunchCategory("all"); };
          const filteredApps = dockApps.filter(app => {
            const matchCat = launchCategory === "all" || app.category === launchCategory;
            const matchSearch = app.label.toLowerCase().includes(launchSearch.toLowerCase());
            return matchCat && matchSearch;
          });
          const categories: { id: "all" | "ai" | "productivity" | "media" | "system" | "web"; label: string; icon: string }[] = [
            { id: "all",          label: "All",          icon: ic.grid },
            { id: "ai",           label: "AI",           icon: ic.sparkle },
            { id: "productivity", label: "Productivity", icon: ic.checkSquare },
            { id: "media",        label: "Media",        icon: ic.film },
            { id: "system",       label: "System",       icon: ic.monitor },
            { id: "web",          label: "Web",          icon: ic.globe },
          ];
          return (
            <div
              className="absolute inset-0 z-[80] flex flex-col"
              style={{ backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", background: "rgba(0,0,0,0.62)" }}
              onClick={closeLaunchpad}
            >
              <style>{`
                @keyframes lp-in {
                  from { opacity:0; transform:scale(0.97) translateY(10px); }
                  to   { opacity:1; transform:scale(1) translateY(0); }
                }
                .lp-enter { animation: lp-in 0.28s cubic-bezier(.22,.68,0,1.1) both; }
              `}</style>

              {/* ── Top header: title + search + ESC ── */}
              <div className="lp-enter" onClick={e => e.stopPropagation()}
                style={{ paddingTop: 48, paddingBottom: 0, textAlign: "center", flexShrink: 0, position: "relative" }}>
                <h1 style={{ fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.5px", marginBottom: 18 }}>Library</h1>
                {/* Centered search bar */}
                <div style={{ maxWidth: 360, margin: "0 auto 0", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "0 16px", height: 40 }}>
                  <I d={ic.search} s={14} c="rgba(255,255,255,0.5)" />
                  <input
                    autoFocus
                    value={launchSearch}
                    onChange={e => setLaunchSearch(e.target.value)}
                    placeholder="Search"
                    style={{ background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.9)", fontSize: 14, flex: 1, textAlign: "center" }}
                  />
                  {launchSearch && (
                    <button onClick={() => setLaunchSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <I d={ic.close} s={12} c="rgba(255,255,255,0.5)" />
                    </button>
                  )}
                </div>
                {/* ESC close hint — top right */}
                <button
                  onClick={closeLaunchpad}
                  style={{ position: "absolute", top: 48, right: 52, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
                >
                  <I d={ic.close} s={12} c="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Esc</span>
                </button>
              </div>

              {/* ── Body: sidebar + grid ── */}
              <div className="lp-enter" onClick={e => e.stopPropagation()}
                style={{ flex: 1, display: "flex", overflow: "hidden", padding: "32px 52px 44px", gap: 44, animationDelay: "0.04s" }}>

                {/* Sidebar */}
                <div style={{ width: 176, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
                  {categories.map(cat => {
                    const isActive = launchCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setLaunchCategory(cat.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 11,
                          padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                          background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                          fontWeight: isActive ? 700 : 400, fontSize: 14, textAlign: "left", width: "100%",
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
                      >
                        <I d={cat.icon} s={16} c={isActive ? "#fff" : "rgba(255,255,255,0.45)"} />
                        {cat.label}
                      </button>
                    );
                  })}

                  {/* Divider + count */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.10)", margin: "8px 0" }} />
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", paddingLeft: 14 }}>
                    {filteredApps.length} {filteredApps.length === 1 ? "app" : "apps"}
                  </p>
                </div>

                {/* Right column: filter row + grid */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Filter / Sort row — top right */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 20, flexShrink: 0 }}>
                    {[
                      { label: "Filter: All" },
                      { label: "Sort: Recent" },
                    ].map(btn => (
                      <button key={btn.label}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
                      >
                        {btn.label}
                        <I d="M19 9l-7 7-7-7" s={11} c="rgba(255,255,255,0.5)" />
                      </button>
                    ))}
                  </div>

                  {/* App grid — scrollable */}
                  <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
                    {filteredApps.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 12 }}>
                        <I d={ic.search} s={36} c="rgba(255,255,255,0.2)" />
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>No apps found</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 88px)", gap: "6px", justifyContent: "center" }}>
                        {filteredApps.map(app => {
                          const fillPath = icFill[app.id] ?? app.icon;
                          return (
                            <button
                              key={app.id}
                              title={app.label}
                              onClick={() => { openWinWithAI(app.id); closeLaunchpad(); }}
                              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "8px 4px 8px", borderRadius: 13, border: "none", background: "transparent", cursor: "pointer", transition: "background 0.15s" }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                const icon = e.currentTarget.querySelector(".lp3-icon") as HTMLElement | null;
                                if (icon) { icon.style.transform = "translateY(-4px) scale(1.07)"; icon.style.boxShadow = `0 10px 24px ${app.color}65`; }
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                const icon = e.currentTarget.querySelector(".lp3-icon") as HTMLElement | null;
                                if (icon) { icon.style.transform = "translateY(0) scale(1)"; icon.style.boxShadow = `0 4px 12px ${app.color}40`; }
                              }}
                            >
                              <div
                                className="lp3-icon relative overflow-hidden flex items-center justify-center"
                                style={{
                                  width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                                  background: `linear-gradient(145deg, ${app.color}F0 0%, ${app.color}A0 55%, ${app.color}70 100%)`,
                                  border: `1px solid ${app.color}50`,
                                  boxShadow: `0 4px 12px ${app.color}40, inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.12)`,
                                  transition: "all 0.18s cubic-bezier(.22,.68,0,1.1)",
                                }}
                              >
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%", borderRadius: "20px 20px 60% 60%", background: "linear-gradient(180deg,rgba(255,255,255,0.26) 0%,rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />
                                <div style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))" }}>
                                  <I d={fillPath} s={28} f={true} grad={["rgba(255,255,255,0.97)", "rgba(255,255,255,0.76)"]} />
                                </div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.80)", maxWidth: 76, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                                {app.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
                { icon: ic.image, label: "Change wallpaper", action: () => { setWallpaper(p => (p % 5) + 1); setContextMenu(null); } },
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
          className="absolute top-0 right-0 h-full z-[100] transition-all duration-300 ease-in-out"
          style={{
            width: 340,
            transform: showNotifications ? "translateX(0)" : "translateX(100%)",
            pointerEvents: showNotifications ? "auto" : "none",
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
