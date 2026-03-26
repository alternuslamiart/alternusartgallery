import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Update artwork (admin only, no user check required)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, price, status, isAvailable } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price

    if (status !== undefined) {
      updateData.status = status
      // If marking as SOLD, set isAvailable to false
      if (status === 'SOLD') {
        updateData.isAvailable = false
      } else if (status === 'APPROVED') {
        updateData.isAvailable = true
      }
    }

    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    const artwork = await prisma.artwork.update({
      where: { id },
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
        isAvailable: artwork.isAvailable,
        price: Number(artwork.price),
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

// DELETE - Delete artwork (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get artwork to find artist
    const artwork = await prisma.artwork.findUnique({
      where: { id },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Delete the artwork
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
