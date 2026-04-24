"use client";
import { AlternusPage, COBALT } from "@/components/alternus-shell";

const press = [
  { by: "TechCrunch",   t: "Alternus raises seed to build the agent-native OS",      d: "Apr 2026" },
  { by: "The Verge",    t: "I replaced my desktop with a browser tab and it worked", d: "Mar 2026" },
  { by: "Hacker News",  t: "Show HN: Alternus OS — an OS that runs on Claude",        d: "Feb 2026" },
  { by: "Wired",        t: "The return of the command line — but this time it talks back", d: "Jan 2026" },
];

const mentioned = ["TechCrunch", "The Verge", "Wired", "Hacker News", "Ars Technica", "Fast Co."];

export default function Press() {
  return (
    <AlternusPage>
      {(t) => (
        <>
          <section style={{ padding: "120px 0 60px", borderBottom: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>PRESS KIT</div>
              <h1 style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: 0, fontStretch: "86%" }}>
                In the <span style={{ color: COBALT, fontStyle: "italic" }}>press.</span>
              </h1>
            </div>
          </section>

          <section style={{ padding: "80px 0 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, color: t.muted, marginBottom: 24, textTransform: "uppercase" }}>As featured in</div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-0" style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                {mentioned.map((m, i, a) => (
                  <div key={m} style={{ padding: "32px 20px", borderRight: i < a.length - 1 ? `1px solid ${t.faint}` : "none", textAlign: "center", background: t.raised }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: t.muted, letterSpacing: "-0.02em" }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "60px 0 120px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, color: t.muted, marginBottom: 24, textTransform: "uppercase" }}>Recent coverage</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {press.map((p, i) => (
                  <a key={p.t} href="#" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 24, alignItems: "baseline", padding: "28px 0", borderTop: i > 0 ? `1px solid ${t.faint}` : `1px solid ${t.faint}`, textDecoration: "none", color: t.fg }} className="group">
                    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", transition: "color 0.15s" }} className="group-hover:!text-[#4284FF]">{p.t}</span>
                    <span style={{ fontSize: 12, color: COBALT, fontFamily: "var(--font-geist-mono),monospace" }}>{p.by}</span>
                    <span style={{ fontSize: 12, color: t.muted }}>{p.d}</span>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: 56, padding: 32, border: `1px solid ${t.faint}`, borderRadius: 12, background: t.surface, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Press inquiries</div>
                  <div style={{ fontSize: 14, color: t.muted }}>Download logos, screenshots, and brand assets.</div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <a href="mailto:press@alternus.ai" style={{ height: 44, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 13.5, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Email press@</a>
                  <a href="#" style={{ height: 44, padding: "0 20px", background: "transparent", color: t.fg, fontSize: 13.5, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", border: `1px solid ${t.faint}` }}>Brand kit .zip</a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </AlternusPage>
  );
}
