import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, parseId, requirePlatformContext } from "@/lib/platform/api";
import { canPreviewInline, contentDisposition, readStoredFile } from "@/lib/platform/storage";

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
 if (!canPreviewInline(asset.mimeType)) return apiError("UNSUPPORTED_MEDIA_TYPE", "This asset type cannot be previewed inline.", 415);
 const file = await readStoredFile(asset.storageKey);
 return new NextResponse(file, {
 headers: {
 "Content-Type": asset.mimeType,
 "Content-Length": String(file.length),
 "Content-Disposition": contentDisposition(asset.originalFilename, true),
 },
 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
