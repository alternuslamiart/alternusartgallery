"use client";

import Link from "next/link";
import {
  Archive,
  Box,
  ChevronDown,
  CirclePlus,
  Globe2,
  Grid2X2,
  Home,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type Integration = { name: string; description: string; icon: typeof Box };

const integrations: Integration[] = [
  { name: "Blender 5.2", icon: Box, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "Substance Painter", icon: Layers3, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "AutoCAD", icon: Grid2X2, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "SketchUp", icon: Box, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "Siemens", icon: WorkflowIcon, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "ArchCAD", icon: Home, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "Unreal Engine", icon: Sparkles, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
  { name: "Unity", icon: Box, description: "Lorem ipsum dolor sit amet consectetur. Cras lacinia id est mollis quisque amet faucibus. Auctor sed tortor nascetur urna quis. Habitant feugiat est risus duis aliquam." },
];

const navItems = [
  { label: "Agents", icon: Grid2X2 },
  { label: "Workflows", icon: Globe2 },
  { label: "Plugins", icon: Archive },
  { label: "Architecture", icon: Layers3 },
  { label: "Interior Design...", icon: WorkflowIcon },
  { label: "Urban Planning", icon: Grid2X2 },
  { label: "Community", icon: Globe2 },
  { label: "Archive...", icon: Archive },
];

export default function WorkflowPage() {
  const [activeNav, setActiveNav] = useState("Workflows");
  const [sort, setSort] = useState("featured");
  const [connected, setConnected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  const visibleIntegrations = useMemo(() => {
    const filtered = integrations.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [search, sort]);

  const connect = (name: string) => setConnected((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#2a2a2a] text-[#f5f5f5] font-sans">
      <header className="fixed inset-x-0 top-0 z-30 flex h-[54px] items-center border-b border-white/[0.06] bg-[#151515] px-[28px]">
        <div className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center text-zinc-500"><Sparkles size={21} fill="currentColor" strokeWidth={1.3} /></span>
          <span className="text-[16px] font-semibold">Crystal</span>
          <Link href="/design-studio" className="ml-5 text-zinc-300 transition hover:text-white" aria-label="Home"><Home size={17} strokeWidth={1.7} /></Link>
        </div>
        <nav className="ml-8 flex items-center gap-8 text-[12px] text-[#d0d0d0]" aria-label="Workspace menu">
          {["File", "Edit", "Tools", "Help", "View"].map((item) => <button key={item} type="button" className="transition hover:text-white">{item}</button>)}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <button type="button" className="flex h-[38px] w-[96px] items-center justify-center gap-2 rounded-[10px] bg-[#292929] text-[11px] text-zinc-200 transition hover:bg-[#333]">Starter <span className="text-[#f3c448]">✦</span><span>200</span></button>
          <Link href="/pricing" className="flex h-[38px] w-[114px] items-center justify-center gap-2 rounded-[10px] bg-[#168bef] text-[11px] font-semibold text-white transition hover:bg-[#2a98f3]">✦ Go Pro</Link>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[54px] z-20 w-[272px] rounded-br-[8px] bg-[#202020] p-3">
        <div className="px-3 pt-2 text-[20px] font-semibold">Crystal</div>
        <label className="mt-5 flex h-[34px] items-center gap-2 rounded-[8px] bg-[#292929] px-3 text-[#8d8d8d]">
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-full bg-transparent text-[11px] outline-none placeholder:text-[#8d8d8d]" />
        </label>
        <div className="mt-6 px-2 text-xs font-medium text-[#e8e8e8]">Type</div>
        <nav className="mt-3 space-y-1" aria-label="Integration types">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" onClick={() => setActiveNav(label)} className={`flex h-[34px] w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-xs transition ${activeNav === label ? "bg-[#2b2b2b] text-[#e8e8e8]" : "text-[#c5c5c5] hover:bg-[#292929] hover:text-white"}`}>
              <Icon size={14} strokeWidth={1.5} />{label}
            </button>
          ))}
          <button type="button" onClick={() => setActiveNav("Project")} className={`flex h-[34px] w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-xs transition ${activeNav === "Project" ? "bg-[#2b2b2b] text-white" : "text-[#c5c5c5] hover:bg-[#292929] hover:text-white"}`}><CirclePlus size={14} strokeWidth={1.5} />Project</button>
        </nav>
      </aside>

      <main className="ml-[272px] min-w-0 flex-1 overflow-y-auto bg-[#2a2a2a] px-8 pb-10 pt-[74px] xl:px-[160px]">
        <div className="relative min-h-full">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-semibold leading-[34px]">Workspace</h1>
              <p className="mt-5 text-sm text-[#a8a8a8]">Lorem ipsum dolor sit amet consectetur. Fugiat porta nisl.</p>
            </div>
            <div className="relative mt-2">
              <button type="button" onClick={() => setSortOpen((value) => !value)} aria-expanded={sortOpen} className="flex h-10 w-[174px] items-center justify-between rounded-[10px] bg-[#333333] px-4 text-[11px] text-zinc-100 transition hover:bg-[#383838]">
                <span>Sort by {sort}</span><ChevronDown size={14} />
              </button>
              {sortOpen && <div className="absolute right-0 top-11 z-10 w-[174px] rounded-[10px] bg-[#333333] p-1.5 shadow-xl">
                {["featured", "name"].map((option) => <button key={option} type="button" onClick={() => { setSort(option); setSortOpen(false); }} className="block w-full rounded-[6px] px-3 py-2 text-left text-[11px] text-zinc-200 hover:bg-[#444]">{option}</button>)}
              </div>}
            </div>
          </div>

          <div className="mt-[56px] grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-x-4">
            {visibleIntegrations.map(({ name, description, icon: Icon }) => {
              const isConnected = connected.includes(name);
              return (
                <article key={name} className={`relative flex h-[155px] rounded-[11px] bg-[#252525] p-3.5 transition hover:bg-[#292929] ${name === "Blender 5.2" ? "ring-1 ring-[#168bef] [border:1px_dashed_#168bef]" : ""}`}>
                  <div className="h-[127px] w-[127px] shrink-0 rounded-[7px] bg-[#292929] p-9 text-[#4a4a4a]"><Icon size={48} strokeWidth={1.1} /></div>
                  <div className="min-w-0 flex-1 pl-5 pt-1">
                    <h2 className="text-[14px] font-semibold text-[#f0f0f0]">{name}</h2>
                    <p className="mt-5 max-w-[330px] text-[11px] leading-[14px] text-[#a3a3a3]">{description}</p>
                    <button type="button" onClick={() => connect(name)} className={`absolute bottom-4 right-5 h-8 w-[78px] rounded-[6px] text-[11px] font-medium transition ${isConnected ? "bg-[#168bef] text-white" : "bg-[#383838] text-[#dadada] hover:bg-[#444] hover:text-white"}`}>{isConnected ? "Connected" : "Connect"}</button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-14 flex items-end justify-between gap-8">
            <p className="max-w-[950px] text-[10px] leading-[14px] text-[#8c8c8c]">Lorem ipsum dolor sit amet consectetur. Malesuada ultricies nunc ornare viverra est eget vitae iaculis. Id vel adipiscing nulla et amet lacus convallis mattis sit.<br />Erat nec tempus amet viverra sed ac vitae placerat. Euismod risus nunc commodo porttitor egestas dui amet et egestas at amet. Sed tellus mattis maecenas est felis.</p>
            <Link href="/archplan" className="flex h-[35px] w-[111px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#168bef] text-[11px] font-medium text-white transition hover:bg-[#2a98f3]">New Project <Plus size={14} /></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
