"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import { Painting } from "@/lib/paintings";
import { FilterSidebar } from "@/components/gallery/filter-sidebar";
import { MobileFilterDrawer } from "@/components/gallery/mobile-filter-drawer";
import { AdBanner } from "@/components/adsense";

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [orderNumber, setOrderNumber] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const { t, formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch paintings from database
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);

  useEffect(() => {
    async function fetchArtworks() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/artworks?limit=100');

        if (!response.ok) {
          console.error('API error:', response.status);
          setPaintings([]);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.artworks && Array.isArray(data.artworks)) {
          const mappedPaintings: Painting[] = data.artworks.map((artwork: {
            id: string;
            title: string;
            description?: string;
            price: number;
            dimensions?: string;
            medium?: string;
            year?: number;
            category?: string;
            style?: string;
            image: string;
            available: boolean;
            status?: string;
            isPreOrder?: boolean;
            preOrderDate?: string;
            preOrderDiscount?: number;
            artist?: { id: string; displayName: string };
          }) => ({
            id: artwork.id,
            title: artwork.title,
            description: artwork.description || '',
            price: artwork.price,
            dimensions: artwork.dimensions || '',
            medium: artwork.medium || '',
            year: artwork.year || new Date().getFullYear(),
            category: artwork.category || 'Painting',
            style: artwork.style || 'Contemporary',
            image: artwork.image,
            available: artwork.available,
            isPreOrder: artwork.isPreOrder,
            preOrderReleaseDate: artwork.preOrderDate,
            preOrderDiscount: artwork.preOrderDiscount,
            artistId: artwork.artist?.id,
            artist: artwork.artist?.displayName,
          }));

          setPaintings(mappedPaintings);

          const uniqueCategories = Array.from(new Set(mappedPaintings.map(p => p.category).filter(Boolean)));
          const uniqueStyles = Array.from(new Set(mappedPaintings.map(p => p.style).filter(Boolean)));
          setCategories(uniqueCategories);
          setStyles(uniqueStyles);
        } else {
          setPaintings([]);
        }
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setPaintings([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  // Read filters from URL
  const sortBy = searchParams.get('sort') || 'date-desc';
  const selectedCategory = searchParams.get('category');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedStyles = useMemo(() => searchParams.get('styles')?.split(',').filter(Boolean) || [], [searchParams.get('styles')]);

  // Update URL with new filter values
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Update handlers
  const handleSortChange = (value: string) => {
    updateFilter('sort', value);
  };

  const handleCategoryChange = (value: string | null) => {
    updateFilter('category', value);
  };

  const handleStylesChange = (values: string[]) => {
    updateFilter('styles', values.length > 0 ? values.join(',') : null);
  };

  const handleClearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = !!selectedCategory || selectedStyles.length > 0;

  // Filter and sort paintings
  const filteredPaintings = useMemo(() => {
    let result = [...paintings];

    // Apply category filter (single select)
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Apply style filter (multi-select with OR logic)
    if (selectedStyles.length > 0) {
      result = result.filter(p => selectedStyles.includes(p.style));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'date-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'date-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [paintings, selectedCategory, selectedStyles, sortBy]);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");

    // Validate order number format (e.g., ALT-XXXX-XXXX)
    const orderPattern = /^ALT-[A-Z0-9]+-[A-Z0-9]+$/i;

    if (!orderNumber.trim()) {
      setTrackingError("Please enter an order number");
      return;
    }

    if (!orderPattern.test(orderNumber.trim())) {
      setTrackingError("Invalid order number format. Use: ALT-XXXX-XXXX");
      return;
    }

    // Redirect to order tracking page with order number
    router.push(`/track?order=${encodeURIComponent(orderNumber.trim())}`);
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Collection
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("gallery")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the complete collection of artworks. Every painting is
            available for purchase.
          </p>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                sortBy={sortBy}
                onSortChange={handleSortChange}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                selectedStyles={selectedStyles}
                onStylesChange={handleStylesChange}
                categories={categories}
                styles={styles}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <MobileFilterDrawer
                sortBy={sortBy}
                onSortChange={handleSortChange}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                selectedStyles={selectedStyles}
                onStylesChange={handleStylesChange}
                categories={categories}
                styles={styles}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-zinc-200 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading artworks...</p>
              </div>
            ) : filteredPaintings.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No artworks yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The gallery is waiting for beautiful artworks. Check back soon or be the first artist to showcase your work.
                </p>
                <Link href="/apply">
                  <Button>Become an Artist</Button>
                </Link>
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPaintings.map((painting) => (
            <div
              key={painting.id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/gallery/${painting.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={painting.image}
                    alt={painting.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Style Badge - Top Left */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {painting.style}
                    </Badge>
                  </div>
                  {/* Wishlist Button - Top Right */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (isInWishlist(painting.id)) {
                        removeFromWishlist(painting.id);
                      } else {
                        addToWishlist(painting);
                      }
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                    aria-label={isInWishlist(painting.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isInWishlist(painting.id) ? "red" : "none"}
                      stroke={isInWishlist(painting.id) ? "red" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                  {/* Quick Add Button */}
                  {painting.available && (
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(painting);
                        }}
                      >
                        {t("addToCart")}
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/gallery/${painting.id}`}>
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {painting.title}
                  </h3>
                </Link>
                {painting.artist && painting.artistId && (
                  <Link
                    href={`/artists/${painting.artistId}`}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-0.5 inline-block"
                  >
                    by {painting.artist}
                  </Link>
                )}
                <p className="text-sm text-gray-500 mt-1">{painting.medium}</p>
                <p className="text-sm text-gray-500">{painting.dimensions}</p>
                <div className="flex items-center justify-between mt-3">
                  {painting.available ? (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(painting.price)}
                      </p>
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        {t("available")}
                      </Badge>
                    </>
                  ) : (
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs font-semibold">
                      SOLD
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
            </div>
            )}

            {/* Ad Banner */}
            <AdBanner className="mt-8" />

            {/* Load More */}
            {filteredPaintings.length > 0 && (
              <div className="text-center mt-12">
                <button className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors group">
                  <span>See More</span>
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
                    className="group-hover:translate-y-1 transition-transform"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>
            )}

            {filteredPaintings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No works found matching your filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Tracking Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/80 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
              Order Tracking
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              Track Your Order
            </h2>
            <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
              Enter your order number to check delivery status
            </p>

            {/* Order Tracking Input */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleTrackOrder}>
                <div className="flex items-center gap-3 p-1.5 bg-gray-100/80 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200/50">
                  <input
                    type="text"
                    placeholder="Enter order number (e.g., ALT-2024-1234)"
                    className="flex-1 px-5 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    value={orderNumber}
                    onChange={(e) => {
                      setOrderNumber(e.target.value);
                      setTrackingError("");
                    }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:text-gray-900 transition-all duration-200"
                  >
                    Track
                  </button>
                </div>
              </form>
              {trackingError && (
                <p className="text-xs text-red-500 mt-3 font-medium">{trackingError}</p>
              )}
              {!trackingError && (
                <p className="text-[11px] text-gray-400 mt-4">
                  Secure tracking with order confirmation.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="overflow-hidden bg-white border-t">
        <div className="animate-marquee">
          <span className="text-[256px] font-bold text-black mx-16 leading-none whitespace-nowrap">
            Alternus
          </span>
          <span className="text-[256px] font-bold text-black mx-16 leading-none whitespace-nowrap">
            Alternus
          </span>
          <span className="text-[256px] font-bold text-black mx-16 leading-none whitespace-nowrap">
            Alternus
          </span>
          <span className="text-[256px] font-bold text-black mx-16 leading-none whitespace-nowrap">
            Alternus
          </span>
        </div>
      </div>
    </div>
  );
}
