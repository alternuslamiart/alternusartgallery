"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const endpoints = [
 { m: "POST", p: "/v1/agents", d: "Create an agent with a model and tool set." },
 { m: "POST", p: "/v1/agents/:id/run", d: "Execute a goal. Returns a streaming event log." },
 { m: "GET", p: "/v1/agents/:id/memory", d: "Read the agent's checkpointed memory." },
 { m: "POST", p: "/v1/files", d: "Upload a file to the shared knowledge layer." },
 { m: "GET", p: "/v1/files/search", d: "Semantic search across indexed files." },
 { m: "POST", p: "/v1/voice/transcribe", d: "Transcribe an audio stream in real time." },
 { m: "POST", p: "/v1/code/complete", d: "Streaming completions with project context." },
 { m: "GET", p: "/v1/usage", d: "Per-workspace usage and billing stats." },
];

const methodColor: Record<string, string> = {
 GET: "#22C55E",
 POST: COBALT,
 DELETE: "#F87171",
 PATCH: "#F59E0B",
};

export default function APIPage() {
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section style={{ padding: "80px 0 40px", borderBottom: `1px solid ${t.faint}` }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>REST / v1</div>
 <h1 style={{ fontSize: "clamp(40px,6vw,88px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "88%" }}>
 API reference.
 </h1>
 <p style={{ marginTop: 24, fontSize: 16, color: t.muted, maxWidth: 620, lineHeight: 1.55 }}>
 Typed OpenAPI 3.1 specification. Server-sent events for streaming. HMAC-signed webhooks.
 </p>
 <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 12px", border: `1px solid ${t.faint}`, borderRadius: 8, fontFamily: "var(--font-geist-mono),monospace", fontSize: 12, color: t.fg }}>
 <span style={{ color: COBALT, fontWeight: 700 }}>BASE</span>
 https://api.alternusart.com/crystal/v1
 </div>
 </div>
 </section>

 <section style={{ padding: "60px 0 120px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 2fr", padding: "14px 24px", borderBottom: `1px solid ${t.faint}`, background: t.surface, fontSize: 10, color: t.muted, letterSpacing: "0.12em", fontWeight: 700 }}>
 <span>METHOD</span><span>PATH</span><span>DESCRIPTION</span>
 </div>
 {endpoints.map((e, i) => (
 <div key={e.p} style={{ display: "grid", gridTemplateColumns: "90px 1fr 2fr", alignItems: "center", padding: "18px 24px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none", cursor: "pointer", transition: "background 0.15s" }} className="hover:bg-[#4284FF]/5">
 <span style={{ fontSize: 10, fontWeight: 800, color: methodColor[e.m], fontFamily: "var(--font-geist-mono),monospace", letterSpacing: "0.08em" }}>{e.m}</span>
 <code style={{ fontSize: 13, fontFamily: "var(--font-geist-mono),monospace", color: t.fg }}>{e.p}</code>
 <span style={{ fontSize: 13, color: t.muted }}>{e.d}</span>
 </div>
 ))}
 </div>
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
