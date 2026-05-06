import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid job id.", 400);

    const existing = await prisma.aIProviderJob.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!existing) return apiError("NOT_FOUND", "Job not found.", 404);
    if (!["QUEUED", "RUNNING"].includes(existing.status)) {
      return apiError("CONFLICT", "Only queued or running jobs can be canceled.", 409);
    }

    const job = await prisma.aIProviderJob.update({
      where: { id },
      data: { status: "CANCELED", completedAt: new Date() },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "job.canceled",
      entityType: "job",
      entityId: job.id,
      message: "Job canceled.",
    });

    return ok({ job });
  } catch (error) {
    return mapUnknownError(error);
  }
}
