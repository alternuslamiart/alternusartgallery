"use client";

import { useState, useEffect } from "react";

export function ArtLoverModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only show once ever (first visit)
    const hasSeen = localStorage.getItem("welcomeOfferShown");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("welcomeOfferShown", "true");
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Store email for future use
    localStorage.setItem("welcomeOfferShown", "true");
    localStorage.setItem("subscriberEmail", email);
    setSubmitted(true);
    setTimeout(() => setIsOpen(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[820px] animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

          {/* Left — Image */}
          <div className="relative w-full md:w-[45%] h-[200px] md:h-auto min-h-[200px] md:min-h-[420px]">
            <img
              src="/artworks/hero-modal.jpg"
              alt="Original Artwork"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // Fallback gradient if image missing
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.classList.add(
                  "bg-gradient-to-br",
                  "from-indigo-900",
                  "via-blue-800",
                  "to-cyan-600"
                );
              }}
            />
            {/* Subtle overlay text */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white/80 text-xs font-medium tracking-wide">
                ALTERNUS ART GALLERY
              </p>
            </div>
          </div>

          {/* Right — Content */}
          <div className="relative flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {submitted ? (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Alternus!
                </h2>
                <p className="text-gray-500 text-sm">
                  Check your email for your exclusive 10% discount code.
                </p>
              </div>
            ) : (
              /* Form State */
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  Sign up and get{" "}
                  <span className="text-amber-600">10% off</span>{" "}
                  your first order
                </h2>

                <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
                  Fresh arrivals, curator picks, exclusive features.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* CTA Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Get 10% off now
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </form>

                {/* Dismiss */}
                <button
                  onClick={handleClose}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors mx-auto block underline underline-offset-2"
                >
                  I don&apos;t want the discount
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
