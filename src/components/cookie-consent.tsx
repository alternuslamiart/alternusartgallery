"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("cookies-accepted");
    if (!hasAccepted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleAccept = () => {
    localStorage.setItem("cookies-accepted", "true");
    handleClose();
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem("cookies-accepted", "necessary");
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-all duration-300 ${isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-200/60 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Icon & Text */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">We value your privacy</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    We use cookies to enhance your experience, personalize content, and analyze traffic. By clicking &ldquo;Accept All&rdquo;, you agree to our use of cookies. Read our{" "}
                    <Link
                      href="/privacy"
                      className="text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors font-medium"
                    >
                      cookie policy
                    </Link>.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleNecessaryOnly}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Necessary Only
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-initial flex items-center justify-center h-10 px-5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Accept All
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
