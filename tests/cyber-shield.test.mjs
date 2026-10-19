import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  CyberDefenseTracker,
  decodeInspectableText,
  escapeHtmlEntities,
  inspectRequestThreat,
  sanitizeAndInspectPayload,
  verifyAdminSessionEdge,
  verifySameOriginMutation,
} from "../src/lib/security/cyber-shield.mjs";

test("decodeInspectableText decodes multi-pass URL-encoded payloads", () => {
  const doubleEncoded = "%253Cscript%253Ealert(1)%253C%252Fscript%253E";
  assert.equal(decodeInspectableText(doubleEncoded), "<script>alert(1)</script>");
});

test("inspectRequestThreat blocks SQLi, XSS, path traversal, command injection, SSRF, and scanner probes", () => {
  // SQL Injection (including URL-encoded and blind SQLi)
  const sqliUnion = inspectRequestThreat({
    pathname: "/api/projects",
    search: "?search=1%20UNION%20ALL%20SELECT%20password%20FROM%20users",
  });
  assert.equal(sqliUnion.blocked, true);
  assert.equal(sqliUnion.code, "SQL_INJECTION");

  const sqliBlind = inspectRequestThreat({
    pathname: "/api/projects",
    search: "?id=1%20AND%20SLEEP(5)",
  });
  assert.equal(sqliBlind.blocked, true);
  assert.equal(sqliBlind.code, "SQL_INJECTION");

  // Double-encoded XSS
  const xssDoubleEncoded = inspectRequestThreat({
    pathname: "/casynus",
    search: "?q=%253Cscript%253Ealert(document.cookie)%253C%252Fscript%253E",
  });
  assert.equal(xssDoubleEncoded.blocked, true);
  assert.equal(xssDoubleEncoded.code, "XSS_ATTACK");

  // Path Traversal & Sensitive Dotfile Probes
  const dotEnvProbe = inspectRequestThreat({
    pathname: "/.env.local",
  });
  assert.equal(dotEnvProbe.blocked, true);
  assert.equal(dotEnvProbe.code, "SENSITIVE_PATH_PROBE");
  assert.equal(dotEnvProbe.status, 404);

  const traversalProbe = inspectRequestThreat({
    pathname: "/api/assets",
    search: "?file=..%252f..%252fetc%252fpasswd",
  });
  assert.equal(traversalProbe.blocked, true);
  assert.equal(traversalProbe.code, "PATH_TRAVERSAL");

  // Command Injection
  const cmdInjection = inspectRequestThreat({
    pathname: "/api/render",
    search: "?scene=test;cat%20/etc/passwd",
  });
  assert.equal(cmdInjection.blocked, true);
  assert.equal(cmdInjection.code, "COMMAND_INJECTION");

  // SSRF Cloud Metadata Probe
  const ssrfProbe = inspectRequestThreat({
    pathname: "/api/import",
    search: "?url=http://169.254.169.254/latest/meta-data/",
  });
  assert.equal(ssrfProbe.blocked, true);
  assert.equal(ssrfProbe.code, "SSRF_PROBE");

  // Automated Vulnerability Scanner User-Agent
  const scannerUa = inspectRequestThreat({
    pathname: "/",
    userAgent: "Mozilla/5.0 (compatible; Nuclei - Open-source project)",
  });
  assert.equal(scannerUa.blocked, true);
  assert.equal(scannerUa.code, "MALICIOUS_SCANNER_UA");
  assert.equal(scannerUa.status, 403);

  // Legitimate Studio & API Requests Pass Cleanly
  const cleanStudio = inspectRequestThreat({
    pathname: "/casynus",
    search: "?mode=floor-plan",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    method: "GET",
  });
  assert.equal(cleanStudio.blocked, false);
});

test("verifySameOriginMutation blocks cross-origin CSRF POSTs while allowing same-origin and webhooks", () => {
  // Cross-origin POST to API is blocked
  const crossOriginPost = verifySameOriginMutation({
    method: "POST",
    pathname: "/api/ai-chat",
    origin: "https://evil-attacker.example.com",
    host: "casynus.com",
  });
  assert.equal(crossOriginPost.allowed, false);

  // Cross-site Sec-Fetch-Site header is blocked
  const crossSiteFetch = verifySameOriginMutation({
    method: "DELETE",
    pathname: "/api/projects/123",
    origin: "https://casynus.com",
    host: "casynus.com",
    secFetchSite: "cross-site",
  });
  assert.equal(crossSiteFetch.allowed, false);

  // Same-origin POST is allowed
  const sameOriginPost = verifySameOriginMutation({
    method: "POST",
    pathname: "/api/ai-chat",
    origin: "https://casynus.com",
    host: "casynus.com",
    secFetchSite: "same-origin",
  });
  assert.equal(sameOriginPost.allowed, true);

  // Webhook routes remain exempt for external signature-verified providers
  const stripeWebhook = verifySameOriginMutation({
    method: "POST",
    pathname: "/api/stripe/webhook",
    origin: "https://api.stripe.com",
    host: "casynus.com",
  });
  assert.equal(stripeWebhook.allowed, true);
});

