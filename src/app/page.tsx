"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Box,
  Code2,
  DraftingCompass,
  Gamepad2,
  Globe2,
  ImageIcon,
  Link2,
  Mic,
  Moon,
  Paperclip,
  Play,
  Send,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/platform/overview" },
  { label: "Studio", href: "/main" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/platform/changelog" },
  { label: "Contact", href: "/contact" },
];

const sidebarItems = [
  { label: "AI Assistant", icon: Bot, active: true },
  { label: "Studio Overview", icon: Sparkles },
  { label: "Cerevix Design", icon: ImageIcon },
  { label: "Code Builder", icon: Code2 },
  { label: "Blender 3D", icon: Box },
  { label: "AutoCAD", icon: DraftingCompass },
  { label: "Unity", icon: Gamepad2 },
  { label: "Unreal Engine", icon: Play },
];

const featureCards = [
  {
    title: "AI for Code",
    copy: "Generate, refactor, explain, and connect code workflows.",
    icon: Code2,
  },
  {
    title: "Blender 3D",
    copy: "Create scenes, materials, lighting, and game-ready assets.",
    icon: Box,
  },
  {
    title: "AutoCAD",
    copy: "Assist drafting, cleanup, documentation, and technical workflows.",
    icon: DraftingCompass,
  },
  {
    title: "Game Engines",
    copy: "Prototype Unity and Unreal scenes with AI-assisted workflows.",
    icon: Gamepad2,
  },
];

const telemetryItems = [
  { label: "Active agents", value: "08" },
  { label: "Queued tasks", value: "14" },
  { label: "Studio sync", value: "99%" },
];

const footerColumns = [
  {
    title: "Platform",
    links: ["Overview", "Studio", "Agent SDK", "API Reference", "Changelog", "Status"],
  },
  {
    title: "Creative",
    links: ["Launch Studio", "Edit", "Media Library", "3D & FX", "Voice & Sound"],
  },
  {
    title: "Company",
    links: ["About", "Manifesto", "Careers", "Press Kit", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Use", "Cookie Notice", "Security", "Pricing"],
  },
];

const footerHref: Record<string, string> = {
  Overview: "/platform/overview",
  Studio: "/main",
  "Agent SDK": "/platform/agent-sdk",
  "API Reference": "/platform/api",
  Changelog: "/platform/changelog",
  Status: "/platform/status",
  "Launch Studio": "/main",
  Edit: "/cerevix-design",
  "Media Library": "/asset-library",
  "3D & FX": "/blender-3d",
  "Voice & Sound": "/workspace/voice",
  About: "/about",
  Manifesto: "/manifesto",
  Careers: "/careers",
  "Press Kit": "/press",
  Contact: "/contact",
  "Privacy Policy": "/privacy",
  "Terms of Use": "/terms",
  "Cookie Notice": "/cookie-notice",
  Security: "/security",
  Pricing: "/pricing",
};

const HOME_THEME_KEY = "cerevix_home_theme";

function useHomeTheme() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(window.localStorage.getItem(HOME_THEME_KEY) === "light");
  }, []);

  const toggleTheme = () => {
    setIsLight((current) => {
      const next = !current;
      window.localStorage.setItem(HOME_THEME_KEY, next ? "light" : "dark");
      return next;
    });
  };

  return [isLight, toggleTheme] as const;
}

function CerevixMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#068fff] ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-[4px] rounded-full border-[3px] border-[#071014] border-r-white/0 border-t-white/0" />
      <span className="absolute right-[6px] top-[5px] h-2 w-2 rounded-full bg-[#071014]" />
      <span className="absolute left-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#071014]" />
    </span>
  );
}

function Brand({ compact = false, isLight = false }: { compact?: boolean; isLight?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Cerevix home">
      <CerevixMark className={compact ? "h-5 w-5" : "h-8 w-8"} />
      <span
        className={
          compact
            ? `text-xs font-semibold ${isLight ? "text-[#101114]" : "text-white"}`
            : `text-[1.35rem] font-semibold tracking-[-0.03em] ${isLight ? "text-[#101114]" : "text-white"}`
        }
      >
        Cerevix
      </span>
    </Link>
  );
}

