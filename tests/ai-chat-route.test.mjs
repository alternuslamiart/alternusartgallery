import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import ts from "typescript";
import { persistAIResponse } from "../src/lib/ai-response.mjs";
import { YouAnswerError } from "../src/lib/you-answer.mjs";

// Exercise the actual Next route with isolated auth, storage and HTTP adapters.
const compiled = ts.transpileModule(fs.readFileSync(new URL("../src/app/api/ai-chat/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function routeHarness(options = {}) {
  const calls = { provider: 0, writes: 0, reserved: 0, refunded: 0 };
  class JsonResponse {
    constructor(body, init) { this.body = body; this.status = init?.status ?? 200; }
    static json(body, init) { return new JsonResponse(body, init); }
  }
  const conversation = {
    findFirst: async () => null,
    findUnique: async () => options.collision ? { id: "owned-by-another-user" } : null,
    create: async ({ data }) => { assert.equal(data.workspaceId, "workspace-a"); assert.equal(data.userId, "user-a"); },
    update: async () => {},
  };
  const prisma = {
    assistantConversation: conversation,
    assistantMessage: { create: async () => {}, findMany: async () => [] },
    $transaction: async callback => {
      calls.writes++;
      if (options.saveFails) throw new Error("Storage unavailable");
      return callback(prisma);
    },
  };
  const adapters = {
    "next/server": { NextResponse: JsonResponse },
    "@/lib/ai-provider-config": {
      getConfiguredAIProvider: () => options.configuredProvider ?? null,
      getGeminiApiKey: () => "fake-gemini-key",
      getGeminiModel: () => "gemini-2.5-flash",
      getGroqApiKey: () => "fake-groq-key",
      getGroqModel: () => "openai/gpt-oss-20b",
      getGroqBaseUrl: () => "https://api.groq.com/openai/v1",
      getSafeAIErrorMessage: error => error instanceof Error ? error.message : String(error),
    },
    "@/lib/security/cyber-shield.mjs": { sanitizeAndInspectPayload: body => body },
    "@/lib/auth": { auth: async () => options.guest ? null : { user: { id: "user-a" } } },
    "@/lib/prisma": { prisma },
    "@/lib/platform/usage": {
      aiUsage: {
        reserve: async (workspaceId, feature) => { assert.equal(workspaceId, "workspace-a"); assert.equal(feature, "chat"); if (options.quota) throw new Error("quota"); calls.reserved++; return {}; },
        refund: async () => { calls.refunded++; },
      },
      usageError: error => JsonResponse.json({ error: error.message }, { status: options.quota ? 429 : 503 }),
    },
    "@/lib/platform/api": {
      requirePlatformContext: async () => {
        if (options.lookupFails) throw new Error("Database offline");
        return { userId: "user-a", workspaceId: "workspace-a" };
      },
      isApiResponse: value => value instanceof JsonResponse,
    },
    "@/lib/you-answer.mjs": {
      YouAnswerError,
      askYou: async () => { calls.provider++; return { message: "You answer", citations: [] }; },
    },
    "@/lib/ai-response.mjs": { persistAIResponse },
  };
  const exports = {};
  const fetchProvider = async (url, init) => {
    calls.provider++;
    if (options.providerFails) throw new Error(options.providerError ?? "Provider offline");
    assert.ok(init.signal instanceof AbortSignal);
    const body = JSON.parse(init.body);
    if (url.includes("googleapis")) {
      assert.equal(body.contents.at(-1).parts[0].text, "Hello");
      return Response.json({ candidates: [{ content: { parts: [{ text: "Gemini answer" }] }, finishReason: "STOP" }] });
    }
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    return Response.json({ choices: [{ message: { content: "Groq answer" } }] });
  };
  new Function("require", "exports", "fetch", "process", "console", compiled)(
    id => { assert.ok(id in adapters, `Unexpected dependency ${id}`); return adapters[id]; },
    exports, fetchProvider, { env: options.env ?? {} }, { info() {}, warn() {}, error() {} },
  );
  return { calls, send: body => exports.POST({ json: async () => body }), get: exports.GET };
}

for (const provider of ["gemini", "groq", "you"]) {
  test(`${provider}: workspace lookup failure blocks unmetered provider calls`, async () => {
    const { send, calls } = routeHarness({ lookupFails: true });
    const response = await send({ provider, message: "Hello", conversationId: "chat-test" });
    assert.equal(response.status, 503);
    assert.equal(calls.provider, 0);
    assert.equal(calls.writes, 0);
  });

  test(`${provider}: failed save returns the answer without a second provider call`, async () => {
    const { send, calls } = routeHarness({ saveFails: true });
    const response = await send({ provider, message: "Hello", conversationId: "chat-test" });
    assert.equal(response.status, 200);
    assert.equal(response.body.saved, false);
    assert.match(response.body.warning, /could not be saved/);
    assert.equal(calls.provider, 1);
    assert.equal(calls.writes, 1);
    assert.equal(calls.reserved, 1);
    assert.equal(calls.refunded, 0);
  });
}

test("You accepts authenticated studio requests without a cloud conversation ID", async () => {
  const { send } = routeHarness();
  const response = await send({ provider: "you", message: "Hello" });
  assert.equal(response.status, 200);
  assert.equal(response.body.message, "You answer");
});

test("You continues to require authentication", async () => {
  const { send, calls } = routeHarness({ guest: true });
  assert.equal((await send({ provider: "you", message: "Hello" })).status, 401);
  assert.equal(calls.provider, 0);
});

test("foreign conversation IDs stay inaccessible and never invoke providers", async () => {
  const { send, calls } = routeHarness({ collision: true });
  assert.equal((await send({ provider: "groq", message: "Hello", conversationId: "chat-foreign" })).status, 404);
  assert.equal(calls.provider, 0);
  assert.equal(calls.writes, 0);
});

test("successful saves keep workspace and user ownership", async () => {
  const { send, calls } = routeHarness();
  const response = await send({ provider: "groq", message: "Hello", conversationId: "chat-test" });
  assert.equal(response.status, 200);
  assert.equal(response.body.saved, true);
  assert.equal(calls.writes, 1);
});

test("You can be the server default and reports its YDC key alias as configured", async () => {
  const { get, send } = routeHarness({ configuredProvider: "you", env: { YDC_API_KEY: "fake-key" } });
  const config = await get();
  assert.equal(config.body.provider, "you");
  assert.equal(config.body.configuredProviderReady, true);
  assert.equal((await send({ message: "Hello" })).body.provider, "you");
});

for (const provider of ["gemini", "groq", "you"]) {
  test(`${provider}: guests and exhausted plans cannot invoke providers`, async () => {
    for (const options of [{ guest: true }, { quota: true }]) {
      const { send, calls } = routeHarness(options);
      assert.equal((await send({ provider, message: "Hello" })).status, options.guest ? 401 : 429);
      assert.equal(calls.provider, 0);
    }
  });
}
test("failed providers refund one reservation even after failover", async () => {
  const { send, calls } = routeHarness({ providerFails: true });
  assert.ok((await send({ provider: "gemini", message: "Hello" })).status >= 400);
  assert.equal(calls.reserved, 1); assert.equal(calls.refunded, 1);
});

test("Gemini billing restrictions return an actionable configuration error", async () => {
  const { send, calls } = routeHarness({ providerFails: true, providerError: "Gemini 400: Gemini API free tier is not available in your country. Please enable billing on your project in Google AI Studio." });
  const response = await send({ provider: "gemini", message: "Hello" });
  assert.equal(response.status, 503);
  assert.equal(response.body.code, "GEMINI_BILLING_REQUIRED");
  assert.match(response.body.error, /billing.*Google AI Studio/i);
  assert.equal(calls.refunded, 1);
});
