import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt id.", 400);
 const prompt = await prisma.prompt.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!prompt) return apiError("NOT_FOUND", "Prompt not found.", 404);
 const input = await readJsonBody(request);
 const now = new Date();
 const run = await prisma.promptRun.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 promptId: id,
 provider: "local_stub",
 status: "SUCCEEDED",
 input: input as Prisma.InputJsonObject,
 output: { provider: "local_stub", message: "Prompt run recorded. Configure an AI provider for generated output." },
 completedAt: now,
 },
 });
 await prisma.prompt.update({ where: { id }, data: { lastUsedAt: now } });
 return ok({ run }, { status: 201 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
