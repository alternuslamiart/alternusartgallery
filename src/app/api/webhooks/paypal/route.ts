import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()

  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error('PAYPAL_WEBHOOK_ID is not set')
    return NextResponse.json(
      { error: 'Webhook ID not configured' },
      { status: 500 }
    )
  }

  // Get PayPal headers
  const paypalHeaders: Record<string, string> = {
    'paypal-auth-algo': headersList.get('paypal-auth-algo') || '',
    'paypal-cert-url': headersList.get('paypal-cert-url') || '',
    'paypal-transmission-id': headersList.get('paypal-transmission-id') || '',
    'paypal-transmission-sig': headersList.get('paypal-transmission-sig') || '',
    'paypal-transmission-time': headersList.get('paypal-transmission-time') || '',
  }

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(webhookId, paypalHeaders, body)

  if (!isValid) {
    console.error('PayPal webhook signature verification failed')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    const event = JSON.parse(body)

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved by customer - ready for capture
        console.log('PayPal order approved:', event.resource.id)
        break
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        await handleCaptureCompleted(event.resource)
        break
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        await handleCaptureDenied(event.resource)
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        await handleCaptureRefunded(event.resource)
        break
      }

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing PayPal webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

interface PayPalCaptureResource {
  id: string
  supplementary_data?: {
    related_ids?: {
      order_id?: string
    }
  }
}

async function handleCaptureCompleted(resource: PayPalCaptureResource) {
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id

  if (!paypalOrderId) {
    console.error('No order ID in capture resource')
    return
  }

  // Find order by PayPal order ID
  const order = await prisma.order.findFirst({
    where: { paypalOrderId },
  })

  if (order) {
    // Payment already processed via capture-order API
    // This is just a confirmation
    console.log(`PayPal capture confirmed for order ${order.orderNumber}`)
  }
}

async function handleCaptureDenied(resource: PayPalCaptureResource) {
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id

  if (!paypalOrderId) {
    console.error('No order ID in capture resource')
    return
  }

  // Find order by PayPal order ID
  const order = await prisma.order.findFirst({
    where: { paypalOrderId },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
      },
    })

    console.log(`PayPal capture denied for order ${order.orderNumber}`)
  }
}

async function handleCaptureRefunded(resource: PayPalCaptureResource) {
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id

  if (!paypalOrderId) {
    console.error('No order ID in capture resource')
    return
  }

  // Find order by PayPal order ID
  const order = await prisma.order.findFirst({
    where: { paypalOrderId },
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

    console.log(`PayPal refund processed for order ${order.orderNumber}`)
  }
}
