"use client";

import { useState } from "react";
import { ToolsIntroModal } from "./tools-intro-modal";

const tools = [
  { name: "Blender", icon: "blender" },
  { name: "Unreal Engine", icon: "unrealengine" },
  { name: "Unity", icon: "unity" },
  { name: "Autodesk", icon: "autodesk" },
];

export function HomeToolMarquee() {
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  const handleMouseEnter = () => {
    // In testing phase: trigger frame when hovering over tools for the first time upon entering website
    if (!hasTriggered) {
      setHasTriggered(true);
      setIsIntroOpen(true);
    }
  };

  const handleToolClick = () => {
    // Also allow manual re-opening during testing phase
    setIsIntroOpen(true);
  };

  return (
    <>
      <section
        className="home-tools cursor-pointer"
        aria-label="Design tools"
        onMouseEnter={handleMouseEnter}
      >
        <div className="home-tools-window">
          <div className="home-tools-track">
            {[0, 1].map((copy) => (
              <ul className="home-tools-list" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {tools.map((tool) => (
                  <li
                    key={tool.icon}
                    onClick={handleToolClick}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="home-tools-icon"
                      aria-hidden="true"
                      style={{
                        maskImage: `url(/home-tools/${tool.icon}.svg)`,
                        WebkitMaskImage: `url(/home-tools/${tool.icon}.svg)`,
                      }}
                    />
                    <span>{tool.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      <ToolsIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
      />
    </>
  );
}
