"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "AI Agent",
    desc: "A native agent that reads files, drafts emails, opens apps, and runs commands on its own OS.",
    icon: "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.582a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
  },
  {
    title: "Native Mail",
    desc: "A minimalist inbox with compose, threading, labels, and inline reply — all controllable by the agent.",
    icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  },
  {
    title: "Smart Files",
    desc: "Semantic search, drag-and-drop, and an AI assistant that understands your folder structure.",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    title: "Voice Mode",
    desc: "Talk to the OS naturally. Dictate, transcribe, run workflows, or have a conversation.",
    icon: "M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 19v4",
  },
  {
    title: "Code Studio",
    desc: "A full VS Code–style editor with an integrated AI pair-programmer on top of your project.",
    icon: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  },
  {
    title: "Knowledge Base",
    desc: "Build a private, indexed knowledge layer. The agent cites your docs when it answers.",
    icon: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  },
];

const suggestions = [
  "Draft an email to my team about the Q2 launch",
  "Find last month's invoices in Files",
  "Open the Code editor with a new React project",
  "Summarize today's unread mail",
];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToChat = (q?: string) => {
    const text = (q ?? prompt).trim();
    if (text) router.push(`/os?prompt=${encodeURIComponent(text)}`);
    else router.push("/os");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToChat();
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* ─── Nav ─── */}
      <header
        className="sticky top-0 z-40 w-full transition-all"
        style={{
          backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          background: scrolled ? "rgba(255,255,255,0.78)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[58px] flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #111, #333)" }}
            >
              <span className="text-white text-[13px] font-bold">A</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Alternus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 ml-10">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how" },
              { label: "Gallery", href: "/gallery" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="text-[13px] text-neutral-600 hover:text-neutral-950 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center h-9 px-3 rounded-md text-[13px] font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/os"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-neutral-950 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Try in Chat
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* soft gradient wash */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="absolute left-1/2 top-[-280px] -translate-x-1/2 w-[980px] h-[820px] rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(124,58,237,0.14), rgba(124,58,237,0.06) 50%, transparent 72%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute right-[-180px] top-[80px] w-[540px] h-[540px] rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(79,142,247,0.14), transparent 70%)",
              filter: "blur(12px)",
            }}
          />
        </div>

        <div className="max-w-[960px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full mb-6" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-neutral-700">Claude Opus 4.6 · Live</span>
          </div>

          <h1
            className="text-[44px] sm:text-[56px] md:text-[68px] leading-[1.02] font-semibold tracking-tight text-neutral-950"
            style={{ letterSpacing: "-0.035em" }}
          >
            The operating system
            <br />
            <span className="text-neutral-500">that thinks with you.</span>
          </h1>

          <p className="mt-6 text-[15px] md:text-[17px] text-neutral-600 max-w-[640px] mx-auto leading-relaxed">
            Alternus is an AI-native desktop. Ask it in plain language — it drafts emails, opens apps, finds files,
            and runs your workflows across a fully functional OS in your browser.
          </p>

          {/* Prompt input */}
          <form onSubmit={onSubmit} className="mt-10 max-w-[680px] mx-auto">
            <div
              className="flex flex-col bg-white rounded-2xl overflow-hidden transition-shadow"
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 20px 60px -24px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Alternus anything — try 'draft an email to my team'"
                className="w-full px-5 py-4 text-[14.5px] outline-none bg-transparent placeholder:text-neutral-400"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1 text-neutral-400">
                  {[
                    { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", title: "Upload" },
                    { d: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z", title: "Research" },
                    { d: "M16 18l6-6-6-6M8 6l-6 6 6 6", title: "Code" },
                    { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", title: "Chat" },
                  ].map((b, i) => (
                    <button key={i} type="button" title={b.title} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={b.d} />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-neutral-950 text-white text-[12.5px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Try in Chat
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggestion chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => goToChat(s)}
                  className="text-[12px] text-neutral-600 px-3 h-8 rounded-full border border-neutral-200 bg-white hover:border-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {/* Trust line */}
          <div className="mt-10 flex items-center justify-center gap-6 text-[11px] text-neutral-500 tracking-wide uppercase">
            <span>Powered by</span>
            <span className="text-neutral-800 font-semibold normal-case tracking-normal text-[13px]">Claude Opus 4.6</span>
            <span className="w-px h-3 bg-neutral-200" />
            <span className="text-neutral-800 font-semibold normal-case tracking-normal text-[13px]">Next.js 15</span>
            <span className="w-px h-3 bg-neutral-200" />
            <span className="text-neutral-800 font-semibold normal-case tracking-normal text-[13px]">Prisma · PostgreSQL</span>
          </div>
        </div>
      </section>

      {/* ─── OS preview ─── */}
      <section className="relative pb-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <Link
            href="/os"
            className="block group rounded-2xl overflow-hidden relative transition-shadow"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 30px 80px -32px rgba(15,23,42,0.24), 0 2px 8px rgba(15,23,42,0.04)",
            }}
          >
            <div className="flex items-center gap-1.5 px-4 h-9 bg-neutral-50 border-b border-neutral-100">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-4 text-[11px] text-neutral-500">alternus.art/os</span>
              <span className="ml-auto text-[10.5px] text-neutral-400 group-hover:text-neutral-600 transition-colors">
                Click to open →
              </span>
            </div>
            <div
              className="relative h-[420px] md:h-[520px]"
              style={{
                background:
                  "linear-gradient(180deg, #F5F6FA 0%, #EDEFF5 100%)",
              }}
            >
              {/* Fake desktop mock */}
              <div className="absolute inset-6 rounded-xl bg-white border border-neutral-200 shadow-sm flex overflow-hidden">
                <div className="w-[200px] bg-neutral-50 border-r border-neutral-200 p-4 flex flex-col gap-2">
                  <div className="h-6 w-28 bg-neutral-200 rounded" />
                  <div className="h-3 w-20 bg-neutral-200 rounded mt-3" />
                  {["Inbox", "Starred", "Sent", "Drafts", "Archive"].map((f) => (
                    <div key={f} className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-neutral-600">{f}</span>
                      <span className="text-[10px] text-neutral-400">{f === "Inbox" ? "2" : ""}</span>
                    </div>
                  ))}
                </div>
                <div className="w-[280px] border-r border-neutral-200 overflow-hidden">
                  <div className="px-5 h-14 border-b border-neutral-200 flex flex-col justify-center">
                    <span className="text-[14px] font-semibold">Inbox</span>
                    <span className="text-[10px] text-neutral-500">8 messages · 2 unread</span>
                  </div>
                  {[
                    { f: "Sophia Martinez", s: "Q2 Gallery exhibition proposal", u: true },
                    { f: "David Chen", s: "Press feature — interview request", u: true },
                    { f: "Stripe", s: "Receipt from Alternus — $2,400", u: false },
                    { f: "Elena Voss", s: "Re: Commission update", u: false },
                  ].map((e, i) => (
                    <div key={i} className={`px-5 py-3 border-b border-neutral-100 ${e.u ? "" : "opacity-70"}`}>
                      <div className="text-[12px] font-semibold">{e.f}</div>
                      <div className="text-[11.5px] text-neutral-700 truncate">{e.s}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-8">
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Work · Today · 10:42</div>
                  <div className="text-[20px] font-semibold tracking-tight leading-snug">
                    Q2 Gallery exhibition proposal — ready for review
                  </div>
                  <div className="flex items-center gap-3 mt-5 pb-4 border-b border-neutral-200">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-semibold">SM</div>
                    <div>
                      <div className="text-[12px] font-semibold">Sophia Martinez</div>
                      <div className="text-[10.5px] text-neutral-500">sophia@alternus.art · to me</div>
                    </div>
                  </div>
                  <p className="mt-5 text-[12.5px] leading-relaxed text-neutral-800">
                    I've attached the finalized proposal for the Q2 exhibition featuring emerging digital artists. The curator meeting is scheduled for next Tuesday at 2:00 PM.
                  </p>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-800">
                    Please review the attached deck and let me know if you have any questions or concerns.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <button className="h-8 px-4 rounded-md bg-neutral-950 text-white text-[11.5px] font-semibold">Reply</button>
                    <button className="h-8 px-4 rounded-md border border-neutral-200 text-[11.5px] font-medium">Forward</button>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 border-t border-neutral-100">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[620px] mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-3">Built-in capabilities</p>
            <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight leading-[1.08]" style={{ letterSpacing: "-0.025em" }}>
              Every app, one intelligence.
            </h2>
            <p className="mt-4 text-[15px] text-neutral-600 leading-relaxed">
              Mail, Files, Code, Voice, Knowledge — they all share the same agent and memory. Delegate anything, across any app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-white transition-colors"
                style={{ border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(0,0,0,0.04)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[13px] text-neutral-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="py-24 border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="max-w-[620px] mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-3">How it works</p>
            <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight leading-[1.08]" style={{ letterSpacing: "-0.025em" }}>
              Three steps to a smarter desktop.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Describe what you want", d: "Type or speak a goal. The agent plans and confirms before taking action." },
              { n: "02", t: "Agent runs your apps", d: "It opens Mail, Files, Code, Calendar — whatever's needed — and runs the steps." },
              { n: "03", t: "You review & ship", d: "Every change is visible in-app. Approve, tweak, or redo with one command." },
            ].map((s) => (
              <div key={s.n} className="p-6 rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <span className="text-[11px] font-mono font-semibold tabular-nums text-neutral-400">{s.n}</span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[13.5px] text-neutral-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-28 border-t border-neutral-100">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
            Stop clicking.
            <br />
            <span className="text-neutral-500">Start asking.</span>
          </h2>
          <p className="mt-5 text-[15px] text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
            Alternus is free to try. Launch the chat and explore a complete AI-native OS in your browser.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/os"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-neutral-950 text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              Try in Chat
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-neutral-200 text-[14px] font-medium hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-neutral-100 py-12">
        <div className="max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #111, #333)" }}>
              <span className="text-white text-[11px] font-bold">A</span>
            </div>
            <span className="text-[13px] font-semibold tracking-tight">Alternus</span>
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-neutral-600">
            <Link href="/about" className="hover:text-neutral-900">About</Link>
            <Link href="/gallery" className="hover:text-neutral-900">Gallery</Link>
            <Link href="/artists" className="hover:text-neutral-900">Artists</Link>
            <Link href="/pricing" className="hover:text-neutral-900">Pricing</Link>
            <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
            <Link href="/privacy" className="hover:text-neutral-900">Privacy</Link>
            <Link href="/terms" className="hover:text-neutral-900">Terms</Link>
          </nav>
          <span className="md:ml-auto text-[11.5px] text-neutral-400">© {new Date().getFullYear()} Alternus Art Gallery</span>
        </div>
      </footer>
    </div>
  );
}
