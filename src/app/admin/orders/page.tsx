"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  artwork: {
    id: string;
    title: string;
    primaryImage: string | null;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  shippingCost: string;
  tax: string;
  total: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  guestEmail: string | null;
  trackingNumber: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold">Orders Management</h1>
              </div>
            </div>
            <Button onClick={fetchOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Processing</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "PROCESSING").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter((o) => o.status === "DELIVERED").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((order) => (
                <div key={order.id} className="hover:bg-gray-50">
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.email || order.guestEmail || "Guest"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {order.currency === "EUR" ? "€" : "$"}
                            {parseFloat(order.total).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="px-4 pb-4 bg-gray-50 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {/* Order Items */}
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                              >
                                {item.artwork?.primaryImage ? (
                                  <Image
                                    src={item.artwork.primaryImage}
                                    alt={item.artwork.title}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {item.artwork?.title || "Unknown Artwork"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  €{parseFloat(item.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Customer
                            </h4>
                            <p className="text-sm">
                              {order.user
                                ? `${order.user.firstName || ""} ${order.user.lastName || ""}`
                                : "Guest"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.user?.email || order.guestEmail}
                            </p>
                          </div>

                          {/* Shipping Address */}
                          {order.shippingAddress && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Shipping Address
                              </h4>
                              <p className="text-sm">
                                {order.shippingAddress.firstName}{" "}
                                {order.shippingAddress.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.shippingAddress.address}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.postalCode}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.shippingAddress.country}
                              </p>
                            </div>
                          )}

                          {/* Payment Summary */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Payment Summary
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>€{parseFloat(order.subtotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span>€{parseFloat(order.shippingCost).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span>€{parseFloat(order.tax).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span>€{parseFloat(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Payment Method
                            </h4>
                            <p className="text-sm">
                              {order.paymentMethod || "Credit Card"}
                            </p>
                            {order.trackingNumber && (
                              <p className="text-sm text-gray-500 mt-2">
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
