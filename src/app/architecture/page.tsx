"use client";

import CasynusPage from "@/app/casynus/page";

export default function ArchitecturePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  return <CasynusPage searchParams={searchParams} />;
}
