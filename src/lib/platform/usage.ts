import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUsageService, UsageLimitError } from "./ai-usage.mjs";

export const aiUsage = createUsageService(prisma);
export type UsageTicket = Awaited<ReturnType<typeof aiUsage.reserve>>;
export function usageError(error: unknown) {
  if (error instanceof UsageLimitError) return NextResponse.json({ error: error.message, code: "AI_USAGE_LIMIT", resetAt: error.resetAt }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((error.resetAt.getTime() - Date.now()) / 1000))) } });
  console.error("AI usage storage unavailable", error);
  return NextResponse.json({ error: "AI usage could not be verified. Please try again later.", code: "AI_USAGE_UNAVAILABLE" }, { status: 503 });
}
