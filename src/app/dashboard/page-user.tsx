"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState as _useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useLanguage } from "@/components/providers";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useLanguage();

  // Mock user data
  const userStats = {
    totalOrders: 3,
    activeOrders: 2,
    totalSpent: 7400,
    favoriteCount: 6,
    memberSince: "2024"
  };

  // Mock recent orders
  const recentOrders = [
    {
      id: "ORD-2024-001",
      artwork: "Dawn of Hope",
      artworkImage: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80",
      price: 2400,
      status: "delivered",
      date: "2024-12-15",
      trackingNumber: "TRK123456789",
    },
    {
      id: "ORD-2024-002",
      artwork: "Mediterranean Light",
      artworkImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
      price: 3200,
      status: "shipped",
      date: "2024-12-20",
      trackingNumber: "TRK987654321",
      estimatedDelivery: "2025-01-05"
    },
    {
      id: "ORD-2024-003",
      artwork: "Autumn Dreams",
      artworkImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80",
      price: 1800,
      status: "processing",
      date: "2024-12-28",
      estimatedDelivery: "2025-01-10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Overview */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                    </div>
                    Account Overview
                  </CardTitle>
                  <CardDescription>Your activity summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{userStats.totalOrders}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{userStats.activeOrders}</p>
                      <p className="text-sm text-muted-foreground mt-1">Active</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{formatPrice(userStats.totalSpent)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Spent</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{userStats.favoriteCount}</p>
                      <p className="text-sm text-muted-foreground mt-1">Favorites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </div>
                      Recent Orders
                    </CardTitle>
                    <CardDescription>Track your recent purchases</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={order.artworkImage}
                            alt={order.artwork}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold truncate">{order.artwork}</h4>
                            <Badge className={`${getStatusColor(order.status)} border flex-shrink-0`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Order #{order.id}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold">{formatPrice(order.price)}</span>
                            <span className="text-muted-foreground">{order.date}</span>
                          </div>
                          {order.trackingNumber && (
                            <p className="text-xs text-blue-600 mt-1 font-mono">
                              Track: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Shortcuts */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Shortcuts to common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/profile">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Edit Profile
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/orders">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <path d="m7.5 4.27 9 5.15" />
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      View Orders
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/favorites">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      My Favorites
                    </Link>
                  </Button>

                  <Separator />

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/settings">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Account Settings
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/help">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                      </svg>
                      Help & Support
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>
                    For You
                  </CardTitle>
                  <CardDescription>Personalized recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/gallery">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      Explore Gallery
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Discover new artworks similar to your favorites
                  </p>
                </CardContent>
              </Card>

              {/* Member Since */}
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                      <path d="M8.5 8.5v.01" />
                      <path d="M16 15.5v.01" />
                      <path d="M12 12v.01" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-2xl font-bold">{userStats.memberSince}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
