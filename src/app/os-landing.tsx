"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ━━━━ Palette (matches /os page) ━━━━━━━━━━━━━━━━━━━━━━━━━━
const themes = {
 dark: {
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
 },
 light: {
 bg: "#F5F5F7",
 bgDeep: "#FFFFFF",
 surface: "#FFFFFF",
 card: "#FFFFFF",
 cardAlt: "#F0F0F2",
 border: "#D4D4D8",
 text: "#18181B",
 textSec: "#52525B",
 textMuted: "#A1A1AA",
 accent: "#3B82F6",
 accentHover: "#2563EB",
 accentSoft: "rgba(59,130,246,0.1)",
 accentText: "#2563EB",
 success: "#10B981",
 warning: "#F59E0B",
 danger: "#EF4444",
 purple: "#8B5CF6",
 },
};

// Default for static references (overridden by theme state at runtime)
const c = themes.dark;

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
const appsFeatured = [
 { name: "AI Assistant", icon: ic.sparkle, desc: "Context-aware intelligence that adapts to your workflow. Get suggestions, automate tasks, and find files instantly.", color: c.accent, tag: "Included" },
 { name: "Code Editor", icon: ic.code, desc: "Professional code editing with syntax highlighting, autocomplete, and integrated terminal support.", color: c.purple, tag: "Pro" },
 { name: "Browser", icon: ic.globe, desc: "Built-in web browser with tab management, bookmarks, and seamless integration with other OS apps.", color: c.accentText, tag: "Included" },
];

const appsAll = [
 { name: "Terminal", icon: ic.terminal, color: c.success },
 { name: "File Manager", icon: ic.folder, color: c.warning },
 { name: "Settings", icon: ic.settings, color: c.textSec },
 { name: "Music", icon: ic.music, color: "#F472B6" },
 { name: "Weather", icon: ic.cloud, color: c.accentText },
 { name: "Calendar", icon: ic.calendar, color: c.danger },
 { name: "Notes", icon: ic.note, color: c.warning },
 { name: "App Store", icon: ic.store, color: c.success },
 { name: "Movies", icon: ic.film, color: c.purple },
 { name: "Word", icon: ic.fileText, color: c.accentText },
];

