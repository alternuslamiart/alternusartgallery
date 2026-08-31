"use client";

import Link from "next/link";
import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";

export const COBALT = "#4284FF";
export const COBALT_DEEP = "#1E5ED4";
export const INK = "#1F1F1F";
export const PAPER = "#F4F6FB";
export const DARK_BG = "#1B1B1B";
export const DARK_SURFACE = "#262626";
export const DARK_SURFACE_SOFT = "#202020";
export const DARK_BORDER = "rgba(255,255,255,0.16)";
export const DARK_BORDER_SOFT = "rgba(255,255,255,0.10)";
export const DARK_MUTED = "rgba(193,194,191,0.72)";
export const DARK_TEXT = "#C1C2BF";
const THEME_KEY = "Coreforge_theme";

/**
 * AI-branded Coreforge mark. A cobalt rounded tile with a 4-point sparkle
 * plus one smaller satellite spark — the universal 'AI' glyph.
 */
export function CoreforgeLogo({ size = 28, radius = 8 }: { size?: number; radius?: number }) {
 const spark = size * 0.64;
 return (
 <div style={{ width: size, height: size, background: COBALT, borderRadius: radius, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
 <svg width={spark} height={spark} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
 {/* Main 4-point sparkle */}
 <path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" />
 {/* Satellite spark (top-right) */}
 <path d="M19 4 L19.5 6.5 L22 7 L19.5 7.5 L19 10 L18.5 7.5 L16 7 L18.5 6.5 Z" opacity="0.85" />
 </svg>
 </div>
 );
}

export function useCoreforgeMode() {
 const [isDark, setIsDark] = useState(false);

 useEffect(() => {
 const saved = window.localStorage.getItem(THEME_KEY);
 const next = saved ? saved === "dark" : false;
 setIsDark(next);
 document.documentElement.dataset.CoreforgeTheme = next ? "dark" : "light";
 }, []);

 const setMode: Dispatch<SetStateAction<boolean>> = useCallback((next) => {
 setIsDark((current) => {
 const value = typeof next === "function" ? next(current) : next;
 window.localStorage.setItem(THEME_KEY, value ? "dark" : "light");
 document.documentElement.dataset.CoreforgeTheme = value ? "dark" : "light";
 return value;
 });
 }, []);

 return [isDark, setMode] as const;
}

export function useCoreforgeTheme() {
 const [isDark, setIsDark] = useCoreforgeMode();
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
 const fn = () => setScrolled(window.scrollY > 8);
 window.addEventListener("scroll", fn, { passive: true });
 return () => window.removeEventListener("scroll", fn);
 }, []);

 const bg = isDark ? DARK_BG : PAPER;
 const fg = isDark ? DARK_TEXT : INK;
 const muted = isDark ? DARK_MUTED : "rgba(5,8,15,0.62)";
 const faint = isDark ? DARK_BORDER : "rgba(5,8,15,0.1)";
 const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(5,8,15,0.035)";
 const raised = isDark ? DARK_SURFACE : "#FFFFFF";

 return { isDark, setIsDark, scrolled, bg, fg, muted, faint, surface, raised };
}

