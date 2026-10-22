import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
class JsonResponse { constructor(body, init) { this.body = body; this.status = init?.status ?? 200; } static json(body, init) { return new JsonResponse(body, init); } }
function harness({ foreign = false, offline = false, quota = false } = {}) {
  const context = { userId: "user-a", workspaceId: "workspace-a" }, records = new Map(); let submissions = 0;
  const scope = where => { assert.equal(where.userId, context.userId); assert.equal(where.workspaceId, context.workspaceId); assert.equal(where.type, "MODEL_GENERATION"); };
  const prisma = { project: { findUnique: async () => foreign ? { userId: "other", workspaceId: "other" } : null }, aIProviderJob: {
    findFirst: async ({ where }) => { scope(where); return records.get(where.id) ?? null; },
    create: async ({ data }) => { if (offline) throw Error("offline"); if (records.has(data.id)) throw Error("unique"); const row = { ...structuredClone(data), createdAt: new Date(), updatedAt: new Date(), output: null, error: null }; records.set(data.id, row); return structuredClone(row); },
    update: async ({ where, data }) => { const row = { ...records.get(where.id), ...structuredClone(data), updatedAt: new Date() }; records.set(where.id, row); return structuredClone(row); },
    updateMany: async ({ where, data }) => { scope(where); const row = records.get(where.id); if (!row || (where.output && row.output[where.output.path[0]] !== where.output.equals)) return { count: 0 }; records.set(row.id, { ...row, ...structuredClone(data) }); return { count: 1 }; },
  } };
  const modules = { "next/server": { NextResponse: JsonResponse }, "@/lib/prisma": { prisma }, "./providers.mjs": { configured3DProviders: () => [{ id: "meshy", model: "latest" }], submit3DTask: async () => `task-${++submissions}`, inspect3DTask: async () => ({ status: "SUCCEEDED", progress: 100, modelURL: "https://assets.meshy.ai/model.glb" }) } };
  modules["@/lib/platform/usage"] = { aiUsage: { reserve: async (workspaceId, feature) => { assert.equal(workspaceId, context.workspaceId); assert.equal(feature, "model"); if (quota) throw Error("limit"); return {}; }, refund: async () => {} }, usageError: () => JsonResponse.json({ error: "limit" }, { status: 429 }) };
  const exports = {}; const code = ts.transpileModule(fs.readFileSync('src/lib/ai3d/jobs.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(id => { assert.ok(modules[id], id); return modules[id]; }, exports);
  return { ...exports, context, records, submissions: () => submissions };
}
const request = () => ({ requestId: crypto.randomUUID(), projectId: crypto.randomUUID(), studio: "architecture", provider: "meshy", prompt: "A modern chair" });
test("generation requests persist before provider submission and are idempotent", async () => {
  const api = harness(), body = request();
  const first = await api.create3DJob(api.context, body); assert.equal(first.body.status, "RUNNING");
  await api.create3DJob(api.context, body); assert.equal(api.submissions(), 1);
  assert.equal((await api.create3DJob(api.context, { ...body, prompt: "different" })).status, 409);
});
test("foreign projects and failed storage cannot spend provider credits", async () => {
  for (const options of [{ foreign: true }, { offline: true }]) { const api = harness(options); const result = await api.create3DJob(api.context, request()); assert.ok(result.status >= 400); assert.equal(api.submissions(), 0); }
});
test("exhausted monthly allowance prevents paid 3D submission", async () => {
  const api = harness({ quota: true });
  assert.equal((await api.create3DJob(api.context, request())).status, 429);
  assert.equal(api.submissions(), 0);
});
test("Meshy preview/refine survives polling and concurrent polls submit refinement once", async () => {
  const api = harness(), body = request(); await api.create3DJob(api.context, body);
  await Promise.all([api.refresh3DJob(api.context, body.requestId), api.refresh3DJob(api.context, body.requestId)]);
  assert.equal(api.submissions(), 2);
  const completed = await api.refresh3DJob(api.context, body.requestId);
  assert.equal(completed.body.status, "SUCCEEDED"); assert.match(completed.body.assetPath, /\/asset$/);
  assert.equal((await api.refresh3DJob(api.context, "missing")).status, 404);
});
