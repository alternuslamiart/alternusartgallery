import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const workspace = await prisma.workspace.findUnique({ where: { id: context.workspaceId } });
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: context.workspaceId, userId: context.userId } },
    });

    return ok({ workspace, membership: member });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const body = await readJsonBody(request);
    const name = asString(body, "name", { max: 120 });
    if (!name) return apiError("VALIDATION_ERROR", "No supported workspace fields were provided.", 400);

    const workspace = await prisma.workspace.update({
      where: { id: context.workspaceId },
      data: { name },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "workspace.updated",
      entityType: "workspace",
      entityId: workspace.id,
      message: `Workspace renamed to ${workspace.name}.`,
    });

    return ok({ workspace });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
