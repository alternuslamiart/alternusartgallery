export function decodeInspectableText(input: string, maxPasses?: number): string;

export function inspectTextThreat(rawText: string): {
  blocked: boolean;
  code: string | null;
  severity: string | null;
};

export function inspectRequestThreat(requestInfo: {
  pathname: string;
  search?: string;
  userAgent?: string;
  method?: string;
}): {
  blocked: boolean;
  status: number;
  code: string | null;
  severity: string | null;
  reason: string | null;
};

export function verifySameOriginMutation(req: {
  method: string;
  pathname: string;
  origin?: string | null;
  referer?: string | null;
  host?: string | null;
  secFetchSite?: string | null;
}): {
  allowed: boolean;
  reason: string | null;
};

export function sanitizeAndInspectPayload(
  payload: unknown,
  options?: { maxDepth?: number; maxKeys?: number; maxStringLength?: number }
): unknown;

export function escapeHtmlEntities(input: string): string;

export function verifyAdminSessionEdge(
  token: string | undefined | null,
  secret: string | undefined | null,
  options?: { now?: number; maxAgeMs?: number }
): Promise<boolean>;

export class CyberDefenseTracker {
  stats: {
    totalInspected: number;
    wafBlocked: number;
    csrfBlocked: number;
    rateLimited: number;
    reputationBlocked: number;
  };
  constructor(options?: {
    maxEntries?: number;
    strikeThreshold?: number;
    strikeBanMs?: number;
  });
  prune(now?: number): void;
  recordStrike(
    ip: string,
    reason: string,
    weight?: number,
    now?: number
  ): { banned: boolean; strikes: number; retryAfter: number };
  isIpBanned(
    ip: string,
    now?: number
  ): { banned: boolean; retryAfter: number; reason: string | null };
  recordAuthFailure(
    ip: string,
    now?: number
  ): { locked: boolean; retryAfter: number; failures: number };
  clearAuthFailures(ip: string): void;
  checkAuthLockout(
    ip: string,
    now?: number
  ): { blocked: boolean; retryAfter: number };
  consumeRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    now?: number
  ): { allowed: boolean; remaining: number; retryAfter: number };
  getSnapshot(): {
    totalInspected: number;
    wafBlocked: number;
    csrfBlocked: number;
    rateLimited: number;
    reputationBlocked: number;
    activeRateBuckets: number;
    trackedIps: number;
    lockedAuthIps: number;
  };
}

export const globalCyberDefense: CyberDefenseTracker;

export function getSecurityHeaders(): Record<string, string>;
