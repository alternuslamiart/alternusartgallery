import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid prompt run id.", 400);
    const run = await prisma.promptRun.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!run) return apiError("NOT_FOUND", "Prompt run not found.", 404);
    return ok({ run });
  } catch (error) {
    return mapUnknownError(error);
  }
}
