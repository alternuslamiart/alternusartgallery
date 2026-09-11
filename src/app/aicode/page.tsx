"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import {
  ArrowLeft, ArrowUp, Bot, Check, ChevronDown, ChevronRight, Code2,
  Copy, FileCode2, Folder, Github, Mic, Play,
  Plus, Search, Settings, Share2, Sparkles,
} from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; content: string };
type FileItem = { name: string; path: string; kind: "file" | "folder"; indent?: number };

const files: FileItem[] = [
  { name: ".bolt", path: ".bolt", kind: "folder" },
  { name: "src", path: "src", kind: "folder" },
  { name: "components", path: "src/components", kind: "folder", indent: 1 },
  { name: "pages", path: "src/pages", kind: "folder", indent: 1 },
  { name: "lib", path: "src/lib", kind: "folder", indent: 1 },
  { name: "api", path: "src/api", kind: "folder", indent: 1 },
  { name: ".gitignore", path: ".gitignore", kind: "file" },
  { name: "package.json", path: "package.json", kind: "file" },
  { name: "next.config.mjs", path: "next.config.mjs", kind: "file" },
  { name: "tailwind.config.ts", path: "tailwind.config.ts", kind: "file" },
  { name: "tsconfig.json", path: "tsconfig.json", kind: "file" },
  { name: "src/app/aichat/page.tsx", path: "src/app/aichat/page.tsx", kind: "file" },
  { name: "src/app/3d-studio/page.tsx", path: "src/app/3d-studio/page.tsx", kind: "file" },
];

const source = `import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function CrystalWorkspace() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/aichat" className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          Crystal
        </Link>
      </header>
    </main>
  );
}`;

function ResizeHandle({ onStart, direction = "horizontal" }: { onStart: (event: React.PointerEvent<HTMLButtonElement>) => void; direction?: "horizontal" | "vertical" }) {
  return <button type="button" aria-label={`Resize ${direction} panel`} onPointerDown={onStart} className={`${direction === "horizontal" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"} shrink-0 bg-[#202228] transition hover:bg-[#3b82f6]`} />;
}

