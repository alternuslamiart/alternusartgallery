"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers";

interface OrderDetails {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    artwork: {
      title: string;
      primaryImage: string;
    };
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { t, formatPrice } = useLanguage();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order");
        }

        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-gray-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "We couldn't find your order. Please check your order number or contact support."}
          </p>
          <Button asChild size="lg">
            <Link href="/gallery">{t("viewGallery")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPaymentComplete = order.paymentStatus === "COMPLETED";

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-10 mb-8 text-white text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative z-10">
            {/* Animated Checkmark */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {isPaymentComplete ? "Payment Successful!" : t("orderConfirmation")}
            </h1>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              {isPaymentComplete
                ? "Thank you for your purchase. Your order is being processed."
                : t("orderConfirmationDesc")}
            </p>
          </div>
        </div>

        {/* Order Number Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/50"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" />
              </svg>
              <p className="text-white/50 text-sm uppercase tracking-wider">
                {t("orderNumber")}
              </p>
            </div>
            <p className="text-4xl font-bold font-mono tracking-wider mb-4">
              {order.orderNumber}
            </p>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isPaymentComplete
                  ? "bg-green-500/20 text-green-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPaymentComplete ? "bg-green-400" : "bg-amber-400 animate-pulse"
                }`}
              />
              {isPaymentComplete ? "Payment Confirmed" : "Processing"}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl border p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            Order Details
          </h3>

          <div className="space-y-4">
            {/* Items */}
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.artwork?.primaryImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.artwork.primaryImage}
                      alt={item.title || item.artwork.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title || item.artwork?.title}</p>
                  <p className="text-sm text-muted-foreground">Original Artwork</p>
                </div>
                <p className="font-semibold">{formatPrice(item.price)}</p>
              </div>
            ))}

            {/* Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t("total")}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Paid via{" "}
                {order.paymentMethod === "stripe"
                  ? "Credit Card"
                  : order.paymentMethod === "paypal"
                  ? "PayPal"
                  : "Bank Transfer"}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-3xl border p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-600"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              Shipping Address
            </h3>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.address}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-white rounded-3xl border p-8 mb-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            What happens next?
          </h3>

          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div className="w-0.5 h-full bg-gray-200 mt-3" />
              </div>
              <div className="pb-6 flex-1">
                <p className="font-semibold text-lg mb-1">Payment Received</p>
                <p className="text-gray-500">
                  Your payment has been confirmed. We&apos;re preparing your order.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                  2
                </div>
                <div className="w-0.5 h-full bg-gray-200 mt-3" />
              </div>
              <div className="pb-6 flex-1">
                <p className="font-semibold text-lg mb-1">Careful Packaging</p>
                <p className="text-gray-500">
                  Your artwork will be professionally packaged with museum-quality materials.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                  3
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">Shipping & Tracking</p>
                <p className="text-gray-500">
                  You&apos;ll receive tracking information via email once your order ships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions about your order?</p>
              <p className="font-semibold text-lg">info@alternusart.com</p>
            </div>
            <Button variant="outline" className="ml-auto" asChild>
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            size="lg"
            className="flex-1 h-14 text-base bg-black hover:bg-gray-800"
          >
            <Link href="/gallery">
              {t("continueShopping")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-2"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 h-14 text-base">
            <Link href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
