"use client";

import InteriorStudioPage from "@/app/interior/page";

export default function SketchPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  return <InteriorStudioPage searchParams={searchParams} />;
}
