import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonObject, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const colorPresets = ["SKY_PAPER_GRAPHITE", "MINIMAL_MONO", "WARM_EDITORIAL", "ENTERPRISE_BLUE"] as const;
const typographyPresets = ["CLEAN_UI_SCALE", "EDITORIAL_SCALE", "COMPACT_DASHBOARD"] as const;
const spacingPresets = ["EIGHT_PX_RHYTHM", "COMPACT", "SPACIOUS"] as const;

export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const query = parseListQuery(request);
    const designSystems = await prisma.designSystem.findMany({
      where: {
        workspaceId: context.workspaceId,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {}),
      },
      orderBy: sortToOrderBy(query.sort) as never,
      take: query.limit,
    });
    return ok({ designSystems, pageInfo: { limit: query.limit } });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const name = asString(body, "name", { required: true, max: 120 });
    const projectId = asString(body, "projectId", { max: 80 });
    const prototypeId = asString(body, "prototypeId", { max: 80 });

    const designSystem = await prisma.designSystem.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId,
        prototypeId,
        name,
        colorPreset: asEnum(body, "colorPreset", colorPresets, "SKY_PAPER_GRAPHITE"),
        typographyPreset: asEnum(body, "typographyPreset", typographyPresets, "CLEAN_UI_SCALE"),
        spacingPreset: asEnum(body, "spacingPreset", spacingPresets, "EIGHT_PX_RHYTHM"),
        tokens: asJsonObject(body, "tokens") ?? {},
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "design_system.created",
      entityType: "design_system",
      entityId: designSystem.id,
      message: `Design system "${designSystem.name}" created.`,
    });

    return ok({ designSystem }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
