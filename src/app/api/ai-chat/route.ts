import { NextRequest, NextResponse } from "next/server";
import {
 getConfiguredAIProvider,
 getGeminiApiKey,
 getGeminiModel,
 getGroqApiKey as getConfiguredGroqApiKey,
 getGroqModel as getConfiguredGroqModel,
 getGroqBaseUrl,
 getSafeAIErrorMessage,
} from "@/lib/ai-provider-config";

export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 16;
const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `You are the Crystal Studio AI Assistant. Answer clearly, thoroughly, and helpfully. For coding, design, business, product, CAD, and engineering questions, give complete, practical, well-structured answers with examples and steps where useful. Make clear that AI-generated engineering output requires independent verification and licensed-engineer approval when used professionally. Respond in the user's language when clear.`;

type ChatRole = "user" | "assistant";
type ChatMessage = {
 role: ChatRole;
 content: string;
};

type RequestBody = {
 messages?: unknown;
 message?: unknown;
 history?: unknown;
 conversationHistory?: unknown;
 provider?: unknown;
};

type AIProvider = "gemini" | "groq" | "local";
type RemoteAIProvider = Exclude<AIProvider, "local">;
const PROVIDER_PRIORITY: RemoteAIProvider[] = ["gemini", "groq"];

function getGroqApiKey() {
 return getConfiguredGroqApiKey();
}

function getGroqModel() {
 return getConfiguredGroqModel();
}

function getGroqChatCompletionsUrl() {
 const baseUrl = getGroqBaseUrl();
 return `${baseUrl}/chat/completions`;
}

function hasProviderKey(provider: RemoteAIProvider) {
 if (provider === "gemini") return Boolean(getGeminiApiKey());
 return Boolean(getGroqApiKey());
}

function getPreferredProvider(requestedProvider?: unknown): AIProvider {
 if (
  (requestedProvider === "gemini" || requestedProvider === "groq") &&
  hasProviderKey(requestedProvider)
 ) {
  return requestedProvider;
 }

 const configuredProvider = getConfiguredAIProvider();

 if (configuredProvider === "gemini" && getGeminiApiKey()) {
 return "gemini";
 }

 if (configuredProvider === "groq" && getGroqApiKey()) {
 return "groq";
 }

 return PROVIDER_PRIORITY.find(hasProviderKey) ?? "local";
}

function getProviderAttempts(provider: AIProvider): RemoteAIProvider[] {
 if (provider === "local") return [];

 const attempts: RemoteAIProvider[] = [provider];
 for (const fallbackProvider of PROVIDER_PRIORITY) {
 if (fallbackProvider !== provider && hasProviderKey(fallbackProvider)) {
 attempts.push(fallbackProvider);
 }
 }

 return attempts;
}

function normalizeHistory(value: unknown): ChatMessage[] {
 if (!Array.isArray(value)) return [];

 const messages = value
 .map((item): ChatMessage | null => {
 if (!item || typeof item !== "object") return null;

 const record = item as Record<string, unknown>;
 const content = typeof record.content === "string" ? record.content.trim() : "";
 if (!content) return null;

 return {
 role: record.role === "assistant" ? "assistant" : "user",
 content,
 };
 })
 .filter((item): item is ChatMessage => Boolean(item))
 .slice(-MAX_HISTORY_MESSAGES);

 const normalized: ChatMessage[] = [];
 for (const message of messages) {
 if (normalized.length === 0 && message.role === "assistant") continue;

 const previous = normalized[normalized.length - 1];
 if (previous?.role === message.role) {
 previous.content = `${previous.content}\n\n${message.content}`;
 } else {
 normalized.push({ ...message });
 }
 }

 return normalized;
}

function toGeminiHistory(messages: ChatMessage[]) {
 return messages.map((message) => ({
 role: message.role === "assistant" ? "model" : "user",
 parts: [{ text: message.content }],
 }));
}

function toGeminiContents(history: ChatMessage[], message: string) {
 return [
 ...toGeminiHistory(history),
 { role: "user", parts: [{ text: message }] },
 ];
}

function toOpenAIMessages(history: ChatMessage[], message: string) {
 return [
 { role: "system", content: SYSTEM_PROMPT },
 ...history.map((item) => ({
 role: item.role,
 content: item.content,
 })),
 { role: "user", content: message },
 ];
}

