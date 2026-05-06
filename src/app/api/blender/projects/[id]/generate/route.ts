import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, createNotification, isApiResponse, logActivity, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid Blender project id.", 400);
    const project = await prisma.blenderProject.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!project) return apiError("NOT_FOUND", "Blender project not found.", 404);
    const now = new Date();
    const job = await prisma.blenderJob.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        blenderProjectId: id,
        status: "SUCCEEDED",
        input: { blenderProjectId: id, settings: project.settings ?? {} },
        output: { provider: "local_stub", message: "Blender provider not configured. Job recorded only." },
        startedAt: now,
        completedAt: now,
      },
    });
    await prisma.blenderProject.update({ where: { id }, data: { status: "READY" } });
    await Promise.all([
      logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "blender.job_completed", entityType: "blender_job", entityId: job.id, message: "Blender stub job completed." }),
      createNotification({ workspaceId: context.workspaceId, userId: context.userId, type: "job_completed", title: "Blender job recorded", message: "Blender provider is not configured; a stub job was recorded." }),
    ]);
    return ok({ job }, { status: 201 });
  } catch (error) {
    return mapUnknownError(error);
  }
}
