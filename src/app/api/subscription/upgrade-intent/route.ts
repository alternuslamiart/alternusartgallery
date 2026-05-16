import { isApiResponse, logActivity, mapUnknownError, ok, requirePlatformContext } from "@/lib/platform/api";

export const dynamic = "force-dynamic";

export async function POST() {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;

 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "subscription.upgrade_intent",
 entityType: "subscription",
 entityId: context.workspaceId,
 message: "Upgrade intent requested.",
 });

 return ok({
 configured: false,
 message: "Billing is not configured for this environment.",
 route: "/pricing",
 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
