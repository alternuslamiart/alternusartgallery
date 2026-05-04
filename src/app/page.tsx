"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  AlternusLogo,
  DARK_BG,
  DARK_BORDER,
  DARK_BORDER_SOFT,
  DARK_MUTED,
  DARK_SURFACE,
  DARK_SURFACE_SOFT,
  DARK_TEXT,
  useAlternusMode,
} from "@/components/alternus-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COBALT = "#4284FF";
const COBALT_DEEP = "#1E5ED4";
const INK = "#1F1F1F";
const PAPER = "#F4F6FB";
const marquee = [
  "AutoCAD bridge",
  "Blender bridge",
  "Website design agent",
  "Code agent",
  "Blender 3D scenes",
  "AutoCAD components",
  "Responsive website sections",
  "Design systems",
  "3D product visuals",
  "Production-ready layouts",
];

const capabilities = [
  {
    n: "01",
    t: "AutoCAD",
    d: "Turn a product idea into clean website screens, components, tokens, and responsive layout notes directly for AutoCAD.",
    k: "autocad.site(prompt)",
    output: "Frames, tokens, components",
  },
  {
    n: "02",
    t: "Code",
    d: "Convert AutoCAD structure into production-ready website sections with clean React, Tailwind, spacing, and responsive states.",
    k: "code.website(autocad)",
    output: "Pages, sections, UI code",
  },
  {
    n: "03",
    t: "Blender",
    d: "Drive Blender from a prompt. Build 3D scenes, product visuals, materials, lighting, and render queues through a Python bridge.",
    k: "blender.scene(spec)",
    output: "Scenes, nodes, renders",
  },
  {
    n: "04",
    t: "Design",
    d: "Keep AutoCAD and code aligned. The agent manages colors, typography, spacing, cards, nav, and clean website systems.",
    k: "autocad.system(site)",
    output: "Styles, grids, variants",
  },
  {
    n: "05",
    t: "3D Assets",
    d: "Create Blender 3D assets for website heroes, product previews, studio scenes, and polished visual sections.",
    k: "blender.asset(site)",
    output: "Models, materials, renders",
  },
  {
    n: "06",
    t: "Prototype",
    d: "Plan website flows in AutoCAD, then send the same structure to the code agent so the live page matches the design.",
    k: "autocad.flow(code)",
    output: "Flows, pages, states",
  },
];

const pillars = [
  {
    k: "Fast",
    v: "Sub-200ms agent turnaround. You iterate on AutoCAD frames, website code, and Blender scenes without waiting.",
  },
  {
    k: "Pro-grade",
    v: "Speaks AutoCAD components, responsive website structure, and .blend scene workflows - not just static mockups.",
  },
  {
    k: "In-tool",
    v: "Lives around AutoCAD and Blender so design, code, and 3D production stay in one workflow.",
  },
  {
    k: "Yours",
    v: "Your footage, renders, and boards never train a shared model. Encrypted at rest.",
  },
];

const quotes = [
  {
    by: "Marcus Johnson",
    role: "Website Designer, Remote",
    q: "I described the website section once and Alternus returned a AutoCAD frame plus the coded layout. The design and build finally stayed together.",
  },
  {
    by: "Priya Sharma",
    role: "Product Designer, London",
    q: "I asked for a cleaner landing page system and got AutoCAD components, spacing, and responsive code direction in one pass.",
  },
  {
    by: "David Chen",
    role: "3D Web Artist, LA",
    q: "The Blender bridge built the hero scene, materials, and render queue from the same website brief I used for the AutoCAD design.",
  },
];

const faq = [
  {
    q: "What exactly is Alternus?",
    a: "A creative AI workspace for website design, coding, AutoCAD systems, and Blender 3D. It helps you direct design and production from one agent.",
  },
  {
    q: "How does the AutoCAD workflow work?",
    a: "Alternus plans website screens, components, tokens, and responsive states for AutoCAD, then keeps the same structure ready for the code agent.",
  },
  {
    q: "How does the Blender integration work?",
    a: "A signed Python add-on registers an alternus.* operator. The agent generates scenes, geometry-node graphs, materials, lighting, and render queues; Blender executes them headlessly or in-session.",
  },
  {
    q: "Can it code the website from the design?",
    a: "Yes. The agent turns AutoCAD structure into clean website sections with responsive layout, reusable components, and production-ready styling.",
  },
  {
    q: "Where are my files stored?",
    a: "In your private knowledge layer, encrypted at rest. The agent references your AutoCAD, code, and Blender files but never trains shared models on them.",
  },
];

const quickPrompts = [
  "Design a clean SaaS homepage in AutoCAD",
  "Code this AutoCAD section as a responsive website",
  "Create a Blender 3D hero scene for this website",
  "Build a Blender product visual with soft lighting",
];

