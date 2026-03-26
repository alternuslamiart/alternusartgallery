"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, useLanguage } from "@/components/providers";

export function CartDrawer() {
  const { items, removeFromCart, total, isOpen, setIsOpen } = useCart();
  const { t, formatPrice } = useLanguage();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{t("cart")}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground mb-4"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <p className="text-muted-foreground mb-6">{t("emptyCart")}</p>
            <Button onClick={handleClose} asChild>
              <Link href="/gallery">{t("continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.painting.id} className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.painting.image}
                        alt={item.painting.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.painting.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.painting.medium}</p>
                      <p className="text-sm text-muted-foreground">{item.painting.dimensions}</p>
                      {item.frame && item.frame.id !== "none" && (
                        <p className="text-sm text-primary font-medium">+ {item.frame.label}</p>
                      )}
                      <p className="font-bold mt-1">{formatPrice(item.painting.price + (item.frame?.price || 0))}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.painting.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{t("total")}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout" onClick={handleClose}>
                  {t("checkout")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
                asChild
              >
                <Link href="/gallery">{t("continueShopping")}</Link>
              </Button>

              {/* Payment Methods */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center mb-3">Secure Payment Methods</p>
                <div className="flex justify-center items-center gap-4">
                  {/* Visa */}
                  <div className="bg-white border rounded px-3 py-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 256 83">
                      <path fill="#1434CB" d="M97.2 0L82.6 55.6l-14-43c-2.8-8.5-7.4-12.6-14.3-12.6H22.5L22 2.8C35.3 5.6 47.1 11 55.8 17.4l15.6 65.4h20.4L117.7 0H97.2zm29 0L106 82.8h19.4L145.6 0h-19.4zm100.5 0L207 53.3 193.4 5.2c-1.8-3.5-4.6-5.2-8.5-5.2H145v2.8c18.3 4.2 30.5 11.8 38.6 20.4l18.5 59.6h20.6l31.4-82.8h-19.4zm-52.3 16.2c3.5-4.2 9.6-7.8 17.6-7.8l9.6.4l3.5-18C197 7.8 186.6 5.6 176.6 5.6c-19 0-32.3 10-32.3 24.2 0 10.7 9.6 16.6 17 20.2 7.4 3.5 10 5.8 10 9-.1 4.8-6 7-11.5 7-9.8 0-14.8-1.5-22.6-5l-3.2-1.5-3.5 21c5.6 2.5 16 4.8 26.8 4.8 20.2.1 33.4-10 33.4-25 0-8.3-5-14.6-16.2-20-6.8-3.5-11-5.8-11-9.2z"/>
                    </svg>
                  </div>
                  {/* MasterCard */}
                  <div className="bg-white border rounded px-3 py-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 256 199">
                      <path fill="#FF5F00" d="M93.3 16.4h69.4v166.3H93.3z"/>
                      <path fill="#EB001B" d="M97.4 99.5c0-33.8 15.8-63.8 40.6-83.1C123.7 6.2 106.2 0 87.3 0 39.1 0 0 44.6 0 99.5S39.1 199 87.3 199c18.9 0 36.4-6.2 50.7-16.4-24.8-19.3-40.6-49.3-40.6-83.1z"/>
                      <path fill="#F79E1B" d="M256 99.5c0 54.9-39.1 99.5-87.3 99.5-18.9 0-36.4-6.2-50.7-16.4 24.8-19.3 40.6-49.3 40.6-83.1 0-33.8-15.8-63.8-40.6-83.1C131.3 6.2 148.8 0 168.7 0 216.9 0 256 44.6 256 99.5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
