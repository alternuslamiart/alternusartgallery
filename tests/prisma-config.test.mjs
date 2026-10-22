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
