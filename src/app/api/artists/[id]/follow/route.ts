import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST - Follow an artist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to follow artists' },
        { status: 401 }
      );
    }

    const { id: artistId } = await params;

    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: { id: true, userId: true, followerCount: true },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Can't follow yourself
    if (artist.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_artistId: {
          followerId: session.user.id,
          artistId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'You are already following this artist', isFollowing: true },
        { status: 400 }
      );
    }

    // Add follow
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        artistId,
      },
    });

    // Increment follower count
    const updatedArtist = await prisma.artist.update({
      where: { id: artistId },
      data: {
        followerCount: { increment: 1 },
      },
      select: {
        id: true,
        followerCount: true,
      },
    });

    // Create notification for the artist
    await prisma.notification.create({
      data: {
        userId: artist.userId,
        type: 'new_follower',
        title: 'New Follower',
        message: `${session.user.name || 'Someone'} started following you`,
        linkUrl: `/profile`,
      },
    });

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followerCount: updatedArtist.followerCount,
    });
  } catch (error) {
    console.error('Error following artist:', error);
    return NextResponse.json(
      { error: 'Failed to follow artist' },
      { status: 500 }
    );
  }
}

// DELETE - Unfollow an artist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to unfollow an artist' },
        { status: 401 }
      );
    }

    const { id: artistId } = await params;

    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_artistId: {
          followerId: session.user.id,
          artistId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'You are not following this artist', isFollowing: false },
        { status: 400 }
      );
    }

    // Remove follow
    await prisma.follow.delete({
      where: {
        followerId_artistId: {
          followerId: session.user.id,
          artistId,
        },
      },
    });

    // Decrement follower count
    const updatedArtist = await prisma.artist.update({
      where: { id: artistId },
      data: {
        followerCount: { decrement: 1 },
      },
      select: {
        id: true,
        followerCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followerCount: Math.max(0, updatedArtist.followerCount),
    });
  } catch (error) {
    console.error('Error unfollowing artist:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow artist' },
      { status: 500 }
    );
  }
}

// GET - Check if user is following an artist and get follower count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: artistId } = await params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: {
        id: true,
        followerCount: true,
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    let isFollowing = false;

    if (session?.user?.id) {
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_artistId: {
            followerId: session.user.id,
            artistId,
          },
        },
      });
      isFollowing = !!existingFollow;
    }

    return NextResponse.json({
      isFollowing,
      followerCount: artist.followerCount,
    });
  } catch (error) {
    console.error('Error getting follow status:', error);
    return NextResponse.json(
      { error: 'Failed to get follow status' },
      { status: 500 }
    );
  }
}
