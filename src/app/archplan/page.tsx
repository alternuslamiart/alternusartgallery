"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Copy,
  Globe2,
  House,
  Home,
  ImagePlus,
  LayoutGrid,
  Map,
  Mail,
  Search,
  WandSparkles,
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
  { label: "All Projects", icon: LayoutGrid },
  { label: "Architecture", icon: House },
  { label: "Interior Design...", icon: WandSparkles },
  { label: "Urban Planning", icon: Map },
  { label: "Community", icon: Globe2 },
  { label: "Archive...", icon: Archive },
];

export default function ArchplanPage() {
  const [selectedStyle, setSelectedStyle] = useState("Classical");
  const [imageType, setImageType] = useState("Exterior");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("Standard");
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [room, setRoom] = useState("");
  const [model, setModel] = useState("Autodesk Revit Fusion AI");
  const [activeProject, setActiveProject] = useState("Architecture");
  const [saved, setSaved] = useState(false);
  const [generated, setGenerated] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans text-[#f5f5f5]">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[54px] items-center border-b border-[#242424] bg-[#171717] px-[50px]">
        <span className="text-sm font-semibold tracking-tight">Crystal</span>
        <a href="/design-studio" className="ml-8 text-zinc-400 transition hover:text-white" aria-label="Home">
          <Home size={16} strokeWidth={1.8} />
        </a>
      </header>

      <aside className="fixed bottom-0 left-0 top-[54px] z-20 hidden w-[272px] border-r border-white/[0.04] bg-[#111111] px-3 pt-2 lg:block">
        <div className="flex h-12 items-center justify-between rounded-[12px] bg-[#181818] px-2">
          <div className="flex items-center gap-3">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[5px] bg-[#2867f2] text-[13px] font-semibold">B</span>
            <span className="text-[13px] font-medium">My Team</span>
          </div>
          <ChevronDown size={14} className="text-zinc-400" />
        </div>
        <div className="mt-2 flex h-[34px] items-center gap-2 rounded-[12px] bg-[#181818] px-3 text-[11px] text-[#8a8a8a]">
          <Search size={13} />
          Search
        </div>

        <nav className="mt-7 space-y-0.5" aria-label="Project navigation">
          <h2 className="mb-4 px-2 text-xs font-semibold text-white">Project</h2>
          {projectLinks.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveProject(label)}
              className={`flex h-8 w-full items-center gap-2 rounded-[12px] px-2 text-xs transition ${
                activeProject === label ? "bg-[#1a1a1a] text-[#f4f4f4]" : "text-[#b7b7b7] hover:bg-[#181818] hover:text-zinc-200"
              }`}
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </button>
          ))}
          <button type="button" className="flex h-8 w-full items-center gap-2 rounded-[12px] px-2 text-xs text-[#b7b7b7] transition hover:bg-[#181818] hover:text-white">
            <CirclePlus size={14} strokeWidth={1.5} />
            New Project
          </button>
        </nav>

        <div className="mt-4 px-2">
          <h2 className="text-xs font-semibold text-white">Recent</h2>
          <p className="mt-4 text-[11px] text-zinc-400">Architecture Building</p>
        </div>

        <div className="absolute inset-x-3.5 bottom-[72px] rounded-[12px] bg-[#181818] p-4">
          <p className="text-xs font-medium">Upgrade to Pro</p>
          <p className="mt-2 text-[10px] leading-[14px] text-zinc-500">Get more credits, faster render<br />and premium models</p>
          <a href="/pricing" className="mt-3 flex h-[29px] w-full items-center justify-center rounded-[12px] bg-[#2867f2] text-[11px] font-semibold transition hover:bg-[#3473f5]">
            Go Pro
          </a>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[10px]">
          <a href="mailto:?subject=Join my Crystal team" className="flex items-center gap-2"><Mail size={14} /> Invite your team</a>
          <button type="button" onClick={() => void navigator.clipboard?.writeText(window.location.href)} className="rounded-[12px] bg-[#181818] px-3 py-2"><Copy size={12} className="mr-1 inline" /> Copy link</button>
        </div>
      </aside>

      <main className="min-h-screen overflow-y-auto px-5 pb-12 pt-[102px] lg:ml-[272px] lg:px-10">
        <div className="mx-auto max-w-[765px]">
          <section>
            <h1 className="text-[20px] font-semibold leading-6 tracking-tight">Project Settings</h1>
            <label className="mt-4 block text-[11px] font-medium text-[#a5a5a5]" htmlFor="project-name">Project Name (optional)</label>
            <input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g Exterior ON" className="mt-2 h-10 w-full rounded-[12px] bg-[#181818] px-3.5 text-[11px] text-white outline-none placeholder:text-[#777] focus:bg-[#1d1d1d]" />
          </section>

          <section className="mt-[43px]">
            <h2 className="text-[18px] font-semibold">Style / Assthetic</h2>
            <p className="mt-1.5 text-[11px] text-[#a0a0a0]">Choose visual style</p>
            <div className="mt-3 grid grid-cols-2 gap-[10px] sm:grid-cols-5">
              {styles.map((style) => (
                <button key={style.name} type="button" onClick={() => setSelectedStyle(style.name)} className={`relative h-[145px] overflow-hidden rounded-[12px] text-left transition ${selectedStyle === style.name ? "ring-1 ring-[#6b9b62]" : "hover:ring-1 hover:ring-white/30"}`}>
                  <img src={style.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-1 bottom-1 rounded-[12px] bg-black/65 px-2 py-2 text-center text-[11px] font-medium backdrop-blur-sm">{style.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 grid gap-7 md:grid-cols-[1.08fr_0.92fr]">
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Image type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                  {["Exterior", "Interior", "Aerial", "Concept"].map((type) => (
                    <button key={type} type="button" onClick={() => setImageType(type)} className={`h-[90px] rounded-[12px] text-xs font-medium transition ${imageType === type ? "bg-[#242424] text-white" : "bg-[#181818] text-zinc-300 hover:bg-[#222]"}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Room / AI Powered (optional)</p>
                <div className="space-y-3">
                  <label className="flex h-10 w-full items-center justify-between rounded-[12px] bg-[#181818] px-3 text-[11px] text-zinc-400"><select value={room} onChange={(event) => setRoom(event.target.value)} className="w-full appearance-none bg-transparent outline-none"><option value="">e.g Living Room Kitchen...</option><option>Living Room</option><option>Kitchen</option><option>Bedroom</option></select><ChevronDown size={14} /></label>
                  <label className="flex h-10 w-full items-center gap-3 rounded-[12px] bg-[#181818] px-2 text-[11px] text-zinc-400"><span className="grid h-7 w-7 place-items-center rounded bg-[#dd155a] text-base font-bold text-white">A</span><select value={model} onChange={(event) => setModel(event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent outline-none"><option>Autodesk Revit Fusion AI</option><option>Crystal Architecture AI</option><option>Concept Render AI</option></select><ChevronDown size={14} /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <label className="text-[11px] text-[#a0a0a0]" htmlFor="arch-prompt">Description / Prompt</label>
            <div className="relative mt-2">
              <textarea id="arch-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} placeholder="Lorem ipsum dolor sit amet consectetur. Sollicitudin aliquet sit ipsum cras commodo. Accumsan elit gravida scelerisque scelerisque. Ipsum sagittis eget donec pharetra dolor. Tempor." className="h-36 w-full resize-none rounded-[12px] bg-[#181818] p-4 text-[11px] leading-[15px] text-[#9a9a9a] outline-none placeholder:text-[#9a9a9a] focus:ring-1 focus:ring-[#3d72ee]" />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-[#666]">{prompt.length}/2000</span>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-[18px] font-semibold">Advanced Options</h2>
            <div className="mt-4 grid gap-7 md:grid-cols-2">
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Style reference</p>
                <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-[12px] bg-[#181818] px-2 text-left text-[9px] text-zinc-400">
                  <span className="grid h-7 w-7 place-items-center rounded-[4px] bg-[#292929]"><ImagePlus size={14} /></span>
                  <span><strong className="block text-[10px] font-medium text-zinc-200">Upload reference image</strong>JPG, PNG · Max 10MB</span>
                  <input type="file" accept="image/png,image/jpeg" className="sr-only" />
                </label>
              </div>
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Aspect Ratio</p>
                <div className="grid grid-cols-4 gap-2">
                  {["1:1", "16:9", "9:16", "4:3"].map((ratio) => <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`h-[34px] rounded-[12px] text-[10px] ${aspectRatio === ratio ? "bg-[#2f6df6] text-white" : "bg-[#181818] text-zinc-300 hover:bg-[#232323]"}`}>{ratio}</button>)}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Number of images</p>
                <div className="flex h-[34px] w-[130px] items-center justify-between rounded-[12px] bg-[#181818] px-1.5"><button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="grid h-7 w-7 place-items-center rounded-[12px] bg-[#222]"><ChevronLeft size={14} /></button><span className="text-[11px]">{count}</span><button type="button" onClick={() => setCount(Math.min(4, count + 1))} className="grid h-7 w-7 place-items-center rounded-[12px] bg-[#222]"><ChevronRight size={14} /></button></div>
              </div>
              <div>
                <p className="mb-3 text-[11px] text-[#a0a0a0]">Quality</p>
                <div className="grid grid-cols-3 gap-2">{["Standard", "HD", "Ultra"].map((value) => <button key={value} type="button" onClick={() => setQuality(value)} className={`h-[34px] rounded-[12px] text-[10px] ${quality === value ? "bg-[#2f6df6] text-white" : "bg-[#181818] text-zinc-300 hover:bg-[#232323]"}`}>{value}</button>)}</div>
              </div>
            </div>
            <label className="mt-6 block text-[11px] text-[#a0a0a0]" htmlFor="instructions">Special instructions</label>
            <input id="instructions" placeholder="Include a swimming pool, modern furniture" className="mt-2 h-12 w-full rounded-[12px] bg-[#181818] px-3 text-[10px] text-white outline-none placeholder:text-[#888] focus:ring-1 focus:ring-[#3d72ee]" />
          </section>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-[10px] text-zinc-400"><input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} className="accent-[#2f6df6]" /> Save as Templates</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setPrompt(""); setProjectName(""); setRoom(""); setModel("Autodesk Revit Fusion AI"); setSelectedStyle("Classical"); setImageType("Exterior"); setAspectRatio("1:1"); setQuality("Standard"); setCount(1); setSaved(false); setGenerated(false); }} className="h-[34px] w-[90px] rounded-[12px] bg-[#181818] text-[10px] text-zinc-300 hover:bg-[#242424]">Reset</button>
              <button type="button" onClick={() => setGenerated(true)} className="h-[34px] w-[91px] rounded-[12px] bg-[#2867f2] text-[10px] font-semibold text-white hover:bg-[#3473f5]">{generated ? "Generated" : "Generate"}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
