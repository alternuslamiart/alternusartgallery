import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asJsonObject, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const statuses = ["DRAFT", "QUEUED", "GENERATING", "READY", "FAILED", "ARCHIVED"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid CAD design id.", 400);
    const design = await prisma.cadDesign.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!design) return apiError("NOT_FOUND", "CAD design not found.", 404);
    return ok({ design });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid CAD design id.", 400);
    const existing = await prisma.cadDesign.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "CAD design not found.", 404);
    const body = await readJsonBody(request);
    const design = await prisma.cadDesign.update({
      where: { id },
      data: {
        name: asString(body, "name", { max: 120 }),
        description: asString(body, "description", { max: 2000 }),
        status: asEnum(body, "status", statuses),
        inputAssetIds: asJsonArray(body, "inputAssetIds"),
        settings: asJsonObject(body, "settings"),
      },
    });
    return ok({ design });
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
    if (!id) return apiError("VALIDATION_ERROR", "Invalid CAD design id.", 400);
    const existing = await prisma.cadDesign.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "CAD design not found.", 404);
    const design = await prisma.cadDesign.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
    return ok({ design });
  } catch (error) {
    return mapUnknownError(error);
  }
}
