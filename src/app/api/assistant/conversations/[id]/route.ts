import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asEnum, asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid conversation id.", 400);
 const conversation = await prisma.assistantConversation.findFirst({ where: { id, workspaceId: context.workspaceId, userId: context.userId } });
 if (!conversation) return apiError("NOT_FOUND", "Conversation not found.", 404);
 const messages = await prisma.assistantMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } });
 return ok({ conversation, messages });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid conversation id.", 400);
 const existing = await prisma.assistantConversation.findFirst({ where: { id, workspaceId: context.workspaceId, userId: context.userId, status: "ACTIVE" } });
 if (!existing) return apiError("NOT_FOUND", "Conversation not found.", 404);
 const body = await readJsonBody(request);
 for (const key of ["pinned", "unread"]) {
 if (body[key] !== undefined && typeof body[key] !== "boolean") throw new ValidationError(`${key} must be a boolean.`);
 }
 const projectId = body.projectId === null ? null : body.projectId === undefined ? undefined : asString(body, "projectId", { required: true, max: 120 });
 if (projectId !== undefined && projectId !== null) {
 const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId: context.workspaceId, deletedAt: null, status: { not: "DELETED" } } });
 if (!project) return apiError("NOT_FOUND", "Project not found.", 404);
 }
 const conversation = await prisma.assistantConversation.update({
 where: { id },
 data: {
 title: body.title === undefined ? undefined : asString(body, "title", { required: true, max: 120 }),
 pinned: body.pinned as boolean | undefined,
 unread: body.unread as boolean | undefined,
 projectId,
 status: asEnum(body, "status", ["ACTIVE", "ARCHIVED"] as const),
 },
 });
 return ok({ conversation });
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
 if (!id) return apiError("VALIDATION_ERROR", "Invalid conversation id.", 400);
 const existing = await prisma.assistantConversation.findFirst({ where: { id, workspaceId: context.workspaceId, userId: context.userId } });
 if (!existing) return apiError("NOT_FOUND", "Conversation not found.", 404);
 await prisma.assistantConversation.update({ where: { id }, data: { status: "ARCHIVED" } });
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
