"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────
type WindowId =
  | "settings"
  | "music"
  | "calendar"
  | "weather"
  | "notifications"
  | "analytics"
  | "wallet"
  | "files"
  | "calculator"
  | "notes";

interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

// ─── Theme Colors ────────────────────────────────────────
const themes = {
  dark: {
    bg: "bg-[#0a0e1a]",
    surface: "bg-[#111827]/90",
    surfaceSolid: "bg-[#111827]",
    card: "bg-[#1a2035]",
    cardHover: "hover:bg-[#1e2642]",
    border: "border-[#1e2a45]",
    text: "text-white",
    textSecondary: "text-gray-400",
    textMuted: "text-gray-500",
    accent: "bg-blue-600",
    accentText: "text-blue-400",
    accentHover: "hover:bg-blue-700",
    success: "text-emerald-400",
    successBg: "bg-emerald-500/20",
    danger: "text-red-400",
    dangerBg: "bg-red-500/20",
    input: "bg-[#0f1629] border-[#1e2a45]",
    taskbar: "bg-[#0f1629]/95",
    topbar: "bg-[#0f1629]/80",
    glass: "backdrop-blur-xl bg-[#111827]/80",
  },
  light: {
    bg: "bg-[#f0f2f5]",
    surface: "bg-white/90",
    surfaceSolid: "bg-white",
    card: "bg-white",
    cardHover: "hover:bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
    textSecondary: "text-gray-500",
    textMuted: "text-gray-400",
    accent: "bg-blue-600",
    accentText: "text-blue-600",
    accentHover: "hover:bg-blue-700",
    success: "text-emerald-600",
    successBg: "bg-emerald-100",
    danger: "text-red-600",
    dangerBg: "bg-red-100",
    input: "bg-gray-100 border-gray-200",
    taskbar: "bg-white/95",
    topbar: "bg-white/80",
    glass: "backdrop-blur-xl bg-white/80",
  },
};

