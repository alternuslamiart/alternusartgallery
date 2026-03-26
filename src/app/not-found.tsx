import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Large 404 */}
            <h1 className="text-[150px] sm:text-[200px] md:text-[250px] font-bold text-gray-100 leading-none select-none">
              404
            </h1>

            {/* Floating Art Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative group">
                {/* Frame */}
                <div className="w-32 h-40 sm:w-40 sm:h-48 bg-white border-8 border-gray-800 shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                  {/* Empty Frame Content */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </div>
                </div>

                {/* Hanging Wire */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-700"></div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Artwork Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you&apos;re looking for seems to have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/gallery">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              Browse Gallery
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/about" className="text-primary hover:underline">
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/support" className="text-primary hover:underline">
              Contact Support
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="text-primary hover:underline">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
