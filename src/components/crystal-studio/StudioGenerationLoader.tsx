"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";

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
  durationSeconds = 20,
  onComplete,
  onClose,
}: StudioGenerationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [mounted, setMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setSecondsLeft(durationSeconds);
      setIsFadingOut(false);
      return;
    }

    setIsFadingOut(false);
    const totalMs = durationSeconds * 1000;
    const intervalMs = 50;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / totalMs) * 100);
      const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));

      setProgress(currentProgress);
      setSecondsLeft(remaining);

      // Once filled after 20 seconds, fade out smoothly and close
      if (elapsed >= totalMs) {
        clearInterval(interval);
        setProgress(100);
        setSecondsLeft(0);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete?.();
          onClose?.();
        }, 350);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [open, durationSeconds, onComplete, onClose]);

  if (!open || !mounted) return null;

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

  // Render directly into document.body in the center of the screen without blurring studio background
  return createPortal(
    <div
      className="studio-generation-loader-overlay hidden md:flex fixed inset-0 z-[999999] items-center justify-center pointer-events-none"
      style={{
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      aria-live="polite"
      role="status"
    >
      {/* 712x140px Exact Frame with color: #161616 */}
      <div
        className={`pointer-events-auto relative w-[712px] h-[140px] rounded-[24px] px-[27.5px] py-6 flex flex-col justify-between shadow-2xl transition-all duration-300 select-none ${
          isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        style={{
          backgroundColor: "#161616",
          fontFamily: "Roboto, var(--font-roboto-flex), sans-serif",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top: Headline 1 (24px semibold) & Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-semibold tracking-[-0.01em] text-white truncate max-w-[620px] leading-none">
            {headline}
          </h2>
          <button
            type="button"
            aria-label="Close generation overlay"
            onClick={onClose}
            className="w-7 h-7 -mr-2 -mt-2 rounded-full grid place-items-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
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
    </div>,
    document.body
  );
}
