"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, useLanguage } from "@/components/providers";
import { Separator } from "@/components/ui/separator";

export function CartModal() {
  const { isOpen, setIsOpen, items, removeFromCart } = useCart();
  const { formatPrice } = useLanguage();

  const subtotal = items.reduce((sum, item) => sum + (item.painting.price * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal >= 2160 ? 0 : 160) : 0;
  const tax = subtotal * 0.20; // 20% VAT
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    setIsOpen(false);
    // Navigation to checkout will happen via Link
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Looks like you haven&apos;t added any artworks yet.
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.painting.id} className="flex gap-4 group">
                    {/* Image */}
                    <div className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.painting.image}
                        alt={item.painting.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/gallery/${item.painting.id}`}
                            onClick={() => setIsOpen(false)}
                            className="font-medium hover:underline line-clamp-1"
                          >
                            {item.painting.title}
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.painting.medium}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.painting.dimensions}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.painting.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Qty:</span>
                          <span className="text-sm font-medium">
                            {item.quantity}
                          </span>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.painting.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-3 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (20%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              {subtotal > 0 && subtotal < 2160 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Free shipping</span> on orders over {formatPrice(2160)}!
                    Add {formatPrice(2160 - subtotal)} more to qualify.
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button asChild className="w-full" size="lg" onClick={handleCheckout}>
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/gallery">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
