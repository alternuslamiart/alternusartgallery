"use client";
import { AlternusPage, COBALT } from "@/components/alternus-shell";

const clauses = [
  { t: "Acceptance",       b: "By creating an Alternus workspace, you agree to these terms. If you don't, don't use the service." },
  { t: "Your account",     b: "You're responsible for securing your credentials. One workspace per person unless you're on an Enterprise plan." },
  { t: "Acceptable use",   b: "Don't use Alternus to harm others, break laws, or generate harmful content. We reserve the right to terminate workspaces that do." },
  { t: "Your content",     b: "You retain full ownership of everything you put into Alternus. We need a minimal license to display it back to you — nothing more." },
  { t: "Agent behavior",   b: "The agent is powerful but not infallible. High-risk actions (sending mail, deleting files, paying invoices) always require your confirmation." },
  { t: "Availability",     b: "We target 99.9% uptime. When we don't meet it, we credit you. Check status.alternus.ai for the live picture." },
  { t: "Pricing & billing",b: "Prices in USD. We bill monthly in advance. Cancel anytime — you keep the rest of the period." },
  { t: "Liability",        b: "Our aggregate liability is capped at the fees you paid in the preceding 12 months. Some jurisdictions may not allow this; those carve-outs apply." },
  { t: "Changes",          b: "If we materially change these terms, we email every workspace owner 30 days before they take effect." },
];

export default function Terms() {
  return (
    <AlternusPage>
      {(t) => (
        <section style={{ padding: "100px 0 120px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>TERMS OF USE</div>
            <h1 style={{ fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "86%" }}>Terms of Use</h1>
            <p style={{ marginTop: 20, fontSize: 15, color: t.muted, lineHeight: 1.6 }}>Effective 2026-04-01 · v2.0 · plain-English version below</p>

            <div style={{ marginTop: 64, counterReset: "clause" }}>
              {clauses.map((c, i) => (
                <section key={c.t} style={{ padding: "32px 0", borderTop: `1px solid ${t.faint}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, alignItems: "start" }}>
                    <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", color: COBALT, lineHeight: 0.9, fontStretch: "85%" }}>{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, marginBottom: 10 }}>{c.t}</h2>
                      <p style={{ fontSize: 15.5, color: t.muted, lineHeight: 1.7, margin: 0 }}>{c.b}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      )}
    </AlternusPage>
  );
}
