"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ━━━━ Palette (matches /os page) ━━━━━━━━━━━━━━━━━━━━━━━━━━
const c = {
  bg: "#242424",
  bgDeep: "#1a1a1a",
  surface: "#2C2C2C",
  card: "#2C2C2C",
  cardAlt: "#333333",
  border: "#3A3A3A",
  text: "#F1F5F9",
  textSec: "#A0A0A0",
  textMuted: "#707070",
  accent: "#3B82F6",
  accentHover: "#2563EB",
  accentSoft: "rgba(59,130,246,0.15)",
  accentText: "#60A5FA",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  purple: "#A78BFA",
};

// ━━━━ SVG Icon helper ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function I({ d, s = 16, color }: { d: string; s?: number; color?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ic = {
  sparkle: "M12 3v1m0 16v1m-8-9H3m18 0h1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7m12.1-12.1l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  music: "M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z",
  cloud: "M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z",
  calendar: "M3 10h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  note: "M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8zM15 3v4a2 2 0 002 2h4",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  store: "M3 3h18l-2 13H5L3 3zM16 16a2 2 0 100 4 2 2 0 000-4zM9 16a2 2 0 100 4 2 2 0 000-4z",
  film: "M2 2h20v20H2zM7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 7h5M17 17h5",
  fileText: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cpu: "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  monitor: "M2 3h20v14H2zM8 21h8M12 17v4",
  check: "M20 6L9 17l-5-5",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
  chevDown: "M6 9l6 6 6-6",
};

// ━━━━ Apps data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const apps = [
  { name: "AI Assistant", icon: ic.sparkle, desc: "Context-aware AI helper", color: c.accent },
  { name: "Terminal", icon: ic.terminal, desc: "Full command line", color: c.success },
  { name: "Code Editor", icon: ic.code, desc: "Syntax highlighting & editing", color: c.purple },
  { name: "File Manager", icon: ic.folder, desc: "Browse & organize files", color: c.warning },
  { name: "Settings", icon: ic.settings, desc: "System configuration", color: c.textSec },
  { name: "Music", icon: ic.music, desc: "Audio player", color: "#F472B6" },
  { name: "Weather", icon: ic.cloud, desc: "Real-time forecasts", color: c.accentText },
  { name: "Calendar", icon: ic.calendar, desc: "Schedule & events", color: c.danger },
  { name: "Notes", icon: ic.note, desc: "Quick note-taking", color: c.warning },
  { name: "Browser", icon: ic.globe, desc: "Web browsing", color: c.accent },
  { name: "App Store", icon: ic.store, desc: "Discover new apps", color: c.success },
  { name: "Movies", icon: ic.film, desc: "Video player", color: c.purple },
  { name: "Word", icon: ic.fileText, desc: "Document editor", color: c.accentText },
];

// ━━━━ Pricing tiers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try the OS experience",
    features: ["Basic apps", "Window management", "Dark & light themes", "Limited AI suggestions"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    desc: "Full power, unlimited access",
    features: ["All 13+ apps", "Unlimited AI assistant", "Cloud sync & backup", "Priority support", "Custom themes"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    desc: "For teams & organizations",
    features: ["Everything in Pro", "Team workspaces", "Admin controls", "Custom branding", "SSO & security", "Dedicated support"],
    highlighted: false,
  },
];

// ━━━━ Scroll-reveal hook ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </section>
  );
}

