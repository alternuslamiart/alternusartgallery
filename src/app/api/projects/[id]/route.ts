import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const projectTypes = ["DESIGN", "CAD", "CODE", "BLENDER", "MIXED", "OTHER"] as const;
const projectStatuses = ["ACTIVE", "ARCHIVED", "DELETED"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid project id.", 400);

    const project = await prisma.project.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!project) return apiError("NOT_FOUND", "Project not found.", 404);
    return ok({ project });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid project id.", 400);

    const existing = await prisma.project.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Project not found.", 404);

    const body = await readJsonBody(request);
    const name = asString(body, "name", { max: 120 });
    const description = asString(body, "description", { max: 2000 });
    const type = asEnum(body, "type", projectTypes);
    const status = asEnum(body, "status", projectStatuses);

    const project = await prisma.project.update({
      where: { id },
      data: { name, description, type, status },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "project.updated",
      entityType: "project",
      entityId: project.id,
      message: `Project "${project.name}" updated.`,
    });

    return ok({ project });
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
    if (!id) return apiError("VALIDATION_ERROR", "Invalid project id.", 400);

    const existing = await prisma.project.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Project not found.", 404);

    const project = await prisma.project.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "project.deleted",
      entityType: "project",
      entityId: id,
      message: `Project "${existing.name}" deleted.`,
    });

    return ok({ project });
  } catch (error) {
    return mapUnknownError(error);
  }
}
