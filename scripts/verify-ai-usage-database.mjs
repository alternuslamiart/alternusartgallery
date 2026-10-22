// Opt-in live database verification. Never calls an AI provider or changes
// customer subscriptions. No URL, password, host or customer data is logged.
// Read-only: node scripts/verify-ai-usage-database.mjs
// Additive enum update: add --apply-plan-enum
// Isolated temporary workspace regression checks: add --write-test-data
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { AI_LIMITS, createUsageService, UsageLimitError } from "../src/lib/platform/ai-usage.mjs";

dotenv.config({ quiet: true });
const flags = new Set(process.argv.slice(2));
assert.ok([...flags].every(flag => ["--apply-plan-enum", "--write-test-data"].includes(flag)), "Unknown verification flag");
let db;
function connection(key) {
  const value = process.env[key];
  if (!value) throw new Error(`${key}: MISSING`);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${key}: INVALID_URL; check password URL encoding`); }
  if (!["postgresql:", "postgres:"].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error(`${key}: INVALID_POSTGRES_URL`);
  url.searchParams.set("connect_timeout", "10");
  url.searchParams.set("pool_timeout", "10");
  return url.toString();
}
async function inspect(client) {
  await client.$queryRaw`SELECT 1`;
  const [schema] = await client.$queryRaw`SELECT to_regclass('public.subscription_states') IS NOT NULL AS subscriptions, to_regclass('public.rate_limit_buckets') IS NOT NULL AS counters, to_regclass('public.workspaces') IS NOT NULL AS workspaces`;
  assert.ok(Object.values(schema).every(Boolean), "Required usage tables are missing; inspect schema before applying updates");
  const plans = await client.$queryRaw`SELECT e.enumlabel AS plan FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'WorkspacePlan' AND n.nspname = 'public' ORDER BY e.enumsortorder`;
  return plans.map(row => row.plan);
}
async function checkUsage(client) {
  const workspaceIds = [], ownerId = randomUUID(), now = new Date();
  const usage = createUsageService(client);
  try {
    for (const [plan, limit] of Object.entries(AI_LIMITS)) {
      const id = randomUUID(); workspaceIds.push(id);
      await client.workspace.create({ data: { id, ownerId, name: "Temporary AI usage verification", plan } });
      await client.subscriptionState.create({ data: { workspaceId: id, plan, status: "ACTIVE" } });
      assert.equal((await usage.summary(id, 7, now)).limit, limit);
    }
    const [basic, pro] = workspaceIds;
    const outcomes = await Promise.allSettled(Array.from({ length: 12 }, () => usage.reserve(basic, "model", now)));
    assert.equal(outcomes.filter(result => result.status === "fulfilled").length, 10, "Exactly 10 concurrent model requests fit Basic");
    assert.ok(outcomes.filter(result => result.status === "rejected").every(result => result.reason instanceof UsageLimitError), "Only quota exhaustion may reject a concurrent reservation");
    const exhausted = await usage.summary(basic, 15, now);
    assert.equal(exhausted.used, 200); assert.equal(exhausted.percent, 100);
    assert.equal(exhausted.history.at(-1).units, 200);
    assert.equal((await usage.summary(pro, 7, now)).used, 0, "Other workspaces remain untouched");
    await client.subscriptionState.update({ where: { workspaceId: basic }, data: { plan: "PRO" } });
    const upgraded = await usage.summary(basic, 15, now);
    assert.equal(upgraded.used, 200); assert.equal(upgraded.percent, 25);
    const ticket = await usage.reserve(basic, "chat", now);
    assert.equal((await usage.summary(basic, 15, now)).used, 201);
    await usage.refund(ticket);
    assert.equal((await usage.summary(basic, 15, now)).used, 200);
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    assert.equal((await usage.summary(basic, 90, nextMonth)).used, 0);
    console.log("PASS: four plan limits, concurrent cap, percentages, history, workspace isolation, upgrade continuity, refund and UTC rollover");
  } finally {
    // All deletions are bounded to fresh UUIDs created by this invocation.
    // A transaction makes cleanup all-or-nothing and never touches customer IDs.
    if (workspaceIds.length) await client.$transaction(async tx => {
      for (const workspaceId of workspaceIds) await tx.rateLimitBucket.deleteMany({ where: { id: { startsWith: `ai-usage:v1:${workspaceId}:` } } });
      await tx.subscriptionState.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
      await tx.workspace.deleteMany({ where: { id: { in: workspaceIds }, ownerId } });
    });
    console.log("Temporary verification data cleaned up");
  }
}
try {
  const runtimeUrl = connection("DATABASE_URL");
  db = new PrismaClient({ datasourceUrl: runtimeUrl, log: [] });
  let plans = await inspect(db);
  console.log("DATABASE_URL connected; required usage tables present");
  if (process.env.DIRECT_URL) {
    const direct = new PrismaClient({ datasourceUrl: connection("DIRECT_URL"), log: [] });
    try {
      await inspect(direct);
      console.log("DIRECT_URL connected");
      if (flags.has("--apply-plan-enum")) {
        const sql = await readFile(new URL("../docs/sql/20261022-ai-usage-plans.sql", import.meta.url), "utf8");
        for (const statement of sql.replace(/^--.*$/gm, "").split(";").map(value => value.trim()).filter(Boolean)) await direct.$executeRawUnsafe(statement);
        console.log("Additive BASIC/STUDIO plan SQL applied");
        plans = await inspect(db);
      }
    } finally { await direct.$disconnect(); }
  } else if (flags.has("--apply-plan-enum")) throw new Error("DIRECT_URL is required to apply plan SQL");
  assert.ok(Object.keys(AI_LIMITS).every(plan => plans.includes(plan)), "Plan enum is incomplete; apply the additive plan SQL first");
  console.log("PASS: all four plan enum values exist");
  if (flags.has("--write-test-data")) await checkUsage(db);
  else console.log("Read-only verification completed; pass --write-test-data for isolated usage regression checks");
} catch (error) {
  // Prisma's raw error text can include a connection string or database host.
  console.error("Database verification failed:", error instanceof assert.AssertionError ? error.message : error.message?.startsWith("DATABASE_URL:") || error.message?.startsWith("DIRECT_URL:") ? error.message : error.code || error.name || "Unknown error");
  process.exitCode = 1;
} finally { if (db) await db.$disconnect(); }
