import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAdminNewArtistApplicationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      location,
      memberType,
      website,
      instagram,
      linkedin,
      twitter,
      artStyle,
      yearsExperience,
      portfolio,
      bio,
      whyJoin,
      faceImage,
    } = body

    // Validate required fields
    if (!fullName || !email || !location || !memberType || !bio || !whyJoin) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    if (!artStyle || artStyle.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one art style' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists and has a pending application
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { artist: true },
    })

    if (existingUser?.artist) {
      if (existingUser.artist.applicationStatus === 'PENDING') {
        return NextResponse.json(
          { error: 'You already have a pending application. Please wait for a response.' },
          { status: 409 }
        )
      }
      if (existingUser.artist.applicationStatus === 'APPROVED') {
        return NextResponse.json(
          { error: 'You are already an approved artist.' },
          { status: 409 }
        )
      }
    }

    // Parse location into country/city
    const locationParts = location.split(',').map((s: string) => s.trim())
    const city = locationParts[0] || ''
    const country = locationParts[1] || locationParts[0] || ''

    // Parse name into first/last
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Combined bio
    const fullBio = whyJoin ? `${bio}\n\nMotivation: ${whyJoin}` : bio

    // Create or get user
    let user = existingUser
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || null,
          role: 'CUSTOMER',
          emailVerified: false,
          isActive: true,
        },
        include: { artist: true },
      })
    }

    // If user had a rejected application, update it instead of creating new
    if (existingUser?.artist?.applicationStatus === 'REJECTED') {
      await prisma.artist.update({
        where: { id: existingUser.artist.id },
        data: {
          displayName: fullName,
          bio: fullBio,
          country,
          city,
          profileImage: faceImage || existingUser.artist.profileImage,
          portfolioImages: portfolio ? [portfolio] : [],
          websiteUrl: website || null,
          instagramUrl: instagram || null,
          twitterUrl: twitter || null,
          linkedinUrl: linkedin || null,
          applicationStatus: 'PENDING',
          appliedDate: new Date(),
          rejectedDate: null,
          rejectionReason: null,
        },
      })
    } else {
      // Create new artist record
      await prisma.artist.create({
        data: {
          userId: user.id,
          displayName: fullName,
          bio: fullBio,
          country,
          city,
          profileImage: faceImage || null,
          portfolioImages: portfolio ? [portfolio] : [],
          websiteUrl: website || null,
          instagramUrl: instagram || null,
          twitterUrl: twitter || null,
          linkedinUrl: linkedin || null,
          applicationStatus: 'PENDING',
        },
      })
    }

    // Send admin notification email (fire-and-forget)
    sendAdminNewArtistApplicationEmail({
      applicantName: fullName,
      applicantEmail: email,
      location,
      memberType,
      bio: fullBio,
      artStyles: artStyle,
      yearsExperience: yearsExperience || 'Not specified',
      portfolioUrl: portfolio || undefined,
    }).catch(err => console.error('Failed to send admin artist application notification:', err))

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting artist application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
