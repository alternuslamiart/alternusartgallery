"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Perfect for art enthusiasts who love to browse and discover.",
    features: [
      "Browse the full gallery",
      "View artist profiles",
      "Basic search & filters",
      "Save up to 10 favorites",
      "Community access",
    ],
    cta: "Get Started",
    href: "/signup",
    style: "border-gray-200",
    buttonStyle: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    badge: null,
  },
  {
    name: "Best Plan",
    price: "$9.99",
    period: "/mo",
    description: "For collectors who want early access and premium features.",
    features: [
      "Everything in Free",
      "Unlimited favorites",
      "Early access to new collections",
      "HD artwork previews",
      "AI Art Assistant chat",
      "Priority support",
      "Exclusive newsletter",
    ],
    cta: "Subscribe Now",
    href: "/signup",
    style: "border-blue-500 ring-2 ring-blue-100 scale-105",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "/mo",
    description: "The ultimate experience for serious art collectors.",
    features: [
      "Everything in Best Plan",
      "Advanced AI art advisor",
      "Exclusive collections access",
      "Private virtual gallery tours",
      "Commission requests",
      "Direct artist messaging",
      "Certificate of authenticity included",
      "Free shipping on all orders",
    ],
    cta: "Go Premium",
    href: "/signup",
    style: "border-purple-300",
    buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
    badge: "Best Value",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Pricing" },
          ]}
        />

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium mb-4">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-500">
            Unlock the full Alternus experience. From browsing to collecting,
            find the plan that fits your passion.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:shadow-lg ${plan.style} ${
                plan.name === "Best Plan" ? "order-first md:order-none" : ""
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${
                      plan.name === "Best Plan"
                        ? "bg-blue-600 text-white"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500 flex-shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.href}>
                <Button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${plan.buttonStyle}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Secure payment via PayPal
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
