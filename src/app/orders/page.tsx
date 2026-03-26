"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers";
import { useSession } from "next-auth/react";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  artwork: {
    id: string;
    title: string;
    image: string;
    artist: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";
  total: number;
  currency: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { formatPrice } = useLanguage();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "loading") return;

      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/orders/my-orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Show login prompt if not authenticated
  if (status !== "loading" && !session?.user) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign in to view orders</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Please sign in to your account to view your order history.
              </p>
              <Button asChild size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Error Loading Orders</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your artwork purchases
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Start exploring our gallery and find the perfect artwork for your collection.
              </p>
              <Button asChild size="lg">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Artwork Image */}
                    <div className="relative w-full md:w-32 h-40 md:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {order.items[0]?.artwork?.image ? (
                        <Image
                          src={order.items[0].artwork.image}
                          alt={order.items[0].artwork.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">
                            {order.items.length === 1
                              ? order.items[0]?.title || order.items[0]?.artwork?.title
                              : `${order.items.length} items`
                            }
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">Order #{order.orderNumber}</p>
                          <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getStatusColor(order.status)} border`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                          <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border`}>
                            Payment: {getStatusLabel(order.paymentStatus)}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Order Date</p>
                          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        {order.estimatedDelivery && (
                          <div>
                            <p className="text-muted-foreground mb-1">Estimated Delivery</p>
                            <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div>
                            <p className="text-muted-foreground mb-1">Tracking Number</p>
                            <p className="font-medium font-mono text-xs">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>

                      {/* Multiple items */}
                      {order.items.length > 1 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Items in this order:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item) => (
                              <span key={item.id} className="text-sm bg-muted px-2 py-1 rounded">
                                {item.title || item.artwork?.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {order.trackingNumber && (
                          <Button variant="default" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            Track Order
                          </Button>
                        )}
                        {order.items[0]?.artwork && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/gallery/${order.items[0].artwork.id}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View Artwork
                            </Link>
                          </Button>
                        )}
                        {order.status === "DELIVERED" && (
                          <Button variant="outline" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline for shipped/processing orders */}
                  {(order.status === "SHIPPED" || order.status === "PROCESSING") && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold mb-3">Order Progress</h4>
                        <div className="relative pl-6 space-y-4">
                          {/* Timeline line */}
                          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-muted" />

                          {/* Timeline steps */}
                          {[
                            { label: "Order Placed", completed: true },
                            { label: "Payment Confirmed", completed: order.paymentStatus === "COMPLETED" },
                            { label: "Preparing for Shipment", completed: order.status === "SHIPPED" || order.status === "PROCESSING" },
                            { label: "Shipped", completed: order.status === "SHIPPED" },
                            { label: "Out for Delivery", completed: false },
                            { label: "Delivered", completed: false }
                          ].map((step, idx) => (
                            <div key={idx} className="relative flex items-center gap-3">
                              <div className={`absolute left-[-1.25rem] w-4 h-4 rounded-full border-2 ${
                                step.completed
                                  ? "bg-primary border-primary"
                                  : "bg-background border-muted-foreground"
                              }`} />
                              <span className={`text-sm ${
                                step.completed
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-0 shadow-sm bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about your order or need assistance, we&apos;re here to help.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/help">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                  Help Center
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/support">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/shipping">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M16 8h6v8M16 16h6" />
                    <rect width="13" height="13" x="3" y="5" rx="2" />
                  </svg>
                  Shipping Info
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
