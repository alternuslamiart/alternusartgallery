import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST - Send a message to an artist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toArtistId, subject, message, senderName, senderEmail } = body;

    if (!toArtistId || !message) {
      return NextResponse.json(
        { error: 'Artist ID and message are required' },
        { status: 400 }
      );
    }

    // Find the artist's user ID
    const artist = await prisma.artist.findUnique({
      where: { id: toArtistId },
      include: { user: true },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Check if the sender is logged in
    const session = await auth();
    let fromUserId: string;

    if (session?.user?.id) {
      // Logged in user
      fromUserId = session.user.id;
    } else {
      // Guest user - create or find a guest user entry
      if (!senderEmail) {
        return NextResponse.json(
          { error: 'Email is required for guest messages' },
          { status: 400 }
        );
      }

      // Check if user exists with this email
      let guestUser = await prisma.user.findUnique({
        where: { email: senderEmail },
      });

      if (!guestUser) {
        // Create a guest user
        guestUser = await prisma.user.create({
          data: {
            email: senderEmail,
            firstName: senderName?.split(' ')[0] || 'Guest',
            lastName: senderName?.split(' ').slice(1).join(' ') || '',
            role: 'CUSTOMER',
            isActive: true,
            emailVerified: false,
          },
        });
      }

      fromUserId = guestUser.id;
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        fromUserId,
        toUserId: artist.userId,
        subject: subject || null,
        message,
        isRead: false,
      },
    });

    // Create a notification for the artist
    await prisma.notification.create({
      data: {
        userId: artist.userId,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from ${senderName || 'a visitor'}`,
        linkUrl: `/dashboard/messages/${newMessage.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: newMessage.id,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Get messages for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'received' or 'sent'

    const messages = await prisma.message.findMany({
      where: type === 'received'
        ? { toUserId: session.user.id }
        : { fromUserId: session.user.id },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