function getProviderError(error: unknown, provider: RemoteAIProvider) {
 const message = getSafeAIErrorMessage(error);
 const lower = message.toLowerCase();
 const name = provider === "groq" ? "Groq" : "Gemini";

 if (lower.includes("quota") || lower.includes("rate") || lower.includes("429")) {
 return {
 status: 429,
 error: `${name} quota or rate limit reached. Please try again later.`,
 code: `${provider.toUpperCase()}_RATE_LIMIT`,
 };
 }

 if (
 lower.includes("api key") ||
 lower.includes("invalid_api_key") ||
 lower.includes("permission") ||
 lower.includes("unauthorized") ||
 lower.includes("401") ||
 lower.includes("403")
 ) {
 return {
 status: 500,
 error: `${name} API request failed. Check the server AI configuration.`,
 code: `${provider.toUpperCase()}_CONFIGURATION_ERROR`,
 };
 }

 return {
 status: 502,
 error: `${name} API request failed. Please try again.`,
 code: `${provider.toUpperCase()}_REQUEST_FAILED`,
 };
}

async function askGemini(message: string, history: ChatMessage[]) {
 const apiKey = getGeminiApiKey();
 if (!apiKey) {
 throw new Error("Missing Gemini API key. Set GEMINI_API_KEY in the environment.");
 }

 const modelName = getGeminiModel();
 let response: Response;
 try {
 response = await fetch(`${GEMINI_GENERATE_CONTENT_URL}/${encodeURIComponent(modelName)}:generateContent`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "x-goog-api-key": apiKey,
 },
 body: JSON.stringify({
 system_instruction: {
 parts: [{ text: SYSTEM_PROMPT }],
 },
 contents: toGeminiContents(history, message),
 generationConfig: {
 temperature: 1,
 maxOutputTokens: 4096,
 },
 }),
 });
 } catch (sendError) {
 const reason = sendError instanceof Error ? sendError.message : String(sendError);
 throw new Error(`Gemini API request failed (model ${modelName}): ${reason}`);
 }

 if (!response.ok) {
 const errorText = await response.text();
 throw new Error(`Gemini ${response.status} (model ${modelName}): ${errorText.slice(0, 500)}`);
 }

 const data = (await response.json()) as {
 candidates?: Array<{
 content?: {
 parts?: Array<{ text?: string }>;
 };
 finishReason?: string;
 }>;
 promptFeedback?: {
 blockReason?: string;
 };
 };

 const blockReason = data.promptFeedback?.blockReason;
 if (blockReason) {
 throw new Error(`Gemini blocked the prompt (${blockReason}).`);
 }

 const finishReason = data.candidates?.[0]?.finishReason;
 if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
 throw new Error(`Gemini stopped early (${finishReason}).`);
 }

 const answer = data.candidates?.[0]?.content?.parts
 ?.map((part) => part.text)
 .filter((part): part is string => Boolean(part))
 .join("")
 .trim();

 if (!answer) {
 throw new Error(`Gemini returned an empty response (model ${modelName}).`);
 }

 return answer;
}

