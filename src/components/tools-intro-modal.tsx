"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ToolSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const DEFAULT_TOOL_SLIDES: ToolSlide[] = [
  {
    id: "architecture",
    title: "Architecture Tools",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Augue a est feugiat.",
    description:
      "Lorem ipsum dolor sit amet consectetur. Est sit risus duis nunc malesuada amet elementum quis enim. Tempus phasellus lectus elit molestie. Ac habitant pellentesque nulla elementum. Posuere egestas vel ut risus vitae viverra. Amet ipsum iaculis convallis aliquet purus gravida metus nulla cras. Vulputate amet nulla egestas laoreet nam ultrices et mauris. In morbi vel volutpat platea integer vel. Urna fringilla amet enim eu. Mollis ac amet justo posuere. Elementum tortor tristique risus in.",
    image: "/introduction.png",
  },
  {
    id: "sketch",
    title: "Sketch Studio Tools",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Augue a est feugiat.",
    description:
      "Lorem ipsum dolor sit amet consectetur. Est sit risus duis nunc malesuada amet elementum quis enim. Tempus phasellus lectus elit molestie. Ac habitant pellentesque nulla elementum. Posuere egestas vel ut risus vitae viverra. Amet ipsum iaculis convallis aliquet purus gravida metus nulla cras. Vulputate amet nulla egestas laoreet nam ultrices et mauris. In morbi vel volutpat platea integer vel. Urna fringilla amet enim eu. Mollis ac amet justo posuere. Elementum tortor tristique risus in.",
    image: "/introduction.png",
  },
  {
    id: "infrastructure",
    title: "Infrastructure Tools",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Augue a est feugiat.",
    description:
      "Lorem ipsum dolor sit amet consectetur. Est sit risus duis nunc malesuada amet elementum quis enim. Tempus phasellus lectus elit molestie. Ac habitant pellentesque nulla elementum. Posuere egestas vel ut risus vitae viverra. Amet ipsum iaculis convallis aliquet purus gravida metus nulla cras. Vulputate amet nulla egestas laoreet nam ultrices et mauris. In morbi vel volutpat platea integer vel. Urna fringilla amet enim eu. Mollis ac amet justo posuere. Elementum tortor tristique risus in.",
    image: "/introduction.png",
  },
  {
    id: "interior",
    title: "Interior Design Tools",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Augue a est feugiat.",
    description:
      "Transform interior concepts into detailed living spaces with comprehensive material palettes, lighting setups, and automated dimension annotations. Seamlessly export floor plans and 3D scenes for client presentations and contractor reviews.",
    image: "/introduction.png",
  },
  {
    id: "3d-visualization",
    title: "3D Visualization Tools",
    subtitle: "Lorem ipsum dolor sit amet consectetur. Augue a est feugiat.",
    description:
      "Directly manipulate architectural meshes, procedural walls, parametric roofs, and custom furniture objects. Synchronize bi-directionally with Blender, Unreal Engine, and Unity with one-click export pipelines.",
    image: "/introduction.png",
  },
];

interface ToolsIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides?: ToolSlide[];
  initialSlideId?: string;
  studio?: "architecture" | "sketch" | "interior" | "infrastructure" | string;
}

export function ToolsIntroModal({
  isOpen,
  onClose,
  slides = DEFAULT_TOOL_SLIDES,
  initialSlideId,
  studio,
}: ToolsIntroModalProps) {
  const targetId = initialSlideId || (studio === "interior" ? "sketch" : studio);
  const foundIndex = targetId ? slides.findIndex((s) => s.id === targetId) : -1;
  const [currentIndex, setCurrentIndex] = useState(foundIndex >= 0 ? foundIndex : 0);

  useEffect(() => {
    if (isOpen && targetId) {
      const idx = slides.findIndex((s) => s.id === targetId);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [isOpen, targetId, slides]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, slides.length]);

  if (!isOpen) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tools introduction"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-[4px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Frame hiri: 412x540px corner 16px */}
      <div
        className="relative flex flex-col justify-between overflow-hidden shadow-2xl transition-all"
        style={{
          width: 412,
          maxWidth: "calc(100vw - 32px)",
          height: 540,
          maxHeight: "calc(100vh - 32px)",
          borderRadius: 16,
          backgroundColor: "#242424",
          padding: 20,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#FFFFFF",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close introduction"
          className="absolute top-3 right-3 z-20 flex items-center justify-center transition-colors text-zinc-400 hover:text-white hover:bg-white/10"
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={15} />
        </button>

        {/* Intro video/photo frame: 372x192px corner 12px */}
        <div
          className="relative overflow-hidden shrink-0 select-none"
          style={{
            width: 372,
            maxWidth: "100%",
            height: 192,
            borderRadius: 12,
            backgroundColor: "#1c1c1c",
          }}
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        </div>

        {/* Header row: frame icon (64x64px) + Header title 1 (16px) & line 2 (12px Roboto) */}
        <div className="flex items-center gap-[14px] shrink-0 mt-[16px]">
          {/* Frame icon: 64x64px */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: "#2e2e2e",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="7"
                y="3"
                width="14"
                height="14"
                rx="4"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.6"
                strokeDasharray="3 2"
              />
              <rect x="3" y="7" width="14" height="14" rx="4" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Header titles */}
          <div className="flex flex-col justify-center min-w-0 pr-6">
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#FFFFFF",
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {currentSlide.title}
            </h3>
            <p
              style={{
                fontSize: 12,
                fontFamily: "var(--font-roboto), Roboto, sans-serif",
                color: "#a1a1aa",
                lineHeight: 1.35,
                margin: "4px 0 0 0",
              }}
            >
              {currentSlide.subtitle}
            </p>
          </div>
        </div>

        {/* Body Description */}
        <p
          style={{
            fontSize: 12,
            fontFamily: "var(--font-roboto), Roboto, sans-serif",
            color: "#d4d4d8",
            lineHeight: 1.48,
            margin: "12px 0 0 0",
            textAlign: "left",
            display: "-webkit-box",
            WebkitLineClamp: 7,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {currentSlide.description}
        </p>

        {/* Bottom controls: scroll button icon (64x24px, circle 16x16px) & Continue learn another tools */}
        <div className="flex items-center gap-[16px] shrink-0 mt-auto pt-[12px]">
          {/* Scroll button icon size: 64x24px */}
          <div
            className="flex items-center justify-between"
            style={{
              width: 64,
              height: 24,
              borderRadius: 9999,
              backgroundColor: "#333333",
              padding: "0 4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Left circle: 16x16px */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous tool"
              className="flex items-center justify-center transition-colors hover:brightness-125"
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#484848",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <ChevronLeft size={10} strokeWidth={2.5} />
            </button>

            {/* Divider */}
            <span
              style={{
                fontSize: 10,
                color: "rgba(255, 255, 255, 0.35)",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              |
            </span>

            {/* Right circle: 16x16px */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next tool"
              className="flex items-center justify-center transition-colors hover:brightness-125"
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#484848",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <ChevronRight size={10} strokeWidth={2.5} />
            </button>
          </div>

          {/* Continue learn another tools link/button */}
          <button
            type="button"
            onClick={handleNext}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 12.5,
              color: "#3b82f6",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "var(--font-roboto), Roboto, sans-serif",
              textDecoration: "none",
            }}
            className="hover:underline hover:text-blue-400 transition-colors"
          >
            Continue learn another tools
          </button>
        </div>
      </div>
    </div>
  );
}
