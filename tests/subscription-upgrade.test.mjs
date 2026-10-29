import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

test("upgrade-intent validates plan and cycles, activates subscription and returns entitlements", async () => {
  class JsonResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers;
    }
    static json(body, init) {
      return new JsonResponse(body, init);
    }
  }

  let upsertCalled = false;
  let workspaceUpdated = false;
  let rateBucketUpdated = false;

  const mockPrisma = {
    workspace: {
      update: async ({ where, data }) => {
        workspaceUpdated = true;
        assert.equal(data.plan, "PRO");
        return { id: where.id, plan: data.plan };
      },
      findFirst: async () => ({ id: "ws-test-1", name: "Personal" }),
      create: async () => ({ id: "ws-test-1", name: "Personal" }),
    },
    subscriptionState: {
      upsert: async ({ where, create, update }) => {
        upsertCalled = true;
        assert.equal(where.workspaceId, "ws-test-1");
        assert.equal(create.plan, "PRO");
        assert.equal(update.status, "ACTIVE");
        return { workspaceId: where.workspaceId, plan: "PRO", status: "ACTIVE" };
      },
    },
    rateLimitBucket: {
      upsert: async () => {
        rateBucketUpdated = true;
        return { count: 0 };
      },
    },
    user: {
      findFirst: async () => ({ id: "user-test-1", email: "test@company.com" }),
      create: async () => ({ id: "user-test-1", email: "test@company.com" }),
    },
    activityLog: {
      create: async () => ({ id: "act-1" }),
    },
  };

  const modules = {
    "next/server": { NextResponse: JsonResponse },
    "@/lib/prisma": { prisma: mockPrisma },
    "@/lib/auth": { auth: async () => ({ user: { id: "user-test-1" } }) },
    "@/lib/platform/api": {
      requirePlatformContext: async () => ({ userId: "user-test-1", workspaceId: "ws-test-1" }),
      isApiResponse: (v) => v instanceof JsonResponse,
      ok: JsonResponse.json,
      apiError: (code, message, status, details) => JsonResponse.json({ error: { code, message, details } }, { status }),
      readJsonBody: async (req) => req.mockBody,
      logActivity: async () => {},
    },
    "@/lib/platform/entitlements": {
      isBillingPlan: (p) => ["BASIC", "PRO", "TEAM", "STUDIO"].includes(p),
      getEntitlements: (p) => ({ plan: p, features: ["ai_chat", "high_res_export"] }),
    },
    "@/lib/platform/ai-usage.mjs": {
      AI_LIMITS: { BASIC: 200, PRO: 800, TEAM: 2000, STUDIO: 4000 },
    },
  };

  const exports = {};
  const code = ts.transpileModule(fs.readFileSync("src/app/api/subscription/upgrade-intent/route.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  new Function("require", "exports", "Response", code)((id) => modules[id], exports, JsonResponse);

  // 1. Invalid plan returns 400
  const invalidReq = { mockBody: { plan: "INVALID_PLAN", billingCycle: "monthly" } };
  const res1 = await exports.POST(invalidReq);
  assert.equal(res1.status, 400);

  // 2. Valid test payment returns 200 and upgrades workspace
  const validReq = {
    mockBody: {
      plan: "PRO",
      billingCycle: "yearly",
      email: "test@company.com",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12 / 28",
      cvc: "123",
      testPayment: true,
    },
  };
  const res2 = await exports.POST(validReq);
  assert.equal(res2.status, 200);
  assert.equal(res2.body.success, true);
  assert.equal(res2.body.plan, "PRO");
  assert.equal(res2.body.monthlyCredits, 800);
  assert.equal(upsertCalled, true);
  assert.equal(workspaceUpdated, true);
  assert.equal(rateBucketUpdated, true);
});
