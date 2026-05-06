import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const projectTypes = ["DESIGN", "CAD", "CODE", "BLENDER", "MIXED", "OTHER"] as const;

export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const query = parseListQuery(request);

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: context.workspaceId,
        deletedAt: null,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
        ...(query.type ? { type: query.type.toUpperCase() as never } : {}),
        ...(query.status ? { status: query.status.toUpperCase() as never } : { status: { not: "DELETED" } }),
      },
      orderBy: sortToOrderBy(query.sort) as never,
      take: query.limit,
    });

    return ok({ projects, pageInfo: { limit: query.limit } });
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
    const description = asString(body, "description", { max: 2000 });
    const type = asEnum(body, "type", projectTypes, "OTHER");

    const project = await prisma.project.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        name,
        description,
        type,
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "project.created",
      entityType: "project",
      entityId: project.id,
      message: `Project "${project.name}" created.`,
    });

    return ok({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
