import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;

    const subscription = await prisma.subscriptionState.findUnique({
      where: { workspaceId: context.workspaceId },
    });

    return ok({ subscription });
  } catch (error) {
    return mapUnknownError(error);
  }
}
