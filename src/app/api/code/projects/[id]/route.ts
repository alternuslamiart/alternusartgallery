import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

const languages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "GO", "RUST", "HTML", "CSS", "OTHER"] as const;
const statuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
 const project = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!project) return apiError("NOT_FOUND", "Code project not found.", 404);
 return ok({ project });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
 const existing = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!existing) return apiError("NOT_FOUND", "Code project not found.", 404);
 const body = await readJsonBody(request);
 const project = await prisma.codeProject.update({
 where: { id },
 data: {
 name: asString(body, "name", { max: 120 }),
 description: asString(body, "description", { max: 2000 }),
 language: asEnum(body, "language", languages),
 framework: asString(body, "framework", { max: 80 }),
 status: asEnum(body, "status", statuses),
 },
 });
 return ok({ project });
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
 if (!id) return apiError("VALIDATION_ERROR", "Invalid code project id.", 400);
 const existing = await prisma.codeProject.findFirst({ where: { id, workspaceId: context.workspaceId } });
 if (!existing) return apiError("NOT_FOUND", "Code project not found.", 404);
 const project = await prisma.codeProject.update({ where: { id }, data: { status: "ARCHIVED" } });
 return ok({ project });
 } catch (error) {
 return mapUnknownError(error);
 }
}
