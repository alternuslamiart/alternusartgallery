import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, assertSafePath, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const languages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "GO", "RUST", "HTML", "CSS", "OTHER"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
    const project = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!project) return apiError("NOT_FOUND", "Code project not found.", 404);
    const files = await prisma.codeFile.findMany({ where: { codeProjectId: id }, orderBy: { path: "asc" } });
    return ok({ files });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
    const project = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!project) return apiError("NOT_FOUND", "Code project not found.", 404);
    const body = await readJsonBody(request);
    const filePath = asString(body, "path", { required: true, max: 260 });
    assertSafePath(filePath);
    const file = await prisma.codeFile.create({
      data: {
        codeProjectId: id,
        path: filePath,
        language: asEnum(body, "language", languages, "OTHER"),
        content: asString(body, "content", { max: 20000 }) ?? "",
      },
    });
    return ok({ file }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
