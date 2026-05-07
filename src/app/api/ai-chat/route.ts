import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getAIResponse } from "@/lib/ai-assistant";

export const dynamic = "force-dynamic";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const MAX_HISTORY_MESSAGES = 16;
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are Cerevix AI Assistant. Answer clearly, directly, and helpfully. For coding, design, business, and product questions, give practical, structured answers. Do not claim to perform actions you cannot perform. If the user asks for implementation guidance, provide concrete steps. Keep replies concise and respond in the user's language when clear.`;

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

type AIProvider = "openai" | "gemini" | "local";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

function getPreferredProvider(): AIProvider {
  const configuredProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (configuredProvider === "openai" || configuredProvider === "gemini") {
    return configuredProvider;
  }

  if (getGeminiApiKey()) return "gemini";
  if (getOpenAIApiKey()) return "openai";
  return "local";
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

function getProviderError(error: unknown, provider: "openai" | "gemini") {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  const name = provider === "openai" ? "OpenAI" : "Gemini";

  if (lower.includes("quota") || lower.includes("rate") || lower.includes("429")) {
    return {
      status: 429,
      error: `${name} quota or rate limit reached. Please try again later.`,
      code: `${provider.toUpperCase()}_RATE_LIMIT`,
    };
  }

  if (lower.includes("api key") || lower.includes("permission") || lower.includes("unauthorized")) {
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
    throw new Error("Missing Gemini API key.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: getGeminiModel(),
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({
    history: toGeminiHistory(history),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const result = await chat.sendMessage(message);
  const answer = result.response.text()?.trim();

  if (!answer) {
    throw new Error("Invalid Gemini response.");
  }

  return answer;
}

async function askOpenAI(message: string, history: ChatMessage[]) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("Missing OpenAI API key.");
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      messages: toOpenAIMessages(history, message),
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed with ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("Invalid OpenAI response.");
  }

  return answer;
}

export async function GET() {
  const provider = getPreferredProvider();

  return NextResponse.json({
    ok: true,
    provider,
    model:
      provider === "openai"
        ? getOpenAIModel()
        : provider === "gemini"
          ? getGeminiModel()
          : "local-fallback",
    configured: Boolean(getGeminiApiKey() || getOpenAIApiKey()),
    providers: {
      gemini: Boolean(getGeminiApiKey()),
      openai: Boolean(getOpenAIApiKey()),
    },
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

    if (provider === "openai") {
      const answer = await askOpenAI(message, history);
      return NextResponse.json({ content: answer, answer, provider });
    }

    if (provider === "gemini") {
      const answer = await askGemini(message, history);
      return NextResponse.json({ content: answer, answer, provider });
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
    const remoteProvider = provider === "openai" ? "openai" : "gemini";
    const providerError = getProviderError(error, remoteProvider);
    console.error("AI chat error:", error);

    return NextResponse.json(
      { error: providerError.error, code: providerError.code, provider },
      { status: providerError.status },
    );
  }
}
