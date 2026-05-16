import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;

 const [userSettings, workspaceSettings] = await Promise.all([
 prisma.userSettings.findUnique({ where: { userId: context.userId } }),
 prisma.workspaceSettings.findUnique({ where: { workspaceId: context.workspaceId } }),
 ]);

 return ok({ userSettings, workspaceSettings });
 } catch (error) {
 return mapUnknownError(error);
 }
}
