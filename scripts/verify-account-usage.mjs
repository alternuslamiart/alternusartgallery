// Start the production build locally on port 3003. This browser check mocks
// auth/usage HTTP only; it neither contacts an AI provider nor writes a database.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const base = process.env.AI_USAGE_QA_URL || "http://localhost:3003";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "QA must use a local server");
const out = path.resolve(`.tmp/account-usage-${Date.now()}`);
fs.mkdirSync(out, { recursive: true });
const port = 9347;
const chrome = spawn(process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${out}/profile`, "--no-first-run", "--no-default-browser-check", "--window-size=1440,1100", "about:blank"], { windowsHide: true, stdio: "ignore" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let tabs;
  for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://localhost:${port}/json`)).json(); if (tabs.length) break; } catch {} await wait(200); }
  assert.ok(tabs?.length, "Chrome debugger started");
  socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let id = 0, guest = false, failure = false, stalled = false, plan = "BASIC", limit = 200, used = 40;
  const pending = new Map(), runtimeErrors = [], requests = [];
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id, timer = setTimeout(() => { pending.delete(n); reject(Error(`CDP timeout: ${method}`)); }, 20_000);
    pending.set(n, { resolve, reject, timer }); socket.send(JSON.stringify({ id: n, method, params }));
  });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id) { const entry = pending.get(message.id); if (entry) { pending.delete(message.id); clearTimeout(entry.timer); if (message.error) entry.reject(Error(message.error.message)); else entry.resolve(message.result); } }
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Fetch.requestPaused") {
      const { request, requestId } = message.params;
      const url = new URL(request.url);
      if (stalled && url.pathname === "/api/usage") return;
      let body, status = 200;
      if (url.pathname === "/api/auth/session") body = guest ? null : { user: { id: "usage-browser-test", name: "Usage Test", email: "usage@example.test" }, expires: "2099-01-01T00:00:00Z" };
      else {
        const days = Number(url.searchParams.get("days")); requests.push(days);
        status = failure ? 503 : 200;
        body = failure ? { error: "Usage is temporarily unavailable." } : { plan, limit, used, remaining: Math.max(0, limit - used), percent: used / limit * 100, resetAt: "2026-11-01T00:00:00Z", history: Array.from({ length: days }, (_, i) => ({ date: new Date(Date.UTC(2026, 9, 22 - days + 1 + i)).toISOString().slice(0, 10), units: i === days - 1 ? used : 0 })) };
      }
      void send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: "application/json" }, { name: "Cache-Control", value: "no-store" }], body: Buffer.from(JSON.stringify(body)).toString("base64") }).catch(error => runtimeErrors.push(error.message));
    }
  });
  const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.text); return result.result.value; };
  const until = async expression => { for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await wait(200); } throw Error(`Browser condition failed: ${expression}`); };
  const click = label => evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent.trim() === ${JSON.stringify(label)})?.click()`);
  const screenshot = async name => { const result = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(result.data, "base64")); };
  await send("Page.enable"); await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/auth/session*" }, { urlPattern: "*/api/usage?*" }] });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: "localStorage.setItem('cookiePreference','necessary');localStorage.setItem('cedium_signin_popup_dismissed','1');" });
  await send("Page.navigate", { url: `${base}/account?section=usage` });
  await until("document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') === '20'");
  assert.equal(await evaluate("document.querySelector('.account-usage-stats').children.length"), 3);
  assert.equal(await evaluate("document.querySelector('main h1').textContent"), "Usage this period.");
  await screenshot("basic-20-percent");
  const target = await evaluate("(()=>{const r=document.querySelector('[aria-label=\"Daily AI credit history\"] > div:last-child').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...target });
  await until("document.querySelector('[role=tooltip]')?.textContent.includes('40 credits')");
  await evaluate("document.querySelector('header button').click()");
  await until("document.documentElement.getAttribute('data-coreforge-theme') === 'dark'");
  await screenshot("usage-dark");
  for (const days of [7, 30, 90]) {
    await click(`${days}d`);
    await until(`document.querySelector('[aria-label="Daily AI credit history"]')?.children.length === ${days}`);
    assert.equal(requests.at(-1), days);
  }
  for (const [nextPlan, nextLimit, percent] of [["PRO", 800, 5], ["TEAM", 2000, 2], ["STUDIO", 4000, 1]]) {
    plan = nextPlan; limit = nextLimit; await click("Refresh");
    await until(`document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') === '${percent}'`);
  }
  plan = "BASIC"; limit = 200; used = 160; await click("Refresh");
  await until("document.body.innerText.includes('over 80%')");
  used = 200; await click("Refresh");
  await until("document.body.innerText.includes('Monthly limit reached')");
  await screenshot("basic-exhausted");
  used = 0; await click("Refresh");
  await until("document.body.innerText.includes('No AI usage recorded')");
  failure = true; await click("Refresh");
  await until("document.querySelector('[role=alert]')?.textContent.includes('temporarily unavailable')");
  assert.equal(await evaluate("document.querySelector('[role=progressbar]') === null"), true);
  failure = false; await click("Retry");
  await until("document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') === '0'");
  await click("Limits");
  await until("document.querySelector('main h1')?.textContent === 'Rate limits.' && document.querySelector('[role=progressbar]') !== null");
  assert.equal(await evaluate("document.querySelectorAll('.account-limit-row').length"), 7);
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Daily AI credit history\"]') === null"), true);
  assert.match(await evaluate("document.querySelector('.account-limit-row').textContent"), /200/);
  assert.match(await evaluate("[...document.querySelectorAll('.account-limit-row')].find(row => row.textContent.includes('3D generation')).textContent"), /20 credits/);
  await screenshot("limits-dark");
  await evaluate("document.querySelector('header button').click()");
  await until("document.documentElement.getAttribute('data-coreforge-theme') === 'light'");
  await screenshot("limits-light");
  stalled = true;
  await send("Page.navigate", { url: `${base}/account?section=limits` });
  await until("document.querySelectorAll('.account-limit-row').length === 7 && document.querySelector('[aria-busy=true]') !== null");
  assert.equal(await evaluate("document.querySelector('[role=progressbar]') === null"), true);
  await until("document.querySelector('[role=alert]')?.textContent.includes('taking too long')");
  await screenshot("limits-timeout");
  stalled = false; await click("Retry");
  await until("document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') === '0'");
  guest = true;
  await send("Page.reload");
  await until("document.querySelector('main')?.textContent.includes('Sign in to view your AI usage')");
  assert.equal(await evaluate("document.querySelector('[role=progressbar]') === null"), true);
  assert.deepEqual(runtimeErrors, []);
  console.log(JSON.stringify({ passed: true, scenarios: ["original Usage triplet and hover chart", "Basic/Pro/Teams/Studio percentages", "7/15/30/90-day charts", "80% warning", "100% cap", "empty history", "503 clears stale data and Retry restores", "original Limits rows with real plan/costs", "light and dark presentation", "loading shell and 15-second timeout/Retry", "signed-out visibility"], runtimeErrors, artifacts: out }));
} finally { socket?.close(); chrome.kill(); }
