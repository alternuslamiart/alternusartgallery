import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonArray, asJsonObject, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const categories = ["DESIGN", "IMAGE", "VIDEO", "CODE", "CAD", "BLENDER", "MARKETING", "SYSTEM", "OTHER"] as const;
const statuses = ["DRAFT", "SAVED", "ARCHIVED"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt id.", 400);
    const prompt = await prisma.prompt.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!prompt) return apiError("NOT_FOUND", "Prompt not found.", 404);
    return ok({ prompt });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt id.", 400);
    const existing = await prisma.prompt.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Prompt not found.", 404);
    const body = await readJsonBody(request);
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        title: asString(body, "title", { max: 120 }),
        content: asString(body, "content", { max: 20000 }),
        category: asEnum(body, "category", categories),
        status: asEnum(body, "status", statuses),
        tags: asJsonArray(body, "tags"),
        variables: asJsonObject(body, "variables"),
        version: body.content ? { increment: 1 } : undefined,
      },
    });
    return ok({ prompt });
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
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt id.", 400);
    const existing = await prisma.prompt.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Prompt not found.", 404);
    const prompt = await prisma.prompt.update({ where: { id }, data: { status: "ARCHIVED" } });
    return ok({ prompt });
  } catch (error) {
    return mapUnknownError(error);
  }
}
