import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGroqApiKey, getGroqBaseUrl } from "@/lib/ai-provider-config";
import { consumePersistentRateLimit, rateLimitResponse } from "@/lib/persistent-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return json({ error: "Browser speech recognition is unavailable. Sign in to use server audio transcription." }, 401);
  if (!getGroqApiKey()) return json({ error: "Browser speech recognition is unavailable and server transcription needs GROQ_API_KEY configured. You can still type your message." }, 503);
  return json({ available: true, provider: "groq", languages: ["sq", "en", "de"] });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return json({ error: "Sign in to use server audio transcription." }, 401);
    const key = getGroqApiKey();
    if (!key) return json({ error: "Server transcription requires GROQ_API_KEY. Browser dictation and typed input remain available." }, 503);
    const limit = await consumePersistentRateLimit(`studio-transcription:${session.user.id}`, { limit: 10, windowSeconds: 900 });
    if (!limit.success) return NextResponse.json({ error: "Too many recordings. Try again later." }, { ...rateLimitResponse(limit), headers: { ...rateLimitResponse(limit).headers, "Cache-Control": "no-store" } });
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("multipart/form-data;")) return json({ error: "Submit a supported audio recording." }, 400);
    if (Number(request.headers.get("content-length")) > 3_100_000) return json({ error: "Audio upload exceeds 3 MB." }, 413);
    // Bound the body even when Content-Length is absent or incorrect.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "No audio recording was supplied." }, 400);
    const chunks: Uint8Array[] = []; let bytes = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 3_100_000) { await reader.cancel(); return json({ error: "Audio upload exceeds 3 MB." }, 413); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    let data: FormData;
    try { data = await new Response(new Blob(chunks as BlobPart[]), { headers: { "Content-Type": contentType } }).formData(); }
    catch { return json({ error: "The audio upload was invalid. Record again." }, 400); }
    const file = data.get("file"), language = data.get("language");
    if (!(file instanceof File) || !file.size || file.size > 3_000_000 || !/^audio\/(webm|mp4|ogg|wav)(;|$)/.test(file.type)) return json({ error: "Use an audio WebM, MP4, Ogg, or WAV recording under 3 MB." }, 400);
    if (typeof language !== "string" || !["sq", "en", "de"].includes(language)) return json({ error: "Choose Albanian, English, or German transcription." }, 400);
    const upload = new FormData(); upload.set("file", file, `voice.${file.type.includes("mp4") ? "mp4" : file.type.includes("ogg") ? "ogg" : file.type.includes("wav") ? "wav" : "webm"}`);
    upload.set("model", "whisper-large-v3"); upload.set("language", language); upload.set("response_format", "json");
    const response = await fetch(`${getGroqBaseUrl()}/audio/transcriptions`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: upload, signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]), cache: "no-store" });
    if (!response.ok) return json({ error: response.status === 429 ? "The transcription provider is busy or out of quota. Try again later." : "The transcription service could not process this audio. Check the server provider configuration or record again." }, response.status === 429 ? 429 : 502);
    const result = await response.json();
    if (typeof result.text !== "string") return json({ error: "The transcription provider returned an invalid response." }, 502);
    if (!result.text.trim()) return json({ error: "No speech was detected. Check your input device and record again." }, 422);
    return json({ text: result.text.trim().slice(0, 12_000) });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.debug("Studio transcription failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return json({ error: "Audio transcription failed or timed out. Check your connection and retry; your typed message is preserved." }, 503);
  }
}
