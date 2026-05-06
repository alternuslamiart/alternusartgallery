import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonObject, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const colorPresets = ["SKY_PAPER_GRAPHITE", "MINIMAL_MONO", "WARM_EDITORIAL", "ENTERPRISE_BLUE"] as const;
const typographyPresets = ["CLEAN_UI_SCALE", "EDITORIAL_SCALE", "COMPACT_DASHBOARD"] as const;
const spacingPresets = ["EIGHT_PX_RHYTHM", "COMPACT", "SPACIOUS"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid design system id.", 400);
    const designSystem = await prisma.designSystem.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!designSystem) return apiError("NOT_FOUND", "Design system not found.", 404);
    return ok({ designSystem });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid design system id.", 400);
    const existing = await prisma.designSystem.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Design system not found.", 404);

    const body = await readJsonBody(request);
    const designSystem = await prisma.designSystem.update({
      where: { id },
      data: {
        name: asString(body, "name", { max: 120 }),
        colorPreset: asEnum(body, "colorPreset", colorPresets),
        typographyPreset: asEnum(body, "typographyPreset", typographyPresets),
        spacingPreset: asEnum(body, "spacingPreset", spacingPresets),
        tokens: asJsonObject(body, "tokens"),
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "design_system.updated",
      entityType: "design_system",
      entityId: designSystem.id,
      message: `Design system "${designSystem.name}" updated.`,
    });

    return ok({ designSystem });
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
    if (!id) return apiError("VALIDATION_ERROR", "Invalid design system id.", 400);
    const existing = await prisma.designSystem.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Design system not found.", 404);
    await prisma.designSystem.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return mapUnknownError(error);
  }
}
