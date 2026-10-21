import { NextResponse } from 'next/server';
import { askYou } from '@/lib/you-answer.mjs';
import {
 getGeminiApiKey,
 getGeminiModel,
 getGroqBaseUrl,
 getGroqApiKey,
 getGroqModel,
 getOpenAIApiKey,
 getOpenAIModel,
 getSafeAIErrorMessage,
} from '@/lib/ai-provider-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
 `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getGeminiModel())}:generateContent`,
 {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'x-goog-api-key': getGeminiApiKey(),
 },
 body: JSON.stringify({
 contents: [{ role: 'user', parts: [{ text: 'Say "ok"' }] }],
 generationConfig: { maxOutputTokens: 512 },
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

async function testGroq() {
 const response = await fetch(`${getGroqBaseUrl()}/chat/completions`, {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${getGroqApiKey()}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 model: getGroqModel(),
 messages: [{ role: 'user', content: 'Say "ok"' }],
 max_tokens: 16,
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
 you_key_set: process.env.YOU_API_KEY?.trim() || process.env.YDC_API_KEY?.trim() ? 'Yes' : 'No',
 gemini_key_set: getGeminiApiKey() ? 'Yes' : 'No',
 gemini_model: getGeminiModel(),
 groq_key_set: getGroqApiKey() ? 'Yes' : 'No',
 groq_model: getGroqModel(),
 groq_base_url: getGroqBaseUrl(),
 openai_key_set: getOpenAIApiKey() ? 'Yes' : 'No',
 openai_model: getOpenAIModel(),
 };

 if (process.env.YOU_API_KEY?.trim() || process.env.YDC_API_KEY?.trim()) {
 try {
 const answer = await askYou('What is 2 plus 2?');
 results.you_test = answer.message ? 'WORKING' : 'No response';
 } catch (error) { results.you_test = `FAILED: ${getSafeAIErrorMessage(error)}`; }
 }

 if (getGeminiApiKey()) {
 try {
 results.gemini_test = await testGemini();
 } catch (e: unknown) {
 results.gemini_test = `FAILED: ${getSafeAIErrorMessage(e)}`;
 }
 }

 if (getGroqApiKey()) {
 try {
 results.groq_test = await testGroq();
 } catch (e: unknown) {
 results.groq_test = `FAILED: ${getSafeAIErrorMessage(e)}`;
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
