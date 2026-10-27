import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const code = ts.transpileModule(fs.readFileSync("prisma.config.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function config(env) {
  const exports = {};
  const modules = { "dotenv/config": {}, "prisma/config": { defineConfig: value => value, env: key => { assert.ok(env[key], `${key} required`); return env[key]; } } };
  new Function("require", "exports", "process", code)(id => { assert.ok(id in modules); return modules[id]; }, exports, { env });
  return exports.default;
}
test("Prisma CLI uses the direct connection while the runtime URL stays pooled", () => {
  const { datasource } = config({ DATABASE_URL: "postgresql://example.test/runtime", DIRECT_URL: "postgresql://example.test/admin" });
  assert.equal(datasource.url, "postgresql://example.test/runtime");
  assert.equal(datasource.directUrl, "postgresql://example.test/admin");
});
test("Prisma CLI retains the existing database URL when DIRECT_URL is absent", () => {
  const { datasource } = config({ DATABASE_URL: "postgresql://example.test/runtime" });
  assert.equal(datasource.directUrl, datasource.url);
});
test("Prisma runtime client normalizes unencoded pooler passwords and increases narrow pool limits", () => {
  const runtimeCode = ts.transpileModule(fs.readFileSync("src/lib/prisma.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let capturedOptions = null;
  class FakePrismaClient { constructor(options) { capturedOptions = options; } }
  const exports = {};
  new Function("require", "exports", "process", "globalThis", runtimeCode)(
    id => { assert.equal(id, "@prisma/client"); return { PrismaClient: FakePrismaClient }; },
    exports,
    { env: { NODE_ENV: "production", DATABASE_URL: 'postgresql://postgres.ref:pa@ss:w#rd@aws-0-us-east-1.pooler.supabase.com:6543/postgres?connection_limit=3' } },
    {},
  );
  const url = new URL(capturedOptions.datasources.db.url);
  assert.equal(url.hostname, "aws-0-us-east-1.pooler.supabase.com");
  assert.equal(url.port, "6543");
  assert.equal(url.searchParams.get("pgbouncer"), "true");
  assert.equal(url.searchParams.get("connection_limit"), "10");
  assert.equal(url.searchParams.get("pool_timeout"), "20");
});
