import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';

test('map CSP permissions are scoped to Infrastructure and reject unsafe origins',async()=>{
  const original={environment:process.env.NODE_ENV,style:process.env.NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE,origins:process.env.INFRASTRUCTURE_MAP_ORIGINS};
  try {
    process.env.NODE_ENV='development';delete process.env.NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE;delete process.env.INFRASTRUCTURE_MAP_ORIGINS;
    const rules=await config.headers();
    assert.ok(!rules[0].headers.find(h=>h.key==='Content-Security-Policy').value.includes('demotiles'));
    for(const source of ['/infrastructure','/infrastructur','/_next/static/media/maplibre-gl-worker.:asset*']) {
      const csp=rules.find(r=>r.source===source).headers[0].value;
      assert.ok(csp.includes('https://demotiles.maplibre.org'));assert.ok(csp.includes("worker-src 'self' blob:"));
    }
    process.env.NODE_ENV='production';process.env.NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE='https://maps.example/style.json';process.env.INFRASTRUCTURE_MAP_ORIGINS='https://tiles.example';
    const production=(await config.headers()).find(r=>r.source==='/infrastructure').headers[0].value;
    assert.ok(!production.includes('demotiles'));assert.ok(production.includes('https://tiles.example'));
    process.env.INFRASTRUCTURE_MAP_ORIGINS='http://unsafe.example';await assert.rejects(()=>config.headers());
  } finally {
    for(const [key,value] of [['NODE_ENV',original.environment],['NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE',original.style],['INFRASTRUCTURE_MAP_ORIGINS',original.origins]])if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
});
