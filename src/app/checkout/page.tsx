"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage, useCart } from "@/components/providers";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";

// Bank details configuration
const bankDetails = {
  bankName: "Raiffeisen Bank",
  accountHolder: "Alternus Art Gallery",
  iban: "AL35 2021 1109 0000 0000 1234 5678",
  bic: "SGSBALTX",
};

type PaymentMethod = "card" | "bank";

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { t, formatPrice } = useLanguage();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Temporarily disable checkout - payment processing not available
  const checkoutDisabled = true;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.painting.price * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal >= 2160 ? 0 : 160) : 0;
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingOrder(true);
    setPaymentError(null);

    try {
      // Create order in the database
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestEmail: formData.email,
          items: items.map((item) => ({
            artworkId: item.painting.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
          currency: "EUR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setOrderData({
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        total: data.order.total,
        currency: data.order.currency,
      });
      setStep(2);
    } catch (error) {
      console.error("Error creating order:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Failed to create order. Please try again."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleBankTransferConfirm = () => {
    // For bank transfer, just show confirmation - payment will be verified manually
    clearCart();
    setStep(3);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto">
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
            className="mx-auto text-muted-foreground mb-4"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">{t("emptyCart")}</h1>
          <p className="text-muted-foreground mb-6">Add some artworks to your cart to proceed with checkout.</p>
          <Button asChild size="lg">
            <Link href="/gallery">{t("viewGallery")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show coming soon message if checkout is disabled
  if (checkoutDisabled) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Checkout Coming Soon</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;re currently setting up our payment system. Online checkout will be available soon.
          </p>
          <p className="text-muted-foreground mb-8">
            In the meantime, please contact us directly to purchase artworks:
          </p>
          <a
            href="mailto:contact@alternusart.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            contact@alternusart.com
          </a>
          <div className="mt-8">
            <Link href="/gallery" className="text-primary hover:underline">
              ← Continue browsing artworks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? (
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
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3 gap-8 md:gap-16 text-sm">
            <span className={step >= 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
              {t("customerDetails")}
            </span>
            <span className={step >= 2 ? "text-foreground font-medium" : "text-muted-foreground"}>
              Payment
            </span>
            <span className={step >= 3 ? "text-foreground font-medium" : "text-muted-foreground"}>
              {t("orderConfirmation")}
            </span>
          </div>
        </div>

        {/* Step 1: Customer Details */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {t("customerDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitDetails} className="space-y-5">
                    {paymentError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {paymentError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">
                          {t("firstName")} *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">
                          {t("lastName")} *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          {t("email")} *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          {t("phone")} *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <Separator />

                    <h3 className="font-medium flex items-center gap-2">
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
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {t("shippingAddress")}
                    </h3>

                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium">
                        {t("address")} *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium">
                          {t("city")} *
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="postalCode" className="text-sm font-medium">
                          {t("postalCode")} *
                        </label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="country" className="text-sm font-medium">
                          {t("country")} *
                        </label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isCreatingOrder}>
                      {isCreatingOrder ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Order...
                        </span>
                      ) : (
                        <>
                          {t("proceedToPayment")}
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
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.painting.id} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.painting.image}
                          alt={item.painting.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.painting.title}</p>
                        <p className="text-xs text-muted-foreground">{item.painting.medium}</p>
                        <p className="font-semibold text-sm mt-1">{formatPrice(item.painting.price)}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>{formatPrice(shipping)}</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <Separator />

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
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
                          className="text-green-600"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-xs">Secure Payment</p>
                        <p className="text-muted-foreground text-[10px]">256-bit SSL encryption</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
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
                          className="text-blue-600"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-xs">14-Day Returns</p>
                        <p className="text-muted-foreground text-[10px]">Money back guarantee</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === 2 && orderData && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Number Display */}
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-mono font-bold text-lg">{orderData.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg">{formatPrice(orderData.total)}</p>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {paymentError}
                      <button
                        onClick={() => setPaymentError(null)}
                        className="ml-2 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Credit/Debit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex gap-1">
                        {/* Visa */}
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                          <path d="M13.6 13.5H11.5L12.9 6.5H15L13.6 13.5Z" fill="white"/>
                          <path d="M20.5 6.7C20.1 6.5 19.4 6.4 18.6 6.4C16.6 6.4 15.2 7.4 15.2 8.9C15.2 10 16.2 10.6 17 11C17.8 11.4 18.1 11.7 18.1 12.1C18.1 12.7 17.4 13 16.7 13C15.8 13 15.3 12.9 14.5 12.5L14.2 12.4L13.9 14.2C14.5 14.5 15.5 14.7 16.6 14.7C18.7 14.7 20.1 13.7 20.1 12.1C20.1 11.2 19.5 10.5 18.4 9.9C17.7 9.5 17.2 9.3 17.2 8.8C17.2 8.4 17.7 8 18.6 8C19.4 8 19.9 8.1 20.3 8.3L20.5 8.4L20.8 6.7H20.5Z" fill="white"/>
                          <path d="M23.5 6.5H22C21.5 6.5 21.2 6.7 21 7L18.2 13.5H20.3L20.7 12.3H23.2L23.5 13.5H25.4L23.5 6.5ZM21.3 10.7C21.5 10.2 22.2 8.4 22.2 8.4C22.2 8.4 22.4 7.9 22.5 7.6L22.7 8.3C22.7 8.3 23.1 10.1 23.2 10.7H21.3Z" fill="white"/>
                          <path d="M10.5 6.5L8.6 11.3L8.4 10.3C8 9.1 6.9 7.8 5.6 7.1L7.4 13.5H9.5L12.6 6.5H10.5Z" fill="white"/>
                          <path d="M7.2 6.5H4L4 6.7C6.5 7.3 8.2 8.8 8.8 10.6L8.1 7.1C8 6.7 7.7 6.5 7.2 6.5Z" fill="#F9A51A"/>
                        </svg>
                        {/* Mastercard */}
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#000"/>
                          <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                          <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                          <path d="M16 5.3C17.3 6.4 18 8.1 18 10C18 11.9 17.3 13.6 16 14.7C14.7 13.6 14 11.9 14 10C14 8.1 14.7 6.4 16 5.3Z" fill="#FF5F00"/>
                        </svg>
                      </div>
                      <span className="text-xs font-medium">Credit Card</span>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "bank"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <svg width="32" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" x2="21" y1="22" y2="22"/>
                        <line x1="6" x2="6" y1="18" y2="11"/>
                        <line x1="10" x2="10" y1="18" y2="11"/>
                        <line x1="14" x2="14" y1="18" y2="11"/>
                        <line x1="18" x2="18" y1="18" y2="11"/>
                        <polygon points="12 2 20 7 4 7"/>
                      </svg>
                      <span className="text-xs font-medium">Bank Transfer</span>
                    </button>
                  </div>

                  <Separator />

                  {/* Card Payment Form - Stripe */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <StripePaymentForm
                        orderId={orderData.id}
                        email={formData.email}
                        name={`${formData.firstName} ${formData.lastName}`}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}

                  {/* Bank Transfer Form */}
                  {paymentMethod === "bank" && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium">Bank Transfer Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Bank Name:</span>
                            <span className="font-medium">{bankDetails.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Account Holder:</span>
                            <span className="font-medium">{bankDetails.accountHolder}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">IBAN:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{bankDetails.iban}</span>
                              <button
                                onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedField === "iban" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <path d="M20 6 9 17l-5-5"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">BIC/SWIFT:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{bankDetails.bic}</span>
                              <button
                                onClick={() => copyToClipboard(bankDetails.bic, "bic")}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedField === "bic" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <path d="M20 6 9 17l-5-5"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-muted-foreground">Reference:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{orderData.orderNumber}</span>
                              <button
                                onClick={() => copyToClipboard(orderData.orderNumber, "ref")}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {copiedField === "ref" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <path d="M20 6 9 17l-5-5"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 flex-shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <p className="text-sm text-amber-800">
                            Please include order number <strong>{orderData.orderNumber}</strong> in the payment reference. Your order will be processed once payment is received.
                          </p>
                        </div>
                      </div>

                      <Button onClick={handleBankTransferConfirm} className="w-full" size="lg">
                        I&apos;ve Made the Transfer
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* Back Button */}
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Back to Details
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.painting.id} className="flex gap-3">
                      <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.painting.image}
                          alt={item.painting.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.painting.title}</p>
                        <p className="text-xs text-muted-foreground">{item.painting.medium}</p>
                        <p className="font-semibold text-sm mt-1">{formatPrice(item.painting.price)}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>{formatPrice(shipping)}</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  {/* Payment Methods Accepted */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">We accept</p>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 bg-gray-100 rounded">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                          <path d="M13.6 13.5H11.5L12.9 6.5H15L13.6 13.5Z" fill="white"/>
                          <path d="M20.5 6.7C20.1 6.5 19.4 6.4 18.6 6.4C16.6 6.4 15.2 7.4 15.2 8.9C15.2 10 16.2 10.6 17 11C17.8 11.4 18.1 11.7 18.1 12.1C18.1 12.7 17.4 13 16.7 13C15.8 13 15.3 12.9 14.5 12.5L14.2 12.4L13.9 14.2C14.5 14.5 15.5 14.7 16.6 14.7C18.7 14.7 20.1 13.7 20.1 12.1C20.1 11.2 19.5 10.5 18.4 9.9C17.7 9.5 17.2 9.3 17.2 8.8C17.2 8.4 17.7 8 18.6 8C19.4 8 19.9 8.1 20.3 8.3L20.5 8.4L20.8 6.7H20.5Z" fill="white"/>
                          <path d="M23.5 6.5H22C21.5 6.5 21.2 6.7 21 7L18.2 13.5H20.3L20.7 12.3H23.2L23.5 13.5H25.4L23.5 6.5ZM21.3 10.7C21.5 10.2 22.2 8.4 22.2 8.4L22.7 8.3C22.7 8.3 23.1 10.1 23.2 10.7H21.3Z" fill="white"/>
                          <path d="M10.5 6.5L8.6 11.3L8.4 10.3C8 9.1 6.9 7.8 5.6 7.1L7.4 13.5H9.5L12.6 6.5H10.5Z" fill="white"/>
                          <path d="M7.2 6.5H4V6.7C6.5 7.3 8.2 8.8 8.8 10.6L8.1 7.1C8 6.7 7.7 6.5 7.2 6.5Z" fill="#F9A51A"/>
                        </svg>
                      </div>
                      <div className="px-2 py-1 bg-gray-100 rounded">
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#000"/>
                          <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                          <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                          <path d="M16 5.3C17.3 6.4 18 8.1 18 10C18 11.9 17.3 13.6 16 14.7C14.7 13.6 14 11.9 14 10C14 8.1 14.7 6.4 16 5.3Z" fill="#FF5F00"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Order Confirmation (Bank Transfer) */}
        {step === 3 && orderData && (
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("orderConfirmation")}</h1>
                <p className="text-white/80 text-lg max-w-md mx-auto">{t("orderConfirmationDesc")}</p>
              </div>
            </div>

            {/* Order Number Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect width="8" height="4" x="8" y="2" rx="1" />
                  </svg>
                  <p className="text-white/50 text-sm uppercase tracking-wider">{t("orderNumber")}</p>
                </div>
                <p className="text-4xl font-bold font-mono tracking-wider mb-4">{orderData.orderNumber}</p>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Pending Payment
                </div>
              </div>
            </div>

            {/* What's Next Timeline */}
            <div className="bg-white rounded-3xl border p-8 mb-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                What happens next?
              </h3>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-3" />
                  </div>
                  <div className="pb-6 flex-1">
                    <p className="font-semibold text-lg mb-1">Complete the bank transfer</p>
                    <p className="text-gray-500">Transfer <span className="font-semibold text-gray-900">{formatPrice(orderData.total)}</span> using the bank details provided. Include order number <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{orderData.orderNumber}</span> in the reference.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-3" />
                  </div>
                  <div className="pb-6 flex-1">
                    <p className="font-semibold text-lg mb-1">Payment confirmation</p>
                    <p className="text-gray-500">Once we receive your payment, we&apos;ll send you a confirmation email with all the details.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">Shipping</p>
                    <p className="text-gray-500">Your artwork will be carefully packaged and shipped to your address. You&apos;ll receive tracking information via email.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
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
              <Button asChild size="lg" className="flex-1 h-14 text-base bg-black hover:bg-gray-800">
                <Link href="/gallery">
                  {t("continueShopping")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 h-14 text-base">
                <Link href="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
