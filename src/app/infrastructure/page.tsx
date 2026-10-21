import SceneWorkbench from "@/components/scene-studio/SceneWorkbench";
import ClassicInfrastructurePage from "./ClassicInfrastructure";

export default function InfrastructurePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  if (searchParams.workspace === "classic") return <ClassicInfrastructurePage />;
  return <SceneWorkbench studio="infrastructure" projectId={typeof searchParams.project === "string" ? searchParams.project : undefined} />;
}
