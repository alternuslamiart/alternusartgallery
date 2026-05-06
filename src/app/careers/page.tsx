"use client";
import { CerevixPage, COBALT } from "@/components/cerevix-shell";

const roles = [
  { t: "Staff Product Engineer — Agent",    loc: "Remote · EU", team: "Engineering" },
  { t: "Senior Frontend Engineer (React)",  loc: "Tirana / Remote", team: "Engineering" },
  { t: "ML Researcher — Retrieval",         loc: "Remote", team: "Research" },
  { t: "Head of Developer Relations",       loc: "SF / Remote", team: "Marketing" },
  { t: "Product Designer",                  loc: "Remote · EU", team: "Design" },
  { t: "Customer Engineer",                 loc: "Remote", team: "GTM" },
];

export default function Careers() {
  return (
    <CerevixPage>
      {(t) => (
        <>
          <section style={{ padding: "120px 0 60px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>CAREERS</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                <h1 style={{ fontSize: "clamp(48px,8vw,112px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
                  Build the<br/>OS of 2030.
                </h1>
                <p style={{ fontSize: 17, color: t.muted, lineHeight: 1.6, margin: 0 }}>
                  We&apos;re small, remote-first, profitable, and growing. We hire people who ship, not people who talk about shipping.
                </p>
              </div>
            </div>
          </section>

          <section style={{ padding: "40px 0 120px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Open roles — {roles.length}</div>
              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
                {roles.map((r, i) => (
                  <a key={r.t} href="#" style={{ display: "grid", gridTemplateColumns: "140px 1fr auto auto", gap: 24, alignItems: "center", padding: "22px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none", textDecoration: "none", color: t.fg, transition: "background 0.15s" }} className="hover:bg-[#4284FF]/5">
                    <span style={{ fontSize: 10, fontWeight: 700, color: COBALT, letterSpacing: "0.12em", textTransform: "uppercase" }}>{r.team}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>{r.t}</span>
                    <span style={{ fontSize: 13, color: t.muted }}>{r.loc}</span>
                    <span style={{ fontSize: 16, color: COBALT, fontWeight: 300 }}>→</span>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: 64, padding: "40px 36px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.surface }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, marginBottom: 20 }}>Don&apos;t see your role?</h2>
                <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.6, margin: 0, maxWidth: 580 }}>
                  If you&apos;re exceptional and passionate about agents, send us your work at <a href="mailto:hiring@Cerevix.ai" style={{ color: COBALT }}>hiring@Cerevix.ai</a>. We always make room for exceptional people.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </CerevixPage>
  );
}
