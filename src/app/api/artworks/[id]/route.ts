import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single artwork by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            bio: true,
          },
        },
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
      artist: artwork.artist,
    })
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    )
  }
}

// PATCH - Update an artwork (CEO or owner artist only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to update artwork' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user is CEO or the artist who owns this artwork
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

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: { artist: true },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    const isCEO = user.role === 'CEO'
    const isOwner = user.artist?.id === artwork.artistId

    if (!isCEO && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to update this artwork' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, isAvailable, isFeatured, title, description, price } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (status !== undefined) updateData.status = status
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price

    const updatedArtwork = await prisma.artwork.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      artwork: {
        id: updatedArtwork.id,
        title: updatedArtwork.title,
        status: updatedArtwork.status,
        isAvailable: updatedArtwork.isAvailable,
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

// DELETE - Delete an artwork (CEO or owner artist only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to delete artwork' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user is CEO or the artist who owns this artwork
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

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: { artist: true },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    const isCEO = user.role === 'CEO'
    const isOwner = user.artist?.id === artwork.artistId

    if (!isCEO && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this artwork' },
        { status: 403 }
      )
    }

    await prisma.artwork.delete({
      where: { id },
    })

    // Update artist's total artworks count
    await prisma.artist.update({
      where: { id: artwork.artistId },
      data: {
        totalArtworks: { decrement: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Artwork deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}
