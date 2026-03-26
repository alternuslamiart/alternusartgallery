import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent, getOrCreateStripeCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, email, name } = body

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
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order already has a payment intent
    if (order.stripePaymentIntent) {
      return NextResponse.json({
        clientSecret: order.stripePaymentIntent,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })
    }

    // Get or create Stripe customer
    const customerEmail = order.user?.email || order.guestEmail || email
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const customerName = order.user
      ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
      : name

    const customer = await getOrCreateStripeCustomer(customerEmail, customerName, {
      orderId: order.id,
    })

    // Update user with Stripe customer ID if logged in
    if (order.userId && !order.user?.stripeCustomerId) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      Number(order.total),
      order.currency.toLowerCase(),
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: customer.id,
      }
    )

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntent: paymentIntent.client_secret,
        paymentMethod: 'stripe',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency: order.currency,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
