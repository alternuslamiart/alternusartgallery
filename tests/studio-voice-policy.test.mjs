import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';
test('studio documents allow same-origin microphone while other routes remain restricted', async () => {
  const rules = await config.headers();
  const baseline = rules[0].headers.find(h => h.key === 'Permissions-Policy').value;
  assert.ok(baseline.includes('microphone=()'));
  for (const route of ['/casynus', '/interior', '/infrastructure', '/infrastructur', '/crystal']) {
    const policy = rules.filter(r => r.source === route).flatMap(r => r.headers).find(h => h.key === 'Permissions-Policy')?.value;
    assert.ok(policy?.includes('microphone=(self)'), `${route} must permit its own microphone`);
    assert.ok(policy.includes('camera=()'));
  }
});
