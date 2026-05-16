import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid asset id.", 400);
 const existing = await prisma.asset.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
 if (!existing) return apiError("NOT_FOUND", "Asset not found.", 404);

 return apiError("CONFLICT", "Local storage asset duplication is not enabled because it must copy binary files safely.", 409);
 } catch (error) {
 return mapUnknownError(error);
 }
}
