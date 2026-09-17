"use client";

import { useState } from "react";
import Link from "next/link";
import { Apple, ArrowRight, Bot, Check, Code2, Cpu, Download, FileText, HardDrive, Image as ImageIcon, Laptop, Play, ShieldCheck, WifiOff } from "lucide-react";
import { COBALT, CoreforgePage } from "@/components/cedium-shell";

const features = [
  { Icon: Cpu, title: "Advanced local workflows", copy: "Handle larger design projects, deeper visualization steps, automation scripts, and documentation preparation." },
  { Icon: Bot, title: "Claude AI design assistant", copy: "Use Claude AI for architectural research, design reasoning, project guidance, and structured decision support." },
  { Icon: Code2, title: "OpenAI Codex development tools", copy: "Use Codex to generate code, automate technical workflows, and prepare repeatable project tools." },
  { Icon: ImageIcon, title: "AI visualization and concept generation", copy: "Create concept imagery, design references, spatial studies, and presentation-ready visual material." },
  { Icon: FileText, title: "Architectural reports and PDF deliverables", copy: "Prepare clear project summaries, statistics, design documentation, and professional PDF exports." },
  { Icon: WifiOff, title: "Offline project access", copy: "Open project files, references, notes, and selected tools without relying on the browser workspace." },
  { Icon: HardDrive, title: "Workstation file control", copy: "Keep design assets and project folders organized on your own desktop environment." },
  { Icon: ShieldCheck, title: "Professional validation", copy: "Construction-ready documents must be reviewed by a qualified professional before use." },
];

