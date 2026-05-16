import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

function toNotificationResponse(notification: {
  id: string;
  type: string;
  title: string;
  message: string | null;
  linkUrl: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    linkUrl: notification.linkUrl ?? notification.actionUrl,
    actionUrl: notification.actionUrl ?? notification.linkUrl,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}

async function getPublicStudioNotifications(limit: number) {
  return [
    {
      id: "studio-welcome",
      type: "workspace_update",
      title: "Cedium Studio is ready",
      message: "Open the studio to generate assets, run prompts, and coordinate AI tools.",
      linkUrl: "/main",
      actionUrl: "/main",
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    },
  ].slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 50);
    const unreadOnly = searchParams.get("unread") === "true";
    const session = await auth();

    if (!session?.user?.id) {
      const notifications = await getPublicStudioNotifications(limit);
      return NextResponse.json({ notifications, unreadCount: notifications.length });
    }

    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: context.userId, workspaceId: context.workspaceId, isRead: false },
    });

    return NextResponse.json({ notifications: notifications.map(toNotificationResponse), unreadCount });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const body = (await request.json().catch(() => ({}))) as { notificationIds?: unknown };
    const notificationIds = Array.isArray(body.notificationIds)
      ? body.notificationIds.filter((id): id is string => typeof id === "string" && id !== "studio-welcome")
      : [];

    await prisma.notification.updateMany({
      where: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        isRead: false,
        ...(notificationIds.length > 0 ? { id: { in: notificationIds } } : {}),
      },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) return apiError("VALIDATION_ERROR", "Invalid JSON body.", 400);
    return mapUnknownError(error);
  }
}
