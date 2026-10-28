"use client";

import { useEffect, useState } from "react";
import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";
import ClassicInfrastructurePage from "./ClassicInfrastructure";

export default function InfrastructurePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
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
    return <CrystalStudio initialStudioMode="modeling" />;
  }
  if (searchParams?.workspace === "classic") return <ClassicInfrastructurePage />;
  return <SceneWorkbench studio="infrastructure" projectId={typeof searchParams?.project === "string" ? searchParams.project : undefined} />;
}
