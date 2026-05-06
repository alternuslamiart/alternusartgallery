import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid project id.", 400);

    const project = await prisma.project.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!project) return apiError("NOT_FOUND", "Project not found.", 404);

    const exports = await prisma.studioExport.findMany({
      where: { workspaceId: context.workspaceId, projectId: id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return ok({ exports });
  } catch (error) {
    return mapUnknownError(error);
  }
}