async function askOpenAICompatible({
 apiKey,
 endpoint,
 history,
 message,
 modelName,
 providerName,
}: {
 apiKey: string | undefined;
 endpoint: string;
 history: ChatMessage[];
 message: string;
 modelName: string;
 providerName: "Groq";
}) {
 if (!apiKey) {
 throw new Error(`Missing ${providerName} API key.`);
 }

 console.info("[ai-chat] executing provider request", {
 provider: providerName,
 model: modelName,
 messageCount: history.length + 1,
 });

 const response = await fetch(endpoint, {
 method: "POST",
 headers: {
 Authorization: `Bearer ${apiKey}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 model: modelName,
 messages: toOpenAIMessages(history, message),
 temperature: 0.7,
 max_tokens: 4096,
 }),
 });

 console.info("[ai-chat] provider response received", {
 provider: providerName,
 model: modelName,
 status: response.status,
 });

 if (!response.ok) {
 const errorText = await response.text();
 let parsedMessage: string | undefined;
 try {
 const parsed = JSON.parse(errorText) as { error?: { message?: string; code?: string } };
 parsedMessage = parsed?.error?.message;
 } catch {}
 const reason = parsedMessage || errorText.slice(0, 200);
 throw new Error(`${providerName} ${response.status}: ${reason}`);
 }

 const data = (await response.json()) as {
 choices?: Array<{ message?: { content?: string } }>;
 };
 const answer = data.choices?.[0]?.message?.content?.trim();

 if (!answer) {
 throw new Error(`Invalid ${providerName} response.`);
 }

 console.info("[ai-chat] assistant text extracted", {
 provider: providerName,
 model: modelName,
 characterCount: answer.length,
 textPreview: answer.slice(0, 120),
 });

 return answer;
}

async function askGroq(message: string, history: ChatMessage[]) {
 return askOpenAICompatible({
 apiKey: getGroqApiKey(),
 endpoint: getGroqChatCompletionsUrl(),
 history,
 message,
 modelName: getGroqModel(),
 providerName: "Groq",
 });
}

async function askProvider(provider: RemoteAIProvider, message: string, history: ChatMessage[]) {
 if (provider === "groq") return askGroq(message, history);
 return askGemini(message, history);
}

export async function GET() {
 const provider = getPreferredProvider();
 const configuredProvider = getConfiguredAIProvider();
 const configuredProviderReady =
 configuredProvider === "gemini" || configuredProvider === "groq"
 ? hasProviderKey(configuredProvider)
 : undefined;

 return NextResponse.json({
 ok: true,
 provider,
 configuredProvider,
 configuredProviderReady,
 model:
 provider === "groq"
 ? getGroqModel()
 : provider === "gemini"
 ? getGeminiModel()
 : null,
 configured: Boolean(getGeminiApiKey() || getGroqApiKey()),
 providers: {
 gemini: Boolean(getGeminiApiKey()),
 groq: Boolean(getGroqApiKey()),
 },
 groqBaseUrl: getGroqBaseUrl(),
 });
}

export async function POST(request: NextRequest) {
 try {
 const body = (await request.json()) as RequestBody;
 const requestMessages = normalizeHistory(body.messages);
 const legacyMessage = typeof body.message === "string" ? body.message.trim() : "";
 const lastRequestMessage = requestMessages[requestMessages.length - 1];
 const message = legacyMessage || (lastRequestMessage?.role === "user" ? lastRequestMessage.content : "");

 if (!message) {
 return NextResponse.json(
 { error: "Message is required.", code: "EMPTY_MESSAGE" },
 { status: 400 },
 );
 }

 const history = requestMessages.length > 0
 ? requestMessages.slice(0, lastRequestMessage?.role === "user" ? -1 : undefined)
 : normalizeHistory(body.history ?? body.conversationHistory);
 const provider = getPreferredProvider(body.provider);
 const model = provider === "groq"
 ? getGroqModel()
 : provider === "gemini"
 ? getGeminiModel()
 : "local-fallback";

 console.info("[ai-chat] request received", {
 messageCount: requestMessages.length || 1,
 message,
 });
 console.info("[ai-chat] selected provider", { provider, model });

 if (provider !== "local") {
 const providerAttempts = getProviderAttempts(provider);
 const providerErrors: Array<{ provider: RemoteAIProvider; message: string }> = [];

 for (const providerAttempt of providerAttempts) {
 try {
 const answer = await askProvider(providerAttempt, message, history);
 return NextResponse.json({
 success: true,
 message: answer,
 model: providerAttempt === "groq"
 ? getGroqModel()
 : getGeminiModel(),
 provider: providerAttempt,
 });
 } catch (providerError) {
 const errorMessage = getSafeAIErrorMessage(providerError);
 providerErrors.push({ provider: providerAttempt, message: errorMessage });
 console.warn(`AI provider ${providerAttempt} failed.`, errorMessage);
 }
 }

 const primaryError = providerErrors.find((entry) => entry.provider === provider);
 const surfacedError = primaryError ?? providerErrors[providerErrors.length - 1];
 const providerError = getProviderError(
 surfacedError?.message || `${provider} request failed.`,
 provider,
 );
 return NextResponse.json(
 {
 error: providerError.error,
 code: providerError.code,
 provider,
 },
 { status: providerError.status },
 );
 }

 return NextResponse.json({
 error: "No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY on the server.",
 code: "AI_PROVIDER_NOT_CONFIGURED",
 provider,
 }, { status: 503 });
 } catch (error) {
 const provider = getPreferredProvider();
 const remoteProvider: RemoteAIProvider = provider === "groq" ? provider : "gemini";
 const providerError = getProviderError(error, remoteProvider);
 console.error("AI chat error:", error);

 return NextResponse.json(
 { error: providerError.error, code: providerError.code, provider },
 { status: providerError.status },
 );
 }
}
