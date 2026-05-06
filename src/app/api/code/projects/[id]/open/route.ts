import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
    const existing = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Code project not found.", 404);
    const project = await prisma.codeProject.update({ where: { id }, data: { lastOpenedAt: new Date() } });
    return ok({ project });
  } catch (error) {
    return mapUnknownError(error);
  }
}
