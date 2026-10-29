import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found.", details: {} } }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      workspaceId: context.workspaceId,
    });
  } catch (error) {
    return mapUnknownError(error);
  }
}

export async function DELETE() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    await prisma.$transaction(async (tx) => {
      // Deactivate user
      await tx.user.update({
        where: { id: context.userId },
        data: { isActive: false },
      });
      // Soft-delete projects in this workspace owned by user
      await tx.project.updateMany({
        where: { userId: context.userId },
        data: { status: "DELETED", deletedAt: new Date() },
      });
      await tx.blenderProject.updateMany({
        where: { userId: context.userId },
        data: { deletedAt: new Date() },
      });
      // Invalidate active session tokens
      await tx.session.deleteMany({
        where: { userId: context.userId },
      });
    }, { maxWait: 15000, timeout: 15000 });

    return NextResponse.json({
      success: true,
      message: "Account and associated workspace resources have been deactivated.",
    });
  } catch (error) {
    return mapUnknownError(error);
  }
}
