"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Copy,
  Grid2X2,
  Home,
  ImagePlus,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const styles = [
  { name: "Modern", image: "/Section/architectresectionone.png" },
  { name: "Minimalist", image: "/Section/section1.png" },
  { name: "Classical", image: "/ai-cards/chat-architecture.svg" },
  { name: "Industrial", image: "/ai-cards/engine.svg" },
  { name: "Mediterranean", image: "/Section/section0.jpg" },
];

const projectLinks = [
  { label: "All Projects", icon: Grid2X2 },
  { label: "Architecture", icon: Home, active: true },
  { label: "Interior Design...", icon: Sparkles },
  { label: "Urban Planning", icon: Grid2X2 },
  { label: "Community", icon: Grid2X2 },
  { label: "Archive...", icon: Archive },
];

export default function ArchplanPage() {
  const [selectedStyle, setSelectedStyle] = useState("Modern");
  const [imageType, setImageType] = useState("Exterior");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("Standard");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f5f5f5] font-sans">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[62px] items-center border-b border-white/[0.07] bg-[#151515] px-6">
        <span className="text-[15px] font-semibold tracking-tight">Crystal</span>
        <a href="/design-studio" className="ml-7 text-zinc-300 transition hover:text-white" aria-label="Home">
          <Home size={16} strokeWidth={1.8} />
        </a>
      </header>

      <aside className="fixed bottom-0 left-0 top-[62px] z-20 hidden w-[318px] border-r border-white/[0.07] bg-[#101010] p-3.5 lg:block">
        <div className="flex h-12 items-center justify-between rounded-lg bg-[#1b1b1b] px-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#2f6df6] text-sm font-medium">B</span>
            <span className="text-sm font-medium">My Team</span>
          </div>
          <ChevronDown size={16} className="text-zinc-400" />
        </div>
        <div className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-[#1b1b1b] px-3 text-xs text-zinc-500">
          <Search size={14} />
          Search
        </div>

        <nav className="mt-14 space-y-1" aria-label="Project navigation">
          <h2 className="mb-5 px-2 text-sm font-semibold text-white">Project</h2>
          {projectLinks.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm transition ${
                active ? "bg-[#1b1b1b] text-white" : "text-zinc-400 hover:bg-[#181818] hover:text-zinc-200"
              }`}
            >
              <Icon size={15} strokeWidth={1.7} />
              {label}
            </button>
          ))}
          <button type="button" className="flex h-10 w-full items-center gap-3 px-2.5 text-sm text-zinc-400 hover:text-white">
            <CirclePlus size={15} />
            New Project
          </button>
        </nav>

        <div className="mt-5 px-2">
          <h2 className="text-sm font-semibold text-white">Recent</h2>
          <p className="mt-5 text-xs text-zinc-400">Architecture Building</p>
        </div>

        <div className="absolute inset-x-6 bottom-24 rounded-xl bg-[#1a1a1a] p-5">
          <p className="text-sm font-semibold">Upgrade to Pro</p>
          <p className="mt-2 text-xs leading-4 text-zinc-500">Get more credits, faster render and premium models</p>
          <button type="button" className="mt-4 h-10 w-full rounded-md bg-[#2f6df6] text-sm font-semibold transition hover:bg-[#3c78f8]">
            Go Pro
          </button>
        </div>
        <div className="absolute inset-x-6 bottom-3 flex items-center justify-between border-t border-white/[0.1] pt-3 text-xs">
          <span className="flex items-center gap-2"><Mail size={15} /> Invite your team</span>
          <button type="button" className="rounded-md bg-[#1b1b1b] px-3 py-2"><Copy size={13} className="mr-1 inline" /> Copy link</button>
        </div>
      </aside>

      <main className="min-h-screen px-5 pb-16 pt-[112px] lg:ml-[318px] lg:px-20">
        <div className="mx-auto max-w-[892px]">
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">Project Settings</h1>
            <label className="mt-5 block text-sm font-medium text-zinc-300" htmlFor="project-name">Project Name (optional)</label>
            <input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g Exterior ON" className="mt-4 h-12 w-full rounded-lg bg-[#191919] px-4 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:bg-[#1d1d1d]" />
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">Style / Aesthetic</h2>
            <p className="mt-4 text-sm text-zinc-300">Choose visual style</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {styles.map((style) => (
                <button key={style.name} type="button" onClick={() => setSelectedStyle(style.name)} className={`relative h-[168px] overflow-hidden rounded-xl border-2 text-left transition ${selectedStyle === style.name ? "border-[#4b7df7]" : "border-transparent hover:border-zinc-500"}`}>
                  <img src={style.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-1 bottom-1 rounded-md bg-black/65 px-2 py-2 text-center text-sm font-medium backdrop-blur-sm">{style.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="mb-4 text-sm text-zinc-300">Image type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                  {["Exterior", "Interior", "Aerial", "Concept"].map((type) => (
                    <button key={type} type="button" onClick={() => setImageType(type)} className={`h-[104px] rounded-xl text-sm transition ${imageType === type ? "bg-[#242424] text-white ring-1 ring-[#4b7df7]" : "bg-[#191919] text-zinc-300 hover:bg-[#222]"}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-4 text-sm text-zinc-300">Room / AI Powered (optional)</p>
                <div className="space-y-3">
                  <button type="button" className="flex h-12 w-full items-center justify-between rounded-lg bg-[#191919] px-4 text-sm text-zinc-400">e.g Living Room Kitchen... <ChevronDown size={16} /></button>
                  <button type="button" className="flex h-12 w-full items-center gap-3 rounded-lg bg-[#191919] px-3 text-sm text-zinc-400"><span className="grid h-8 w-8 place-items-center rounded bg-[#dd155a] text-lg font-bold text-white">A</span> Autodesk Revit Fusion AI <ChevronDown size={16} className="ml-auto" /></button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <label className="text-sm text-zinc-300" htmlFor="arch-prompt">Description / Prompt</label>
            <div className="relative mt-4">
              <textarea id="arch-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} placeholder="Describe the architecture, materials, lighting, landscaping, and atmosphere you want to generate..." className="min-h-[168px] w-full resize-y rounded-xl bg-[#191919] p-5 text-sm leading-5 text-white outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-[#3d72ee]" />
              <span className="absolute bottom-4 right-4 text-xs text-zinc-500">{prompt.length}/2000</span>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Advanced Options</h2>
            <div className="mt-5 grid gap-7 md:grid-cols-2">
              <div>
                <p className="mb-4 text-sm text-zinc-300">Style reference</p>
                <button type="button" className="flex h-[62px] w-full items-center gap-3 rounded-lg bg-[#191919] px-3 text-left text-xs text-zinc-400"><span className="grid h-10 w-10 place-items-center rounded bg-[#292929]"><ImagePlus size={17} /></span><span><strong className="block font-medium text-zinc-200">Upload reference image</strong>JPG, PNG - Max 10MB</span></button>
              </div>
              <div>
                <p className="mb-4 text-sm text-zinc-300">Aspect Ratio</p>
                <div className="grid grid-cols-4 gap-2">
                  {["1:1", "16:9", "9:16", "4:3"].map((ratio) => <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`h-12 rounded-lg text-sm ${aspectRatio === ratio ? "bg-[#2f6df6] text-white" : "bg-[#191919] text-zinc-300 hover:bg-[#232323]"}`}>{ratio}</button>)}
                </div>
              </div>
              <div>
                <p className="mb-4 text-sm text-zinc-300">Number of images</p>
                <div className="flex h-12 w-[130px] items-center justify-between rounded-lg bg-[#191919] px-2"><button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="grid h-8 w-8 place-items-center rounded bg-[#222]"><ChevronLeft size={15} /></button><span className="text-sm">{count}</span><button type="button" onClick={() => setCount(Math.min(4, count + 1))} className="grid h-8 w-8 place-items-center rounded bg-[#222]"><ChevronRight size={15} /></button></div>
              </div>
              <div>
                <p className="mb-4 text-sm text-zinc-300">Quality</p>
                <div className="grid grid-cols-3 gap-2">{["Standard", "HD", "Ultra"].map((value) => <button key={value} type="button" onClick={() => setQuality(value)} className={`h-12 rounded-lg text-sm ${quality === value ? "bg-[#2f6df6] text-white" : "bg-[#191919] text-zinc-300 hover:bg-[#232323]"}`}>{value}</button>)}</div>
              </div>
            </div>
            <label className="mt-8 block text-sm text-zinc-300" htmlFor="instructions">Special instructions</label>
            <input id="instructions" placeholder="Include a swimming pool, modern furniture" className="mt-4 h-12 w-full rounded-lg bg-[#191919] px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-[#3d72ee]" />
          </section>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" className="accent-[#2f6df6]" /> Save as Templates</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setPrompt(""); setProjectName(""); }} className="h-11 rounded-lg bg-[#191919] px-8 text-sm text-zinc-300 hover:bg-[#242424]">Reset</button>
              <button type="button" className="h-11 rounded-lg bg-[#2f6df6] px-10 text-sm font-medium text-white hover:bg-[#3d78f7]">Generate</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
