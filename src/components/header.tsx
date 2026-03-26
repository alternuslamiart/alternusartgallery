"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import { languages } from "@/lib/i18n";
import { paintings } from "@/lib/paintings";

// Mock artists data
const artists = [
  { id: "1", name: "Lamiart", avatar: "LA" },
  { id: "2", name: "Marco Rossi", avatar: "MR" },
  { id: "3", name: "Sofia Chen", avatar: "SC" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string | null;
    linkUrl: string | null;
    isRead: boolean;
    createdAt: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language, setLanguage, t, formatPrice } = useLanguage();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { data: session, status } = useSession();

  // Check both NextAuth session and localStorage for CEO login
  const [localUser, setLocalUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const userAuth = localStorage.getItem("userAuth");
    if (userAuth === "true") {
      setLocalUser({
        name: localStorage.getItem("userName") || "User",
        email: localStorage.getItem("userEmail") || "",
        role: localStorage.getItem("userRole") || "USER",
      });
    }
  }, []);

  const isLoggedIn = status === "authenticated" || localUser !== null;
  const user = session?.user || localUser;

  // Filter results based on search query
  const filteredPaintings = paintings.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const filteredArtists = artists.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications?limit=6');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleSelectPainting = (id: string) => {
    setShowResults(false);
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/gallery/${id}`);
  };

  const handleSelectArtist = (id: string) => {
    setShowResults(false);
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/artist/${id}`);
  };

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("gallery"), href: "/gallery" },
    { name: "Blog", href: "/blog" },
    { name: t("about"), href: "/about" },
    { name: "Support", href: "/support" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    setIsNotificationOpen(false);
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-3xl font-black leading-tight font-roboto">Alternus</span>
                <span className="text-[10px] text-muted-foreground tracking-[0.25em] uppercase">Art Gallery</span>
              </div>
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-block text-xs text-muted-foreground border-l pl-3 hover:text-foreground transition-colors cursor-pointer"
            >
              Sell your Art
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center" ref={searchRef}>
              {isSearchOpen ? (
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search artworks or artists..."
                    className="w-[250px] lg:w-[350px]"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />

                  {/* Search Results Dropdown */}
                  {showResults && (filteredPaintings.length > 0 || filteredArtists.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
                      {/* Artists */}
                      {filteredArtists.length > 0 && (
                        <div>
                          <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">Artists</p>
                          {filteredArtists.map((artist) => (
                            <button
                              key={artist.id}
                              onClick={() => handleSelectArtist(artist.id)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                {artist.avatar}
                              </div>
                              <span className="text-sm font-medium">{artist.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Artworks */}
                      {filteredPaintings.length > 0 && (
                        <div>
                          <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">Artworks</p>
                          {filteredPaintings.map((painting) => (
                            <button
                              key={painting.id}
                              onClick={() => handleSelectPainting(painting.id)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={painting.image} alt={painting.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{painting.title}</p>
                                <p className="text-xs text-gray-500">{formatPrice(painting.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Results */}
                  {showResults && filteredPaintings.length === 0 && filteredArtists.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border p-4 z-50">
                      <p className="text-sm text-gray-500 text-center">No results found</p>
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 hidden sm:flex">
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="text-xs uppercase">{language}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu / Login */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user?.name || user?.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b mb-1">
                    <p className="font-medium">{user?.name || user?.email?.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8h6v8M16 16h6" />
                        <rect width="13" height="13" x="3" y="5" rx="2" />
                      </svg>
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                      </svg>
                      Help & Support
                    </Link>
                  </DropdownMenuItem>

                  {/* Verification CTA */}
                  <div className="px-2 py-2 mt-1">
                    <Link href="/apply" className="block">
                      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[1px]">
                        <div className="relative bg-white dark:bg-gray-900 rounded-[7px] px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                                <path d="m9 12 2 2 4-4"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Get Verified</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">Boost your credibility</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="border-t mt-1 pt-1">
                    <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="text-red-600 flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex px-4 py-2 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t("login")}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-3 w-[360px] bg-white dark:bg-gray-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Gallery Updates</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">New artworks & artists</p>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No updates yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back later for new artworks</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-left ${
                            !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                notification.type === "new_artwork"
                                  ? "bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-800/30"
                                  : notification.type === "new_artist"
                                  ? "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-800/30"
                                  : notification.type === "order"
                                  ? "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30"
                                  : "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700"
                              }`}
                            >
                              {notification.type === "new_artwork" && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                              )}
                              {notification.type === "new_artist" && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" x2="19" y1="8" y2="14" />
                                  <line x1="22" x2="16" y1="11" y2="11" />
                                </svg>
                              )}
                              {notification.type === "order" && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                  <polyline points="3.29 7 12 12 20.71 7" />
                                  <line x1="12" x2="12" y1="22" y2="12" />
                                </svg>
                              )}
                              {!["new_artwork", "new_artist", "order"].includes(notification.type) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                      <Link
                        href="/gallery"
                        onClick={() => setIsNotificationOpen(false)}
                        className="block w-full text-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                      >
                        Browse Gallery →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist - only show when logged in */}
            {user && (
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
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
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}


            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
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
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
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
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <Input type="search" placeholder={t("search")} />
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto pt-8 space-y-4">
                    {!isLoggedIn && (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">
                          {t("login")}
                        </Button>
                      </Link>
                    )}
                    <div className="flex gap-2">
                      {languages.map((lang) => (
                        <Button
                          key={lang.code}
                          variant={language === lang.code ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLanguage(lang.code)}
                        >
                          {lang.flag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog - Modern Soft Design */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          {/* Soft gradient header */}
          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 px-8 pt-10 pb-6 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl flex items-center justify-center -rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Leaving so soon?</h2>
            <p className="text-gray-500 text-sm">We&apos;ll miss you!</p>
          </div>

          {/* Content */}
          <div className="px-8 py-6 bg-white">
            {/* User info card */}
            {user && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-lg">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800 truncate">{user.name || "User"}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 text-sm leading-relaxed">
              You&apos;ll need to sign in again to access your saved items and order history.
            </p>
          </div>

          {/* Footer with soft buttons */}
          <div className="px-8 pb-8 pt-2 bg-white flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Stay
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-lg transition-all duration-200"
              onClick={() => {
                // Clear localStorage
                localStorage.removeItem("userAuth");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userName");
                localStorage.removeItem("userRole");
                // Also sign out from NextAuth
                signOut({ callbackUrl: "/" });
                setShowLogoutConfirm(false);
              }}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
