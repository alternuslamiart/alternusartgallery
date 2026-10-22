// Application credits, not provider billing tokens. One successful text/scene
// request costs 1 credit; a submitted 3D generation costs 20 (including refine).
export const AI_LIMITS = Object.freeze({ BASIC: 200, PRO: 800, TEAM: 2000, STUDIO: 4000 });
export const AI_COSTS = Object.freeze({ chat: 1, scene: 1, model: 20 });
export function usagePlan(subscription) {
  if (!subscription || !["ACTIVE", "TRIALING"].includes(subscription.status)) return "BASIC";
  return Object.hasOwn(AI_LIMITS, subscription.plan) ? subscription.plan : "BASIC";
}
export function usagePeriod(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end, key: start.toISOString().slice(0, 7) };
}
export class UsageLimitError extends Error {
  constructor(resetAt) { super("Monthly AI limit reached. Upgrade your plan or wait for the next UTC month."); this.resetAt = resetAt; }
}
const prefix = workspaceId => `ai-usage:v1:${workspaceId}:`;

export function createUsageService(db) {
  async function reserve(workspaceId, feature, now = new Date()) {
    const units = AI_COSTS[feature];
    if (!units) throw new Error("Unknown AI usage feature.");
    const period = usagePeriod(now);
    const monthId = `${prefix(workspaceId)}month:${period.key}`;
    const dayId = `${prefix(workspaceId)}day:${now.toISOString().slice(0, 10)}:${feature}`;
    await db.$transaction(async tx => {
      const subscription = await tx.subscriptionState.findUnique({ where: { workspaceId } });
      const limit = AI_LIMITS[usagePlan(subscription)];
      await tx.rateLimitBucket.upsert({ where: { id: monthId }, create: { id: monthId, count: 0, resetAt: period.end }, update: {} });
      // Conditional increment is serialized by PostgreSQL's row lock, including
      // requests arriving on different server instances. Both counters commit together.
      const claim = await tx.rateLimitBucket.updateMany({ where: { id: monthId, count: { lte: limit - units } }, data: { count: { increment: units } } });
      if (claim.count !== 1) throw new UsageLimitError(period.end);
      await tx.rateLimitBucket.upsert({ where: { id: dayId }, create: { id: dayId, count: units, resetAt: period.end }, update: { count: { increment: units } } });
    });
    return { monthId, dayId, units };
  }
  async function refund(ticket) {
    await db.$transaction(async tx => {
      for (const id of [ticket.monthId, ticket.dayId]) {
        await tx.rateLimitBucket.updateMany({ where: { id, count: { gte: ticket.units } }, data: { count: { decrement: ticket.units } } });
      }
    });
  }
  async function summary(workspaceId, days = 15, now = new Date()) {
    const period = usagePeriod(now);
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1));
    const [subscription, month, daily] = await Promise.all([
      db.subscriptionState.findUnique({ where: { workspaceId } }),
      db.rateLimitBucket.findUnique({ where: { id: `${prefix(workspaceId)}month:${period.key}` } }),
      db.rateLimitBucket.findMany({ where: { id: { startsWith: `${prefix(workspaceId)}day:`, gte: `${prefix(workspaceId)}day:${firstDay.toISOString().slice(0, 10)}`, lt: `${prefix(workspaceId)}day:${new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString().slice(0, 10)}` } } }),
    ]);
    const plan = usagePlan(subscription), limit = AI_LIMITS[plan], used = month?.count ?? 0;
    const history = Array.from({ length: days }, (_, index) => {
      const date = new Date(firstDay.getTime() + index * 86400000).toISOString().slice(0, 10);
      return { date, units: daily.filter(row => row.id.startsWith(`${prefix(workspaceId)}day:${date}:`)).reduce((sum, row) => sum + row.count, 0) };
    });
    return { plan, limit, used, remaining: Math.max(0, limit - used), percent: Math.round(used / limit * 10000) / 100, resetAt: period.end.toISOString(), periodStart: period.start.toISOString(), history, costs: AI_COSTS };
  }
  return { reserve, refund, summary };
}
