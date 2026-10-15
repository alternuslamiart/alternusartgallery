import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAIChatUserId } from "@/lib/ai-chat-auth";
import { consumePersistentRateLimit } from "@/lib/persistent-rate-limit";
import { prisma } from "@/lib/prisma";
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
 conversationId?: unknown;
 requestId?: unknown;
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
 let conversationId: string | null = null;
 let requestId: string | null = null;
 let userId: string | null = null;
 let assistantMessageId: string | null = null;
 try {
 userId = await getAuthenticatedAIChatUserId();
 if (!userId) {
 return NextResponse.json({ error: "Sign in to use and save AI chat history.", code: "UNAUTHENTICATED" }, { status: 401 });
 }
 let rateLimit: Awaited<ReturnType<typeof consumePersistentRateLimit>>;
 try {
 rateLimit = await consumePersistentRateLimit(`ai-chat:${userId}`, { limit: 30, windowSeconds: 60 });
 } catch (error) {
 console.error("AI chat rate limit could not be checked:", error);
 return NextResponse.json({ error: "Chat is temporarily unavailable. Please try again shortly.", code: "RATE_LIMIT_UNAVAILABLE" }, { status: 503 });
 }
 if (!rateLimit.success) {
 return NextResponse.json({ error: "Too many chat requests. Please wait a moment and try again.", code: "RATE_LIMITED" }, { status: 429 });
 }

 let body: RequestBody;
 try {
 const contentLength = Number(request.headers.get("content-length") ?? "0");
 if (contentLength > 150_000) {
 return NextResponse.json({ error: "Chat request is too large.", code: "REQUEST_TOO_LARGE" }, { status: 413 });
 }
 const rawBody = await request.text();
 if (rawBody.length > 150_000) {
 return NextResponse.json({ error: "Chat request is too large.", code: "REQUEST_TOO_LARGE" }, { status: 413 });
 }
 body = JSON.parse(rawBody) as RequestBody;
 } catch {
 return NextResponse.json({ error: "Invalid JSON request.", code: "INVALID_JSON" }, { status: 400 });
 }
 const message = typeof body.message === "string" ? body.message.trim() : "";
 conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
 requestId = typeof body.requestId === "string" ? body.requestId : null;
 const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

 if (!message || message.length > 32_000) {
 return NextResponse.json(
 { error: message ? "Message exceeds the 32,000 character limit." : "Message is required.", code: "INVALID_MESSAGE" },
 { status: 400 },
 );
 }
 if (!conversationId || !uuidPattern.test(conversationId) || !requestId || !uuidPattern.test(requestId)) {
 return NextResponse.json({ error: "Valid conversation and request IDs are required.", code: "INVALID_CONVERSATION" }, { status: 400 });
 }

 const requestedProvider = getPreferredProvider(body.provider);
 const configuredModel = requestedProvider === "groq"
 ? getGroqModel()
 : requestedProvider === "gemini"
 ? getGeminiModel()
 : "local-fallback";

 const persisted = await prisma.$transaction(async (transaction) => {
 const messageCreatedAt = new Date();
 const conversation = await transaction.aIChatConversation.findFirst({
 where: { id: conversationId!, userId: userId! },
 select: { id: true, title: true },
 });
 if (!conversation) return { error: "Conversation not found.", status: 404 as const };

 const userMessage = await transaction.aIChatMessage.upsert({
 where: {
 conversationId_requestId_role: {
 conversationId: conversation.id,
 requestId: requestId!,
 role: "USER",
 },
 },
 create: {
 conversationId: conversation.id,
 userId: userId!,
 requestId: requestId!,
 role: "USER",
 content: message,
 status: "COMPLETED",
 createdAt: messageCreatedAt,
 },
 update: {},
 select: { id: true, content: true },
 });
 if (userMessage.content !== message) {
 return { error: "This request ID is already in use.", status: 409 as const };
 }

 const staleBefore = new Date(Date.now() - 2 * 60 * 1000);
 await transaction.aIChatMessage.updateMany({
 where: {
 conversationId: conversation.id,
 requestId: requestId!,
 role: "ASSISTANT",
 status: "GENERATING",
 updatedAt: { lt: staleBefore },
 },
 data: { status: "FAILED" },
 });

 const assistant = await transaction.aIChatMessage.findUnique({
 where: {
 conversationId_requestId_role: {
 conversationId: conversation.id,
 requestId: requestId!,
 role: "ASSISTANT",
 },
 },
 select: { id: true, status: true, content: true, model: true },
 });
 if (assistant?.status === "COMPLETED") {
 return { completed: assistant, conversation };
 }
 if (assistant?.status === "GENERATING") {
 return { error: "This message is already being answered.", status: 409 as const };
 }

 const newAssistant = assistant
 ? await transaction.aIChatMessage.update({
 where: { id: assistant.id, userId: userId! },
 data: { status: "GENERATING", content: "", model: configuredModel },
 select: { id: true },
 })
 : await transaction.aIChatMessage.create({
 data: {
 conversationId: conversation.id,
 userId: userId!,
 requestId: requestId!,
 role: "ASSISTANT",
 content: "",
 status: "GENERATING",
 model: configuredModel,
 createdAt: new Date(messageCreatedAt.getTime() + 1),
 },
 select: { id: true },
 });

 const history = await transaction.aIChatMessage.findMany({
 where: {
 conversationId: conversation.id,
 status: "COMPLETED",
 NOT: { id: userMessage.id },
 },
 orderBy: [{ createdAt: "desc" }, { id: "desc" }],
 take: MAX_HISTORY_MESSAGES,
 select: { role: true, content: true },
 });
 const updatedConversation = await transaction.aIChatConversation.update({
 where: { id: conversation.id, userId: userId! },
 data: {
 title: conversation.title === "New Chat"
 ? Array.from(message.replace(/\s+/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ")).slice(0, 80).join("").trim() || "New Chat"
 : undefined,
 lastMessageAt: new Date(),
 model: configuredModel,
 },
 select: { id: true, title: true },
 });
 return {
 assistantMessageId: newAssistant.id,
 conversation: updatedConversation,
 history: history.reverse().map((entry) => ({
 role: entry.role === "ASSISTANT" ? "assistant" as const : "user" as const,
 content: entry.content,
 })),
 };
 });

 if ("error" in persisted) {
 return NextResponse.json({ error: persisted.error, code: persisted.status === 404 ? "NOT_FOUND" : "REQUEST_CONFLICT" }, { status: persisted.status });
 }
 if ("completed" in persisted && persisted.completed) {
 return NextResponse.json({
 success: true,
 message: persisted.completed.content,
 model: persisted.completed.model,
 conversationId,
 saved: true,
 });
 }
 assistantMessageId = persisted.assistantMessageId;

 console.info("[ai-chat] request received", {
 conversationId,
 requestId,
 });
 console.info("[ai-chat] selected provider", { provider: requestedProvider, model: configuredModel });

 if (requestedProvider !== "local") {
 const providerAttempts = getProviderAttempts(requestedProvider);
 const providerErrors: Array<{ provider: RemoteAIProvider; message: string }> = [];

 for (const providerAttempt of providerAttempts) {
 try {
 const answer = await askProvider(providerAttempt, message, persisted.history);
 const actualModel = providerAttempt === "groq" ? getGroqModel() : getGeminiModel();
 await prisma.$transaction([
 prisma.aIChatMessage.update({
 where: { id: assistantMessageId!, userId: userId! },
 data: { content: answer, status: "COMPLETED", model: actualModel },
 }),
 prisma.aIChatConversation.update({
 where: { id: conversationId!, userId: userId! },
 data: { lastMessageAt: new Date(), model: actualModel },
 }),
 ]);
 return NextResponse.json({
 success: true,
 message: answer,
 model: actualModel,
 provider: providerAttempt,
 conversationId,
 saved: true,
 });
 } catch (providerError) {
 const errorMessage = getSafeAIErrorMessage(providerError);
 providerErrors.push({ provider: providerAttempt, message: errorMessage });
 console.warn(`AI provider ${providerAttempt} failed.`, errorMessage);
 }
 }

 const primaryError = providerErrors.find((entry) => entry.provider === requestedProvider);
 const surfacedError = primaryError ?? providerErrors[providerErrors.length - 1];
 const providerError = getProviderError(surfacedError?.message || `${requestedProvider} request failed.`, requestedProvider);
 await prisma.aIChatMessage.update({
 where: { id: assistantMessageId!, userId: userId! },
 data: { status: "FAILED" },
 });
 return NextResponse.json(
 {
 error: providerError.error,
 code: providerError.code,
 provider: requestedProvider,
 conversationId,
 saved: true,
 },
 { status: providerError.status },
 );
 }

 await prisma.aIChatMessage.update({
 where: { id: assistantMessageId!, userId: userId! },
 data: { status: "FAILED" },
 });
 return NextResponse.json({
 error: "No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY on the server.",
 code: "AI_PROVIDER_NOT_CONFIGURED",
 provider: requestedProvider,
 conversationId,
 saved: true,
 }, { status: 503 });
 } catch (error) {
 console.error("AI chat error:", error);

 if (userId && !assistantMessageId) {
 return NextResponse.json({
 error: "Your message could not be saved. Please retry.",
 code: "CHAT_PERSISTENCE_FAILED",
 saved: false,
 }, { status: 500 });
 }

 if (assistantMessageId && userId) {
 try {
 await prisma.aIChatMessage.updateMany({
 where: { id: assistantMessageId, userId, status: "GENERATING" },
 data: { status: "FAILED" },
 });
 } catch (saveError) {
 console.error("Could not mark failed AI chat response:", saveError);
 }
 }
 const provider = getPreferredProvider();
 const remoteProvider: RemoteAIProvider = provider === "groq" ? provider : "gemini";
 const providerError = getProviderError(error, remoteProvider);
 return NextResponse.json(
 {
 error: providerError.error,
 code: providerError.code,
 provider,
 ...(conversationId ? { conversationId, saved: Boolean(userId) } : {}),
 },
 { status: providerError.status },
 );
 }
}
