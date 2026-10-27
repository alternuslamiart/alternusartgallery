import test from 'node:test';
import assert from 'node:assert/strict';
import { shareConversation } from '../src/lib/chat-sharing.mjs';
const conversation = { title: 'My chat', messages: [{ role: 'user', content: 'Question' }, { role: 'assistant', content: 'Answer', citations: [{ source: 'https://example.com/source' }] }] };
test('Share sends the selected transcript and citations to the native share sheet', async () => {
  let received;
  assert.equal(await shareConversation(conversation, { share: async data => { received = data; } }), 'shared');
  assert.equal(received.title, 'My chat');
  assert.equal(received.text, 'My chat\n\nYou: Question\n\nCasynus: Answer\nSources: https://example.com/source');
  assert.equal(received.url, undefined);
});
test('desktop fallback copies the actual conversation and reports clipboard failures', async () => {
  let text;
  assert.equal(await shareConversation(conversation, { clipboard: { writeText: async value => { text = value; } } }), 'copied');
  assert.ok(text.includes('Casynus: Answer'));
  await assert.rejects(shareConversation(conversation, {}), /Sharing is unavailable/);
  await assert.rejects(shareConversation(conversation, { clipboard: { writeText: async () => { throw new Error('Clipboard denied'); } } }), /Clipboard denied/);
});
test('cancelling native share never silently copies private conversation text', async () => {
  await assert.rejects(shareConversation(conversation, { share: async () => { throw new DOMException('Cancelled', 'AbortError'); }, clipboard: { writeText: async () => { assert.fail('Unexpected clipboard write'); } } }), { name: 'AbortError' });
});
