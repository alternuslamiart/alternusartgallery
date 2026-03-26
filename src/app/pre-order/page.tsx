"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import { paintings } from "@/lib/paintings";

export default function PreOrderPage() {
  const { formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [notifyEmails, setNotifyEmails] = useState<{ [key: string]: string }>({});
  const [notifiedArtworks, setNotifiedArtworks] = useState<string[]>([]);

  const preOrderPaintings = paintings.filter((p) => p.isPreOrder);

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getDaysUntilRelease = (dateString: string) => {
    const releaseDate = new Date(dateString);
    const today = new Date();
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleNotifyMe = (paintingId: string) => {
    const email = notifyEmails[paintingId];
    if (email) {
      setNotifiedArtworks([...notifiedArtworks, paintingId]);
      // In production, this would send to backend
      setTimeout(() => {
        setNotifyEmails({ ...notifyEmails, [paintingId]: "" });
      }, 2000);
    }
  };

  const calculatePreOrderPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  return (
    <div className="py-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pre-Order" }]} />

        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="inline-block mb-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-1">
              Exclusive Pre-Orders
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Artworks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Be the first to own these exclusive pieces. Pre-order now and enjoy special early-bird pricing.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Exclusive Access</h3>
            <p className="text-sm text-muted-foreground">
              Be among the first to own these limited-edition artworks
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Special Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Save 10-25% with exclusive pre-order discounts
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Investment Value</h3>
            <p className="text-sm text-muted-foreground">
              Pre-order prices locked in before market release
            </p>
          </div>
        </div>

        {/* Pre-Order Artworks Grid */}
        {preOrderPaintings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Pre-Orders Available</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for exclusive early access to upcoming artworks
            </p>
            <Button asChild>
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {preOrderPaintings.map((painting) => {
              const daysUntilRelease = getDaysUntilRelease(painting.preOrderReleaseDate!);
              const preOrderPrice = calculatePreOrderPrice(painting.price, painting.preOrderDiscount);
              const isNotified = notifiedArtworks.includes(painting.id);

              return (
                <div
                  key={painting.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                >
                  <Link href={`/gallery/${painting.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        src={painting.image}
                        alt={painting.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Pre-Order Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          Pre-Order
                        </Badge>
                      </div>

                      {/* Discount Badge */}
                      {painting.preOrderDiscount && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive" className="bg-red-500">
                            -{painting.preOrderDiscount}%
                          </Badge>
                        </div>
                      )}

                      {/* Countdown */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                        <p className="text-white text-xs font-semibold">
                          {daysUntilRelease > 0
                            ? `Releases in ${daysUntilRelease} days`
                            : "Releasing Soon"}
                        </p>
                      </div>

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isInWishlist(painting.id)) {
                            removeFromWishlist(painting.id);
                          } else {
                            addToWishlist(painting);
                          }
                        }}
                        className="absolute top-14 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={isInWishlist(painting.id) ? "red" : "none"}
                          stroke={isInWishlist(painting.id) ? "red" : "currentColor"}
                          strokeWidth="2"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link href={`/gallery/${painting.id}`}>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {painting.title}
                      </h3>
                    </Link>

                    {painting.artist && (
                      <p className="text-sm text-muted-foreground mb-2">by {painting.artist}</p>
                    )}

                    <p className="text-sm text-gray-500 mb-1">{painting.medium}</p>
                    <p className="text-sm text-gray-500 mb-3">{painting.dimensions}</p>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(preOrderPrice)}
                        </span>
                        {painting.preOrderDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(painting.price)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Release Date: {formatReleaseDate(painting.preOrderReleaseDate!)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => addToCart(painting)}
                      >
                        Pre-Order Now
                      </Button>

                      {!isNotified ? (
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Email for notification"
                            value={notifyEmails[painting.id] || ""}
                            onChange={(e) =>
                              setNotifyEmails({ ...notifyEmails, [painting.id]: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNotifyMe(painting.id)}
                            disabled={!notifyEmails[painting.id]}
                          >
                            Notify
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-green-700 font-semibold flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            You&apos;ll be notified on release
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Pre-Order FAQs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">When will I receive my artwork?</h3>
              <p className="text-sm text-muted-foreground">
                Artworks will ship on or before the release date shown. You&apos;ll receive tracking information via email.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my pre-order?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, pre-orders can be cancelled up to 7 days before the release date for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is the discount permanent?</h3>
              <p className="text-sm text-muted-foreground">
                Pre-order discounts are exclusive to early buyers. Prices will increase to full retail after release.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Are certificates included?</h3>
              <p className="text-sm text-muted-foreground">
                All pre-order artworks include certificates of authenticity signed by the artist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
