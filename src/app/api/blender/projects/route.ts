import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asJsonArray, asJsonObject, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const query = parseListQuery(request);
    const projects = await prisma.blenderProject.findMany({
      where: {
        workspaceId: context.workspaceId,
        deletedAt: null,
        ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
        ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {}),
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
    const project = await prisma.blenderProject.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId: asString(body, "projectId", { max: 80 }),
        name,
        description: asString(body, "description", { max: 2000 }),
        inputAssetIds: asJsonArray(body, "inputAssetIds") ?? [],
        settings: asJsonObject(body, "settings") ?? {},
      },
    });
    await logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "blender.created", entityType: "blender_project", entityId: project.id, message: `Blender project "${project.name}" created.` });
    return ok({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
