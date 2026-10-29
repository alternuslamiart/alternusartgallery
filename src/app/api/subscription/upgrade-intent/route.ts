import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, logActivity, ok, readJsonBody, requirePlatformContext, PlatformContext } from "@/lib/platform/api";
import { auth } from "@/lib/auth";
import { isBillingPlan, getEntitlements } from "@/lib/platform/entitlements";
import { AI_LIMITS } from "@/lib/platform/ai-usage.mjs";
import type { WorkspacePlan } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const rawPlan = typeof body.plan === "string" ? body.plan.toUpperCase() : "";
    const plan = rawPlan === "BASIC PLAN" ? "BASIC" : rawPlan;
    const billingCycle = body.billingCycle || "monthly";

    if (!isBillingPlan(plan) || (billingCycle !== "monthly" && billingCycle !== "yearly")) {
      return apiError("VALIDATION_ERROR", "A valid billing plan and billing cycle are required.", 400);
    }

    // Resolve workspace context with session or test payment fallback
    let context: PlatformContext | null = null;
    const platformContextRes = await requirePlatformContext().catch((err) => {
      console.warn("requirePlatformContext error during upgrade-intent:", err);
      return null;
    });

    if (platformContextRes && !isApiResponse(platformContextRes)) {
      context = platformContextRes;
    } else {
      // If unauthenticated or no context yet, resolve via session or test payment email
      const session = await auth().catch(() => null);
      let userId = session?.user?.id;
      const inputEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

      if (!userId && inputEmail) {
        const existingUser = await prisma.user.findFirst({
          where: { email: { equals: inputEmail, mode: "insensitive" } },
        });
        if (existingUser) userId = existingUser.id;
      }

      if (!userId) {
        // Resolve or create a demo/test user for guest test checkouts
        const targetEmail = inputEmail || "test-user@casynus.local";
        const found = await prisma.user.findFirst({
          where: { email: { equals: targetEmail, mode: "insensitive" } },
        });
        if (found) {
          userId = found.id;
        } else {
          const createdUser = await prisma.user.create({
            data: {
              email: targetEmail,
              firstName: "Test",
              lastName: "Subscriber",
              role: "CUSTOMER",
              isActive: true,
            },
          });
          userId = createdUser.id;
        }
      }

      // Find or create workspace for this user
      let workspace = await prisma.workspace.findFirst({
        where: { ownerId: userId },
        orderBy: { createdAt: "asc" },
      });

      if (!workspace) {
        const trialEndsAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
        workspace = await prisma.workspace.create({
          data: {
            ownerId: userId,
            name: "Personal",
            plan: "TRIAL",
            trialEndsAt,
          },
        });
      }

      context = { userId, workspaceId: workspace.id };
    }

    const targetPlan = plan as WorkspacePlan;
    const monthlyCredits = AI_LIMITS[plan];

    // Update both Workspace and SubscriptionState
    await prisma.workspace.update({
      where: { id: context.workspaceId },
      data: { plan: targetPlan },
    }).catch((err) => console.warn("workspace plan update warning:", err));

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

    // Reset current month's usage rate bucket so upgraded quota is immediately available
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const monthId = `ai-usage:v1:${context.workspaceId}:month:${start.toISOString().slice(0, 7)}`;
    await prisma.rateLimitBucket.upsert({
      where: { id: monthId },
      create: { id: monthId, count: 0, resetAt: end },
      update: { resetAt: end },
    }).catch((err) => console.warn("rateLimitBucket reset error:", err));

    try {
      await logActivity({
        workspaceId: context.workspaceId,
        userId: context.userId,
        action: "subscription.activated",
        entityType: "subscription",
        entityId: context.workspaceId,
        message: `Subscription upgraded to ${plan} (${billingCycle}) via test checkout.`,
        metadata: { plan, billingCycle, testPayment: true },
      });
    } catch (logErr) {
      console.warn("Activity log failed:", logErr);
    }

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
    console.error("subscription upgrade-intent error:", error);
    const message = error instanceof Error ? error.message : "Payment processing error.";
    return apiError("INTERNAL_ERROR", `Test payment failed: ${message}`, 500);
  }
}
