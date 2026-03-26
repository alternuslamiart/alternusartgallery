import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get orders for the logged-in user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view orders' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            artwork: {
              select: {
                id: true,
                title: true,
                primaryImage: true,
                artist: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
        currency: order.currency,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          title: item.title || item.artwork?.title,
          price: Number(item.price),
          quantity: item.quantity,
          artwork: item.artwork
            ? {
                id: item.artwork.id,
                title: item.artwork.title,
                image: item.artwork.primaryImage,
                artist: item.artwork.artist?.displayName || 'Unknown Artist',
              }
            : null,
        })),
        shippingAddress: order.shippingAddress,
      })),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
