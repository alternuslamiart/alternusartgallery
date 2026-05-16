import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";
import { parseListQuery } from "@/lib/platform/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;

 const query = parseListQuery(request);
 const activity = await prisma.activityLog.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.entityType ? { entityType: query.entityType } : {}),
 ...(query.entityId ? { entityId: query.entityId } : {}),
 },
 orderBy: { createdAt: "desc" },
 take: query.limit,
 });

 return ok({ activity, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}
