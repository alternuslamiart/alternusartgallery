// Simple in-memory rate limiter
// For production, consider using Redis or Upstash

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  // Maximum number of requests
  limit: number;
  // Time window in seconds
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitMap.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: now + windowMs,
    };
  }

  // If within window, check limit
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // API endpoints: 100 requests per minute
  api: { limit: 100, windowSeconds: 60 },

  // Auth endpoints: 10 requests per minute (prevent brute force)
  auth: { limit: 10, windowSeconds: 60 },

  // Payment endpoints: 20 requests per minute
  payment: { limit: 20, windowSeconds: 60 },

  // Search/heavy endpoints: 30 requests per minute
  search: { limit: 30, windowSeconds: 60 },

  // Contact form: 5 requests per minute
  contact: { limit: 5, windowSeconds: 60 },

  // Strict: 5 requests per minute (for sensitive operations)
  strict: { limit: 5, windowSeconds: 60 },
};

// Get client IP from request headers
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}
