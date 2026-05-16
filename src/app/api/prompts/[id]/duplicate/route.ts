import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt id.", 400);
 const existing = await prisma.prompt.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!existing) return apiError("NOT_FOUND", "Prompt not found.", 404);
 const prompt = await prisma.prompt.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId: existing.projectId,
 title: `${existing.title} copy`,
 content: existing.content,
 category: existing.category,
 status: "DRAFT",
 tags: existing.tags ?? undefined,
 variables: existing.variables ?? undefined,
 },
 });
 return ok({ prompt }, { status: 201 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
