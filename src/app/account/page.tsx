"use client";

import Link from "next/link";
import { useState } from "react";
import {
 CoreforgeLogo,
 DARK_BG,
 DARK_BORDER,
 DARK_BORDER_SOFT,
 DARK_MUTED,
 DARK_SURFACE,
 DARK_SURFACE_SOFT,
 DARK_TEXT,
 useCoreforgeMode,
} from "@/components/cedium-shell";

const COBALT = "#4284FF";
const INK = "#1F1F1F";
const PAPER = "#F4F6FB";

type SectionId =
 | "organization" | "access" | "members"
 | "subscriptions" | "billing"
 | "chat" | "api-keys" | "usage" | "limits" | "workspaces" | "privacy";

const nav: { heading: string; items: { id: SectionId; label: string }[] }[] = [
 { heading: "Administration", items: [
 { id: "organization", label: "Organization" },
 { id: "access", label: "Access" },
 { id: "members", label: "Members" },
 ]},
 { heading: "Subscriptions", items: [
 { id: "subscriptions", label: "Subscriptions" },
 { id: "billing", label: "Billing" },
 ]},
 { heading: "Manage", items: [
 { id: "chat", label: "Chat" },
 { id: "api-keys", label: "API Keys" },
 { id: "usage", label: "Usage" },
 { id: "limits", label: "Limits" },
 { id: "workspaces", label: "Workspaces" },
 { id: "privacy", label: "Privacy" },
 ]},
];