export function CoreforgeNav({ isDark, setIsDark, scrolled, fg, muted, faint }: ReturnType<typeof useCoreforgeTheme>) {
 return (
 <header style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", transition: "all 0.25s", backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none", background: scrolled ? (isDark ? "rgba(18,18,20,0.84)" : "rgba(244,246,251,0.82)") : "transparent", borderBottom: `1px solid ${scrolled ? faint : "transparent"}` }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", gap: 32 }}>
 <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
 <CoreforgeLogo size={28} radius={8} />
 <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: fg, fontStretch: "90%" }}>Crystal Studio</span>
 </Link>
 <nav className="hidden md:flex" style={{ alignItems: "center", gap: 24 }}>
 {[{ l: "Platform", h: "/platform/overview" }, { l: "CAD Studios", h: "/platform/bridges" }, { l: "Company", h: "/about" }, { l: "Pricing", h: "/pricing" }].map((i) => (
 <Link key={i.l} href={i.h} style={{ fontSize: 13, color: muted, fontWeight: 500, textDecoration: "none", letterSpacing: "-0.01em" }}>{i.l}</Link>
 ))}
 </nav>
 <div style={{ flex: 1 }} />
 <button onClick={() => setIsDark(!isDark)} style={{ width: 34, height: 34, border: `1px solid ${faint}`, background: isDark ? "rgba(255,255,255,0.04)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, borderRadius: 8 }}>
 {isDark
 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
 : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
 }
 </button>
 <Link href="/login" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 14px", fontSize: 13, fontWeight: 600, color: fg, textDecoration: "none", letterSpacing: "-0.01em", borderRadius: 8, border: `1px solid ${faint}` }} className="hover:!border-[#4284FF]">
 Log in
 </Link>
 <Link href="/account" aria-label="Account profile" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, fontSize: 12, fontWeight: 800, textDecoration: "none", letterSpacing: "-0.02em" }}>AL</Link>
 <Link href="/download" className="hidden sm:inline-flex" style={{ alignItems: "center", height: 36, padding: "0 15px", color: fg, fontSize: 13, fontWeight: 700, textDecoration: "none", border: `1px solid ${faint}`, borderRadius: 8 }}>
 Download App
 </Link>
 <Link href="/ai-assistant" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 18px", background: COBALT, color: "#FFF", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", borderRadius: 8 }}>
 Launch Studio <span style={{ fontSize: 10, opacity: 0.8 }}>↗</span>
 </Link>
 </div>
 </header>
 );
}

