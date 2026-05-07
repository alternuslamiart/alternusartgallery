import Link from "next/link";
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
  Paperclip,
  Play,
  Send,
  Settings,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Cerevix home">
      <CerevixMark className={compact ? "h-5 w-5" : "h-8 w-8"} />
      <span className={compact ? "text-xs font-semibold text-white" : "text-[1.35rem] font-semibold tracking-[-0.03em] text-white"}>
        Cerevix
      </span>
    </Link>
  );
}

function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
      <Brand />
      <nav className="hidden items-center gap-9 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-white"
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
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="mx-auto mt-16 w-full max-w-5xl overflow-x-auto px-4 pb-3 sm:px-6 lg:mt-20">
      <Card className="relative mx-auto min-w-[880px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#111214]/88 text-white shadow-[0_34px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="grid min-h-[455px] grid-cols-[190px_1fr]">
          <aside className="flex flex-col border-r border-white/[0.08] bg-black/18 p-5">
            <Brand compact />
            <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Dashboard preview navigation">
              {sidebarItems.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex h-9 items-center gap-2 rounded-[8px] px-3 text-[11px] transition-colors ${
                    active ? "bg-white/[0.08] text-white" : "text-zinc-500"
                  }`}
                >
                  <Icon className={active ? "h-3.5 w-3.5 text-[#068fff]" : "h-3.5 w-3.5"} />
                  <span>{label}</span>
                </div>
              ))}
            </nav>
            <div className="mt-8 flex items-center gap-2 rounded-[8px] px-2 py-2 text-[11px] text-zinc-300">
              <Settings className="h-4 w-4" />
              Settings
            </div>
          </aside>

          <section className="relative flex flex-col bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]">
            <header className="flex h-16 items-center justify-between px-8">
              <p className="text-xs font-semibold text-zinc-200">Welcome, Mike</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-300">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-xs font-semibold text-zinc-100">
                  B
                </span>
              </div>
            </header>

            <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col items-center justify-center px-8 pb-10 pt-3">
              <Badge className="mb-5 rounded-full border border-[#068fff]/25 bg-[#068fff]/10 px-3 py-1 text-[10px] font-medium text-[#8fccff] shadow-none hover:bg-[#068fff]/10">
                Platform Studio
              </Badge>
              <h2 className="text-center text-xl font-semibold tracking-[-0.03em] text-white">
                Cerevix AI Assistant
              </h2>
              <p className="mt-3 max-w-md text-center text-xs leading-5 text-zinc-400">
                Build workflows, generate assets, automate tasks, and coordinate AI tools from one Cerevix AI workspace.
              </p>

              <div className="mt-8 w-full rounded-[10px] border border-white/[0.08] bg-[#202123] p-3">
                <Input
                  readOnly
                  aria-label="Ask Cerevix anything"
                  value=""
                  placeholder="Ask Cerevix anything..."
                  className="h-11 border-0 bg-transparent px-1 text-xs text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <Paperclip className="h-3.5 w-3.5" />
                    <Link2 className="h-3.5 w-3.5" />
                    <Mic className="h-3.5 w-3.5" />
                    <ImageIcon className="h-3.5 w-3.5" />
                    <Play className="h-3.5 w-3.5" />
                  </div>
                  <Button size="icon" className="h-8 w-8 rounded-[8px] bg-[#068fff] text-white shadow-none hover:bg-[#1b9dff]">
                    <Send className="h-3.5 w-3.5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid w-full grid-cols-4 gap-3">
                {featureCards.map(({ title, copy, icon: Icon }) => (
                  <Card
                    key={title}
                    className="rounded-[8px] border border-white/[0.08] bg-white/[0.045] p-4 text-white shadow-none transition-colors hover:border-[#068fff]/35 hover:bg-white/[0.065]"
                  >
                    <Icon className="mb-3 h-4 w-4 text-[#068fff]" />
                    <h3 className="text-xs font-semibold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-2 text-[10.5px] leading-4 text-zinc-500">{copy}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-8 sm:pb-16 lg:pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_at_top,rgba(6,143,255,0.19),rgba(15,15,17,0)_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[310px] h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.09),rgba(15,15,17,0)_62%)]" />
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <h1 className="mx-auto max-w-4xl text-balance text-[clamp(3rem,8vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-zinc-100">
          Build faster with an AI platform studio.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-zinc-400 sm:text-lg">
          Create workflows, generate assets, automate tools, and coordinate AI agents across code, 3D, and design environments.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-full bg-[#068fff] px-6 text-xs font-semibold text-white shadow-none transition-colors hover:bg-[#1b9dff]"
          >
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-white/18 bg-white/[0.03] px-6 text-xs font-semibold text-zinc-100 shadow-none transition-colors hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
          >
            <Link href="/main">Explore Studio</Link>
          </Button>
        </div>
      </div>
      <DashboardPreview />
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#111113] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 py-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Brand compact />
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} footer links`}>
              <h2 className="text-xs font-semibold text-white">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={footerHref[link] ?? "#"}
                      className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">Cerevix · Copyright &copy;2026</p>
          <button className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/16 bg-transparent px-4 text-xs font-medium text-zinc-300 transition-colors hover:border-[#068fff]/50 hover:text-white">
            <Globe2 className="h-3.5 w-3.5" />
            English
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0f0f11] font-roboto text-zinc-100">
      <SiteHeader />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
