import test from "node:test";
import assert from "node:assert/strict";
import { configured3DProviders, submit3DTask, inspect3DTask, safeModelURL } from "../src/lib/ai3d/providers.mjs";

test("3D capabilities expose configuration without exposing keys", () => {
  const result = configured3DProviders({ MESHY_API_KEY: "private", TRIPO_API_KEY: "private2" });
  assert.deepEqual(result.map(p => p.id), ["meshy", "tripo"]);
  assert.ok(!JSON.stringify(result).includes("private"));
  assert.deepEqual(configured3DProviders({}), []);
});
test("Meshy submits real preview and PBR refine requests, then reads GLB output", async () => {
  const requests = [], env = { MESHY_API_KEY: "secret", MESHY_MODEL: "latest" };
  const fetchImpl = async (url, init) => { requests.push({ url, ...init }); return Response.json(init.method === "POST" ? { result: "task123" } : { status: "SUCCEEDED", progress: 100, model_urls: { glb: "https://assets.meshy.ai/model.glb" } }); };
  assert.equal(await submit3DTask("meshy", "A chair", { env, fetchImpl }), "task123");
  assert.equal(JSON.parse(requests[0].body).mode, "preview");
  await submit3DTask("meshy", "A chair", { env, fetchImpl, previewTaskId: "task123" });
  assert.equal(JSON.parse(requests[1].body).enable_pbr, true);
  assert.equal((await inspect3DTask("meshy", "task123", { env, fetchImpl })).modelURL, "https://assets.meshy.ai/model.glb");
});
test("Tripo uses v3 generation and task query contracts", async () => {
  const calls = [], env = { TRIPO_API_KEY: "secret" };
  const fetchImpl = async (url, init) => { calls.push({ url, ...init }); return Response.json({ code: 0, data: init.method === "POST" ? { task_id: "task_abc" } : { status: "success", progress: 100, output: { model_url: "https://cdn.tripo3d.ai/model.glb" } } }); };
  await submit3DTask("tripo", "A table", { env, fetchImpl });
  assert.match(calls[0].url, /\/v3\/generation\/text-to-model$/);
  assert.equal(JSON.parse(calls[0].body).pbr, true);
  assert.equal((await inspect3DTask("tripo", "task_abc", { env, fetchImpl })).status, "SUCCEEDED");
});
test("unsafe assets, missing keys and provider failures cannot become successful generations", async () => {
  for (const url of ["http://localhost/a.glb", "https://127.0.0.1/a", "https://assets.meshy.ai.evil.test/a", "https://user:password@assets.meshy.ai/a"]) assert.throws(() => safeModelURL(url));
  await assert.rejects(submit3DTask("meshy", "chair", { env: {} }), /not configured/);
  await assert.rejects(submit3DTask("meshy", "chair", { env: { MESHY_API_KEY: "secret" }, fetchImpl: async () => new Response("secret must not be returned", { status: 402 }) }), /credits/);
});
