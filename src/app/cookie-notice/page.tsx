"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function CookieNoticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 sm:mb-4">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Cookie Notice
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Learn how we use cookies and similar technologies to enhance your browsing experience.
          </p>
          <p className="text-gray-500 text-sm mt-4">Last updated: January 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Quick Summary */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quick Summary</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                We use cookies to keep you signed in, remember your preferences, analyze site traffic, and improve our services. You can manage your cookie preferences at any time through your browser settings or our cookie consent banner.
              </p>
            </div>
          </div>

          <div className="space-y-10">

            {/* What Are Cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful information about how their site is being used.
              </p>
            </section>

            {/* Types of Cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We use the following categories of cookies on our website:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Essential Cookies",
                    badge: "Always Active",
                    badgeColor: "bg-emerald-100 text-emerald-700",
                    description: "These cookies are necessary for the website to function properly. They enable basic features like page navigation, secure areas access, shopping cart functionality, and checkout processes. The website cannot function properly without these cookies.",
                    examples: "Session management, authentication, shopping cart, CSRF protection",
                  },
                  {
                    title: "Functional Cookies",
                    badge: "Optional",
                    badgeColor: "bg-blue-100 text-blue-700",
                    description: "These cookies enable the website to remember choices you make and provide enhanced, more personalized features. They may be set by us or by third-party providers whose services we have added to our pages.",
                    examples: "Language preferences, currency selection, recently viewed artworks",
                  },
                  {
                    title: "Analytics Cookies",
                    badge: "Optional",
                    badgeColor: "bg-purple-100 text-purple-700",
                    description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and your experience.",
                    examples: "Google Analytics, page view tracking, user journey analysis",
                  },
                  {
                    title: "Marketing Cookies",
                    badge: "Optional",
                    badgeColor: "bg-amber-100 text-amber-700",
                    description: "These cookies are used to track visitors across websites to display relevant advertisements. They are set by our advertising partners and may be used to build a profile of your interests.",
                    examples: "Social media pixels, retargeting ads, conversion tracking",
                  },
                ].map((cookie) => (
                  <div key={cookie.title} className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900">{cookie.title}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cookie.badgeColor}`}>
                        {cookie.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{cookie.description}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-gray-500">Examples:</span> {cookie.examples}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "Google Analytics", purpose: "Website traffic analysis and user behavior insights" },
                  { name: "Stripe", purpose: "Secure payment processing" },
                  { name: "PayPal", purpose: "Payment processing and buyer protection" },
                  { name: "Trustpilot", purpose: "Customer review collection and display" },
                ].map((service) => (
                  <div key={service.name} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{service.name}</h3>
                    <p className="text-xs text-gray-500">{service.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Managing Your Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in several ways:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Cookie Consent Banner",
                    description: "When you first visit our website, a cookie consent banner allows you to accept or customize your cookie preferences.",
                  },
                  {
                    title: "Browser Settings",
                    description: "Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you before a cookie is placed.",
                  },
                  {
                    title: "Opt-Out Links",
                    description: "For third-party analytics and advertising cookies, you can use opt-out tools provided by those services, such as Google Analytics Opt-Out Browser Add-on.",
                  },
                ].map((method) => (
                  <div key={method.title} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Please note that disabling certain cookies may affect the functionality of our website and limit your ability to use some features, such as the shopping cart and checkout.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cookies have different lifespans depending on their purpose:
              </p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Type</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-5 py-3 text-gray-600">Session Cookies</td>
                      <td className="px-5 py-3 text-gray-500">Deleted when you close your browser</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-gray-600">Persistent Cookies</td>
                      <td className="px-5 py-3 text-gray-500">Up to 12 months</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-gray-600">Analytics Cookies</td>
                      <td className="px-5 py-3 text-gray-500">Up to 24 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Questions?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have any questions about our use of cookies or this Cookie Notice, please contact us through our support page.
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
