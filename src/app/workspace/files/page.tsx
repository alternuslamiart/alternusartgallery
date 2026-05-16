"use client";
import Link from "next/link";
import { CediumPage, COBALT } from "@/components/cedium-shell";

const folders = [
  { n: "Invoices",  c: 12, d: "2h ago" },
  { n: "Projects",  c: 47, d: "Yesterday" },
  { n: "Contracts", c: 8,  d: "Mar 12" },
  { n: "Design Assets", c: 124, d: "Apr 2" },
  { n: "Research", c: 33, d: "Today" },
  { n: "Archive", c: 201, d: "Jan 8" },
];

export default function Files() {
  return (
    <CediumPage>
      {(t) => (
        <>
          <section style={{ padding: "80px 0 40px" }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>WORKSPACE / FILES</div>
              <h1 style={{ fontSize: "clamp(44px,7vw,104px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 auto", maxWidth: 900, fontStretch: "86%" }}>
                A filesystem that <span style={{ color: COBALT, fontStyle: "italic" }}>understands you.</span>
              </h1>
              <p style={{ marginTop: 28, fontSize: 17, color: t.muted, maxWidth: 620, margin: "28px auto 0", lineHeight: 1.55 }}>
                Search by meaning, not filename. Group by intent. Let the agent re-shelve the folder for you.
              </p>
            </div>
          </section>

          <section style={{ padding: "60px 0 120px" }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
              {/* Search bar */}
              <div style={{ maxWidth: 720, margin: "0 auto 40px", padding: "14px 20px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, display: "flex", alignItems: "center", gap: 12, boxShadow: `8px 8px 0 0 ${COBALT}` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <span style={{ fontSize: 14.5, color: t.muted, flex: 1, fontFamily: "var(--font-geist-mono),monospace" }}>&ldquo;all invoices from Q1 over $500&rdquo;</span>
                <span style={{ fontSize: 10, color: t.muted, fontFamily: "var(--font-geist-mono),monospace", border: `1px solid ${t.faint}`, padding: "3px 8px", borderRadius: 6 }}>⌘K</span>
              </div>

              {/* Folder grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {folders.map((f) => (
                  <div key={f.n} style={{ padding: "24px 22px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, cursor: "pointer", transition: "transform 0.2s,border-color 0.2s" }} className="hover:border-[#4284FF]/50 hover:-translate-y-1">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COBALT}18`, border: `1px solid ${COBALT}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>{f.n}</div>
                    <div style={{ fontSize: 12, color: t.muted, display: "flex", justifyContent: "space-between" }}>
                      <span>{f.c} items</span><span>{f.d}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 56, textAlign: "center" }}>
                <Link href="/main" style={{ height: 48, padding: "0 24px", background: COBALT, color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>Open in OS →</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </CediumPage>
  );
}
