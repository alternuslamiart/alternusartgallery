export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_*.-]+/g,
  /AIza[0-9A-Za-z_-]+/g,
];

export type AIProvider = "gemini" | "openai";

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export function getPreferredAIProvider(): AIProvider | null {
  const provider = process.env.AI_CHAT_PROVIDER?.trim().toLowerCase();
  if (provider === "openai" || provider === "gemini") return provider;
  return null;
}

export function getSafeAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return SECRET_PATTERNS.reduce(
    (safeMessage, pattern) => safeMessage.replace(pattern, "[redacted-api-key]"),
    message,
  );
}
