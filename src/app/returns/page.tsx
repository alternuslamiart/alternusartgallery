"use client";

import Link from "next/link";

export default function ReturnsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Policy</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Refunds</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your satisfaction is our priority. Learn about our hassle-free return policy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Key Policy Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-600">14</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Day Return Window</h3>
            <p className="text-sm text-gray-500">Return within 14 days of delivery</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-blue-600">100%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Full Refund</h3>
            <p className="text-sm text-gray-500">Get your money back in full</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                <path d="M12 3v6"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Return Shipping</h3>
            <p className="text-sm text-gray-500">We cover return shipping costs</p>
          </div>
        </div>

        {/* Return Process */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Return</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
                <p className="text-sm text-gray-500">Email us at info@alternusart.com with your order number</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200" />
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Label</h3>
                <p className="text-sm text-gray-500">We&apos;ll send you a prepaid return shipping label</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200" />
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Pack & Ship</h3>
                <p className="text-sm text-gray-500">Repack the artwork in original packaging and ship</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200" />
            </div>
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center h-full">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Refund</h3>
                <p className="text-sm text-gray-500">Refund processed within 5-7 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Policy Details</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Eligible for Return</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-1 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Artwork in original, undamaged condition
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-1 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Returned within 14 days of delivery
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-1 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Certificate of authenticity included
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mt-1 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Original packaging used for return
                </li>
              </ul>
            </div>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Not Eligible for Return</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-1 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Custom commissioned artworks
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-1 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Artworks damaged after delivery (not in transit)
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-1 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Returns requested after 14 days
                </li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Refund Timeline</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                  <span className="text-gray-600">Inspection: 1-2 days</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                  <span className="text-gray-600">Processing: 2-3 days</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                  <span className="text-gray-600">Bank transfer: 2-3 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need to Start a Return?</h3>
                <p className="text-gray-300">Our support team will guide you through the process.</p>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Support
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
