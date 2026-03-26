"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookies-accepted");
    if (!hasAccepted) {
      // Show modal after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookies-accepted", "true");
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 animate-in fade-in zoom-in duration-300">
        <p className="text-gray-800 text-lg md:text-xl leading-relaxed mb-8">
          We use cookies and other technologies to give you the best online experience. By using our website you agree to our use of cookies and other technologies in accordance with our{" "}
          <Link
            href="/privacy"
            className="text-gray-800 underline hover:text-gray-600 transition-colors font-medium"
          >
            cookie policy
          </Link>
          . Data is not sold to or shared with any broker. Data can be shared with our partners for improving our platforms and demonstrate usage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleAccept}
            size="lg"
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            ACCEPT & CONTINUE
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto text-gray-900 hover:text-gray-700 px-8 py-6 rounded-full text-base font-semibold"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
}
