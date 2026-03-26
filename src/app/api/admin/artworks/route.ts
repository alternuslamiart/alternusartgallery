import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { auth } from '@/lib/auth'

// GET - List all artworks for admin (including pending, rejected)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
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
        primaryImage: artwork.primaryImage,
        additionalImages: artwork.additionalImages,
        medium: artwork.medium,
        style: artwork.style,
        category: artwork.category,
        dimensions: artwork.dimensions,
        yearCreated: artwork.yearCreated,
        status: artwork.status,
        isAvailable: artwork.isAvailable,
        isFeatured: artwork.isFeatured,
        views: artwork.views,
        soldCount: artwork.soldCount,
        artist: artwork.artist,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      })),
      total,
    })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// PATCH - Update artwork status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is CEO
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== 'CEO') {
      return NextResponse.json(
        { error: 'Access denied. CEO only.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { artworkId, status, rejectionReason } = body

    if (!artworkId || !status) {
      return NextResponse.json(
        { error: 'Artwork ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SOLD']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      status,
    }

    if (status === 'APPROVED') {
      updateData.approvedBy = user.id
      updateData.approvedAt = new Date()
      updateData.isAvailable = true
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date()
      updateData.rejectionReason = rejectionReason || 'No reason provided'
      updateData.isAvailable = false
    }

    const artwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: updateData,
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      artwork: {
        id: artwork.id,
        title: artwork.title,
        status: artwork.status,
        artist: artwork.artist,
      },
    })
  } catch (error) {
    console.error('Error updating artwork:', error)
    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

// POST - Create artwork from admin panel (no Google auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      price,
      primaryImage,
      medium,
      style,
      category,
      dimensions,
      yearCreated,
      status: requestedStatus,
    } = body

    // Validate required fields
    if (!title || !price || !primaryImage) {
      return NextResponse.json(
        { error: 'Title, price, and image are required' },
        { status: 400 }
      )
    }

    // Find or create the gallery artist "Lamiart"
    let galleryArtist = await prisma.artist.findFirst({
      where: { displayName: 'Lamiart' },
    })

    if (!galleryArtist) {
      // First create or find system user for gallery
      let systemUser = await prisma.user.findFirst({
        where: { email: 'lamialiuart@gmail.com' },
      })

      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'lamialiuart@gmail.com',
            role: 'CEO',
            firstName: 'Lamiart',
            lastName: 'Gallery',
            emailVerified: true,
          },
        })
      }

      // Create gallery artist linked to user
      galleryArtist = await prisma.artist.create({
        data: {
          userId: systemUser.id,
          displayName: 'Lamiart',
          bio: 'Official gallery artist',
          applicationStatus: 'APPROVED',
          approvedDate: new Date(),
        },
      })
    }

    // Determine the status (default to APPROVED if not specified)
    const artworkStatus = requestedStatus === 'SOLD' ? 'SOLD' : 'APPROVED'
    const isAvailable = artworkStatus !== 'SOLD'

    // Create the artwork
    const artwork = await prisma.artwork.create({
      data: {
        artistId: galleryArtist.id,
        title,
        description: description || '',
        price: new Decimal(price),
        primaryImage,
        medium: medium || '',
        style: style || '',
        category: category || 'Painting',
        dimensions: dimensions || '',
        yearCreated: yearCreated ? parseInt(yearCreated) : new Date().getFullYear(),
        status: artworkStatus,
        isAvailable,
        approvedAt: new Date(),
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
      where: { id: galleryArtist.id },
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
