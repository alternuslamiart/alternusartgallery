/**
 * Input Sanitization Utilities
 * Protect against XSS, SQL Injection, and other attacks
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize string for safe database storage
 * Removes potentially dangerous characters
 */
export function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";

  return str
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Limit consecutive spaces
    .replace(/\s{2,}/g, " ");
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") return "";

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 254); // Max email length
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string") return null;

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    // Block javascript: and data: URIs
    if (url.toLowerCase().includes("javascript:") || url.toLowerCase().includes("data:")) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") return "";

  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "")
    // Remove dangerous characters
    .replace(/[<>:"|?*\x00-\x1F]/g, "")
    // Limit length
    .slice(0, 255)
    .trim();
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== "string") return "";

  return query
    .trim()
    // Remove SQL injection attempts
    .replace(/['";\\]/g, "")
    // Remove dangerous patterns
    .replace(/union\s+select/gi, "")
    .replace(/drop\s+table/gi, "")
    .replace(/insert\s+into/gi, "")
    .replace(/delete\s+from/gi, "")
    .replace(/update\s+set/gi, "")
    // Limit length
    .slice(0, 200);
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate that input only contains allowed characters
 */
export function validateAllowedChars(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

// Common validation patterns
export const PATTERNS = {
  // Alphanumeric only
  alphanumeric: /^[a-zA-Z0-9]+$/,
  // Alphanumeric with spaces
  alphanumericSpaces: /^[a-zA-Z0-9\s]+$/,
  // Name (letters, spaces, hyphens, apostrophes)
  name: /^[a-zA-Z\s\-']+$/,
  // Phone number
  phone: /^[+]?[\d\s\-().]+$/,
  // Postal/ZIP code
  postalCode: /^[a-zA-Z0-9\s\-]+$/,
  // UUID
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/**
 * Rate limit check for form submissions
 * Returns true if submission should be allowed
 */
const formSubmissions = new Map<string, number[]>();

export function checkFormRateLimit(
  identifier: string,
  maxSubmissions: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const submissions = formSubmissions.get(identifier) || [];

  // Remove old submissions
  const recentSubmissions = submissions.filter((time) => now - time < windowMs);

  if (recentSubmissions.length >= maxSubmissions) {
    return false;
  }

  recentSubmissions.push(now);
  formSubmissions.set(identifier, recentSubmissions);

  // Cleanup old entries periodically
  if (formSubmissions.size > 1000) {
    Array.from(formSubmissions.entries()).forEach(([key, times]) => {
      if (times.every((time) => now - time > windowMs)) {
        formSubmissions.delete(key);
      }
    });
  }

  return true;
}
