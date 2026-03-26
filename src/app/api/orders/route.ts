import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ALT-${timestamp}-${random}`
}

// Calculate commission split (40% gallery, 60% artist)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _calculateCommission(price: number): { galleryCommission: number; artistEarning: number } {
  const galleryCommission = price * 0.40
  const artistEarning = price * 0.60
  return { galleryCommission, artistEarning }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      guestEmail,
      items,
      shippingAddress,
      billingAddress,
      currency = 'EUR',
    } = body

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    // Validate user or guest email
    if (!userId && !guestEmail) {
      return NextResponse.json(
        { error: 'Either userId or guestEmail is required' },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems: Array<{
      artworkId: string
      quantity: number
      price: number
      title: string
    }> = []

    for (const item of items) {
      const artwork = await prisma.artwork.findUnique({
        where: { id: item.artworkId },
        include: { artist: true },
      })

      if (!artwork) {
        return NextResponse.json(
          { error: `Artwork ${item.artworkId} not found` },
          { status: 404 }
        )
      }

      if (!artwork.isAvailable) {
        return NextResponse.json(
          { error: `Artwork "${artwork.title}" is not available` },
          { status: 400 }
        )
      }

      const price = Number(artwork.price)
      subtotal += price * (item.quantity || 1)

      orderItems.push({
        artworkId: artwork.id,
        quantity: item.quantity || 1,
        price: price,
        title: artwork.title,
      })
    }

    // Calculate shipping and tax
    const shippingCost = subtotal >= 500 ? 0 : subtotal >= 200 ? 15 : 25
    const taxRate = 0 // VAT handled separately based on region
    const tax = subtotal * taxRate
    const total = subtotal + shippingCost + tax

    // Create or find shipping address
    let shippingAddressId: string | null = null
    if (shippingAddress) {
      const address = await prisma.address.create({
        data: {
          userId: userId || null,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
      })
      shippingAddressId = address.id
    }

    // Create or find billing address
    let billingAddressId: string | null = null
    if (billingAddress) {
      const address = await prisma.address.create({
        data: {
          userId: userId || null,
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          address: billingAddress.address,
          city: billingAddress.city,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
          phone: billingAddress.phone,
        },
      })
      billingAddressId = address.id
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || null,
        guestEmail: guestEmail || null,
        subtotal: new Decimal(subtotal),
        shippingCost: new Decimal(shippingCost),
        tax: new Decimal(tax),
        total: new Decimal(total),
        currency,
        shippingAddressId,
        billingAddressId,
        items: {
          create: orderItems.map((item) => ({
            artworkId: item.artworkId,
            quantity: item.quantity,
            price: new Decimal(item.price),
            title: item.title,
          })),
        },
      },
      include: {
        items: {
          include: {
            artwork: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    })

    // Send order confirmation email
    const customerEmail = guestEmail || (userId ? (await prisma.user.findUnique({ where: { id: userId } }))?.email : null)
    const customerName = shippingAddress?.firstName || 'Customer'

    if (customerEmail) {
      sendOrderConfirmationEmail({
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
        shippingAddress: order.shippingAddress ? {
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        } : {
          address: '',
          city: '',
          postalCode: '',
          country: '',
        },
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
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
        items: order.items,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET - List orders (for authenticated user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const orderNumber = searchParams.get('orderNumber')

    // If searching by order number
    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
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
          shippingAddress: true,
          billingAddress: true,
        },
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ order })
    }

    // Build where clause
    const where: Record<string, unknown> = {}
    if (userId) {
      where.userId = userId
    } else if (email) {
      where.guestEmail = email
    } else {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            artwork: true,
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
        total: Number(order.total),
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
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
