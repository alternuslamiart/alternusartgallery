"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

const tools = [
  { name: "Blender", icon: "blender" },
  { name: "Unreal Engine", icon: "unrealengine" },
  { name: "Unity", icon: "unity" },
  { name: "Autodesk", icon: "autodesk" },
];

export function HomeToolMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="home-tools" aria-label="Design tools">
      <div className="home-tools-window">
        <div className="home-tools-track" data-paused={paused}>
          {[0, 1].map((copy) => (
            <ul className="home-tools-list" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {tools.map((tool) => (
                <li key={tool.icon}>
                  <span className="home-tools-icon" aria-hidden="true" style={{ maskImage: `url(/home-tools/${tool.icon}.svg)`, WebkitMaskImage: `url(/home-tools/${tool.icon}.svg)` }} />
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <button className="home-tools-pause" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Resume scrolling tools" : "Pause scrolling tools"} aria-pressed={paused}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
    </section>
  );
}
