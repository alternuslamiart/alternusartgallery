import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  const apiKey = process.env.GEMINI_API_KEY;
  results.gemini_key_set = apiKey ? `Yes (${apiKey.slice(0, 8)}...)` : 'No';

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Say "ok"' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        results.gemini_test = `FAILED: ${response.status} - ${errorText.slice(0, 200)}`;
      } else {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        results.gemini_test = text ? 'WORKING' : 'No response';
      }
    } catch (e: unknown) {
      results.gemini_test = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return NextResponse.json(results);
}
