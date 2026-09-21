import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

type PersistentRateLimitConfig = {
 limit: number;
 windowSeconds: number;
};

export type PersistentRateLimitResult = {
 success: boolean;
 remaining: number;
 retryAfter: number;
 };

function bucketId(identifier: string, config: PersistentRateLimitConfig) {
 return createHash("sha256")
  .update(`${identifier}:${config.limit}:${config.windowSeconds}`)
  .digest("hex");
}

export async function consumePersistentRateLimit(
 identifier: string,
 config: PersistentRateLimitConfig,
): Promise<PersistentRateLimitResult> {
 const now = new Date();
 const id = bucketId(identifier, config);
 const existing = await prisma.rateLimitBucket.findUnique({ where: { id } });

 if (!existing || existing.resetAt <= now) {
  const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);
  await prisma.rateLimitBucket.upsert({
   where: { id },
   create: { id, count: 1, resetAt },
   update: { count: 1, resetAt },
  });
  return {
   success: true,
   remaining: Math.max(config.limit - 1, 0),
   retryAfter: config.windowSeconds,
  };
 }

 if (existing.count >= config.limit) {
  return {
   success: false,
   remaining: 0,
   retryAfter: Math.max(Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000), 1),
  };
 }

 const updatedCount = await prisma.rateLimitBucket.updateMany({
  where: { id, resetAt: { gt: now }, count: { lt: config.limit } },
  data: { count: { increment: 1 } },
 });
 if (updatedCount.count === 0) {
  const current = await prisma.rateLimitBucket.findUnique({ where: { id } });
  const retryAfter = current
   ? Math.max(Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000), 1)
   : config.windowSeconds;
  return { success: false, remaining: 0, retryAfter };
 }
 const updated = await prisma.rateLimitBucket.findUniqueOrThrow({ where: { id } });
 return {
  success: true,
  remaining: Math.max(config.limit - updated.count, 0),
  retryAfter: Math.max(Math.ceil((updated.resetAt.getTime() - now.getTime()) / 1000), 1),
 };
}

export function rateLimitResponse(result: PersistentRateLimitResult) {
 return {
  status: 429,
  headers: {
   "Retry-After": String(result.retryAfter),
   "X-RateLimit-Remaining": String(result.remaining),
  },
 };
}
