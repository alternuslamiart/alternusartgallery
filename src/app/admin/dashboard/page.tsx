"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminAuthGuard, adminLogout } from "@/components/admin-auth-guard";

interface NewUser {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
  emailVerified: boolean;
  isArtist: boolean;
  artistStatus: string | null;
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function CEODashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_timeframe, _setTimeframe] = useState("30days");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // New users state
  const [newUsers, setNewUsers] = useState<NewUser[]>([]);
  const [userStats, setUserStats] = useState({ todayCount: 0, weekCount: 0, total: 0 });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch new users
  useEffect(() => {
    const fetchNewUsers = async () => {
      try {
        const response = await fetch('/api/admin/users?limit=5&filter=new');
        if (response.ok) {
          const data = await response.json();
          setNewUsers(data.users);
          setUserStats({
            todayCount: data.todayCount,
            weekCount: data.weekCount,
            total: data.total
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchNewUsers();

    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchNewUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Real data - starts from zero, updates with actual transactions
  const stats = {
    totalRevenue: 0,
    revenueGrowth: 0,
    galleryCommission: 0,
    commissionGrowth: 0,
    totalSales: 0,
    salesGrowth: 0,
    activeArtists: 0,
    newArtists: 0,
    pendingApplications: 0,
    pendingArtworks: 0,
    artistEarnings: 0,
  };

  const recentSales: {
    id: string;
    artwork: string;
    artist: string;
    buyer: string;
    price: number;
    commission: number;
    artistEarning: number;
    date: string;
    status: string;
  }[] = [];

  const pendingActions = {
    artistApplications: 0,
    artworkApprovals: 0,
    pendingPayouts: 0,
    unreadMessages: 0,
  };

  const staticNotifications: {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    link: string;
  }[] = [];

  // Add new user notifications dynamically
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userNotifications = newUsers.slice(0, 3).map((user, _index) => ({
    id: `user-${user.id}`,
    type: "user",
    title: "New User Registered",
    message: `${user.name || user.email} joined the platform`,
    time: getTimeAgo(new Date(user.createdAt)),
    isRead: false,
    link: "/admin/dashboard",
  }));

  const notifications = [...userNotifications, ...staticNotifications];

  const unreadCount = notifications.filter((n) => !n.isRead).length + userStats.todayCount;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <nav className="flex items-center gap-1">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg relative"
                >
                  Applications
                  {pendingActions.artistApplications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingActions.artistApplications}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/artists"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Artists
                </Link>
                <Link
                  href="/admin/artworks"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg relative"
                >
                  Artworks
                  {pendingActions.artworkApprovals > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingActions.artworkApprovals}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/sales"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Sales
                </Link>
                <Link
                  href="/admin/reports"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Reports
                </Link>
              </nav>

            <div className="absolute right-0 flex items-center gap-3">
              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-zinc-100 rounded-lg transition-colors"
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
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-zinc-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">Stay updated with your gallery activities</p>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[480px] overflow-y-auto divide-y divide-zinc-100">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          onClick={() => setIsNotificationOpen(false)}
                          className={`block px-5 py-4 hover:bg-zinc-50 transition-all duration-200 group ${
                            !notification.isRead ? "bg-blue-50/40" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                                notification.type === "application"
                                  ? "bg-gradient-to-br from-purple-100 to-purple-50 shadow-sm"
                                  : notification.type === "artwork"
                                  ? "bg-gradient-to-br from-orange-100 to-orange-50 shadow-sm"
                                  : notification.type === "sale"
                                  ? "bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm"
                                  : notification.type === "user"
                                  ? "bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm"
                                  : "bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm"
                              }`}
                            >
                              {notification.type === "application" && (
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
                                  className="text-purple-600"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" x2="19" y1="8" y2="14" />
                                  <line x1="22" x2="16" y1="11" y2="11" />
                                </svg>
                              )}
                              {notification.type === "artwork" && (
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
                                  className="text-orange-600"
                                >
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                              )}
                              {notification.type === "sale" && (
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
                                  className="text-emerald-600"
                                >
                                  <line x1="12" x2="12" y1="2" y2="22" />
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                              )}
                              {notification.type === "payout" && (
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
                                  className="text-blue-600"
                                >
                                  <rect width="20" height="14" x="2" y="5" rx="2" />
                                  <line x1="2" x2="22" y1="10" y2="10" />
                                </svg>
                              )}
                              {notification.type === "user" && (
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
                                  className="text-cyan-600"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" x2="19" y1="8" y2="14" />
                                  <line x1="22" x2="16" y1="11" y2="11" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <p className="font-bold text-sm text-zinc-900 leading-snug">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 shadow-sm" />
                                )}
                              </div>
                              <p className="text-sm text-zinc-600 leading-relaxed mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <p className="text-xs text-zinc-500 font-medium">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-zinc-100 bg-gradient-to-b from-white to-zinc-50">
                      <button className="w-full text-center text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors py-2 px-4 rounded-lg hover:bg-white">
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div
                ref={userMenuRef}
                className="relative pl-3 border-l border-zinc-200"
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-black hidden sm:block">CEO</p>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    AAG
                  </button>
                </div>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
                      >
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
                          className="text-zinc-600"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-sm font-medium text-black">Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-200 p-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          adminLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                      >
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
                          className="text-red-600"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">CEO Dashboard</h2>
          <p className="text-zinc-600">Complete overview of your art gallery platform</p>
        </div>

        {/* Pending Actions Alert */}
        {(pendingActions.artistApplications > 0 || pendingActions.artworkApprovals > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-600"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-2">Pending Actions Required</h3>
                <div className="space-y-2">
                  {pendingActions.artistApplications > 0 && (
                    <p className="text-sm text-zinc-700">
                      • {pendingActions.artistApplications} artist applications waiting for review
                    </p>
                  )}
                  {pendingActions.artworkApprovals > 0 && (
                    <p className="text-sm text-zinc-700">
                      • {pendingActions.artworkApprovals} artworks pending approval
                    </p>
                  )}
                  {pendingActions.pendingPayouts > 0 && (
                    <p className="text-sm text-zinc-700">
                      • {pendingActions.pendingPayouts} payouts ready to process
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <Link href="/admin/applications">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Review Applications
                    </Button>
                  </Link>
                  <Link href="/admin/artworks">
                    <Button size="sm" variant="outline">
                      Approve Artworks
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics - 40% Commission Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <Badge className="bg-white/20 text-white border-0">
                +{stats.revenueGrowth}%
              </Badge>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Last 30 days</p>
          </div>

          {/* Gallery Commission (40%) */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <Badge className="bg-white/20 text-white border-0">40%</Badge>
            </div>
            <p className="text-white/80 text-sm mb-1">Gallery Commission</p>
            <p className="text-3xl font-bold">€{stats.galleryCommission.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Your earnings (40%)</p>
          </div>

          {/* Artist Earnings (60%) */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <Badge className="bg-white/20 text-white border-0">60%</Badge>
            </div>
            <p className="text-white/80 text-sm mb-1">Artist Earnings</p>
            <p className="text-3xl font-bold">€{stats.artistEarnings.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Total paid to artists</p>
          </div>

          {/* Total Sales */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <Badge className="bg-white/20 text-white border-0">
                +{stats.salesGrowth}%
              </Badge>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold">{stats.totalSales.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Artworks sold</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600">Active Artists</p>
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                +{stats.newArtists}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-black">{stats.activeArtists}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600">Pending Applications</p>
              <Badge className="bg-orange-100 text-orange-700 border-0">
                Action Required
              </Badge>
            </div>
            <p className="text-3xl font-bold text-black">{stats.pendingApplications}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600">Pending Artworks</p>
              <Badge className="bg-blue-100 text-blue-700 border-0">Review</Badge>
            </div>
            <p className="text-3xl font-bold text-black">{stats.pendingArtworks}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600">Avg. Commission</p>
              <Badge variant="outline">Per Sale</Badge>
            </div>
            <p className="text-3xl font-bold text-black">
              €{Math.round(stats.galleryCommission / stats.totalSales).toLocaleString()}
            </p>
          </div>
        </div>

        {/* New Users Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 mb-8">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">New Users</h3>
                  <p className="text-zinc-600 text-sm">
                    Recent platform registrations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-600">{userStats.todayCount}</p>
                  <p className="text-xs text-zinc-500">Today</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{userStats.weekCount}</p>
                  <p className="text-xs text-zinc-500">This Week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {isLoadingUsers ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-blue-600 rounded-full mx-auto"></div>
                <p className="text-zinc-500 mt-2">Loading users...</p>
              </div>
            ) : newUsers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-zinc-600 font-medium">No new users this week</p>
                <p className="text-zinc-400 text-sm">New registrations will appear here</p>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              newUsers.map((user, _index) => {
                const isToday = new Date(user.createdAt).toDateString() === new Date().toDateString();
                const timeAgo = getTimeAgo(new Date(user.createdAt));

                return (
                  <div key={user.id} className={`p-4 hover:bg-zinc-50 transition-colors ${isToday ? 'bg-cyan-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        isToday ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-zinc-400'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-black truncate">{user.name || user.email}</p>
                          {isToday && (
                            <Badge className="bg-cyan-100 text-cyan-700 border-0 text-xs">
                              New Today
                            </Badge>
                          )}
                          {user.isArtist && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              Artist
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                      </div>

                      {/* Role & Time */}
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {user.role}
                        </Badge>
                        <p className="text-xs text-zinc-400">{timeAgo}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {newUsers.length > 0 && (
            <div className="p-4 bg-zinc-50 border-t border-zinc-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">
                  {userStats.weekCount} new users this week
                </span>
                <button className="text-blue-600 font-medium hover:underline">
                  View all users →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 mb-8">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-black">Recent Sales</h3>
                <p className="text-zinc-600 text-sm mt-1">
                  Latest transactions with 40% commission breakdown
                </p>
              </div>
              <Link href="/admin/sales">
                <Button variant="outline" size="sm">
                  View All Sales
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">
                    Transaction ID
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Artwork</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Artist</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Buyer</th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">Price</th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Commission (40%)
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Artist (60%)
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50">
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-600">#{sale.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-black">{sale.artwork}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-700">{sale.artist}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-700">{sale.buyer}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-black">
                        €{sale.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-emerald-600">
                        €{sale.commission.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-purple-600">
                        €{sale.artistEarning.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {sale.status === "completed" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-0">Processing</Badge>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600 text-sm">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-zinc-50 border-t border-zinc-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Showing 3 of 1,284 sales</span>
              <Link href="/admin/sales" className="text-black font-medium hover:underline">
                View all sales →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/admin/applications"
            className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-600"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              {pendingActions.artistApplications > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  {pendingActions.artistApplications} Pending
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-black text-lg mb-2">Review Applications</h3>
            <p className="text-zinc-600 text-sm">
              Approve or reject artist applications to join your gallery
            </p>
          </Link>

          <Link
            href="/admin/artworks"
            className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              {pendingActions.artworkApprovals > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {pendingActions.artworkApprovals} Pending
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-black text-lg mb-2">Approve Artworks</h3>
            <p className="text-zinc-600 text-sm">
              Review and approve new artwork submissions from artists
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <Badge variant="outline">Export</Badge>
            </div>
            <h3 className="font-semibold text-black text-lg mb-2">Financial Reports</h3>
            <p className="text-zinc-600 text-sm">
              View detailed analytics and export financial reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminAuthGuard>
      <CEODashboard />
    </AdminAuthGuard>
  );
}
