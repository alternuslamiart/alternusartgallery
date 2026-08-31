"use client";

import Link from "next/link";
import { ArrowRight, Check, Cpu, Download, HardDrive, Laptop, ShieldCheck, WifiOff } from "lucide-react";
import { COBALT, CoreforgePage } from "@/components/cedium-shell";

const features = [
  { Icon: Cpu, title: "Advanced local workflows", copy: "Handle larger projects, deeper modeling steps, automation scripts, and CAD handoff preparation." },
  { Icon: WifiOff, title: "Offline project access", copy: "Open project files, references, notes, and selected tools without relying on the browser workspace." },
  { Icon: HardDrive, title: "Workstation file control", copy: "Keep engineering assets and project folders organized on your own desktop environment." },
  { Icon: ShieldCheck, title: "Professional validation", copy: "Production and safety-critical outputs must be reviewed by a licensed engineer before use." },
];

export default function DownloadPage() {
  return (
    <CoreforgePage>
      {(t) => (
        <>
          <section style={{ padding: "112px 0 70px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "50%", top: "-42%", transform: "translateX(-50%)", width: 920, height: 680, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}28,transparent 72%)`, filter: "blur(42px)", pointerEvents: "none" }} />
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 20 }}>CRYSTAL STUDIO DESKTOP / PROFESSIONAL EDITION</div>
              <h1 style={{ margin: 0, fontSize: "clamp(54px,9vw,112px)", lineHeight: 0.88, letterSpacing: "-0.055em", fontWeight: 900 }}>
                Advanced engineering.<br /><span style={{ color: COBALT, fontStyle: "italic" }}>On your desktop.</span>
              </h1>
              <p style={{ margin: "30px auto 0", maxWidth: 720, fontSize: 17, lineHeight: 1.65, color: t.muted }}>
                The Crystal Studio website focuses on AI-only generation and concept exploration. The desktop application adds advanced local project workflows, larger-file handling, offline access, automation, and deeper CAD handoff controls.
              </p>
            </div>
          </section>

          <section style={{ padding: "30px 0 100px" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 }}>
              <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${t.faint}`, background: t.raised }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: `${COBALT}16`, color: COBALT }}><Laptop size={20} /></span><div><div style={{ fontSize: 12, color: t.muted }}>Professional license</div><div style={{ fontSize: 24, fontWeight: 900 }}>Crystal Studio Desktop</div></div></div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 30 }}><span style={{ fontSize: 68, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1 }}>$79</span><span style={{ color: t.muted, fontSize: 13 }}>one-time</span></div>
                <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.6 }}>Includes one desktop license and product updates for the first 12 months. Optional updates after the included period do not disable your existing version.</p>
                <Link href="/contact" style={{ marginTop: 24, height: 48, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: COBALT, color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>Get Desktop App <Download size={17} /></Link>
                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                  {["Windows 11 and Windows 10 (64-bit)", "Minimum 16 GB RAM; 32 GB recommended", "Dedicated GPU recommended for larger projects", "Commercial use subject to professional review"].map((item) => <div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}><Check size={16} color={COBALT} /><span>{item}</span></div>)}
                </div>
              </div>

              <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${t.faint}`, background: t.surface }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 800, color: COBALT }}>IMPORTANT PRODUCT DISTINCTION</div>
                <h2 style={{ margin: "18px 0 0", fontSize: 36, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 900 }}>Web generation is not engineering approval.</h2>
                <p style={{ margin: "20px 0 0", color: t.muted, lineHeight: 1.65, fontSize: 14 }}>AI-generated geometry, code, simulations, toolpaths, dimensions, and exports may be incomplete or incorrect. Any output used for manufacturing, construction, certification, regulated work, or safety-critical systems must be independently checked and approved by a licensed engineer.</p>
                <div style={{ display: "grid", gap: 20, marginTop: 28 }}>
                  {features.map(({ Icon, title, copy }) => <div key={title} style={{ display: "flex", gap: 14 }}><span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, display: "grid", placeItems: "center", background: t.raised, color: COBALT }}><Icon size={18} /></span><div><div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 4, color: t.muted, fontSize: 12.5, lineHeight: 1.5 }}>{copy}</div></div></div>)}
                </div>
                <Link href="/terms" style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 8, color: COBALT, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Read engineering-use terms <ArrowRight size={15} /></Link>
              </div>
            </div>
          </section>
        </>
      )}
    </CoreforgePage>
  );
}
