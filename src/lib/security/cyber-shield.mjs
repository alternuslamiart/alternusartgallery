// @ts-check

/**
 * Casynus Cyber-Shield Security Engine
 * Multi-layered Web Application Firewall (WAF), CSRF Origin Guard,
 * Adaptive Rate Limiter / Brute-Force Lockout, Payload Sanitizer,
 * and Web Crypto HMAC Session Verifier.
 */

const SENSITIVE_PATH_PATTERNS = [
  /(?:^|\/)\.env(?:\.|$|\/)/i,
  /(?:^|\/)\.git(?:\/|$)/i,
  /(?:^|\/)\.svn(?:\/|$)/i,
  /(?:^|\/)\.hg(?:\/|$)/i,
  /(?:^|\/)\.aws(?:\/|$)/i,
  /(?:^|\/)\.ssh(?:\/|$)/i,
  /(?:^|\/)wp-admin(?:\/|$)/i,
  /(?:^|\/)wp-login\.php$/i,
  /(?:^|\/)wp-content(?:\/|$)/i,
  /(?:^|\/)xmlrpc\.php$/i,
  /(?:^|\/)phpmyadmin(?:\/|$)/i,
  /(?:^|\/)pma(?:\/|$)/i,
  /(?:^|\/)adminer(?:\.php)?(?:\/|$)/i,
  /(?:^|\/)vendor\/phpunit(?:\/|$)/i,
  /(?:^|\/)actuator(?:\/|$)/i,
  /(?:^|\/)cgi-bin(?:\/|$)/i,
  /(?:^|\/)server-status$/i,
  /(?:^|\/)etc\/passwd$/i,
  /(?:^|\/)etc\/shadow$/i,
  /(?:^|\/)proc\/self\/environ$/i,
];

const SCANNER_USER_AGENT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /\bnmap\b/i,
  /masscan/i,
  /nuclei/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /feroxbuster/i,
  /wpscan/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /havij/i,
  /w3af/i,
  /\bhydra\b/i,
  /metasploit/i,
  /burpsuite/i,
  /morfeus/i,
  /python-requests\/2\.[0-9]+\.[0-9]+$/i,
];

