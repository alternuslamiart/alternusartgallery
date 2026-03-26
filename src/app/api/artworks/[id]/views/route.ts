import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Increment view count for an artwork
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get client IP for tracking unique views (optional)
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check if artwork exists
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      select: { id: true, views: true }
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Record the view in artwork_views table (for analytics)
    await prisma.$executeRaw`
      INSERT INTO artwork_views (id, artwork_id, ip_address, viewed_at)
      VALUES (gen_random_uuid()::text, ${id}, ${ip}, NOW())
    `

    // Increment the view count
    const updatedArtwork = await prisma.artwork.update({
      where: { id },
      data: {
        views: { increment: 1 }
      },
      select: {
        id: true,
        views: true
      }
    })

    return NextResponse.json({
      success: true,
      views: updatedArtwork.views
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}

// GET - Get view count for an artwork
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      select: {
        id: true,
        views: true
      }
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      views: artwork.views
    })
  } catch (error) {
    console.error('Error getting view count:', error)
    return NextResponse.json(
      { error: 'Failed to get view count' },
      { status: 500 }
    )
  }
}
