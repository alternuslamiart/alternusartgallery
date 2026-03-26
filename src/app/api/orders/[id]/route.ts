import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '@/lib/email'

// Helper to generate tracking URL based on carrier
function getTrackingUrl(trackingNumber: string, carrier?: string): string | undefined {
  if (!trackingNumber) return undefined

  // Try to detect carrier from tracking number format
  const upperTracking = trackingNumber.toUpperCase()

  if (carrier === 'DHL' || upperTracking.match(/^\d{10,}$/)) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  }
  if (carrier === 'UPS' || upperTracking.startsWith('1Z')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  }
  if (carrier === 'FEDEX' || upperTracking.match(/^\d{12,15}$/)) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  }

  // Generic tracking
  return `https://track24.net/?code=${trackingNumber}`
}

// GET - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            artwork: {
              include: {
                artist: {
                  select: {
                    id: true,
                    displayName: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          title: item.title,
          artwork: item.artwork,
        })),
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        user: order.user,
        guestEmail: order.guestEmail,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, trackingNumber, notes } = body

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status

      // Update timestamps based on status
      if (status === 'SHIPPED') {
        updateData.shippedAt = new Date()
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date()
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            artwork: true,
          },
        },
        shippingAddress: true,
        user: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    })

    // Send email notifications for status changes
    const customerEmail = order.guestEmail || order.user?.email
    const customerName = order.shippingAddress?.firstName || order.user?.firstName || 'Customer'

    if (customerEmail && order.shippingAddress) {
      const emailData = {
        orderNumber: order.orderNumber,
        customerName,
        customerEmail,
        items: order.items.map(item => ({
          title: item.title || 'Artwork',
          price: Number(item.price),
          quantity: item.quantity,
          image: item.artwork?.primaryImage,
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        tax: Number(order.tax),
        total: Number(order.total),
        shippingAddress: {
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
        trackingNumber: order.trackingNumber || undefined,
        trackingUrl: order.trackingNumber ? getTrackingUrl(order.trackingNumber, body.carrier) : undefined,
      }

      if (status === 'SHIPPED') {
        sendOrderShippedEmail(emailData).catch(console.error)
      } else if (status === 'DELIVERED') {
        sendOrderDeliveredEmail(emailData).catch(console.error)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        updatedAt: order.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
