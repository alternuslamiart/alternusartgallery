"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 sm:mb-4">
            Commitment
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Accessibility
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            We are committed to making art accessible to everyone. Learn about our efforts to ensure an inclusive experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Commitment Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Our Commitment</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Alternus Art Gallery is dedicated to ensuring that our website and digital experiences are accessible to all users, including those with disabilities. We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
              </p>
            </div>
          </div>

          <div className="space-y-10">

            {/* Standards */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We follow internationally recognized accessibility standards to ensure our website works well for everyone.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">WCAG 2.1 Level AA</h3>
                  <p className="text-sm text-gray-500">We aim to meet the Web Content Accessibility Guidelines 2.1 at Level AA conformance.</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">Section 508</h3>
                  <p className="text-sm text-gray-500">Our website is designed to be compliant with Section 508 of the Rehabilitation Act.</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">ADA Compliance</h3>
                  <p className="text-sm text-gray-500">We work to ensure compliance with the Americans with Disabilities Act.</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">EAA / EN 301 549</h3>
                  <p className="text-sm text-gray-500">We follow the European Accessibility Act and EN 301 549 standards for EU compliance.</p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We have implemented the following features to improve accessibility across our platform:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Keyboard Navigation",
                    description: "All interactive elements can be accessed and operated using only a keyboard. Tab through menus, links, and buttons with ease.",
                  },
                  {
                    title: "Screen Reader Support",
                    description: "Our website uses semantic HTML, ARIA labels, and descriptive alt text on images to ensure compatibility with screen readers.",
                  },
                  {
                    title: "Color Contrast",
                    description: "Text and interactive elements maintain sufficient color contrast ratios to ensure readability for users with visual impairments.",
                  },
                  {
                    title: "Responsive Design",
                    description: "Our website adapts to different screen sizes and supports zoom up to 200% without loss of content or functionality.",
                  },
                  {
                    title: "Alt Text for Artworks",
                    description: "All artwork images include descriptive alternative text to convey the visual content to users who rely on assistive technologies.",
                  },
                  {
                    title: "Focus Indicators",
                    description: "Visible focus indicators highlight the active element when navigating with a keyboard, making it easy to track your position on the page.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Ongoing Efforts */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ongoing Efforts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Accessibility is an ongoing process. We continuously work to improve the user experience for all visitors by:
              </p>
              <ul className="space-y-3">
                {[
                  "Conducting regular accessibility audits and testing",
                  "Training our team on accessibility best practices",
                  "Incorporating user feedback to identify and resolve barriers",
                  "Testing with assistive technologies including screen readers and voice navigation",
                  "Reviewing and updating our content for plain language and clarity",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Feedback */}
            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Feedback & Assistance</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you experience any difficulty accessing any part of our website, or if you have suggestions for improvement, we want to hear from you. Your feedback helps us make art accessible to everyone.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Contact Support
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </section>

          </div>

          <Separator className="my-10" />

          {/* Bottom Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>Last updated: January 2026</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
              <Link href="/support" className="hover:text-gray-700 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
