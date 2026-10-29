import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { isBillingPlan, getEntitlements } from "@/lib/platform/entitlements";
import { AI_LIMITS } from "@/lib/platform/ai-usage.mjs";
import type { WorkspacePlan } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const rawPlan = typeof body.plan === "string" ? body.plan.toUpperCase() : "";
    const plan = rawPlan === "BASIC PLAN" ? "BASIC" : rawPlan;
    const billingCycle = body.billingCycle || "monthly";

    if (!isBillingPlan(plan) || (billingCycle !== "monthly" && billingCycle !== "yearly")) {
      return apiError("VALIDATION_ERROR", "A valid billing plan and billing cycle are required.", 400);
    }

    const targetPlan = plan as WorkspacePlan;
    const monthlyCredits = AI_LIMITS[plan];

    const subscription = await prisma.subscriptionState.upsert({
      where: { workspaceId: context.workspaceId },
      create: {
        workspaceId: context.workspaceId,
        plan: targetPlan,
        status: "ACTIVE",
        usageLimits: {
          monthlyCredits,
          billingCycle,
          testPayment: true,
          activatedAt: new Date().toISOString(),
        },
      },
      update: {
        plan: targetPlan,
        status: "ACTIVE",
        usageLimits: {
          monthlyCredits,
          billingCycle,
          testPayment: true,
          activatedAt: new Date().toISOString(),
        },
      },
    });

    await logActivity({
      workspaceId: context.workspaceId,
      userId: context.userId,
      action: "subscription.activated",
      entityType: "subscription",
      entityId: context.workspaceId,
      message: `Subscription upgraded to ${plan} (${billingCycle}) via test checkout.`,
      metadata: { plan, billingCycle, testPayment: true },
    });

    return ok({
      success: true,
      configured: true,
      testMode: true,
      plan,
      billingCycle,
      status: "ACTIVE",
      monthlyCredits,
      subscription,
      entitlements: getEntitlements(plan),
      message: `Test payment approved! Workspace upgraded to ${plan} with ${monthlyCredits.toLocaleString()} AI credits/month.`,
      route: "/account?section=usage",
    });
  } catch (error) {
    return mapUnknownError(error);
  }
}
