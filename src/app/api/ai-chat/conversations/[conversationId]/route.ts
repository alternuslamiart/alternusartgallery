import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAIChatUserId } from "@/lib/ai-chat-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: { conversationId: string } };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 80;

function invalidId(conversationId: string) {
  return !UUID_PATTERN.test(conversationId);
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to access chat history." }, { status: 401 });
    if (invalidId(params.conversationId)) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    const conversation = await prisma.aIChatConversation.findFirst({
      where: { id: params.conversationId, userId },
      include: {
        messages: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true, role: true, content: true, status: true, model: true, createdAt: true },
        },
      },
    });
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("AI chat conversation load failed:", error);
    return NextResponse.json({ error: "Conversation could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to update chat history." }, { status: 401 });
    if (invalidId(params.conversationId)) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    const title = body && typeof body === "object" && "title" in body && typeof body.title === "string"
      ? body.title.trim().replace(/[\u0000-\u001f\u007f]/g, "")
      : "";
    if (!title || Array.from(title).length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title must be between 1 and ${MAX_TITLE_LENGTH} characters.` }, { status: 400 });
    }

    const result = await prisma.aIChatConversation.updateMany({
      where: { id: params.conversationId, userId },
      data: { title },
    });
    if (!result.count) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ conversation: { id: params.conversationId, title } });
  } catch (error) {
    console.error("AI chat conversation update failed:", error);
    return NextResponse.json({ error: "Conversation could not be updated." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to delete chat history." }, { status: 401 });
    if (invalidId(params.conversationId)) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    const result = await prisma.aIChatConversation.deleteMany({
      where: { id: params.conversationId, userId },
    });
    if (!result.count) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AI chat conversation deletion failed:", error);
    return NextResponse.json({ error: "Conversation could not be deleted." }, { status: 500 });
  }
}
