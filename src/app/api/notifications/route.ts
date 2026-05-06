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
  const [recentArtworks, recentArtists] = await Promise.all([
    prisma.artwork.findMany({
      where: {
        status: "APPROVED",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: { artist: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 4),
    }),
    prisma.artist.findMany({
      where: {
        applicationStatus: "APPROVED",
        approvedDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { approvedDate: "desc" },
      take: Math.min(limit, 2),
    }),
  ]);

  return [
    ...recentArtworks.map((artwork) => ({
      id: `artwork-${artwork.id}`,
      type: "new_artwork",
      title: "New Artwork",
      message: `"${artwork.title}" by ${artwork.artist.displayName}`,
      linkUrl: `/main?prompt=${encodeURIComponent(artwork.title)}`,
      actionUrl: `/main?prompt=${encodeURIComponent(artwork.title)}`,
      isRead: false,
      readAt: null,
      createdAt: artwork.createdAt,
    })),
    ...recentArtists.map((artist) => ({
      id: `artist-${artist.id}`,
      type: "new_artist",
      title: "New Artist",
      message: `${artist.displayName} joined the studio`,
      linkUrl: "/studio-overview",
      actionUrl: "/studio-overview",
      isRead: false,
      readAt: null,
      createdAt: artist.approvedDate ?? artist.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
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
      ? body.notificationIds.filter((id): id is string => typeof id === "string" && !id.startsWith("artwork-") && !id.startsWith("artist-"))
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
