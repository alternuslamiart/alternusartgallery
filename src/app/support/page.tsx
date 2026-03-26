"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact-form";

function ContactFormSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <div className="space-y-6 animate-pulse">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-32 bg-gray-100 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 sm:mb-4">
            How Can We Help?
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Support Center
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Get help with your orders, artwork inquiries, or connect directly with our art curator.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto">

          {/* Two Main Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Contact Support */}
            <div className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-xl transition-all hover:border-gray-200">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600">
                  <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Contact Support
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Need help with an order, shipping, returns, or your account? Our support team is here to assist you.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Order tracking &amp; status updates
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Shipping &amp; delivery questions
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Returns &amp; refund requests
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Account &amp; payment issues
                </li>
              </ul>
              <a
                href="#support-form"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Submit a Request
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Contact Curator */}
            <div className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-xl transition-all hover:border-gray-200">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
                  <path d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Contact Curator
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Interested in a specific artwork, want to commission a piece, or have questions about our collection?
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Artwork inquiries &amp; availability
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Custom commissions &amp; requests
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Artist collaboration inquiries
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Collection consulting &amp; advisory
                </li>
              </ul>
              <a
                href="#support-form"
                className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                Get Help
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Response Time Banner */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-12 flex items-center justify-center gap-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-sm sm:text-base">
              We typically respond <span className="text-emerald-400 font-semibold">within 24 hours</span>
            </p>
          </div>

          {/* Message Form */}
          <div id="support-form" className="max-w-3xl mx-auto scroll-mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
            </div>
            <Suspense fallback={<ContactFormSkeleton />}>
              <ContactForm />
            </Suspense>
          </div>

          {/* Quick Links */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 mb-4">Looking for something else?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/faq" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                FAQ
              </Link>
              <Link href="/help" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                Help Center
              </Link>
              <Link href="/track" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Track Order
              </Link>
              <Link href="/returns" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Returns
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
