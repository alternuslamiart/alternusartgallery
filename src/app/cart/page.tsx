"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, useLanguage } from "@/components/providers";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { formatPrice } = useLanguage();

  const subtotal = items.reduce((sum, item) => sum + ((item.painting.price + (item.frame?.price || 0)) * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const tax = subtotal * 0.20; // 20% VAT
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-muted/30 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {items.length === 0
              ? "Your cart is empty"
              : `${items.length} ${items.length === 1 ? "item" : "items"} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Discover beautiful artworks from talented artists around the world. Start adding pieces to your collection today.
              </p>
              <Button asChild size="lg">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold">Cart Items</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-sm text-muted-foreground hover:text-destructive"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.painting.id}>
                        <div className="flex gap-4">
                          {/* Image */}
                          <Link
                            href={`/gallery/${item.painting.id}`}
                            className="relative w-24 h-32 sm:w-32 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted group"
                          >
                            <Image
                              src={item.painting.image}
                              alt={item.painting.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/gallery/${item.painting.id}`}
                                  className="font-semibold text-base sm:text-lg hover:underline line-clamp-2"
                                >
                                  {item.painting.title}
                                </Link>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                  {item.painting.medium}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {item.painting.dimensions}
                                </p>
                                {item.frame && item.frame.id !== "none" && (
                                  <p className="text-xs sm:text-sm text-primary font-medium mt-1">
                                    + {item.frame.label} (+{formatPrice(item.frame.price)})
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.painting.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </button>
                            </div>

                            {/* Quantity & Price */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs sm:text-sm text-muted-foreground">Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (item.quantity === 1) {
                                        removeFromCart(item.painting.id);
                                      } else {
                                        updateQuantity(item.painting.id, item.quantity - 1);
                                      }
                                    }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border hover:bg-muted flex items-center justify-center transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.painting.id, item.quantity + 1)}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border hover:bg-muted flex items-center justify-center transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <p className="text-lg sm:text-xl font-bold">
                                {formatPrice((item.painting.price + (item.frame?.price || 0)) * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Continue Shopping */}
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/gallery">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600 font-semibold">FREE</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (20% VAT)</span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>

                    {subtotal > 0 && subtotal < 100 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 mt-0.5 flex-shrink-0">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          </svg>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            <span className="font-semibold">Free shipping</span> on orders over {formatPrice(100)}!
                            Add <span className="font-semibold">{formatPrice(100 - subtotal)}</span> more to qualify.
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-baseline">
                      <span className="text-base sm:text-lg font-semibold">Total</span>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold">{formatPrice(total)}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Including VAT</p>
                      </div>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link href="/checkout">
                        Proceed to Checkout
                      </Link>
                    </Button>

                    <div className="pt-4 space-y-3 border-t">
                      <p className="text-xs text-muted-foreground font-medium">We accept:</p>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-muted rounded flex items-center justify-center">
                          <svg className="h-4" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="#252525" height="24" rx="4" width="38"/>
                            <path d="M23 12.5c0 3.6-2.9 6.5-6.5 6.5S10 16.1 10 12.5 12.9 6 16.5 6s6.5 2.9 6.5 6.5z" fill="#EB001B"/>
                            <path d="M28 12.5c0 3.6-2.9 6.5-6.5 6.5-1.4 0-2.7-.4-3.8-1.2 1.7-1.3 2.8-3.4 2.8-5.8s-1.1-4.5-2.8-5.8c1.1-.8 2.4-1.2 3.8-1.2 3.6 0 6.5 2.9 6.5 6.5z" fill="#F79E1B"/>
                          </svg>
                        </div>
                        <div className="px-3 py-2 bg-muted rounded flex items-center justify-center">
                          <svg className="h-4" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 28c-5.5 0-10-4.5-10-10S18.5 8 24 8s10 4.5 10 10-4.5 10-10 10z" fill="#1434CB"/>
                            <path d="M44 18c0-5.5-4.5-10-10-10-2.2 0-4.2.7-5.9 1.9 2.5 2.2 4.1 5.4 4.1 9.1s-1.6 6.9-4.1 9.1c1.7 1.2 3.7 1.9 5.9 1.9 5.5 0 10-4.5 10-10z" fill="#EB001B"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
