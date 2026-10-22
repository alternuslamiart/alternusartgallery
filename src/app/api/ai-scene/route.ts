import { NextRequest, NextResponse } from "next/server";
import { getGeminiApiKey, getGeminiModel, getGroqApiKey, getGroqBaseUrl, getGroqModel } from "@/lib/ai-provider-config";
import { applyCommands, MAX_SCENE_BYTES, validateDocument } from "@/lib/scene/document.mjs";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";
import { aiUsage, usageError, type UsageTicket } from "@/lib/platform/usage";

export const runtime = "nodejs";
export const maxDuration = 60;
const parameters = {
  type: "object", required: ["commands"], properties: {
    commands: { type: "array", items: { type: "object", required: ["type"], properties: {
      type: { type: "string", enum: ["template", "create", "move", "transform", "material", "delete", "environment"] },
      template: { type: "string", enum: ["building", "room", "intersection"] }, stories: { type: "integer" },
      kind: { type: "string", enum: ["box", "sphere", "cylinder", "pointLight", "spotLight"] },
      name: { type: "string" }, id: { type: "string" }, position: { type: "array", items: { type: "number" } }, dimensions: { type: "array", items: { type: "number" } },
      rotation: { type: "array", items: { type: "number" } }, scale: { type: "array", items: { type: "number" } },
      material: { type: "string", enum: ["concrete", "wood", "marble", "ceramic", "glass", "metal", "fabric"] }, color: { type: "string" },
      sunElevation: { type: "number" }, exposure: { type: "number" }, shadows: { type: "boolean" },
      sunAzimuth: { type: "number" }, sunIntensity: { type: "number" }, quality: { type: "string", enum: ["performance", "balanced", "ultra"] },
      roughness: { type: "number" }, metalness: { type: "number" }, opacity: { type: "number" }, transmission: { type: "number" },
    } } },
  },
};
const declaration = { name: "propose_scene_commands", description: "Propose editable metric scene operations. The user must review and apply them. Never generate executable code.", parameters };
export async function POST(request: NextRequest) {
  let ticket: UsageTicket | undefined;
  let generated = false;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_SCENE_BYTES + 20_000) return NextResponse.json({ error: "Scene request is too large." }, { status: 413 });
    const body = JSON.parse(raw);
    if (!["gemini", "groq"].includes(body.provider)) return NextResponse.json({ error: "Structured scene commands currently require Gemini or Groq. You remains available for research chat." }, { status: 400 });
    const doc = validateDocument(body.document);
    if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 4000) return NextResponse.json({ error: "Use a prompt between 1 and 4000 characters." }, { status: 400 });
    const selected = Array.isArray(body.selected) ? body.selected.filter((id: unknown) => typeof id === "string" && doc.objects.some(o => o.id === id)) : [];
    const context = [...doc.objects.filter(o => selected.includes(o.id)), ...doc.objects.filter(o => !selected.includes(o.id))].slice(0, 60).map(o => ({ id: o.id, name: o.name, kind: o.kind, position: o.position, dimensions: o.dimensions, locked: o.locked }));
    const instruction = `You are a Casynus CAD scene planner. Call propose_scene_commands with at most 30 commands. Units are meters; rotations in the existing scene are radians. Use building, room or intersection templates for complete environments; building stories may be 1 to 8. "move" uses absolute local coordinates, so add the requested delta to the current position. Reference only the supplied IDs; never change locked objects. Materials are named presets. The user reviews every proposal before it is applied. No code or external resources. Selected IDs: ${JSON.stringify(selected)}. Current objects: ${JSON.stringify(context)}.`;
    let commands: unknown;
    let model: string;
    if (body.provider === "gemini" ? !getGeminiApiKey() : !getGroqApiKey()) return NextResponse.json({ error: "The selected AI provider is not configured." }, { status: 503 });
    try {
      const context = await requirePlatformContext();
      if (isApiResponse(context)) return context;
      ticket = await aiUsage.reserve(context.workspaceId, "scene");
    } catch (error) { return usageError(error); }
    if (body.provider === "gemini") {
      if (!getGeminiApiKey()) return NextResponse.json({ error: "Gemini is not configured on the server." }, { status: 503 });
      model = getGeminiModel();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": getGeminiApiKey() }, signal: AbortSignal.timeout(25_000), cache: "no-store",
        body: JSON.stringify({ system_instruction: { parts: [{ text: instruction }] }, contents: [{ role: "user", parts: [{ text: body.prompt }] }], tools: [{ functionDeclarations: [declaration] }], toolConfig: { functionCallingConfig: { mode: "ANY", allowedFunctionNames: [declaration.name] } }, generationConfig: { maxOutputTokens: 4096 } }),
      });
      if (!response.ok) return NextResponse.json({ error: `Gemini scene planning failed (${response.status}). Check model access, billing and quota.` }, { status: 502 });
      const data = await response.json();
      const call = data.candidates?.[0]?.content?.parts?.find((part: { functionCall?: { name: string } }) => part.functionCall?.name === declaration.name)?.functionCall;
      commands = call?.args?.commands;
    } else {
      if (!getGroqApiKey()) return NextResponse.json({ error: "Groq is not configured on the server." }, { status: 503 });
      model = getGroqModel();
      const response = await fetch(`${getGroqBaseUrl()}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getGroqApiKey()}` }, signal: AbortSignal.timeout(25_000), cache: "no-store",
        body: JSON.stringify({ model, messages: [{ role: "system", content: instruction }, { role: "user", content: body.prompt }], tools: [{ type: "function", function: declaration }], tool_choice: { type: "function", function: { name: declaration.name } }, max_tokens: 4096 }) });
      if (!response.ok) return NextResponse.json({ error: `Groq scene planning failed (${response.status}). Check model access, billing and quota.` }, { status: 502 });
      const data = await response.json();
      const call = data.choices?.[0]?.message?.tool_calls?.find((item: { function: { name: string } }) => item.function.name === declaration.name);
      commands = call ? JSON.parse(call.function.arguments).commands : undefined;
    }
    // Validate the complete transaction on the server; no scene is saved here.
    applyCommands(doc, commands);
    generated = true;
    return NextResponse.json({ commands, provider: body.provider, model });
  } catch (caught) {
    const timedOut = caught instanceof Error && ["TimeoutError", "AbortError"].includes(caught.name);
    return NextResponse.json({ error: timedOut ? "Scene planning timed out. Try a smaller request." : "The scene proposal was invalid or could not be generated. No scene changes were applied." }, { status: timedOut ? 504 : 400 });
  } finally {
    if (ticket && !generated) {
      try { await aiUsage.refund(ticket); } catch (error) { console.error("Scene usage refund failed", error); }
    }
  }
}
