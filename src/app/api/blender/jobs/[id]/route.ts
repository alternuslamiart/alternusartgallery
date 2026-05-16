import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid Blender job id.", 400);
 const job = await prisma.blenderJob.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!job) return apiError("NOT_FOUND", "Blender job not found.", 404);
 return ok({ job });
 } catch (error) {
 return mapUnknownError(error);
 }
}