export function CoreforgeFooter({ isDark, fg, muted, faint }: Pick<ReturnType<typeof useCoreforgeTheme>, "isDark" | "fg" | "muted" | "faint">) {
 const cols = [
 { heading: "Platform", links: [
 { l: "Overview", h: "/platform/overview", ext: false },
 { l: "CAD Studios", h: "/platform/bridges", ext: false },
 { l: "AI Code Assistant", h: "/platform/agent-sdk", ext: false },
 { l: "API Reference", h: "/platform/api", ext: true },
 { l: "Changelog", h: "/platform/changelog", ext: false },
 { l: "Status", h: "/platform/status", ext: false },
 ]},
 { heading: "Engineering", links: [
 { l: "Launch Studio", h: "/ai-assistant", ext: true },
 { l: "Download Desktop App", h: "/download", ext: false },
 { l: "3D Machinery", h: "/workspace/files", ext: false },
 { l: "Automotive", h: "/workspace/code", ext: false },
 { l: "CNC / CAM", h: "/workspace/knowledge", ext: false },
 { l: "Aerospace", h: "/workspace/voice", ext: false },
 { l: "CAD Assets", h: "/workspace/mail", ext: false },
 ]},
 { heading: "Company", links: [
 { l: "About", h: "/about", ext: false },
 { l: "Manifesto", h: "/manifesto", ext: false },
 { l: "Careers", h: "/careers", ext: true },
 { l: "Press Kit", h: "/press", ext: false },
 { l: "Contact", h: "/contact", ext: false },
 ]},
 { heading: "Legal", links: [
 { l: "Privacy Policy", h: "/privacy", ext: false },
 { l: "Terms of Use", h: "/terms", ext: false },
 { l: "Cookie Notice", h: "/cookie-notice", ext: false },
 { l: "Security", h: "/security", ext: false },
 { l: "Pricing", h: "/pricing", ext: false },
 ]},
 ];
 const socials = [
 { l: "X", d: "M18.244 2H21l-6.54 7.47L22 22h-6.828l-5.34-6.99L3.6 22H0.84l7-8L0 2h6.914l4.82 6.38L18.244 2z" },
 { l: "GitHub", d: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03a9.57 9.57 0 015 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.68.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z" },
 { l: "LinkedIn", d: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.07 2.07 0 113.27 5.36a2.07 2.07 0 012.07 2.07zM7.12 20.45H3.56V9h3.56v11.45z" },
 { l: "YouTube", d: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.57V8.43L15.82 12l-6.07 3.57z" },
 { l: "Discord", d: "M20.32 4.37A19.79 19.79 0 0016.55 3c-.16.29-.35.68-.48.99a18.27 18.27 0 00-5.14 0C10.8 3.68 10.6 3.29 10.44 3a19.74 19.74 0 00-3.77 1.37C3.24 9.27 2.45 14.06 2.84 18.77a19.9 19.9 0 005.93 3.01c.48-.65.91-1.34 1.28-2.07-.71-.27-1.4-.6-2.05-1 .17-.13.34-.26.5-.4 3.92 1.82 8.17 1.82 12.04 0 .17.14.33.27.5.4-.65.4-1.34.73-2.05 1 .37.73.8 1.42 1.28 2.07a19.9 19.9 0 005.93-3.01c.46-5.47-.78-10.23-3.88-14.4zM8.52 16c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.95 2.44-2.15 2.44zm6.96 0c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.94 2.44-2.15 2.44z" },
 { l: "RSS", d: "M6.18 15.64a2.18 2.18 0 012.18 2.18 2.18 2.18 0 01-2.18 2.18A2.18 2.18 0 014 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" },
 ];

 return (
 <footer style={{ paddingTop: 96, paddingBottom: 40, background: isDark ? DARK_BG : PAPER, borderTop: `3px solid ${COBALT}` }}>
 <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12" style={{ paddingBottom: 80 }}>
 {cols.map((col) => (
 <div key={col.heading}>
 <div style={{ fontSize: 11, color: muted, fontWeight: 500, marginBottom: 22, letterSpacing: "-0.005em" }}>{col.heading}</div>
 <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
 {col.links.map((item) => (
 <li key={item.l}>
 <Link href={item.h} style={{ fontSize: 14.5, color: fg, fontWeight: 500, textDecoration: "none", letterSpacing: "-0.005em", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.15s" }} className="hover:!text-[#4284FF]">
 {item.l}
 {item.ext && <span style={{ fontSize: 11, opacity: 0.7 }}>↗</span>}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 <div style={{ borderTop: `1px solid ${faint}`, paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
 {socials.map((s) => (
 <Link key={s.l} href="#" aria-label={s.l} style={{ color: muted, display: "flex", transition: "color 0.15s" }} className="hover:!text-[#4284FF]">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.d}/></svg>
 </Link>
 ))}
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <CoreforgeLogo size={18} radius={5} />
 <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "-0.01em", color: fg, fontStretch: "90%" }}>Crystal Studio</span>
 </div>
 <span style={{ fontSize: 11.5, color: muted }}>Copyright &copy;2026</span>
 <Link href="/cookie-notice" style={{ fontSize: 11.5, color: muted, textDecoration: "none", borderBottom: `1px dashed ${faint}`, paddingBottom: 1 }}>Manage Cookies</Link>
 </div>
 <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", border: `1px solid ${faint}`, background: "transparent", color: fg, fontSize: 12.5, fontWeight: 500, cursor: "pointer", borderRadius: 999 }} className="hover:!border-[#4284FF]">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>
 </svg>
 English <span style={{ color: muted }}>Albania</span>
 </button>
 </div>
 </div>
 </footer>
 );
}

export type CoreforgeTheme = ReturnType<typeof useCoreforgeTheme>;

export function CoreforgePage({ children }: { children: ReactNode | ((t: CoreforgeTheme) => ReactNode) }) {
 const theme = useCoreforgeTheme();
 return (
 <div style={{ minHeight: "100vh", background: theme.bg, color: theme.fg, fontFamily: "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", transition: "background 0.3s,color 0.3s", overflowX: "hidden" }}>
 <CoreforgeNav {...theme} />
 {typeof children === "function" ? children(theme) : children}
 <CoreforgeFooter {...theme} />
 </div>
 );
}
