"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Box,
  CheckCircle2,
  Code2,
  DraftingCompass,
  Gamepad2,
  Globe2,
  ImageIcon,
  Layers3,
  Moon,
  Paperclip,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Platform", href: "/platform/overview" },
  { label: "Studio", href: "/main" },
  { label: "Pricing", href: "/pricing" },
  { label: "Status", href: "/platform/status" },
  { label: "Contact", href: "/contact" },
];

const sidebarItems = [
  { label: "Assistant", icon: Bot, active: true },
  { label: "Design", icon: ImageIcon },
  { label: "Code", icon: Code2 },
  { label: "3D", icon: Box },
  { label: "CAD", icon: DraftingCompass },
  { label: "Engines", icon: Gamepad2 },
];

const featureCards = [
  {
    title: "One studio for every build",
    copy: "Plan pages, generate code, shape assets, and keep creative workflows in one focused surface.",
    icon: Layers3,
  },
  {
    title: "Agent-ready production",
    copy: "Turn prompts into tasks with context, files, assets, previews, and checkpoints that stay organized.",
    icon: Workflow,
  },
  {
    title: "Design, code, and 3D",
    copy: "Move from web layout to Blender concepts, CAD support, and implementation without changing tools.",
    icon: Sparkles,
  },
  {
    title: "Clean team control",
    copy: "Keep workspaces readable with roles, activity, project history, and clear operational status.",
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: "Workspace uptime", value: "99.9%" },
  { label: "AI tools", value: "12" },
  { label: "Live tasks", value: "48" },
];

const workflowSteps = [
  "Describe the product, page, scene, or workflow.",
  "Cedium creates a structured plan with assets and next actions.",
  "Launch the output in Studio, refine, and ship.",
];

