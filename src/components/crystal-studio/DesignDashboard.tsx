"use client";

import Link from "next/link";
import {
  Bot,
  Box,
  ChevronRight,
  CirclePlus,
  Grid2X2,
  Home,
  Link2,
  Library,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UnifiedSidebar } from "@/components/unified-sidebar";

const navigation = [
  { label: "Agents", icon: Grid2X2 },
  { label: "Library", icon: Library, active: true },
  { label: "Workflows", icon: Workflow },
  { label: "Plugins", icon: Box },
  { label: "Tools", icon: CirclePlus },
];

const inspirations = [
  { title: "Robotics Concept", image: "/ai-cards/agent.svg", prompt: "Create a futuristic home robot." },
  { title: "AI Collaboration", image: "/ai-cards/chat-code.svg", prompt: "Create a collaborative AI workspace." },
  { title: "Autonomous Machine", image: "/ai-cards/engine.svg", prompt: "Design an autonomous machine." },
  { title: "Smart Home", image: "/ai-cards/chat-architecture.svg", prompt: "Design a smart modern home." },
  { title: "New Concept", image: "/Section/architectresectionone.png", prompt: "Create a premium architectural concept." },
  { title: "Mechanical Study", image: "/ai-cards/autocad.svg", prompt: "Create a precise mechanical study." },
  { title: "Industrial Design", image: "/ai-cards/workflow.svg", prompt: "Design an intelligent industrial product." },
  { title: "Future Interface", image: "/ai-cards/browser.svg", prompt: "Create a futuristic interface concept." },
  { title: "Architecture", image: "/Section/section1.png", prompt: "Create a contemporary interior." },
  { title: "Furniture Layout", image: "/Section/section0.jpg", prompt: "Arrange furniture in a premium living room." },
];

export function DesignDashboard({ onOpenStudio }: { onOpenStudio: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [precision, setPrecision] = useState("Precision Mode");
  const [reference, setReference] = useState<string | null>(null);
  const router = useRouter();

  const submit = () => {
    if (prompt.trim()) {
      window.sessionStorage.setItem("crystal-design-prompt", prompt.trim());
      onOpenStudio();
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5]"
      style={{ fontFamily: '"Roboto", "Segoe UI", sans-serif' }}
    >
      <header className="flex h-[62px] items-center border-b border-white/[0.08] bg-[#0F0F0F] px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center text-zinc-400">
            <Sparkles size={21} />
          </div>
          <span className="text-[15px] font-semibold">Crystal</span>
        </div>
        <Link href="/design-studio" className="ml-8 text-zinc-300 hover:text-white" aria-label="Home">
          <Home size={16} />
        </Link>
      </header>

      <div className="flex min-h-[calc(100vh-62px)] gap-1.5 bg-[#0F0F0F] p-1.5">
        <UnifiedSidebar activePath="/design-studio" className="hidden md:flex" />

        <main className="min-w-0 flex-1 rounded-[19px] bg-[#101010] px-5 py-12 md:px-8 lg:px-10">
          <section className="mx-auto max-w-[1560px]">
            <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-[-0.05em] text-white md:text-[36px]">
                Hi, create your ideas
              </h1>
              <p className="mt-4 max-w-[330px] text-xs leading-4 text-zinc-500">
                Lorem ipsum dolor sit amet consectetur. Sollicitudin blandit sit augue urna.
              </p>

              <div className="mt-8 w-full max-w-[487px] rounded-[15px] bg-gradient-to-r from-[#263BFF] via-[#7B24FF] to-[#FF334F] p-px shadow-[0_0_24px_rgba(73,50,255,0.28)]">
                <div className="h-[120px] rounded-[14px] bg-[#171717] p-2">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="What do you want to create?"
                    className="h-[69px] w-full resize-none bg-transparent px-2 py-1 text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
                    aria-label="What do you want to create?"
                  />
                  <div className="flex h-8 items-center gap-2">
                    <label className="grid h-8 w-8 cursor-pointer place-items-center rounded-[10px] bg-[#1D1D1D] text-zinc-200" aria-label="Attach reference">
                      <Link2 size={16} className={reference ? "text-[#4A90D9]" : undefined} />
                      <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setReference(URL.createObjectURL(file)); }} />
                    </label>
                    <button onClick={() => setPrecision((value) => value === "Precision Mode" ? "Fast Concept" : "Precision Mode")} className="h-8 rounded-[10px] bg-[#1D1D1D] px-4 text-xs text-zinc-200">
                      {precision}
                    </button>
                    <button
                      onClick={submit}
                      disabled={!prompt.trim()}
                      className="ml-auto grid h-8 w-8 place-items-center rounded-[9px] bg-[#0C8CE9] text-white transition hover:bg-[#087BCF] disabled:opacity-50"
                      aria-label="Generate"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex items-center gap-0">
              {["Service", "Apartment", "Home"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "Service") router.push("/workflow");
                    if (tab === "Apartment") router.push("/archplan");
                  }}
                  className={`rounded-full px-[18px] py-2.5 text-xs transition ${
                    activeTab === tab ? "bg-[#171717] font-semibold text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {inspirations.map(({ title, image, prompt: cardPrompt }) => (
                <button
                  key={title}
                  onClick={() => {
                    setPrompt(cardPrompt);
                    window.sessionStorage.setItem("crystal-design-prompt", cardPrompt);
                    onOpenStudio();
                  }}
                  className="group relative aspect-[1.18] overflow-hidden rounded-[11px] bg-[#181818] text-left"
                >
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                    {title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
