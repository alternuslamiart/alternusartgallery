"use client";

import { useState, useEffect } from "react";

export function CookieModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already set cookie preferences
    const cookiePreference = localStorage.getItem("cookiePreference");
    if (!cookiePreference) {
      // Show modal on first visit after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: "necessary" | "all") => {
    localStorage.setItem("cookiePreference", type);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-4">
              {/* Cookie Icon */}
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                  <path d="M11 17v.01" />
                  <path d="M7 14v.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Cookie Settings
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We use cookies to enhance your browsing experience, serve personalized content,
              and analyze our traffic. By clicking &quot;Accept all&quot;, you consent to our use
              of cookies.
            </p>

            {/* Cookie Types Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Necessary Cookies</p>
                  <p className="text-gray-500 text-xs">Essential for the website to function properly</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Analytics & Marketing</p>
                  <p className="text-gray-500 text-xs">Help us improve your experience</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAccept("necessary")}
                className="flex-1 py-3 px-6 bg-transparent text-white font-medium rounded-full border border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                Necessary only
              </button>
              <button
                onClick={() => handleAccept("all")}
                className="flex-1 py-3 px-6 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                Accept all
              </button>
            </div>

            {/* Privacy Link */}
            <p className="text-center text-gray-500 text-xs mt-4">
              Learn more about our{" "}
              <a href="/privacy" className="text-gray-400 hover:text-white underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
