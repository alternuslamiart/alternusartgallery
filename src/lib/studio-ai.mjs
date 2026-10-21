export const STUDIO_AI_PROVIDERS = ["gemini", "groq", "you"];

export async function requestStudioAnswer({ provider, message, messages = [], signal, fetchImpl = fetch }) {
  if (!STUDIO_AI_PROVIDERS.includes(provider)) throw new Error("Choose a supported AI provider.");
  const response = await fetchImpl("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      provider,
      message,
      history: messages.filter(item => item.role === "user" || item.role === "assistant")
        .slice(-16).map(item => ({ role: item.role, content: item.text })),
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof result?.error === "string" ? result.error : result?.error?.message || "The AI request failed. Please try again.");
  }
  if (typeof result?.message !== "string" || !result.message.trim()) throw new Error("The AI provider returned an empty response.");
  return result;
}
