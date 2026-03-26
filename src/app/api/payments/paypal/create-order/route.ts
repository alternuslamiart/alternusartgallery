import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            artwork: true,
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

    // Check if order already has a PayPal order ID
    if (order.paypalOrderId) {
      return NextResponse.json({
        paypalOrderId: order.paypalOrderId,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })
    }

    // Create PayPal order
    const itemDescriptions = order.items
      .map((item) => item.title || item.artwork.title)
      .join(', ')

    const paypalOrder = await createPayPalOrder(
      Number(order.total),
      order.currency,
      `Alternus Art Gallery - ${itemDescriptions}`,
      order.orderNumber
    )

    // Update order with PayPal order ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paypalOrderId: paypalOrder.id,
        paymentMethod: 'paypal',
      },
    })

    return NextResponse.json({
      paypalOrderId: paypalOrder.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency: order.currency,
    })
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
