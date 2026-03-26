"use client";

import { useState } from "react";
import { useCompare } from "@/components/providers";
import { Painting } from "@/lib/paintings";
import { Button } from "@/components/ui/button";

interface CompareButtonProps {
  painting: Painting;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function CompareButton({
  painting,
  variant = "outline",
  size = "default",
  showText = true,
  className = "",
}: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, compareCount } = useCompare();
  const isComparing = isInCompare(painting.id);
  const [showLimit, setShowLimit] = useState(false);

  const handleClick = () => {
    if (isComparing) {
      removeFromCompare(painting.id);
    } else {
      if (compareCount >= 4) {
        setShowLimit(true);
        setTimeout(() => setShowLimit(false), 3000);
        return;
      }
      addToCompare(painting);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        variant={isComparing ? "default" : variant}
        size={size}
        className={className}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={showText ? "mr-2" : ""}
        >
          <path d="M18 6 7 17l-5-5" />
          <path d="m22 10-7.5 7.5L13 16" />
        </svg>
        {showText && (isComparing ? "Remove from Compare" : "Add to Compare")}
      </Button>

      {showLimit && (
        <div className="absolute top-full left-0 mt-2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
          Maximum 4 artworks for comparison
        </div>
      )}
    </div>
  );
}
