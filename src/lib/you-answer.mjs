const ENDPOINT = "https://api.you.com/v1/answer";
const TIMEOUT_MS = 15_000;

export class YouAnswerError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function buildYouQuery(message, history = []) {
  const question = message.trim();
  if (!question || question.length > 400) {
    throw new YouAnswerError("You questions must be between 1 and 400 characters.", 400, "YOU_QUERY_LENGTH");
  }
  if (!history.length) return question;
  const prior = history.slice(-4).map((item) => `${item.role === "assistant" ? "Answer" : "Question"}: ${item.content.replace(/\s+/g, " ")}`).join("; ");
  const suffix = `\nCurrent question: ${question}`;
  const budget = 400 - suffix.length - "Previous conversation: ".length;
  if (budget < 40) return question;
  return `Previous conversation: ${prior.slice(-budget)}${suffix}`;
}

export async function askYou(message, history = [], { apiKey = process.env.YOU_API_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey?.trim()) {
    throw new YouAnswerError("You is not configured on the server.", 503, "YOU_NOT_CONFIGURED");
  }
  const query = buildYouQuery(message, history);
  let response;
  try {
    response = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey.trim() },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new YouAnswerError("You did not respond in time. Please try again.", 504, "YOU_TIMEOUT");
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new YouAnswerError("You authentication failed. Check the server API key.", 502, "YOU_AUTH_ERROR");
    if (response.status === 402) throw new YouAnswerError("You account billing is required.", 503, "YOU_BILLING_REQUIRED");
    if (response.status === 429) throw new YouAnswerError("You rate limit reached. Please try again later.", 429, "YOU_RATE_LIMIT");
    throw new YouAnswerError("You could not answer this question. Please try again.", 502, "YOU_API_ERROR");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new YouAnswerError("You returned an invalid response.", 502, "YOU_INVALID_RESPONSE");
  }
  if (typeof data?.answer !== "string" || !data.answer.trim()) {
    throw new YouAnswerError("You returned an empty answer.", 502, "YOU_EMPTY_ANSWER");
  }
  const citations = Array.isArray(data.citations)
    ? data.citations.flatMap((item) => {
      if (typeof item?.source !== "string") return [];
      try {
        const url = new URL(item.source);
        return url.protocol === "https:" || url.protocol === "http:" ? [{ source: url.href }] : [];
      } catch { return []; }
    })
    : [];
  return { message: data.answer.trim(), citations };
}
