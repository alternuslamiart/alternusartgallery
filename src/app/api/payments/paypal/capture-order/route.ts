import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'
import { sendAdminNewOrderEmail } from '@/lib/email'
import { Decimal } from '@prisma/client/runtime/library'

// Generate unique transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TXN-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paypalOrderId, orderId } = body

    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { error: 'PayPal order ID and order ID are required' },
        { status: 400 }
      )
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            artwork: {
              include: {
                artist: true,
              },
            },
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

    if (order.paypalOrderId !== paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal order ID does not match' },
        { status: 400 }
      )
    }

    // Capture the PayPal payment
    const captureResult = await capturePayPalOrder(paypalOrderId)

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment capture failed', details: captureResult },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING',
      },
    })

    // Create sales records for each item (artist earnings tracking)
    const salesData = order.items.map((item) => {
      const artworkPrice = Number(item.price)
      const galleryCommissionRate = 40.00
      const galleryCommission = artworkPrice * 0.40
      const artistEarning = artworkPrice * 0.60

      return {
        transactionId: generateTransactionId(),
        orderId: order.id,
        artworkId: item.artworkId,
        artistId: item.artwork.artistId,
        artworkPrice: new Decimal(artworkPrice),
        galleryCommissionRate: new Decimal(galleryCommissionRate),
        galleryCommission: new Decimal(galleryCommission),
        artistEarning: new Decimal(artistEarning),
        paymentMethod: 'paypal',
        paymentStatus: 'COMPLETED' as const,
        paymentDate: new Date(),
      }
    })

    await prisma.sale.createMany({
      data: salesData,
    })

    // Mark artworks as sold and increment sold count
    for (const item of order.items) {
      await prisma.artwork.update({
        where: { id: item.artworkId },
        data: {
          isAvailable: false,
          status: 'SOLD',
          soldCount: { increment: 1 },
        },
      })
    }

    // Update artist statistics
    for (const item of order.items) {
      const artworkPrice = Number(item.price)
      const artistEarning = artworkPrice * 0.60

      await prisma.artist.update({
        where: { id: item.artwork.artistId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: artistEarning },
        },
      })
    }

    // Notify admin about new order
    const shippingAddress = await prisma.address.findFirst({
      where: { id: order.shippingAddressId ?? undefined },
    })

    sendAdminNewOrderEmail({
      orderNumber: order.orderNumber,
      customerName: order.userId
        ? await prisma.user.findUnique({ where: { id: order.userId } }).then(u => u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Customer' : 'Customer')
        : 'Guest',
      customerEmail: order.guestEmail || (order.userId
        ? (await prisma.user.findUnique({ where: { id: order.userId } }))?.email || ''
        : ''),
      items: order.items.map(item => ({
        title: item.artwork.title,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      total: Number(order.total),
      paymentMethod: 'paypal',
      shippingAddress: {
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || '',
      },
    }).catch(err => console.error('Failed to send admin notification:', err))

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'COMPLETED',
      paypalTransactionId: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
}
