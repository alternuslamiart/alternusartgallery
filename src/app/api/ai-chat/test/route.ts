import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  // Check which keys are set
  results.groq_key_set = process.env.GROQ_API_KEY ? `Yes (${process.env.GROQ_API_KEY.slice(0, 8)}...)` : 'No';
  results.deepseek_key_set = process.env.DEEPSEEK_API_KEY ? `Yes (${process.env.DEEPSEEK_API_KEY.slice(0, 8)}...)` : 'No';
  results.anthropic_key_set = process.env.ANTHROPIC_API_KEY ? `Yes (${process.env.ANTHROPIC_API_KEY.slice(0, 8)}...)` : 'No';
  results.openai_key_set = process.env.OPENAI_API_KEY ? `Yes (${process.env.OPENAI_API_KEY.slice(0, 8)}...)` : 'No';

  // Test Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 5,
      });
      results.groq_test = completion.choices?.[0]?.message?.content ? 'WORKING' : 'No response';
    } catch (e: unknown) {
      results.groq_test = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // Test DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const ds = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      });
      const completion = await ds.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 5,
      });
      results.deepseek_test = completion.choices?.[0]?.message?.content ? 'WORKING' : 'No response';
    } catch (e: unknown) {
      results.deepseek_test = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(results);
}
