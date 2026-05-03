const PLAN_LIMIT_STORAGE_KEY = "alternus_ai_plan_limit_state";
const FREE_PLAN_MONTHLY_LIMIT = 200;

interface PlanLimitState {
  period: string;
  used: number;
  reached: boolean;
}

function getCurrentPeriod() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function getDefaultState(): PlanLimitState {
  return {
    period: getCurrentPeriod(),
    used: 0,
    reached: false,
  };
}

function normalizeState(value: unknown): PlanLimitState {
  const fallback = getDefaultState();
  if (!value || typeof value !== "object") return fallback;

  const raw = value as Partial<PlanLimitState>;
  const state: PlanLimitState = {
    period: typeof raw.period === "string" ? raw.period : fallback.period,
    used: typeof raw.used === "number" && Number.isFinite(raw.used) ? raw.used : 0,
    reached: Boolean(raw.reached),
  };

  if (state.period !== getCurrentPeriod()) return fallback;
  if (state.used >= FREE_PLAN_MONTHLY_LIMIT) state.reached = true;

  return state;
}

export function getAIPlanLimitState(): PlanLimitState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const raw = window.localStorage.getItem(PLAN_LIMIT_STORAGE_KEY);
    const state = normalizeState(raw ? JSON.parse(raw) : null);
    window.localStorage.setItem(PLAN_LIMIT_STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch {
    return getDefaultState();
  }
}

export function isAIPlanLimitReached() {
  return getAIPlanLimitState().reached;
}

export function recordAIPlanUsage() {
  if (typeof window === "undefined") return getDefaultState();

  const current = getAIPlanLimitState();
  const next: PlanLimitState = {
    ...current,
    used: Math.min(current.used + 1, FREE_PLAN_MONTHLY_LIMIT),
    reached: current.used + 1 >= FREE_PLAN_MONTHLY_LIMIT,
  };

  try {
    window.localStorage.setItem(PLAN_LIMIT_STORAGE_KEY, JSON.stringify(next));
  } catch {}

  return next;
}

export function forceAIPlanLimitReached() {
  if (typeof window === "undefined") return getDefaultState();

  const current = getAIPlanLimitState();
  const next: PlanLimitState = {
    ...current,
    reached: true,
    used: Math.max(current.used, FREE_PLAN_MONTHLY_LIMIT),
  };

  try {
    window.localStorage.setItem(PLAN_LIMIT_STORAGE_KEY, JSON.stringify(next));
  } catch {}

  return next;
}
