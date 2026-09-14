import { NextRequest } from "next/server";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { isBillingPlan } from "@/lib/platform/entitlements";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
 try {
 const context = await requirePlatformContext();
 if (isApiResponse(context)) return context;
 const body = await readJsonBody(request);
 const plan = body.plan;
 const billingCycle = body.billingCycle;
 if (!isBillingPlan(plan) || (billingCycle !== "monthly" && billingCycle !== "yearly")) {
 return apiError("VALIDATION_ERROR", "A valid billing plan and billing cycle are required.", 400);
 }

 await logActivity({
 workspaceId: context.workspaceId,
 userId: context.userId,
 action: "subscription.upgrade_intent",
 entityType: "subscription",
 entityId: context.workspaceId,
 message: `Upgrade intent requested for ${plan} (${billingCycle}).`,
 metadata: { plan, billingCycle },
 });

 return ok({
 configured: false,
 plan,
 billingCycle,
 message: "Billing is not configured for this environment.",
 route: "/pricing",
 });
 } catch (error) {
 return mapUnknownError(error);
 }
}
