import assert from "node:assert/strict";
import test from "node:test";
import { persistAIResponse } from "../src/lib/ai-response.mjs";

test("AI persistence reports saved only after a successful write", async () => {
  let writes = 0;
  assert.deepEqual(await persistAIResponse(async () => { writes++; }), { saved: true });
  assert.equal(writes, 1);
});

test("database failure preserves the provider answer and returns a storage warning", async () => {
  let writes = 0;
  const result = await persistAIResponse(async () => { writes++; throw new Error("private database credentials"); });
  assert.equal(result.saved, false);
  assert.match(result.warning, /could not be saved/);
  assert.ok(!result.warning.includes("credentials"));
  assert.equal(writes, 1);
});
