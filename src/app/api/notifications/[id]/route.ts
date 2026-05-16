import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, parseId, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const id = parseId(params);
 if (!id) return apiError("VALIDATION_ERROR", "Invalid notification id.", 400);
 const existing = await prisma.notification.findFirst({ where: { id, userId: context.userId } });
 if (!existing) return apiError("NOT_FOUND", "Notification not found.", 404);
 await prisma.notification.delete({ where: { id } });
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
