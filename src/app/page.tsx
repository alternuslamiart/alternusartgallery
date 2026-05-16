"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CediumFooter } from "@/components/cedium-shell";

const navItems = [
  { label: "Platform", href: "/platform/overview" },
  { label: "Studio", href: "/main" },
  { label: "Pricing", href: "/pricing" },
  { label: "Status", href: "/platform/status" },
  { label: "Contact", href: "/contact" },
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

const workflowSteps = [
  "Describe the product, page, scene, or workflow.",
  "Cedium creates a structured plan with assets and next actions.",
  "Launch the output in Studio, refine, and ship.",
];

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
        shell: "border-[#DCEAF5] bg-white text-[#0F172A] shadow-[0_34px_100px_rgba(14,165,233,0.13)]",
        canvas: "border-[#DCEAF5] bg-[#F8FCFF]",
        surface: "border-[#DCEAF5] bg-white",
        text: "text-[#0F172A]",
        muted: "text-[#475569]",
        faint: "text-[#94A3B8]",
        chip: "bg-[#E0F2FE] text-[#0369A1]",
      }
    : {
        shell: "border-white/10 bg-[#111827] text-white",
        canvas: "border-white/10 bg-[#0B1120]",
        surface: "border-white/10 bg-[#111827]",
        text: "text-white",
        muted: "text-slate-300",
        faint: "text-slate-500",
        chip: "bg-sky-400/10 text-sky-200",
      };

  return (
    <div className={`w-full rounded-[28px] border p-4 sm:p-5 ${t.shell}`}>
      <div className={`rounded-[24px] border p-6 sm:p-8 ${t.canvas}`}>
        <div className="grid min-h-[470px] gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className={`rounded-[22px] border p-6 sm:p-7 ${t.surface}`}>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${t.chip}`}>Cedium intelligence layer</span>
            <h2 className={`mt-6 max-w-md text-3xl font-semibold leading-tight sm:text-4xl ${t.text}`}>
              One brief becomes a complete production direction.
            </h2>
            <p className={`mt-4 max-w-md text-sm leading-6 ${t.muted}`}>
              Cedium turns an idea into structured strategy, interface direction, and the next focused build steps.
            </p>

            <div className="mt-8 space-y-4">
              {["Define outcome", "Shape interface", "Prepare launch"].map((item, index) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-sm font-semibold text-[#0284C7]">
                    {index + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${t.text}`}>{item}</p>
                    <p className={`mt-0.5 text-xs ${t.faint}`}>Clear, reviewed, ready</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className={`rounded-[22px] border p-6 ${t.surface}`}>
              <p className={`text-xs font-semibold uppercase ${t.faint}`}>Launch readiness</p>
              <div className="mt-6 flex items-end justify-between">
                <p className={`text-5xl font-semibold ${t.text}`}>92%</p>
                <p className={`pb-1 text-sm ${t.muted}`}>aligned</p>
              </div>
              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#E0F2FE] dark:bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-[#38BDF8]" />
              </div>
            </div>

            <div className={`rounded-[22px] border p-6 ${t.surface}`}>
              <p className={`text-xs font-semibold uppercase ${t.faint}`}>Generated output</p>
              <div className="mt-5 space-y-3">
                {["Premium hero direction", "Sky-blue visual system", "Implementation checklist"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" />
                    <span className={`text-sm font-medium ${t.text}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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

export default function HomePage() {
  const [isLight] = useHomeTheme();

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
        <CediumFooter
          isDark={!isLight}
          fg={isLight ? "#0F172A" : "#C1C2BF"}
          muted={isLight ? "rgba(5,8,15,0.62)" : "rgba(193,194,191,0.72)"}
          faint={isLight ? "rgba(5,8,15,0.1)" : "rgba(255,255,255,0.16)"}
        />
      </div>
    </div>
  );
}
