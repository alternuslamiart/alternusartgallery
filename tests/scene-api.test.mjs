import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import ts from "typescript";
import { applyCommands, makeDocument, MAX_SCENE_BYTES, validateDocument } from "../src/lib/scene/document.mjs";
import * as editing from '../src/lib/scene/editing.mjs';

class JsonResponse {
  constructor(body, init) { this.body = body; this.status = init?.status ?? 200; }
  static json(body, init) { return new JsonResponse(body, init); }
}
function moduleRoute(path, modules, fetchImpl) {
  const code = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", "fetch", code)(id => {
    if (id === "next/server") return { NextResponse: JsonResponse };
    if (id === '@/lib/scene/editing.mjs') return editing;
    assert.ok(id in modules, `Unexpected dependency ${id}`); return modules[id];
  }, exports, fetchImpl);
  return exports;
}
const request = body => ({ headers: new Headers(), text: async () => JSON.stringify(body) });

function storageHarness({ guest = false, unavailable = false, foreign = false } = {}) {
  let record = null, writes = 0;
  const checkScope = where => { assert.equal(where.workspaceId, "workspace-a"); assert.equal(where.userId, "user-a"); assert.equal(where.deletedAt, null); };
  const tx = {
    project: { findUnique: async () => foreign ? { id: "foreign" } : null, create: async () => { writes++; }, updateMany: async ({ where }) => { checkScope(where); return { count: 1 }; } },
    blenderProject: {
      findFirst: async ({ where }) => { checkScope(where); return record; },
      findUnique: async () => null,
      findMany: async ({ where }) => { checkScope(where); return record ? [{ id: record.id, name: record.name }] : []; },
      create: async ({ data }) => { record = structuredClone(data); writes++; },
      updateMany: async ({ where, data }) => {
        checkScope(where);
        assert.deepEqual(where.settings.path, ["revision"]);
        // Prisma's JSON filter uses {path, equals} on the settings field.
        if (record.settings.revision !== where.settings.equals) return { count: 0 };
        record = { ...record, ...structuredClone(data) }; writes++; return { count: 1 };
      },
    },
  };
  const routes = moduleRoute("../src/app/api/studio-projects/route.ts", {
    "@prisma/client": { Prisma: { PrismaClientKnownRequestError: class extends Error {}, PrismaClientInitializationError: class extends Error {} } },
    "@/lib/prisma": { prisma: { ...tx, $transaction: async callback => { if (unavailable) throw new Error("DB offline"); return callback(tx); } } },
    "@/lib/platform/api": { requirePlatformContext: async () => guest ? JsonResponse.json({ error: "Unauthorized" }, { status: 401 }) : { workspaceId: "workspace-a", userId: "user-a" }, isApiResponse: value => value instanceof JsonResponse },
    "@/lib/scene/document.mjs": { MAX_SCENE_BYTES, validateDocument },
  });
  return { ...routes, writes: () => writes, setStoredSettings: settings => { record.settings = settings; } };
}

test("scene projects require auth and cannot overwrite another user's project ID", async () => {
  const doc = makeDocument();
  assert.equal((await storageHarness({ guest: true }).PUT(request({ document: doc, revision: 0 }))).status, 401);
  const foreign = storageHarness({ foreign: true });
  assert.equal((await foreign.PUT(request({ document: doc, revision: 0 }))).status, 409);
  assert.equal(foreign.writes(), 0);
});

test("scene snapshots reopen with revisions and reject stale concurrent saves", async () => {
  const api = storageHarness(), doc = makeDocument();
  assert.equal((await api.PUT(request({ document: doc, revision: 0 }))).body.revision, 1);
  const reopened = await api.GET({ nextUrl: new URL(`http://localhost/api/studio-projects?id=${doc.id}`) });
  assert.deepEqual(reopened.body.document, doc);
  const changed = { ...doc, name: "Edited project" };
  assert.equal((await api.PUT(request({ document: changed, revision: 1 }))).body.revision, 2);
  assert.equal((await api.PUT(request({ document: doc, revision: 1 }))).status, 409);
  assert.equal(api.writes(), 3);
});

test("storage failures never claim a project was saved", async () => {
  const api = storageHarness({ unavailable: true });
  const response = await api.PUT(request({ document: makeDocument(), revision: 0 }));
  assert.equal(response.status, 503); assert.equal(response.body.saved, undefined);
});

