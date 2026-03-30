"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import TestimonialsSection from "@/components/testimonials-section";
import { AdBanner } from "@/components/adsense";

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  medium: string;
  style: string;
  category: string;
  dimensions: string;
  year: number;
  available: boolean;
  artist?: {
    id: string;
    displayName: string;
  };
}

export default function Home() {
  const router = useRouter();
  const { t, formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePaintings, setVisiblePaintings] = useState(12);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroScrollRef = useRef<HTMLDivElement>(null);

  // Fetch artworks from API
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/artworks?limit=50');
        if (response.ok) {
          const data = await response.json();
          setArtworks(data.artworks || []);
        }
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const featuredPaintings = artworks.slice(0, visiblePaintings);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const heroScrollLeft = () => {
    if (heroScrollRef.current) {
      const slide = heroScrollRef.current.firstElementChild as HTMLElement;
      if (slide) {
        heroScrollRef.current.scrollBy({ left: -(slide.offsetWidth + 24), behavior: "smooth" });
      }
    }
  };

  const heroScrollRight = () => {
    if (heroScrollRef.current) {
      const slide = heroScrollRef.current.firstElementChild as HTMLElement;
      if (slide) {
        heroScrollRef.current.scrollBy({ left: slide.offsetWidth + 24, behavior: "smooth" });
      }
    }
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setSubscriptionStatus("error");
      return;
    }

    setIsSubscribing(true);

    // Simulate API call
    setTimeout(() => {
      setSubscriptionStatus("success");
      setEmail("");
      setIsSubscribing(false);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus("idle");
      }, 5000);
    }, 1000);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Horizontal Scroll Frame */}
      <section className="pt-6 pb-8 md:py-16 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Exclusive Original Artworks</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={heroScrollLeft}
                className="rounded-full h-10 w-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={heroScrollRight}
                className="rounded-full h-10 w-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Style Buttons */}
          <div className="mb-5 md:mb-6">
            <p className="text-sm text-gray-500 italic mb-2 md:mb-3">Browse by style</p>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory md:flex-wrap" style={{ scrollbarWidth: "thin" }}>
              <button
                onClick={() => router.push('/gallery?category=Baroque')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Baroque
              </button>
              <button
                onClick={() => router.push('/gallery?category=Expressionism')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Expressionism
              </button>
              <button
                onClick={() => router.push('/gallery?category=Impressionism')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Impressionism
              </button>
              <button
                onClick={() => router.push('/gallery?category=Abstract')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Abstract
              </button>
              <button
                onClick={() => router.push('/gallery?category=Photography')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Photography
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative -mx-4 md:mx-0">
            <div
              ref={heroScrollRef}
              className="flex gap-6 overflow-x-auto pb-0 md:pb-4 snap-x snap-mandatory px-4 md:px-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Main Hero Card */}
              <div className="flex-shrink-0 w-[calc(100vw-32px)] md:w-[700px] lg:w-[900px] snap-start">
                {/* Mobile Layout - Framed */}
                <div className="md:hidden relative h-[424px] p-2">
                  {/* Decorative Frame */}
                  <div className="relative h-full rounded-[16px] border-[2px] border-amber-600/80 bg-gradient-to-br from-zinc-900 to-zinc-800 overflow-hidden shadow-[0_0_0_4px_rgba(120,53,15,0.3)]">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
                        alt="Featured Artwork"
                        fill
                        className="object-cover opacity-50"
                        priority
                      />
                    </div>
                    {/* Frame Inner Border */}
                    <div className="absolute inset-1.5 border border-amber-500/30 rounded-[12px] pointer-events-none" />

                    {/* Content Inside Frame */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      {/* Top Section - Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-amber-900/60 backdrop-blur-sm text-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-medium w-fit border border-amber-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19l7-7 3 3-7 7-3-3z" />
                          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                          <path d="M2 2l7.586 7.586" />
                          <circle cx="11" cy="11" r="2" />
                        </svg>
                        Original Artworks
                      </div>

                      {/* Bottom Section - Content & Buttons */}
                      <div>
                        {/* Main Headline */}
                        <h1 className="text-2xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
                          Where Art <span className="text-amber-200">Meets Soul</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xs text-white/80 mb-3 drop-shadow">
                          Discover unique paintings crafted with passion.
                        </p>

                        {/* CTA Buttons & Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="h-8 px-3 text-xs bg-amber-600 text-white hover:bg-amber-500 border-0">
                              <Link href="/signup">
                                Sell Art
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs bg-white/10 text-white border border-white/30 hover:bg-white/20">
                              <Link href="/gallery">
                                Gallery
                              </Link>
                            </Button>
                          </div>
                          {/* Mobile Stats */}
                          <div className="flex gap-2">
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">50+</p>
                              <p className="text-white/60 text-[8px]">Works</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">100%</p>
                              <p className="text-white/60 text-[8px]">Original</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden md:block relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[16px] overflow-hidden h-[450px]">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
                      alt="Featured Artwork"
                      fill
                      className="object-cover opacity-40"
                      priority
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-center p-12">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="M2 2l7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                      </svg>
                      Original Artworks
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      Where Art<br />
                      <span className="text-white">Meets Soul</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg text-white/70 mb-8 max-w-lg">
                      Discover unique paintings crafted with passion. Each artwork tells
                      a story waiting to become part of your world.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="px-8 bg-white text-black hover:bg-white/90">
                        <Link href="/signup">
                          Sell your Art
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="px-8 bg-white/20 text-white border border-white/30 hover:bg-white/30">
                        <Link href="/gallery">
                          Browse Gallery
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Stats - Bottom Right */}
                  <div className="flex absolute bottom-6 right-6 gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">50+</p>
                      <p className="text-white/60 text-xs">Artworks</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">12</p>
                      <p className="text-white/60 text-xs">Countries</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">100%</p>
                      <p className="text-white/60 text-xs">Original</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 2 - New Collection */}
              <div className="flex-shrink-0 w-[calc(100vw-32px)] md:w-[700px] lg:w-[900px] snap-start">
                {/* Mobile Layout - Framed */}
                <div className="md:hidden relative h-[424px] p-2">
                  <div className="relative h-full rounded-[16px] border-[2px] border-emerald-600/80 bg-gradient-to-br from-emerald-900 to-emerald-800 overflow-hidden shadow-[0_0_0_4px_rgba(5,150,105,0.3)]">
                    <div className="absolute inset-0">
                      <Image
                        src="https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=1200&q=80"
                        alt="New Collection"
                        fill
                        className="object-cover opacity-50"
                      />
                    </div>
                    <div className="absolute inset-1.5 border border-emerald-500/30 rounded-[12px] pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      {/* Top Section - Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 backdrop-blur-sm text-emerald-100 px-2.5 py-1 rounded-lg text-[10px] font-medium w-fit border border-emerald-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                        New Collection
                      </div>

                      {/* Bottom Section - Content & Buttons */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
                          Spring 2026 <span className="text-emerald-200">Collection</span>
                        </h2>
                        <p className="text-xs text-white/80 mb-3 drop-shadow">
                          Fresh perspectives inspired by the renewal of spring.
                        </p>
                        {/* CTA Buttons & Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="h-8 px-3 text-xs bg-emerald-600 text-white hover:bg-emerald-500 border-0">
                              <Link href="/gallery">
                                Explore
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs bg-white/10 text-white border border-white/30 hover:bg-white/20">
                              <Link href="/gallery?category=Abstract">
                                Abstract
                              </Link>
                            </Button>
                          </div>
                          {/* Mobile Stats */}
                          <div className="flex gap-2">
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">15+</p>
                              <p className="text-white/60 text-[8px]">New</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">2026</p>
                              <p className="text-white/60 text-[8px]">Season</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden md:block relative bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-[16px] overflow-hidden h-[450px]">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=1200&q=80"
                      alt="New Collection"
                      fill
                      className="object-cover opacity-40"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-center p-12">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      New Collection
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      Spring 2026<br />
                      <span className="text-white">Collection</span>
                    </h2>
                    <p className="text-lg text-white/70 mb-8 max-w-lg">
                      Explore our latest collection featuring vibrant colors and fresh perspectives inspired by the renewal of spring.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="px-8 bg-white text-black hover:bg-white/90">
                        <Link href="/gallery">
                          Explore Collection
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="px-8 bg-white/20 text-white border border-white/30 hover:bg-white/30">
                        <Link href="/gallery?category=Abstract">
                          View Abstract Art
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex absolute bottom-6 right-6 gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">15+</p>
                      <p className="text-white/60 text-xs">New Works</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">2026</p>
                      <p className="text-white/60 text-xs">Season</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 3 - Limited Offer */}
              <div className="flex-shrink-0 w-[calc(100vw-32px)] md:w-[700px] lg:w-[900px] snap-start">
                {/* Mobile Layout - Framed */}
                <div className="md:hidden relative h-[424px] p-2">
                  <div className="relative h-full rounded-[16px] border-[2px] border-orange-600/80 bg-gradient-to-br from-amber-900 to-orange-800 overflow-hidden shadow-[0_0_0_4px_rgba(234,88,12,0.3)]">
                    <div className="absolute inset-0">
                      <Image
                        src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80"
                        alt="Worldwide Shipping"
                        fill
                        className="object-cover opacity-50"
                      />
                    </div>
                    <div className="absolute inset-1.5 border border-orange-500/30 rounded-[12px] pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      {/* Top Section - Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-orange-900/60 backdrop-blur-sm text-orange-100 px-2.5 py-1 rounded-lg text-[10px] font-medium w-fit border border-orange-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        Limited Time
                      </div>

                      {/* Bottom Section - Content & Buttons */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
                          Free Shipping <span className="text-orange-200">Worldwide</span>
                        </h2>
                        <p className="text-xs text-white/80 mb-3 drop-shadow">
                          Complimentary shipping on all original artworks.
                        </p>
                        {/* CTA Buttons & Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="h-8 px-3 text-xs bg-orange-600 text-white hover:bg-orange-500 border-0">
                              <Link href="/gallery">
                                Shop Now
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs bg-white/10 text-white border border-white/30 hover:bg-white/20">
                              <Link href="/support">
                                Learn More
                              </Link>
                            </Button>
                          </div>
                          {/* Mobile Stats */}
                          <div className="flex gap-2">
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">€0</p>
                              <p className="text-white/60 text-[8px]">Shipping</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">7</p>
                              <p className="text-white/60 text-[8px]">Days Left</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden md:block relative bg-gradient-to-br from-amber-900 to-orange-800 rounded-[16px] overflow-hidden h-[450px]">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80"
                      alt="Worldwide Shipping"
                      fill
                      className="object-cover opacity-40"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-center p-12">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      Limited Time Offer
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      Free Shipping<br />
                      <span className="text-white">Worldwide</span>
                    </h2>
                    <p className="text-lg text-white/70 mb-8 max-w-lg">
                      For a limited time, enjoy complimentary worldwide shipping on all original artworks. Start your collection today.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="px-8 bg-white text-black hover:bg-white/90">
                        <Link href="/gallery">
                          Shop Now
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="px-8 bg-white/20 text-white border border-white/30 hover:bg-white/30">
                        <Link href="/support">
                          Learn More
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex absolute bottom-6 right-6 gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">€0</p>
                      <p className="text-white/60 text-xs">Shipping</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">7 Days</p>
                      <p className="text-white/60 text-xs">Left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 4 - Meet the Artist */}
              <div className="flex-shrink-0 w-[calc(100vw-32px)] md:w-[700px] lg:w-[900px] snap-start">
                {/* Mobile Layout - Framed */}
                <div className="md:hidden relative h-[424px] p-2">
                  <div className="relative h-full rounded-[16px] border-[2px] border-purple-600/80 bg-gradient-to-br from-purple-900 to-indigo-800 overflow-hidden shadow-[0_0_0_4px_rgba(147,51,234,0.3)]">
                    <div className="absolute inset-0">
                      <Image
                        src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80"
                        alt="Meet the Artist"
                        fill
                        className="object-cover opacity-50"
                      />
                    </div>
                    <div className="absolute inset-1.5 border border-purple-500/30 rounded-[12px] pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      {/* Top Section - Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-purple-900/60 backdrop-blur-sm text-purple-100 px-2.5 py-1 rounded-lg text-[10px] font-medium w-fit border border-purple-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Artist Spotlight
                      </div>

                      {/* Bottom Section - Content & Buttons */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
                          Meet <span className="text-purple-200">Lamiart</span>
                        </h2>
                        <p className="text-xs text-white/80 mb-3 drop-shadow">
                          Discover the story behind the art.
                        </p>
                        {/* CTA Buttons & Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="h-8 px-3 text-xs bg-purple-600 text-white hover:bg-purple-500 border-0">
                              <Link href="/artist/1">
                                Read Story
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs bg-white/10 text-white border border-white/30 hover:bg-white/20">
                              <Link href="/gallery?artist=1">
                                Artworks
                              </Link>
                            </Button>
                          </div>
                          {/* Mobile Stats */}
                          <div className="flex gap-2">
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">10+</p>
                              <p className="text-white/60 text-[8px]">Years</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                              <p className="text-sm font-bold text-white">50+</p>
                              <p className="text-white/60 text-[8px]">Works</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden md:block relative bg-gradient-to-br from-purple-900 to-indigo-800 rounded-[16px] overflow-hidden h-[450px]">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80"
                      alt="Meet the Artist"
                      fill
                      className="object-cover opacity-40"
                    />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-center p-12">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Artist Spotlight
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      Meet<br />
                      <span className="text-white">Lamiart</span>
                    </h2>
                    <p className="text-lg text-white/70 mb-8 max-w-lg">
                      Discover the story behind the art. Learn about Lamiart&apos;s journey, inspiration, and creative process.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="px-8 bg-white text-black hover:bg-white/90">
                        <Link href="/artist/1">
                          Read Story
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="px-8 bg-white/20 text-white border border-white/30 hover:bg-white/30">
                        <Link href="/gallery?artist=1">
                          View Artworks
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex absolute bottom-6 right-6 gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">10+</p>
                      <p className="text-white/60 text-xs">Years</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-2xl font-bold text-white">50+</p>
                      <p className="text-white/60 text-xs">Artworks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Collection Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-mono">
              Here are our
            </p>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              {t("featuredWorks")}
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
              The role that curators play, like the art they care for, is constantly evolving. Each piece is carefully selected for its exceptional quality and artistic merit.
            </p>
          </div>
          <div className="flex justify-center mb-12">
            {visiblePaintings < artworks.length && (
              <button
                onClick={() => setVisiblePaintings(prev => Math.min(prev + 4, artworks.length))}
                className="mt-6 md:mt-0 group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-300 text-stone-600 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-coffee hover:text-white hover:border-coffee transition-all"
              >
                <span>See More</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-1 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Price Filters */}
          <div className="mb-10">
            <p className="text-sm text-stone-400 italic mb-3">Shop by your budget</p>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory md:flex-wrap" style={{ scrollbarWidth: "thin" }}>
              <button
                onClick={() => router.push('/gallery?maxPrice=500')}
                className="flex-shrink-0 px-5 py-2 text-sm font-medium rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                Under &euro;500
              </button>
              <button
                onClick={() => router.push('/gallery?minPrice=1000&maxPrice=3000')}
                className="flex-shrink-0 px-5 py-2 text-sm font-medium rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                &euro;1000 - &euro;3000
              </button>
              <button
                onClick={() => router.push('/gallery?minPrice=3000&maxPrice=5000')}
                className="flex-shrink-0 px-5 py-2 text-sm font-medium rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                &euro;3000 - &euro;5000
              </button>
              <button
                onClick={() => router.push('/gallery?minPrice=5000&maxPrice=10000')}
                className="flex-shrink-0 px-5 py-2 text-sm font-medium rounded-lg border border-stone-300 bg-white text-stone-600 hover:bg-coffee hover:text-white hover:border-coffee transition-all snap-start"
              >
                &euro;5000 - &euro;10000
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white overflow-hidden animate-pulse border border-stone-200 rounded-lg">
                  <div className="aspect-[4/5] bg-stone-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-5 bg-stone-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredPaintings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {featuredPaintings.map((painting) => (
                <div
                  key={painting.id}
                  className="group bg-white overflow-hidden border border-stone-200 hover:border-stone-400 transition-all duration-500 rounded-lg"
                >
                  <Link href={`/gallery/${painting.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
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
                            addToWishlist({
                              ...painting,
                              artist: painting.artist?.displayName,
                            });
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
                              addToCart({
                                id: painting.id,
                                title: painting.title,
                                price: painting.price,
                                image: painting.image,
                                description: painting.description,
                                dimensions: painting.dimensions,
                                medium: painting.medium,
                                year: painting.year,
                                category: painting.category,
                                style: painting.style,
                                available: painting.available,
                              });
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
                      <h3 className="font-semibold text-stone-900 group-hover:text-stone-600 transition-colors">
                        {painting.title}
                      </h3>
                    </Link>
                    {painting.artist && (
                      <Link
                        href={`/artists/${painting.artist.id}`}
                        className="text-xs text-stone-400 hover:text-stone-600 transition-colors mt-0.5 inline-block"
                      >
                        by {painting.artist.displayName}
                      </Link>
                    )}
                    <p className="text-sm text-stone-500 mt-1">{painting.medium}</p>
                    <p className="text-sm text-stone-400">{painting.dimensions}</p>
                    <div className="flex items-center justify-between mt-3">
                      {painting.available ? (
                        <>
                          <p className="text-lg font-bold text-stone-900">
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
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-stone-900">No artworks yet</h3>
              <p className="text-stone-500 mb-6">Check back soon for new artwork additions!</p>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Statement - Editorial Quote */}
      <section className="py-24 md:py-32 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-black leading-snug max-w-4xl mx-auto mb-10">
            The Art Gallery with its unique collection is among those museums that attracts a wide array of people and is among the rare that have residencies.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mt-16">
            <div className="text-center">
              <p className="font-playfair text-3xl md:text-4xl font-bold text-black">50+</p>
              <p className="text-xs uppercase tracking-widest text-stone-400 mt-2 font-mono">Artworks</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-3xl md:text-4xl font-bold text-black">12</p>
              <p className="text-xs uppercase tracking-widest text-stone-400 mt-2 font-mono">Countries</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-3xl md:text-4xl font-bold text-black">100%</p>
              <p className="text-xs uppercase tracking-widest text-stone-400 mt-2 font-mono">Original</p>
            </div>
            <div className="text-center">
              <p className="font-playfair text-3xl md:text-4xl font-bold text-black">120+</p>
              <p className="text-xs uppercase tracking-widest text-stone-400 mt-2 font-mono">Collectors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="container mx-auto px-4">
        <AdBanner />
      </div>

      {/* Curated Artist Section */}
      <section className="py-20 md:py-28 bg-white border-t border-stone-200 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-mono">
                Curated Selection
              </p>
              <h2 className="font-playfair text-3xl md:text-5xl font-bold text-black leading-tight">
                {t("favoriteArtist")}
              </h2>
              <p className="text-stone-500 mt-3 max-w-md">
                {t("favoriteArtistSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 md:mt-0">
              <Link
                href="/gallery"
                className="px-6 py-2.5 bg-transparent border border-stone-300 text-stone-600 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-coffee hover:text-white hover:border-coffee transition-all"
              >
                See More
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                className="rounded-lg h-10 w-10 border-stone-300 hover:bg-coffee hover:text-white hover:border-coffee"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                className="rounded-lg h-10 w-10 border-stone-300 hover:bg-coffee hover:text-white hover:border-coffee"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
            {artworks.map((painting) => (
              <div
                key={painting.id}
                className="group flex-shrink-0 w-[200px] md:w-[280px] snap-start overflow-hidden"
              >
                <Link href={`/gallery/${painting.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
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
                          addToWishlist({
                            ...painting,
                            artist: painting.artist?.displayName,
                          });
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
                            addToCart({
                              id: painting.id,
                              title: painting.title,
                              price: painting.price,
                              image: painting.image,
                              description: painting.description,
                              dimensions: painting.dimensions,
                              medium: painting.medium,
                              year: painting.year,
                              category: painting.category,
                              style: painting.style,
                              available: painting.available,
                            });
                          }}
                        >
                          {t("addToCart")}
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="pt-4 pb-2">
                  <Link href={`/gallery/${painting.id}`}>
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-600 transition-colors">
                      {painting.title}
                    </h3>
                  </Link>
                  {painting.artist && (
                    <Link
                      href={`/artists/${painting.artist.id}`}
                      className="text-xs text-stone-400 hover:text-stone-600 transition-colors mt-0.5 inline-block"
                    >
                      by {painting.artist.displayName}
                    </Link>
                  )}
                  <p className="text-sm text-stone-500 mt-1">{painting.medium}</p>
                  <p className="text-sm text-stone-400">{painting.dimensions}</p>
                  <div className="flex items-center justify-between mt-3">
                    {painting.available ? (
                      <>
                        <p className="text-lg font-bold text-stone-900">
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
          </div>
        </div>
      </section>

      {/* Gallery Promise Section */}
      <section className="py-20 md:py-24 bg-coffee relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-400 mb-4 font-mono">
              Trust &amp; Quality
            </p>
            <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4 text-white">
              {t("whyShopTitle")}
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              {t("whyShopSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {/* Secure Shipping */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.29 7 12 12 20.71 7" />
                  <line x1="12" x2="12" y1="22" y2="12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("secureShipping")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("secureShippingDesc")}
              </p>
            </div>

            {/* 100% Authentic */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("authenticArt")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("authenticArtDesc")}
              </p>
            </div>

            {/* 14-Day Returns */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M12 7v5l4 2" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("easyReturns")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("easyReturnsDesc")}
              </p>
            </div>

            {/* Secure Payment */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("securePayment")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("securePaymentDesc")}
              </p>
            </div>

            {/* Direct from Artist */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("directFromArtist")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("directFromArtistDesc")}
              </p>
            </div>

            {/* Expert Support */}
            <div className="bg-white/5 p-5 md:p-6 border border-white/10 hover:border-white/30 transition-all text-center group rounded-lg">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1 text-white">{t("expertSupport")}</h3>
              <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                {t("expertSupportDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collector Voices - Testimonials */}
      <section className="py-20 md:py-28 bg-white border-t border-stone-200 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-mono">
              Testimonials
            </p>
            <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-4 text-black">
              What Collectors Say
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Discover why art enthusiasts around the world choose Alternus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 border border-stone-200 hover:border-stone-400 transition-all duration-500 relative group rounded-lg">
              <div className="absolute top-0 left-8 w-8 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-b-full" />
              <div className="pt-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-200 mb-4">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.006z"/>
                </svg>
                <p className="text-stone-600 mb-6 leading-relaxed italic">
                  &quot;The artwork I purchased exceeded all my expectations. The quality is outstanding
                  and the customer service was impeccable from start to finish.&quot;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    SM
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">Sarah Mitchell</p>
                    <p className="text-xs text-stone-400">Art Collector, London</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 border border-stone-200 hover:border-stone-400 transition-all duration-500 relative group rounded-lg">
              <div className="absolute top-0 left-8 w-8 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-b-full" />
              <div className="pt-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-200 mb-4">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.006z"/>
                </svg>
                <p className="text-stone-600 mb-6 leading-relaxed italic">
                  &quot;Alternus made buying art online feel personal and trustworthy.
                  The piece arrived beautifully packaged and now sits proudly in my living room.&quot;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    JK
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">James Kowalski</p>
                    <p className="text-xs text-stone-400">Interior Designer, New York</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 border border-stone-200 hover:border-stone-400 transition-all duration-500 relative group rounded-lg">
              <div className="absolute top-0 left-8 w-8 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-b-full" />
              <div className="pt-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-200 mb-4">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.006z"/>
                </svg>
                <p className="text-stone-600 mb-6 leading-relaxed italic">
                  &quot;As a first-time art buyer, I was nervous about investing. The Alternus team
                  guided me through the process and helped me find the perfect piece.&quot;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    AR
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">Ana Rodriguez</p>
                    <p className="text-xs text-stone-400">Entrepreneur, Madrid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section - Immersive Split */}
      <section className="py-0 overflow-hidden relative">
        <div className="grid lg:grid-cols-2 min-h-[600px] md:min-h-[700px]">
          {/* Left - Dark Content Side */}
          <div className="bg-coffee py-20 md:py-28 px-6 md:px-16 lg:px-20 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-coffee/30 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-orange-400 mb-6 font-mono">Our Philosophy</p>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-white mb-6">
                Art that
                <span className="block text-orange-400">speaks.</span>
              </h2>
              <p className="text-lg md:text-xl text-stone-400 leading-relaxed max-w-lg mb-10">
                A curated platform connecting exceptional artists with passionate collectors worldwide.
              </p>
              <div className="w-16 h-px bg-gradient-to-r from-amber-500/50 to-transparent mb-10" />

              {/* Key Points */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Verified Artists</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">Every artist is carefully vetted for authenticity and quality</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Museum Quality</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">Premium materials and archival-grade standards for every piece</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Global Reach</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">Secure worldwide shipping with professional packaging</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors">
                  Learn More About Us
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right - Single Featured Image */}
          <div className="relative bg-coffee hidden lg:block">
            <Image
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
              alt="Art Gallery"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-coffee/30 to-coffee/80" />
            {/* Floating stat cards */}
            <div className="absolute bottom-10 left-10 right-10 flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-5 py-4 border border-white/10">
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-xs text-stone-400 uppercase tracking-wider">Artworks</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-5 py-4 border border-white/10">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-stone-400 uppercase tracking-wider">Countries</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-5 py-4 border border-white/10">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-stone-400 uppercase tracking-wider">Original</p>
              </div>
            </div>
          </div>
          {/* Mobile Image */}
          <div className="lg:hidden relative h-[300px] bg-coffee">
            <Image
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80"
              alt="Art Gallery"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/10">
                <p className="text-lg font-bold text-white">50+</p>
                <p className="text-[10px] text-stone-400 uppercase">Artworks</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/10">
                <p className="text-lg font-bold text-white">12</p>
                <p className="text-[10px] text-stone-400 uppercase">Countries</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/10">
                <p className="text-lg font-bold text-white">100%</p>
                <p className="text-[10px] text-stone-400 uppercase">Original</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <TestimonialsSection />

      {/* How It Works - Gallery Process */}
      <section className="py-20 md:py-28 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-mono">Simple Process</p>
            <h2 className="font-playfair text-3xl md:text-5xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">From discovery to display, we make collecting art effortless</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 md:gap-6 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-coffee rounded-lg flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Step 1</p>
              <h3 className="font-semibold text-stone-900 mb-2">Discover</h3>
              <p className="text-sm text-stone-500">Browse our curated collection of original artworks from verified artists</p>
            </div>
            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-coffee rounded-lg flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Step 2</p>
              <h3 className="font-semibold text-stone-900 mb-2">Select</h3>
              <p className="text-sm text-stone-500">Choose the piece that speaks to you with detailed views and artist stories</p>
            </div>
            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-coffee rounded-lg flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.29 7 12 12 20.71 7" />
                  <line x1="12" x2="12" y1="22" y2="12" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Step 3</p>
              <h3 className="font-semibold text-stone-900 mb-2">Deliver</h3>
              <p className="text-sm text-stone-500">Secure worldwide shipping with professional packaging and tracking</p>
            </div>
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-coffee rounded-lg flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Step 4</p>
              <h3 className="font-semibold text-stone-900 mb-2">Display</h3>
              <p className="text-sm text-stone-500">Hang your artwork and enjoy a museum-quality piece in your space</p>
            </div>
          </div>
        </div>
      </section>

      {/* Art Categories Showcase */}
      <section className="py-16 md:py-24 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-4 font-mono">Explore Styles</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-black">Find Your Style</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Link href="/gallery?category=Baroque" className="group relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80" alt="Baroque" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Baroque</h3>
                <p className="text-white/70 text-xs mt-1">Classical elegance</p>
              </div>
            </Link>
            <Link href="/gallery?category=Impressionism" className="group relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image src="https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=600&q=80" alt="Impressionism" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Impressionism</h3>
                <p className="text-white/70 text-xs mt-1">Light and color</p>
              </div>
            </Link>
            <Link href="/gallery?category=Abstract" className="group relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80" alt="Abstract" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Abstract</h3>
                <p className="text-white/70 text-xs mt-1">Bold expression</p>
              </div>
            </Link>
            <Link href="/gallery?category=Photography" className="group relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80" alt="Photography" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Photography</h3>
                <p className="text-white/70 text-xs mt-1">Captured moments</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="container mx-auto px-4">
        <AdBanner />
      </div>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/80">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
              Stay Updated
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              Join Our Newsletter
            </h2>
            <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
              Get notified about new artworks, exclusive offers, and artist stories.
            </p>

            {/* Modern Email Input */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscribe}>
                <div className={`flex items-center gap-3 p-1.5 bg-gray-100/80 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border transition-colors ${
                  subscriptionStatus === "error" ? "border-red-300" : "border-gray-200/50"
                }`}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subscriptionStatus === "error") {
                        setSubscriptionStatus("idle");
                      }
                    }}
                    disabled={isSubscribing}
                    className="flex-1 px-5 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing || subscriptionStatus === "success"}
                    className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubscribing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : subscriptionStatus === "success" ? (
                      "Subscribed!"
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
              </form>

              {/* Status Messages */}
              {subscriptionStatus === "success" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-sm font-medium">Successfully subscribed! Check your email.</p>
                </div>
              )}

              {subscriptionStatus === "error" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <p className="text-sm font-medium">Please enter a valid email address.</p>
                </div>
              )}

              {subscriptionStatus === "idle" && (
                <p className="text-[11px] text-gray-400 mt-4">
                  No spam, unsubscribe anytime.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
