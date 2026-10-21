import test from "node:test";
import assert from "node:assert/strict";
import { parseStudioConversation, serializeStudioConversation } from "../src/components/crystal-studio/conversation-storage.mjs";

test("studio conversation restores messages and collapsed/expanded state", () => {
  const messages = [{ id: "one", role: "user", text: "Create a room" }, { id: "two", role: "assistant", text: "Room added", meta: "Interior" }];
  assert.deepEqual(parseStudioConversation(JSON.stringify({ version: 1, messages, open: false, expanded: true })), { messages, open: false, expanded: true });
});

test("studio conversation bounds saved histories by count and total size", () => {
  const messages = Array.from({ length: 230 }, (_, index) => ({ id: String(index), role: "user", text: "x".repeat(20_000) }));
  const raw = serializeStudioConversation({ messages, open: false, expanded: true });
  assert.ok(raw.length <= 1_000_000);
  const restored = parseStudioConversation(raw);
  assert.ok(restored.messages.length > 0 && restored.messages.length <= 200);
  assert.equal(restored.messages.at(-1).id, "229");
  assert.equal(restored.open, false);
  assert.equal(restored.expanded, true);
});

test("studio conversation retains only the latest 200 short messages", () => {
  const messages = Array.from({ length: 230 }, (_, index) => ({ id: String(index), role: "user", text: "hello" }));
  const restored = parseStudioConversation(serializeStudioConversation({ messages, open: true, expanded: false }));
  assert.equal(restored.messages.length, 200);
  assert.equal(restored.messages[0].id, "30");
  assert.equal(restored.messages.at(-1).id, "229");
});

test("studio conversation never writes an unreadable snapshot", () => {
  assert.equal(serializeStudioConversation({ messages: [{ id: "", role: "user", text: "hello" }], open: true, expanded: false }), null);
  assert.equal(parseStudioConversation(JSON.stringify({ version: 1, messages: [{ id: "one", role: "user", text: "hello", meta: "x".repeat(1001) }] })), null);
});

test("studio conversation rejects corrupt, unsupported and oversized histories", () => {
  for (const raw of [null, "{", JSON.stringify({ version: 2, messages: [] }), "x".repeat(1_000_001),
    JSON.stringify({ version: 1, messages: [{ id: "one", role: "user", text: "x".repeat(20_001) }] }),
    JSON.stringify({ version: 1, messages: [{ id: "one", role: "tool", text: "x" }] }),
    JSON.stringify({ version: 1, messages: [{ id: "one", role: "user", text: "x" }, { id: "one", role: "user", text: "y" }] })]) {
    assert.equal(parseStudioConversation(raw), null);
  }
});