// ━━━━ Pricing tiers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const tiers = [
 {
 name: "Cedium ART",
 price: "$59.99",
 period: "",
 desc: "Essential desktop experience",
 features: ["All built-in apps", "Window management", "Dark & light themes", "AI assistant", "File management", "Regular updates"],
 highlighted: false,
 cta: "Get ART",
 },
 {
 name: "Cedium Ultra",
 price: "$79.99",
 period: "",
 desc: "The complete Cedium experience",
 features: ["Everything in ART", "Unlimited AI assistant", "Cloud sync & backup", "Priority support", "Custom themes", "Early access to new features"],
 highlighted: true,
 cta: "Get Ultra",
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
 const [theme, setTheme] = useState<"dark" | "light">("dark");
 const t = themes[theme];

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
 { label: "Support", href: "#support" },
 ];

 return (
 <div style={{ background: t.bg, color: t.text, minHeight: "100vh" }} className="font-[family-name:var(--font-geist-sans)]">
 {/* ── Nav ── */}
 <nav
 style={{
 background: scrolled ? (theme === "dark" ? "rgba(36,36,36,0.95)" : "rgba(245,245,247,0.95)") : "transparent",
 backdropFilter: scrolled ? "blur(12px)" : "none",
 borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
 transition: "all 0.3s ease",
 }}
 className="fixed top-0 left-0 right-0 z-50 px-6 h-14 flex items-center justify-between"
 >
 <Link href="/" className="flex items-center gap-2 no-underline">
 <span style={{ color: t.text }} className="text-sm font-bold tracking-widest">Cedium</span>
 <span style={{ color: t.textMuted }} className="text-sm font-light tracking-widest">OS</span>
 </Link>

 {/* Desktop links */}
 <div className="hidden md:flex items-center gap-6">
 {navLinks.map(l => (
 <a key={l.label} href={l.href} style={{ color: t.textSec }} className="text-sm no-underline hover:opacity-80 transition-opacity">
 {l.label}
 </a>
 ))}
 <Link
 href="/main"
 className="text-sm font-medium no-underline px-4 py-1.5 rounded-lg transition-all"
 style={{ background: t.accent, color: "#fff" }}
 onMouseEnter={e => (e.currentTarget.style.background = t.accentHover)}
 onMouseLeave={e => (e.currentTarget.style.background = t.accent)}
 >
 Try OS
 </Link>
 </div>

 {/* Mobile hamburger */}
 <button className="md:hidden" style={{ color: t.textSec }} onClick={() => setMobileMenu(!mobileMenu)}>
 <I d={mobileMenu ? ic.close : ic.menu} s={22} />
 </button>
 </nav>

 {/* Mobile menu overlay */}
 {mobileMenu && (
 <div
 className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 md:hidden"
 style={{ background: theme === "dark" ? "rgba(26,26,26,0.97)" : "rgba(245,245,247,0.97)", backdropFilter: "blur(8px)" }}
 >
 {navLinks.map(l => (
 <a
 key={l.label}
 href={l.href}
 onClick={() => setMobileMenu(false)}
 className="text-xl no-underline"
 style={{ color: t.text }}
 >
 {l.label}
 </a>
 ))}
 <Link
 href="/main"
 onClick={() => setMobileMenu(false)}
 className="text-lg font-medium no-underline px-6 py-2 rounded-lg mt-4"
 style={{ background: t.accent, color: "#fff" }}
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

 <p style={{ color: t.textMuted }} className="text-xs tracking-[0.3em] uppercase mb-4">
 The Future of Desktop Computing
 </p>

 <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-center mb-4 relative">
 <span
 className="font-semibold"
 style={{
 background: theme === "dark"
 ? "linear-gradient(135deg, #6B6B6B 0%, #9CA3AF 40%, #D1D5DB 70%, #9CA3AF 100%)"
 : "linear-gradient(135deg, #374151 0%, #6B7280 40%, #9CA3AF 70%, #6B7280 100%)",
 WebkitBackgroundClip: "text",
 WebkitTextFillColor: "transparent",
 letterSpacing: "-0.02em",
 }}
 >
 Cedium
 </span>
 <sup style={{ color: t.textMuted, fontSize: "0.25em", verticalAlign: "super", position: "relative", top: "-0.6em" }}>&copy;</sup>
 </h1>

 <p style={{ color: t.textSec }} className="text-lg md:text-xl text-center max-w-xl mb-8">
 AI-powered desktop operating system in your browser. Window management, 13+ apps, and an assistant that understands your workflow.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 mb-16">
 <Link
 href="/main"
 className="px-7 py-3 rounded-lg text-sm font-medium no-underline flex items-center gap-2 transition-all"
 style={{ background: t.accent, color: "#fff" }}
 onMouseEnter={e => (e.currentTarget.style.background = t.accentHover)}
 onMouseLeave={e => (e.currentTarget.style.background = t.accent)}
 >
 Try Cedium OS <I d={ic.arrowRight} s={14} />
 </Link>
 <a
 href="#pricing"
 className="px-7 py-3 rounded-lg text-sm font-medium no-underline transition-all text-center"
 style={{ border: `1px solid ${t.border}`, color: t.text }}
 onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
 onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
 >
 View Pricing
 </a>
 </div>

 {/* 3D Monitor Mockup */}
 <div className="relative w-full max-w-4xl mx-auto" style={{ perspective: "1200px" }}>
 {/* Monitor frame */}
 <div
 className="relative rounded-2xl overflow-hidden"
 style={{
 border: `3px solid ${theme === "dark" ? "#444" : "#ccc"}`,
 background: theme === "dark" ? "#1a1a1a" : "#222",
 boxShadow: theme === "dark"
 ? "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset"
 : "0 30px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.3) inset",
 transform: "rotateX(2deg)",
 transformOrigin: "center bottom",
 }}
 >
 {/* Screen bezel */}
 <div className="p-1.5">
 {/* Actual screen content */}
 <div className="rounded-lg overflow-hidden" style={{ background: t.bgDeep }}>
 {/* Taskbar */}
 <div className="flex items-center justify-between px-4 h-7" style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}>
 <div className="flex items-center gap-3">
 <span style={{ color: t.text }} className="text-[9px] font-bold tracking-widest">Cedium</span>
 <span style={{ color: t.textMuted }} className="text-[9px] font-light tracking-wider">OS</span>
 </div>
 <span style={{ color: t.textMuted }} className="text-[9px] font-mono">02:22 - Apr 3</span>
 <div className="flex items-center gap-3">
 <span style={{ color: t.success }} className="text-[8px] font-mono">GPU 0%</span>
 <span style={{ color: t.accentText }} className="text-[8px] font-mono">CPU 2%</span>
 <span style={{ color: t.textMuted }} className="text-[8px] font-mono">46°C</span>
 </div>
 </div>

 {/* Desktop */}
 <div className="relative h-[240px] sm:h-[300px] md:h-[380px] p-2.5">
 {/* Browser */}
 <div className="absolute rounded-lg overflow-hidden" style={{ top: 10, left: 10, width: "46%", height: "62%", background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
 <div className="flex items-center justify-between px-2 h-5" style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}>
 <span style={{ color: t.textSec }} className="text-[8px]">Browser</span>
 <div className="flex gap-0.5">
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.danger }} />
 </div>
 </div>
 <div className="px-2 py-1">
 <div className="rounded h-3 mb-1.5" style={{ background: t.cardAlt, width: "75%" }} />
 <div className="flex gap-1.5 mb-2">
 <div className="rounded h-2 px-1" style={{ background: t.accentSoft, width: "20%" }}>
 <span style={{ color: t.accentText }} className="text-[6px]">Cedium</span>
 </div>
 <div className="rounded h-2" style={{ background: t.cardAlt, width: "14%" }} />
 <div className="rounded h-2" style={{ background: t.cardAlt, width: "14%" }} />
 </div>
 <div className="rounded h-16" style={{ background: t.cardAlt }} />
 </div>
 </div>

 {/* Weather */}
 <div className="absolute rounded-lg overflow-hidden" style={{ top: 10, right: 10, width: "27%", height: "50%", background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
 <div className="flex items-center justify-between px-2 h-5" style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}>
 <span style={{ color: t.textSec }} className="text-[8px]">Weather</span>
 <div className="flex gap-0.5">
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.danger }} />
 </div>
 </div>
 <div className="flex flex-col items-center py-2">
 <span style={{ color: t.text }} className="text-xl font-light">17°</span>
 <span style={{ color: t.textMuted }} className="text-[8px]">Partly Cloudy</span>
 <div className="flex gap-2 mt-2">
 {["Mon", "Tue", "Wed", "Thu"].map((d, i) => (
 <div key={d} className="flex flex-col items-center">
 <span style={{ color: t.textMuted }} className="text-[6px]">{d}</span>
 <span style={{ color: i === 2 ? t.accent : t.textSec }} className="text-[7px]">{14 + i}°</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Code Editor */}
 <div className="absolute rounded-lg overflow-hidden" style={{ bottom: 10, left: 10, width: "43%", height: "48%", background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
 <div className="flex items-center justify-between px-2 h-5" style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}>
 <span style={{ color: t.textSec }} className="text-[8px]">Code Editor</span>
 <div className="flex gap-0.5">
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.danger }} />
 </div>
 </div>
 <div className="px-2 py-1 font-mono text-[7px] leading-relaxed">
 <div><span style={{ color: t.textMuted }}>1</span> <span style={{ color: t.textSec }}>{"// Cedium Code Editor"}</span></div>
 <div><span style={{ color: t.textMuted }}>2</span></div>
 <div><span style={{ color: t.textMuted }}>3</span> <span style={{ color: t.purple }}>function</span> <span style={{ color: t.accentText }}>greet</span><span style={{ color: t.textSec }}>(name) {"{"}</span></div>
 <div><span style={{ color: t.textMuted }}>4</span> <span style={{ color: t.purple }}>return</span> <span style={{ color: t.success }}>{"`Hello, ${name}!`"}</span></div>
 <div><span style={{ color: t.textMuted }}>5</span> <span style={{ color: t.textSec }}>{"}"}</span></div>
 </div>
 </div>

 {/* Settings */}
 <div className="absolute rounded-lg overflow-hidden" style={{ bottom: 10, right: 10, width: "29%", height: "52%", background: t.surface, border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
 <div className="flex items-center justify-between px-2 h-5" style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}>
 <span style={{ color: t.textSec }} className="text-[8px]">Settings</span>
 <div className="flex gap-0.5">
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textMuted }} />
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.danger }} />
 </div>
 </div>
 <div className="flex h-[calc(100%-20px)]">
 <div className="w-[42%] py-1.5 px-1" style={{ borderRight: `1px solid ${t.border}` }}>
 {["Network", "Account", "Language", "Appearance", "System"].map((s, i) => (
 <div key={s} className="px-1 py-0.5 rounded text-[6px] mb-0.5" style={{ background: i === 4 ? t.accentSoft : "transparent", color: i === 4 ? t.accentText : t.textSec }}>{s}</div>
 ))}
 </div>
 <div className="flex-1 py-1.5 px-1.5">
 {["Wi-Fi", "Bluetooth", "Sound", "Display"].map((s, i) => (
 <div key={s} className="flex items-center justify-between mb-1">
 <span style={{ color: t.textSec }} className="text-[6px]">{s}</span>
 <div className="w-6 h-1.5 rounded-full" style={{ background: i === 1 ? t.accent : t.cardAlt }}>
 <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 1 ? "#fff" : t.textMuted, marginLeft: i === 1 ? "12px" : "0px" }} />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* AI Bar */}
 <div className="flex items-center justify-center px-3 h-8" style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
 <div className="flex items-center gap-2 px-3 py-1 rounded-full max-w-sm w-full" style={{ background: t.accentSoft, border: `1px solid ${t.accent}30` }}>
 <I d={ic.sparkle} s={10} color={t.accent} />
 <span style={{ color: t.textSec }} className="text-[9px] flex-1">AI: Opening browser. Want me to also open Notes?</span>
 <span className="text-[8px] px-2 py-0.5 rounded-md font-medium" style={{ background: t.accent, color: "#fff" }}>Open Notes</span>
 <span className="text-[8px] px-2 py-0.5 rounded-md" style={{ background: t.cardAlt, color: t.textSec }}>No thanks</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Monitor stand */}
 <div className="flex flex-col items-center">
 {/* Neck */}
 <div
 className="w-16 h-8 rounded-b-md"
 style={{
 background: theme === "dark"
 ? "linear-gradient(180deg, #3a3a3a, #2a2a2a)"
 : "linear-gradient(180deg, #d4d4d8, #a1a1aa)",
 }}
 />
 {/* Base */}
 <div
 className="w-40 h-2.5 rounded-full"
 style={{
 background: theme === "dark"
 ? "linear-gradient(180deg, #333, #252525)"
 : "linear-gradient(180deg, #c4c4c8, #9a9a9e)",
 boxShadow: theme === "dark"
 ? "0 4px 16px rgba(0,0,0,0.4)"
 : "0 4px 16px rgba(0,0,0,0.15)",
 }}
 />
 </div>
 </div>
 </div>

 {/* ── Features ── */}
 <Section id="features" className="px-6 py-24 max-w-6xl mx-auto">
 <p style={{ color: t.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Features</p>
 <h2 style={{ color: t.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need, built in.</h2>
 <p style={{ color: t.textSec }} className="text-center max-w-lg mx-auto mb-14">
 A complete desktop experience that runs entirely in your browser. No downloads, no installation.
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {[
 {
 icon: ic.sparkle,
 color: t.accent,
 title: "AI Assistant",
 desc: "Context-aware AI that understands what you're working on and suggests helpful actions. Opens relevant apps, finds files, and assists your workflow.",
 },
 {
 icon: ic.monitor,
 color: t.purple,
 title: "Window Management",
 desc: "Drag, resize, minimize, maximize, and snap windows. Full desktop window management with edge snapping and keyboard shortcuts.",
 },
 {
 icon: ic.folder,
 color: t.warning,
 title: "13+ Built-in Apps",
 desc: "Browser, Code Editor, Terminal, Weather, Music, Calendar, Notes, Word Processor, File Manager, Settings, and more.",
 },
 ].map(f => (
 <div
 key={f.title}
 className="rounded-xl p-6 transition-all"
 style={{ background: t.surface, border: `1px solid ${t.border}` }}
 onMouseEnter={e => (e.currentTarget.style.borderColor = f.color)}
 onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
 >
 <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
 <I d={f.icon} s={20} color={f.color} />
 </div>
 <h3 className="text-base font-semibold mb-2">{f.title}</h3>
 <p style={{ color: t.textSec }} className="text-sm leading-relaxed">{f.desc}</p>
 </div>
 ))}
 </div>
 </Section>

 {/* ── AI Showcase ── */}
 <Section id="ai" className="px-6 py-24 max-w-6xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
 <div>
 <p style={{ color: t.accent }} className="text-xs tracking-[0.2em] uppercase mb-3">Smart Assistant</p>
 <h2 style={{ color: t.text }} className="text-3xl md:text-4xl font-bold mb-4">AI That Works With You</h2>
 <p style={{ color: t.textSec }} className="text-sm leading-relaxed mb-6">
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
 <div className="mt-0.5"><I d={ic.check} s={14} color={t.success} /></div>
 <span style={{ color: t.textSec }} className="text-sm">{item}</span>
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
 background: t.surface,
 border: `1px solid ${t.border}`,
 opacity: 0.7 + i * 0.15,
 }}
 >
 <div className="flex items-center gap-3">
 <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: t.accentSoft }}>
 <I d={ic.sparkle} s={13} color={t.accent} />
 </div>
 <span style={{ color: t.textSec }} className="text-xs flex-1">{n.msg}</span>
 </div>
 <div className="flex gap-2 mt-3 ml-10">
 <span className="text-[10px] px-3 py-1 rounded-md font-medium cursor-pointer" style={{ background: t.accent, color: "#fff" }}>
 {n.actions[0]}
 </span>
 <span className="text-[10px] px-3 py-1 rounded-md cursor-pointer" style={{ background: t.cardAlt, color: t.textSec }}>
 {n.actions[1]}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Section>

 {/* ── Apps Showcase ── */}
 <Section id="apps" className="px-6 py-24 max-w-6xl mx-auto">
 <p style={{ color: t.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Applications</p>
 <h2 style={{ color: t.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Built-in Apps</h2>
 <p style={{ color: t.textSec }} className="text-center max-w-lg mx-auto mb-14">
 Everything from productivity to entertainment, ready to use from day one.
 </p>

 {/* Featured apps - large cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
 {appsFeatured.map(app => (
 <div
 key={app.name}
 className="rounded-2xl overflow-hidden transition-all group"
 style={{ background: t.surface, border: `1px solid ${t.border}` }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = app.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${app.color}15`; }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 {/* Icon area */}
 <div className="flex items-center justify-center py-8" style={{ background: `${app.color}08` }}>
 <div
 className="w-16 h-16 rounded-2xl flex items-center justify-center"
 style={{ background: t.cardAlt, boxShadow: `0 4px 16px rgba(0,0,0,0.3)` }}
 >
 <I d={app.icon} s={28} color={app.color} />
 </div>
 </div>
 {/* Content */}
 <div className="p-5" style={{ borderTop: `1px solid ${t.border}` }}>
 <div className="flex items-center justify-between mb-2">
 <h4 className="text-sm font-semibold">{app.name}</h4>
 <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: t.accentSoft, color: t.accentText }}>{app.tag}</span>
 </div>
 <p style={{ color: t.textSec }} className="text-xs leading-relaxed mb-4">{app.desc}</p>
 <div className="flex flex-col gap-1.5" style={{ borderTop: `1px solid ${t.border}`, paddingTop: "12px" }}>
 <Link href="/main" className="flex items-center gap-1.5 text-xs no-underline" style={{ color: t.accentText }}>
 <I d={ic.arrowRight} s={11} color={t.accentText} /> Launch in OS
 </Link>
 <a href="#" className="flex items-center gap-1.5 text-xs no-underline" style={{ color: t.accentText }}>
 <I d={ic.fileText} s={11} color={t.accentText} /> Learn more
 </a>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* All other apps - compact row */}
 <div className="rounded-2xl p-6" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
 <div className="flex items-center justify-between mb-5">
 <h4 className="text-sm font-semibold">All Apps</h4>
 <span style={{ color: t.textMuted }} className="text-xs">{appsAll.length + appsFeatured.length} apps included</span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
 {appsAll.map(app => (
 <div
 key={app.name}
 className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-default"
 onMouseEnter={e => (e.currentTarget.style.background = t.cardAlt)}
 onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
 >
 <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${app.color}15` }}>
 <I d={app.icon} s={16} color={app.color} />
 </div>
 <span className="text-xs font-medium">{app.name}</span>
 </div>
 ))}
 </div>
 </div>
 </Section>

 {/* ── Pricing ── */}
 <Section id="pricing" className="px-6 py-24 max-w-5xl mx-auto">
 <p style={{ color: t.accent }} className="text-xs tracking-[0.2em] uppercase text-center mb-3">Pricing</p>
 <h2 style={{ color: t.text }} className="text-3xl md:text-4xl font-bold text-center mb-4">Get Cedium OS</h2>
 <p style={{ color: t.textSec }} className="text-center max-w-lg mx-auto mb-14">
 Choose the edition that fits your needs.
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
 {tiers.map(tier => (
 <div
 key={tier.name}
 className="rounded-xl p-6 flex flex-col transition-all"
 style={{
 background: t.surface,
 border: `1px solid ${tier.highlighted ? t.accent : t.border}`,
 boxShadow: tier.highlighted ? `0 0 40px ${t.accent}15` : "none",
 }}
 >
 {tier.highlighted && (
 <span
 className="text-[10px] font-medium px-2.5 py-0.5 rounded-full self-start mb-4"
 style={{ background: t.accentSoft, color: t.accentText }}
 >
 Recommended
 </span>
 )}
 <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
 <div className="mb-1">
 <span className="text-3xl font-bold">{tier.price}</span>
 <span style={{ color: t.textMuted }} className="text-sm ml-1">{tier.period}</span>
 </div>
 <p style={{ color: t.textSec }} className="text-sm mb-6">{tier.desc}</p>
 <div className="flex flex-col gap-2.5 mb-8 flex-1">
 {tier.features.map(f => (
 <div key={f} className="flex items-center gap-2">
 <I d={ic.check} s={13} color={tier.highlighted ? t.accent : t.success} />
 <span style={{ color: t.textSec }} className="text-sm">{f}</span>
 </div>
 ))}
 </div>
 <Link
 href="/main"
 className="w-full py-2.5 rounded-lg text-sm font-medium text-center no-underline transition-all block"
 style={{
 background: tier.highlighted ? t.accent : "transparent",
 color: tier.highlighted ? "#fff" : t.text,
 border: tier.highlighted ? "none" : `1px solid ${t.border}`,
 }}
 onMouseEnter={e => {
 if (tier.highlighted) e.currentTarget.style.background = t.accentHover;
 else e.currentTarget.style.borderColor = t.accent;
 }}
 onMouseLeave={e => {
 if (tier.highlighted) e.currentTarget.style.background = t.accent;
 else e.currentTarget.style.borderColor = t.border;
 }}
 >
 {tier.cta}
 </Link>
 </div>
 ))}
 </div>
 </Section>

 {/* ── CTA ── */}
 <Section className="px-6 py-24 text-center">
 <div className="max-w-2xl mx-auto">
 <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to try Cedium OS?</h2>
 <p style={{ color: t.textSec }} className="mb-8">
 No download required. Launch the full desktop experience in your browser right now.
 </p>
 <Link
 href="/main"
 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-medium no-underline transition-all"
 style={{ background: t.accent, color: "#fff" }}
 onMouseEnter={e => (e.currentTarget.style.background = t.accentHover)}
 onMouseLeave={e => (e.currentTarget.style.background = t.accent)}
 >
 Launch Cedium OS <I d={ic.arrowRight} s={14} />
 </Link>
 </div>
 </Section>

 {/* ── Support CTA ── */}
 <Section id="support" className="px-6 py-20 max-w-4xl mx-auto text-center">
 <div className="rounded-2xl p-10" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
 <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: t.accentSoft }}>
 <I d={ic.shield} s={22} color={t.accent} />
 </div>
 <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
 <p style={{ color: t.textSec }} className="text-sm mb-6 max-w-md mx-auto">
 Our support team is here to help you get the most out of Cedium OS. Browse docs, join the community, or contact us directly.
 </p>
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <a href="#" className="px-5 py-2.5 rounded-lg text-sm font-medium no-underline" style={{ background: t.accent, color: "#fff" }}>
 Documentation
 </a>
 <a href="/contact" className="px-5 py-2.5 rounded-lg text-sm font-medium no-underline" style={{ border: `1px solid ${t.border}`, color: t.text }}>
 Contact Support
 </a>
 </div>
 </div>
 </Section>

 {/* ── Footer ── */}
 <footer className="px-6 pt-16 pb-8" style={{ borderTop: `1px solid ${t.border}` }}>
 <div className="max-w-6xl mx-auto">
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
 {/* Brand */}
 <div className="col-span-2 md:col-span-1">
 <div className="flex items-center gap-2 mb-3">
 <span style={{ color: t.text }} className="text-sm font-bold tracking-widest">Cedium</span>
 <span style={{ color: t.textMuted }} className="text-sm font-light tracking-widest">OS</span>
 </div>
 <p style={{ color: t.textMuted }} className="text-xs leading-relaxed mb-3">
 The AI-powered desktop operating system in your browser.
 </p>
 {/* Theme toggle */}
 <div className="flex items-center gap-1 mb-4">
 <span style={{ color: t.textMuted }} className="text-[10px] mr-1">Mode:</span>
 <button
 onClick={() => setTheme("dark")}
 className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
 style={{ background: theme === "dark" ? t.accent : "transparent", color: theme === "dark" ? "#fff" : t.textMuted }}
 >
 Dark
 </button>
 <button
 onClick={() => setTheme("light")}
 className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
 style={{ background: theme === "light" ? t.accent : "transparent", color: theme === "light" ? "#fff" : t.textMuted }}
 >
 Light
 </button>
 </div>
 {/* Social media */}
 <div className="flex items-center gap-2.5">
 {[
 { label: "GitHub", d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22", href: "https://github.com" },
 { label: "Twitter", d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z", href: "https://twitter.com" },
 { label: "Instagram", d: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zM16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01", href: "https://instagram.com" },
 { label: "YouTube", d: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z", href: "https://youtube.com" },
 ].map(s => (
 <a
 key={s.label}
 href={s.href}
 target="_blank"
 rel="noopener noreferrer"
 className="w-8 h-8 rounded-lg flex items-center justify-center transition-all no-underline"
 style={{ background: t.cardAlt, color: t.textMuted }}
 onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; }}
 onMouseLeave={e => { e.currentTarget.style.background = t.cardAlt; e.currentTarget.style.color = t.textMuted; }}
 aria-label={s.label}
 >
 <I d={s.d} s={13} />
 </a>
 ))}
 </div>
 </div>

 {/* Operating System */}
 <div>
 <h4 style={{ color: t.textSec }} className="text-xs font-semibold uppercase tracking-wider mb-3">Operating System</h4>
 <div className="flex flex-col gap-2">
 {[
 { label: "Try Cedium OS", href: "/main" },
 { label: "Cedium ART", href: "#pricing" },
 { label: "Cedium Ultra", href: "#pricing" },
 { label: "System Requirements", href: "#" },
 { label: "Release Notes", href: "#" },
 { label: "What's New", href: "#" },
 ].map(l => (
 <a key={l.label} href={l.href} style={{ color: t.textMuted }} className="text-xs no-underline hover:opacity-80 transition-opacity">
 {l.label}
 </a>
 ))}
 </div>
 </div>

 {/* Download & Support */}
 <div>
 <h4 style={{ color: t.textSec }} className="text-xs font-semibold uppercase tracking-wider mb-3">Download & Support</h4>
 <div className="flex flex-col gap-2">
 {[
 { label: "Download OS", href: "/main" },
 { label: "Installation Guide", href: "#" },
 { label: "Help Center", href: "#" },
 { label: "Report a Bug", href: "#" },
 { label: "Feature Requests", href: "#" },
 { label: "Status Page", href: "#" },
 ].map(l => (
 <a key={l.label} href={l.href} style={{ color: t.textMuted }} className="text-xs no-underline hover:opacity-80 transition-opacity">
 {l.label}
 </a>
 ))}
 </div>
 </div>

 {/* Developers */}
 <div>
 <h4 style={{ color: t.textSec }} className="text-xs font-semibold uppercase tracking-wider mb-3">Developers</h4>
 <div className="flex flex-col gap-2">
 {[
 { label: "Documentation", href: "#" },
 { label: "API Reference", href: "#" },
 { label: "Developer Tools", href: "#" },
 { label: "Extensions & Plugins", href: "#" },
 { label: "Open Source", href: "#" },
 { label: "Community Forum", href: "#" },
 ].map(l => (
 <a key={l.label} href={l.href} style={{ color: t.textMuted }} className="text-xs no-underline hover:opacity-80 transition-opacity">
 {l.label}
 </a>
 ))}
 </div>
 </div>

 {/* Legal & Company */}
 <div>
 <h4 style={{ color: t.textSec }} className="text-xs font-semibold uppercase tracking-wider mb-3">Company</h4>
 <div className="flex flex-col gap-2">
 {[
 { label: "About Cedium", href: "/about" },
 { label: "Contact", href: "/contact" },
 { label: "Terms of Service", href: "/terms" },
 { label: "Privacy Policy", href: "/privacy" },
 { label: "Cookie Policy", href: "/cookie-notice" },
 { label: "Security", href: "#" },
 ].map(l => (
 <a key={l.label} href={l.href} style={{ color: t.textMuted }} className="text-xs no-underline hover:opacity-80 transition-opacity">
 {l.label}
 </a>
 ))}
 </div>
 </div>
 </div>

 {/* Bottom bar */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: `1px solid ${t.border}` }}>
 <span style={{ color: t.textMuted }} className="text-xs">
 &copy; {new Date().getFullYear()} Cedium. All rights reserved.
 </span>
 <div className="flex items-center gap-4">
 <span style={{ color: t.textMuted }} className="text-xs">Cedium ART &middot; Cedium Ultra &middot; Cedium OS v1.0</span>
 </div>
 </div>
 </div>
 </footer>

 {/* ── Scroll to top button (replaces chat) ── */}
 <button
 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
 className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-50 transition-all "
 style={{
 background: t.accent,
 color: "#fff",
 opacity: scrolled ? 1 : 0,
 pointerEvents: scrolled ? "auto" : "none",
 transform: scrolled ? "translateY(0)" : "translateY(16px)",
 }}
 onMouseEnter={e => (e.currentTarget.style.background = t.accentHover)}
 onMouseLeave={e => (e.currentTarget.style.background = t.accent)}
 aria-label="Scroll to top"
 >
 <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M18 15l-6-6-6 6" />
 </svg>
 </button>
 </div>
 );
}
