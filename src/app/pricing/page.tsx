"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Plan {
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  style: string;
  buttonStyle: string;
  badge: string | null;
  iconColor: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    priceValue: 0,
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
    style: "border-gray-200 hover:border-gray-300",
    buttonStyle: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    badge: null,
    iconColor: "text-gray-400",
  },
  {
    name: "Best Plan",
    price: "$9.99",
    priceValue: 9.99,
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
    style: "border-blue-500 ring-2 ring-blue-100 scale-[1.02] md:scale-105",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    badge: "Most Popular",
    iconColor: "text-blue-500",
  },
  {
    name: "Premium",
    price: "$24.99",
    priceValue: 24.99,
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
    style: "border-purple-300 hover:border-purple-400",
    buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
    badge: "Best Value",
    iconColor: "text-purple-500",
  },
];

export default function PricingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank">("paypal");

  const handleSelectPlan = (plan: Plan) => {
    if (plan.priceValue === 0) {
      // Free plan - go to signup if not logged in, otherwise nothing
      if (status !== "authenticated") {
        router.push("/signup");
      }
      return;
    }

    // Paid plans - check login first
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    // Logged in - show payment dialog
    setSelectedPlan(plan);
    setPaymentMethod("paypal");
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Pricing" },
          ]}
        />

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <Link href="/" className="inline-block">
              <h2 className="text-xl font-bold tracking-[0.2em] text-gray-900">ALTERNUS</h2>
              <p className="text-[9px] tracking-[0.3em] text-gray-400 mt-0.5">ART GALLERY</p>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Unlock the full Alternus experience. From browsing to collecting,
            find the plan that fits your passion.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-lg ${plan.style} ${
                plan.name === "Best Plan" ? "order-first md:order-none" : ""
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold shadow-sm ${
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
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`${plan.iconColor} flex-shrink-0 mt-0.5`}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${plan.buttonStyle}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Secure payment via PayPal
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border-gray-200">
          {selectedPlan && (
            <div className="bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50">
              {/* Header */}
              <div className="p-6 pb-4 text-center border-b border-gray-100">
                <DialogHeader>
                  <div className="mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      Subscribe to {selectedPlan.name}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-sm text-gray-500">
                    {selectedPlan.price}{selectedPlan.period} &middot; Cancel anytime
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Plan Summary */}
              <div className="px-6 pt-5 pb-4">
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">{selectedPlan.name} Plan</span>
                    <span className="text-sm font-bold text-gray-900">{selectedPlan.price}{selectedPlan.period}</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedPlan.features.slice(0, 3).map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </div>
                    ))}
                    {selectedPlan.features.length > 3 && (
                      <p className="text-xs text-gray-400 pl-5">
                        +{selectedPlan.features.length - 3} more features
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method Selection */}
                <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wider">Payment Method</p>
                <div className="space-y-2.5 mb-5">
                  {/* PayPal Option */}
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                      paymentMethod === "paypal"
                        ? "border-gray-900 bg-gray-50/80 ring-1 ring-gray-900"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "paypal" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {paymentMethod === "paypal" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-[#003087]">
                        <path fill="currentColor" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.652 1.862 1.217 4.812-.587 7.623-1.87 2.912-5.062 4.63-8.542 4.63H9.4l-.878 5.56a.639.639 0 0 1-.633.54H4.97l-.292 1.849a.64.64 0 0 0 .633.74h3.238a.641.641 0 0 0 .633-.54l.793-5.025a1.067 1.067 0 0 1 1.051-.9h1.454c4.3 0 7.664-1.748 8.647-6.798.03-.149.055-.293.077-.437.336-2.132.215-3.74-.897-4.7z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">PayPal</span>
                    </div>
                    <span className="text-xs text-gray-400">Instant</span>
                  </button>

                  {/* Bank Transfer Option */}
                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                      paymentMethod === "bank"
                        ? "border-gray-900 bg-gray-50/80 ring-1 ring-gray-900"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "bank" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {paymentMethod === "bank" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                    </div>
                    <span className="text-xs text-gray-400">1-3 days</span>
                  </button>
                </div>

                {/* Payment Details */}
                {paymentMethod === "paypal" ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        window.open("https://www.paypal.com", "_blank");
                      }}
                      className="w-full h-12 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium text-sm transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="mr-2" fill="white">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.652 1.862 1.217 4.812-.587 7.623-1.87 2.912-5.062 4.63-8.542 4.63H9.4l-.878 5.56a.639.639 0 0 1-.633.54H4.97l-.292 1.849a.64.64 0 0 0 .633.74h3.238a.641.641 0 0 0 .633-.54l.793-5.025a1.067 1.067 0 0 1 1.051-.9h1.454c4.3 0 7.664-1.748 8.647-6.798.03-.149.055-.293.077-.437.336-2.132.215-3.74-.897-4.7z"/>
                      </svg>
                      Pay with PayPal
                    </Button>
                    <p className="text-[11px] text-center text-gray-400">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                      <p className="text-xs font-medium text-gray-700 mb-2">Bank Transfer Details</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Bank</span>
                          <span className="text-gray-700 font-medium">Raiffeisen Bank</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">IBAN</span>
                          <span className="text-gray-700 font-mono text-[11px] font-medium">AL35 2021 1109 0000 0000 1234 5678</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Amount</span>
                          <span className="text-gray-700 font-medium">{selectedPlan.price}/month</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Reference</span>
                          <span className="text-gray-700 font-mono text-[11px] font-medium">ALT-{selectedPlan.name.toUpperCase().replace(" ", "-")}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-center text-gray-400">
                      Your subscription will be activated within 1-3 business days after payment is confirmed.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 pt-2">
                <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                    Secure
                  </div>
                  <span className="text-gray-200">|</span>
                  <span>Cancel anytime</span>
                  <span className="text-gray-200">|</span>
                  <span>No hidden fees</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
