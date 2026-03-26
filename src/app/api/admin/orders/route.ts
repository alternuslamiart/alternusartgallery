import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
