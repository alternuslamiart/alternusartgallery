import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, createNotification, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { deleteStoredFile, storeAssetFile } from "@/lib/platform/storage";
import { asJsonArray, asString, parseListQuery, sortToOrderBy, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const query = parseListQuery(request);
    const assets = await prisma.asset.findMany({
      where: {
        workspaceId: context.workspaceId,
        deletedAt: null,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { filename: { contains: query.search, mode: "insensitive" } },
                { originalFilename: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(query.type ? { type: query.type.toUpperCase() as never } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {}),
      },
      orderBy: sortToOrderBy(query.sort) as never,
      take: query.limit,
    });

    return ok({
      assets: assets.map((asset) => ({
        ...asset,
        previewUrl: `/api/assets/${asset.id}/preview`,
        downloadUrl: `/api/assets/${asset.id}/download`,
      })),
      pageInfo: { limit: query.limit },
    });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return apiError("UNSUPPORTED_MEDIA_TYPE", "Asset upload requires multipart/form-data.", 415);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("VALIDATION_ERROR", "file is required.", 400);
    const projectId = typeof form.get("projectId") === "string" ? String(form.get("projectId")) : undefined;
    const nameFromForm = typeof form.get("name") === "string" ? String(form.get("name")).trim() : undefined;

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId: context.workspaceId, deletedAt: null } });
      if (!project) return apiError("NOT_FOUND", "Project not found.", 404);
    }

    const stored = await storeAssetFile(file, context.workspaceId);
    const asset = await prisma.asset.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId,
        name: nameFromForm || stored.originalFilename.replace(/\.[^.]+$/, ""),
        type: stored.type,
        filename: stored.filename,
        originalFilename: stored.originalFilename,
        mimeType: stored.mimeType,
        extension: stored.extension,
        sizeBytes: stored.sizeBytes,
        storageProvider: "LOCAL",
        storageKey: stored.storageKey,
        checksum: stored.checksum,
        status: "READY",
        tags: [],
        metadata: {},
      },
    });

    await Promise.all([
      logActivity({
        workspaceId: context.workspaceId,
        userId: context.userId,
        action: "asset.uploaded",
        entityType: "asset",
        entityId: asset.id,
        message: `Asset "${asset.name}" uploaded.`,
      }),
      createNotification({
        workspaceId: context.workspaceId,
        userId: context.userId,
        type: "asset_uploaded",
        title: "Asset uploaded",
        message: `${asset.name} is ready in Asset Library.`,
        actionUrl: "/asset-library",
      }),
    ]);

    return ok({ asset: { ...asset, previewUrl: `/api/assets/${asset.id}/preview`, downloadUrl: `/api/assets/${asset.id}/download` } }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      const status = error.message.includes("larger") ? 413 : error.message.includes("Unsupported") ? 415 : 400;
      return apiError(status === 413 ? "PAYLOAD_TOO_LARGE" : status === 415 ? "UNSUPPORTED_MEDIA_TYPE" : "VALIDATION_ERROR", error.message, status, error.details);
    }
    return mapUnknownError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const id = asString(body, "id", { required: true, max: 80 });
    const existing = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Asset not found.", 404);

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name: asString(body, "name", { max: 120 }),
        tags: asJsonArray(body, "tags"),
      },
    });
    return ok({ asset });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const id = asString(body, "id", { required: true, max: 80 });
    const existing = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!existing) return apiError("NOT_FOUND", "Asset not found.", 404);
    await prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });
    await deleteStoredFile(existing.storageKey);
    return ok({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