test("sanitizeAndInspectPayload rejects prototype pollution, NoSQL operators, and null bytes", () => {
  assert.throws(
    () => sanitizeAndInspectPayload(JSON.parse('{"__proto__":{"isAdmin":true}}')),
    /Forbidden object key/
  );

  assert.throws(
    () => sanitizeAndInspectPayload({ email: { $ne: null } }),
    /Forbidden object key/
  );

  assert.throws(
    () => sanitizeAndInspectPayload({ name: "bad\u0000string" }),
    /Null byte detected/
  );

  const clean = sanitizeAndInspectPayload({
    message: "Design a modern daylight courtyard pavilion",
    provider: "groq",
    messages: [{ role: "user", content: "Hello" }],
  });
  assert.deepEqual(clean, {
    message: "Design a modern daylight courtyard pavilion",
    provider: "groq",
    messages: [{ role: "user", content: "Hello" }],
  });
});

test("verifyAdminSessionEdge cryptographically verifies HMAC-SHA256 tokens and rejects tampering", async () => {
  const secret = "super-secret-admin-hmac-key-for-testing-only";
  const now = 1_700_000_000_000;
  const timestamp = String(now - 5000);
  const nonce = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
  const validSignature = createHmac("sha256", secret)
    .update(`${timestamp}.${nonce}`)
    .digest("hex");

  const validToken = `${validSignature}.${timestamp}.${nonce}`;
  assert.equal(await verifyAdminSessionEdge(validToken, secret, { now }), true);

  // Forged signature with valid 64-hex format must be rejected
  const forgedSignature = "f".repeat(64);
  const forgedToken = `${forgedSignature}.${timestamp}.${nonce}`;
  assert.equal(await verifyAdminSessionEdge(forgedToken, secret, { now }), false);

  // Expired token (>24h old) must be rejected
  const expiredTimestamp = String(now - 25 * 60 * 60 * 1000);
  const expiredSig = createHmac("sha256", secret)
    .update(`${expiredTimestamp}.${nonce}`)
    .digest("hex");
  assert.equal(
    await verifyAdminSessionEdge(`${expiredSig}.${expiredTimestamp}.${nonce}`, secret, { now }),
    false
  );
});

test("CyberDefenseTracker enforces rate limits, brute-force lockouts, and strike auto-bans", () => {
  const tracker = new CyberDefenseTracker({ strikeThreshold: 3, strikeBanMs: 60_000 });
  const now = 1_700_000_000_000;

  // Rate limit bucket allows up to limit and blocks excess
  assert.equal(tracker.consumeRateLimit("203.0.113.5:api", 2, 60_000, now).allowed, true);
  assert.equal(tracker.consumeRateLimit("203.0.113.5:api", 2, 60_000, now + 100).allowed, true);
  const thirdAttempt = tracker.consumeRateLimit("203.0.113.5:api", 2, 60_000, now + 200);
  assert.equal(thirdAttempt.allowed, false);
  assert.equal(thirdAttempt.remaining, 0);

  // IP strike accumulation triggers automatic temporary ban
  assert.equal(tracker.recordStrike("198.51.100.9", "XSS_ATTACK", 1, now).banned, false);
  assert.equal(tracker.recordStrike("198.51.100.9", "SQL_INJECTION", 2, now + 50).banned, true);
  assert.equal(tracker.isIpBanned("198.51.100.9", now + 100).banned, true);
  assert.equal(tracker.isIpBanned("198.51.100.9", now + 61_000).banned, false);

  // Brute-force login failure lockout
  for (let i = 0; i < 4; i++) {
    assert.equal(tracker.recordAuthFailure("192.0.2.44", now).locked, false);
  }
  const fifthFailure = tracker.recordAuthFailure("192.0.2.44", now);
  assert.equal(fifthFailure.locked, true);
  assert.equal(tracker.checkAuthLockout("192.0.2.44", now + 1000).blocked, true);
  tracker.clearAuthFailures("192.0.2.44");
  assert.equal(tracker.checkAuthLockout("192.0.2.44", now + 1000).blocked, false);

  // HTML entity escaping
  assert.equal(
    escapeHtmlEntities('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
  );
});
