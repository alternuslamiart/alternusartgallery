import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, parseId, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { assistantStubReply, createStubJob } from "@/lib/platform/stub-provider";
import { asString, ValidationError } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const id = parseId(params);
    if (!id) return apiError("VALIDATION_ERROR", "Invalid conversation id.", 400);
    const conversation = await prisma.assistantConversation.findFirst({ where: { id, workspaceId: context.workspaceId } });
    if (!conversation) return apiError("NOT_FOUND", "Conversation not found.", 404);
    const body = await readJsonBody(request);
    const content = asString(body, "content", { required: true, max: 20000 });

    const now = new Date();
    const userMessage = await prisma.assistantMessage.create({
      data: { conversationId: id, role: "USER", content },
    });
    const reply = assistantStubReply(content);
    const assistantMessage = await prisma.assistantMessage.create({
      data: { conversationId: id, role: "ASSISTANT", content: reply, metadata: { provider: "local_stub" } },
    });
    const job = await createStubJob(context, "CHAT", { conversationId: id, messageId: userMessage.id, content }, "Assistant local stub response recorded.");
    await prisma.assistantConversation.update({
      where: { id },
      data: { lastMessageAt: now, title: conversation.title === "New conversation" ? content.slice(0, 80) : conversation.title },
    });
    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "assistant.message_created",
      entityType: "assistant_conversation",
      entityId: id,
      message: "Assistant message recorded.",
    });

    return ok({ userMessage, assistantMessage, job }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) return apiError("VALIDATION_ERROR", error.message, 400, error.details);
    return mapUnknownError(error);
  }
}
