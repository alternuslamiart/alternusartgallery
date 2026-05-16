import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const languages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "GO", "RUST", "HTML", "CSS", "OTHER"] as const;

async function getScopedFile(id: string, workspaceId: string) {
 const file = await prisma.codeFile.findUnique({ where: { id } });
 if (!file) return null;
 const project = await prisma.codeProject.findFirst({ where: { id: file.codeProjectId, workspaceId } });
 return project ? file : null;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid code file id.", 400);
 const existing = await getScopedFile(id, context.workspaceId);
 if (!existing) return apiError("NOT_FOUND", "Code file not found.", 404);
 const body = await readJsonBody(request);
 const file = await prisma.codeFile.update({
 where: { id },
 data: {
 language: asEnum(body, "language", languages),
 content: asString(body, "content", { max: 20000 }),
 },
 });
 return ok({ file });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid code file id.", 400);
 const existing = await getScopedFile(id, context.workspaceId);
 if (!existing) return apiError("NOT_FOUND", "Code file not found.", 404);
 await prisma.codeFile.delete({ where: { id } });
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