export default function Account() {
 const [isDark, setIsDark] = useCoreforgeMode();
 const [active, setActive] = useState<SectionId>("usage");

 const bg = isDark ? DARK_BG : PAPER;
 const fg = isDark ? DARK_TEXT : INK;
 const muted = isDark ? DARK_MUTED : "rgba(5,8,15,0.62)";
 const faint = isDark ? DARK_BORDER_SOFT : "rgba(5,8,15,0.08)";
 const faintBorder = isDark ? DARK_BORDER : "rgba(5,8,15,0.05)";
 const raised = isDark ? DARK_SURFACE : "#FFFFFF";
 const softFill = isDark ? DARK_SURFACE_SOFT : "#F5F7FB";

 const cardShadow = isDark ? "none" : "0 1px 4px rgba(5,8,15,0.04)";
 const baseCard: React.CSSProperties = { background: raised, border: `1px solid ${faintBorder}`, borderRadius: 12, boxShadow: cardShadow };

 return (
 <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>

 {/* Slim top bar */}
 <header style={{ padding: "16px 24px", borderBottom: `1px solid ${faintBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: raised }}>
 <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
 <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
 <CoreforgeLogo size={26} radius={7} />
 <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: fg, fontStretch: "90%" }}>Crystal Studio</span>
 <span style={{ fontSize: 10, fontWeight: 600, color: muted, padding: "2px 6px", border: `1px solid ${faintBorder}`, borderRadius: 4, letterSpacing: "0.08em" }}>ACCOUNT</span>
 </Link>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <button onClick={() => setIsDark(!isDark)} style={{ width: 32, height: 32, border: `1px solid ${faintBorder}`, background: isDark ? softFill : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, borderRadius: 8 }}>
 {isDark
 ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
 : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
 }
 </button>
 <Link href="/ai-assistant" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", background: COBALT, color: "#FFF", fontSize: 12.5, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", borderRadius: 8 }}>
 Launch Studio <span style={{ fontSize: 10, opacity: 0.8 }}>↗</span>
 </Link>
 <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>AL</div>
 </div>
 </header>

 <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 0 }}>

 {/* ── Sidebar ── */}
 <aside style={{ borderRight: `1px solid ${faintBorder}`, padding: "28px 20px", overflowY: "auto" }}>
 {/* User identity card */}
 <div style={{ ...baseCard, padding: "14px 14px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>AL</div>
 <div style={{ minWidth: 0, flex: 1 }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: fg, letterSpacing: "-0.01em" }}>Crystal Studio User</div>
 <div style={{ fontSize: 11, color: muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>you@alternusart.com</div>
 </div>
 </div>

 {nav.map((group) => (
 <div key={group.heading} style={{ marginBottom: 22 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", marginBottom: 8 }}>
 <span style={{ width: 8, height: 8, background: COBALT, borderRadius: 2 }} />
 <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: COBALT, textTransform: "uppercase" }}>{group.heading}</span>
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
 {group.items.map((item) => {
 const isActive = active === item.id;
 return (
 <button key={item.id} onClick={() => setActive(item.id)} style={{
 padding: "8px 12px",
 fontSize: 13.5,
 fontWeight: isActive ? 700 : 500,
 color: isActive ? fg : muted,
 background: isActive ? softFill : "transparent",
 border: "none",
 borderRadius: 8,
 textAlign: "left",
 cursor: "pointer",
 letterSpacing: "-0.01em",
 }}>
 {item.label}
 </button>
 );
 })}
 </div>
 </div>
 ))}
 </aside>

 {/* ── Main ── */}
 <main style={{ overflowY: "auto", padding: "36px 48px 80px" }}>
 <Section id={active} t={{ fg, muted, faint, faintBorder, raised, softFill, baseCard, cardShadow }} />
 </main>
 </div>
 </div>
 );
}

type Tokens = {
 fg: string; muted: string; faint: string; faintBorder: string; raised: string; softFill: string;
 baseCard: React.CSSProperties; cardShadow: string;
};

function SectionHeading({ eyebrow, title, desc, t }: { eyebrow: string; title: string; desc: string; t: Tokens }) {
 return (
 <div style={{ marginBottom: 32, maxWidth: 820 }}>
 <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: COBALT, marginBottom: 10 }}>{eyebrow}</div>
 <h1 style={{ fontSize: "clamp(32px,3.6vw,44px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 10, fontStretch: "90%", color: t.fg }}>{title}</h1>
 <p style={{ fontSize: 14.5, color: t.muted, margin: 0, lineHeight: 1.55, maxWidth: 640 }}>{desc}</p>
 </div>
 );
}

function Field({ label, value, placeholder, t }: { label: string; value?: string; placeholder?: string; t: Tokens }) {
 return (
 <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
 <span style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
 <input defaultValue={value} placeholder={placeholder} style={{ height: 42, padding: "0 14px", border: `1px solid ${t.faintBorder}`, borderRadius: 8, background: t.softFill, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit", letterSpacing: "-0.01em" }} />
 </label>
 );
}

function Section({ id, t }: { id: SectionId; t: Tokens }) {
 switch (id) {
 case "organization": return <Organization t={t} />;
 case "access": return <Access t={t} />;
 case "members": return <Members t={t} />;
 case "subscriptions": return <Subscriptions t={t} />;
 case "billing": return <Billing t={t} />;
 case "chat": return <ChatSection t={t} />;
 case "api-keys": return <APIKeys t={t} />;
 case "usage": return <Usage t={t} />;
 case "limits": return <Limits t={t} />;
 case "workspaces": return <Workspaces t={t} />;
 case "privacy": return <Privacy t={t} />;
 }
}

/* ─────────── Panels ─────────── */

function Organization({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ ORGANIZATION" title="Your organization." desc="Public name, logo, and domain that everyone in your workspace sees." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 720 }}>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
 <Field label="Organization name" value="Crystal Studio" t={t} />
 <Field label="Primary domain" value="alternusart.com" t={t} />
 <Field label="Billing email" value="billing@alternusart.com" t={t} />
 <Field label="Country" value="Albania" t={t} />
 </div>
 <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.faintBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
 <div style={{ fontSize: 12, color: t.muted }}>Last updated · 2 days ago</div>
 <button style={{ height: 40, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>Save changes</button>
 </div>
 </div>
 </>
 );
}

function Access({ t }: { t: Tokens }) {
 const rows = [
 { role: "Owner", can: ["manage org", "billing", "invite", "delete"], count: 1 },
 { role: "Admin", can: ["manage workspaces", "invite", "view billing"], count: 2 },
 { role: "Member", can: ["use workspace", "create tasks"], count: 12 },
 { role: "Guest", can: ["view-only"], count: 4 },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ ACCESS" title="Roles and permissions." desc="Who can do what inside your organization." t={t} />
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {rows.map((r, i) => (
 <div key={r.role} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px", gap: 16, padding: "20px 24px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.015em" }}>{r.role}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{r.count} seat{r.count === 1 ? "" : "s"}</div>
 </div>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
 {r.can.map((c) => (
 <span key={c} style={{ fontSize: 11, color: COBALT, background: `${COBALT}10`, padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>{c}</span>
 ))}
 </div>
 <button style={{ fontSize: 12, fontWeight: 700, color: t.muted, background: "transparent", border: `1px solid ${t.faintBorder}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Edit</button>
 </div>
 ))}
 </div>
 </>
 );
}

