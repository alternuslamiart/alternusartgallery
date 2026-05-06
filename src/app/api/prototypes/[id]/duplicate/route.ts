import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prototype id.", 400);

    const existing = await prisma.prototype.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Prototype not found.", 404);

    const prototype = await prisma.prototype.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId: existing.projectId,
        name: `${existing.name} copy`,
        type: existing.type,
        quality: existing.quality,
        status: "DRAFT",
        visibility: existing.visibility,
        brief: existing.brief,
        tags: existing.tags ?? undefined,
        designSystemId: existing.designSystemId,
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "prototype.duplicated",
      entityType: "prototype",
      entityId: prototype.id,
      message: `Prototype "${existing.name}" duplicated.`,
    });

    return ok({ prototype }, { status: 201 });
  } catch (error) {
    return mapUnknownError(error);
  }
}