export default function AICodePage() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", content: "I’m ready to help you build Crystal projects. Describe a component, page, or development task to get started." }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeFile, setActiveFile] = useState("src/app/aichat/page.tsx");
  const [code, setCode] = useState(source);
  const [mobileTab, setMobileTab] = useState<"AI" | "Files" | "Code">("Code");
  const [leftWidth, setLeftWidth] = useState(450);
  const [filesWidth, setFilesWidth] = useState(335);
  const resizing = useRef<"left" | "files" | null>(null);

  const startResize = (kind: "left" | "files") => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resizing.current = kind;
    const move = (moveEvent: PointerEvent) => {
      if (resizing.current === "left") setLeftWidth(Math.max(320, Math.min(560, moveEvent.clientX)));
      if (resizing.current === "files") setFilesWidth(Math.max(220, Math.min(460, moveEvent.clientX - leftWidth)));
    };
    const stop = () => { resizing.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt || sending) return;
    const user = { id: Date.now(), role: "user" as const, content: prompt };
    setMessages((current) => [...current, user]);
    setInput("");
    setSending(true);
    try {
      const response = await fetch("/api/ai-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, user].map(({ role, content }) => ({ role, content })) }) });
      const data = (await response.json()) as { message?: string; content?: string; answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "The AI request failed.");
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: data.message || data.content || data.answer || "The AI returned an empty response." }]);
    } catch (error) {
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", content: error instanceof Error ? error.message : "The AI request failed." }]);
    } finally { setSending(false); }
  };

  const panelVisible = (panel: "AI" | "Files" | "Code" | "Terminal") => mobileTab === panel ? "flex" : "hidden md:flex";

  return (
    <main className="flex h-screen min-h-[620px] w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#0b0c0f] font-roboto text-[#e7eaf0]">
      <header className="flex h-[52px] shrink-0 items-center gap-4 border-b border-white/[0.08] bg-[#111216] px-4">
        <Link href="/aichat" aria-label="Back to AI Chat" className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white"><ArrowLeft size={16} /></Link>
        <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#3b82f6] text-white"><Sparkles size={15} /></span>Crystal <span className="text-zinc-500">/</span> <span>AI Code</span></div>
        <nav className="ml-5 hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-[#17191e] p-1 text-xs md:flex">
          <Link href="/aichat" className="rounded-md px-3 py-1.5 text-zinc-500 hover:text-white">Preview</Link>
          <Link href="/workflow" className="rounded-md px-3 py-1.5 text-zinc-500 hover:text-white">Workflow</Link>
          <span className="flex items-center gap-1 rounded-md bg-[#1d3c68] px-3 py-1.5 font-medium text-[#8db8ff]"><Code2 size={13} /> Code</span>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-zinc-400">
          <button className="hidden rounded-md p-2 hover:bg-white/[0.06] hover:text-white md:block" aria-label="GitHub"><Github size={16} /></button>
          <button className="hidden rounded-md p-2 hover:bg-white/[0.06] hover:text-white md:block" aria-label="Settings"><Settings size={16} /></button>
          <button className="rounded-md border border-white/[0.12] px-3 py-1.5 text-xs hover:border-white/30">Share</button>
          <button className="rounded-md bg-[#3188f4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4495f7]">Publish</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className={`${panelVisible("AI")} min-w-0 flex-col border-r border-white/[0.08] bg-[#111216]`} style={{ width: leftWidth }}>
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-5"><div className="flex items-center gap-2 text-xs font-semibold tracking-[-0.01em]"><Bot size={15} className="text-[#6ca5ff]" /> AI Code Assistant</div><button aria-label="New task" className="text-zinc-500 transition hover:text-white"><Plus size={16} /></button></div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => <article key={message.id} className={message.role === "user" ? "rounded-lg bg-[#1b2739] p-3 text-xs text-blue-100" : "text-xs leading-5 text-zinc-300"}><div className="mb-2 flex items-center gap-2 font-semibold text-zinc-400">{message.role === "user" ? "You" : <><Sparkles size={12} className="text-blue-400" /> Crystal</>}</div><p className="whitespace-pre-wrap">{message.content}</p></article>)}
            <div className="rounded-lg border border-white/[0.07] bg-[#15171c] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold"><ChevronRight size={14} className="text-blue-400" /> Plan</div>{["Set up project structure", "Create components", "Configure styling", "Implement responsive layout", "Run build", "Verify errors"].map((item, index) => <div key={item} className="flex items-center gap-2 py-1.5 text-[11px] text-zinc-400">{index < 2 ? <Check size={13} className="text-emerald-400" /> : <span className="h-3 w-3 rounded-full border border-zinc-600" />}{item}</div>)}</div>
          </div>
          <form onSubmit={send} className="m-3 rounded-xl border border-white/[0.1] bg-[#181a20] p-2 focus-within:border-blue-500/60"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={2} placeholder="How can I help you today?" className="w-full resize-none bg-transparent px-2 py-1 text-xs outline-none placeholder:text-zinc-600" /><div className="flex items-center gap-1"><button type="button" aria-label="Add attachment" className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-white/[0.06] hover:text-white"><Plus size={15} /></button><span className="rounded-md bg-[#22252c] px-2 py-1 text-[10px] text-zinc-400">Standard <ChevronDown size={11} className="ml-1 inline" /></span><button type="button" aria-label="Voice input" className="ml-auto p-1.5 text-zinc-500 hover:text-white"><Mic size={14} /></button><button type="submit" aria-label="Send prompt" disabled={!input.trim() || sending} className="grid h-7 w-7 place-items-center rounded-md bg-[#3188f4] text-white disabled:opacity-40"><ArrowUp size={14} /></button></div></form>
        </section>
        <ResizeHandle onStart={startResize("left")} />

        <section className={`${panelVisible("Files")} min-w-0 flex-col border-r border-white/[0.08] bg-[#121316]`} style={{ width: filesWidth }}>
          <div className="flex h-12 shrink-0 items-center gap-4 border-b border-white/[0.08] px-4"><span className="flex items-center gap-2 text-xs font-semibold"><Folder size={14} className="text-blue-400" /> Files</span><button aria-label="Search files" className="text-zinc-500 transition hover:text-white"><Search size={14} /></button></div>
          <div className="min-h-0 flex-1 overflow-y-auto py-2">{files.map((file) => <button type="button" key={file.path} onClick={() => file.kind === "file" && setActiveFile(file.path)} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition hover:bg-white/[0.05] ${activeFile === file.path ? "bg-[#1d3c68] text-white" : "text-zinc-400"}`} style={{ paddingLeft: `${12 + (file.indent ?? 0) * 16}px` }}>{file.kind === "folder" ? <ChevronRight size={13} /> : <FileCode2 size={13} className="text-zinc-500" />}{file.name}</button>)}</div>
        </section>
        <ResizeHandle onStart={startResize("files")} />

        <section className={`${panelVisible("Code")} min-w-0 flex-1 flex-col bg-[#0e0f12]`}>
          <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-3"><div className="flex h-full items-center gap-3 text-xs"><span className="flex h-full items-center gap-2 border-b-2 border-blue-400 text-zinc-200"><FileCode2 size={14} />{activeFile.split("/").pop()}<span className="text-amber-400">●</span></span><button className="text-zinc-600 hover:text-white"><Plus size={14} /></button></div><div className="flex items-center gap-2 text-zinc-500"><button aria-label="Copy code" onClick={() => void navigator.clipboard?.writeText(code)}><Copy size={14} /></button><button aria-label="Run code" className="hover:text-white"><Play size={14} /></button></div></div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto bg-[#0e0f12] p-4 md:grid-cols-2"><div className="group relative min-h-[280px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#151922]"><div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(91,132,190,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(91,132,190,.16) 1px, transparent 1px)", backgroundSize: "28px 28px" }} /><div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-12 transform-gpu rounded-[28%] border border-[#8db8ff]/70 bg-gradient-to-br from-[#5b8bd8]/80 via-[#315384]/80 to-[#17243a] shadow-[0_24px_50px_rgba(47,121,230,.24)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] transition group-hover:scale-105" /><div className="absolute bottom-3 left-3 rounded-md bg-black/30 px-2 py-1 text-[10px] text-zinc-400">3D preview</div></div><div className="min-h-[280px] rounded-xl border border-white/[0.08] bg-[#111216] p-3 font-mono text-[11px] leading-5"><div className="mb-2 flex items-center gap-2 text-zinc-400"><FileCode2 size={13} />{activeFile.split("/").pop()}<span className="text-amber-400">●</span></div><textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="Code editor" className="h-[calc(100%-28px)] min-h-[240px] w-full resize-none bg-transparent text-[#c9d1dc] outline-none" style={{ tabSize: 2 }} /></div></div>
        </section>
      </div>

      <div className="flex border-t border-white/[0.08] bg-[#111216] p-1 md:hidden">{(["AI", "Files", "Code"] as const).map((tab) => <button type="button" key={tab} onClick={() => setMobileTab(tab)} className={`flex-1 rounded-md py-2 text-[11px] ${mobileTab === tab ? "bg-[#1d3c68] text-white" : "text-zinc-500"}`}>{tab}</button>)}</div>
    </main>
  );
}
