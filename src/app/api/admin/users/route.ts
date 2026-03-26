import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all users (for admin/CEO)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is authenticated and is CEO
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== 'CEO') {
      return NextResponse.json(
        { error: 'Access denied. CEO only.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') || 'all' // all, new, today

    // Build where clause based on filter
    let whereClause = {}
    const now = new Date()

    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      whereClause = {
        createdAt: {
          gte: startOfDay
        }
      }
    } else if (filter === 'new') {
      // Last 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      whereClause = {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    }

    const [users, total, todayCount, weekCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          isActive: true,
          emailVerified: true,
          artist: {
            select: {
              id: true,
              displayName: true,
              applicationStatus: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where: whereClause }),
      // Count users registered today
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        }
      }),
      // Count users registered this week
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
    ])

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        createdAt: u.createdAt,
        isActive: u.isActive,
        emailVerified: u.emailVerified,
        isArtist: !!u.artist,
        artistStatus: u.artist?.applicationStatus || null,
      })),
      total,
      todayCount,
      weekCount,
      hasMore: offset + users.length < total,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