const footerColumns = [
  {
    title: "Platform",
    links: ["Overview", "Studio", "Agent SDK", "API Reference", "Changelog", "Status"],
  },
  {
    title: "Workspace",
    links: ["Launch Studio", "Design", "Asset Library", "3D Tools", "Voice"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookie Notice", "Security"],
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
  Design: "/autocad-design",
  "Asset Library": "/asset-library",
  "3D Tools": "/blender-3d",
  Voice: "/workspace/voice",
  About: "/about",
  Careers: "/careers",
  Press: "/press",
  Contact: "/contact",
  Privacy: "/privacy",
  Terms: "/terms",
  "Cookie Notice": "/cookie-notice",
  Security: "/security",
};

const HOME_THEME_KEY = "cedium_home_theme";

function useHomeTheme() {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    setIsLight(window.localStorage.getItem(HOME_THEME_KEY) !== "dark");
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

function CediumMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#38BDF8] shadow-[0_10px_28px_rgba(56,189,248,0.28)] ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-[5px] rounded-[5px] border border-white/55" />
      <span className="absolute h-2/5 w-2/5 rounded-full bg-white" />
      <span className="absolute bottom-[6px] right-[6px] h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  );
}

function Brand({ compact = false, isLight = true }: { compact?: boolean; isLight?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Cedium home">
      <CediumMark className={compact ? "h-6 w-6" : "h-8 w-8"} />
      <span
        className={
          compact
            ? `text-sm font-semibold ${isLight ? "text-[#0F172A]" : "text-white"}`
            : `text-[1.35rem] font-semibold ${isLight ? "text-[#0F172A]" : "text-white"}`
        }
      >
        Cedium
      </span>
    </Link>
  );
}

function SiteHeader({ isLight }: { isLight: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-[#101113]/78">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Brand isLight={isLight} />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isLight ? "text-slate-600 hover:text-[#0284C7]" : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="h-10 rounded-[8px] bg-[#38BDF8] px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(56,189,248,0.22)] hover:bg-[#0EA5E9]">
          <Link href="/main">
            Open Studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function ProductPreview({ isLight }: { isLight: boolean }) {
  const t = isLight
    ? {
        shell: "border-[#DCEAF5] bg-white/90 text-[#0F172A] shadow-[0_32px_90px_rgba(14,165,233,0.14)]",
        top: "border-[#DCEAF5] bg-[#F8FCFF]",
        sidebar: "border-[#DCEAF5] bg-[#F7FBFF]",
        surface: "border-[#DCEAF5] bg-white",
        panel: "border-[#DCEAF5] bg-white/90",
        softPanel: "border-[#DCEAF5] bg-[#F8FCFF]",
        text: "text-[#0F172A]",
        muted: "text-[#475569]",
        faint: "text-slate-400",
        chip: "bg-[#E0F2FE] text-[#0369A1]",
      }
    : {
        shell: "border-white/10 bg-[#111827] text-white",
        top: "border-white/10 bg-[#0F172A]",
        sidebar: "border-white/10 bg-[#0B1120]",
        surface: "border-white/10 bg-[#111827]",
        panel: "border-white/10 bg-[#0F172A]",
        softPanel: "border-white/10 bg-[#0B1120]",
        text: "text-white",
        muted: "text-slate-300",
        faint: "text-slate-500",
        chip: "bg-sky-400/10 text-sky-200",
      };

  return (
    <div className={`relative w-full overflow-hidden rounded-[22px] border backdrop-blur ${t.shell}`}>
      <div className={`relative flex h-14 items-center justify-between border-b px-4 sm:px-5 ${t.top}`}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
        </div>
        <span className={`hidden text-xs font-medium tracking-wide sm:inline ${t.muted}`}>cedium.com/studio</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.chip}`}>Live workspace</span>
      </div>

      <div className="relative grid min-h-[510px] grid-cols-1 lg:grid-cols-[210px_1fr]">
        <aside className={`hidden border-r p-5 lg:block ${t.sidebar}`}>
          <Brand compact isLight={isLight} />
          <nav className="mt-8 space-y-1.5" aria-label="Product preview navigation">
            {sidebarItems.map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
                  active ? "bg-[#E0F2FE] text-[#0369A1] shadow-[inset_0_0_0_1px_rgba(56,189,248,0.14)]" : t.muted
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        <section className="p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className={`rounded-[16px] border p-4 ${t.panel}`}>
                <p className={`text-xs font-medium ${t.muted}`}>{metric.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${t.text}`}>{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-[18px] border p-5 sm:p-6 ${t.softPanel}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.chip}`}>AI command</span>
                <span className={`text-xs ${t.muted}`}>Workspace context connected</span>
              </div>
              <h2 className={`mt-7 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl ${t.text}`}>
                Plan, generate, and refine every build from one calm workspace.
              </h2>
              <p className={`mt-4 max-w-xl text-sm leading-6 ${t.muted}`}>
                Requirements, generated assets, implementation notes, and review state stay visible while Cedium works through the project.
              </p>

              <div className="mt-8 grid gap-3">
                {["Product brief parsed", "Design system generated", "Preview ready for review"].map((item, index) => (
                  <div key={item} className={`flex items-center gap-3 rounded-[12px] border px-3 py-2.5 ${t.surface}`}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#E0F2FE] text-xs font-semibold text-[#0284C7]">
                      {index + 1}
                    </span>
                    <span className={`text-sm font-medium ${t.text}`}>{item}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-5 overflow-hidden rounded-[16px] border ${t.surface}`}>
                <Input
                  readOnly
                  aria-label="Ask Cedium"
                  value=""
                  placeholder="Ask Cedium to create a clean landing page..."
                  className={`h-12 border-0 bg-transparent px-4 text-sm shadow-none focus-visible:ring-0 ${
                    isLight ? "text-[#0F172A] placeholder:text-slate-400" : "text-white placeholder:text-slate-500"
                  }`}
                />
                <div className="flex items-center justify-between border-t border-[#DCEAF5] px-4 py-3 dark:border-white/10">
                  <div className={`flex items-center gap-3 ${t.muted}`}>
                    <Paperclip className="h-4 w-4" />
                    <Globe2 className="h-4 w-4" />
                    <ImageIcon className="h-4 w-4" />
                    <Play className="h-4 w-4" />
                  </div>
                  <Button size="icon" className="h-9 w-9 rounded-[10px] bg-[#38BDF8] text-white shadow-[0_12px_28px_rgba(56,189,248,0.26)] hover:bg-[#0EA5E9]">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {featureCards.slice(0, 2).map(({ title, copy, icon: Icon }) => (
                <div key={title} className={`rounded-[16px] border p-5 ${t.panel}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-[#0284C7]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`mt-6 text-base font-semibold ${t.text}`}>{title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${t.muted}`}>{copy}</p>
                </div>
              ))}
              <div className={`rounded-[16px] border p-5 ${t.softPanel}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${t.faint}`}>Current task</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full w-4/5 rounded-full bg-[#38BDF8]" />
                </div>
                <p className={`mt-4 text-sm font-medium ${t.text}`}>Landing page polish is 80% complete</p>
                <p className={`mt-2 text-xs leading-5 ${t.muted}`}>Copy, layout, preview, and implementation notes are synced.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Hero({ isLight }: { isLight: boolean }) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-[4.5rem] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="relative grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-[0_12px_30px_rgba(14,165,233,0.10)] ${
                isLight ? "border-[#DCEAF5] bg-white/80 text-[#0369A1]" : "border-white/10 bg-white/5 text-sky-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Premium AI workspace
            </div>
            <h1
              className={`mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl ${
                isLight ? "text-[#0F172A]" : "text-white"
              }`}
            >
              Cedium turns ideas into polished production workflows.
            </h1>
            <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${isLight ? "text-[#475569]" : "text-zinc-400"}`}>
              A refined AI studio for design, code, 3D, and automation. Plan the work, generate the output, and keep every project moving from one calm workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-[10px] bg-[#38BDF8] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(56,189,248,0.24)] hover:bg-[#0EA5E9]">
                <Link href="/main">
                  Launch Cedium
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`h-11 rounded-[10px] px-5 text-sm font-semibold shadow-none ${
                  isLight
                    ? "border-[#DCEAF5] bg-white/80 text-[#0F172A] hover:bg-[#F0F9FF]"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>

          <ProductPreview isLight={isLight} />
        </div>
      </div>
    </section>
  );
}

function Features({ isLight }: { isLight: boolean }) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#0284C7]">What Cedium does</p>
            <h2 className={`mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl ${isLight ? "text-[#0F172A]" : "text-white"}`}>
              A quieter way to run AI-assisted production.
            </h2>
          </div>
          <p className={`max-w-md text-sm leading-6 ${isLight ? "text-[#475569]" : "text-zinc-400"}`}>
            Built for people who need useful outputs, clear project state, and a workspace that stays readable.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map(({ title, copy, icon: Icon }) => (
            <article
              key={title}
              className={`rounded-[12px] border p-5 ${
                isLight ? "border-[#DCEAF5] bg-white shadow-[0_16px_42px_rgba(14,165,233,0.06)]" : "border-white/10 bg-[#151719]"
              }`}
            >
              <Icon className="h-5 w-5 text-[#0284C7]" />
              <h3 className={`mt-8 text-base font-semibold ${isLight ? "text-[#0F172A]" : "text-white"}`}>{title}</h3>
              <p className={`mt-3 text-sm leading-6 ${isLight ? "text-[#475569]" : "text-zinc-400"}`}>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ isLight }: { isLight: boolean }) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:px-10">
      <div
        className={`mx-auto grid max-w-7xl gap-8 rounded-[14px] border p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] ${
          isLight ? "border-[#DCEAF5] bg-white shadow-[0_20px_60px_rgba(14,165,233,0.07)]" : "border-white/10 bg-[#151719]"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-[#0284C7]">How it works</p>
          <h2 className={`mt-3 text-3xl font-semibold leading-tight sm:text-4xl ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            From brief to usable output without losing context.
          </h2>
        </div>
        <div className="grid gap-3">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className={`flex gap-4 rounded-[10px] border p-4 ${
                isLight ? "border-[#DCEAF5] bg-[#F8FCFF]" : "border-white/10 bg-[#101214]"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#38BDF8] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className={`text-sm leading-6 ${isLight ? "text-[#334155]" : "text-zinc-300"}`}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta({ isLight }: { isLight: boolean }) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-semibold text-[#0369A1]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ready for focused work
        </div>
        <h2 className={`mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl ${isLight ? "text-[#0F172A]" : "text-white"}`}>
          Build the next page, project, or product workflow in Cedium.
        </h2>
        <div className="mt-8 flex justify-center">
          <Button asChild className="h-11 rounded-[10px] bg-[#38BDF8] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(56,189,248,0.22)] hover:bg-[#0EA5E9]">
            <Link href="/main">
              Start building
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer({ isLight, toggleTheme }: { isLight: boolean; toggleTheme: () => void }) {
  return (
    <footer className={`border-t px-5 py-10 sm:px-8 lg:px-10 ${isLight ? "border-[#DCEAF5] bg-white" : "border-white/10 bg-[#101113]"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Brand compact isLight={isLight} />
            <p className={`mt-4 max-w-xs text-sm leading-6 ${isLight ? "text-[#475569]" : "text-zinc-400"}`}>
              Clean AI workspace for production teams, creators, and builders.
            </p>
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} footer links`}>
              <h2 className={`text-sm font-semibold ${isLight ? "text-[#0F172A]" : "text-white"}`}>{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={footerHref[link] ?? "#"}
                      className={`text-sm transition-colors ${
                        isLight ? "text-[#475569] hover:text-[#0284C7]" : "text-zinc-400 hover:text-white"
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

        <div className="mt-10 flex flex-col gap-4 border-t border-[#DCEAF5] pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <p className={`text-sm ${isLight ? "text-[#475569]" : "text-zinc-500"}`}>Cedium. Copyright &copy;2026</p>
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex h-10 w-fit items-center gap-2 rounded-[8px] border px-4 text-sm font-medium transition-colors ${
              isLight
                ? "border-[#DCEAF5] bg-[#F8FCFF] text-[#0F172A] hover:text-[#0284C7]"
                : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
            }`}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isLight ? "Dark" : "Light"}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [isLight, toggleTheme] = useHomeTheme();

  return (
    <div className={`${isLight ? "" : "dark"}`}>
      <div className={`min-h-screen overflow-hidden font-roboto transition-colors ${isLight ? "bg-[linear-gradient(180deg,#F8FCFF_0%,#FFFFFF_42%,#F6FBFF_100%)] text-[#0F172A]" : "bg-[#101113] text-zinc-100"}`}>
        <SiteHeader isLight={isLight} />
        <main>
          <Hero isLight={isLight} />
          <Features isLight={isLight} />
          <WorkflowSection isLight={isLight} />
          <Cta isLight={isLight} />
        </main>
        <Footer isLight={isLight} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
}
