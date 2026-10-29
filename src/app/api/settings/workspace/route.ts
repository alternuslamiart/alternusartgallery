import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const [workspace, settings, members] = await Promise.all([
      prisma.workspace.findUnique({ where: { id: context.workspaceId } }),
      prisma.workspaceSettings.findUnique({ where: { workspaceId: context.workspaceId } }),
      prisma.workspaceMember.findMany({
        where: { workspaceId: context.workspaceId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const memberUserIds = members.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: memberUserIds } },
      select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedMembers = members.map((m) => {
      const u = userMap.get(m.userId);
      return {
        id: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
        name: u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email : "Unknown Member",
        email: u?.email || "",
        avatarUrl: u?.avatarUrl || null,
      };
    });

    return ok({ workspace, workspaceSettings: settings, members: enrichedMembers });
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
    const defaultVisibility = asEnum(body, "defaultVisibility", ["PRIVATE", "SHARED"] as const);
    const storageProvider = asString(body, "storageProvider", { max: 32 });
    const aiProvider = asString(body, "aiProvider", { max: 64 });
    const allowedAssetTypes = asJsonArray(body, "allowedAssetTypes");

    const settingsData = { defaultVisibility, storageProvider, aiProvider, allowedAssetTypes };
    const hasSettings = Object.values(settingsData).some((value) => value !== undefined);

    if (!hasSettings && !name) {
      return apiError("VALIDATION_ERROR", "No supported workspace fields were provided.", 400);
    }

    if (name) {
      await prisma.workspace.update({
        where: { id: context.workspaceId },
        data: { name },
      });
    }

    let workspaceSettings = null;
    if (hasSettings) {
      workspaceSettings = await prisma.workspaceSettings.upsert({
        where: { workspaceId: context.workspaceId },
        update: settingsData,
        create: { workspaceId: context.workspaceId, ...settingsData },
      });
    } else {
      workspaceSettings = await prisma.workspaceSettings.findUnique({ where: { workspaceId: context.workspaceId } });
    }

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "settings.workspace_updated",
      entityType: "workspace_settings",
      entityId: context.workspaceId,
      message: "Workspace settings updated.",
    });

    const workspace = await prisma.workspace.findUnique({ where: { id: context.workspaceId } });

    return ok({ workspace, workspaceSettings });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
