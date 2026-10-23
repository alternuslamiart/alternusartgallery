import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';
test('all entry documents allow same-origin microphone for client navigation into studios', async () => {
  const rules = await config.headers();
  const baseline = rules[0].headers.find(h => h.key === 'Permissions-Policy').value;
  assert.ok(baseline.includes('microphone=(self)'), 'The initial document policy survives client navigation from homepage/login into a studio');
  for (const route of ['/', '/login', '/aichat', '/casynus', '/interior', '/infrastructure', '/infrastructur', '/crystal']) {
    const policy = rules.filter(r => r.source === '/:path*' || r.source === route).flatMap(r => r.headers).filter(h => h.key === 'Permissions-Policy').at(-1)?.value;
    assert.ok(policy?.includes('microphone=(self)'), `${route} must permit its own microphone`);
    assert.ok(policy.includes('camera=()'));
    assert.ok(!policy.includes('microphone=*'), 'Cross-origin microphone delegation must not be enabled');
  }
});
