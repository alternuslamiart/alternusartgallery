"use client";
import { CoreforgePage, COBALT } from "@/components/cedium-shell";

const roles = [
 { t: "Robotics Systems Engineer — AI Behaviors", loc: "Remote · EU", team: "Robotics" },
 { t: "Spatial Computing Engineer", loc: "Tirana / Remote", team: "Engineering" },
 { t: "ML Researcher — Vision and Planning", loc: "Remote", team: "Research" },
 { t: "Robotics Software Engineer — ROS / Simulation", loc: "Remote · EU", team: "Robotics" },
 { t: "Product Designer — Intelligent Environments", loc: "Remote · EU", team: "Design" },
 { t: "Architecture and Robotics Workflow Lead", loc: "Remote", team: "Product" },
];

export default function Careers() {
 return (
 <CoreforgePage>
 {(t) => (
 <>
 <section style={{ padding: "120px 0 60px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>CAREERS</div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
 <h1 style={{ fontSize: "clamp(48px,8vw,112px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
 Build the<br/><span style={{ color: COBALT }}>robots of tomorrow.</span>
 </h1>
 <p style={{ fontSize: 17, color: t.muted, lineHeight: 1.6, margin: 0 }}>
 Crystal is building the intelligence layer for spaces, machines, and robots. We are connecting AI Chat, spatial design, 3D modeling, infrastructure planning, and simulation into tools that help people imagine, build, and operate the physical world.
 </p>
 </div>
 </div>
 </section>

 <section style={{ padding: "40px 0 120px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
 <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Building the robotics team — {roles.length} roles</div>
 <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: t.raised }}>
 {roles.map((r, i) => (
 <a key={r.t} href={`mailto:careers@alternusart.com?subject=${encodeURIComponent(r.t)}`} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto auto", gap: 24, alignItems: "center", padding: "22px 28px", borderTop: i > 0 ? `1px solid ${t.faint}` : "none", textDecoration: "none", color: t.fg, transition: "background 0.15s" }} className="hover:bg-[#4284FF]/5">
 <span style={{ fontSize: 10, fontWeight: 700, color: COBALT, letterSpacing: "0.12em", textTransform: "uppercase" }}>{r.team}</span>
 <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>{r.t}</span>
 <span style={{ fontSize: 13, color: t.muted }}>{r.loc}</span>
 <span style={{ fontSize: 16, color: COBALT, fontWeight: 300 }}>→</span>
 </a>
 ))}
 </div>

 <div style={{ marginTop: 64, padding: "40px 36px", border: `1px solid ${t.faint}`, borderRadius: 12, background: t.surface }}>
 <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, marginBottom: 20 }}>Help us make robots useful.</h2>
 <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.6, margin: 0, maxWidth: 580 }}>
 If you work across robotics, spatial intelligence, computer vision, simulation, architecture, or human-centered AI, send us your work at <a href="mailto:contact@alternusart.com" style={{ color: COBALT }}>contact@alternusart.com</a>. We are interested in the systems that let robots understand spaces, collaborate with people, and act with purpose.
 </p>
 </div>
 </div>
 </section>
 </>
 )}
 </CoreforgePage>
 );
}
