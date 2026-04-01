import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verify admin session
    const authResult = await verifyAdminRequest();
    if (!authResult.authorized) return authResult.error!;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        shippingAddress: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
        items: {
          include: {
            artwork: {
              select: {
                id: true,
                title: true,
                primaryImage: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
