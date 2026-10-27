import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const compile = file => ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const validation = {};
new Function('exports', 'require', compile('../src/lib/platform/validation.ts'))(validation, () => ({}));
const compiled = compile('../src/app/api/assistant/conversations/[id]/route.ts');
function harness({ foreign = false, foreignProject = false, guest = false } = {}) {
  let record = { id: 'chat-test', title: 'Original', pinned: false, unread: false, projectId: null, status: 'ACTIVE' };
  let writes = 0;
  const prisma = {
    assistantConversation: {
      findFirst: async ({ where }) => {
        assert.equal(where.workspaceId, 'workspace-a');
        assert.equal(where.userId, 'user-a');
        return foreign ? null : record;
      },
      update: async ({ data }) => { writes++; record = { ...record, ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) }; return record; },
    },
    assistantMessage: { findMany: async () => [] },
    project: { findFirst: async ({ where }) => { assert.equal(where.workspaceId, 'workspace-a'); assert.equal(where.deletedAt, null); return foreignProject ? null : { id: where.id }; } },
  };
  const api = {
    requirePlatformContext: async () => guest ? { status: 401 } : { workspaceId: 'workspace-a', userId: 'user-a' },
    isApiResponse: value => Boolean(value.status), parseId: params => params.id,
    readJsonBody: request => request.json(),
    ok: body => ({ status: 200, body }), apiError: (code, message, status) => ({ status, body: { code, message } }),
    mapUnknownError: error => { throw error; },
  };
  const exports = {};
  new Function('require', 'exports', compiled)(id => ({ '@/lib/prisma': { prisma }, '@/lib/platform/api': api, '@/lib/platform/validation': validation }[id] ?? {}), exports);
  return { call: (method, body = {}) => exports[method]({ json: async () => body }, { params: { id: 'chat-test' } }), record: () => record, writes: () => writes };
}
test('pin, unread, rename and project changes persist independently; delete archives', async () => {
  const h = harness();
  for (const changes of [{ pinned: true }, { unread: true }, { title: 'Renamed' }, { projectId: 'project-a' }]) assert.equal((await h.call('PATCH', changes)).status, 200);
  assert.deepEqual(h.record(), { id: 'chat-test', title: 'Renamed', pinned: true, unread: true, projectId: 'project-a', status: 'ACTIVE' });
  await h.call('PATCH', { pinned: false, unread: false, projectId: null });
  assert.equal(h.record().pinned, false); assert.equal(h.record().projectId, null);
  await h.call('DELETE'); assert.equal(h.record().status, 'ARCHIVED');
});
test('invalid sidebar values and empty titles are rejected before writing', async () => {
  for (const body of [{ pinned: 'true' }, { unread: 1 }, { title: '  ' }, { projectId: 23 }]) {
    const h = harness(); assert.equal((await h.call('PATCH', body)).status, 400); assert.equal(h.writes(), 0);
  }
});
test('foreign projects, conversations and guests cannot mutate or read private chats', async () => {
  const h = harness({ foreignProject: true }); assert.equal((await h.call('PATCH', { projectId: 'foreign' })).status, 404); assert.equal(h.writes(), 0);
  for (const method of ['GET', 'PATCH', 'DELETE']) {
    assert.equal((await harness({ foreign: true }).call(method)).status, 404);
    assert.equal((await harness({ guest: true }).call(method)).status, 401);
  }
});
