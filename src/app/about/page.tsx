"use client";
import Link from "next/link";
import { CediumPage, COBALT } from "@/components/Cedium-shell";

export default function About() {
  return (
    <CediumPage>
      {(t) => (
        <>
          <section style={{ padding: "120px 0 80px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>ABOUT</div>
              <h1 style={{ fontSize: "clamp(48px,8vw,128px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.88, margin: 0, fontStretch: "82%" }}>
                We&apos;re rebuilding the desktop —<br/>
                <span style={{ color: COBALT, fontStyle: "italic" }}>from scratch.</span>
              </h1>
            </div>
          </section>

          <section style={{ padding: "40px 0 120px", borderTop: `1px solid ${t.faint}` }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 0" }}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: t.muted, position: "sticky", top: 100 }}>§ ORIGIN</div>
                </div>
                <div className="md:col-span-8" style={{ fontSize: 18, lineHeight: 1.75, color: t.fg, fontWeight: 400 }}>
                  <p>Cedium was started in 2024 by a small team who were tired of desktops that hadn&apos;t really changed since 1984. Windows. Menus. Files. Folders. A metaphor from an era before the modern agent even existed.</p>
                  <p style={{ marginTop: 24 }}>We started from a simpler question — <em style={{ color: COBALT, fontStyle: "italic" }}>what if the OS were an agent?</em> An operating system that listens, reads, writes, remembers — and that you can talk to in the same way you talk to a colleague.</p>
                </div>
              </div>

              <div style={{ height: 1, background: t.faint, margin: "80px 0" }} />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: t.muted, position: "sticky", top: 100 }}>§ TODAY</div>
                </div>
                <div className="md:col-span-8" style={{ fontSize: 18, lineHeight: 1.75, color: t.fg }}>
                  <p>Today Cedium is a browser-native OS used by over 10,000 people. It runs Claude Opus 4.6. It ships new features every week. It has one goal: make the computer work for you.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6" style={{ marginTop: 80 }}>
                {[["2024", "founded"], ["10k+", "active users"], ["Opus 4.6", "agent model"]].map(([v, l]) => (
                  <div key={l} style={{ padding: "32px 24px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised }}>
                    <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.04em", color: COBALT, fontStretch: "85%" }}>{v}</div>
                    <div style={{ fontSize: 12, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 56 }}>
                <Link href="/manifesto" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: COBALT, borderBottom: `2px solid ${COBALT}`, paddingBottom: 4, textDecoration: "none" }}>Read the manifesto →</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </CediumPage>
  );
}
