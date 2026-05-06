import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const MAX_HISTORY_MESSAGES = 16;

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

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
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

function getGeminiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("quota") || lower.includes("rate") || lower.includes("429")) {
    return {
      status: 429,
      error: "Gemini quota or rate limit reached. Please try again later.",
      code: "GEMINI_RATE_LIMIT",
    };
  }

  if (lower.includes("api key") || lower.includes("permission") || lower.includes("unauthorized")) {
    return {
      status: 500,
      error: "Gemini API request failed. Check the server AI configuration.",
      code: "GEMINI_CONFIGURATION_ERROR",
    };
  }

  return {
    status: 502,
    error: "Gemini API request failed. Please try again.",
    code: "GEMINI_REQUEST_FAILED",
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "gemini",
    model: getGeminiModel(),
    configured: Boolean(getGeminiApiKey()),
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

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing Gemini API key. Set GEMINI_API_KEY on the server.",
          code: "MISSING_GEMINI_API_KEY",
        },
        { status: 500 },
      );
    }

    const history = normalizeHistory(body.history ?? body.conversationHistory);
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
      return NextResponse.json(
        { error: "Invalid Gemini response.", code: "INVALID_GEMINI_RESPONSE" },
        { status: 502 },
      );
    }

    return NextResponse.json({ content: answer, answer, provider: "gemini" });
  } catch (error) {
    const geminiError = getGeminiError(error);
    console.error("Gemini AI chat error:", error);

    return NextResponse.json(
      { error: geminiError.error, code: geminiError.code },
      { status: geminiError.status },
    );
  }
}