const navItems = [
  { l: "Capabilities", h: "#caps" },
  { l: "Manifesto", h: "#manifesto" },
  { l: "Voices", h: "#voices" },
  { l: "FAQ", h: "#faq" },
];

const bridgeApps = [
  "AutoCAD",
  "Blender",
];

const heroStats = [
  { value: "200ms", label: "Latency" },
  { value: "99.9%", label: "Uptime" },
  { value: "10k+", label: "Users" },
];

const workspaceFiles = [
  { name: "Projects", badge: null },
  { name: "Invoices", badge: "2" },
  { name: "Design", badge: null },
  { name: "Contracts", badge: null },
];

const workspaceLead =
  "Found 2 invoices from March. Total: $4,820. Export a summary?";

const workspaceDocs = ["Invoice_Mar.pdf", "Receipt_02.pdf", "Contract.pdf"];

const footerColumns = [
  {
    heading: "Platform",
    links: [
      { l: "Overview", h: "/platform/overview", ext: false },
      { l: "Bridges", h: "/platform/bridges", ext: false },
      { l: "Agent SDK", h: "/platform/agent-sdk", ext: false },
      { l: "API Reference", h: "/platform/api", ext: true },
      { l: "Changelog", h: "/platform/changelog", ext: false },
      { l: "Status", h: "/platform/status", ext: false },
    ],
  },
  {
    heading: "Creative",
    links: [
      { l: "Launch Studio", h: "/main", ext: true },
      { l: "Website design", h: "/workspace/mail", ext: false },
      { l: "Media library", h: "/workspace/files", ext: false },
      { l: "AutoCAD + code", h: "/workspace/code", ext: false },
      { l: "Blender 3D", h: "/workspace/knowledge", ext: false },
      { l: "Design notes", h: "/workspace/voice", ext: false },
    ],
  },
  {
    heading: "Company",
    links: [
      { l: "About", h: "/about", ext: false },
      { l: "Manifesto", h: "/manifesto", ext: false },
      { l: "Careers", h: "/careers", ext: true },
      { l: "Press Kit", h: "/press", ext: false },
      { l: "Contact", h: "/contact", ext: false },
    ],
  },
  {
    heading: "Legal",
    links: [
      { l: "Privacy Policy", h: "/privacy", ext: false },
      { l: "Terms of Use", h: "/terms", ext: false },
      { l: "Cookie Notice", h: "/cookie-notice", ext: false },
      { l: "Security", h: "/security", ext: false },
      { l: "Pricing", h: "/pricing", ext: false },
    ],
  },
];

const socials = [
  {
    l: "X",
    d: "M18.244 2H21l-6.54 7.47L22 22h-6.828l-5.34-6.99L3.6 22H0.84l7-8L0 2h6.914l4.82 6.38L18.244 2z",
  },
  {
    l: "GitHub",
    d: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03a9.57 9.57 0 015 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.68.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z",
  },
  {
    l: "LinkedIn",
    d: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43A2.07 2.07 0 113.27 5.36a2.07 2.07 0 012.07 2.07zM7.12 20.45H3.56V9h3.56v11.45z",
  },
  {
    l: "YouTube",
    d: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.57V8.43L15.82 12l-6.07 3.57z",
  },
];

