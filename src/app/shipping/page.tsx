"use client";

import { useState } from "react";
import Link from "next/link";
import { AdBanner } from "@/components/adsense";

const shippingZones = [
  { zone: "Europe (EU)", time: "5-7 business days", cost: "€25 - €45" },
  { zone: "United Kingdom", time: "5-7 business days", cost: "€35 - €55" },
  { zone: "United States", time: "7-10 business days", cost: "€55 - €85" },
  { zone: "Canada", time: "7-10 business days", cost: "€55 - €85" },
  { zone: "Asia Pacific", time: "10-14 business days", cost: "€75 - €120" },
  { zone: "Rest of World", time: "10-14 business days", cost: "€85 - €150" },
];

const premiumShipping = {
  zone: "White Glove Shipping",
  description: "For artworks over €2,000",
  time: "Personal delivery / Special handling",
  cost: "€150 - €300",
};

export default function ShippingPage() {
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showCountriesModal, setShowCountriesModal] = useState(false);

  const countries = [
    "Albania", "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
    "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland",
    "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom",
    "United States", "Canada", "Australia", "Japan", "South Korea", "Singapore", "UAE"
  ];

  const handleTrackOrder = () => {
    if (trackingNumber.trim()) {
      window.location.href = `/track?order=${trackingNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Delivery</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We deliver original artworks worldwide with professional packaging and full insurance coverage.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Key Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {/* Free Domestic - Scrolls to rates table */}
          <button
            onClick={() => document.getElementById('shipping-rates')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Domestic</h3>
            <p className="text-sm text-gray-500">Free shipping on all orders within Albania</p>
            <span className="text-xs text-emerald-600 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">View rates</span>
          </button>

          {/* Worldwide - Shows countries modal */}
          <button
            onClick={() => setShowCountriesModal(true)}
            className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Worldwide</h3>
            <p className="text-sm text-gray-500">We ship to over 100 countries globally</p>
            <span className="text-xs text-blue-600 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">View countries</span>
          </button>

          {/* Fully Insured - Shows insurance modal */}
          <button
            onClick={() => setShowInsuranceModal(true)}
            className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg hover:border-amber-200 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fully Insured</h3>
            <p className="text-sm text-gray-500">Every shipment includes full insurance</p>
            <span className="text-xs text-amber-600 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">Learn more</span>
          </button>

          {/* Track Order - Shows tracking input modal */}
          <button
            onClick={() => setShowTrackingModal(true)}
            className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg hover:border-purple-200 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Order</h3>
            <p className="text-sm text-gray-500">Real-time tracking on all shipments</p>
            <span className="text-xs text-purple-600 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">Track now</span>
          </button>
        </div>

        {/* Shipping Rates Table */}
        <div id="shipping-rates" className="max-w-4xl mx-auto mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Rates & Delivery Times</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 px-6 py-4 font-semibold text-gray-700">
              <span>Destination</span>
              <span>Delivery Time</span>
              <span>Shipping Cost</span>
            </div>
            {shippingZones.map((zone, index) => (
              <div key={index} className="grid grid-cols-3 px-6 py-4 border-b border-gray-100">
                <span className="font-medium text-gray-900">{zone.zone}</span>
                <span className="text-gray-600">{zone.time}</span>
                <span className={zone.cost === "Free" ? "text-emerald-600 font-semibold" : "text-gray-900"}>{zone.cost}</span>
              </div>
            ))}
            {/* Premium White Glove Shipping */}
            <div className="grid grid-cols-3 px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div>
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  {premiumShipping.zone}
                </span>
                <span className="text-xs text-amber-600 font-medium">{premiumShipping.description}</span>
              </div>
              <span className="text-gray-600">{premiumShipping.time}</span>
              <span className="text-amber-700 font-semibold">{premiumShipping.cost}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Shipping costs may vary based on artwork size and weight. Final shipping cost will be calculated at checkout.
          </p>
        </div>

        {/* Packaging Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Packaging</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Our Packaging Process</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span className="text-gray-600">Artwork wrapped in acid-free tissue paper</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span className="text-gray-600">Protective foam corner protectors applied</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span className="text-gray-600">Bubble wrap layer for impact protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <span className="text-gray-600">Custom wooden crate or reinforced box</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">5</span>
                    <span className="text-gray-600">Certificate of authenticity included</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Original artwork
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Certificate of authenticity
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Artist biography card
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Art care guide
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Full insurance coverage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        <AdBanner className="max-w-4xl mx-auto mt-12" />

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                <p className="text-gray-300">Contact us for shipping quotes or special requests.</p>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Us
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Modal */}
      {showInsuranceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInsuranceModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowInsuranceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Insurance Coverage</h3>
            <div className="space-y-4 text-gray-600">
              <p>Every artwork shipped through Alternus is fully insured against:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Loss during transit
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Damage from handling
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Weather-related incidents
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Theft during delivery
                </li>
              </ul>
              <p className="text-sm bg-amber-50 p-4 rounded-lg">
                <strong>Coverage Amount:</strong> 100% of the artwork&apos;s purchase price, including shipping costs.
              </p>
            </div>
            <button
              onClick={() => setShowInsuranceModal(false)}
              className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTrackingModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrackingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h3>
            <p className="text-gray-500 mb-6">Enter your order number to track your shipment in real-time.</p>
            <div className="space-y-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., ALT-2024-00123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleTrackOrder}
                disabled={!trackingNumber.trim()}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Track Order
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              You can find your order number in your confirmation email.
            </p>
          </div>
        </div>
      )}

      {/* Countries Modal */}
      {showCountriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCountriesModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCountriesModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Worldwide Shipping</h3>
                <p className="text-gray-500">We deliver to {countries.length}+ countries</p>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {countries.map((country) => (
                  <div key={country} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {country}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500 text-center">
                Don&apos;t see your country? <Link href="/support" className="text-blue-600 hover:underline">Contact us</Link> for shipping inquiries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
