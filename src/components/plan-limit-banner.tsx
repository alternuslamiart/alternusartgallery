"use client";

import Link from "next/link";

interface PlanLimitBannerProps {
  dark?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function PlanLimitBanner({
  dark = false,
  title = "You have used 100% of your free credits.",
  description = "Your free plan limit has been reached. Upgrade now to continue chatting with Cerevix AI.",
  ctaLabel = "Upgrade Now",
  ctaHref = "/pricing",
}: PlanLimitBannerProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${
        dark
          ? "border-[rgba(255,255,255,0.08)] bg-[#2F2F2F] text-white"
          : "border-[#E5E7EB] bg-[#F3F5F8] text-[#171717]"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-[15px] font-semibold leading-5 ${dark ? "text-white" : "text-[#171717]"}`}>{title}</p>
        <p className={`mt-1 text-[12px] leading-5 ${dark ? "text-white/72" : "text-[#4B5563]"}`}>{description}</p>
      </div>
      <Link
        href={ctaHref}
        className={`inline-flex h-11 flex-shrink-0 items-center rounded-2xl px-5 text-[14px] font-semibold transition-colors ${
          dark
            ? "bg-[#5A5A5A] text-white hover:bg-[#6A6A6A]"
            : "bg-white text-[#171717] hover:bg-[#F8FAFC]"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
