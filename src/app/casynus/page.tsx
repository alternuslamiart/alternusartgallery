import { CrystalAssistantPage } from "@/components/crystal-assistant-page";
import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";

export default function CasynusPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  if (searchParams.workspace === "classic" || searchParams.mode === "floor-plan") return <CrystalAssistantPage />;
  return <SceneWorkbench studio="architecture" projectId={typeof searchParams.project === "string" ? searchParams.project : undefined} />;
}
