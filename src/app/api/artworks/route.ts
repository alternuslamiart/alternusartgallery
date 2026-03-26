import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

// GET - List all available artworks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const style = searchParams.get('style')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const artistId = searchParams.get('artistId')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause - include both APPROVED and SOLD artworks
    const where: Record<string, unknown> = {
      status: { in: ['APPROVED', 'SOLD'] },
    }

    if (category) where.category = category
    if (style) where.style = style
    if (artistId) where.artistId = artistId
    if (featured === 'true') where.isFeatured = true

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, unknown>).gte = new Decimal(minPrice)
      if (maxPrice) (where.price as Record<string, unknown>).lte = new Decimal(maxPrice)
    }

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        include: {
          artist: {
            select: {
              id: true,
              displayName: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.artwork.count({ where }),
    ])

    return NextResponse.json({
      artworks: artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        price: Number(artwork.price),
        image: artwork.primaryImage,
        additionalImages: artwork.additionalImages,
        medium: artwork.medium,
        style: artwork.style,
        category: artwork.category,
        dimensions: artwork.dimensions,
        year: artwork.yearCreated,
        available: artwork.isAvailable && artwork.status !== 'SOLD',
        status: artwork.status,
        isFeatured: artwork.isFeatured,
        isPreOrder: artwork.isPreOrder,
        preOrderDate: artwork.preOrderDate,
        preOrderDiscount: artwork.preOrderDiscount,
        views: artwork.views,
        soldCount: artwork.soldCount,
        artist: artwork.artist,
        createdAt: artwork.createdAt,
      })),
      total,
      hasMore: offset + artworks.length < total,
    })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// POST - Create a new artwork
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to create artwork' },
        { status: 401 }
      )
    }

    // Check if user is an artist or CEO
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { artist: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // CEO can add artworks, artists can only add their own
    const isCEO = user.role === 'CEO'
    const isArtist = user.role === 'ARTIST' && user.artist

    if (!isCEO && !isArtist) {
      return NextResponse.json(
        { error: 'Only artists and administrators can create artworks' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      price,
      primaryImage,
      additionalImages = [],
      medium,
      style,
      category,
      dimensions,
      width,
      height,
      depth,
      weight,
      yearCreated,
      isFeatured = false,
      isPreOrder = false,
      preOrderDate,
      preOrderDiscount,
      artistId: providedArtistId,
    } = body

    // Validate required fields
    if (!title || !price || !primaryImage) {
      return NextResponse.json(
        { error: 'Title, price, and primary image are required' },
        { status: 400 }
      )
    }

    // Validate price limit
    if (parseFloat(price) > 25000) {
      return NextResponse.json(
        { error: 'Maximum artwork price is $25,000' },
        { status: 400 }
      )
    }

    // Determine artist ID
    let artistId = providedArtistId

    if (isCEO) {
      // CEO must provide an artist ID or we use a default gallery artist
      if (!artistId) {
        // Try to find or create a gallery artist
        let galleryArtist = await prisma.artist.findFirst({
          where: { displayName: 'Lamiart' },
        })

        if (!galleryArtist) {
          // Create a gallery artist linked to CEO user
          galleryArtist = await prisma.artist.create({
            data: {
              userId: user.id,
              displayName: 'Lamiart',
              bio: 'Official gallery artist',
              applicationStatus: 'APPROVED',
              approvedDate: new Date(),
            },
          })
        }
        artistId = galleryArtist.id
      }
    } else if (isArtist) {
      artistId = user.artist!.id
    }

    // Create the artwork
    const artwork = await prisma.artwork.create({
      data: {
        artistId,
        title,
        description,
        price: new Decimal(price),
        primaryImage,
        additionalImages,
        medium,
        style,
        category,
        dimensions,
        width: width ? new Decimal(width) : null,
        height: height ? new Decimal(height) : null,
        depth: depth ? new Decimal(depth) : null,
        weight: weight ? new Decimal(weight) : null,
        yearCreated: yearCreated ? parseInt(yearCreated) : new Date().getFullYear(),
        status: isCEO ? 'APPROVED' : 'PENDING', // CEO artworks are auto-approved
        isAvailable: true,
        isFeatured,
        isPreOrder,
        preOrderDate: preOrderDate ? new Date(preOrderDate) : null,
        preOrderDiscount,
        approvedBy: isCEO ? user.id : null,
        approvedAt: isCEO ? new Date() : null,
      },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    // Update artist's total artworks count
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        totalArtworks: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      artwork: {
        id: artwork.id,
        title: artwork.title,
        price: Number(artwork.price),
        image: artwork.primaryImage,
        status: artwork.status,
        artist: artwork.artist,
        createdAt: artwork.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}
