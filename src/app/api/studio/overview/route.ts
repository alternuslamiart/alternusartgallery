import { prisma } from "@/lib/prisma";
import { isApiResponse, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function GET() {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;

 const where = { workspaceId: context.workspaceId };
 const [
 totalProjects,
 prototypes,
 assets,
 activeJobs,
 completedExports,
 promptCount,
 storageUsage,
 recentActivity,
 recentProjects,
 recentAssets,
 subscriptionSummary,
 ] = await Promise.all([
 prisma.project.count({ where: { ...where, deletedAt: null, status: { not: "DELETED" } } }),
 prisma.prototype.count({ where: { ...where, deletedAt: null } }),
 prisma.asset.count({ where: { ...where, deletedAt: null } }),
 prisma.aIProviderJob.count({ where: { ...where, status: { in: ["QUEUED", "RUNNING"] } } }),
 prisma.studioExport.count({ where: { ...where, status: "READY" } }),
 prisma.prompt.count({ where }),
 prisma.asset.aggregate({ where: { ...where, deletedAt: null }, _sum: { sizeBytes: true } }),
 prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 10 }),
 prisma.project.findMany({ where: { ...where, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 5 }),
 prisma.asset.findMany({ where: { ...where, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 5 }),
 prisma.subscriptionState.findUnique({ where: { workspaceId: context.workspaceId } }),
 ]);

 return ok({
 stats: {
 totalProjects,
 prototypes,
 assets,
 activeJobs,
 completedExports,
 promptCount,
 storageUsageBytes: storageUsage._sum.sizeBytes ?? 0,
 },
 recentActivity,
 recentProjects,
 recentAssets,
 activeJobs,
 subscriptionSummary,
 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
