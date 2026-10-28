"use client";

import { useEffect, useState } from "react";
import { CrystalAssistantPage } from "@/components/crystal-assistant-page";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";

export default function CasynusPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
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

  if (isMobile || searchParams?.workspace === "classic" || searchParams?.mode === "floor-plan") {
    return <CrystalAssistantPage initialStudioMode="modeling" />;
  }
  return <SceneWorkbench studio="architecture" projectId={typeof searchParams?.project === "string" ? searchParams.project : undefined} />;
}