export default function DownloadPage() {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [platformChoiceOpen, setPlatformChoiceOpen] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");

  return (
    <CoreforgePage>
      {(t) => (
        <>
          <section style={{ padding: "112px 0 70px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "50%", top: "-42%", transform: "translateX(-50%)", width: 920, height: 680, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}28,transparent 72%)`, filter: "blur(42px)", pointerEvents: "none" }} />
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 800, color: COBALT, marginBottom: 20 }}>CRYSTAL STUDIO DESKTOP / PROFESSIONAL EDITION</div>
              <h1 style={{ margin: 0, fontSize: "clamp(54px,9vw,112px)", lineHeight: 0.88, letterSpacing: "-0.055em", fontWeight: 900 }}>
                Advanced design.<br /><span style={{ color: COBALT, fontStyle: "italic" }}>On your desktop.</span>
              </h1>
              <p style={{ margin: "30px auto 0", maxWidth: 720, fontSize: 17, lineHeight: 1.65, color: t.muted }}>
                The Crystal Studio website focuses on AI-assisted design generation and concept exploration. The desktop application adds advanced local project workflows, larger-file handling, offline access, automation, and deeper design-documentation controls.
              </p>
            </div>
          </section>

          <section style={{ padding: "30px 0 100px" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 }}>
              <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${t.faint}`, background: t.raised }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: `${COBALT}16`, color: COBALT }}><Laptop size={20} /></span><div><div style={{ fontSize: 12, color: t.muted }}>Professional license</div><div style={{ fontSize: 24, fontWeight: 900 }}>Crystal Studio Desktop</div></div></div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 30 }}><span style={{ fontSize: 68, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1 }}>$79</span><span style={{ color: t.muted, fontSize: 13 }}>one-time</span></div>
                <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.6 }}>Includes one desktop license and product updates for the first 12 months. Optional updates after the included period do not disable your existing version.</p>
                <button type="button" onClick={() => { setDownloadOpen(true); setPlatformChoiceOpen(false); setDownloadMessage(""); }} style={{ marginTop: 24, width: "100%", height: 48, border: "none", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: COBALT, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Get Desktop App <Download size={17} /></button>
                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                  {["Windows 11 and Windows 10 (64-bit)", "Apple macOS for MacBook Air and MacBook Pro", "Apple Silicon and Intel Mac support", "Minimum 16 GB RAM; 32 GB recommended", "Dedicated GPU recommended for larger projects", "Commercial use subject to professional review"].map((item) => <div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}><Check size={16} color={COBALT} /><span>{item}</span></div>)}
                </div>
                <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${t.faint}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: t.fg, fontSize: 13, fontWeight: 700 }}><Laptop size={17} color={COBALT} /> Windows desktop</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: t.fg, fontSize: 13, fontWeight: 700 }}><Apple size={17} color={COBALT} /> MacBook / macOS</div>
                </div>
              </div>

              <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${t.faint}`, background: t.surface }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 800, color: COBALT }}>IMPORTANT PRODUCT DISTINCTION</div>
                <h2 style={{ margin: "18px 0 0", fontSize: 36, lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 900 }}>Web generation is not professional approval.</h2>
                <p style={{ margin: "20px 0 0", color: t.muted, lineHeight: 1.65, fontSize: 14 }}>AI-generated floor plans, 3D models, dimensions, visualizations, and exports may be incomplete or incorrect. Any output used for construction, certification, regulated work, or safety-critical systems must be independently checked and approved by a qualified professional.</p>
                <div style={{ display: "grid", gap: 20, marginTop: 28 }}>
                  {features.map(({ Icon, title, copy }) => <div key={title} style={{ display: "flex", gap: 14 }}><span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, display: "grid", placeItems: "center", background: t.raised, color: COBALT }}><Icon size={18} /></span><div><div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 4, color: t.muted, fontSize: 12.5, lineHeight: 1.5 }}>{copy}</div></div></div>)}
                </div>
                <Link href="/terms" style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 8, color: COBALT, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Read professional-use terms <ArrowRight size={15} /></Link>
              </div>
            </div>
          </section>

          {downloadOpen ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="download-dialog-title"
              onClick={() => setDownloadOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(15,23,42,0.46)", backdropFilter: "blur(10px)" }}
            >
              <div onClick={(event) => event.stopPropagation()} style={{ width: "min(620px, 100%)", borderRadius: 20, border: `1px solid ${t.faint}`, background: t.raised, boxShadow: "0 30px 100px rgba(15,23,42,0.28)", padding: 30 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", fontWeight: 800, color: COBALT }}>CRYSTAL STUDIO DESKTOP</div>
                <h2 id="download-dialog-title" style={{ margin: "12px 0 0", fontSize: 34, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 900 }}>Download Now</h2>
                <p style={{ margin: "16px 0 0", color: t.muted, fontSize: 14, lineHeight: 1.6 }}>
                  Before downloading Crystal Studio Desktop, please review the professional-use conditions and choose whether you would like to subscribe to a Crystal plan.
                </p>
                <div style={{ marginTop: 22, padding: 18, borderRadius: 14, background: t.surface, border: `1px solid ${t.faint}` }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Would you like to pay for a Crystal plan?</div>
                  <p style={{ margin: "7px 0 0", color: t.muted, fontSize: 13, lineHeight: 1.5 }}>Plans include Claude AI, OpenAI Codex, Architecture Studio, modeling, floor plans, infrastructure tools, and more.</p>
                  <Link href="/pricing" onClick={() => setDownloadOpen(false)} style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, color: COBALT, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>View plans and pricing <ArrowRight size={14} /></Link>
                </div>
                <label style={{ marginTop: 20, display: "flex", alignItems: "flex-start", gap: 10, color: t.fg, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
                  <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} style={{ marginTop: 3, accentColor: COBALT }} />
                  <span>I have read and accept the <Link href="/terms" target="_blank" style={{ color: COBALT, fontWeight: 700 }}>professional-use terms</Link>. I understand that AI-generated outputs require independent review before construction, certification, or safety-critical use.</span>
                </label>
                {platformChoiceOpen ? (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>Choose where to download Crystal</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ marginTop: 12 }}>
                      <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, padding: "0 16px", borderRadius: 10, border: `1px solid ${t.faint}`, color: t.fg, textDecoration: "none", fontWeight: 800 }}><Apple size={20} color={COBALT} /><span><span style={{ display: "block", fontSize: 13 }}>App Store</span><span style={{ display: "block", marginTop: 2, color: t.muted, fontSize: 11, fontWeight: 500 }}>For iPhone and iPad</span></span></a>
                      <a href="https://play.google.com/store" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, padding: "0 16px", borderRadius: 10, border: `1px solid ${t.faint}`, color: t.fg, textDecoration: "none", fontWeight: 800 }}><Play size={20} color={COBALT} /><span><span style={{ display: "block", fontSize: 13 }}>Google Play</span><span style={{ display: "block", marginTop: 2, color: t.muted, fontSize: 11, fontWeight: 500 }}>For Android devices</span></span></a>
                    </div>
                    <button type="button" onClick={() => setDownloadOpen(false)} style={{ marginTop: 18, height: 42, width: "100%", borderRadius: 9, border: `1px solid ${t.faint}`, background: "transparent", color: t.fg, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 26 }}>
                    <button type="button" onClick={() => setDownloadOpen(false)} style={{ height: 44, padding: "0 18px", borderRadius: 9, border: `1px solid ${t.faint}`, background: "transparent", color: t.fg, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button type="button" disabled={!termsAccepted} onClick={() => { setPlatformChoiceOpen(true); setDownloadMessage(""); }} style={{ height: 44, padding: "0 20px", borderRadius: 9, border: "none", background: COBALT, color: "#fff", fontWeight: 800, cursor: termsAccepted ? "pointer" : "not-allowed", opacity: termsAccepted ? 1 : 0.45, fontFamily: "inherit" }}>Download Now <Download size={15} style={{ verticalAlign: "middle", marginLeft: 6 }} /></button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {downloadMessage ? <div role="status" style={{ position: "fixed", right: 24, bottom: 24, zIndex: 90, maxWidth: 360, borderRadius: 12, background: t.fg, color: t.bg, padding: "13px 16px", fontSize: 13, fontWeight: 700, boxShadow: "0 16px 40px rgba(15,23,42,0.2)" }}>{downloadMessage}</div> : null}
        </>
      )}
    </CoreforgePage>
  );
}
