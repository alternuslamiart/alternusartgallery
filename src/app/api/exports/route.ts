import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, createNotification, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asJsonObject, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const sourceTypes = ["PROTOTYPE", "ASSET", "CODE_PROJECT", "CAD_DESIGN", "BLENDER_PROJECT", "PROMPT", "MIXED"] as const;
const formats = ["PNG", "JPG", "PDF", "ZIP", "JSON", "GLB", "OBJ", "HTML", "CODE_ZIP", "OTHER"] as const;

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const query = parseListQuery(request);
 const exports = await prisma.studioExport.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 ...(query.type ? { sourceType: query.type.toUpperCase() as never } : {}),
 ...(query.projectId ? { projectId: query.projectId } : {}),
 },
 orderBy: sortToOrderBy(query.sort) as never,
 take: query.limit,
 });
 return ok({ exports, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function POST(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const body = await readJsonBody(request);
 const assetId = asString(body, "assetId", { max: 80 });
 if (assetId) {
 const asset = await prisma.asset.findFirst({ where: { id: assetId, workspaceId: context.workspaceId, deletedAt: null } });
 if (!asset) return apiError("NOT_FOUND", "Asset not found.", 404);
 }
 const exportRecord = await prisma.studioExport.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 projectId: asString(body, "projectId", { max: 80 }),
 sourceType: asEnum(body, "sourceType", sourceTypes, "MIXED"),
 sourceId: asString(body, "sourceId", { max: 80 }),
 name: asString(body, "name", { required: true, max: 120 }),
 format: asEnum(body, "format", formats, "OTHER"),
 status: assetId ? "READY" : "QUEUED",
 assetId,
 metadata: asJsonObject(body, "metadata") ?? {},
 completedAt: assetId ? new Date() : undefined,
 },
 });
 await Promise.all([
 logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "export.created", entityType: "export", entityId: exportRecord.id, message: `Export "${exportRecord.name}" created.` }),
 exportRecord.status === "READY"
 ? createNotification({ workspaceId: context.workspaceId, userId: context.userId, type: "export_ready", title: "Export ready", message: `${exportRecord.name} is ready.`, actionUrl: "/exports" })
 : Promise.resolve(),
 ]);
 return ok({ export: exportRecord }, { status: 201 });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
