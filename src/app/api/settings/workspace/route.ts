import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const body = await readJsonBody(request);
    const defaultVisibility = asEnum(body, "defaultVisibility", ["PRIVATE", "SHARED"] as const);
    const storageProvider = asString(body, "storageProvider", { max: 32 });
    const aiProvider = asString(body, "aiProvider", { max: 64 });
    const allowedAssetTypes = asJsonArray(body, "allowedAssetTypes");

    const data = { defaultVisibility, storageProvider, aiProvider, allowedAssetTypes };
    if (Object.values(data).every((value) => value === undefined)) {
      return apiError("VALIDATION_ERROR", "No supported workspace settings fields were provided.", 400);
    }

    const workspaceSettings = await prisma.workspaceSettings.upsert({
      where: { workspaceId: context.workspaceId },
      update: data,
      create: { workspaceId: context.workspaceId, ...data },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "settings.workspace_updated",
      entityType: "workspace_settings",
      entityId: context.workspaceId,
      message: "Workspace settings updated.",
    });

    return ok({ workspaceSettings });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
