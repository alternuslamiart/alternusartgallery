import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSecurityHeaders,
  globalCyberDefense,
  inspectRequestThreat,
  verifyAdminSessionEdge,
  verifySameOriginMutation,
} from "@/lib/security/cyber-shield.mjs";

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  return "unknown";
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

const protectedRoutes: string[] = [];
const adminRoutes = ["/admin"];
const adminPublicRoutes = ["/admin/login"];
const adminPublicApiRoutes = ["/api/admin/auth/login", "/api/admin/auth/logout"];

function isIPAllowed(ip: string): boolean {
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS;
  if (!allowedIPs || allowedIPs === "*") {
    return true;
  }

  const allowedList = allowedIPs.split(",").map((entry) => entry.trim());
  return allowedList.some((allowed) => {
    if (allowed.endsWith(".")) {
      return ip.startsWith(allowed);
    }
    return ip === allowed;
  });
}

function resolveRateLimitTier(pathname: string): { bucket: string; limit: number; windowMs: number } {
  const windowMs = 60 * 1000;
  const isOAuthCallback = pathname.startsWith("/api/auth/callback/");

  if (!isOAuthCallback && (pathname.includes("/auth") || pathname.includes("/login"))) {
    return { bucket: "auth", limit: 8, windowMs };
  }
  if (pathname.startsWith("/api/ai-chat") || pathname.startsWith("/api/ai")) {
    return { bucket: "ai", limit: 25, windowMs };
  }
  if (pathname.includes("/payment") || pathname.includes("/paypal") || pathname.includes("/stripe")) {
    return { bucket: "payment", limit: 20, windowMs };
  }
  if (pathname.includes("/support")) {
    return { bucket: "support", limit: 6, windowMs };
  }
  const group = pathname.split("/")[2] || "api";
  return { bucket: `api:${group}`, limit: 100, windowMs };
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const ip = getClientIP(request);
  const now = Date.now();

  globalCyberDefense.stats.totalInspected += 1;

  // 1. Check Adaptive IP Reputation Ban (repeat WAF / exploit offenders)
  const banStatus = globalCyberDefense.isIpBanned(ip, now);
  if (banStatus.banned) {
    globalCyberDefense.stats.reputationBlocked += 1;
    return applySecurityHeaders(
      NextResponse.json(
        {
          error: "Access temporarily blocked by Cyber-Shield",
          code: "IP_REPUTATION_BLOCKED",
          retryAfter: banStatus.retryAfter,
        },
        {
          status: 403,
          headers: {
            "Retry-After": String(banStatus.retryAfter),
          },
        }
      )
    );
  }

  // 2. Web Application Firewall (WAF) — Inspect Method, Scanner UA, Sensitive Paths, SQLi, XSS, RCE, SSRF, Traversal
  const threat = inspectRequestThreat({
    pathname,
    search,
    userAgent: request.headers.get("user-agent") || "",
    method: request.method,
  });

  if (threat.blocked) {
    globalCyberDefense.stats.wafBlocked += 1;
    const strikeWeight = threat.severity === "critical" ? 2 : 1;
    globalCyberDefense.recordStrike(ip, threat.code || "WAF_RULE", strikeWeight, now);

    return applySecurityHeaders(
      NextResponse.json(
        {
          error: threat.status === 404 ? "Not Found" : "Request blocked by security policy",
          code: threat.code,
        },
        { status: threat.status }
      )
    );
  }

  // 3. CSRF Origin / Referer / Sec-Fetch-Site Protection on State-Changing API Requests
  const csrfCheck = verifySameOriginMutation({
    method: request.method,
    pathname,
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    host: request.headers.get("x-forwarded-host") || request.headers.get("host"),
    secFetchSite: request.headers.get("sec-fetch-site"),
  });

  if (!csrfCheck.allowed) {
    globalCyberDefense.stats.csrfBlocked += 1;
    globalCyberDefense.recordStrike(ip, "CSRF_ORIGIN_MISMATCH", 1, now);
    return applySecurityHeaders(
      NextResponse.json(
        {
          error: "Cross-origin mutation rejected by CSRF protection",
          code: "CSRF_VERIFICATION_FAILED",
        },
        { status: 403 }
      )
    );
  }

  // 4. Admin Route & Admin API Protection (IP Allowlist + Cryptographic Edge HMAC Verification)
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAdminPublicRoute = adminPublicRoutes.some((route) => pathname === route);
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPublicApi = adminPublicApiRoutes.some((route) => pathname === route);

  if (isAdminRoute || isAdminApi) {
    if (!isIPAllowed(ip)) {
      return applySecurityHeaders(
        NextResponse.json({ error: "Not Found" }, { status: 404 })
      );
    }
  }

  if ((isAdminRoute && !isAdminPublicRoute) || (isAdminApi && !isAdminPublicApi)) {
    const adminSession = request.cookies.get("admin-session")?.value;
    const validAdmin = await verifyAdminSessionEdge(
      adminSession,
      process.env.ADMIN_SESSION_SECRET,
      { now }
    );

    if (!validAdmin) {
      if (isAdminApi) {
        return applySecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  if (pathname === "/admin/login") {
    const adminSession = request.cookies.get("admin-session")?.value;
    const validAdmin = await verifyAdminSessionEdge(
      adminSession,
      process.env.ADMIN_SESSION_SECRET,
      { now }
    );
    if (validAdmin) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return applySecurityHeaders(NextResponse.redirect(dashboardUrl));
    }
  }

  // 5. Tiered API Rate Limiting & Brute-Force Lockout Protection
  if (pathname.startsWith("/api")) {
    const isOAuthCallback = pathname.startsWith("/api/auth/callback/");
    if (!isOAuthCallback && (pathname.includes("/auth") || pathname.includes("/login"))) {
      const lockStatus = globalCyberDefense.checkAuthLockout(ip, now);
      if (lockStatus.blocked) {
        return applySecurityHeaders(
          NextResponse.json(
            {
              error: "Too many failed attempts",
              message: "Account temporarily locked. Please try again later.",
              retryAfter: lockStatus.retryAfter,
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(lockStatus.retryAfter || 60),
              },
            }
          )
        );
      }
    }

    const tier = resolveRateLimitTier(pathname);
    const rateResult = globalCyberDefense.consumeRateLimit(
      `${ip}:${tier.bucket}`,
      tier.limit,
      tier.windowMs,
      now
    );

    if (!rateResult.allowed) {
      return applySecurityHeaders(
        NextResponse.json(
          {
            error: "Too many requests",
            message: "Please try again later",
            retryAfter: rateResult.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateResult.retryAfter),
              "X-RateLimit-Limit": String(tier.limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        )
      );
    }

    const response = applySecurityHeaders(NextResponse.next());
    response.headers.set("X-RateLimit-Limit", String(tier.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
    return response;
  }

  // 6. Protected Route Check
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const authToken = request.cookies.get("auth-token")?.value;

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