test("cloud reads reject guests, missing projects and corrupt stored scenes separately", async () => {
  const doc = makeDocument(), req = { nextUrl: new URL(`http://localhost/api/studio-projects?id=${doc.id}`) };
  assert.equal((await storageHarness({ guest: true }).GET(req)).status, 401);
  assert.equal((await storageHarness().GET(req)).status, 404);
  const api = storageHarness();
  await api.PUT(request({ document: doc, revision: 0 }));
  for (const settings of [
    { revision: 1, document: {} },
    { revision: -1, document: doc },
    { revision: 1, document: { ...doc, id: 'wrong-project' } },
  ]) {
    api.setStoredSettings(settings);
    const result = await api.GET(req);
    assert.equal(result.status, 422); assert.equal(result.body.code, 'INVALID_PROJECT_DATA');
    assert.equal(api.writes(), 2);
  }
});

for (const provider of ["gemini", "groq"]) {
  test(`${provider} uses native function calling and validates proposed scene edits`, async () => {
    const doc = makeDocument();
    const commands = [{ type: "create", kind: "box", dimensions: [2, 1, 1] }];
    let malicious = false;
    const api = moduleRoute("../src/app/api/ai-scene/route.ts", {
      "@/lib/platform/api": { requirePlatformContext: async () => ({ userId: "a", workspaceId: "a" }), isApiResponse: value => value instanceof JsonResponse },
      "@/lib/platform/usage": { aiUsage: { reserve: async () => ({}), refund: async () => {} }, usageError: () => JsonResponse.json({ error: "limit" }, { status: 429 }) },
      "@/lib/scene/document.mjs": { applyCommands, MAX_SCENE_BYTES, validateDocument },
      "@/lib/ai-provider-config": { getGeminiApiKey: () => "fake", getGeminiModel: () => "gemini-2.5-flash", getGroqApiKey: () => "fake", getGroqModel: () => "openai/gpt-oss-20b", getGroqBaseUrl: () => "https://api.groq.com/openai/v1" },
    }, async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.ok(init.signal instanceof AbortSignal);
      assert.ok(body.tools);
      if (process.env.SCENE_TOOL_CAPTURE) { fs.mkdirSync('.tmp', { recursive: true }); fs.writeFileSync(`.tmp/${provider}-scene-request.json`, JSON.stringify(body)); }
      const args = { commands: malicious ? [{ type: "execute", code: "unsafe" }] : commands };
      return Response.json(provider === "gemini" ? { candidates: [{ content: { parts: [{ functionCall: { name: "propose_scene_commands", args } }] } }] } : { choices: [{ message: { tool_calls: [{ function: { name: "propose_scene_commands", arguments: JSON.stringify(args) } }] } }] });
    });
    const response = await api.POST(request({ provider, prompt: "Create a two meter box", document: doc }));
    assert.equal(response.status, 200); assert.deepEqual(response.body.commands, commands);
    assert.equal(doc.objects.length, 0);
    malicious = true;
    assert.equal((await api.POST(request({ provider, prompt: "Create a box", document: doc }))).status, 400);
  });
}

test("scene quota and authentication failures cannot call an AI provider", async () => {
  for (const guest of [true, false]) {
    let providerCalls = 0;
    const api = moduleRoute("../src/app/api/ai-scene/route.ts", {
      "@/lib/scene/document.mjs": { applyCommands, MAX_SCENE_BYTES, validateDocument },
      "@/lib/platform/api": { requirePlatformContext: async () => guest ? JsonResponse.json({ error: "Sign in" }, { status: 401 }) : { userId: "a", workspaceId: "a" }, isApiResponse: value => value instanceof JsonResponse },
      "@/lib/platform/usage": { aiUsage: { reserve: async () => { throw Error("limit"); } }, usageError: () => JsonResponse.json({ error: "limit" }, { status: 429 }) },
      "@/lib/ai-provider-config": { getGeminiApiKey: () => "fake", getGeminiModel: () => "gemini" },
    }, async () => { providerCalls++; throw Error("unexpected"); });
    assert.equal((await api.POST(request({ provider: "gemini", prompt: "Create box", document: makeDocument() }))).status, guest ? 401 : 429);
    assert.equal(providerCalls, 0);
  }
});
