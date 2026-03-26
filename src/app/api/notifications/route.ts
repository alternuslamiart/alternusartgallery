import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get notifications (personalized for logged-in users, or public gallery updates)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // For logged-in users, get their personal notifications + gallery updates
    if (session?.user?.id) {
      const [userNotifications, recentArtworks, recentArtists] = await Promise.all([
        // Personal notifications
        prisma.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent artworks (last 7 days)
        prisma.artwork.findMany({
          where: {
            status: 'APPROVED',
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          include: {
            artist: { select: { displayName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
        // Recently approved artists (last 7 days)
        prisma.artist.findMany({
          where: {
            applicationStatus: 'APPROVED',
            approvedDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { approvedDate: 'desc' },
          take: 2,
        }),
      ]);

      // Combine and format notifications
      const notifications = [
        ...userNotifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          linkUrl: n.linkUrl,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
        ...recentArtworks.map((a) => ({
          id: `artwork-${a.id}`,
          type: 'new_artwork',
          title: 'New Artwork',
          message: `"${a.title}" by ${a.artist.displayName}`,
          linkUrl: `/gallery/${a.id}`,
          isRead: false,
          createdAt: a.createdAt,
        })),
        ...recentArtists.map((a) => ({
          id: `artist-${a.id}`,
          type: 'new_artist',
          title: 'New Artist',
          message: `${a.displayName} joined the gallery`,
          linkUrl: `/artist/${a.id}`,
          isRead: false,
          createdAt: a.approvedDate || a.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return NextResponse.json({ notifications, unreadCount });
    }

    // For guests, show public gallery updates only
    const [recentArtworks, recentArtists] = await Promise.all([
      prisma.artwork.findMany({
        where: {
          status: 'APPROVED',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        include: {
          artist: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.artist.findMany({
        where: {
          applicationStatus: 'APPROVED',
          approvedDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { approvedDate: 'desc' },
        take: 2,
      }),
    ]);

    const notifications = [
      ...recentArtworks.map((a) => ({
        id: `artwork-${a.id}`,
        type: 'new_artwork',
        title: 'New Artwork',
        message: `"${a.title}" by ${a.artist.displayName}`,
        linkUrl: `/gallery/${a.id}`,
        isRead: false,
        createdAt: a.createdAt,
      })),
      ...recentArtists.map((a) => ({
        id: `artist-${a.id}`,
        type: 'new_artist',
        title: 'New Artist',
        message: `${a.displayName} joined the gallery`,
        linkUrl: `/artist/${a.id}`,
        isRead: false,
        createdAt: a.approvedDate || a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read (only real DB notifications)
      const realIds = notificationIds.filter(
        (id: string) => !id.startsWith('artwork-') && !id.startsWith('artist-')
      );

      if (realIds.length > 0) {
        await prisma.notification.updateMany({
          where: {
            id: { in: realIds },
            userId: session.user.id,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });
      }
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
