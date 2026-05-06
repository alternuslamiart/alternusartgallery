"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage, useCart } from "@/components/providers";
import { PayPalPaymentButton } from "@/components/checkout/PayPalPaymentButton";
import { ShieldCheck, Truck, RotateCcw, User, MapPin, CreditCard, ArrowRight, ArrowLeft, Check, Copy, Building2, Mail } from "lucide-react";

// Bank details configuration
const bankDetails = {
  bankName: "Raiffeisen Bank",
  accountHolder: "Cerevix Art Gallery",
  iban: "AL35 2021 1109 0000 0000 1234 5678",
  bic: "SGSBALTX",
};

type PaymentMethod = "paypal" | "bank";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    clearCart();
    setStep(3);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Empty cart
  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">{t("emptyCart")}</h1>
          <p className="text-muted-foreground mb-8">Add some artworks to your cart to proceed with checkout.</p>
          <Button asChild size="lg" className="h-12 rounded-xl bg-gray-900 hover:bg-gray-800">
            <Link href="/gallery">{t("viewGallery")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Order Summary Component (reused in steps 1 and 2)
  const OrderSummary = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
      <h3 className="font-semibold text-gray-900 mb-4">{t("orderSummary")}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.painting.id} className="flex gap-3">
            <div className="relative w-14 h-18 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={item.painting.image} alt={item.painting.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{item.painting.title}</p>
              <p className="text-xs text-muted-foreground">{item.painting.medium}</p>
              <p className="font-semibold text-sm mt-1">{formatPrice(item.painting.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          {shipping === 0 ? (
            <span className="text-emerald-600 font-medium">Free</span>
          ) : (
            <span>{formatPrice(shipping)}</span>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-lg font-bold">
        <span>{t("total")}</span>
        <span>{formatPrice(total)}</span>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 space-y-3">
        {[
          { icon: ShieldCheck, label: "Secure Payment", desc: "PayPal Buyer Protection", color: "text-emerald-600 bg-emerald-50" },
          { icon: Truck, label: "Worldwide Shipping", desc: "Insured & tracked delivery", color: "text-blue-600 bg-blue-50" },
          { icon: RotateCcw, label: "14-Day Returns", desc: "Money back guarantee", color: "text-violet-600 bg-violet-50" },
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${badge.color}`}>
              <badge.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accepted Payment */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">We accept</p>
        <div className="flex gap-2 items-center">
          {/* PayPal Logo */}
          <div className="px-3 py-1.5 bg-[#FFC439] rounded-lg">
            <span className="text-[#003087] text-xs font-bold">Pay</span>
            <span className="text-[#009CDE] text-xs font-bold">Pal</span>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
            <span className="text-xs font-medium text-gray-600">Bank Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center">
              {[
                { num: 1, label: t("customerDetails") },
                { num: 2, label: "Payment" },
                { num: 3, label: t("orderConfirmation") },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      step > s.num
                        ? "bg-emerald-500 text-white shadow-sm"
                        : step === s.num
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                    </div>
                    <span className={`text-xs mt-2 ${step >= s.num ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`w-16 md:w-24 h-0.5 mx-3 mb-6 transition-colors ${
                      step > s.num ? "bg-emerald-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold flex items-center gap-2.5 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    {t("customerDetails")}
                  </h2>

                  <form onSubmit={handleSubmitDetails} className="space-y-5">
                    {paymentError && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                        {paymentError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="firstName" className="text-xs font-medium text-gray-600">{t("firstName")} *</label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="lastName" className="text-xs font-medium text-gray-600">{t("lastName")} *</label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-medium text-gray-600">{t("email")} *</label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-medium text-gray-600">{t("phone")} *</label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                    </div>

                    <Separator />

                    <h3 className="font-medium flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {t("shippingAddress")}
                    </h3>

                    <div className="space-y-1.5">
                      <label htmlFor="address" className="text-xs font-medium text-gray-600">{t("address")} *</label>
                      <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="city" className="text-xs font-medium text-gray-600">{t("city")} *</label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="postalCode" className="text-xs font-medium text-gray-600">{t("postalCode")} *</label>
                        <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="country" className="text-xs font-medium text-gray-600">{t("country")} *</label>
                        <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400" />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium" disabled={isCreatingOrder}>
                      {isCreatingOrder ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Order...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {t("proceedToPayment")}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              <div><OrderSummary /></div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && orderData && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                  <h2 className="text-xl font-semibold flex items-center gap-2.5 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    Payment Method
                  </h2>

                  {/* Order Info */}
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Order Number</p>
                      <p className="font-mono font-bold text-lg">{orderData.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg">{formatPrice(orderData.total)}</p>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6">
                      {paymentError}
                      <button onClick={() => setPaymentError(null)} className="ml-2 underline font-medium">Dismiss</button>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "paypal"
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[#003087] text-lg font-bold">Pay</span>
                        <span className="text-[#009CDE] text-lg font-bold">Pal</span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">Secure Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === "bank"
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Bank Transfer</span>
                    </button>
                  </div>

                  <Separator className="mb-6" />

                  {/* PayPal Payment */}
                  {paymentMethod === "paypal" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">PayPal Buyer Protection</p>
                          <p className="text-xs text-blue-700 mt-0.5">Your purchase is protected. If there&apos;s an issue, PayPal has you covered.</p>
                        </div>
                      </div>

                      <PayPalPaymentButton
                        orderId={orderData.id}
                        amount={orderData.total}
                        currency={orderData.currency}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {paymentMethod === "bank" && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h4 className="font-medium text-sm">Bank Transfer Details</h4>
                        <div className="space-y-2.5 text-sm">
                          {[
                            { label: "Bank Name", value: bankDetails.bankName, field: "" },
                            { label: "Account Holder", value: bankDetails.accountHolder, field: "" },
                            { label: "IBAN", value: bankDetails.iban, field: "iban", mono: true },
                            { label: "BIC/SWIFT", value: bankDetails.bic, field: "bic", mono: true },
                            { label: "Reference", value: orderData.orderNumber, field: "ref", mono: true, bold: true },
                          ].map((item) => (
                            <div key={item.label} className={`flex justify-between items-center ${item.label === "Reference" ? "pt-2 border-t" : ""}`}>
                              <span className="text-muted-foreground text-xs">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`${item.mono ? "font-mono text-xs" : ""} ${item.bold ? "font-bold" : "font-medium"}`}>{item.value}</span>
                                {item.field && (
                                  <button onClick={() => copyToClipboard(item.value, item.field)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                                    {copiedField === item.field ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 flex-shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        <p className="text-xs text-amber-800">
                          Please include order number <strong>{orderData.orderNumber}</strong> in the payment reference. Your order will be processed once payment is received.
                        </p>
                      </div>

                      <Button onClick={handleBankTransferConfirm} className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800">
                        I&apos;ve Made the Transfer
                        <Check className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Details
                  </button>
                </div>
              </div>

              <div><OrderSummary /></div>
            </div>
          )}

          {/* Step 3: Order Confirmation (Bank Transfer) */}
          {step === 3 && orderData && (
            <div className="max-w-3xl mx-auto">
              {/* Success Header */}
              <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-10 mb-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-500" strokeWidth={3} />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{t("orderConfirmation")}</h1>
                  <p className="text-white/80">{t("orderConfirmationDesc")}</p>
                </div>
              </div>

              {/* Order Number */}
              <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-white text-center">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{t("orderNumber")}</p>
                <p className="text-3xl font-bold font-mono tracking-wider mb-4">{orderData.orderNumber}</p>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Pending Payment
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-white rounded-2xl border p-8 mb-8">
                <h3 className="text-lg font-semibold mb-6">What happens next?</h3>
                <div className="space-y-6">
                  {[
                    { num: 1, title: "Complete the bank transfer", desc: `Transfer ${formatPrice(orderData.total)} using the bank details provided. Include order number ${orderData.orderNumber} in the reference.`, color: "from-emerald-500 to-teal-500" },
                    { num: 2, title: "Payment confirmation", desc: "Once we receive your payment, we'll send you a confirmation email with all the details.", color: "from-blue-500 to-indigo-500" },
                    { num: 3, title: "Shipping", desc: "Your artwork will be carefully packaged and shipped with tracking information.", color: "from-violet-500 to-purple-500" },
                  ].map((item, i) => (
                    <div key={item.num} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {item.num}
                        </div>
                        {i < 2 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium mb-1">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Questions about your order?</p>
                  <p className="font-semibold">info@alternusart.com</p>
                </div>
                <Button variant="outline" className="ml-auto rounded-xl" asChild>
                  <Link href="/support">Contact Us</Link>
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-gray-800">
                  <Link href="/gallery">
                    {t("continueShopping")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1 h-12 rounded-xl">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
