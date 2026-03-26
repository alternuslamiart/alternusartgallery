"use client";

import Image from "next/image";
import Link from "next/link";
import { paintings } from "@/lib/paintings";
import { AdBanner } from "@/components/adsense";

export default function AboutPage() {
  const totalWorks = paintings.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Clean & Soft */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-6">
              Est. 2015
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight">
              Alternus
              <span className="block font-semibold">Art Gallery</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              A curated destination for contemporary and classical artworks.
              Where collectors discover extraordinary pieces and artists find their audience.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-12 md:gap-16 mb-12">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-light text-gray-900">{totalWorks}+</p>
                <p className="text-gray-400 text-sm uppercase tracking-wider mt-1">Artworks</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-light text-gray-900">50+</p>
                <p className="text-gray-400 text-sm uppercase tracking-wider mt-1">Artists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-light text-gray-900">12</p>
                <p className="text-gray-400 text-sm uppercase tracking-wider mt-1">Countries</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gallery"
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Explore Collection
              </Link>
              <Link
                href="/support"
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=1920&q=80"
                alt="Alternus Art Gallery"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Our Mission
                </p>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
                  Connecting Art
                  <span className="block font-semibold">with Life</span>
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-gray-500 leading-relaxed">
                  Alternus Art Gallery was founded with a singular vision: to bridge the gap
                  between exceptional artists and discerning collectors. We believe that
                  art should be accessible, meaningful, and transformative.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Our carefully curated collection spans contemporary paintings, classical
                  masterworks, and emerging talent from around the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="container mx-auto px-4">
        <AdBanner />
      </div>

      {/* What We Offer */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4">
                Services
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900">
                What We <span className="font-semibold">Offer</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Original Artworks */}
              <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Original Artworks</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Authentic, one-of-a-kind pieces directly from renowned artists.
                </p>
              </div>

              {/* Art Advisory */}
              <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Art Advisory</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Expert guidance on curating your personal collection.
                </p>
              </div>

              {/* Private Viewings */}
              <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Private Viewings</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Exclusive appointments in an intimate setting.
                </p>
              </div>

              {/* Global Delivery */}
              <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Global Delivery</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Museum-quality packaging and secure shipping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4">
                Our Commitment
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900">
                Why Collectors <span className="font-semibold">Choose Us</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Authenticity Guaranteed</h3>
                  <p className="text-gray-500 text-sm">
                    Every artwork comes with a certificate of authenticity.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Personal Curators</h3>
                  <p className="text-gray-500 text-sm">
                    Dedicated specialists to guide your collection journey.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Secure Transactions</h3>
                  <p className="text-gray-500 text-sm">
                    Safe payments with transparent pricing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">14-Day Returns</h3>
                  <p className="text-gray-500 text-sm">
                    Hassle-free returns for peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-200 mx-auto mb-6">
              <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.006z"/>
            </svg>
            <p className="text-2xl md:text-3xl text-gray-700 font-light leading-relaxed mb-6">
              Art is the lie that enables us to realize the truth.
            </p>
            <p className="text-gray-400">— Pablo Picasso</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4">
              Start Your Collection
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
              Begin Your Art <span className="font-semibold">Journey</span>
            </h2>
            <p className="text-gray-500 mb-10">
              Whether you&apos;re looking for a statement piece or building a collection,
              our team is here to assist you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gallery"
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Gallery
              </Link>
              <Link
                href="/support"
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
