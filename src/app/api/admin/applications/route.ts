import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { sendArtistApprovalEmail, sendArtistRejectionEmail } from '@/lib/email'

export const dynamic = 'force-dynamic';

// GET - List all artist applications
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest();
    if (!authResult.authorized) return authResult.error!;

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}

    if (status && status !== 'all') {
      where.applicationStatus = status.toUpperCase()
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { appliedDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.artist.count({ where }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applications = artists.map((artist: any) => ({
      id: artist.id,
      name: artist.displayName,
      email: artist.user.email,
      country: artist.country || '',
      city: artist.city || '',
      bio: artist.bio || '',
      artworks: artist.totalArtworks,
      portfolioImages: artist.portfolioImages || [],
      appliedDate: artist.appliedDate.toISOString(),
      status: artist.applicationStatus.toLowerCase(),
      website: artist.websiteUrl || undefined,
      instagram: artist.instagramUrl || undefined,
      profileImage: artist.profileImage || undefined,
    }))

    return NextResponse.json({ applications, total })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject an application
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest();
    if (!authResult.authorized) return authResult.error!;

    const body = await request.json()
    const { artistId, action, rejectionReason } = body

    if (!artistId || !action) {
      return NextResponse.json(
        { error: 'Artist ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Fetch artist with user data
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: { user: true },
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    if (artist.applicationStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Update artist status
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          applicationStatus: 'APPROVED',
          approvedDate: new Date(),
        },
      })

      // Update user role to ARTIST
      await prisma.user.update({
        where: { id: artist.userId },
        data: { role: 'ARTIST' },
      })

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: artist.userId,
          type: 'artist_approved',
          title: 'Application Approved',
          message: 'Your artist application has been approved! Welcome to Cerevix Art Gallery.',
          linkUrl: '/gallery',
        },
      })

      // Send approval email (fire-and-forget)
      sendArtistApprovalEmail(artist.user.email, artist.displayName)
        .catch(err => console.error('Failed to send artist approval email:', err))

    } else {
      // Reject
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          applicationStatus: 'REJECTED',
          rejectedDate: new Date(),
          rejectionReason: rejectionReason,
        },
      })

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: artist.userId,
          type: 'artist_rejected',
          title: 'Application Update',
          message: rejectionReason,
          linkUrl: '/apply',
        },
      })

      // Send rejection email (fire-and-forget)
      sendArtistRejectionEmail(artist.user.email, artist.displayName, rejectionReason)
        .catch(err => console.error('Failed to send artist rejection email:', err))
    }

    return NextResponse.json({
      success: true,
      artist: {
        id: artistId,
        displayName: artist.displayName,
        applicationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      },
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
