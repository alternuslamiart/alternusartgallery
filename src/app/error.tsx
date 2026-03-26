"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Broken Frame Icon */}
            <div className="w-32 h-32 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
                {/* Frame */}
                <rect x="20" y="20" width="160" height="160" fill="none" stroke="#DC2626" strokeWidth="8" strokeDasharray="20,10"/>
                {/* Crack */}
                <path d="M 100 20 L 120 100 L 80 140 L 100 180" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round"/>
                {/* Warning Symbol */}
                <circle cx="100" cy="100" r="30" fill="#FEE2E2"/>
                <path d="M 100 85 L 100 105" stroke="#DC2626" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="100" cy="115" r="3" fill="#DC2626"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Something Went Wrong
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We apologize for the inconvenience. An unexpected error occurred while loading this page.
          </p>
          {error.message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-mono break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset} size="lg" className="min-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Our support team is here for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="text-primary hover:underline">
              Help Center
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
