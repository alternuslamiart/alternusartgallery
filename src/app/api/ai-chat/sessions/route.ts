import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { isApiResponse, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const conversations = await prisma.assistantConversation.findMany({
      where: { workspaceId: context.workspaceId, userId: context.userId, status: "ACTIVE", id: { startsWith: "chat-" } },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }], take: 100,
    });
    const messages = await prisma.assistantMessage.findMany({
      where: { conversationId: { in: conversations.map((item) => item.id) } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ sessions: conversations.map((item) => ({
      id: item.id, title: item.title, updatedAt: item.updatedAt.getTime(),
      pinned: item.pinned, unread: item.unread, projectId: item.projectId,
      messages: messages.filter((message) => message.conversationId === item.id).map((message) => ({
        id: message.id, role: message.role === "ASSISTANT" ? "assistant" : "user", content: message.content,
        citations: message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata)
          ? (message.metadata as Record<string, unknown>).citations : undefined,
        attachments: message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata)
          ? (message.metadata as Record<string, unknown>).attachments : undefined,
        imageUrl: message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata)
          ? (message.metadata as Record<string, unknown>).imageUrl : undefined,
      })),
    })) });
  } catch {
    return NextResponse.json({ error: "Saved conversations could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 1_000_000) return NextResponse.json({ error: "Session import is too large." }, { status: 413 });
    const rawBody = await request.text();
    if (rawBody.length > 1_000_000) return NextResponse.json({ error: "Session import is too large." }, { status: 413 });
    const body = JSON.parse(rawBody) as { sessions?: unknown };
    if (!Array.isArray(body.sessions) || body.sessions.length > 100) return NextResponse.json({ error: "Invalid sessions." }, { status: 400 });
    for (const raw of body.sessions) {
      if (!raw || typeof raw !== "object") return NextResponse.json({ error: "Invalid session." }, { status: 400 });
      const item = raw as Record<string, unknown>;
      if (typeof item.id !== "string" || !/^chat-[a-zA-Z0-9-]{1,80}$/.test(item.id) || typeof item.title !== "string" || item.title.length > 120 || !Array.isArray(item.messages) || item.messages.length > 200) return NextResponse.json({ error: "Invalid session." }, { status: 400 });
      const existing = await prisma.assistantConversation.findUnique({ where: { id: item.id } });
      if (existing) continue;
      const messages = item.messages.flatMap((rawMessage) => {
        if (!rawMessage || typeof rawMessage !== "object") return [];
        const message = rawMessage as Record<string, unknown>;
        if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string" || message.content.length > 20_000) return [];
        const metadata: Record<string, unknown> = {};
        if (message.attachments) metadata.attachments = message.attachments;
        if (message.imageUrl) metadata.imageUrl = message.imageUrl;
        if (message.citations) metadata.citations = message.citations;
        return [{
          role: message.role === "user" ? "USER" as const : "ASSISTANT" as const,
          content: message.content,
          metadata: (Object.keys(metadata).length ? (metadata as unknown as Prisma.InputJsonValue) : undefined),
        }];
      });
      await prisma.$transaction(async (tx) => {
        await tx.assistantConversation.create({ data: { id: item.id as string, workspaceId: context.workspaceId, userId: context.userId, title: item.title as string, status: "ACTIVE", lastMessageAt: new Date() } });
        if (messages.length) await tx.assistantMessage.createMany({ data: messages.map((message) => ({ conversationId: item.id as string, ...message })) });
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Saved conversations could not be imported." }, { status: 500 });
  }
}
