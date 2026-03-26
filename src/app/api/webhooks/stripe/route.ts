import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent } from '@/lib/stripe'
import { sendAdminNewOrderEmail } from '@/lib/email'
import { Decimal } from '@prisma/client/runtime/library'
import Stripe from 'stripe'

// Generate unique transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TXN-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
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
    console.error(`Order ${orderId} not found`)
    return
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
      paymentMethod: 'stripe',
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

  // Create notification for customer
  if (order.userId) {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_CONFIRMED',
        title: 'Payment Confirmed',
        message: `Your order ${order.orderNumber} has been confirmed and is being processed.`,
        linkUrl: `/orders/${order.id}`,
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
    paymentMethod: 'stripe',
    shippingAddress: {
      address: shippingAddress?.address || '',
      city: shippingAddress?.city || '',
      postalCode: shippingAddress?.postalCode || '',
      country: shippingAddress?.country || '',
    },
  }).catch(err => console.error('Failed to send admin notification:', err))

  console.log(`Payment succeeded for order ${order.orderNumber}`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'FAILED',
    },
  })

  console.log(`Payment failed for order ${orderId}`)
}

async function handleRefund(charge: Stripe.Charge) {
  // Find order by payment intent
  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    console.error('No payment intent in charge')
    return
  }

  // Update order status
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntent: {
        contains: paymentIntentId,
      },
    },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
    })

    // Update sales records
    await prisma.sale.updateMany({
      where: { orderId: order.id },
      data: {
        paymentStatus: 'REFUNDED',
      },
    })

    console.log(`Refund processed for order ${order.orderNumber}`)
  }
}
