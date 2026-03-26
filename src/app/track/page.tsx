"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Helper to generate tracking URL based on carrier
function getTrackingUrl(trackingNumber: string): { url: string; carrier: string } | null {
  if (!trackingNumber) return null;

  const upperTracking = trackingNumber.toUpperCase();

  // DHL - typically 10+ digits
  if (upperTracking.match(/^\d{10,}$/)) {
    return {
      url: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      carrier: "DHL",
    };
  }
  // UPS - starts with 1Z
  if (upperTracking.startsWith("1Z")) {
    return {
      url: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      carrier: "UPS",
    };
  }
  // FedEx - 12-15 digits
  if (upperTracking.match(/^\d{12,15}$/)) {
    return {
      url: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      carrier: "FedEx",
    };
  }

  // Generic tracking
  return {
    url: `https://track24.net/?code=${trackingNumber}`,
    carrier: "Carrier",
  };
}

// Generate tracking timeline based on order status and dates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTrackingTimeline(order: any) {
  const timeline: Array<{ date: string; status: string; description: string }> = [];

  // Order placed
  timeline.push({
    date: order.createdAt,
    status: "Order Placed",
    description: "Your order has been received",
  });

  // Payment confirmed (if paid)
  if (order.paymentStatus === "PAID" || order.paymentStatus === "COMPLETED") {
    timeline.push({
      date: order.createdAt,
      status: "Payment Confirmed",
      description: "Payment has been verified",
    });
  }

  // Processing
  if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      date: order.updatedAt,
      status: "Processing",
      description: "Your artwork is being carefully prepared",
    });
  }

  // Shipped
  if (order.shippedAt || order.status === "SHIPPED" || order.status === "DELIVERED") {
    timeline.push({
      date: order.shippedAt || order.updatedAt,
      status: "Shipped",
      description: order.trackingNumber
        ? `Your order is on the way. Tracking: ${order.trackingNumber}`
        : "Your order has been shipped",
    });
  }

  // Delivered
  if (order.deliveredAt || order.status === "DELIVERED") {
    timeline.push({
      date: order.deliveredAt || order.updatedAt,
      status: "Delivered",
      description: "Order delivered successfully",
    });
  }

  return timeline;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch order from API
  const fetchOrder = async (orderNum: string) => {
    setIsSearching(true);
    setError("");
    setOrder(null);

    const trimmedOrderNumber = orderNum.trim().toUpperCase();

    // Validate order number format (ALT-XXXXXXXX-XXXX)
    const orderPattern = /^ALT-[A-Z0-9]+-[A-Z0-9]+$/i;

    if (!orderPattern.test(trimmedOrderNumber)) {
      setError("Invalid order number format. Please use the format: ALT-XXXX-XXXX");
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(trimmedOrderNumber)}`);
      const data = await response.json();

      if (!response.ok || !data.order) {
        setError("Order not found. Please check your order number and try again.");
        setIsSearching(false);
        return;
      }

      const orderData = data.order;

      // Transform API response to display format
      const transformedOrder = {
        orderNumber: orderData.orderNumber,
        date: orderData.createdAt,
        status: orderData.status?.toLowerCase() || "pending",
        trackingNumber: orderData.trackingNumber,
        estimatedDelivery: orderData.estimatedDelivery,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: orderData.items?.map((item: any) => ({
          title: item.title || item.artwork?.title || "Artwork",
          price: Number(item.price),
          quantity: item.quantity || 1,
          image: item.artwork?.primaryImage || "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
        })) || [],
        total: Number(orderData.total) || 0,
        subtotal: Number(orderData.subtotal) || 0,
        shippingCost: Number(orderData.shippingCost) || 0,
        shipping: orderData.shippingAddress ? {
          name: `${orderData.shippingAddress.firstName || ""} ${orderData.shippingAddress.lastName || ""}`.trim() || "Customer",
          address: orderData.shippingAddress.address || "",
          city: orderData.shippingAddress.city || "",
          postalCode: orderData.shippingAddress.postalCode || "",
          country: orderData.shippingAddress.country || "",
        } : {
          name: "Customer",
          address: "",
          city: "",
          postalCode: "",
          country: "",
        },
        tracking: generateTrackingTimeline(orderData),
        paymentStatus: orderData.paymentStatus,
        shippedAt: orderData.shippedAt,
        deliveredAt: orderData.deliveredAt,
      };

      setOrder(transformedOrder);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  // Check for order parameter in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get("order");

      if (orderParam) {
        setOrderNumber(orderParam);
        fetchOrder(orderParam);
      }
    }
  }, []);

  const handleTrack = () => {
    fetchOrder(orderNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "payment confirmed":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            ORDER TRACKING
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Order</h1>
          <p className="text-lg text-muted-foreground">
            Enter your order number to check delivery status
          </p>
        </div>

        {/* Search Box */}
        {!order && (
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter order number (e.g., ALT-2024-1234)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                      className="h-14 text-lg bg-gray-50"
                    />
                  </div>
                  <Button
                    onClick={handleTrack}
                    disabled={!orderNumber.trim() || isSearching}
                    className="h-14 px-8 text-lg"
                  >
                    {isSearching ? "Searching..." : "Track"}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center mt-6">
                  Secure tracking with order confirmation.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setOrder(null);
                setOrderNumber("");
                setError("");
              }}
              className="mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Search Another Order
            </Button>

            {/* Order Header */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h2>
                    <p className="text-muted-foreground">Placed on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">&euro;{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t mt-6 pt-6">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-muted-foreground">
                    <p>{order.shipping.name}</p>
                    <p>{order.shipping.address}</p>
                    <p>{order.shipping.city}, {order.shipping.postalCode}</p>
                    <p>{order.shipping.country}</p>
                  </div>
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="border-t mt-6 pt-6">
                    <h3 className="font-semibold mb-3">Tracking Information</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="font-mono font-semibold text-lg">{order.trackingNumber}</p>
                          {getTrackingUrl(order.trackingNumber) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Carrier: {getTrackingUrl(order.trackingNumber)?.carrier}
                            </p>
                          )}
                        </div>
                        {getTrackingUrl(order.trackingNumber) && (
                          <a
                            href={getTrackingUrl(order.trackingNumber)?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Track on {getTrackingUrl(order.trackingNumber)?.carrier}
                          </a>
                        )}
                      </div>
                      {order.estimatedDelivery && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                          <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t mt-6 pt-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>&euro;{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-8">Tracking History</h3>
                <div className="space-y-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {order.tracking.map((track: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${index === order.tracking.length - 1 ? getStatusColor(order.status) : 'bg-gray-300'}`} />
                        {index !== order.tracking.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold">{track.status}</p>
                          <p className="text-sm text-muted-foreground">{new Date(track.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{track.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about your order, feel free to contact us.
                </p>
                <Button asChild variant="outline">
                  <Link href="/support">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section for No Order */}
        {!order && !error && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="font-semibold text-lg mb-4 text-center">How to Find Your Order Number?</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                      1
                    </div>
                    <p>Check your order confirmation email sent after purchase</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                      2
                    </div>
                    <p>Look for the order number in the format: ALT-XXXX-XXXX</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                      3
                    </div>
                    <p>If logged in, view your orders in your dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}
