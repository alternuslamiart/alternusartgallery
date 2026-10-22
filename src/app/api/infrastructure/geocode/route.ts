import { NextRequest, NextResponse } from "next/server";
import { normalizePlaces } from "@/lib/infrastructure/geography.mjs";
import { getClientIP, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 160) return NextResponse.json({ error: "Enter a place name between 2 and 160 characters." }, { status: 400 });
  const key = process.env.MAPTILER_API_KEY;
  if (!key) return NextResponse.json({ error: "Place search needs MAPTILER_API_KEY configured on the server. You can still select the globe or enter latitude, longitude." }, { status: 503 });
  if (!rateLimit(`infrastructure-geocode:${getClientIP(request)}`, { limit: 20, windowSeconds: 60 }).success) return NextResponse.json({ error: "Too many searches. Try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  const url = new URL(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`);
  url.searchParams.set("key", key); url.searchParams.set("limit", "5"); url.searchParams.set("autocomplete", "false");
  url.searchParams.set("types", "country,region,subregion,municipality,municipal_district,locality");
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "Search provider is busy. Try again shortly." : "Place search provider is unavailable. Check the server configuration." }, { status: response.status === 429 ? 429 : 502 });
    return NextResponse.json({ places: normalizePlaces(await response.json()) }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch { return NextResponse.json({ error: "Place search timed out or is unavailable. Try again." }, { status: 502 }); }
}
