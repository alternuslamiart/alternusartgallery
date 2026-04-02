"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import { Painting } from "@/lib/paintings";

const PRINT_TYPES = [
  { name: "All Prints", value: "" },
  { name: "Lithography", value: "Lithography" },
  { name: "Screen Print", value: "Screen Print" },
  { name: "Etching", value: "Etching" },
  { name: "Woodcut", value: "Woodcut" },
  { name: "Giclée", value: "Giclee" },
];

const PRINT_SUBJECTS = [
  { name: "Abstract", value: "Abstract" },
  { name: "Landscape", value: "Landscape" },
  { name: "Botanical", value: "Botanical" },
  { name: "Figurative", value: "Figurative" },
  { name: "Geometric", value: "Geometric" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date-desc" },
  { label: "Oldest First", value: "date-asc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A - Z", value: "name-asc" },
];

export default function PrintsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [prints, setPrints] = useState<Painting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedType = searchParams.get("type") || "";
  const selectedSubject = searchParams.get("subject") || "";
  const sortBy = searchParams.get("sort") || "date-desc";

  useEffect(() => {
    async function fetchPrints() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/artworks?category=Prints&limit=100");
        if (!response.ok) {
          setPrints([]);
          return;
        }
        const data = await response.json();
        if (data.artworks && Array.isArray(data.artworks)) {
          setPrints(
            data.artworks.map((artwork: {
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
              artist?: { id: string; displayName: string };
            }) => ({
              id: artwork.id,
              title: artwork.title,
              description: artwork.description || "",
              price: artwork.price,
              dimensions: artwork.dimensions || "",
              medium: artwork.medium || "",
              year: artwork.year || new Date().getFullYear(),
              category: artwork.category || "Prints",
              style: artwork.style || "",
              image: artwork.image,
              available: artwork.available,
              artistId: artwork.artist?.id,
              artist: artwork.artist?.displayName,
            }))
          );
        }
      } catch {
        setPrints([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrints();
  }, []);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredPrints = useMemo(() => {
    let result = [...prints];

    if (selectedType) {
      result = result.filter((p) => p.style === selectedType);
    }
    if (selectedSubject) {
      result = result.filter(
        (p) =>
          p.style === selectedSubject ||
          p.description?.toLowerCase().includes(selectedSubject.toLowerCase())
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        result.sort((a, b) => a.year - b.year);
        break;
      case "date-desc":
        result.sort((a, b) => b.year - a.year);
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [prints, selectedType, selectedSubject, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-transparent to-transparent opacity-60" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">
              Curated Collection
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-5 tracking-tight">
              Art Prints
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Discover limited edition prints from world-class artists.
              Museum-quality reproductions and original printmaking.
            </p>
          </div>
        </div>
      </section>

      {/* Print Type Filters */}
      <section className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {PRINT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => updateFilter("type", type.value || null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedType === type.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {type.name}
              </button>
            ))}

            <div className="w-px h-8 bg-gray-200 mx-2 flex-shrink-0" />

            {PRINT_SUBJECTS.map((subject) => (
              <button
                key={subject.value}
                onClick={() =>
                  updateFilter(
                    "subject",
                    selectedSubject === subject.value ? null : subject.value
                  )
                }
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedSubject === subject.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{filteredPrints.length}</span>{" "}
            {filteredPrints.length === 1 ? "print" : "prints"} available
          </p>
          <select
            value={sortBy}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all duration-200 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prints Grid */}
      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="animate-spin w-10 h-10 border-[3px] border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading prints...</p>
          </div>
        ) : filteredPrints.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No prints found</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              {selectedType || selectedSubject
                ? "Try adjusting your filters to see more results."
                : "New prints are being added regularly. Check back soon."}
            </p>
            {(selectedType || selectedSubject) && (
              <button
                onClick={() => router.push(pathname)}
                className="h-11 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Clear Filters
              </button>
            )}
            <Link
              href="/gallery"
              className="mt-4 block text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Browse full gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {filteredPrints.map((print) => (
              <div
                key={print.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
              >
                <Link href={`/gallery/${print.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <Image
                      src={print.image}
                      alt={print.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Style Badge */}
                    {print.style && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-medium text-gray-700 shadow-sm">
                          {print.style}
                        </span>
                      </div>
                    )}
                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (isInWishlist(print.id)) {
                          removeFromWishlist(print.id);
                        } else {
                          addToWishlist(print);
                        }
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isInWishlist(print.id) ? "red" : "none"}
                        stroke={isInWishlist(print.id) ? "red" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-600"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>
                    {/* Quick Add */}
                    {print.available && (
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(print);
                          }}
                          className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all duration-200 shadow-lg"
                        >
                          {t("addToCart")}
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/gallery/${print.id}`}>
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors text-sm md:text-base truncate">
                      {print.title}
                    </h3>
                  </Link>
                  {print.artist && print.artistId && (
                    <Link
                      href={`/artists/${print.artistId}`}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-0.5 inline-block"
                    >
                      by {print.artist}
                    </Link>
                  )}
                  {print.medium && (
                    <p className="text-xs text-gray-400 mt-1.5">{print.medium}</p>
                  )}
                  {print.dimensions && (
                    <p className="text-xs text-gray-400">{print.dimensions}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    {print.available ? (
                      <>
                        <p className="text-base font-bold text-gray-900">
                          {formatPrice(print.price)}
                        </p>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50 text-[10px] font-medium">
                          Available
                        </Badge>
                      </>
                    ) : (
                      <Badge className="bg-gray-900 text-white border-0 text-[10px] font-medium">
                        SOLD
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="border-t border-gray-100 bg-stone-50/50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Certificate of Authenticity</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Every print comes with a signed certificate verifying its authenticity and edition number.
                </p>
              </div>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Museum-Quality Paper</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Printed on archival-grade, acid-free paper using pigment-based inks for lasting color.
                </p>
              </div>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2" />
                    <path d="m7.5 4.27 9 5.15" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <line x1="12" x2="12" y1="22" y2="12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Secure Packaging</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Carefully packaged in rigid mailers with protective sleeves for safe delivery worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
