"use client";

import { useState } from "react";
import Link from "next/link";
import { AdBanner } from "@/components/adsense";

const faqs = [
  {
    category: "Orders & Payments",
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our gallery, select your desired artwork, and click 'Add to Cart'. Proceed to checkout, fill in your details, and complete the payment via bank transfer."
      },
      {
        q: "What payment methods do you accept?",
        a: "We currently accept bank transfers for all purchases. This ensures secure transactions and allows us to offer competitive pricing on original artworks."
      },
      {
        q: "Can I cancel or modify my order?",
        a: "Orders can be cancelled or modified within 24 hours of placement, provided the artwork hasn't been shipped. Contact us immediately at info@alternusart.com."
      },
      {
        q: "How long do I have to complete payment?",
        a: "Payment should be completed within 48 hours of placing your order. After this period, the artwork may be released back to the gallery."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Domestic shipping takes 3-5 business days. International shipping typically takes 7-14 business days, depending on the destination."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. Shipping costs and delivery times vary by location. All artworks are professionally packaged with full insurance."
      },
      {
        q: "How is my artwork packaged?",
        a: "Each artwork is carefully wrapped in acid-free tissue, surrounded by protective foam, and placed in a custom wooden crate for maximum protection during transit."
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your artwork is shipped, you will receive a tracking number via email to monitor your delivery in real-time."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 14-day return policy. If you're not completely satisfied, return the artwork in its original condition for a full refund."
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team at info@alternusart.com with your order number. We'll provide return instructions and a prepaid shipping label."
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5-7 business days after we receive and inspect the returned artwork."
      }
    ]
  },
  {
    category: "Artwork & Authentication",
    questions: [
      {
        q: "Are all artworks original?",
        a: "Yes, every piece in our gallery is an original artwork. We do not sell prints or reproductions unless explicitly stated."
      },
      {
        q: "Do artworks come with a certificate of authenticity?",
        a: "Absolutely. Each artwork includes a signed certificate of authenticity from the artist, guaranteeing its originality and provenance."
      },
      {
        q: "Can I request a custom commission?",
        a: "Yes, many of our artists accept commissions. Contact us with your vision, and we'll connect you with the right artist."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-3">
            <div className="pl-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              className="flex-1 py-3 px-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                  {catIndex + 1}
                </span>
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const id = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === id;
                  return (
                    <div
                      key={qIndex}
                      className={`bg-white rounded-2xl border transition-all ${isOpen ? 'border-gray-300 shadow-md' : 'border-gray-100'}`}
                    >
                      <button
                        onClick={() => toggleFaq(id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          >
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ad Banner */}
        <AdBanner className="max-w-4xl mx-auto mt-12" />

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h3>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Our support team is here to help. Get in touch and we&apos;ll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Contact Support
              </Link>
              <a
                href="mailto:info@alternusart.com"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                info@alternusart.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
