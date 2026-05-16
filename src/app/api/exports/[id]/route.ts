import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid export id.", 400);
 const exportRecord = await prisma.studioExport.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!exportRecord) return apiError("NOT_FOUND", "Export not found.", 404);
 return ok({ export: exportRecord });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid export id.", 400);
 const existing = await prisma.studioExport.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!existing) return apiError("NOT_FOUND", "Export not found.", 404);
 await prisma.studioExport.delete({ where: { id } });
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
