"use client";

import { useEffect, useState, useCallback } from "react";
import { RotateCw } from "lucide-react";

export function NoWifiScreen() {
  const [isOffline, setIsOffline] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setIsReloading(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Register offline fallback service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently ignore if service workers are disabled or unsupported in context
      });
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleReload = useCallback(() => {
    setIsReloading(true);
    // Trigger immediate page refresh
    window.location.reload();
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <aside
      role="alertdialog"
      aria-modal="true"
      aria-label="No internet connection"
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#011b6d] select-none overflow-hidden"
    >
      {/* Ambient background glow and color harmony */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center -z-10 opacity-40 blur-2xl pointer-events-none scale-105"
        style={{ backgroundImage: "url('/no-wifi.png')" }}
      />

      {/* Main illustration container */}
      <div className="relative z-10 w-full max-w-[1350px] max-h-[100dvh] h-full sm:h-auto sm:aspect-[1672/941] flex flex-col items-center justify-center sm:justify-end px-4 py-8 sm:px-0 sm:py-0">
        {/* Crisp illustration background on desktop / contained image on mobile */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/no-wifi.png')" }}
        />

        <div className="sm:hidden relative w-full max-w-[480px] aspect-[1672/941] bg-contain bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/no-wifi.png')" }}
        />

        {/* Reload button:
            White button, text "Reload", with dark blue hover
        */}
        <div className="relative z-20 mt-6 sm:mt-0 sm:mb-[6.5%]">
          <button
            type="button"
            onClick={handleReload}
            disabled={isReloading}
            aria-label="Reload page"
            className="group inline-flex items-center justify-center gap-2.5 px-8 sm:px-11 py-3.5 sm:py-4 text-base sm:text-lg font-bold tracking-wide text-[#001c6d] bg-white hover:bg-[#001035] hover:text-white rounded-full shadow-2xl shadow-black/45 border-2 border-white hover:border-[#002b80] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-75 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          >
            <RotateCw
              className={`w-5 h-5 transition-transform duration-300 ${
                isReloading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            <span>{isReloading ? "Reloading..." : "Reload"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