const THREAT_SIGNATURES = [
  {
    code: "COMMAND_INJECTION",
    severity: "critical",
    patterns: [
      /(?:;|\|\||&&|\|)\s*(?:cat|ls|whoami|uname|id|pwd|nc|netcat|bash|sh|zsh|curl|wget|powershell|cmd\.exe)\b/i,
      /\$\(\s*(?:cat|whoami|id|uname|curl|wget|bash|sh)\b/i,
      /\b(?:eval|exec|system|passthru|shell_exec)\s*\(/i,
      /\bpowershell(?:\.exe)?\s+-(?:enc|encodedcommand|nop|w\s+hidden)\b/i,
    ],
  },
  {
    code: "SQL_INJECTION",
    severity: "critical",
    patterns: [
      /\bunion\b[\s/+*]*\b(?:all\s+)?select\b/i,
      /\bselect\b[\s\S]{1,80}\bfrom\b[\s\S]{1,40}\binformation_schema\b/i,
      /\b(?:drop|truncate|alter)\s+table\b/i,
      /\binsert\s+into\b[\s\S]{1,60}\bvalues\b/i,
      /\bdelete\s+from\b/i,
      /(?:'|")\s*(?:or|and)\s*(?:'[^']*'\s*=\s*'[^']*'|"\s*=\s*"|\d+\s*=\s*\d+)\s*(?:--|\#|\/\*|$)/i,
      /\b(?:sleep|benchmark|pg_sleep)\s*\(\s*\d+/i,
      /\bwaitfor\s+delay\s+['"]/i,
      /;\s*(?:shutdown|xp_cmdshell)\b/i,
    ],
  },
  {
    code: "SSRF_PROBE",
    severity: "critical",
    patterns: [
      /\b169\.254\.169\.254\b/,
      /\bmetadata\.google\.internal\b/i,
      /\b(?:gopher|dict|ldap|tftp|file):\/\//i,
    ],
  },
  {
    code: "XXE_INJECTION",
    severity: "critical",
    patterns: [/<!ENTITY\s+\w+\s+SYSTEM\b/i, /<!DOCTYPE\b[^>]*\[[\s\S]*<!ENTITY/i],
  },
  {
    code: "PATH_TRAVERSAL",
    severity: "high",
    patterns: [
      /(?:^|[\\/])\.\.(?:[\\/]|$)/,
      /\.\.[/\\]\.\.[/\\]/,
      /\/etc\/(?:passwd|shadow|hosts|issue)\b/i,
      /\/proc\/self\/(?:environ|cmdline|maps)\b/i,
      /\b(?:c|d):\\(?:windows|winnt|boot\.ini)/i,
    ],
  },
  {
    code: "NULL_BYTE_INJECTION",
    severity: "high",
    patterns: [/\u0000/, /%00/i],
  },
  {
    code: "XSS_ATTACK",
    severity: "high",
    patterns: [
      /<\s*script\b/i,
      /<\s*\/\s*script\s*>/i,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /data\s*:\s*text\/html/i,
      /\bon(?:error|load|click|mouseover|focus|blur|submit|toggle|animationstart)\s*=/i,
      /<\s*(?:iframe|object|embed|applet|meta)\b/i,
      /<\s*svg\b[^>]*\bon\w+\s*=/i,
      /\bdocument\s*\.\s*(?:cookie|write|domain)\b/i,
    ],
  },
  {
    code: "PROTOTYPE_POLLUTION",
    severity: "high",
    patterns: [/__proto__/, /constructor\s*\.\s*prototype/, /\["__proto__"\]/],
  },
];

const DANGEROUS_OBJECT_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "$where",
  "$ne",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$regex",
  "$expr",
]);

const CSRF_EXEMPT_PATH_PREFIXES = [
  "/api/auth/",
  "/api/webhooks/",
  "/api/stripe/webhook",
  "/api/paypal/webhook",
];

/**
 * Multi-pass URL decoding to defeat double/triple encoding evasion.
 * @param {string} input
 * @param {number} [maxPasses=3]
 */
export function decodeInspectableText(input, maxPasses = 3) {
  if (typeof input !== "string" || !input) return "";
  let current = input;
  for (let pass = 0; pass < maxPasses; pass++) {
    try {
      const decoded = decodeURIComponent(current.replace(/\+/g, " "));
      if (decoded === current) break;
      current = decoded;
    } catch {
      // Partial decode for malformed sequences
      current = current.replace(/%([0-9a-fA-F]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
      break;
    }
  }
  return current;
}

/**
 * Inspect a text string against all Cyber-Shield WAF threat signatures.
 * @param {string} rawText
 */
export function inspectTextThreat(rawText) {
  if (typeof rawText !== "string" || !rawText) {
    return { blocked: false, code: null, severity: null };
  }

  for (const sig of THREAT_SIGNATURES) {
    for (const pattern of sig.patterns) {
      if (pattern.test(rawText)) {
        return { blocked: true, code: sig.code, severity: sig.severity };
      }
    }
  }

  const decoded = decodeInspectableText(rawText);
  if (decoded !== rawText) {
    for (const sig of THREAT_SIGNATURES) {
      for (const pattern of sig.patterns) {
        if (pattern.test(decoded)) {
          return { blocked: true, code: sig.code, severity: sig.severity };
        }
      }
    }
  }

  return { blocked: false, code: null, severity: null };
}

/**
 * Inspect an incoming HTTP request (pathname, search, user-agent, headers) for cyber threats.
 * @param {{
 *   pathname: string;
 *   search?: string;
 *   userAgent?: string;
 *   method?: string;
 * }} requestInfo
 */
export function inspectRequestThreat(requestInfo) {
  const pathname = typeof requestInfo?.pathname === "string" ? requestInfo.pathname : "/";
  const search = typeof requestInfo?.search === "string" ? requestInfo.search : "";
  const userAgent = typeof requestInfo?.userAgent === "string" ? requestInfo.userAgent : "";
  const method = typeof requestInfo?.method === "string" ? requestInfo.method.toUpperCase() : "GET";

  // 1. Allowed HTTP methods check
  const allowedMethods = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);
  if (!allowedMethods.has(method)) {
    return {
      blocked: true,
      status: 405,
      code: "DISALLOWED_HTTP_METHOD",
      severity: "medium",
      reason: `HTTP method ${method} is not permitted.`,
    };
  }

  // 2. Automated vulnerability scanner User-Agent check
  if (userAgent) {
    for (const pattern of SCANNER_USER_AGENT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return {
          blocked: true,
          status: 403,
          code: "MALICIOUS_SCANNER_UA",
          severity: "high",
          reason: "Automated vulnerability scanner signature detected.",
        };
      }
    }
  }

  // 3. Sensitive path / exploit probe check
  const decodedPath = decodeInspectableText(pathname);
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(pathname) || pattern.test(decodedPath)) {
      return {
        blocked: true,
        status: 404,
        code: "SENSITIVE_PATH_PROBE",
        severity: "high",
        reason: "Access to sensitive or non-existent system path denied.",
      };
    }
  }

  // 4. Inspect pathname and query string for WAF threats
  const target = `${pathname}${search}`;
  const threat = inspectTextThreat(target);
  if (threat.blocked) {
    return {
      blocked: true,
      status: 400,
      code: threat.code,
      severity: threat.severity,
      reason: `Blocked by WAF signature: ${threat.code}`,
    };
  }

  return {
    blocked: false,
    status: 200,
    code: null,
    severity: null,
    reason: null,
  };
}

/**
 * Verify that state-changing API requests originate from the same origin (CSRF mitigation).
 * @param {{
 *   method: string;
 *   pathname: string;
 *   origin?: string | null;
 *   referer?: string | null;
 *   host?: string | null;
 *   secFetchSite?: string | null;
 * }} req
 */
export function verifySameOriginMutation(req) {
  const method = (req?.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { allowed: true, reason: null };
  }

  const pathname = req?.pathname || "/";
  if (!pathname.startsWith("/api/")) {
    return { allowed: true, reason: null };
  }

  if (CSRF_EXEMPT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return { allowed: true, reason: null };
  }

  // Browser Sec-Fetch-Site check
  if (req.secFetchSite && req.secFetchSite.toLowerCase() === "cross-site") {
    return {
      allowed: false,
      reason: "Cross-site state-changing request rejected by CSRF guard (Sec-Fetch-Site).",
    };
  }

  const host = (req.host || "").trim().toLowerCase();
  if (!host) {
    return { allowed: true, reason: null };
  }

  if (req.origin && req.origin !== "null") {
    try {
      const originHost = new URL(req.origin).host.toLowerCase();
      if (originHost !== host) {
        return {
          allowed: false,
          reason: `Origin host (${originHost}) does not match target host (${host}).`,
        };
      }
      return { allowed: true, reason: null };
    } catch {
      return { allowed: false, reason: "Malformed Origin header." };
    }
  }

  if (req.referer) {
    try {
      const refererHost = new URL(req.referer).host.toLowerCase();
      if (refererHost !== host) {
        return {
          allowed: false,
          reason: `Referer host (${refererHost}) does not match target host (${host}).`,
        };
      }
    } catch {
      return { allowed: false, reason: "Malformed Referer header." };
    }
  }

  return { allowed: true, reason: null };
}

/**
 * Recursively inspect and sanitize a parsed JSON object against prototype pollution,
 * NoSQL operator injection, excessive nesting depth, and dangerous control characters.
 * @param {unknown} payload
 * @param {{ maxDepth?: number; maxKeys?: number; maxStringLength?: number }} [options]
 */
export function sanitizeAndInspectPayload(payload, options = {}) {
  const maxDepth = options.maxDepth ?? 12;
  const maxKeys = options.maxKeys ?? 500;
  const maxStringLength = options.maxStringLength ?? 50000;
  let totalKeys = 0;

  /**
   * @param {unknown} value
   * @param {number} depth
   * @returns {unknown}
   */
  function visit(value, depth) {
    if (depth > maxDepth) {
      throw new Error("Payload exceeds maximum allowed nesting depth.");
    }

    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
      if (value.length > maxStringLength) {
        throw new Error(`String value exceeds maximum length of ${maxStringLength} characters.`);
      }
      if (value.includes("\u0000")) {
        throw new Error("Null byte detected in string payload.");
      }
      return value;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new Error("Non-finite number detected in payload.");
      }
      return value;
    }

    if (typeof value === "boolean") return value;

    if (Array.isArray(value)) {
      if (value.length > maxKeys) {
        throw new Error("Array length exceeds maximum allowed items.");
      }
      return value.map((item) => visit(item, depth + 1));
    }

    if (typeof value === "object") {
      const record = /** @type {Record<string, unknown>} */ (value);
      const clean = Object.create(null);
      const keys = Object.keys(record);
      totalKeys += keys.length;
      if (totalKeys > maxKeys) {
        throw new Error("Payload exceeds maximum allowed object keys.");
      }

      for (const key of keys) {
        if (DANGEROUS_OBJECT_KEYS.has(key) || key.startsWith("$")) {
          throw new Error(`Forbidden object key detected: ${key}`);
        }
        clean[key] = visit(record[key], depth + 1);
      }

      return { ...clean };
    }

    return undefined;
  }

  const sanitized = visit(payload, 0);
  return sanitized;
}

