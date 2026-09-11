"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { BoxGeometry } from "three";

function ModelingScene() {
  const [selected, setSelected] = useState(false);

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 5]} intensity={1.4} />
      <Grid
        args={[100, 100]}
        cellSize={0.5}
        cellThickness={0.55}
        cellColor="#343a43"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#59616d"
        fadeDistance={28}
        fadeStrength={1.2}
        infiniteGrid
        position={[0, -0.012, 0]}
      />
      <Line points={[[-50, 0, 0], [50, 0, 0]]} color="#ef5350" lineWidth={1.4} />
      <Line points={[[0, 0, -50], [0, 0, 50]]} color="#54d66f" lineWidth={1.4} />
      <mesh position={[0, 0.25, 0]} onClick={(event) => { event.stopPropagation(); setSelected((value) => !value); }}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#6e9dca" roughness={0.42} metalness={0.15} />
        {selected && <lineSegments><edgesGeometry args={[new BoxGeometry(0.53, 0.53, 0.53)]} /><lineBasicMaterial color="#c9e5ff" linewidth={2} /></lineSegments>}
      </mesh>
    </>
  );
}

export default function ThreeDStudioPage() {
  return (
    <main className="h-screen w-full bg-[#0a0a0a]">
      <Canvas camera={{ position: [5, 4.5, 5], fov: 45 }} gl={{ antialias: true }}>
        <ModelingScene />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </main>
  );
}
