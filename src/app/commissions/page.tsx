"use client";

import Link from "next/link";
import Image from "next/image";

export default function CommissionsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Custom Art</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Commission Your Artwork</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Work directly with our talented artists to create a one-of-a-kind masterpiece tailored to your vision.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Commissions Work</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "Share Your Vision", desc: "Tell us about your idea, preferred style, size, and budget" },
              { step: "2", title: "Artist Match", desc: "We connect you with the perfect artist for your project" },
              { step: "3", title: "Proposal", desc: "Receive a detailed proposal with timeline and pricing" },
              { step: "4", title: "Creation", desc: "Watch your artwork come to life with progress updates" },
              { step: "5", title: "Delivery", desc: "Receive your custom artwork with certificate of authenticity" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Types */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80" alt="Portrait" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Portraits</h3>
                <p className="text-sm text-gray-500 mb-4">Custom portraits of loved ones, pets, or self-portraits in your preferred style.</p>
                <p className="text-lg font-bold text-gray-900">From €500</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&q=80" alt="Landscape" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Landscapes</h3>
                <p className="text-sm text-gray-500 mb-4">Capture your favorite place, memory, or dream destination on canvas.</p>
                <p className="text-lg font-bold text-gray-900">From €800</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative bg-gray-100">
                <Image src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80" alt="Abstract" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Abstract & Modern</h3>
                <p className="text-sm text-gray-500 mb-4">Contemporary pieces designed to complement your space and style.</p>
                <p className="text-lg font-bold text-gray-900">From €600</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Guide */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pricing Guide</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50 px-6 py-4 font-semibold text-gray-700">
              <span>Size</span>
              <span>Dimensions</span>
              <span>Timeline</span>
              <span>Starting Price</span>
            </div>
            {[
              { size: "Small", dims: "30 x 40 cm", time: "2-3 weeks", price: "€500" },
              { size: "Medium", dims: "50 x 70 cm", time: "3-4 weeks", price: "€900" },
              { size: "Large", dims: "80 x 100 cm", time: "4-6 weeks", price: "€1,500" },
              { size: "Extra Large", dims: "100 x 150 cm", time: "6-8 weeks", price: "€2,500" },
            ].map((item, index) => (
              <div key={index} className={`grid grid-cols-4 px-6 py-4 ${index !== 3 ? 'border-b border-gray-100' : ''}`}>
                <span className="font-medium text-gray-900">{item.size}</span>
                <span className="text-gray-600">{item.dims}</span>
                <span className="text-gray-600">{item.time}</span>
                <span className="text-gray-900 font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            * Final pricing depends on complexity, medium, and artist. A detailed quote will be provided after consultation.
          </p>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Create Something Special?</h3>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Start your commission journey today. Share your vision and let us bring it to life.
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Start Your Commission
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
