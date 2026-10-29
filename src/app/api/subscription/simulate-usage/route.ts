import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, isApiResponse, mapUnknownError, ok, readJsonBody, requirePlatformContext } from "@/lib/platform/api";
import { AI_LIMITS, usagePeriod, usagePlan } from "@/lib/platform/ai-usage.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await requirePlatformContext();
    if (isApiResponse(context)) return context;
    const body = await readJsonBody(request);
    const action = body.action; // "add", "set_percent", "reset"

    const now = new Date();
    const period = usagePeriod(now);
    const monthId = `ai-usage:v1:${context.workspaceId}:month:${period.key}`;
    const dayId = `ai-usage:v1:${context.workspaceId}:day:${now.toISOString().slice(0, 10)}:chat`;

    const subscription = await prisma.subscriptionState.findUnique({ where: { workspaceId: context.workspaceId } });
    const plan = (usagePlan(subscription) || "BASIC") as keyof typeof AI_LIMITS;
    const limit = AI_LIMITS[plan] ?? 200;

    let targetCount = 0;
    if (action === "reset") {
      targetCount = 0;
    } else if (action === "set_percent") {
      const percent = Number(body.percent) || 0;
      targetCount = Math.round((limit * percent) / 100);
    } else if (action === "add") {
      const units = Number(body.units) || 10;
      const current = await prisma.rateLimitBucket.findUnique({ where: { id: monthId } });
      targetCount = (current?.count ?? 0) + units;
    } else {
      return apiError("VALIDATION_ERROR", "Action must be 'add', 'set_percent', or 'reset'.", 400);
    }

    await prisma.rateLimitBucket.upsert({
      where: { id: monthId },
      create: { id: monthId, count: targetCount, resetAt: period.end },
      update: { count: targetCount, resetAt: period.end },
    });

    await prisma.rateLimitBucket.upsert({
      where: { id: dayId },
      create: { id: dayId, count: Math.min(targetCount, 20), resetAt: period.end },
      update: { count: Math.min(targetCount, 20), resetAt: period.end },
    });

    return ok({
      success: true,
      plan,
      limit,
      used: targetCount,
      remaining: Math.max(0, limit - targetCount),
      percent: Math.round((targetCount / limit) * 10000) / 100,
      message: action === "reset" ? "Usage reset to 0." : `Usage updated to ${targetCount} / ${limit} credits (${Math.round((targetCount / limit) * 100)}%).`,
    });
  } catch (error) {
    return mapUnknownError(error);
  }
}
