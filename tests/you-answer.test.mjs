import assert from "node:assert/strict";
import test from "node:test";
import { askYou, buildYouQuery } from "../src/lib/you-answer.mjs";

test("You query includes bounded follow-up context", () => {
  const query = buildYouQuery("When was it published?", [{ role: "user", content: "Tell me about the report" }, { role: "assistant", content: "The report covers energy." }]);
  assert.match(query, /Previous conversation:/);
  assert.match(query, /Current question: When was it published\?/);
  assert.ok(query.length <= 400);
});

test("You Answer sends only query and key, returning safe citations", async () => {
  const result = await askYou("What is new?", [], { apiKey: "test-key", fetchImpl: async (url, init) => {
    assert.equal(url, "https://api.you.com/v1/answer");
    assert.equal(init.headers["X-API-Key"], "test-key");
    assert.deepEqual(JSON.parse(init.body), { query: "What is new?" });
    return { ok: true, json: async () => ({ answer: "A cited answer [[1]]", citations: [{ source: "https://example.com/article" }, { source: "javascript:alert(1)" }] }) };
  } });
  assert.equal(result.message, "A cited answer [[1]]");
  assert.deepEqual(result.citations, [{ source: "https://example.com/article" }]);
});

test("You rate limits and missing keys surface explicit errors", async () => {
  await assert.rejects(askYou("Question", [], { apiKey: "", fetchImpl: async () => { throw new Error("unexpected call"); } }), { code: "YOU_NOT_CONFIGURED" });
  await assert.rejects(askYou("Question", [], { apiKey: "test", fetchImpl: async () => ({ ok: false, status: 429 }) }), { code: "YOU_RATE_LIMIT", status: 429 });
});

test("You supports the official YDC_API_KEY alias", async () => {
  const previous = process.env.YDC_API_KEY;
  const primary = process.env.YOU_API_KEY;
  try {
    delete process.env.YOU_API_KEY;
    process.env.YDC_API_KEY = "alias-test-key";
    const result = await askYou("Question", [], { fetchImpl: async (_url, init) => {
      assert.equal(init.headers["X-API-Key"], "alias-test-key");
      return { ok: true, json: async () => ({ answer: "Answer" }) };
    } });
    assert.equal(result.message, "Answer");
  } finally {
    if (previous === undefined) delete process.env.YDC_API_KEY; else process.env.YDC_API_KEY = previous;
    if (primary === undefined) delete process.env.YOU_API_KEY; else process.env.YOU_API_KEY = primary;
  }
});
