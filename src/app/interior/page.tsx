import { CrystalStudio } from "@/components/crystal-studio/CrystalStudio";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";

export default function InteriorStudioPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  if (searchParams.workspace === "classic") return <CrystalStudio initialStudioMode="floor-plan" />;
  return <SceneWorkbench studio="interior" projectId={typeof searchParams.project === "string" ? searchParams.project : undefined} />;
}
