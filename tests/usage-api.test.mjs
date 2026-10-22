import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
test("usage API authenticates, ignores caller workspace IDs and validates chart ranges", async () => {
  class JsonResponse { constructor(body, init) { this.body = body; this.status = init?.status ?? 200; this.headers = init?.headers; } static json(body, init) { return new JsonResponse(body, init); } }
  let guest = true, reads = 0;
  const modules = {
    "@/lib/platform/api": { requirePlatformContext: async () => guest ? JsonResponse.json({}, { status: 401 }) : { workspaceId: "owned" }, isApiResponse: value => value instanceof JsonResponse, ok: JsonResponse.json },
    "@/lib/platform/usage": { aiUsage: { summary: async (workspaceId, days) => { reads++; assert.equal(workspaceId, "owned"); return { days }; } }, usageError: () => JsonResponse.json({}, { status: 503 }) },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync("src/app/api/usage/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", "Response", code)(id => modules[id], exports, JsonResponse);
  const request = query => ({ nextUrl: new URL(`https://example.test/api/usage?${query}`) });
  assert.equal((await exports.GET(request("days=7"))).status, 401); assert.equal(reads, 0);
  guest = false;
  assert.equal((await exports.GET(request("days=999"))).status, 400); assert.equal(reads, 0);
  const response = await exports.GET(request("days=90&workspaceId=foreign"));
  assert.equal(response.status, 200); assert.equal(response.body.days, 90);
  assert.equal(response.headers["Cache-Control"], "private, no-store");
});
