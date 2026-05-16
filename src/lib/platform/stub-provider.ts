import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification, logActivity, PlatformContext } from "./api";

export async function createStubJob(
 context: PlatformContext,
 type: Parameters<typeof prisma.aIProviderJob.create>[0]["data"]["type"],
 input: Prisma.InputJsonValue,
 message: string,
) {
 const now = new Date();
 const job = await prisma.aIProviderJob.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 provider: "local_stub",
 type,
 status: "SUCCEEDED",
 input,
 output: {
 provider: "local_stub",
 message,
 },
 startedAt: now,
 completedAt: now,
 },
 });

 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "job.completed",
 entityType: "job",
 entityId: job.id,
 message,
 });

 await createNotification({
 workspaceId: context.workspaceId,
 userId: context.userId,
 type: "job_completed",
 title: "Stub job completed",
 message,
 });

 return job;
}

export function assistantStubReply(prompt: string) {
 const trimmed = prompt.trim();
 return trimmed
 ? `Local stub recorded your request: "${trimmed.slice(0, 240)}". Connect an AI provider to generate real responses.`
 : "Local stub recorded an empty prompt. Connect an AI provider to generate real responses.";
}
