import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { asString, parseListQuery, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const query = parseListQuery(request);
 const conversations = await prisma.assistantConversation.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.search ? { title: { contains: query.search, mode: "insensitive" } } : {}),
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 },
 orderBy: { updatedAt: "desc" },
 take: query.limit,
 });
 return ok({ conversations, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}

export async function POST(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const body = await readJsonBody(request);
 const title = asString(body, "title", { max: 120 }) ?? "New conversation";
 const conversation = await prisma.assistantConversation.create({
 data: {
 workspaceId: context.workspaceId,
 userId: context.userId,
 title,
 status: "ACTIVE",
 },
 });
 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "assistant.conversation_created",
 entityType: "assistant_conversation",
 entityId: conversation.id,
 message: `Assistant conversation "${conversation.title}" created.`,
 });
 return ok({ conversation }, { status: 201 });
 } catch (error) {
 if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
 return mapUnknownError(error);
 }
}
