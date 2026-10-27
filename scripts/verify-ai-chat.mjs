// Opt-in acceptance with a fresh QA principal and real provider calls.
// Start a local production server with .env.local and its trusted TLS roots.
// node scripts/verify-ai-chat.mjs --live
import { createHunyuanLiveContext } from './hunyuan-live-test-context.mjs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
assert.deepEqual(process.argv.slice(2), ['--live'], 'Explicit --live is required: this test makes real provider calls.');
const base = process.env.AI_CHAT_QA_URL || 'http://localhost:3006';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'QA must target localhost.');
let qa;
const ids = [];
try {
  qa = await createHunyuanLiveContext(base);
  for (const provider of ['groq', 'you', 'gemini']) {
    const id = `chat-${randomUUID()}`; ids.push(id);
    const result = await qa.json('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, conversationId: id, message: 'Reply with the single word OK.' }) });
    assert.ok(result.message); assert.equal(result.saved, true);
    console.log('PASS authenticated chat and persistence', provider, 'answered via', result.provider);
  }
  let sessions = (await qa.json('/api/ai-chat/sessions')).sessions;
  const id = ids[0]; assert.ok(sessions.some(item => item.id === id));
  const project = (await qa.json('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Temporary chat project' }) })).project;
  const patch = changes => qa.json(`/api/assistant/conversations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
  await patch({ pinned: true, unread: true, title: 'Renamed QA chat', projectId: project.id });
  sessions = (await qa.json('/api/ai-chat/sessions')).sessions;
  const item = sessions.find(item => item.id === id);
  assert.equal(item.pinned, true); assert.equal(item.unread, true); assert.equal(item.title, 'Renamed QA chat'); assert.equal(item.projectId, project.id);
  await qa.logout(); await qa.login();
  assert.equal((await qa.json('/api/ai-chat/sessions')).sessions.find(item => item.id === id).pinned, true);
  await patch({ pinned: false, unread: false });
  await qa.json(`/api/assistant/conversations/${id}`, { method: 'DELETE' });
  assert.ok(!(await qa.json('/api/ai-chat/sessions')).sessions.some(item => item.id === id));
  console.log('PASS real sidebar rename/pin/unpin/unread/read/project/delete and logout/login persistence');
} catch (error) { console.log('FAIL', error.message); process.exitCode = 1; }
finally {
  if (qa) {
    await qa.db.assistantMessage.deleteMany({ where: { conversationId: { in: ids } } });
    await qa.db.assistantConversation.deleteMany({ where: { id: { in: ids }, userId: qa.id } });
    await qa.db.activityLog.deleteMany({ where: { userId: qa.id } });
    await qa.cleanup();
  }
}
