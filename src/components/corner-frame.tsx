"use client";

import { cn } from "@/lib/utils";

interface CornerFrameProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: number;
  cornerThickness?: number;
  hoverEffect?: boolean;
}

export function CornerFrame({
  children,
  className,
  cornerSize = 20,
  cornerThickness = 2,
  hoverEffect = true,
}: CornerFrameProps) {
  return (
    <div className={cn("relative group", className)}>
      {/* Top Left Corner */}
      <div
        className={cn(
          "absolute top-0 left-0 border-t border-l border-foreground/30 transition-all duration-300",
          hoverEffect && "group-hover:border-foreground group-hover:scale-110"
        )}
        style={{
          width: cornerSize,
          height: cornerSize,
          borderWidth: cornerThickness,
        }}
      />
      {/* Top Right Corner */}
      <div
        className={cn(
          "absolute top-0 right-0 border-t border-r border-foreground/30 transition-all duration-300",
          hoverEffect && "group-hover:border-foreground group-hover:scale-110"
        )}
        style={{
          width: cornerSize,
          height: cornerSize,
          borderWidth: cornerThickness,
        }}
      />
      {/* Bottom Left Corner */}
      <div
        className={cn(
          "absolute bottom-0 left-0 border-b border-l border-foreground/30 transition-all duration-300",
          hoverEffect && "group-hover:border-foreground group-hover:scale-110"
        )}
        style={{
          width: cornerSize,
          height: cornerSize,
          borderWidth: cornerThickness,
        }}
      />
      {/* Bottom Right Corner */}
      <div
        className={cn(
          "absolute bottom-0 right-0 border-b border-r border-foreground/30 transition-all duration-300",
          hoverEffect && "group-hover:border-foreground group-hover:scale-110"
        )}
        style={{
          width: cornerSize,
          height: cornerSize,
          borderWidth: cornerThickness,
        }}
      />
      {children}
    </div>
  );
}

export function CornerFrameCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative group cursor-pointer", className)}>
      {/* Animated corner frames */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-left group-hover:scale-x-110" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-top group-hover:scale-y-110" />
        </div>
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-right group-hover:scale-x-110" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-top group-hover:scale-y-110" />
        </div>
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-left group-hover:scale-x-110" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-bottom group-hover:scale-y-110" />
        </div>
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-right group-hover:scale-x-110" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-foreground/20 group-hover:bg-foreground transition-colors origin-bottom group-hover:scale-y-110" />
        </div>
      </div>
      <div className="p-2">
        {children}
      </div>
    </div>
  );
}
