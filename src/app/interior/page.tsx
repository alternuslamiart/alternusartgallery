"use client";

import { useEffect, useState } from "react";
import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";
import "./interior-layout.css";

export default function InteriorStudioPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 700px)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile) {
    return <CrystalStudio initialStudioMode="floor-plan" insetPanels />;
  }
  if (searchParams?.workspace === "3d") return <SceneWorkbench studio="interior" projectId={typeof searchParams.project === "string" ? searchParams.project : undefined} />;
  return <CrystalStudio initialStudioMode="floor-plan" insetPanels />;
}