function Members({ t }: { t: Tokens }) {
 const people = [
 { n: "Crystal Studio User", e: "you@alternusart.com", r: "Owner", c: "AL" },
 { n: "Maya Ibrahim", e: "maya@alternusart.com", r: "Admin", c: "MI" },
 { n: "Luca Ferrari", e: "luca@alternusart.com", r: "Member", c: "LF" },
 { n: "Priya Sharma", e: "priya@alternusart.com", r: "Member", c: "PS" },
 { n: "David Chen", e: "david@alternusart.com", r: "Guest", c: "DC" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ MEMBERS" title="Team members." desc="Invite your team, assign roles, and manage seat usage." t={t} />
 <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
 <input placeholder="Add by email…" style={{ flex: 1, maxWidth: 420, height: 42, padding: "0 14px", border: `1px solid ${t.faintBorder}`, borderRadius: 8, background: t.softFill, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
 <button style={{ height: 42, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>+ Invite</button>
 </div>
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {people.map((p, i) => (
 <div key={p.e} style={{ display: "grid", gridTemplateColumns: "auto 1fr 120px 80px", gap: 16, padding: "16px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{p.c}</div>
 <div style={{ minWidth: 0 }}>
 <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{p.n}</div>
 <div style={{ fontSize: 11.5, color: t.muted }}>{p.e}</div>
 </div>
 <div style={{ fontSize: 11.5, fontWeight: 700, color: t.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.r}</div>
 <button style={{ fontSize: 12, fontWeight: 600, color: t.muted, background: "transparent", border: "none", cursor: "pointer", justifySelf: "end" }}>⋯</button>
 </div>
 ))}
 </div>
 </>
 );
}

function Subscriptions({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ SUBSCRIPTIONS" title="Current plan." desc="Your active plan, renewal date, and options to upgrade." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820, borderLeft: `3px solid ${COBALT}` }}>
 <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
 <div>
 <div style={{ fontSize: 10, fontWeight: 800, color: COBALT, letterSpacing: "0.16em", marginBottom: 6 }}>ACTIVE</div>
 <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", fontStretch: "88%" }}>Pro · Yearly</div>
 <div style={{ fontSize: 13.5, color: t.muted, marginTop: 4 }}>Renews 2027-04-24 · $228 / year</div>
 </div>
 <div style={{ display: "flex", gap: 10 }}>
 <Link href="/pricing" style={{ height: 40, padding: "0 18px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Change plan</Link>
 <button style={{ height: 40, padding: "0 18px", background: "transparent", color: t.fg, fontSize: 13, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faintBorder}`, cursor: "pointer" }}>Cancel</button>
 </div>
 </div>
 <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.faintBorder}`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
 {[["Unlimited", "agent runs"], ["Claude Opus 4.6", "default model"], ["100 GB", "knowledge layer"]].map(([v, l]) => (
 <div key={l as string}>
 <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{v}</div>
 <div style={{ fontSize: 10.5, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
 </div>
 ))}
 </div>
 </div>
 </>
 );
}

function Billing({ t }: { t: Tokens }) {
 const invoices = [
 { id: "INV-2027-0422", d: "2026-04-24", amt: "$228.00", s: "Paid" },
 { id: "INV-2026-0419", d: "2025-04-24", amt: "$228.00", s: "Paid" },
 { id: "INV-2025-0416", d: "2024-04-24", amt: "$192.00", s: "Paid" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ BILLING" title="Billing." desc="Manage your payment method, billing address, and download invoices." t={t} />

 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 820, marginBottom: 28 }}>
 <div style={{ ...t.baseCard, padding: 22 }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Payment method</div>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ width: 44, height: 30, borderRadius: 6, background: `linear-gradient(135deg,${COBALT},#7DA9FF)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>VISA</div>
 <div>
 <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-geist-mono),monospace" }}>•••• 4242</div>
 <div style={{ fontSize: 11, color: t.muted }}>Expires 08/29</div>
 </div>
 </div>
 <button style={{ marginTop: 18, fontSize: 12.5, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Update payment method →</button>
 </div>
 <div style={{ ...t.baseCard, padding: 22 }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Billing address</div>
 <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
 Crystal Studio by Alternus Art<br/>
 Rr. e Kavajës, Tirana 1001<br/>
 Albania
 </div>
 <button style={{ marginTop: 18, fontSize: 12.5, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Edit address →</button>
 </div>
 </div>

 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 <div style={{ padding: "14px 22px", borderBottom: `1px solid ${t.faintBorder}`, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 90px 80px", gap: 12, fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", background: t.softFill }}>
 <span>Invoice</span><span>Date</span><span>Amount</span><span>Status</span><span></span>
 </div>
 {invoices.map((inv, i) => (
 <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 90px 80px", gap: 12, padding: "16px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <span style={{ fontSize: 12.5, fontFamily: "var(--font-geist-mono),monospace", color: t.fg }}>{inv.id}</span>
 <span style={{ fontSize: 12.5, color: t.muted }}>{inv.d}</span>
 <span style={{ fontSize: 13, fontWeight: 700 }}>{inv.amt}</span>
 <span style={{ fontSize: 10.5, fontWeight: 800, color: "#22C55E", background: "rgba(34,197,94,0.1)", padding: "3px 10px", borderRadius: 999, justifySelf: "start", letterSpacing: "0.06em" }}>{inv.s.toUpperCase()}</span>
 <button style={{ fontSize: 12, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", justifySelf: "end" }}>PDF ↓</button>
 </div>
 ))}
 </div>
 </>
 );
}

function ChatSection({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ CHAT" title="Chat preferences." desc="Tune the default model, tone, and memory used by the agent in your workspaces." t={t} />

 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820, marginBottom: 20 }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 16 }}>Default model</div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
 {[
 { id: "opus", n: "Claude Opus 4.6", d: "Default · most capable", active: true },
 { id: "sonnet", n: "Claude Sonnet 4.6", d: "Balanced latency + cost", active: false },
 { id: "haiku", n: "Claude Haiku 4.5", d: "Fastest · cheapest", active: false },
 ].map((m) => (
 <div key={m.id} style={{ padding: 16, border: `1px solid ${m.active ? COBALT : t.faintBorder}`, borderRadius: 10, background: m.active ? `${COBALT}08` : "transparent", cursor: "pointer" }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>{m.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{m.d}</div>
 {m.active && <div style={{ marginTop: 10, fontSize: 10, fontWeight: 800, color: COBALT, letterSpacing: "0.12em" }}>✓ ACTIVE</div>}
 </div>
 ))}
 </div>
 </div>

 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 16 }}>Memory across sessions</div>
 <Toggle label="Remember context across sessions" desc="The agent keeps a summary of past conversations for personalization." on t={t} />
 <Toggle label="Cite sources from your files" desc="When answering, link to the file and line the answer was pulled from." on t={t} />
 <Toggle label="Show reasoning steps" desc="Expose intermediate tool calls while the agent is thinking." on={false} t={t} />
 </div>
 </>
 );
}

function APIKeys({ t }: { t: Tokens }) {
 const keys = [
 { n: "Production", p: "sk-alt_live_•••••2k9f", c: "2026-01-12", last: "2h ago" },
 { n: "CI · Vercel", p: "sk-alt_live_•••••mc41", c: "2026-03-08", last: "yesterday" },
 { n: "Local dev", p: "sk-alt_test_•••••a0b3", c: "2026-04-20", last: "today" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ API KEYS" title="API keys." desc="Keys the agent runtime will accept. Rotate often, never commit them." t={t} />
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, maxWidth: 820 }}>
 <div style={{ fontSize: 12.5, color: t.muted }}>{keys.length} keys · 2 live / 1 test</div>
 <button style={{ height: 40, padding: "0 18px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>+ Create key</button>
 </div>
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {keys.map((k, i) => (
 <div key={k.p} style={{ display: "grid", gridTemplateColumns: "200px 1fr auto auto", gap: 16, padding: "18px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{k.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>Created {k.c}</div>
 </div>
 <code style={{ fontSize: 12, fontFamily: "var(--font-geist-mono),monospace", color: t.muted, background: t.softFill, padding: "6px 10px", borderRadius: 6, justifySelf: "start" }}>{k.p}</code>
 <span style={{ fontSize: 11.5, color: t.muted }}>Used {k.last}</span>
 <button style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "transparent", border: "none", cursor: "pointer" }}>Revoke</button>
 </div>
 ))}
 </div>
 </>
 );
}

function Usage({ t }: { t: Tokens }) {
 const bars = [42, 68, 55, 88, 74, 92, 61, 72, 80, 95, 67, 58, 77, 89, 93];
 return (
 <>
 <SectionHeading eyebrow="§ USAGE" title="Usage this period." desc="Agent runs, knowledge indexing, and voice minutes used since 2026-04-01." t={t} />

 {/* Stat triplet */}
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, maxWidth: 820, marginBottom: 20 }}>
 {[
 { v: "3,482", l: "Agent runs", pct: 34, max: "of unlimited", consumed: "Unlimited", remaining: "No cap" },
 { v: "42.8 GB", l: "Knowledge", pct: 43, max: "of 100 GB", consumed: "42.8%", remaining: "57.2 GB left" },
 { v: "12.4 h", l: "Voice minutes", pct: 21, max: "of 60 h", consumed: "20.7%", remaining: "47.6 h left" },
 ].map((s) => (
 <div key={s.l} style={{ ...t.baseCard, padding: "20px 22px" }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{s.l}</div>
 <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.035em", fontStretch: "88%", color: t.fg }}>{s.v}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{s.max}</div>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
 <div>
 <div style={{ fontSize: 9, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Consumed</div>
 <div style={{ fontSize: 13, fontWeight: 800, color: COBALT, marginTop: 3 }}>{s.consumed}</div>
 </div>
 <div>
 <div style={{ fontSize: 9, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Remaining</div>
 <div style={{ fontSize: 13, fontWeight: 800, color: t.fg, marginTop: 3 }}>{s.remaining}</div>
 </div>
 </div>
 <div style={{ marginTop: 14, height: 4, background: t.softFill, borderRadius: 2, overflow: "hidden" }}>
 <div style={{ width: `${s.pct}%`, height: "100%", background: COBALT, borderRadius: 2 }} />
 </div>
 </div>
 ))}
 </div>

 {/* Chart card */}
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
 <div>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>Agent runs · last 15 days</div>
 <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>Peak 95 runs/day · avg 74</div>
 </div>
 <div style={{ display: "flex", gap: 6 }}>
 {["7d", "15d", "30d", "90d"].map((r, i) => (
 <button key={r} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: i === 1 ? COBALT : "transparent", color: i === 1 ? "#fff" : t.muted, border: i === 1 ? "none" : `1px solid ${t.faintBorder}`, borderRadius: 6, cursor: "pointer" }}>{r}</button>
 ))}
 </div>
 </div>
 <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingTop: 20 }}>
 {bars.map((h, i) => (
 <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
 <div style={{ width: "100%", height: `${h}%`, background: COBALT, opacity: 0.15 + (h / 100) * 0.85, borderRadius: "4px 4px 0 0" }} />
 <span style={{ fontSize: 9, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>{10 + i}</span>
 </div>
 ))}
 </div>
 </div>
 </>
 );
}

function Limits({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ LIMITS" title="Rate limits." desc="Hard caps to prevent runaway usage. Warnings trigger before the cap is hit." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 {[
 { l: "Requests per minute", v: "600", max: "max 1,200" },
 { l: "Agent runs per day", v: "∞", max: "unlimited on Pro" },
 { l: "Knowledge upload", v: "100 MB", max: "per file" },
 { l: "Voice minutes per day", v: "120", max: "of 60h / month" },
 ].map((r, i) => (
 <div key={r.l} style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 16, padding: "18px 0", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{r.l}</div>
 <div style={{ fontSize: 18, fontWeight: 900, color: COBALT, letterSpacing: "-0.02em", fontStretch: "88%" }}>{r.v}</div>
 <div style={{ fontSize: 11.5, color: t.muted }}>{r.max}</div>
 </div>
 ))}
 </div>
 </>
 );
}

function Workspaces({ t }: { t: Tokens }) {
 const list = [
 { n: "Personal", m: 1, s: "Pro", u: "today" },
 { n: "Design team", m: 6, s: "Team", u: "2h ago" },
 { n: "Research", m: 3, s: "Team", u: "yesterday" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ WORKSPACES" title="Your workspaces." desc="Each workspace has its own knowledge layer, members, and billing line." t={t} />
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, maxWidth: 820 }}>
 {list.map((w) => (
 <div key={w.n} style={{ ...t.baseCard, padding: 20 }}>
 <div style={{ width: 32, height: 32, borderRadius: 8, background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>{w.n[0]}</div>
 <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>{w.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{w.m} member{w.m === 1 ? "" : "s"} · {w.s}</div>
 <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${t.faintBorder}`, fontSize: 11, color: t.muted }}>Active {w.u}</div>
 </div>
 ))}
 <button style={{ ...t.baseCard, padding: 20, border: `1px dashed ${t.faint}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", cursor: "pointer", minHeight: 140, color: t.muted }}>
 <span style={{ fontSize: 20, color: COBALT }}>+</span>
 <span style={{ fontSize: 12, fontWeight: 600 }}>New workspace</span>
 </button>
 </div>
 </>
 );
}

function Privacy({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ PRIVACY" title="Privacy controls." desc="Decide what the agent remembers, what it logs, and who can see what." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <Toggle label="Allow product improvements" desc="Share anonymized usage events to help us improve the product. No workspace content is ever shared." on t={t} />
 <Toggle label="Persist agent memory" desc="Let the agent keep a summary of past sessions so it doesn't re-ask you." on t={t} />
 <Toggle label="Record voice sessions" desc="Keep audio recordings of voice-mode sessions for later playback." on={false} t={t} />
 <Toggle label="Third-party integrations" desc="Allow connected apps (Slack, GitHub, Linear) to read your knowledge layer." on t={t} />
 </div>

 <div style={{ marginTop: 20, padding: 20, border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, background: "rgba(239,68,68,0.04)", maxWidth: 820, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
 <div>
 <div style={{ fontSize: 13.5, fontWeight: 800, color: "#EF4444", letterSpacing: "-0.01em" }}>Delete account</div>
 <div style={{ fontSize: 12, color: t.muted, marginTop: 4, maxWidth: 500 }}>
 Deletes your workspace, knowledge layer, and all memory. Cannot be undone.
 </div>
 </div>
 <button style={{ height: 38, padding: "0 18px", background: "transparent", color: "#EF4444", fontSize: 12.5, fontWeight: 700, border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>Delete account</button>
 </div>
 </>
 );
}

function Toggle({ label, desc, on, t }: { label: string; desc: string; on: boolean; t: Tokens }) {
 const [state, setState] = useState(on);
 return (
 <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "16px 0", borderTop: `1px solid ${t.faintBorder}`, alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{label}</div>
 <div style={{ fontSize: 12, color: t.muted, marginTop: 4, lineHeight: 1.5, maxWidth: 560 }}>{desc}</div>
 </div>
 <button onClick={() => setState(!state)} style={{ width: 44, height: 24, borderRadius: 999, border: "none", background: state ? COBALT : t.faint, cursor: "pointer", position: "relative" }}>
 <span style={{ position: "absolute", top: 3, left: state ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
 </button>
 </div>
 );
}
