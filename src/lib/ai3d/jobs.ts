import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { configured3DProviders, inspect3DTask, submit3DTask } from "./providers.mjs";
import type { AIProviderJob, Prisma } from "@prisma/client";
import type { PlatformContext } from "@/lib/platform/api";
import { aiUsage, usageError } from "@/lib/platform/usage";

type Input = { kind: "casynus-ai3d"; prompt: string; projectId: string; studio: string; model: string };
type Output = { taskId?: string; phase?: string; progress?: number; modelURL?: string };
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export const fail3D = (error: string, status: number) => NextResponse.json({ error }, { status });
export const owned3D = (context: PlatformContext, id?: string) => ({ ...context, ...(id ? { id } : {}), type: "MODEL_GENERATION" as const, provider: { in: ["meshy", "tripo"] }, input: { path: ["kind"], equals: "casynus-ai3d" } });
export function jobDTO(job: AIProviderJob) {
  const input = job.input as unknown as Input, output = job.output as Output | null;
  return { id: job.id, provider: job.provider, model: input.model, projectId: input.projectId, prompt: input.prompt, status: job.status, progress: output?.progress ?? 0, ...(job.status === "SUCCEEDED" && output?.modelURL ? { modelURL: output.modelURL, assetPath: `/api/ai3d/jobs/${job.id}/asset` } : {}), error: job.error, createdAt: job.createdAt };
}
export async function create3DJob(context: PlatformContext, body: Record<string, unknown>) {
  if (typeof body.requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.requestId) || typeof body.projectId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.projectId)) return fail3D("A valid project ID and request ID are required.", 400);
  if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 600 || !["architecture", "interior", "infrastructure"].includes(String(body.studio))) return fail3D("Use a 1–600 character prompt and a valid studio.", 400);
  const provider = configured3DProviders().find(p => p.id === body.provider);
  if (!provider) return fail3D("This 3D provider is not configured on the server.", 503);
  const previous = await prisma.aIProviderJob.findFirst({ where: owned3D(context, body.requestId) });
  if (previous) {
    const input = previous.input as unknown as Input;
    if (previous.provider !== body.provider || input.projectId !== body.projectId || input.prompt !== body.prompt.trim()) return fail3D("Request ID already belongs to another generation.", 409);
    return NextResponse.json(jobDTO(previous));
  }
  const project = await prisma.project.findUnique({ where: { id: body.projectId }, select: { userId: true, workspaceId: true, deletedAt: true } });
  if (project && (project.userId !== context.userId || project.workspaceId !== context.workspaceId || project.deletedAt)) return fail3D("Project not found.", 404);
  // Persist the request before spending provider credits. A unique ID prevents
  // duplicate submissions; ambiguous/failed submissions are never auto-retried.
  let job: AIProviderJob;
  let ticket;
  try { ticket = await aiUsage.reserve(context.workspaceId, "model"); }
  catch (error) { return usageError(error); }
  try { job = await prisma.aIProviderJob.create({ data: { ...context, id: body.requestId, provider: provider.id, type: "MODEL_GENERATION", status: "QUEUED", input: json({ kind: "casynus-ai3d", projectId: body.projectId, studio: body.studio, prompt: body.prompt.trim(), model: provider.model }) } }); }
  catch {
    try { await aiUsage.refund(ticket); } catch (error) { console.error("3D usage refund failed", error); }
    return fail3D("Generation request already exists or storage is unavailable. Open generation jobs before retrying.", 409);
  }
  try {
    const taskId = await submit3DTask(provider.id, body.prompt.trim());
    job = await prisma.aIProviderJob.update({ where: { id: job.id }, data: { status: "RUNNING", startedAt: new Date(), output: json({ taskId, phase: provider.id === "meshy" ? "preview" : "model", progress: 0 }) } });
  } catch (caught) {
    const error = caught instanceof Error && /configured|credits|permissions|quota|rejected/.test(caught.message) ? caught.message : "Provider submission could not be confirmed. Check the provider dashboard before starting another paid generation.";
    job = await prisma.aIProviderJob.update({ where: { id: job.id }, data: { status: "FAILED", error, completedAt: new Date() } });
  }
  return NextResponse.json(jobDTO(job), { status: 202 });
}
export async function refresh3DJob(context: PlatformContext, id: string, force = false) {
  let job = await prisma.aIProviderJob.findFirst({ where: owned3D(context, id) });
  if (!job) return fail3D("Generation not found.", 404);
  const input = job.input as unknown as Input, output = (job.output ?? {}) as Output;
  if (job.status === "FAILED" || job.status === "CANCELED" || (job.status === "SUCCEEDED" && !force)) return NextResponse.json(jobDTO(job));
  if (!output.taskId || output.phase === "submitting-refine") {
    if (Date.now() - job.updatedAt.getTime() > 120_000) {
      job = await prisma.aIProviderJob.update({ where: { id }, data: { status: "FAILED", error: "Provider submission was interrupted. Check the provider dashboard before retrying; a task may already exist.", completedAt: new Date() } });
    }
    return NextResponse.json(jobDTO(job));
  }
  const result = await inspect3DTask(job.provider, output.taskId);
  if (result.status === "SUCCEEDED" && job.provider === "meshy" && output.phase === "preview") {
    const claim = await prisma.aIProviderJob.updateMany({ where: { ...owned3D(context, id), status: "RUNNING", output: { path: ["phase"], equals: "preview" } }, data: { output: json({ ...output, phase: "submitting-refine", progress: 50 }) } });
    if (claim.count === 1) {
      try {
        const taskId = await submit3DTask("meshy", input.prompt, { previewTaskId: output.taskId });
        await prisma.aIProviderJob.update({ where: { id }, data: { output: json({ taskId, phase: "refine", progress: 50 }) } });
      } catch { await prisma.aIProviderJob.update({ where: { id }, data: { status: "FAILED", error: "Texture submission could not be confirmed. Check Meshy before retrying; the preview task is retained there.", completedAt: new Date() } }); }
    }
  } else {
    const progress = job.provider === "meshy" ? (output.phase === "preview" ? result.progress / 2 : 50 + result.progress / 2) : result.progress;
    await prisma.aIProviderJob.updateMany({ where: { ...owned3D(context, id), status: { in: ["RUNNING", "SUCCEEDED"] }, output: { path: ["taskId"], equals: output.taskId } }, data: { status: result.status, output: json({ ...output, progress, ...(result.modelURL ? { modelURL: result.modelURL } : {}) }), ...(result.status === "FAILED" ? { error: "The 3D provider failed or cancelled this generation.", completedAt: new Date() } : result.status === "SUCCEEDED" ? { completedAt: new Date() } : {}) } });
  }
  job = await prisma.aIProviderJob.findFirst({ where: owned3D(context, id) });
  return job ? NextResponse.json(jobDTO(job)) : fail3D("Generation not found.", 404);
}
