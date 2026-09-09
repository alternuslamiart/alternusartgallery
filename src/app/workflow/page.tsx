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
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UnifiedSidebar } from "@/components/unified-sidebar";

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
  { label: "Agents", icon: Grid2X2, href: "/crystal" },
  { label: "Workflows", icon: Globe2, href: "/workflow" },
  { label: "Plugins", icon: Archive, href: "/crystal" },
  { label: "Architecture", icon: Layers3, href: "/archplan" },
  { label: "Interior Design...", icon: WorkflowIcon, href: "/design-studio" },
  { label: "Urban Planning", icon: Grid2X2, href: "/archplan" },
  { label: "Community", icon: Globe2, href: "/workflow" },
  { label: "Archive...", icon: Archive, href: "/workflow" },
];

export default function WorkflowPage() {
  const [activeNav, setActiveNav] = useState("Workflows");
  const [sort, setSort] = useState("featured");
  const [connected, setConnected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<"Idle" | "Draft" | "Saved" | "Running" | "Completed">("Idle");
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedConnections = window.localStorage.getItem("crystal-workflow-connections");
    const storedWorkflow = window.localStorage.getItem("crystal-workflow-draft");
    if (storedConnections) setConnected(JSON.parse(storedConnections) as string[]);
    if (storedWorkflow) {
      const draft = JSON.parse(storedWorkflow) as { steps?: string[]; status?: typeof workflowStatus };
      setWorkflowSteps(draft.steps ?? []);
      setWorkflowStatus(draft.status === "Saved" ? "Saved" : "Draft");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("crystal-workflow-connections", JSON.stringify(connected));
  }, [connected]);

  const visibleIntegrations = useMemo(() => {
    const filtered = integrations.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [search, sort]);

  const connect = (name: string) => setConnected((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  const startWorkflow = () => {
    const nextSteps = workflowSteps.length ? workflowSteps : ["Connect integration", "Configure output", "Run workflow"];
    setWorkflowSteps(nextSteps);
    setWorkflowStatus("Draft");
    window.localStorage.setItem("crystal-workflow-draft", JSON.stringify({ steps: nextSteps, status: "Draft" }));
  };
  const saveWorkflow = () => {
    setWorkflowStatus("Saved");
    window.localStorage.setItem("crystal-workflow-draft", JSON.stringify({ steps: workflowSteps, status: "Saved" }));
  };
  const runWorkflow = () => {
    setWorkflowStatus("Running");
    window.setTimeout(() => setWorkflowStatus("Completed"), 700);
  };

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

      <div className="fixed bottom-0 left-0 top-[54px] z-20 hidden p-2 lg:block">
        <UnifiedSidebar
          activePath="/workflow"
          items={[...navItems.map((item) => ({ ...item, onClick: () => setActiveNav(item.label) })), { label: "New Workflow", icon: CirclePlus, href: "/workflow", onClick: startWorkflow }]}
          sectionTitle="Type"
          searchValue={search}
          onSearch={setSearch}
          className="h-full"
        />
      </div>

      <main className="ml-[250px] min-w-0 flex-1 overflow-y-auto bg-[#2a2a2a] px-8 pb-10 pt-[74px] xl:px-[160px]">
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

          <div className="mt-8 flex items-end justify-between gap-8">
            <p className="max-w-[950px] text-[10px] leading-[14px] text-[#8c8c8c]">Lorem ipsum dolor sit amet consectetur. Malesuada ultricies nunc ornare viverra est eget vitae iaculis. Id vel adipiscing nulla et amet lacus convallis mattis sit.<br />Erat nec tempus amet viverra sed ac vitae placerat. Euismod risus nunc commodo porttitor egestas dui amet et egestas at amet. Sed tellus mattis maecenas est felis.</p>
            <div className="flex shrink-0 items-center gap-2">
              {workflowSteps.length > 0 && <span className="text-[10px] text-[#a8a8a8]">{workflowStatus}</span>}
              {workflowSteps.length > 0 && <button type="button" onClick={saveWorkflow} className="h-[35px] rounded-[10px] bg-[#333] px-3 text-[11px] hover:bg-[#3a3a3a]">Save</button>}
              {workflowSteps.length > 0 && <button type="button" onClick={runWorkflow} disabled={workflowStatus === "Running"} className="h-[35px] rounded-[10px] bg-[#168bef] px-3 text-[11px] disabled:opacity-50">{workflowStatus === "Running" ? "Running..." : "Run"}</button>}
              <Link href="/archplan" className="flex h-[35px] w-[111px] items-center justify-center gap-2 rounded-[10px] bg-[#168bef] text-[11px] font-medium text-white transition hover:bg-[#2a98f3]">New Project <Plus size={14} /></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
