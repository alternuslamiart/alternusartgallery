import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all artists (only those with artworks)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeEmpty = searchParams.get('includeEmpty') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {
      applicationStatus: 'APPROVED',
      isActive: true,
    };

    // Only show artists with artworks (unless includeEmpty is true)
    if (!includeEmpty) {
      where.totalArtworks = { gt: 0 };
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              artworks: {
                where: {
                  status: 'APPROVED',
                  isAvailable: true,
                },
              },
            },
          },
        },
        orderBy: [
          { totalSales: 'desc' },
          { followerCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.artist.count({ where }),
    ]);

    return NextResponse.json({
      artists: artists.map((artist) => ({
        id: artist.id,
        displayName: artist.displayName,
        bio: artist.bio,
        profileImage: artist.profileImage,
        coverImage: artist.coverImage,
        country: artist.country,
        city: artist.city,
        website: artist.websiteUrl,
        instagram: artist.instagramUrl,
        totalArtworks: artist.totalArtworks,
        availableArtworks: artist._count.artworks,
        totalSales: artist.totalSales,
        followerCount: artist.followerCount,
        createdAt: artist.createdAt,
      })),
      total,
      hasMore: offset + artists.length < total,
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}
