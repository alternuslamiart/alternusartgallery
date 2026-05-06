"use client";
import { CerevixPage, COBALT } from "@/components/cerevix-shell";

const certs = [
  { n: "SOC 2 Type II", s: "Audited" },
  { n: "ISO 27001",     s: "Audited" },
  { n: "GDPR",          s: "Compliant" },
  { n: "HIPAA",         s: "BAA available" },
  { n: "CCPA",          s: "Compliant" },
  { n: "TLS 1.3",       s: "Everywhere" },
];

const controls = [
  { t: "Encryption", d: "AES-256 at rest, TLS 1.3 in transit. Per-workspace KMS keys for every tenant." },
  { t: "Access control", d: "Row-level isolation. SSO, SCIM, and role-based permissions on every plan." },
  { t: "Audit logs", d: "Every action, every agent query, every admin change — immutable, exportable." },
  { t: "Incident response", d: "Published runbook. 24/7 on-call. Status page updated in under 5 minutes." },
  { t: "Penetration testing", d: "Quarterly third-party pentests. Reports available under NDA on request." },
  { t: "Responsible disclosure", d: "security@Cerevix.ai · 7-day SLA for triage · bounty program for valid reports." },
];

export default function Security() {
  return (
    <CerevixPage>
      {(t) => (
        <>
          <section style={{ padding: "120px 0 60px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${t.faint} 1px,transparent 1px),linear-gradient(90deg,${t.faint} 1px,transparent 1px)`, backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse at 20% 50%,black 30%,transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 20% 50%,black 30%,transparent 75%)" }} />
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>SECURITY</div>
              <h1 style={{ fontSize: "clamp(44px,7vw,104px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
                Built for the<br/><span style={{ color: COBALT, fontStyle: "italic" }}>paranoid.</span>
              </h1>
              <p style={{ marginTop: 28, fontSize: 17, color: t.muted, maxWidth: 600, lineHeight: 1.6 }}>
                Cerevix handles your mail, your files, your code — so security is the foundation, not a bolt-on. Here&apos;s how we keep it.
              </p>
            </div>
          </section>

          <section style={{ padding: "60px 0 60px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, color: t.muted, textTransform: "uppercase", marginBottom: 20 }}>Compliance</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certs.map((c) => (
                  <div key={c.n} style={{ padding: "22px 20px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.raised, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${COBALT}18`, border: `1px solid ${COBALT}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COBALT} strokeWidth="2.2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{c.n}</div>
                      <div style={{ fontSize: 11, color: t.muted }}>{c.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "40px 0 120px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, color: t.muted, textTransform: "uppercase", marginBottom: 20 }}>Controls</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                {controls.map((c, i) => (
                  <div key={c.t} style={{ padding: "28px 28px", borderTop: i >= 2 ? `1px solid ${t.faint}` : "none", borderLeft: i % 2 === 1 ? `1px solid ${t.faint}` : "none", background: t.raised }}>
                    <div style={{ fontSize: 11, color: COBALT, fontFamily: "var(--font-geist-mono),monospace", fontWeight: 700, marginBottom: 10 }}>/ {String(i + 1).padStart(2, "0")}</div>
                    <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, marginBottom: 8 }}>{c.t}</h3>
                    <p style={{ fontSize: 13.5, color: t.muted, lineHeight: 1.6, margin: 0 }}>{c.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </CerevixPage>
  );
}
