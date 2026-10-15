import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAIChatUserId } from "@/lib/ai-chat-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const MAX_TITLE_LENGTH = 80;

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to access chat history." }, { status: 401 });

    const rawPage = Number(request.nextUrl.searchParams.get("page") ?? "0");
    const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
    const [conversations, total] = await Promise.all([
      prisma.aIChatConversation.findMany({
        where: { userId },
        orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        select: { id: true, title: true, model: true, createdAt: true, updatedAt: true, lastMessageAt: true },
      }),
      prisma.aIChatConversation.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      conversations,
      page,
      pageSize: PAGE_SIZE,
      hasMore: (page + 1) * PAGE_SIZE < total,
    });
  } catch (error) {
    console.error("AI chat conversation list failed:", error);
    return NextResponse.json({ error: "Chat history could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedAIChatUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to save chat history." }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    const title = body && typeof body === "object" && "title" in body && typeof body.title === "string"
      ? body.title.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, MAX_TITLE_LENGTH)
      : "New Chat";

    const conversation = await prisma.aIChatConversation.create({
      data: { userId, title: title || "New Chat" },
      select: { id: true, title: true, model: true, createdAt: true, updatedAt: true, lastMessageAt: true },
    });
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("AI chat conversation creation failed:", error);
    return NextResponse.json({ error: "A new conversation could not be created." }, { status: 500 });
  }
}
