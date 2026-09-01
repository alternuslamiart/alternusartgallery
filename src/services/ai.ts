import type { StudioAsset } from "@/components/crystal-studio/types";

export async function generateModel(prompt: string): Promise<StudioAsset> {
  if (!prompt.trim()) throw new Error("Enter a model description first.");
  const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
  if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error||"Model generation failed.")}
  return response.json() as Promise<StudioAsset>;
}
