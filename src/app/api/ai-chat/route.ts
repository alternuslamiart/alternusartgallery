import { NextRequest, NextResponse } from "next/server";
import { getAIResponse } from "@/lib/ai-assistant";
import {
 DEFAULT_GROQ_MODEL,
 DEFAULT_OPENAI_MODEL,
 getConfiguredAIProvider,
 getGeminiApiKey,
 getGeminiModel,
 getSafeAIErrorMessage,
} from "@/lib/ai-provider-config";

export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 16;
const GEMINI_GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are the Crystal Studio AI Assistant. Answer clearly, thoroughly, and helpfully. For coding, design, business, product, CAD, and engineering questions, give complete, practical, well-structured answers with examples and steps where useful. Make clear that AI-generated engineering output requires independent verification and licensed-engineer approval when used professionally. Respond in the user's language when clear.`;

type ChatRole = "user" | "assistant";
type ChatMessage = {
 role: ChatRole;
 content: string;
};

type RequestBody = {
 message?: unknown;
 history?: unknown;
 conversationHistory?: unknown;
};

type AIProvider = "openai" | "gemini" | "groq" | "local";
type RemoteAIProvider = Exclude<AIProvider, "local">;
const PROVIDER_PRIORITY: RemoteAIProvider[] = ["gemini", "groq", "openai"];

function getOpenAIApiKey() {
 return process.env.OPENAI_API_KEY?.trim();
}

function getOpenAIModel() {
 return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

function getGroqApiKey() {
 return process.env.GROQ_API_KEY?.trim();
}

function getGroqModel() {
 return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

function getGroqChatCompletionsUrl() {
 const baseUrl = (process.env.GROQ_BASE_URL?.trim() || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
 return `${baseUrl}/chat/completions`;
}

function hasProviderKey(provider: RemoteAIProvider) {
 if (provider === "gemini") return Boolean(getGeminiApiKey());
 if (provider === "groq") return Boolean(getGroqApiKey());
 return Boolean(getOpenAIApiKey());
}

function getPreferredProvider(): AIProvider {
 const configuredProvider = getConfiguredAIProvider();

 if (configuredProvider === "openai" && getOpenAIApiKey()) {
 return "openai";
 }

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
 const name = provider === "openai" ? "OpenAI" : provider === "groq" ? "Groq" : "Gemini";

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
 providerName: "OpenAI" | "Groq";
}) {
 if (!apiKey) {
 throw new Error(`Missing ${providerName} API key.`);
 }

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

 return answer;
}

async function askOpenAI(message: string, history: ChatMessage[]) {
 return askOpenAICompatible({
 apiKey: getOpenAIApiKey(),
 endpoint: OPENAI_CHAT_COMPLETIONS_URL,
 history,
 message,
 modelName: getOpenAIModel(),
 providerName: "OpenAI",
 });
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
 if (provider === "openai") return askOpenAI(message, history);
 if (provider === "groq") return askGroq(message, history);
 return askGemini(message, history);
}

export async function GET() {
 const provider = getPreferredProvider();
 const configuredProvider = getConfiguredAIProvider();
 const configuredProviderReady = configuredProvider ? hasProviderKey(configuredProvider) : undefined;

 return NextResponse.json({
 ok: true,
 provider,
 configuredProvider,
 configuredProviderReady,
 model:
 provider === "openai"
 ? getOpenAIModel()
 : provider === "groq"
 ? getGroqModel()
 : provider === "gemini"
 ? getGeminiModel()
 : "local-fallback",
 configured: Boolean(getGeminiApiKey() || getGroqApiKey() || getOpenAIApiKey()),
 providers: {
 gemini: Boolean(getGeminiApiKey()),
 groq: Boolean(getGroqApiKey()),
 openai: Boolean(getOpenAIApiKey()),
 },
 groqBaseUrl: process.env.GROQ_BASE_URL?.trim() || "https://api.groq.com/openai/v1",
 });
}

export async function POST(request: NextRequest) {
 try {
 const body = (await request.json()) as RequestBody;
 const message = typeof body.message === "string" ? body.message.trim() : "";

 if (!message) {
 return NextResponse.json(
 { error: "Message is required.", code: "EMPTY_MESSAGE" },
 { status: 400 },
 );
 }

 const history = normalizeHistory(body.history ?? body.conversationHistory);
 const provider = getPreferredProvider();

 if (provider === "openai" || provider === "gemini" || provider === "groq") {
 const providerAttempts = getProviderAttempts(provider);
 const providerErrors: Array<{ provider: RemoteAIProvider; message: string }> = [];

 for (const providerAttempt of providerAttempts) {
 try {
 const answer = await askProvider(providerAttempt, message, history);
 return NextResponse.json({
 content: answer,
 answer,
 provider: providerAttempt,
 fallbackFrom: providerAttempt === provider ? undefined : provider,
 });
 } catch (providerError) {
 const errorMessage = getSafeAIErrorMessage(providerError);
 providerErrors.push({ provider: providerAttempt, message: errorMessage });
 console.warn(`AI provider ${providerAttempt} failed.`, providerError);
 }
 }

 const primaryError = providerErrors.find((entry) => entry.provider === provider);
 const surfacedError = primaryError ?? providerErrors[providerErrors.length - 1];
 const fallback = getAIResponse(message);
 return NextResponse.json({
 content: fallback.content,
 answer: fallback.content,
 suggestedQuestions: fallback.suggestedQuestions,
 provider: "local",
 fallbackFrom: surfacedError?.provider ?? provider,
 providerError: surfacedError?.message,
 providerErrors: providerErrors.map((entry) => ({ provider: entry.provider, message: entry.message })),
 });
 }

 const fallback = getAIResponse(message);
 return NextResponse.json({
 content: fallback.content,
 answer: fallback.content,
 suggestedQuestions: fallback.suggestedQuestions,
 provider,
 });
 } catch (error) {
 const provider = getPreferredProvider();
 const remoteProvider: RemoteAIProvider = provider === "openai" || provider === "groq" ? provider : "gemini";
 const providerError = getProviderError(error, remoteProvider);
 console.error("AI chat error:", error);

 return NextResponse.json(
 { error: providerError.error, code: providerError.code, provider },
 { status: providerError.status },
 );
 }
}
