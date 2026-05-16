import { NextResponse } from 'next/server';
import {
  getGeminiApiKey,
  getGeminiModel,
  getOpenAIApiKey,
  getOpenAIModel,
  getSafeAIErrorMessage,
} from '@/lib/ai-provider-config';

export const dynamic = 'force-dynamic';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

async function testGemini() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getGeminiApiKey(),
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say "ok"' }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return `FAILED: ${response.status} - ${getSafeAIErrorMessage(errorText).slice(0, 200)}`;
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? 'WORKING' : 'No response';
}

async function testOpenAI() {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenAIApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      messages: [{ role: 'user', content: 'Say "ok"' }],
      max_completion_tokens: 16,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return `FAILED: ${response.status} - ${getSafeAIErrorMessage(errorText).slice(0, 200)}`;
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = data.choices?.[0]?.message?.content;
  return text ? 'WORKING' : 'No response';
}

export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.AI_DIAGNOSTICS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const results: Record<string, string> = {
    gemini_key_set: getGeminiApiKey() ? 'Yes' : 'No',
    gemini_model: getGeminiModel(),
    openai_key_set: getOpenAIApiKey() ? 'Yes' : 'No',
    openai_model: getOpenAIModel(),
  };

  if (getGeminiApiKey()) {
    try {
      results.gemini_test = await testGemini();
    } catch (e: unknown) {
      results.gemini_test = `FAILED: ${getSafeAIErrorMessage(e)}`;
    }
  }

  if (getOpenAIApiKey()) {
    try {
      results.openai_test = await testOpenAI();
    } catch (e: unknown) {
      results.openai_test = `FAILED: ${getSafeAIErrorMessage(e)}`;
    }
  }

  return NextResponse.json(results);
}
