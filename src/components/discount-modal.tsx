"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function DiscountModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Show floating button after a short delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  // Check if we're on the gallery page
  const isGalleryPage = pathname === '/gallery';

  return (
    <>
      {/* Floating Button - Bottom Left */}
      {showButton && !isOpen && (
        <>
          {isGalleryPage ? (
            // Icon only for gallery page
            <button
              onClick={openModal}
              className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all group flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <path d="M12 2v20"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </button>
          ) : (
            // Full button with text for other pages
            <button
              onClick={openModal}
              className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all text-sm font-medium group"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              Get 10% OFF
            </button>
          )}
        </>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>

              {/* Content */}
              <div className="p-8 pt-12 text-center">
                {!submitted ? (
                  <>
                    {/* Discount Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-emerald-600">10%</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Get 10% OFF
                    </h2>

                    {/* Subtitle */}
                    <p className="text-gray-500 mb-6">
                      Subscribe to our newsletter and get 10% off your first order.
                    </p>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-3 px-8 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                      >
                        Get My 10% OFF
                      </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-4">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  <>
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </div>

                    {/* Success Title */}
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      You&apos;re In!
                    </h2>

                    {/* Promo Code */}
                    <p className="text-gray-500 mb-4">
                      Use this code at checkout:
                    </p>

                    <div className="bg-gray-100 rounded-xl py-3 px-6 mb-6">
                      <span className="text-xl font-bold text-gray-900 tracking-wider">WELCOME10</span>
                    </div>

                    <button
                      onClick={handleClose}
                      className="w-full py-3 px-8 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
