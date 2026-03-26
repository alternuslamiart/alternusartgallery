import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single artist by ID with their artworks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: artistId } = await params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        artworks: {
          where: {
            status: 'APPROVED',
          },
          select: {
            id: true,
            title: true,
            primaryImage: true,
            price: true,
            medium: true,
            isAvailable: true,
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      artist: {
        id: artist.id,
        displayName: artist.displayName,
        bio: artist.bio,
        country: artist.country,
        city: artist.city,
        profileImage: artist.profileImage,
        coverImage: artist.coverImage,
        websiteUrl: artist.websiteUrl,
        instagramUrl: artist.instagramUrl,
        twitterUrl: artist.twitterUrl,
        followerCount: artist.followerCount,
        totalArtworks: artist.totalArtworks,
        totalSales: artist.totalSales,
        createdAt: artist.createdAt,
        user: artist.user,
        artworks: artist.artworks,
      },
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    );
  }
}