// ━━━━ Main Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function OSLandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Apps", href: "#apps" },
    { label: "AI", href: "#ai" },
    { label: "Pricing", href: "#pricing" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <div style={{ background: c.bg, color: c.text, minHeight: "100vh" }} className="font-[family-name:var(--font-geist-sans)]">
      {/* ── Nav ── */}
      <nav
        style={{
          background: scrolled ? "rgba(36,36,36,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${c.border}` : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
        className="fixed top-0 left-0 right-0 z-50 px-6 h-14 flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span style={{ color: c.text }} className="text-sm font-bold tracking-widest">ALTERNUS</span>
          <span style={{ color: c.textMuted }} className="text-sm font-light tracking-widest">OS</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} style={{ color: c.textSec }} className="text-sm no-underline hover:opacity-80 transition-opacity">
              {l.label}
            </a>
          ))}
          <Link
            href="/os"
            className="text-sm font-medium no-underline px-4 py-1.5 rounded-lg transition-all"
            style={{ background: c.accent, color: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = c.accentHover)}
            onMouseLeave={e => (e.currentTarget.style.background = c.accent)}
          >
            Try OS
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" style={{ color: c.textSec }} onClick={() => setMobileMenu(!mobileMenu)}>
          <I d={mobileMenu ? ic.close : ic.menu} s={22} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 md:hidden"
          style={{ background: "rgba(26,26,26,0.97)", backdropFilter: "blur(8px)" }}
        >
          {navLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileMenu(false)}
              className="text-xl no-underline"
              style={{ color: c.text }}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/os"
            onClick={() => setMobileMenu(false)}
            className="text-lg font-medium no-underline px-6 py-2 rounded-lg mt-4"
            style={{ background: c.accent, color: "#fff" }}
          >
            Try OS
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-12 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
        />

        <p style={{ color: c.textMuted }} className="text-xs tracking-[0.3em] uppercase mb-4">
          The Future of Desktop Computing
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-center mb-4">
          <span style={{ background: "linear-gradient(135deg, #3B82F6, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ALTERNUS
          </span>
          <span style={{ color: c.textSec }} className="font-light ml-3">OS</span>
        </h1>

        <p style={{ color: c.textSec }} className="text-lg md:text-xl text-center max-w-xl mb-8">
          AI-powered desktop operating system in your browser. Window management, 13+ apps, and an assistant that understands your workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/os"
            className="px-7 py-3 rounded-lg text-sm font-medium no-underline flex items-center gap-2 transition-all"
            style={{ background: c.accent, color: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = c.accentHover)}
            onMouseLeave={e => (e.currentTarget.style.background = c.accent)}
          >
            Try Alternus OS <I d={ic.arrowRight} s={14} />
          </Link>
          <a
            href="#pricing"
            className="px-7 py-3 rounded-lg text-sm font-medium no-underline transition-all text-center"
            style={{ border: `1px solid ${c.border}`, color: c.text }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = c.accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
          >
            View Pricing
          </a>
        </div>

        {/* OS Mockup */}
        <div
          className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden"
          style={{ border: `1px solid ${c.border}`, background: c.bgDeep, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
        >
          {/* Taskbar */}
          <div className="flex items-center justify-between px-4 h-8" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-3">
              <span style={{ color: c.text }} className="text-[10px] font-bold tracking-widest">ALTERNUS</span>
              <span style={{ color: c.textMuted }} className="text-[10px] font-light tracking-wider">OS</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: c.textMuted }} className="text-[10px] font-mono">02:22 - Apr 3</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: c.success }} className="text-[9px] font-mono">GPU 0%</span>
              <span style={{ color: c.accentText }} className="text-[9px] font-mono">CPU 2%</span>
              <span style={{ color: c.textMuted }} className="text-[9px] font-mono">46°C</span>
            </div>
          </div>

          {/* Desktop area */}
          <div className="relative h-[280px] sm:h-[340px] md:h-[400px] p-3">
            {/* Browser window */}
            <div
              className="absolute rounded-lg overflow-hidden"
              style={{
                top: "12px", left: "12px", width: "45%", height: "65%",
                background: c.surface, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center justify-between px-2 h-6" style={{ background: c.card, borderBottom: `1px solid ${c.border}` }}>
                <span style={{ color: c.textSec }} className="text-[9px]">Browser</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.danger }} />
                </div>
              </div>
              <div className="px-2 py-1.5">
                <div className="rounded h-4 mb-2" style={{ background: c.cardAlt, width: "80%" }} />
                <div className="flex gap-2 mb-3">
                  <div className="rounded h-2.5 px-1" style={{ background: c.accentSoft, width: "18%" }}>
                    <span style={{ color: c.accentText }} className="text-[7px]">Alternus Art</span>
                  </div>
                  <div className="rounded h-2.5" style={{ background: c.cardAlt, width: "12%" }} />
                  <div className="rounded h-2.5" style={{ background: c.cardAlt, width: "15%" }} />
                </div>
                <div className="rounded" style={{ background: c.cardAlt, width: "100%", height: "60%" }} />
              </div>
            </div>

            {/* Weather window */}
            <div
              className="absolute rounded-lg overflow-hidden"
              style={{
                top: "12px", right: "12px", width: "28%", height: "55%",
                background: c.surface, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center justify-between px-2 h-6" style={{ background: c.card, borderBottom: `1px solid ${c.border}` }}>
                <span style={{ color: c.textSec }} className="text-[9px]">Weather</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.danger }} />
                </div>
              </div>
              <div className="flex flex-col items-center py-3">
                <span style={{ color: c.text }} className="text-2xl font-light">17°</span>
                <span style={{ color: c.textMuted }} className="text-[9px]">Partly Cloudy</span>
                <div className="flex gap-3 mt-3">
                  {["Mon", "Tue", "Wed", "Thu"].map((d, i) => (
                    <div key={d} className="flex flex-col items-center gap-0.5">
                      <span style={{ color: c.textMuted }} className="text-[7px]">{d}</span>
                      <span style={{ color: i === 2 ? c.accent : c.textSec }} className="text-[8px]">{14 + i}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Editor window */}
            <div
              className="absolute rounded-lg overflow-hidden"
              style={{
                bottom: "12px", left: "12px", width: "42%", height: "48%",
                background: c.surface, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center justify-between px-2 h-6" style={{ background: c.card, borderBottom: `1px solid ${c.border}` }}>
                <span style={{ color: c.textSec }} className="text-[9px]">Code Editor</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.danger }} />
                </div>
              </div>
              <div className="px-2 py-1.5 font-mono text-[8px] leading-relaxed">
                <div><span style={{ color: c.textMuted }}>1</span> <span style={{ color: c.textSec }}>{"// Alternus Code Editor"}</span></div>
                <div><span style={{ color: c.textMuted }}>2</span></div>
                <div><span style={{ color: c.textMuted }}>3</span> <span style={{ color: c.purple }}>function</span> <span style={{ color: c.accentText }}>greet</span><span style={{ color: c.textSec }}>(name) {"{"}</span></div>
                <div><span style={{ color: c.textMuted }}>4</span>   <span style={{ color: c.purple }}>return</span> <span style={{ color: c.success }}>{"`Hello, ${name}!`"}</span></div>
                <div><span style={{ color: c.textMuted }}>5</span> <span style={{ color: c.textSec }}>{"}"}</span></div>
              </div>
            </div>

            {/* Settings window */}
            <div
              className="absolute rounded-lg overflow-hidden"
              style={{
                bottom: "12px", right: "12px", width: "30%", height: "55%",
                background: c.surface, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center justify-between px-2 h-6" style={{ background: c.card, borderBottom: `1px solid ${c.border}` }}>
                <span style={{ color: c.textSec }} className="text-[9px]">Settings</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.textMuted }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: c.danger }} />
                </div>
              </div>
              <div className="flex h-full">
                <div className="w-[40%] py-2 px-1.5" style={{ borderRight: `1px solid ${c.border}` }}>
                  {["Network", "Account", "Language", "Appearance", "System"].map((s, i) => (
                    <div
                      key={s}
                      className="px-1.5 py-1 rounded text-[7px] mb-0.5"
                      style={{
                        background: i === 4 ? c.accentSoft : "transparent",
                        color: i === 4 ? c.accentText : c.textSec,
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <div className="flex-1 py-2 px-2">
                  {["Wi-Fi", "Bluetooth", "Sound", "Display"].map((s, i) => (
                    <div key={s} className="flex items-center justify-between mb-1.5">
                      <span style={{ color: c.textSec }} className="text-[7px]">{s}</span>
                      <div className="w-8 h-2 rounded-full" style={{ background: i === 1 ? c.accent : c.cardAlt }}>
                        <div
                          className="w-2 h-2 rounded-full transition-all"
                          style={{
                            background: i === 1 ? "#fff" : c.textMuted,
                            marginLeft: i === 1 ? "16px" : "0px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Bar */}
          <div className="flex items-center justify-center px-4 h-10" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
            <div
              className="flex items-center gap-3 px-4 py-1.5 rounded-full max-w-md w-full"
              style={{ background: c.accentSoft, border: `1px solid ${c.accent}30` }}
            >
              <I d={ic.sparkle} s={12} color={c.accent} />
              <span style={{ color: c.textSec }} className="text-[10px] flex-1">
                AI: Opening browser. Want me to also open Notes?
              </span>
              <button className="text-[9px] px-2.5 py-0.5 rounded-md font-medium" style={{ background: c.accent, color: "#fff" }}>
                Open Notes
              </button>
              <button className="text-[9px] px-2.5 py-0.5 rounded-md" style={{ background: c.cardAlt, color: c.textSec }}>
                No thanks
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <Section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <p style={{ color: c.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Features</p>
        <h2 style={{ color: c.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need, built in.</h2>
        <p style={{ color: c.textSec }} className="text-center max-w-lg mx-auto mb-14">
          A complete desktop experience that runs entirely in your browser. No downloads, no installation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: ic.sparkle,
              color: c.accent,
              title: "AI Assistant",
              desc: "Context-aware AI that understands what you're working on and suggests helpful actions. Opens relevant apps, finds files, and assists your workflow.",
            },
            {
              icon: ic.monitor,
              color: c.purple,
              title: "Window Management",
              desc: "Drag, resize, minimize, maximize, and snap windows. Full desktop window management with edge snapping and keyboard shortcuts.",
            },
            {
              icon: ic.folder,
              color: c.warning,
              title: "13+ Built-in Apps",
              desc: "Browser, Code Editor, Terminal, Weather, Music, Calendar, Notes, Word Processor, File Manager, Settings, and more.",
            },
          ].map(f => (
            <div
              key={f.title}
              className="rounded-xl p-6 transition-all"
              style={{ background: c.surface, border: `1px solid ${c.border}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = f.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
                <I d={f.icon} s={20} color={f.color} />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p style={{ color: c.textSec }} className="text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── AI Showcase ── */}
      <Section id="ai" className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ color: c.accent }} className="text-xs tracking-[0.2em] uppercase mb-3">Smart Assistant</p>
            <h2 style={{ color: c.text }} className="text-3xl md:text-4xl font-bold mb-4">AI That Works With You</h2>
            <p style={{ color: c.textSec }} className="text-sm leading-relaxed mb-6">
              The built-in AI assistant observes your workflow and proactively offers help. It suggests relevant apps, finds files, and adapts to your work patterns.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Contextual app suggestions based on your workflow",
                "Smart workspace layouts for common tasks",
                "Instant file search across all documents",
                "System monitoring and optimization tips",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <div className="mt-0.5"><I d={ic.check} s={14} color={c.success} /></div>
                  <span style={{ color: c.textSec }} className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI notification demo */}
          <div className="flex flex-col gap-3">
            {[
              { msg: "AI: Opening browser. Want me to also open Notes?", actions: ["Open Notes", "No thanks"] },
              { msg: "AI: Detected code + terminal open. Want to launch docs browser?", actions: ["Open Docs", "Dismiss"] },
              { msg: "AI: 3 unsaved notes found. Create a backup?", actions: ["Backup Now", "Later"] },
            ].map((n, i) => (
              <div
                key={i}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  opacity: 0.7 + i * 0.15,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.accentSoft }}>
                    <I d={ic.sparkle} s={13} color={c.accent} />
                  </div>
                  <span style={{ color: c.textSec }} className="text-xs flex-1">{n.msg}</span>
                </div>
                <div className="flex gap-2 mt-3 ml-10">
                  <span className="text-[10px] px-3 py-1 rounded-md font-medium cursor-pointer" style={{ background: c.accent, color: "#fff" }}>
                    {n.actions[0]}
                  </span>
                  <span className="text-[10px] px-3 py-1 rounded-md cursor-pointer" style={{ background: c.cardAlt, color: c.textSec }}>
                    {n.actions[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Apps Grid ── */}
      <Section id="apps" className="px-6 py-24 max-w-6xl mx-auto">
        <p style={{ color: c.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Applications</p>
        <h2 style={{ color: c.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Built-in Apps</h2>
        <p style={{ color: c.textSec }} className="text-center max-w-lg mx-auto mb-14">
          Everything from productivity to entertainment, ready to use from day one.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {apps.map(app => (
            <div
              key={app.name}
              className="rounded-xl p-4 text-center transition-all cursor-default"
              style={{ background: c.surface, border: `1px solid ${c.border}` }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = app.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: `${app.color}15` }}>
                <I d={app.icon} s={20} color={app.color} />
              </div>
              <h4 className="text-xs font-semibold mb-1">{app.name}</h4>
              <p style={{ color: c.textMuted }} className="text-[10px]">{app.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section id="pricing" className="px-6 py-24 max-w-5xl mx-auto">
        <p style={{ color: c.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Pricing</p>
        <h2 style={{ color: c.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Get Alternus OS</h2>
        <p style={{ color: c.textSec }} className="text-center max-w-lg mx-auto mb-14">
          Start free, upgrade when you need more power.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className="rounded-xl p-6 flex flex-col transition-all"
              style={{
                background: c.surface,
                border: `1px solid ${tier.highlighted ? c.accent : c.border}`,
                boxShadow: tier.highlighted ? `0 0 40px ${c.accent}15` : "none",
              }}
            >
              {tier.highlighted && (
                <span
                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-full self-start mb-4"
                  style={{ background: c.accentSoft, color: c.accentText }}
                >
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span style={{ color: c.textMuted }} className="text-sm ml-1">{tier.period}</span>
              </div>
              <p style={{ color: c.textSec }} className="text-sm mb-6">{tier.desc}</p>
              <div className="flex flex-col gap-2.5 mb-8 flex-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <I d={ic.check} s={13} color={tier.highlighted ? c.accent : c.success} />
                    <span style={{ color: c.textSec }} className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/os"
                className="w-full py-2.5 rounded-lg text-sm font-medium text-center no-underline transition-all block"
                style={{
                  background: tier.highlighted ? c.accent : "transparent",
                  color: tier.highlighted ? "#fff" : c.text,
                  border: tier.highlighted ? "none" : `1px solid ${c.border}`,
                }}
                onMouseEnter={e => {
                  if (tier.highlighted) e.currentTarget.style.background = c.accentHover;
                  else e.currentTarget.style.borderColor = c.accent;
                }}
                onMouseLeave={e => {
                  if (tier.highlighted) e.currentTarget.style.background = c.accent;
                  else e.currentTarget.style.borderColor = c.border;
                }}
              >
                {tier.name === "Free" ? "Try Free" : tier.name === "Enterprise" ? "Contact Sales" : "Get Pro"}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to try Alternus OS?</h2>
          <p style={{ color: c.textSec }} className="mb-8">
            No download required. Launch the full desktop experience in your browser right now.
          </p>
          <Link
            href="/os"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-medium no-underline transition-all"
            style={{ background: c.accent, color: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = c.accentHover)}
            onMouseLeave={e => (e.currentTarget.style.background = c.accent)}
          >
            Launch Alternus OS <I d={ic.arrowRight} s={14} />
          </Link>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span style={{ color: c.textSec }} className="text-xs font-bold tracking-widest">ALTERNUS</span>
            <span style={{ color: c.textMuted }} className="text-xs font-light tracking-widest">OS</span>
          </div>
          <div className="flex items-center gap-5">
            {[
              { label: "Gallery", href: "/gallery" },
              { label: "OS", href: "/os" },
              { label: "Contact", href: "/contact" },
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ color: c.textMuted }} className="text-xs no-underline hover:opacity-80 transition-opacity">
                {l.label}
              </Link>
            ))}
          </div>
          <span style={{ color: c.textMuted }} className="text-xs">
            &copy; {new Date().getFullYear()} Alternus. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
