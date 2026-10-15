import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAIChatUserId } from "@/lib/ai-chat-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARACTERS = 1_500_000;
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 500;
const MAX_MESSAGE_CHARACTERS = 32_000;
const MAX_TITLE_CHARACTERS = 80;

type LegacyMessage = { role: "USER" | "ASSISTANT"; content: string };
type LegacyConversation = { legacyId: string; title: string; model: string | null; messages: LegacyMessage[] };

function parseLegacyConversations(value: unknown): LegacyConversation[] | null {
  if (!Array.isArray(value) || value.length > MAX_CONVERSATIONS) return null;
  let totalCharacters = 0;
  const conversations: LegacyConversation[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || record.id.length < 1 || record.id.length > 200) return null;
    if (typeof record.title !== "string" || !Array.isArray(record.messages)) return null;
    if (record.messages.length > MAX_MESSAGES_PER_CONVERSATION) return null;

    const messages: LegacyMessage[] = [];
    for (const entry of record.messages) {
      if (!entry || typeof entry !== "object") return null;
      const message = entry as Record<string, unknown>;
      if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string") return null;
      if (!message.content || message.content.length > MAX_MESSAGE_CHARACTERS) return null;
      totalCharacters += message.content.length;
      if (totalCharacters > MAX_BODY_CHARACTERS) return null;
      messages.push({ role: message.role === "user" ? "USER" : "ASSISTANT", content: message.content });
    }

    const title = Array.from(record.title.replace(/[\u0000-\u001f\u007f]/g, " ").trim()).slice(0, MAX_TITLE_CHARACTERS).join("");
    const model = typeof record.model === "string" && record.model.length <= 100 ? record.model : null;
    conversations.push({
      legacyId: record.id,
      title: title || "New Chat",
      model,
      messages,
    });
  }

  return conversations;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to import chat history." }, { status: 401 });

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_CHARACTERS * 4) {
      return NextResponse.json({ error: "Legacy chat history is too large to import." }, { status: 413 });
    }
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_CHARACTERS * 4) {
      return NextResponse.json({ error: "Legacy chat history is too large to import." }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    const conversations = body && typeof body === "object" && "conversations" in body
      ? parseLegacyConversations((body as { conversations: unknown }).conversations)
      : null;
    if (!conversations) {
      return NextResponse.json({ error: "Legacy chat history is invalid or exceeds import limits." }, { status: 400 });
    }

    const imported = await prisma.$transaction(async (transaction) => {
      let count = 0;
      for (const conversation of conversations) {
        const alreadyImported = await transaction.aIChatConversation.findFirst({
          where: { userId, legacyId: conversation.legacyId },
          select: { id: true },
        });
        if (alreadyImported) continue;

        const createdAt = new Date();
        await transaction.aIChatConversation.create({
          data: {
            userId,
            legacyId: conversation.legacyId,
            title: conversation.title,
            model: conversation.model,
            createdAt,
            updatedAt: createdAt,
            lastMessageAt: createdAt,
            messages: {
              create: conversation.messages.map((message, index) => ({
                userId,
                requestId: randomUUID(),
                role: message.role,
                content: message.content,
                status: "COMPLETED",
                createdAt: new Date(createdAt.getTime() + index),
                updatedAt: new Date(createdAt.getTime() + index),
                model: conversation.model,
              })),
            },
          },
        });
        count += 1;
      }
      return count;
    });

    return NextResponse.json({ imported });
  } catch (error) {
    console.error("Legacy AI chat history import failed:", error);
    return NextResponse.json({ error: "Legacy chat history could not be imported." }, { status: 500 });
  }
}
