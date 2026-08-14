import type { StudioAsset } from "@/components/crystal-studio/types";

export async function generateModel(prompt: string): Promise<StudioAsset> {
  await new Promise((resolve) => window.setTimeout(resolve, 1800));
  if (!prompt.trim()) throw new Error("Enter a model description first.");

  const name = prompt
    .trim()
    .replace(/^create\s+(an?|the)\s+/i, "")
    .split(/\s+/)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Generated Model",
    prompt: prompt.trim(),
    category: "AI Generated",
    thumbnail: "from-blue-950 via-indigo-600 to-cyan-400",
    createdAt: new Date().toISOString(),
    status: "ready",
  };
}
