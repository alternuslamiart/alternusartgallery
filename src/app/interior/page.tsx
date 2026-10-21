import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";
import "./interior-layout.css";

export default function InteriorStudioPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  if (searchParams.workspace === "3d") return <SceneWorkbench studio="interior" projectId={typeof searchParams.project === "string" ? searchParams.project : undefined} />;
  return <CrystalStudio initialStudioMode="floor-plan" insetPanels />;
}
