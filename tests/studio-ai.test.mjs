import assert from "node:assert/strict";
import test from "node:test";
import { requestStudioAnswer } from "../src/lib/studio-ai.mjs";

for (const provider of ["gemini", "groq", "you"]) {
  test(`studio sends ${provider} to the server with bounded conversation history`, async () => {
    const controller = new AbortController();
    const result = await requestStudioAnswer({ provider, message: "Plan a room", signal: controller.signal,
      messages: [{ role: "system", text: "Workspace notice" }, ...Array.from({ length: 20 }, (_, n) => ({ role: n % 2 ? "assistant" : "user", text: `Turn ${n}` }))],
      fetchImpl: async (url, init) => {
        assert.equal(url, "/api/ai-chat");
        assert.equal(init.signal, controller.signal);
        const body = JSON.parse(init.body);
        assert.equal(body.provider, provider);
        assert.equal(body.message, "Plan a room");
        assert.equal(body.history.length, 16);
        assert.equal(body.history[0].content, "Turn 4");
        assert.equal(body.conversationId, undefined);
        return { ok: true, json: async () => ({ message: "Real provider answer", provider }) };
      } });
    assert.equal(result.message, "Real provider answer");
  });
}

test("studio surfaces authentication and API errors instead of demo success", async () => {
  await assert.rejects(requestStudioAnswer({ provider: "you", message: "Hi", fetchImpl: async () => ({ ok: false, json: async () => ({ error: "Sign in to use You." }) }) }), /Sign in/);
  await assert.rejects(requestStudioAnswer({ provider: "groq", message: "Hi", fetchImpl: async () => ({ ok: true, json: async () => ({ message: "" }) }) }), /empty response/);
});
