"use client";

import Link from "next/link";
import { AdBanner } from "@/components/adsense";

export default function CareGuidePage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Preservation</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Art Care Guide</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Protect your investment. Learn how to properly care for and preserve your artwork for generations.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Tips */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {/* Avoid Sunlight */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="m4.93 4.93 1.41 1.41"/>
                  <path d="m17.66 17.66 1.41 1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="m6.34 17.66-1.41 1.41"/>
                  <path d="m19.07 4.93-1.41 1.41"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Avoid Sunlight</h3>
              <p className="text-sm text-gray-500">Keep away from direct sunlight</p>
            </div>

            {/* Control Humidity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Control Humidity</h3>
              <p className="text-sm text-gray-500">Maintain 40-50% humidity</p>
            </div>

            {/* Stable Temperature */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600">
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Stable Temperature</h3>
              <p className="text-sm text-gray-500">Keep at 18-24°C</p>
            </div>

            {/* Handle With Care */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Handle With Care</h3>
              <p className="text-sm text-gray-500">Use clean, dry hands</p>
            </div>
          </div>

          {/* Oil Paintings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Oil Paintings</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">1</span>
                <p><strong>Dusting:</strong> Use a soft, dry brush or clean microfiber cloth to gently remove dust. Brush in one direction only.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">2</span>
                <p><strong>Cleaning:</strong> Never use water, household cleaners, or solvents. For deep cleaning, consult a professional conservator.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">3</span>
                <p><strong>Display:</strong> Hang away from direct sunlight, heating vents, and fireplaces. Avoid areas with high humidity like bathrooms.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">4</span>
                <p><strong>Varnishing:</strong> Wait at least 6-12 months before varnishing a new oil painting. Apply only picture varnish.</p>
              </div>
            </div>
          </div>

          {/* Watercolors & Works on Paper */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Watercolors & Works on Paper</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">1</span>
                <p><strong>Framing:</strong> Always use UV-protective glass and acid-free matting. Never let glass touch the artwork directly.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">2</span>
                <p><strong>Light Exposure:</strong> Extremely light-sensitive. Display in areas with low, indirect lighting or use museum-quality UV glass.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">3</span>
                <p><strong>Storage:</strong> Store flat in acid-free folders or boxes. Never roll or fold works on paper.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">4</span>
                <p><strong>Humidity:</strong> Maintain consistent humidity levels. Paper is very susceptible to moisture damage and foxing.</p>
              </div>
            </div>
          </div>

          {/* Acrylic Paintings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Acrylic Paintings</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">1</span>
                <p><strong>Cleaning:</strong> Use a soft, lint-free cloth slightly dampened with distilled water if needed. Avoid rubbing.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">2</span>
                <p><strong>Temperature:</strong> Acrylic can become brittle in cold temperatures. Never store below 10°C.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">3</span>
                <p><strong>Surface:</strong> Acrylic surfaces can attract dust. Regular gentle dusting helps maintain appearance.</p>
              </div>
            </div>
          </div>

          {/* Hanging Guide */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Proper Hanging</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-gray-300">Do&apos;s</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Use appropriate wall hooks for the weight
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Hang at eye level (center at 145-150cm)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Use two hooks for larger pieces
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Check wall type and use appropriate anchors
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-gray-300">Don&apos;ts</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Hang above radiators or fireplaces
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Place in direct sunlight
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Hang in humid areas (bathrooms, kitchens)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Use nails directly on drywall for heavy art
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <AdBanner className="mb-12" />

          {/* Contact CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Need professional advice or conservation services? We&apos;re here to help.
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Contact Art Advisor
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
