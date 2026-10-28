"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface StudioGenerationLoaderProps {
  open: boolean;
  prompt?: string;
  durationSeconds?: number;
  onComplete?: () => void;
  onClose?: () => void;
}

export function StudioGenerationLoader({
  open,
  prompt,
  durationSeconds = 12,
  onComplete,
  onClose,
}: StudioGenerationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setSecondsLeft(durationSeconds);
      return;
    }

    const totalMs = durationSeconds * 1000;
    const intervalMs = 50;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / totalMs) * 100);
      const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));

      setProgress(currentProgress);
      setSecondsLeft(remaining);

      if (elapsed >= totalMs) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
          onClose?.();
        }, 400);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [open, durationSeconds, onComplete, onClose]);

  if (!open) return null;

  // Format headline: e.g. "Generate house modeling 3D..."
  const trimmed = prompt?.trim();
  const headline = trimmed
    ? trimmed.toLowerCase().startsWith("generate")
      ? trimmed.length > 40
        ? trimmed.slice(0, 40) + "..."
        : trimmed
      : `Generate ${trimmed.length > 32 ? trimmed.slice(0, 32) + "..." : trimmed}...`
    : "Generate house modeling 3D...";

  const formattedTimer = `End: 00 min ${String(secondsLeft).padStart(2, "0")}sec`;

  return (
    /* Strictly Desktop only: hidden on screens <= 700px (max-width: 700px / mobile) */
    <div
      className="studio-generation-loader-overlay hidden md:flex fixed inset-0 z-[99999] items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
      onClick={onClose}
    >
      {/* 712x140px Exact Frame */}
      <div
        className="relative w-[712px] h-[140px] rounded-[24px] px-[27.5px] py-6 flex flex-col justify-between shadow-2xl transition-all select-none"
        style={{
          backgroundColor: "#222222",
          fontFamily: "Roboto, var(--font-roboto-flex), sans-serif",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top: Headline 1 (24px semibold) */}
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-semibold tracking-[-0.01em] text-white truncate max-w-[620px] leading-none">
            {headline}
          </h2>
        </div>

        {/* Subtitle & Timer row */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] font-medium text-[#A0A0A0] leading-snug line-clamp-1 max-w-[480px]">
            Lorem ipsum dolor sit amet consectetur. Feugiat posuere eleifend mi felis ut risus nibh habitant. Quisque adipiscing sodales felis sed enim.
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#A0A0A0] shrink-0">
            <Clock size={13} className="opacity-80" />
            <span>{formattedTimer}</span>
          </div>
        </div>

        {/* Loading frame: 657x12px with track #4C4C4C and gradient #0C8CE9, #074F83 */}
        <div
          className="w-[657px] h-[12px] rounded-full overflow-hidden"
          style={{ backgroundColor: "#4C4C4C" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #0C8CE9 0%, #074F83 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
