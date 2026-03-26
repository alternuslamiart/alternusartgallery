"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function KidsDrawButton() {
  const pathname = usePathname();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show floating button after a short delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hide on kids-draw page
  if (pathname === "/kids-draw") return null;

  // Check if we're on the gallery page (use icon only)
  const isGalleryPage = pathname === "/gallery";

  if (!showButton) return null;

  return (
    <>
      {isGalleryPage ? (
        // Icon only for gallery page
        <Link
          href="/kids-draw"
          className="fixed bottom-20 left-4 z-50 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all group flex items-center justify-center"
          title="Kids Draw"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
            <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
            <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
          </svg>
        </Link>
      ) : (
        // Full button with text for other pages
        <Link
          href="/kids-draw"
          className="fixed bottom-20 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all text-xs font-medium group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
            <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
          </svg>
          Kids Draw
        </Link>
      )}
    </>
  );
}
