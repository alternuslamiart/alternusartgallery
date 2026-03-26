"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function GiftCardsPage() {
  const { formatPrice } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("modern");
  const [isPurchased, setIsPurchased] = useState(false);

  const presetAmounts = [50, 100, 250, 500, 1000];
  const designs = [
    { id: "classic", name: "Classic", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800" },
    { id: "modern", name: "Modern", image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800" },
    { id: "elegant", name: "Elegant", image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800" },
  ];

  const currentDesign = designs.find(d => d.id === selectedDesign) || designs[1];

  if (isPurchased) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="container max-w-2xl text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Gift Card Purchased!</h1>
            <p className="text-gray-600 mb-2">Your gift card has been sent to</p>
            <p className="text-lg font-semibold text-primary mb-8">{recipientEmail}</p>
            <Button onClick={() => window.location.href = "/"} size="lg">Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Give the Gift of Art</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gift Cards</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The perfect present for art lovers. Let them choose their favorite masterpiece.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gift Cards" }]} />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-8">
          {/* Gift Card Preview */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-24">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Card Preview</h2>

              {/* Gift Card - Credit Card Style */}
              <div className="relative perspective-1000">
                {/* Card Shadow */}
                <div className="absolute inset-0 bg-gray-900/20 rounded-3xl blur-2xl transform translate-y-4 scale-95"></div>

                {/* Main Card */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1.586/1' }}>
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0">
                    <Image
                      src={currentDesign.image}
                      alt={currentDesign.name}
                      fill
                      className="object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
                    {/* Top Row */}
                    <div className="flex items-start justify-between">
                      {/* Logo */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <span className="text-white font-bold text-lg">A</span>
                          </div>
                        </div>
                        <p className="text-white font-semibold tracking-wide">Alternus</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Art Gallery</p>
                      </div>

                      {/* Gift Icon & Badge */}
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <rect x="3" y="8" width="18" height="4" rx="1"/>
                            <path d="M12 8v13"/>
                            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
                            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
                          </svg>
                          <span className="text-white text-xs font-medium">GIFT CARD</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Amount */}
                    <div className="text-center py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Card Value</p>
                      <p className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                        {formatPrice(selectedAmount)}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="space-y-3">
                      {/* To/From */}
                      <div className="flex justify-between items-end text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">To</p>
                          <p className="text-white font-medium">{recipientName || "Recipient Name"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">From</p>
                          <p className="text-white font-medium">{senderName || "Your Name"}</p>
                        </div>
                      </div>

                      {/* Personal Message */}
                      {personalMessage && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-gray-400 text-xs italic line-clamp-2">&ldquo;{personalMessage}&rdquo;</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <p className="text-[10px] text-gray-500">Valid for 12 months</p>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-sm"></div>
                          <div className="w-6 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-sm opacity-60"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                This is how your gift card will appear
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="order-1 lg:order-2">
            <form onSubmit={(e) => { e.preventDefault(); setIsPurchased(true); }} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block font-semibold mb-3 text-gray-900">Select Amount</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`p-3 md:p-4 rounded-xl border-2 font-bold transition-all duration-200 ${
                        selectedAmount === amt
                          ? "border-gray-900 bg-gray-900 text-white shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {formatPrice(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Selection */}
              <div>
                <label className="block font-semibold mb-3 text-gray-900">Choose Background</label>
                <div className="grid grid-cols-3 gap-3">
                  {designs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDesign(d.id)}
                      className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedDesign === d.id
                          ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="relative aspect-video">
                        <Image src={d.image} alt={d.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gray-900/40"></div>
                      </div>
                      <p className="text-sm font-medium p-2 bg-gray-50">{d.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Recipient Details</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                />
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Recipient Email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                />
              </div>

              {/* Sender Details */}
              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Your Details</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                />
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal message (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all resize-none"
                />
              </div>

              {/* Total & Submit */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(selectedAmount)}
                  </span>
                </div>
                <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 shadow-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect x="3" y="8" width="18" height="4" rx="1"/>
                    <path d="M12 8v13"/>
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
                  </svg>
                  Purchase Gift Card
                </Button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  Gift card will be sent instantly via email
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
