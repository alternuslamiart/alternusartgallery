"use client";

import Link from "next/link";
import {
  Bell,
  Box,
  Building2,
  ChevronRight,
  Compass,
  FileText,
  House,
  Layers3,
  LayoutTemplate,
  Plus,
  Search,
  Settings,
  Sofa,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", icon: House },
  { label: "Studio", icon: LayoutTemplate },
  { label: "Projects", icon: Layers3 },
  { label: "Concepts", icon: Compass },
  { label: "Brand", icon: Wand2 },
  { label: "Docs", icon: FileText },
];

const categories = [
  {
    title: "Architecture",
    desc: "Create house plans, building layouts and 3D architectural models.",
    img: "/Section/architectresectionone.png",
    icon: Building2,
    prompt: "Create a modern 3-bedroom house floor plan.",
  },
  {
    title: "Interior Design",
    desc: "Design rooms, styles and materials in 3D.",
    img: "/Section/section1.png",
    icon: Sofa,
    prompt: "Design a modern minimalist living room.",
  },
  {
    title: "Furniture & Layout",
    desc: "Plan furniture and optimize available space.",
    img: "/Section/section0.jpg",
    icon: Box,
    prompt: "Arrange furniture for this apartment.",
  },
  {
    title: "3D Visualization",
    desc: "Create realistic architectural and interior visualizations.",
    img: "/ai-cards/chat-architecture.svg",
    icon: Sparkles,
    prompt: "Create a 3D interior for this floor plan.",
  },
];

export function DesignDashboard({ onOpenStudio }: { onOpenStudio: () => void }) {
  const [prompt, setPrompt] = useState("Luxury contemporary villa with glass walls, warm wood finish, and a poolside lounge.");
  const [activeNav, setActiveNav] = useState("Home");

  const submit = () => {
    if (!prompt.trim()) return;
    onOpenStudio();
  };

  return (
    <div
      className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5]"
      style={{ fontFamily: '"Roboto", "Segoe UI", sans-serif' }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-white/10 bg-[#171717] px-4 py-5 md:flex md:flex-col">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-400 shadow-[0_0_25px_rgba(124,92,255,0.45)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">Crystal</div>
              <div className="text-[11px] text-zinc-400">Studio</div>
            </div>
          </div>

          <nav className="mt-7 space-y-1.5">
            {navItems.map(({ label, icon: Icon }) => {
              const isActive = activeNav === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setActiveNav(label);
                    onOpenStudio();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[22px] border border-violet-500/15 bg-gradient-to-br from-violet-500/10 via-[#0d1320]/60 to-[#0b0d12] p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-violet-200/80">Workspace</div>
            <div className="mt-3 text-xl font-semibold">AI Design Lab</div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Generate concept boards, mockups, and room layouts in one place.
            </p>
            <button
              onClick={onOpenStudio}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-900"
            >
              New project
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-xs">
                B
              </div>
              Bulzart
            </div>
            <Link href="/settings" className="text-zinc-400 hover:text-white">
              <Settings size={16} />
            </Link>
          </div>
        </aside>

        <main className="flex-1 bg-[#0F0F0F]">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#171717]/90 px-5 py-4 backdrop-blur md:px-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Design Studio</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">Dashboard</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-zinc-300 hover:bg-white/[0.05]" aria-label="Search">
                <Search size={16} />
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-zinc-300 hover:bg-white/[0.05]" aria-label="Notifications">
                <Bell size={16} />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-2 text-sm text-zinc-200 hover:bg-white/[0.05]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold">
                  B
                </span>
                <span className="hidden sm:inline">Bulzart</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1080px] px-4 py-8 md:px-8 lg:py-10">
            <section className="rounded-[30px] bg-[#171717] p-5 md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-violet-200">
                  <Sparkles size={11} />
                  Intelligent design
                </div>

                <h1 className="mt-6 max-w-4xl text-[2.3rem] font-semibold tracking-[-0.08em] text-white md:text-[4rem]">
                  Design spaces with
                  <span className="bg-gradient-to-r from-violet-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
                    {" "}AI precision
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                  Create architecture, interiors, furniture layouts, and photoreal visual concepts from a single prompt.
                </p>
              </div>

              <div className="mt-8 rounded-[30px] bg-[#171717] p-3 md:p-4">
                <div className="flex items-start gap-3 rounded-[22px] bg-[#1B1B1B] p-3 md:p-4">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-sky-500/20 text-violet-200 ring-1 ring-violet-400/25">
                    <Sparkles size={18} />
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Describe your ideal space, architectural style, or room concept..."
                    className="min-h-[124px] flex-1 resize-none bg-transparent p-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none md:text-base"
                  />

                  <button
                    onClick={submit}
                    className="ml-auto mt-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(108,93,255,0.42)] transition hover:brightness-110 disabled:opacity-50"
                  >
                    Generate
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Modern villa",
                    "Minimal living room",
                    "Luxury kitchen",
                    "Outdoor terrace",
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setPrompt(tag + " with rich textures, warm lighting, and a premium modern aesthetic.")}
                      className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.05]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Explore design areas</h2>
                <button className="inline-flex items-center gap-2 text-sm text-violet-200 hover:text-violet-100">
                  Browse all
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {categories.map(({ title, desc, img, icon: Icon, prompt: cardPrompt }) => (
                  <article
                    key={title}
                    className="group overflow-hidden rounded-[22px] border border-white/10 bg-[#171717] text-left transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-[#1B1B1B]"
                  >
                    <div className="h-40 overflow-hidden border-b border-white/10 bg-zinc-900">
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200">
                          <Icon size={16} />
                        </div>
                        <button
                          onClick={() => setPrompt(cardPrompt)}
                          className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-200"
                        >
                          Open
                        </button>
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{desc}</p>

                      <button
                        onClick={() => {
                          setPrompt(cardPrompt);
                          onOpenStudio();
                        }}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300"
                      >
                        Start concept
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Recent projects</h2>
                <button className="text-sm text-violet-200 hover:text-violet-100">View all</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { name: "Modern Villa", tag: "Architecture", time: "2h ago", img: "/Section/architectresectionone.png" },
                  { name: "Lounge Redesign", tag: "Interior", time: "6h ago", img: "/Section/section1.png" },
                  { name: "Furniture Flow", tag: "Layout", time: "1d ago", img: "/Section/section0.jpg" },
                  { name: "Glass Concept", tag: "Visualization", time: "2d ago", img: "/ai-cards/chat-architecture.svg" },
                ].map(({ name, tag, time, img }) => (
                  <button
                    key={name}
                    onClick={onOpenStudio}
                    className="overflow-hidden rounded-[22px] border border-white/10 bg-[#171717] text-left transition hover:-translate-y-0.5 hover:border-violet-400/25"
                  >
                    <img src={img} alt={name} className="h-28 w-full object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-violet-200">
                        <span>{tag}</span>
                        <Plus size={14} />
                      </div>
                      <div className="mt-3 text-base font-semibold text-white">{name}</div>
                      <div className="mt-1 text-xs text-zinc-500">Updated {time}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
