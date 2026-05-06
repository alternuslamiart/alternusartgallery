import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, createNotification, isApiResponse, logActivity, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid CAD design id.", 400);
    const design = await prisma.cadDesign.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!design) return apiError("NOT_FOUND", "CAD design not found.", 404);
    const now = new Date();
    const job = await prisma.cadJob.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        cadDesignId: id,
        status: "SUCCEEDED",
        input: { cadDesignId: id, settings: design.settings ?? {} },
        output: { provider: "local_stub", message: "CAD provider not configured. Job recorded only." },
        startedAt: now,
        completedAt: now,
      },
    });
    await prisma.cadDesign.update({ where: { id }, data: { status: "READY" } });
    await Promise.all([
      logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "cad.job_completed", entityType: "cad_job", entityId: job.id, message: "CAD stub job completed." }),
      createNotification({ workspaceId: context.workspaceId, userId: context.userId, type: "job_completed", title: "CAD job recorded", message: "CAD provider is not configured; a stub job was recorded." }),
    ]);
    return ok({ job }, { status: 201 });
  } catch (error) {
    return mapUnknownError(error);
  }
}
