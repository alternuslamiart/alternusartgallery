import test from "node:test";
import assert from "node:assert/strict";
import { loadAccountUsage } from "../src/lib/account-usage-request.mjs";
test("usage fetch returns server data and disables caching", async () => {
  const data = { used: 40, limit: 200 };
  assert.deepEqual(await loadAccountUsage(7, { fetchImpl: async (url, init) => {
    assert.equal(url, "/api/usage?days=7"); assert.equal(init.cache, "no-store"); assert.ok(init.signal instanceof AbortSignal);
    return Response.json(data);
  } }), data);
});
test("an unresponsive usage request times out instead of loading forever", async () => {
  let aborted = false;
  await assert.rejects(loadAccountUsage(15, { timeoutMs: 15, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => { aborted = true; reject(signal.reason); }, { once: true });
  }) }), /taking too long/);
  assert.equal(aborted, true);
});
test("usage errors remain visible and cancellation aborts stale requests", async () => {
  await assert.rejects(loadAccountUsage(15, { fetchImpl: async () => Response.json({ error: { message: "Workspace unavailable" } }, { status: 503 }) }), /Workspace unavailable/);
  const controller = new AbortController();
  const request = loadAccountUsage(15, { signal: controller.signal, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true })) });
  controller.abort(); await assert.rejects(request, { name: "AbortError" });
});
