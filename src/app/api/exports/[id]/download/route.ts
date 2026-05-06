import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid export id.", 400);
    const exportRecord = await prisma.studioExport.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!exportRecord) return apiError("NOT_FOUND", "Export not found.", 404);
    if (!exportRecord.assetId) return apiError("CONFLICT", "This export does not have a downloadable asset yet.", 409);
    return Response.redirect(new URL(`/api/assets/${exportRecord.assetId}/download`, _request.url));
  } catch (error) {
    return mapUnknownError(error);
  }
}
