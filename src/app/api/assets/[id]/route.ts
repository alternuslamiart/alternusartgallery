import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { deleteStoredFile } from "@/lib/platform/storage";
import { asJsonArray, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid asset id.", 400);
 const asset = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
 if (!asset) return apiError("NOT_FOUND", "Asset not found.", 404);
 return ok({ asset: { ...asset, previewUrl: `/api/assets/${asset.id}/preview`, downloadUrl: `/api/assets/${asset.id}/download` } });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid asset id.", 400);
 const existing = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
 if (!existing) return apiError("NOT_FOUND", "Asset not found.", 404);
 const body = await readJsonBody(request);

 const asset = await prisma.asset.update({
 where: { id },
 data: {
 name: asString(body, "name", { max: 120 }),
 tags: asJsonArray(body, "tags"),
 },
 });

 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "asset.updated",
 entityType: "asset",
 entityId: id,
 message: `Asset "${asset.name}" updated.`,
 });

 return ok({ asset });
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
 if (!id) return apiError("VALIDATION_ERROR", "Invalid asset id.", 400);
 const existing = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
 if (!existing) return apiError("NOT_FOUND", "Asset not found.", 404);

 await prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });
 await deleteStoredFile(existing.storageKey);
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
