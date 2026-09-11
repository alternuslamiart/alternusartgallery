"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import type { ReactNode } from "react";
import { Box, BoxSelect, CircleDot, Crosshair, Layers3, Lightbulb, Move3D, Rotate3D, Ruler, Scale3D, Sparkles, Upload, WandSparkles } from "lucide-react";
import { CrystalStudioShell } from "@/components/crystal-studio/CrystalStudioShell";

function ModelingScene({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return <><color attach="background" args={["#0b0d10"]} /><ambientLight intensity={0.65} /><directionalLight position={[4, 7, 5]} intensity={1.4} /><Grid args={[100, 100]} cellSize={0.5} cellThickness={0.55} cellColor="#343a43" sectionSize={5} sectionThickness={1} sectionColor="#59616d" fadeDistance={28} fadeStrength={1.2} infiniteGrid position={[0, -0.012, 0]} /><Line points={[[-50, 0, 0], [50, 0, 0]]} color="#ef5350" lineWidth={1.4} /><Line points={[[0, 0, -50], [0, 0, 50]]} color="#54d66f" lineWidth={1.4} /><mesh position={[0, 0.25, 0]} onClick={(event) => { event.stopPropagation(); onSelect(); }}><boxGeometry args={[1.5, 1.5, 1.5]} /><meshStandardMaterial color={selected ? "#79b8f5" : "#526d8d"} roughness={0.42} metalness={0.15} /></mesh></>;
}

const tools = [{ label: "Select", icon: BoxSelect }, { label: "Move", icon: Move3D }, { label: "Rotate", icon: Rotate3D }, { label: "Scale", icon: Scale3D }, { label: "Measure", icon: Ruler }, { label: "AI Generate", icon: WandSparkles }];

export default function ThreeDStudioPage() {
  const [selected, setSelected] = useState(true);
  const [activeTool, setActiveTool] = useState("Select");
  return <CrystalStudioShell studio="Modeling" left={<div className="crystal-studio-side-v2"><div className="crystal-side-title-v2"><div><span className="crystal-kicker-v2">PROJECT ALPHA</span><h1>Modeling workspace</h1></div><Layers3 size={18} /></div><StudioSection title="Scene"><SideRow icon={Box} label="Objects" value="1" /><SideRow icon={Layers3} label="Groups" value="0" /><SideRow icon={Lightbulb} label="Lights" value="1" /></StudioSection><StudioSection title="AI Generation"><button className="crystal-upload-v2"><Upload size={18} /><span>Drop reference image<span>JPG, PNG, WEBP up to 5MB</span></span></button><label className="crystal-prompt-v2"><span>Describe the object you want to generate</span><textarea placeholder="A sculptural lounge chair..." /></label><button className="crystal-primary-v2"><Sparkles size={15} />Generate 3D Model</button></StudioSection><StudioSection title="Assets"><SideRow icon={Box} label="Furniture" /><SideRow icon={Layers3} label="Architecture" /><SideRow icon={CircleDot} label="Materials" /></StudioSection></div>} right={<div className="crystal-studio-side-v2"><div className="crystal-side-title-v2"><div><span className="crystal-kicker-v2">INSPECTOR</span><h1>{selected ? "Selected cube" : "No selection"}</h1></div><button className="crystal-icon-button-v2"><Crosshair size={16} /></button></div><StudioSection title="Transform"><Property label="Position X" value="0.00 m" /><Property label="Position Y" value="0.25 m" /><Property label="Position Z" value="0.00 m" /><Property label="Rotation" value="0°" /><Property label="Scale" value="1.00" /></StudioSection><StudioSection title="Geometry"><Property label="Vertices" value="8" /><Property label="Edges" value="12" /><Property label="Faces" value="6" /><Property label="Dimensions" value="1.5 × 1.5 × 1.5 m" /></StudioSection><StudioSection title="Material"><Property label="Base color" value="#526D8D" /><Property label="Roughness" value="0.42" /><Property label="Metallic" value="0.15" /><button className="crystal-secondary-v2"><Sparkles size={14} />AI Material</button></StudioSection><StudioSection title="Environment"><Property label="Lighting" value="Studio Soft" /><Property label="Camera" value="Perspective" /><Property label="Exposure" value="+1.2 EV" /></StudioSection></div>} dock={<>{tools.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActiveTool(label)} className={activeTool === label ? "is-active" : ""}><Icon size={17} /><span>{label}</span></button>)}</>}>
    <Canvas camera={{ position: [5, 4.5, 5], fov: 45 }} gl={{ antialias: true }}><ModelingScene selected={selected} onSelect={() => setSelected((value) => !value)} /><OrbitControls makeDefault enableDamping dampingFactor={0.08} /></Canvas><div className="crystal-viewport-status-v2"><span><i />Realtime preview</span><span>Perspective · 45°</span></div>
  </CrystalStudioShell>;
}

function StudioSection({ title, children }: { title: string; children: ReactNode }) { return <section className="crystal-inspector-section-v2"><h2>{title}</h2><div>{children}</div></section>; }
function SideRow({ icon: Icon, label, value }: { icon: typeof Box; label: string; value?: string }) { return <button className="crystal-side-row-v2"><Icon size={15} /><span>{label}</span>{value && <small>{value}</small>}</button>; }
function Property({ label, value }: { label: string; value: string }) { return <label className="crystal-property-v2"><span>{label}</span><b>{value}</b></label>; }