// ─── Icon Components ─────────────────────────────────────
function IconSettings({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMusic({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconCalendar({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function IconCloud({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function IconBell({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IconChart({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function IconWallet({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function IconFolder({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconCalculator({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function IconNotes({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="M15 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function IconWifi({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <line x1="12" x2="12.01" y1="20" y2="20" />
    </svg>
  );
}

function IconBattery({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
      <rect width="8" height="4" x="5" y="10" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function IconChevron({ direction = "right", size = 16 }: { direction?: "left" | "right" | "up" | "down"; size?: number }) {
  const rotation = { left: 180, right: 0, up: -90, down: 90 }[direction];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconPlay({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconPause({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function IconSkip({ size = 16, direction = "forward" }: { size?: number; direction?: "forward" | "backward" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ transform: direction === "backward" ? "scaleX(-1)" : undefined }}>
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconSun({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconLock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ─── Window Title Bar ────────────────────────────────────
function WindowTitleBar({
  title,
  onClose,
  onMinimize,
  theme,
  onMouseDown,
}: {
  title: string;
  onClose: () => void;
  onMinimize: () => void;
  theme: typeof themes.dark;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b ${theme.border} cursor-move select-none`}
      onMouseDown={onMouseDown}
    >
      <span className={`text-sm font-semibold ${theme.text}`}>{title}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          className={`w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors`}
        />
        <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Settings Window Content ─────────────────────────────
function SettingsContent({ theme }: { theme: typeof themes.dark }) {
  const settingsItems = [
    { icon: <IconWifi size={18} />, label: "Connections", desc: "WiFi, Bluetooth, Mobile data" },
    { icon: <IconBell size={18} />, label: "Sounds and vibration", desc: "Sound mode, Ringtone" },
    { icon: <IconBell size={18} />, label: "Notifications", desc: "Status bar, Do not disturb" },
    { icon: "🖼️", label: "Wallpaper and style", desc: "Wallpapers, Color Palette" },
    { icon: "🔆", label: "Display", desc: "Brightness, Contrast, Color" },
    { icon: "🎨", label: "Themes", desc: "Color theme, Icons" },
    { icon: "🏠", label: "Home Screen", desc: "Apps, Widgets, Shortcuts" },
    { icon: <IconLock size={18} />, label: "Security", desc: "Lockscreen, Passwords" },
    { icon: "👤", label: "Account and Privacy", desc: "Accounts, Apps & Permissions" },
  ];

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[400px]">
      <h2 className={`text-xl font-bold ${theme.text} mb-4 text-center`}>Settings</h2>
      {settingsItems.map((item, i) => (
        <button
          key={i}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${theme.cardHover} transition-colors group`}
        >
          <span className={`${theme.textSecondary} text-lg`}>
            {typeof item.icon === "string" ? item.icon : item.icon}
          </span>
          <div className="flex-1 text-left">
            <p className={`text-sm font-medium ${theme.text}`}>{item.label}</p>
            <p className={`text-xs ${theme.textMuted}`}>{item.desc}</p>
          </div>
          <IconChevron direction="right" size={14} />
        </button>
      ))}
    </div>
  );
}

// ─── Music Player Content ────────────────────────────────
function MusicContent({ theme }: { theme: typeof themes.dark }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack] = useState(2);
  const [progress] = useState(45);

  const tracks = [
    { name: "Midnight Dreams", artist: "Luna Wave" },
    { name: "Electric Sunrise", artist: "Neon Pulse" },
    { name: "Ocean Breeze", artist: "Coral Sound" },
    { name: "Urban Jungle", artist: "Metro Beat" },
    { name: "Crystal Clear", artist: "Glass Harmony" },
    { name: "Velvet Night", artist: "Shadow Jazz" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${theme.text}`}>Your Library</h3>
          <div className={`flex gap-1 ${theme.textMuted} text-xs`}>
            <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">Week</button>
            <button className={`px-3 py-1 rounded-full ${theme.textSecondary} text-xs`}>Month</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        {tracks.map((track, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              i === currentTrack ? "bg-blue-600/20" : theme.cardHover
            }`}
          >
            <div className={`w-10 h-10 rounded-lg ${
              i === currentTrack ? "bg-blue-600" : "bg-gradient-to-br from-purple-500 to-blue-500"
            } flex items-center justify-center`}>
              {i === currentTrack ? (
                <div className="flex gap-0.5 items-end h-4">
                  <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                  <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                  <div className="w-0.5 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              ) : (
                <IconMusic size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${i === currentTrack ? "text-blue-400" : theme.text}`}>{track.name}</p>
              <p className={`text-xs ${theme.textMuted}`}>{track.artist}</p>
            </div>
            <button className={`${theme.textMuted}`}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Player Bar */}
      <div className={`px-4 py-3 border-t ${theme.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${theme.text}`}>{tracks[currentTrack].name}</p>
            <p className={`text-[10px] ${theme.textMuted}`}>{tracks[currentTrack].artist}</p>
          </div>
        </div>
        <div className={`w-full h-1 rounded-full ${theme.card} mb-2`}>
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button className={theme.textSecondary}><IconSkip size={14} direction="backward" /></button>
          <button
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <IconPause size={12} /> : <IconPlay size={12} />}
          </button>
          <button className={theme.textSecondary}><IconSkip size={14} direction="forward" /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Content ────────────────────────────────────
function CalendarContent({ theme }: { theme: typeof themes.dark }) {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button className={`p-1 rounded-lg ${theme.cardHover}`}><IconChevron direction="left" /></button>
        <h3 className={`text-sm font-semibold ${theme.text}`}>{month} {year}</h3>
        <button className={`p-1 rounded-lg ${theme.cardHover}`}><IconChevron direction="right" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className={`text-center text-[10px] font-medium ${theme.textMuted} py-1`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => day && setSelectedDate(day)}
            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
              !day
                ? ""
                : day === selectedDate
                ? "bg-blue-600 text-white"
                : day === currentDate.getDate()
                ? `ring-1 ring-blue-500 ${theme.accentText}`
                : `${theme.text} ${theme.cardHover}`
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button className={`flex-1 py-2 rounded-xl text-xs font-medium border ${theme.border} ${theme.text}`}>Cancel</button>
        <button className="flex-1 py-2 rounded-xl text-xs font-medium bg-blue-600 text-white">Select Date</button>
      </div>
    </div>
  );
}

// ─── Weather Content ─────────────────────────────────────
function WeatherContent({ theme }: { theme: typeof themes.dark }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const temps = [14, 16, 18, 17, 15, 19, 20];
  const today = new Date().getDay();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${theme.text}`}>Weather Conditions</h3>
        <button className={`p-1 rounded-lg ${theme.cardHover}`}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className={`text-4xl font-bold ${theme.text}`}>17°</p>
          <p className={`text-xs ${theme.textMuted}`}>Partly Cloudy</p>
        </div>
        <div className="text-4xl">⛅</div>
      </div>

      <div className={`flex gap-2 overflow-x-auto pb-2`}>
        {days.map((day, i) => (
          <div
            key={day}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs ${
              i === today ? "bg-blue-600/20 text-blue-400" : theme.textSecondary
            }`}
          >
            <span className="font-medium">{day}</span>
            <span>{["☀️", "⛅", "🌤️", "⛅", "🌧️", "☀️", "🌤️"][i]}</span>
            <span className={`font-semibold ${i === today ? "text-blue-400" : theme.text}`}>{temps[i]}°</span>
          </div>
        ))}
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-3`}>
        <div className={`${theme.card} rounded-xl p-3`}>
          <p className={`text-xs ${theme.textMuted}`}>Humidity</p>
          <p className={`text-lg font-bold ${theme.text}`}>62%</p>
        </div>
        <div className={`${theme.card} rounded-xl p-3`}>
          <p className={`text-xs ${theme.textMuted}`}>Wind</p>
          <p className={`text-lg font-bold ${theme.text}`}>12 km/h</p>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Content ───────────────────────────────
function NotificationsContent({ theme }: { theme: typeof themes.dark }) {
  const notifications = [
    { name: "Muna John", msg: "Invited you to a chat", time: "50s ago", avatar: "MJ" },
    { name: "Eva Solaris", msg: "Invited you to a meeting", time: "1m ago", avatar: "ES" },
    { name: "Sean Pauline", msg: "Prepared a report", time: "2m ago", avatar: "SP" },
    { name: "Eva Solaris", msg: "Started a group room", time: "5m ago", avatar: "ES" },
    { name: "Alex Rivera", msg: "Shared a document", time: "10m ago", avatar: "AR" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${theme.text}`}>
          Notifications <span className={`${theme.textMuted} font-normal`}>(3 unread)</span>
        </h3>
        <button className={theme.textMuted}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        {notifications.map((n, i) => (
          <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${i < 3 ? "bg-blue-600/10" : ""} ${theme.cardHover} transition-colors`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {n.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${theme.text}`}>{n.name}</p>
              <p className={`text-xs ${theme.textMuted}`}>{n.msg}</p>
            </div>
            <span className={`text-[10px] ${theme.textMuted} flex-shrink-0`}>{n.time}</span>
          </div>
        ))}
      </div>

      <button className={`w-full mt-3 py-2 text-xs font-medium ${theme.accentText} rounded-xl border ${theme.border}`}>
        Mark all as read
      </button>
    </div>
  );
}

// ─── Analytics Content ───────────────────────────────────
function AnalyticsContent({ theme }: { theme: typeof themes.dark }) {
  const chartData = [65, 45, 78, 52, 90, 68, 85];
  const maxVal = Math.max(...chartData);

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[420px]">
      <h3 className={`text-sm font-semibold ${theme.text}`}>Statistical Metrics</h3>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${theme.card} rounded-xl p-3`}>
          <p className={`text-[10px] ${theme.textMuted}`}>Successful</p>
          <p className={`text-sm font-bold text-emerald-400`}>12,403</p>
          <p className={`text-[10px] ${theme.textMuted}`}>61,201 count</p>
        </div>
        <div className={`${theme.card} rounded-xl p-3`}>
          <p className={`text-[10px] ${theme.textMuted}`}>Delayed</p>
          <p className={`text-sm font-bold text-yellow-400`}>1,029</p>
          <p className={`text-[10px] ${theme.textMuted}`}>60,400 count</p>
        </div>
        <div className={`${theme.card} rounded-xl p-3`}>
          <p className={`text-[10px] ${theme.textMuted}`}>Blocked</p>
          <p className={`text-sm font-bold text-red-400`}>103</p>
          <p className={`text-[10px] ${theme.textMuted}`}>802 count</p>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-xs font-medium ${theme.text}`}>Daily Chart</p>
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Revenue
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Expenses
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-28">
          {chartData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5" style={{ height: `${(val / maxVal) * 100}%` }}>
                <div className="flex-1 bg-blue-500 rounded-t-md" />
                <div className="flex-1 bg-purple-500/60 rounded-t-md" style={{ height: `${70 + Math.random() * 30}%` }} />
              </div>
              <span className={`text-[9px] ${theme.textMuted}`}>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div>
        <p className={`text-xs font-medium ${theme.text} mb-2`}>Performance</p>
        <div className="space-y-2">
          {[
            { label: "Gallery Views", pct: 85, color: "bg-blue-500" },
            { label: "Art Sales", pct: 62, color: "bg-emerald-500" },
            { label: "New Users", pct: 45, color: "bg-purple-500" },
            { label: "Engagement", pct: 78, color: "bg-orange-500" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className={theme.textSecondary}>{item.label}</span>
                <span className={theme.text}>{item.pct}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${theme.card}`}>
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Wallet Content ──────────────────────────────────────
function WalletContent({ theme }: { theme: typeof themes.dark }) {
  return (
    <div className="p-4 space-y-4">
      <h3 className={`text-sm font-semibold ${theme.text}`}>Balance</h3>

      {/* Card */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <p className="text-white/80 text-xs font-medium">CARDHOLDER NAME</p>
            <p className="text-white font-bold text-sm">VISA</p>
          </div>
          <div>
            <p className="text-white text-lg font-mono tracking-widest">7032 19** **** 321</p>
            <div className="flex justify-between mt-2">
              <p className="text-white/70 text-[10px]">VALID THRU 06/25</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-3">
        <h4 className={`text-xs font-semibold ${theme.text}`}>Card Details</h4>
        {[
          { label: "Card Number", value: "••••••••••2345" },
          { label: "Balance", value: "$12,345.67" },
          { label: "Currency", value: "USD" },
          { label: "Card Status", value: "Active" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className={`text-xs ${theme.textMuted}`}>{item.label}</span>
            <span className={`text-xs font-medium ${
              item.label === "Card Status" ? "text-emerald-400" : theme.text
            }`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calculator Content ──────────────────────────────────
function CalculatorContent({ theme }: { theme: typeof themes.dark }) {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !newNumber) {
      const result = calculate(prevValue, current, operator);
      setDisplay(String(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevValue !== null && operator) {
      const current = parseFloat(display);
      const result = calculate(prevValue, current, operator);
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setNewNumber(true);
  };

  const btnClass = `flex items-center justify-center rounded-xl text-sm font-medium h-12 transition-all active:scale-95`;

  return (
    <div className="p-4">
      <div className={`${theme.card} rounded-2xl p-4 mb-4 text-right`}>
        <p className={`text-xs ${theme.textMuted} h-5`}>
          {prevValue !== null ? `${prevValue} ${operator}` : ""}
        </p>
        <p className={`text-3xl font-bold ${theme.text} truncate`}>{display}</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={handleClear} className={`${btnClass} ${theme.dangerBg} ${theme.danger}`}>C</button>
        <button onClick={() => handleOperator("/")} className={`${btnClass} ${theme.card} ${theme.accentText}`}>/</button>
        <button onClick={() => handleOperator("*")} className={`${btnClass} ${theme.card} ${theme.accentText}`}>x</button>
        <button onClick={() => { setDisplay(display.slice(0, -1) || "0"); }} className={`${btnClass} ${theme.card} ${theme.textSecondary}`}>
          <IconChevron direction="left" size={14} />
        </button>

        {["7", "8", "9"].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} ${theme.card} ${theme.text}`}>{n}</button>
        ))}
        <button onClick={() => handleOperator("-")} className={`${btnClass} ${theme.card} ${theme.accentText}`}>-</button>

        {["4", "5", "6"].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} ${theme.card} ${theme.text}`}>{n}</button>
        ))}
        <button onClick={() => handleOperator("+")} className={`${btnClass} ${theme.card} ${theme.accentText}`}>+</button>

        {["1", "2", "3"].map(n => (
          <button key={n} onClick={() => handleNumber(n)} className={`${btnClass} ${theme.card} ${theme.text}`}>{n}</button>
        ))}
        <button onClick={handleEquals} className={`${btnClass} bg-blue-600 text-white row-span-2`}>=</button>

        <button onClick={() => handleNumber("0")} className={`${btnClass} ${theme.card} ${theme.text} col-span-2`}>0</button>
        <button onClick={() => { if (!display.includes(".")) setDisplay(display + "."); setNewNumber(false); }} className={`${btnClass} ${theme.card} ${theme.text}`}>.</button>
      </div>
    </div>
  );
}

// ─── Notes Content ───────────────────────────────────────
function NotesContent({ theme }: { theme: typeof themes.dark }) {
  const [notes, setNotes] = useState([
    { title: "Project Ideas", content: "Gallery redesign with 3D viewer\nAI art recommendation engine", date: "Today" },
    { title: "Meeting Notes", content: "Review Q2 sales performance\nNew artist onboarding flow", date: "Yesterday" },
    { title: "Quick Note", content: "Check email from gallery partner", date: "Apr 1" },
  ]);
  const [selectedNote, setSelectedNote] = useState(0);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`w-40 border-r ${theme.border} p-2 space-y-1 overflow-y-auto`}>
        {notes.map((note, i) => (
          <button
            key={i}
            onClick={() => setSelectedNote(i)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              i === selectedNote ? "bg-blue-600/20" : theme.cardHover
            }`}
          >
            <p className={`text-xs font-medium truncate ${i === selectedNote ? "text-blue-400" : theme.text}`}>{note.title}</p>
            <p className={`text-[10px] ${theme.textMuted} truncate`}>{note.content.split("\n")[0]}</p>
            <p className={`text-[9px] ${theme.textMuted} mt-1`}>{note.date}</p>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <input
          className={`w-full text-sm font-semibold ${theme.text} bg-transparent outline-none mb-2`}
          value={notes[selectedNote].title}
          onChange={(e) => {
            const updated = [...notes];
            updated[selectedNote] = { ...updated[selectedNote], title: e.target.value };
            setNotes(updated);
          }}
        />
        <textarea
          className={`w-full flex-1 text-xs ${theme.textSecondary} bg-transparent outline-none resize-none h-48 leading-relaxed`}
          value={notes[selectedNote].content}
          onChange={(e) => {
            const updated = [...notes];
            updated[selectedNote] = { ...updated[selectedNote], content: e.target.value };
            setNotes(updated);
          }}
        />
      </div>
    </div>
  );
}

// ─── Files Content ───────────────────────────────────────
function FilesContent({ theme }: { theme: typeof themes.dark }) {
  const files = [
    { name: "Documents", type: "folder", size: "12 items", icon: "📁" },
    { name: "Images", type: "folder", size: "48 items", icon: "🖼️" },
    { name: "Downloads", type: "folder", size: "23 items", icon: "📥" },
    { name: "Projects", type: "folder", size: "7 items", icon: "💼" },
    { name: "report-2025.pdf", type: "file", size: "2.4 MB", icon: "📄" },
    { name: "design-mockup.fig", type: "file", size: "18 MB", icon: "🎨" },
    { name: "presentation.pptx", type: "file", size: "5.1 MB", icon: "📊" },
    { name: "notes.md", type: "file", size: "12 KB", icon: "📝" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl ${theme.input} border`}>
          <IconSearch size={14} />
          <input
            type="text"
            placeholder="Search files..."
            className={`bg-transparent outline-none text-xs flex-1 ${theme.text} placeholder:${theme.textMuted}`}
          />
        </div>
      </div>

      <div className="space-y-1">
        {files.map((file, i) => (
          <button
            key={i}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${theme.cardHover} transition-colors`}
          >
            <span className="text-xl">{file.icon}</span>
            <div className="flex-1 text-left">
              <p className={`text-sm ${theme.text}`}>{file.name}</p>
            </div>
            <span className={`text-[10px] ${theme.textMuted}`}>{file.size}</span>
            <IconChevron direction="right" size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Draggable Window Component ──────────────────────────
function DraggableWindow({
  windowState,
  onClose,
  onMinimize,
  onFocus,
  theme,
  children,
  width = 340,
  height = 480,
}: {
  windowState: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  theme: typeof themes.dark;
  children: React.ReactNode;
  width?: number;
  height?: number;
}) {
  const [pos, setPos] = useState(windowState.position);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus();

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      }
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!windowState.isOpen || windowState.isMinimized) return null;

  return (
    <div
      className={`absolute ${theme.surface} backdrop-blur-2xl rounded-2xl border ${theme.border} shadow-2xl shadow-black/30 overflow-hidden flex flex-col transition-shadow`}
      style={{
        left: pos.x,
        top: pos.y,
        width,
        maxHeight: height,
        zIndex: windowState.zIndex,
      }}
      onClick={onFocus}
    >
      <WindowTitleBar
        title={windowState.title}
        onClose={onClose}
        onMinimize={onMinimize}
        theme={theme}
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// ─── Main OS Component ───────────────────────────────────
export default function OSPage() {
  const [isDark, setIsDark] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);

  const theme = isDark ? themes.dark : themes.light;

  const [windows, setWindows] = useState<WindowState[]>([
    { id: "settings", title: "Settings", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 80, y: 60 } },
    { id: "music", title: "Music", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 80 } },
    { id: "calendar", title: "Calendar", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 50 } },
    { id: "weather", title: "Weather", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 320, y: 100 } },
    { id: "notifications", title: "Notifications", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 400, y: 60 } },
    { id: "analytics", title: "Analytics", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 120, y: 120 } },
    { id: "wallet", title: "Wallet", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 500, y: 80 } },
    { id: "files", title: "Files", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 } },
    { id: "calculator", title: "Calculator", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 450, y: 60 } },
    { id: "notes", title: "Notes", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 300, y: 120 } },
  ]);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleWindow = useCallback((id: WindowId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          if (!w.isOpen) {
            return { ...w, isOpen: true, isMinimized: false, zIndex: nextZIndex };
          } else if (w.isMinimized) {
            return { ...w, isMinimized: false, zIndex: nextZIndex };
          } else {
            return { ...w, isMinimized: true };
          }
        }
        return w;
      })
    );
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const closeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false, isMinimized: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  }, []);

  const focusWindow = useCallback((id: WindowId) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)));
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const handleLogin = () => {
    if (password === "1234" || password === "") {
      setIsLocked(false);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const dockApps = [
    { id: "settings" as WindowId, icon: <IconSettings size={22} />, label: "Settings", color: "from-gray-600 to-gray-700" },
    { id: "music" as WindowId, icon: <IconMusic size={22} />, label: "Music", color: "from-pink-500 to-purple-600" },
    { id: "calendar" as WindowId, icon: <IconCalendar size={22} />, label: "Calendar", color: "from-blue-500 to-blue-600" },
    { id: "weather" as WindowId, icon: <IconCloud size={22} />, label: "Weather", color: "from-cyan-400 to-blue-500" },
    { id: "notifications" as WindowId, icon: <IconBell size={22} />, label: "Alerts", color: "from-orange-500 to-red-500" },
    { id: "analytics" as WindowId, icon: <IconChart size={22} />, label: "Analytics", color: "from-emerald-500 to-teal-600" },
    { id: "wallet" as WindowId, icon: <IconWallet size={22} />, label: "Wallet", color: "from-indigo-500 to-blue-600" },
    { id: "files" as WindowId, icon: <IconFolder size={22} />, label: "Files", color: "from-yellow-500 to-orange-500" },
    { id: "calculator" as WindowId, icon: <IconCalculator size={22} />, label: "Calc", color: "from-slate-500 to-slate-700" },
    { id: "notes" as WindowId, icon: <IconNotes size={22} />, label: "Notes", color: "from-amber-400 to-yellow-500" },
  ];

  const windowContent: Record<WindowId, React.ReactNode> = {
    settings: <SettingsContent theme={theme} />,
    music: <MusicContent theme={theme} />,
    calendar: <CalendarContent theme={theme} />,
    weather: <WeatherContent theme={theme} />,
    notifications: <NotificationsContent theme={theme} />,
    analytics: <AnalyticsContent theme={theme} />,
    wallet: <WalletContent theme={theme} />,
    files: <FilesContent theme={theme} />,
    calculator: <CalculatorContent theme={theme} />,
    notes: <NotesContent theme={theme} />,
  };

  const windowSizes: Record<WindowId, { width: number; height: number }> = {
    settings: { width: 340, height: 500 },
    music: { width: 320, height: 480 },
    calendar: { width: 300, height: 420 },
    weather: { width: 340, height: 400 },
    notifications: { width: 340, height: 420 },
    analytics: { width: 380, height: 500 },
    wallet: { width: 320, height: 460 },
    files: { width: 360, height: 440 },
    calculator: { width: 280, height: 460 },
    notes: { width: 480, height: 400 },
  };

  // ─── Lock Screen ─────────────────────────────────────
  if (isLocked) {
    return (
      <div className={`fixed inset-0 ${theme.bg} flex flex-col items-center justify-center overflow-hidden`}>
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Time */}
          <p className={`text-7xl font-thin tracking-wider ${theme.text} mb-2`}>{formatTime(time)}</p>
          <p className={`text-lg ${theme.textSecondary} mb-12`}>{formatDate(time)}</p>

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 ring-4 ring-white/10">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <p className={`text-lg font-medium ${theme.text} mb-6`}>Welcome Back</p>

          {/* Password Input */}
          <div className="w-72">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${theme.glass} border ${theme.border}`}>
              <IconLock size={16} />
              <input
                type="password"
                placeholder="Enter password (or press Enter)"
                className={`bg-transparent outline-none text-sm flex-1 ${theme.text} placeholder:text-gray-500`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-400 text-xs text-center mt-2">Incorrect password</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full mt-3 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Desktop ─────────────────────────────────────────
  return (
    <div className={`fixed inset-0 ${theme.bg} overflow-hidden select-none`}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/3 rounded-full blur-3xl" />
      </div>

      {/* ─── Top Bar ─────────────────────────────────── */}
      <div className={`relative z-50 flex items-center justify-between px-5 py-2 ${theme.topbar} backdrop-blur-xl border-b ${theme.border}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme.cardHover} transition-colors`}
          >
            <IconSearch size={14} />
            <span className={`text-xs ${theme.textSecondary}`}>Search</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${theme.text}`}>{formatTime(time)}</span>
          <span className={`text-xs ${theme.textMuted} mx-1`}>|</span>
          <span className={`text-xs ${theme.textSecondary}`}>
            {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 rounded-lg ${theme.cardHover} transition-colors ${theme.textSecondary}`}
          >
            {isDark ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>
          <span className={theme.textSecondary}><IconWifi size={14} /></span>
          <span className={theme.textSecondary}><IconBattery size={14} /></span>
          <button
            onClick={() => setIsLocked(true)}
            className={`p-1.5 rounded-lg ${theme.cardHover} transition-colors ${theme.textSecondary}`}
          >
            <IconLock size={14} />
          </button>
        </div>
      </div>

      {/* ─── Search Modal ────────────────────────────── */}
      {showSearch && (
        <div className="absolute z-[100] inset-0 flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
          <div
            className={`w-[500px] ${theme.glass} backdrop-blur-2xl rounded-2xl border ${theme.border} shadow-2xl shadow-black/20 overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <IconSearch size={18} />
              <input
                type="text"
                placeholder="Search apps, files, settings..."
                className={`bg-transparent outline-none text-sm flex-1 ${theme.text}`}
                autoFocus
              />
              <kbd className={`px-2 py-0.5 rounded text-[10px] ${theme.card} ${theme.textMuted} border ${theme.border}`}>ESC</kbd>
            </div>
            <div className={`border-t ${theme.border} p-3`}>
              <p className={`text-[10px] font-medium ${theme.textMuted} uppercase tracking-wider mb-2`}>Quick Launch</p>
              <div className="grid grid-cols-5 gap-2">
                {dockApps.slice(0, 5).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => { toggleWindow(app.id); setShowSearch(false); }}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl ${theme.cardHover} transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white`}>
                      {app.icon}
                    </div>
                    <span className={`text-[10px] ${theme.textSecondary}`}>{app.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Area (Windows) ──────────────────── */}
      <div className="absolute inset-0 top-10 bottom-20">
        {/* Desktop Icons Grid */}
        <div className="absolute top-4 left-4 grid grid-cols-1 gap-3">
          {dockApps.slice(0, 6).map((app) => (
            <button
              key={app.id}
              onDoubleClick={() => toggleWindow(app.id)}
              className={`flex flex-col items-center gap-1 w-16 py-2 rounded-xl hover:bg-white/5 transition-colors`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg`}>
                {app.icon}
              </div>
              <span className={`text-[10px] font-medium ${isDark ? "text-white/80" : "text-gray-700"} drop-shadow-sm`}>
                {app.label}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        {windows.map((w) => (
          <DraggableWindow
            key={w.id}
            windowState={w}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
            onFocus={() => focusWindow(w.id)}
            theme={theme}
            width={windowSizes[w.id].width}
            height={windowSizes[w.id].height}
          >
            {windowContent[w.id]}
          </DraggableWindow>
        ))}
      </div>

      {/* ─── Dock / Taskbar ──────────────────────────── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
        <div className={`${theme.glass} backdrop-blur-2xl rounded-2xl border ${theme.border} px-2 py-2 shadow-2xl shadow-black/20`}>
          <div className="flex items-center gap-1">
            {dockApps.map((app) => {
              const win = windows.find((w) => w.id === app.id);
              const isOpen = win?.isOpen;

              return (
                <div key={app.id} className="relative group">
                  <button
                    onClick={() => toggleWindow(app.id)}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 ${
                      isOpen ? "ring-2 ring-blue-400/50 shadow-lg" : ""
                    }`}
                  >
                    {app.icon}
                  </button>

                  {/* Open indicator dot */}
                  {isOpen && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                  )}

                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg ${theme.surfaceSolid} ${theme.text} text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border ${theme.border}`}>
                    {app.label}
                  </div>
                </div>
              );
            })}

            {/* Divider */}
            <div className={`w-px h-8 mx-1 ${isDark ? "bg-white/10" : "bg-gray-300"}`} />

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-12 h-12 rounded-xl ${theme.card} flex items-center justify-center ${theme.textSecondary} transition-all hover:scale-110 active:scale-95`}
            >
              {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
