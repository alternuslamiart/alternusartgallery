import test from "node:test";
import assert from "node:assert/strict";
import { AI_LIMITS, createUsageService, usagePeriod, usagePlan, UsageLimitError } from "../src/lib/platform/ai-usage.mjs";

function harness(plan = "BASIC") {
  const rows = new Map(); let queue = Promise.resolve();
  const db = {
    subscriptionState: { findUnique: async () => ({ plan, status: "ACTIVE" }) },
    rateLimitBucket: {
      findUnique: async ({ where }) => rows.get(where.id),
      findMany: async ({ where }) => [...rows.values()].filter(row => row.id.startsWith(where.id.startsWith) && row.id >= where.id.gte && row.id < where.id.lt),
      upsert: async ({ where, create, update }) => { const row = rows.get(where.id); if (!row) rows.set(where.id, { ...create }); else if (update.count) row.count += update.count.increment; },
      updateMany: async ({ where, data }) => { const row = rows.get(where.id); if (!row || row.count > (where.count.lte ?? Infinity) || row.count < (where.count.gte ?? 0)) return { count: 0 }; row.count += data.count.increment ?? -data.count.decrement; return { count: 1 }; },
    },
    $transaction: callback => {
      const task = queue.then(async () => { const before = structuredClone(rows); try { return await callback(db); } catch (error) { rows.clear(); for (const [key, value] of before) rows.set(key, value); throw error; } });
      queue = task.catch(() => {}); return task;
    },
  };
  return createUsageService(db);
}
const now = new Date("2026-10-22T12:00:00Z");
test("plans have 1x/4x/10x/20x capacity; inactive and legacy plans use Basic", () => {
  assert.deepEqual(Object.values(AI_LIMITS), [200, 800, 2000, 4000]);
  for (const plan of ["TRIAL", "FREE", "unknown"]) assert.equal(usagePlan({ plan, status: "ACTIVE" }), "BASIC");
  assert.equal(usagePlan({ plan: "STUDIO", status: "EXPIRED" }), "BASIC");
});
test("real credits, weighted 3D, exact percentages, refund and workspace isolation", async () => {
  const service = harness();
  const ticket = await service.reserve("a", "chat", now);
  await service.reserve("a", "model", now);
  assert.equal((await service.summary("a", 7, now)).percent, 10.5);
  await service.refund(ticket);
  const summary = await service.summary("a", 7, now);
  assert.equal(summary.used, 20); assert.equal(summary.history.at(-1).units, 20);
  assert.equal((await service.summary("b", 7, now)).used, 0);
});
test("concurrent reservations stop at the cap; rejected credits never enter history", async () => {
  const service = harness();
  const outcomes = await Promise.allSettled(Array.from({ length: 12 }, () => service.reserve("a", "model", now)));
  assert.equal(outcomes.filter(item => item.status === "fulfilled").length, 10);
  assert.ok(outcomes.filter(item => item.status === "rejected").every(item => item.reason instanceof UsageLimitError));
  const summary = await service.summary("a", 15, now);
  assert.equal(summary.used, 200); assert.equal(summary.percent, 100); assert.equal(summary.history.at(-1).units, 200);
});
test("UTC rollover resets monthly allowance and retains 90-day history", async () => {
  const service = harness("STUDIO");
  await service.reserve("a", "scene", new Date("2026-09-30T23:59:59Z"));
  const summary = await service.summary("a", 90, new Date("2026-10-01T00:00:00Z"));
  assert.equal(summary.used, 0); assert.equal(summary.limit, 4000);
  assert.equal(summary.history.at(-2).units, 1);
  assert.equal(usagePeriod(new Date("2026-12-31T23:59:59Z")).end.toISOString(), "2027-01-01T00:00:00.000Z");
});
