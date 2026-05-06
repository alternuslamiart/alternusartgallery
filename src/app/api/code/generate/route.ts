import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asJsonObject, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const prompt = asString(body, "prompt", { required: true, max: 20000 });
    const codeProjectId = asString(body, "codeProjectId", { max: 80 });
    if (codeProjectId) {
      const project = await prisma.codeProject.findFirst({ where: { id: codeProjectId, workspaceId: context.workspaceId } });
      if (!project) return apiError("NOT_FOUND", "Code project not found.", 404);
    }
    const now = new Date();
    const job = await prisma.codeGenerationJob.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        codeProjectId,
        prompt,
        status: "SUCCEEDED",
        input: asJsonObject(body, "input") ?? {},
        output: { provider: "local_stub", message: "Code provider not configured. No code was executed." },
        startedAt: now,
        completedAt: now,
      },
    });
    await logActivity({ workspaceId: context.workspaceId, userId: context.userId, action: "code.job_completed", entityType: "code_generation_job", entityId: job.id, message: "Code generation stub job completed." });
    return ok({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