type ThemeVars = CSSProperties & {
  "--landing-bg": string;
  "--landing-fg": string;
  "--landing-muted": string;
  "--landing-muted-strong": string;
  "--landing-line": string;
  "--landing-line-strong": string;
  "--landing-surface": string;
  "--landing-surface-soft": string;
  "--landing-accent": string;
  "--landing-accent-strong": string;
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function SectionHeading({
  label,
  title,
  copy,
  action,
}: {
  label: string;
  title: React.ReactNode;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.8fr)] lg:items-end">
      <div className="landing-section-label">{label}</div>
      <div>
        <h2 className="landing-heading-lg">{title}</h2>
      </div>
      <div className="space-y-4">
        {copy ? <p className="landing-copy">{copy}</p> : null}
        {action}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useAlternusMode();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCap, setActiveCap] = useState(0);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user || null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setActiveCap((value) => (value + 1) % capabilities.length),
      3400,
    );
    return () => window.clearInterval(id);
  }, []);

  const goToChat = (value?: string) => {
    const text = (value ?? prompt).trim();
    router.push(text ? `/main?prompt=${encodeURIComponent(text)}` : "/main");
  };

  const themeStyle: ThemeVars = {
    fontFamily: "var(--font-roboto), 'Roboto', ui-sans-serif, system-ui, sans-serif",
    "--landing-bg": isDark ? DARK_BG : PAPER,
    "--landing-fg": isDark ? DARK_TEXT : INK,
    "--landing-muted": isDark ? DARK_MUTED : "rgba(15,23,42,0.66)",
    "--landing-muted-strong": isDark
      ? "rgba(255,255,255,0.82)"
      : "rgba(15,23,42,0.88)",
    "--landing-line": isDark ? DARK_BORDER_SOFT : "rgba(15,23,42,0.10)",
    "--landing-line-strong": isDark
      ? DARK_BORDER
      : "rgba(15,23,42,0.14)",
    "--landing-surface": isDark ? DARK_SURFACE : "rgba(255,255,255,0.84)",
    "--landing-surface-soft": isDark
      ? DARK_SURFACE_SOFT
      : "rgba(247,250,255,0.72)",
    "--landing-accent": COBALT,
    "--landing-accent-strong": COBALT_DEEP,
  };

  return (
    <div className="landing-page" data-theme={isDark ? "dark" : "light"} style={themeStyle}>
      <style>{`
        @keyframes alternus-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes alternus-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.9); }
        }
        @keyframes alternus-grid-shift {
          from { background-position: 0 0; }
          to { background-position: 72px 72px; }
        }
        @keyframes alternus-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes alternus-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes alternus-float-soft {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
        .alternus-marquee-track {
          animation: alternus-marquee 34s linear infinite;
        }
        .alternus-grid-motion {
          animation: alternus-grid-shift 34s linear infinite;
        }
        .alternus-pulse-dot {
          animation: alternus-pulse 2.2s ease-in-out infinite;
        }
        .alternus-rise {
          animation: alternus-rise 0.48s ease-out both;
        }
        .alternus-caret::after {
          content: "|";
          margin-left: 2px;
          color: ${COBALT};
          animation: alternus-caret 1.1s step-end infinite;
        }
        .alternus-float-soft {
          animation: alternus-float-soft 6s ease-in-out infinite;
        }
        .landing-page[data-theme="dark"] {
          background: #141416 !important;
        }
        .landing-page[data-theme="dark"] *,
        .landing-page[data-theme="dark"] *::before,
        .landing-page[data-theme="dark"] *::after {
          background-image: none !important;
          box-shadow: none !important;
        }
        .landing-page[data-theme="dark"] .landing-card,
        .landing-page[data-theme="dark"] .landing-card-quiet,
        .landing-page[data-theme="dark"] .landing-dark-frame {
          background: #1F1F23 !important;
          border-color: rgba(255,255,255,0.16) !important;
          box-shadow: none !important;
        }
        .landing-page[data-theme="dark"] .landing-card:hover,
        .landing-page[data-theme="dark"] .landing-card-quiet:hover,
        .landing-page[data-theme="dark"] .landing-dark-frame:hover {
          background: #232327 !important;
          border-color: rgba(66,132,255,0.62) !important;
        }
        .landing-page[data-theme="dark"] .landing-chip,
        .landing-page[data-theme="dark"] .landing-social-button,
        .landing-page[data-theme="dark"] .landing-language-button {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: rgba(255,255,255,0.72) !important;
        }
        .landing-page[data-theme="dark"] .landing-chip:hover,
        .landing-page[data-theme="dark"] .landing-social-button:hover,
        .landing-page[data-theme="dark"] .landing-language-button:hover {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(66,132,255,0.62) !important;
          color: #F5F5F7 !important;
        }
        .landing-page[data-theme="dark"] .landing-grid,
        .landing-page[data-theme="dark"] .landing-hero-effects,
        .landing-page[data-theme="dark"] .landing-dark-orb {
          display: none !important;
        }
        .landing-page[data-theme="dark"] .landing-section-soft,
        .landing-page[data-theme="dark"] .landing-marquee,
        .landing-page[data-theme="dark"] .landing-final-cta {
          background: #141416 !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-shell {
          border-color: rgba(255,255,255,0.12) !important;
          background: #141416 !important;
          box-shadow: none !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-kicker,
        .landing-page[data-theme="dark"] .landing-hero-secondary,
        .landing-page[data-theme="dark"] .landing-hero-stat,
        .landing-page[data-theme="dark"] .landing-hero-bubble,
        .landing-page[data-theme="dark"] .landing-hero-panel,
        .landing-page[data-theme="dark"] .landing-hero-form,
        .landing-page[data-theme="dark"] .landing-hero-quick,
        .landing-page[data-theme="dark"] .landing-hero-pill {
          border-color: rgba(255,255,255,0.12) !important;
          background: rgba(255,255,255,0.04) !important;
          color: rgba(255,255,255,0.72) !important;
          box-shadow: none !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-kicker:hover,
        .landing-page[data-theme="dark"] .landing-hero-secondary:hover,
        .landing-page[data-theme="dark"] .landing-hero-stat:hover,
        .landing-page[data-theme="dark"] .landing-hero-bubble:hover,
        .landing-page[data-theme="dark"] .landing-hero-panel:hover,
        .landing-page[data-theme="dark"] .landing-hero-form:hover,
        .landing-page[data-theme="dark"] .landing-hero-quick:hover,
        .landing-page[data-theme="dark"] .landing-hero-pill:hover {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(66,132,255,0.62) !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-title,
        .landing-page[data-theme="dark"] .landing-hero-stat strong,
        .landing-page[data-theme="dark"] .landing-hero-input {
          color: ${DARK_TEXT} !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-copy,
        .landing-page[data-theme="dark"] .landing-hero-bubble-copy {
          color: ${DARK_MUTED} !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-preview {
          border-color: rgba(255,255,255,0.16) !important;
          background: #1F1F23 !important;
          box-shadow: none !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-preview:hover {
          border-color: rgba(66,132,255,0.62) !important;
        }
        .landing-page[data-theme="dark"] .landing-hero-input::placeholder {
          color: rgba(255,255,255,0.38) !important;
        }
        .landing-page[data-theme="dark"] [class*="bg-blue-50"],
        .landing-page[data-theme="dark"] [class*="bg-blue-500/"],
        .landing-page[data-theme="dark"] [class*="bg-white/"] {
          background: rgba(255,255,255,0.04) !important;
        }
        .landing-page[data-theme="dark"] [class*="border-blue-"] {
          border-color: rgba(255,255,255,0.16) !important;
        }
        .landing-page[data-theme="dark"] .landing-dark-solid {
          background: ${COBALT} !important;
          color: #FFFFFF !important;
          border-color: ${COBALT} !important;
          background-image: none !important;
        }
        .landing-page[data-theme="dark"] .landing-dark-solid:hover {
          background: ${COBALT_DEEP} !important;
          border-color: ${COBALT_DEEP} !important;
        }
        .landing-page[data-theme="dark"] .landing-final-cta,
        .landing-page[data-theme="dark"] .landing-preview-shell,
        .landing-page[data-theme="dark"] .landing-preview-rail,
        .landing-page[data-theme="dark"] .landing-preview-pane,
        .landing-page[data-theme="dark"] .landing-preview-card,
        .landing-page[data-theme="dark"] .landing-preview-input {
          background: #1F1F23 !important;
          border-color: rgba(255,255,255,0.16) !important;
          color: #F5F5F7 !important;
        }
        .landing-page[data-theme="dark"] .landing-final-cta:hover,
        .landing-page[data-theme="dark"] .landing-preview-shell:hover,
        .landing-page[data-theme="dark"] .landing-preview-card:hover,
        .landing-page[data-theme="dark"] .landing-preview-input:hover {
          border-color: rgba(66,132,255,0.62) !important;
        }
        .landing-page[data-theme="dark"] .landing-final-label {
          color: rgba(245,245,247,0.72) !important;
        }
      `}</style>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "border-b border-[var(--landing-line)] backdrop-blur-xl"
            : "bg-transparent",
        )}
        style={{
          background: scrolled
            ? isDark
              ? "rgba(18,18,20,0.84)"
              : "rgba(244,246,251,0.82)"
            : "transparent",
        }}
      >
        <div className="landing-container">
          <div className="flex min-h-[76px] items-center gap-3 py-3 sm:gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
              <AlternusLogo size={30} radius={9} />
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className="truncate text-sm font-black tracking-[-0.03em] text-[var(--landing-fg)] sm:text-[15px]">
                  ALTERNUS
                </span>
                <span className="landing-chip hidden sm:inline-flex">Beta</span>
              </div>
            </Link>

            <nav className="ml-4 hidden items-center gap-5 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.l}
                  href={item.h}
                  className="text-sm font-medium tracking-[-0.01em] text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-fg)]"
                >
                  {item.l}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsDark((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-surface)] text-[var(--landing-muted)] transition-all hover:border-[var(--landing-line-strong)] hover:text-[var(--landing-fg)]"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden h-10 items-center gap-2 rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-surface)] px-3 pr-4 text-sm font-semibold tracking-[-0.01em] text-[var(--landing-fg)] transition-all hover:border-[var(--landing-accent)] sm:inline-flex">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--landing-accent)] text-[11px] font-bold text-white">
                        {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                      </span>
                      <span className="max-w-28 truncate">{user?.name || user?.email?.split("@")[0] || "Profile"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-semibold text-foreground">{user?.name || user?.email?.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                        Usage
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex items-center gap-2 cursor-pointer">
                        Billing
                      </Link>
                    </DropdownMenuItem>
                    <div className="border-t mt-1 pt-1">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/help" className="flex items-center gap-2 cursor-pointer">
                          Help
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <div className="border-t mt-1 pt-1">
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer text-red-600">
                        Sign out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="hidden h-10 items-center rounded-2xl border border-[var(--landing-line)] px-4 text-sm font-semibold tracking-[-0.01em] text-[var(--landing-fg)] transition-all hover:border-[var(--landing-accent)] sm:inline-flex"
                >
                  Log in
                </Link>
              )}

              <Link
                href="/main"
                className="landing-dark-solid inline-flex h-10 items-center gap-2 rounded-2xl bg-[var(--landing-accent)] px-4 text-sm font-bold tracking-[-0.01em] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[var(--landing-accent-strong)] hover:shadow-xl hover:shadow-blue-500/25 sm:h-11 sm:px-5"
              >
                Launch Studio
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-3 lg:hidden">
            {navItems.map((item) => (
              <Link key={item.l} href={item.h} className="landing-chip shrink-0">
                {item.l}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="landing-section overflow-hidden pt-10 sm:pt-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="landing-grid alternus-grid-motion absolute inset-x-0 top-0 h-[82%] opacity-90 [mask-image:radial-gradient(ellipse_at_top,black_38%,transparent_84%)]" />
            <div className="landing-dark-orb absolute right-[-12rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(66,132,255,0.24),transparent_68%)] blur-3xl" />
            <div className="landing-dark-orb absolute left-[-8rem] top-[10rem] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(125,169,255,0.18),transparent_68%)] blur-3xl" />
          </div>

          <div className="landing-container relative">
            <div className="landing-hero-shell relative overflow-hidden rounded-[2.6rem] border border-white/55 bg-[linear-gradient(135deg,rgba(238,246,255,0.98)_0%,rgba(219,235,255,0.96)_46%,rgba(198,222,255,0.94)_100%)] px-6 py-8 shadow-[0_40px_110px_rgba(66,132,255,0.24)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
              <div className="landing-hero-effects pointer-events-none absolute inset-0">
                <div className="absolute left-[-8%] top-[6%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.78),transparent_66%)] blur-3xl" />
                <div className="absolute right-[-6%] top-[8%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(66,132,255,0.36),transparent_70%)] blur-3xl" />
                <div className="absolute bottom-[-8%] left-[42%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(46,105,226,0.25),transparent_72%)] blur-3xl" />
                <div className="alternus-float-soft absolute right-[8%] top-[18%] h-16 w-16 rounded-[1.4rem] border border-white/60 bg-[linear-gradient(180deg,rgba(66,132,255,0.58),rgba(255,255,255,0.18))] shadow-[0_18px_44px_rgba(66,132,255,0.24)]" />
                <div className="alternus-float-soft absolute bottom-[18%] right-[20%] h-10 w-10 rounded-[1rem] border border-white/60 bg-[linear-gradient(180deg,rgba(30,94,212,0.5),rgba(255,255,255,0.16))] shadow-[0_16px_34px_rgba(66,132,255,0.18)] [animation-delay:1.1s]" />
              </div>

              <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
                <div className="max-w-[34rem]">
                  <div className="landing-hero-kicker mb-5 inline-flex rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--landing-accent)] shadow-sm">
                    Supercharge your AI workflows
                  </div>

                  <h1
                    className="landing-hero-title max-w-[10ch] text-[clamp(3rem,6vw,5.1rem)] font-black leading-[0.92] tracking-[-0.06em] text-[#1F2B4D]"
                    style={{ fontFamily: "var(--font-roboto-flex), var(--font-roboto), ui-sans-serif, system-ui, sans-serif" }}
                  >
                    The AI-powered creative workspace.
                  </h1>

                  <p className="landing-hero-copy mt-5 max-w-[31rem] text-[1rem] leading-8 text-[rgba(31,43,77,0.7)] sm:text-[1.04rem]">
                    Website design, AutoCAD systems, coded sections, and Blender 3D work from one command layer.
                    Alternus keeps the craft tools in place and moves repetitive design production to the agent.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="landing-dark-solid h-12 rounded-2xl bg-[var(--landing-accent)] px-6 text-[15px] font-bold tracking-[-0.02em] text-white shadow-[0_18px_40px_rgba(66,132,255,0.24)] hover:bg-[var(--landing-accent-strong)]"
                    >
                      <Link href="/main">
                        Get started
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="landing-hero-secondary h-12 rounded-2xl border-white/70 bg-white/58 px-6 text-[15px] font-semibold tracking-[-0.02em] text-[#1F2B4D] shadow-sm hover:bg-white/80"
                    >
                      <Link href="#caps">Book a demo</Link>
                    </Button>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {heroStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="landing-hero-stat rounded-full border border-white/60 bg-white/52 px-3.5 py-2 text-[12px] font-semibold tracking-[-0.01em] text-[#476089] shadow-sm"
                      >
                        <span className="font-black text-[#1F2B4D]">{stat.value}</span> {stat.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[36rem] lg:mx-0">
                  <div className="landing-hero-bubble absolute left-[14%] top-[29%] z-20 max-w-[18rem] rounded-[1.2rem] border border-white/65 bg-white/92 px-4 py-3 shadow-[0_24px_44px_rgba(42,103,255,0.14)] backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--landing-accent)]">
                      {capabilities[activeCap].t}
                    </div>
                    <div className="landing-hero-bubble-copy text-[13px] leading-6 text-[#476089]">
                      {capabilities[activeCap].d}
                    </div>
                  </div>

                  <div className="landing-hero-preview relative rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(235,244,255,0.68),rgba(207,226,255,0.42))] p-4 pt-36 shadow-[0_30px_76px_rgba(66,132,255,0.2)] backdrop-blur-xl sm:p-5 sm:pt-40">
                    <div className="landing-hero-panel rounded-[1.4rem] border border-white/65 bg-white/90 p-4 shadow-[0_20px_48px_rgba(42,103,255,0.13)]">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[rgba(31,43,77,0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1F2B4D]">
                          GPT 4.5
                        </span>
                        <span className="rounded-full bg-[rgba(66,132,255,0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--landing-accent)]">
                          Search
                        </span>
                      </div>

                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          goToChat();
                        }}
                        className="space-y-4"
                      >
                        <div className="landing-hero-form rounded-[1.2rem] border border-[rgba(31,43,77,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,248,255,0.94))] px-4 py-4">
                          <input
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Ask anything..."
                            className="landing-hero-input w-full border-0 bg-transparent text-[15px] text-[#1F2B4D] outline-none placeholder:text-[rgba(71,96,137,0.54)]"
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {quickPrompts.slice(0, 2).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => goToChat(item)}
                              className="landing-hero-quick rounded-[1rem] border border-[rgba(31,43,77,0.08)] bg-[rgba(255,255,255,0.82)] px-3 py-3 text-left text-[12.5px] leading-5 text-[#476089] transition-colors hover:bg-white"
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {bridgeApps.slice(0, 3).map((app) => (
                              <span
                                key={app}
                                className="landing-hero-pill rounded-full border border-[rgba(31,43,77,0.08)] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#476089]"
                              >
                                {app}
                              </span>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="landing-dark-solid flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4284FF_0%,#6EA4FF_100%)] text-white shadow-[0_12px_24px_rgba(66,132,255,0.28)]"
                            aria-label="Run prompt"
                          >
                            <ArrowIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-marquee overflow-hidden border-b border-[var(--landing-line)] bg-[var(--landing-accent)] py-5">
          <div className="alternus-marquee-track flex w-max items-center gap-12 whitespace-nowrap">
            {[...marquee, ...marquee, ...marquee].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-12 text-[19px] font-black tracking-[-0.03em] text-white sm:text-[22px]"
              >
                {item}
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            ))}
          </div>
        </section>

        <section id="caps" className="landing-section">
          <div className="landing-container">
            <SectionHeading
              label="Section 01 / Capabilities"
              title={
                <>
                  Six crafts. <br />
                  <span className="text-[var(--landing-muted)]">One agent.</span>
                </>
              }
              copy="From the first storyboard to the final master, every discipline shares the same brief, the same media, and the same memory."
            />

            <div className="landing-card overflow-hidden">
              <div className="hidden grid-cols-[96px_minmax(0,0.75fr)_minmax(0,1fr)_170px] gap-6 border-b border-[var(--landing-line)] bg-[var(--landing-surface-soft)] px-7 py-4 lg:grid">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                  No.
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                  Craft
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                  What the agent does
                </span>
                <span className="text-right text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                  Output
                </span>
              </div>

              <div className="divide-y divide-[var(--landing-line)]">
                {capabilities.map((item) => (
                  <div
                    key={item.n}
                    className="grid gap-4 px-5 py-6 transition-colors hover:bg-blue-50/40 sm:px-6 lg:grid-cols-[96px_minmax(0,0.75fr)_minmax(0,1fr)_170px] lg:gap-6 lg:px-7 lg:py-7"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-[var(--landing-accent)]">
                        {item.n}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="landing-heading-md text-[var(--landing-fg)]">{item.t}</h3>
                      <code className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 font-mono text-xs text-[var(--landing-accent)]">
                        {item.k}
                      </code>
                    </div>

                    <p className="landing-copy">{item.d}</p>

                    <div className="flex items-start lg:justify-end">
                      <span className="rounded-full border border-[var(--landing-line)] bg-white/80 px-3 py-1.5 text-sm font-semibold text-[var(--landing-muted-strong)]">
                        {item.output}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="manifesto" className="landing-section landing-section-soft overflow-hidden">
          <div className="pointer-events-none absolute left-[-10rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(66,132,255,0.18),transparent_70%)] blur-3xl" />
          <div className="landing-container relative">
            <SectionHeading
              label="Section 02 / Manifesto"
              title={
                <>
                  An AI that <span className="landing-emphasis">speaks your craft</span>{" "}
                  - not just your calendar.
                </>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {pillars.map((pillar, index) => (
                <div key={pillar.k} className="landing-card p-6 sm:p-7">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                    / 0{index + 1}
                  </div>
                  <div className="mt-5 text-[2.2rem] font-black tracking-[-0.06em] text-[var(--landing-accent)]">
                    {pillar.k}.
                  </div>
                  <p className="landing-copy mt-4">{pillar.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="voices" className="landing-section">
          <div className="landing-container">
            <SectionHeading
              label="Section 03 / Voices"
              title={
                <>
                  People shipping with <span className="landing-emphasis">Alternus</span>
                </>
              }
              copy="The system has to feel credible in AutoCAD, code, and Blender 3D, not just attractive in screenshots. These quotes are framed as product proof, not decoration."
            />

            <div className="grid gap-5 xl:grid-cols-3">
              {quotes.map((quote) => (
                <figure key={quote.by} className="landing-card flex h-full flex-col gap-8 p-6 sm:p-8">
                  <div className="text-5xl font-black leading-none text-[var(--landing-accent)]">
                    &ldquo;
                  </div>
                  <blockquote className="flex-1 text-[1.15rem] font-medium leading-[1.5] tracking-[-0.02em] text-[var(--landing-fg)]">
                    {quote.q}
                  </blockquote>
                  <figcaption className="flex items-center gap-4 border-t border-[var(--landing-line)] pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--landing-accent)] text-sm font-black text-white">
                      {quote.by
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--landing-fg)]">{quote.by}</div>
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--landing-muted)]">
                        {quote.role}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-container">
            <SectionHeading
              label="Section 04 / Preview"
              title={<>The workspace.</>}
              copy="The landing page should feel close to the product. This preview keeps the editorial voice, but the UI is organized enough to read as real software."
              action={
                <Link href="/main" className="landing-link">
                  Open it live
                  <ArrowIcon className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <div className="landing-card overflow-hidden p-3 sm:p-4">
              <div className="landing-preview-shell overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#161a24] shadow-[0_24px_60px_rgba(8,15,32,0.38)]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <div className="ml-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/60">
                    alternus.art/main
                  </div>
                  <div className="ml-auto hidden font-mono text-[11px] text-white/40 sm:block">
                    agent:idle · opus-4.6
                  </div>
                </div>

                <div className="grid gap-0 lg:grid-cols-[78px_240px_minmax(0,1fr)]">
                  <div className="landing-preview-rail flex border-b border-white/10 px-3 py-3 lg:min-h-[560px] lg:flex-col lg:items-center lg:gap-3 lg:border-b-0 lg:border-r lg:px-0 lg:py-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--landing-accent)] text-sm font-black text-white">
                      A
                    </div>
                    <div className="hidden h-8 w-px bg-white/10 lg:block" />
                    {[
                      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
                      "M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z",
                      "M16 18l6-6-6-6M8 6l-6 6 6 6",
                      "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z",
                    ].map((path, index) => (
                      <div
                        key={path}
                        className={cn(
                          "ml-2 flex h-10 w-10 items-center justify-center rounded-2xl lg:ml-0",
                          index === 1
                            ? "bg-blue-500/18 text-[var(--landing-accent)]"
                            : "text-white/40",
                        )}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={path} />
                        </svg>
                      </div>
                    ))}
                  </div>

                  <div className="landing-preview-pane border-b border-white/10 p-4 lg:min-h-[560px] lg:border-b-0 lg:border-r lg:p-4">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Files
                    </div>
                    <div className="space-y-2">
                      {workspaceFiles.map((item, index) => (
                        <div
                          key={item.name}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm",
                            index === 1
                              ? "bg-blue-500/18 text-white"
                              : "text-white/70 hover:bg-white/5",
                          )}
                        >
                          <span className="text-white/35">▸</span>
                          <span>{item.name}</span>
                          {item.badge ? (
                            <span className="ml-auto rounded-full bg-[var(--landing-accent)] px-2 py-0.5 text-[11px] font-bold text-white">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-h-[360px] flex-col gap-5 p-5 sm:p-6 lg:min-h-[560px]">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Agent
                      </div>
                      <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                        # invoices
                      </div>
                    </div>

                    <div className="landing-preview-card rounded-[1.2rem] border border-blue-400/20 bg-blue-500/10 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--landing-accent)] text-[11px] font-black text-white">
                          AI
                        </div>
                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--landing-accent)]">
                          Alternus
                        </div>
                        <div className="ml-auto font-mono text-[11px] text-white/35">10:42</div>
                      </div>
                      <p className="text-sm leading-7 text-white/82">{workspaceLead}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {workspaceDocs.map((doc, index) => (
                        <div
                          key={doc}
                          className="landing-preview-card rounded-[1.15rem] border border-white/10 bg-white/5 p-3"
                        >
                          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/12 text-[10px] font-black text-[var(--landing-accent)]">
                            PDF
                          </div>
                          <div className="text-sm font-semibold text-white">{doc}</div>
                          <div className="mt-1 text-[11px] text-white/35">
                            {[128, 84, 32][index]} KB
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="landing-preview-input mt-auto flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span className="font-mono text-sm font-bold text-[var(--landing-accent)]">$</span>
                      <span className="flex-1 font-mono text-sm text-white/45">
                        ask agent about these files...
                      </span>
                      <ArrowIcon className="h-3.5 w-3.5 text-[var(--landing-accent)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section">
          <div className="landing-container max-w-[1020px]">
            <div className="mb-10">
              <div className="landing-section-label">Section 05 / Questions</div>
              <h2 className="landing-heading-lg mt-5">Frequently asked.</h2>
            </div>

            <div className="space-y-3">
              {faq.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div key={item.q} className="landing-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
                    >
                      <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                        <span className="rounded-xl bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-[var(--landing-accent)]">
                          0{index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-lg font-bold tracking-[-0.025em] text-[var(--landing-fg)] sm:text-[1.15rem]">
                            {item.q}
                          </div>
                          {open ? (
                            <p className="landing-copy mt-4 max-w-[48rem]">{item.a}</p>
                          ) : null}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--landing-line)] text-lg text-[var(--landing-accent)] transition-transform",
                          open && "rotate-45",
                        )}
                      >
                        +
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section border-b-0 bg-transparent">
          <div className="landing-container">
            <div className="landing-final-cta mx-auto max-w-[980px] rounded-[2.6rem] border border-[var(--landing-line)] bg-[linear-gradient(180deg,#4B87FF_0%,#2E69E2_100%)] px-6 py-14 text-center shadow-[0_34px_90px_rgba(42,103,255,0.16)] sm:px-12 sm:py-20">
              <div className="mx-auto max-w-[760px]">
                <div className="landing-final-label mb-7 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-950/72">
                  Section 06 / Begin
                </div>
                <h2 className="landing-heading-lg text-white sm:text-[clamp(3rem,6vw,5.2rem)]">
                  Stop rebuilding. <br />
                  <span className="italic">Start directing.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-[34rem] text-base leading-8 text-white/84 sm:text-[1.02rem]">
                  Alternus is free to try. Plug it into AutoCAD and Blender,
                  then let the agent handle website design, code, and 3D production.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="landing-dark-solid h-12 rounded-2xl bg-white px-6 text-[15px] font-bold tracking-[-0.02em] text-[var(--landing-accent)] shadow-lg shadow-blue-950/20 hover:bg-white/95"
                  >
                    <Link href="/main">
                      Launch Alternus OS
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-2xl border-white/25 bg-transparent px-6 text-[15px] font-semibold tracking-[-0.02em] text-white hover:bg-white/10"
                  >
                    <Link href="/platform/overview">See the platform</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--landing-line)] pb-10 pt-16">
        <div className="landing-container">
          <div className="grid gap-10 border-b border-[var(--landing-line)] pb-12 md:grid-cols-2 xl:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.heading}>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                  {column.heading}
                </div>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.l}>
                      <Link
                        href={link.h}
                        className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em] text-[var(--landing-fg)] transition-colors hover:text-[var(--landing-accent)]"
                      >
                        {link.l}
                        {link.ext ? <ArrowIcon className="h-3.5 w-3.5 opacity-70" /> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 pt-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {socials.map((social) => (
                <Link
                  key={social.l}
                  href="#"
                  aria-label={social.l}
                  className="landing-social-button inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--landing-line)] bg-white/65 text-[var(--landing-muted)] transition-all hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={social.d} />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--landing-muted)]">
              <div className="flex items-center gap-3">
                <AlternusLogo size={20} radius={6} />
                <span className="font-black tracking-[-0.02em] text-[var(--landing-fg)]">
                  ALTERNUS
                </span>
              </div>
              <span>© 2015-2026 · Built with Claude</span>
              <Link href="/cookie-notice" className="landing-link !text-sm">
                Manage cookies
              </Link>
            </div>

            <button className="landing-language-button inline-flex h-10 items-center gap-2 self-start rounded-full border border-[var(--landing-line)] bg-white/70 px-4 text-sm font-medium text-[var(--landing-fg)] transition-all hover:border-[var(--landing-accent)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
              English
              <span className="text-[var(--landing-muted)]">Albania</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
