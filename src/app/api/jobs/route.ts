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
 const jobs = await prisma.aIProviderJob.findMany({
 where: {
 workspaceId: context.workspaceId,
 ...(query.status ? { status: query.status.toUpperCase() as never } : {}),
 ...(query.type ? { type: query.type.toUpperCase() as never } : {}),
 },
 orderBy: { createdAt: "desc" },
 take: query.limit,
 });

 return ok({ jobs, pageInfo: { limit: query.limit } });
 } catch (error) {
 return mapUnknownError(error);
 }
}
