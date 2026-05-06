import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const prototypeTypes = ["WEBSITE", "MOBILE_APP", "DASHBOARD", "LANDING_PAGE", "DESIGN_SYSTEM"] as const;
const qualities = ["WIREFRAME", "HIGH_FIDELITY"] as const;
const statuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const visibilities = ["PRIVATE", "SHARED"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prototype id.", 400);

    const prototype = await prisma.prototype.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!prototype) return apiError("NOT_FOUND", "Prototype not found.", 404);
    const designSystem = prototype.designSystemId
      ? await prisma.designSystem.findFirst({ where: { id: prototype.designSystemId, workspaceId: context.workspaceId } })
      : null;
    return ok({ prototype, designSystem });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prototype id.", 400);

    const existing = await prisma.prototype.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Prototype not found.", 404);

    const body = await readJsonBody(request);
    const prototype = await prisma.prototype.update({
      where: { id },
      data: {
        name: asString(body, "name", { max: 120 }),
        type: asEnum(body, "type", prototypeTypes),
        quality: asEnum(body, "quality", qualities),
        status: asEnum(body, "status", statuses),
        visibility: asEnum(body, "visibility", visibilities),
        brief: asString(body, "brief", { max: 5000 }),
        tags: asJsonArray(body, "tags"),
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "prototype.updated",
      entityType: "prototype",
      entityId: prototype.id,
      message: `Prototype "${prototype.name}" updated.`,
    });

    return ok({ prototype });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prototype id.", 400);

    const existing = await prisma.prototype.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Prototype not found.", 404);
    const prototype = await prisma.prototype.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "prototype.deleted",
      entityType: "prototype",
      entityId: id,
      message: `Prototype "${existing.name}" deleted.`,
    });

    return ok({ prototype });
  } catch (error) {
    return mapUnknownError(error);
  }
}