/**
 * Escape HTML special characters to prevent reflected/stored XSS when rendering untrusted text.
 * @param {string} input
 */
export function escapeHtmlEntities(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Verify an HMAC-SHA256 admin session token (`signature.timestamp.nonce`) using the
 * Web Crypto API (`crypto.subtle`), working seamlessly in both Edge Middleware and Node.js.
 * @param {string | undefined | null} token
 * @param {string | undefined | null} secret
 * @param {{ now?: number; maxAgeMs?: number }} [options]
 */
export async function verifyAdminSessionEdge(token, secret, options = {}) {
  if (!token || typeof token !== "string" || !secret || typeof secret !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [providedSignature, timestamp, nonce] = parts;
  if (!/^[0-9a-f]{64}$/i.test(providedSignature)) return false;
  if (!/^[0-9a-f]{32}$/i.test(nonce)) return false;

  const timestampNum = Number(timestamp);
  if (!Number.isInteger(timestampNum) || timestampNum <= 0) return false;

  const now = options.now ?? Date.now();
  const maxAgeMs = options.maxAgeMs ?? 24 * 60 * 60 * 1000;
  if (now - timestampNum > maxAgeMs || timestampNum - now > 60 * 1000) {
    return false;
  }

  const encoder = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(`${timestamp}.${nonce}`)
  );

  const expectedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time string comparison
  const normalizedProvided = providedSignature.toLowerCase();
  if (normalizedProvided.length !== expectedHex.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= normalizedProvided.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Adaptive Sliding-Window Rate Limiter & IP Threat Reputation Tracker.
 */
export class CyberDefenseTracker {
  /**
   * @param {{ maxEntries?: number; strikeThreshold?: number; strikeBanMs?: number }} [options]
   */
  constructor(options = {}) {
    this.maxEntries = options.maxEntries ?? 10000;
    this.strikeThreshold = options.strikeThreshold ?? 5;
    this.strikeBanMs = options.strikeBanMs ?? 15 * 60 * 1000; // 15 minutes
    /** @type {Map<string, { count: number; resetTime: number }>} */
    this.rateBuckets = new Map();
    /** @type {Map<string, { strikes: number; blockedUntil: number; lastReason: string }>} */
    this.ipReputation = new Map();
    /** @type {Map<string, { failures: number; lockUntil: number }>} */
    this.authFailures = new Map();
    this.stats = {
      totalInspected: 0,
      wafBlocked: 0,
      csrfBlocked: 0,
      rateLimited: 0,
      reputationBlocked: 0,
    };
  }

  /**
   * @param {number} [now]
   */
  prune(now = Date.now()) {
    if (this.rateBuckets.size > this.maxEntries) {
      this.rateBuckets.forEach((val, key) => {
        if (val.resetTime <= now) this.rateBuckets.delete(key);
      });
    }
    if (this.ipReputation.size > this.maxEntries) {
      this.ipReputation.forEach((val, key) => {
        if (val.blockedUntil > 0 && val.blockedUntil <= now) {
          this.ipReputation.delete(key);
        }
      });
    }
    if (this.authFailures.size > this.maxEntries) {
      this.authFailures.forEach((val, key) => {
        if (val.lockUntil > 0 && val.lockUntil <= now) {
          this.authFailures.delete(key);
        }
      });
    }
  }

  /**
   * Record a security strike against an IP address; auto-ban when threshold is reached.
   * @param {string} ip
   * @param {string} reason
   * @param {number} [weight=1]
   * @param {number} [now=Date.now()]
   */
  recordStrike(ip, reason, weight = 1, now = Date.now()) {
    if (!ip || ip === "unknown") return { banned: false, strikes: 0, retryAfter: 0 };
    this.prune(now);

    const existing = this.ipReputation.get(ip) ?? {
      strikes: 0,
      blockedUntil: 0,
      lastReason: reason,
    };

    existing.strikes += weight;
    existing.lastReason = reason;

    if (existing.strikes >= this.strikeThreshold) {
      const multiplier = Math.min(existing.strikes - this.strikeThreshold + 1, 8);
      existing.blockedUntil = now + this.strikeBanMs * multiplier;
    }

    this.ipReputation.set(ip, existing);
    const retryAfter =
      existing.blockedUntil > now ? Math.ceil((existing.blockedUntil - now) / 1000) : 0;

    return {
      banned: existing.blockedUntil > now,
      strikes: existing.strikes,
      retryAfter,
    };
  }

  /**
   * Check if an IP is currently banned due to accumulated security strikes.
   * @param {string} ip
   * @param {number} [now=Date.now()]
   */
  isIpBanned(ip, now = Date.now()) {
    if (!ip || ip === "unknown") return { banned: false, retryAfter: 0, reason: null };
    const entry = this.ipReputation.get(ip);
    if (!entry || entry.blockedUntil <= now) {
      return { banned: false, retryAfter: 0, reason: null };
    }
    return {
      banned: true,
      retryAfter: Math.max(Math.ceil((entry.blockedUntil - now) / 1000), 1),
      reason: entry.lastReason,
    };
  }

  /**
   * Record a failed login attempt with exponential backoff lockout.
   * @param {string} ip
   * @param {number} [now=Date.now()]
   */
  recordAuthFailure(ip, now = Date.now()) {
    if (!ip || ip === "unknown") return { locked: false, retryAfter: 0, failures: 0 };
    const entry = this.authFailures.get(ip) ?? { failures: 0, lockUntil: 0 };
    entry.failures += 1;

    if (entry.failures >= 5) {
      const exponent = Math.min(entry.failures - 5, 6);
      const lockDurationMs = 60 * 1000 * Math.pow(2, exponent); // 1m, 2m, 4m, 8m, 16m, 32m, 64m
      entry.lockUntil = now + lockDurationMs;
    }

    this.authFailures.set(ip, entry);
    const retryAfter = entry.lockUntil > now ? Math.ceil((entry.lockUntil - now) / 1000) : 0;
    return {
      locked: entry.lockUntil > now,
      retryAfter,
      failures: entry.failures,
    };
  }

  /**
   * Clear failed login attempts upon successful authentication.
   * @param {string} ip
   */
  clearAuthFailures(ip) {
    this.authFailures.delete(ip);
  }

  /**
   * Check if an IP is locked out from authentication endpoints.
   * @param {string} ip
   * @param {number} [now=Date.now()]
   */
  checkAuthLockout(ip, now = Date.now()) {
    if (!ip || ip === "unknown") return { blocked: false, retryAfter: 0 };
    const entry = this.authFailures.get(ip);
    if (!entry || entry.lockUntil <= now) return { blocked: false, retryAfter: 0 };
    return {
      blocked: true,
      retryAfter: Math.max(Math.ceil((entry.lockUntil - now) / 1000), 1),
    };
  }

  /**
   * Consume a rate-limit token for a given bucket key.
   * @param {string} key
   * @param {number} limit
   * @param {number} windowMs
   * @param {number} [now=Date.now()]
   */
  consumeRateLimit(key, limit, windowMs, now = Date.now()) {
    this.prune(now);
    const entry = this.rateBuckets.get(key);

    if (!entry || entry.resetTime <= now) {
      this.rateBuckets.set(key, { count: 1, resetTime: now + windowMs });
      return {
        allowed: true,
        remaining: Math.max(limit - 1, 0),
        retryAfter: Math.ceil(windowMs / 1000),
      };
    }

    if (entry.count >= limit) {
      this.stats.rateLimited += 1;
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(Math.ceil((entry.resetTime - now) / 1000), 1),
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: Math.max(limit - entry.count, 0),
      retryAfter: Math.max(Math.ceil((entry.resetTime - now) / 1000), 1),
    };
  }

  getSnapshot() {
    return {
      ...this.stats,
      activeRateBuckets: this.rateBuckets.size,
      trackedIps: this.ipReputation.size,
      lockedAuthIps: this.authFailures.size,
    };
  }
}

export const globalCyberDefense = new CyberDefenseTracker();

/**
 * Standard security headers applied across responses.
 */
export function getSecurityHeaders() {
  return {
    "X-DNS-Prefetch-Control": "on",
    "X-Download-Options": "noopen",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-site",
  };
}
