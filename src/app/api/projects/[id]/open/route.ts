import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid project id.", 400);

 const existing = await prisma.project.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
 if (!existing) return apiError("NOT_FOUND", "Project not found.", 404);

 const project = await prisma.project.update({ where: { id }, data: { lastOpenedAt: new Date() } });
 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "project.opened",
 entityType: "project",
 entityId: id,
 message: `Project "${project.name}" opened.`,
 });
 return ok({ project });
 } catch (error) {
 return mapUnknownError(error);
 }
}
