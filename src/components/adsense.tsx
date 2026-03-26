"use client";

import { useEffect, useRef } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export function AdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
  style,
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    if (isAdPushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isAdPushed.current = true;
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div ref={adRef} className={`adsense-container ${className}`} style={{ textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client="ca-pub-7703640549256264"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}

// Pre-configured ad variants for common placements
export function AdBanner({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="XXXXXXXXXX"
      adFormat="horizontal"
      className={`my-6 ${className}`}
    />
  );
}

export function AdInArticle({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="XXXXXXXXXX"
      adFormat="fluid"
      className={`my-8 ${className}`}
      style={{ display: "block", textAlign: "center" }}
    />
  );
}

export function AdSidebar({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="XXXXXXXXXX"
      adFormat="vertical"
      className={className}
    />
  );
}

export function AdRectangle({ className = "" }: { className?: string }) {
  return (
    <AdSense
      adSlot="XXXXXXXXXX"
      adFormat="rectangle"
      className={`my-6 ${className}`}
    />
  );
}