function SiteHeader({ isLight }: { isLight: boolean }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Brand isLight={isLight} />
        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-xs font-medium transition-colors ${
                isLight ? "text-zinc-600 hover:text-[#101114]" : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          asChild
          className="h-10 rounded-full bg-[#068fff] px-5 text-xs font-semibold text-white shadow-none transition-colors hover:bg-[#1b9dff]"
        >
          <Link href="/signup">
            Try Cerevix
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="mx-auto mt-16 w-full max-w-6xl overflow-x-auto px-4 pb-3 sm:px-6 lg:mt-20">
      <div className="relative mx-auto min-w-[940px] overflow-hidden rounded-[14px] border border-white/[0.14] bg-[#101113] text-white">
        <div className="pointer-events-none absolute left-0 top-0 h-12 w-12 border-l border-t border-[#068fff]/70" />
        <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-[#068fff]/70" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 border-b border-l border-[#068fff]/70" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 border-b border-r border-[#068fff]/70" />

        <div className="flex h-11 items-center justify-between border-b border-white/[0.1] px-5">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#068fff]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Studio command layer</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            <span>Live</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Build 26.05</span>
          </div>
        </div>

        <div className="grid min-h-[500px] grid-cols-[210px_1fr]">
          <aside className="flex flex-col border-r border-white/[0.1] bg-[#0b0c0e] p-5">
            <Brand compact />
            <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Dashboard preview navigation">
              {sidebarItems.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex h-9 items-center justify-between rounded-[6px] border px-3 text-[11px] transition-colors ${
                    active ? "border-[#068fff]/45 bg-[#071824] text-white" : "border-transparent text-zinc-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={active ? "h-3.5 w-3.5 text-[#068fff]" : "h-3.5 w-3.5"} />
                    <span>{label}</span>
                  </span>
                  {active ? <span className="h-1.5 w-1.5 rounded-full bg-[#068fff]" /> : null}
                </div>
              ))}
            </nav>
            <div className="mt-8 border-t border-white/[0.1] pt-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                <span>System</span>
                <span>Online</span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-[6px] border border-white/[0.1] px-3 py-2 text-[11px] text-zinc-300">
                <Settings className="h-4 w-4" />
                Settings
              </div>
            </div>
          </aside>

          <section className="relative flex flex-col bg-[#141518]">
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/[0.06]" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/[0.06]" />
              <div className="absolute left-0 top-1/2 h-px w-full bg-white/[0.06]" />
            </div>

            <header className="relative flex h-16 items-center justify-between border-b border-white/[0.08] px-8">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Welcome, Mike</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-600">Workspace ready</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/10 text-zinc-300">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/10 bg-[#1b1c20] text-xs font-semibold text-zinc-100">
                  B
                </span>
              </div>
            </header>

            <div className="relative grid flex-1 grid-cols-[1fr_230px] gap-5 p-6">
              <div className="flex flex-col">
                <div className="grid grid-cols-3 gap-3">
                  {telemetryItems.map((item) => (
                    <div key={item.label} className="rounded-[8px] border border-white/[0.1] bg-[#111215] p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-center rounded-[10px] border border-white/[0.1] bg-[#17181b] p-7">
                  <Badge className="mb-5 w-fit rounded-[6px] border border-[#068fff]/35 bg-[#071824] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8fccff] shadow-none hover:bg-[#071824]">
                    Platform Studio
                  </Badge>
                  <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white">
                    Cerevix AI Assistant
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
                    Build workflows, generate assets, automate tasks, and coordinate AI tools from one Cerevix AI workspace.
                  </p>

                  <div className="mt-8 rounded-[8px] border border-white/[0.1] bg-[#0f1012] p-3">
                    <Input
                      readOnly
                      aria-label="Ask Cerevix anything"
                      value=""
                      placeholder="Ask Cerevix anything..."
                      className="h-11 border-0 bg-transparent px-1 text-xs text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0"
                    />
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Paperclip className="h-3.5 w-3.5" />
                        <Link2 className="h-3.5 w-3.5" />
                        <Mic className="h-3.5 w-3.5" />
                        <ImageIcon className="h-3.5 w-3.5" />
                        <Play className="h-3.5 w-3.5" />
                      </div>
                      <Button size="icon" className="h-8 w-8 rounded-[6px] bg-[#068fff] text-white shadow-none hover:bg-[#1b9dff]">
                        <Send className="h-3.5 w-3.5" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {featureCards.map(({ title, copy, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[8px] border border-white/[0.1] bg-[#111215] p-4 text-white transition-colors hover:border-[#068fff]/45"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Icon className="h-4 w-4 text-[#068fff]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                    </div>
                    <h3 className="text-xs font-semibold tracking-[-0.02em] text-zinc-100">{title}</h3>
                    <p className="mt-2 text-[10.5px] leading-4 text-zinc-500">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Hero({ isLight }: { isLight: boolean }) {
  return (
    <section className="relative overflow-hidden pb-12 pt-28 sm:pb-16 lg:pb-20">
      <div className={`pointer-events-none absolute inset-x-0 top-0 border-b ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`} />
      <div className={`pointer-events-none absolute left-1/2 top-0 h-full w-px ${isLight ? "bg-black/[0.04]" : "bg-white/[0.05]"}`} />
      <div className={`pointer-events-none absolute left-[12%] top-0 hidden h-full w-px lg:block ${isLight ? "bg-black/[0.035]" : "bg-white/[0.04]"}`} />
      <div className={`pointer-events-none absolute right-[12%] top-0 hidden h-full w-px lg:block ${isLight ? "bg-black/[0.035]" : "bg-white/[0.04]"}`} />
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <h1
          className={`mx-auto max-w-4xl text-balance text-[clamp(3rem,8vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.07em] ${
            isLight ? "text-[#101114]" : "text-zinc-100"
          }`}
        >
          Build faster with an AI platform studio.
        </h1>
        <p className={`mx-auto mt-6 max-w-2xl text-balance text-base leading-7 sm:text-lg ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
          Create workflows, generate assets, automate tools, and coordinate AI agents across code, 3D, and design environments.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-full bg-[#068fff] px-6 text-xs font-semibold text-white shadow-none transition-colors hover:bg-[#1b9dff]"
          >
            <Link href="/pricing">Upgrade</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={`h-11 rounded-full px-6 text-xs font-semibold shadow-none transition-colors ${
              isLight
                ? "border-black/12 bg-white/70 text-[#101114] hover:border-[#068fff]/35 hover:bg-white hover:text-[#068fff]"
                : "border-white/18 bg-white/[0.03] text-zinc-100 hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Link href="/main">Explore Studio</Link>
          </Button>
        </div>
      </div>
      <DashboardPreview />
    </section>
  );
}

function Footer({ isLight, toggleTheme }: { isLight: boolean; toggleTheme: () => void }) {
  return (
    <footer
      className={`relative border-t px-5 py-8 sm:px-8 lg:px-10 ${
        isLight ? "border-black/[0.08] bg-[#f8fafc]" : "border-white/[0.08] bg-[#111113]"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 py-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Brand compact isLight={isLight} />
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} footer links`}>
              <h2 className={`text-xs font-semibold ${isLight ? "text-[#101114]" : "text-white"}`}>{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={footerHref[link] ?? "#"}
                      className={`text-xs font-medium transition-colors ${
                        isLight ? "text-zinc-600 hover:text-[#068fff]" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div
          className={`mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${
            isLight ? "border-black/[0.08]" : "border-white/[0.08]"
          }`}
        >
          <p className={`text-xs ${isLight ? "text-zinc-600" : "text-zinc-500"}`}>Cerevix · Copyright &copy;2026</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex h-9 w-fit items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors ${
                isLight
                  ? "border-black/12 bg-white text-[#101114] hover:border-[#068fff]/45 hover:text-[#068fff]"
                  : "border-white/16 bg-transparent text-zinc-300 hover:border-[#068fff]/50 hover:text-white"
              }`}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            >
              {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {isLight ? "Dark" : "Light"}
            </button>
            <button
              className={`inline-flex h-9 w-fit items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors ${
                isLight
                  ? "border-black/12 bg-white text-[#101114] hover:border-[#068fff]/45 hover:text-[#068fff]"
                  : "border-white/16 bg-transparent text-zinc-300 hover:border-[#068fff]/50 hover:text-white"
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" />
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [isLight, toggleTheme] = useHomeTheme();

  return (
    <div className={`min-h-screen overflow-hidden font-roboto transition-colors ${isLight ? "bg-[#f6f8fb] text-[#101114]" : "bg-[#0f0f11] text-zinc-100"}`}>
      <SiteHeader isLight={isLight} />
      <main>
        <Hero isLight={isLight} />
      </main>
      <Footer isLight={isLight} toggleTheme={toggleTheme} />
    </div>
  );
}
