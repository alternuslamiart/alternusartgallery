import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST() {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 await prisma.notification.updateMany({
 where: { userId: context.userId, isRead: false },
 data: { isRead: true, readAt: new Date() },
 });
 return ok({ success: true });
 } catch (error) {
 return mapUnknownError(error);
 }
}
