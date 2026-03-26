"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage, useCart, useWishlist } from "@/components/providers";
import { ReviewsSection } from "@/components/reviews-section";
import { SocialShare } from "@/components/social-share";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { ARViewer } from "@/components/ar-viewer";
import { Painting } from "@/lib/paintings";

interface PaintingPageProps {
  params: { id: string };
}

type ViewMode = "original" | "black-frame" | "white-frame" | "room";

export default function PaintingPage({ params }: PaintingPageProps) {
  const router = useRouter();
  const { t, formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [painting, setPainting] = useState<Painting | null>(null);
  const [relatedPaintings, setRelatedPaintings] = useState<Painting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("original");
  const [views, setViews] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState<"none" | "black" | "white">("none");
  const [roomImage, setRoomImage] = useState("/roomart.jpg");
  const [roomImageInput, setRoomImageInput] = useState<HTMLInputElement | null>(null);

  const handleRoomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRoomImage(url);
    }
  };

  // Fetch artwork from API
  useEffect(() => {
    async function fetchArtwork() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/artworks/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          return;
        }

        const data = await response.json();

        const mappedPainting: Painting = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          price: data.price,
          dimensions: data.dimensions || '',
          medium: data.medium || '',
          year: data.year || new Date().getFullYear(),
          category: data.category || 'Painting',
          style: data.style || 'Contemporary',
          image: data.image,
          available: data.available,
          artist: data.artist?.displayName,
          artistId: data.artist?.id,
        };

        setPainting(mappedPainting);

        // Fetch related artworks
        const relatedResponse = await fetch(`/api/artworks?style=${data.style}&limit=5`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          const related = relatedData.artworks
            .filter((a: { id: string }) => a.id !== params.id)
            .slice(0, 4)
            .map((artwork: {
              id: string;
              title: string;
              price: number;
              image: string;
              style?: string;
              category?: string;
            }) => ({
              id: artwork.id,
              title: artwork.title,
              price: artwork.price,
              image: artwork.image,
              style: artwork.style,
              category: artwork.category,
            }));
          setRelatedPaintings(related);
        }
      } catch (error) {
        console.error('Error fetching artwork:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtwork();
  }, [params.id]);

  const frameOptions: { id: "none" | "black" | "white"; label: string; price: number }[] = [
    { id: "none", label: "No Frame", price: 0 },
    { id: "black", label: "Black Frame", price: 50 },
    { id: "white", label: "White Frame", price: 50 },
  ];

  const selectedFrameOption = frameOptions.find(f => f.id === selectedFrame);
  const totalPrice = (painting?.price || 0) + (selectedFrameOption?.price || 0);

  useEffect(() => {
    // Increment view count when page loads and fetch updated count
    const trackView = async () => {
      try {
        const response = await fetch(`/api/artworks/${params.id}/views`, {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setViews(data.views || 0);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };
    trackView();
  }, [params.id]);

  // Handle escape key to close zoom
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isZoomed]);

  // Handle zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleZoomReset = () => setZoomLevel(1);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 w-20">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
              <div className="flex-1 aspect-[4/5] rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-12 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-10 w-1/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !painting) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Artwork Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The artwork you&apos;re looking for might have been removed or doesn&apos;t exist.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      {/* Hidden file input for room image upload */}
      <input
        ref={setRoomImageInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleRoomImageUpload}
      />
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gallery", href: "/gallery" },
            { label: painting.title },
          ]}
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="flex gap-2 sm:gap-4">
            {/* Thumbnail Preview Column */}
            <div className="flex flex-col gap-2 sm:gap-3 w-16 sm:w-20 flex-shrink-0">
              {/* Original Thumbnail */}
              <button
                onClick={() => setViewMode("original")}
                className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  viewMode === "original"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <Image
                  src={painting.image}
                  alt="Original"
                  fill
                  className="object-cover"
                />
              </button>

              {/* Black Frame Thumbnail */}
              <button
                onClick={() => setViewMode("black-frame")}
                className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  viewMode === "black-frame"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div className="relative w-full h-full p-2 bg-gray-900">
                  <div className="relative w-full h-full border-2 border-black">
                    <Image
                      src={painting.image}
                      alt="Black Frame"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </button>

              {/* White Frame Thumbnail */}
              <button
                onClick={() => setViewMode("white-frame")}
                className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  viewMode === "white-frame"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div className="relative w-full h-full p-2 bg-gray-100">
                  <div className="relative w-full h-full border-2 border-white">
                    <Image
                      src={painting.image}
                      alt="White Frame"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </button>

              {/* In Room Thumbnail */}
              <button
                onClick={() => setViewMode("room")}
                className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  viewMode === "room"
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={roomImage}
                    alt="In Room Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: "42%", height: "50%" }}
                  >
                    <div className="relative w-full h-full p-[2px]" style={{ background: 'linear-gradient(180deg, #9e7c5a, #6b4d2e)' }}>
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={painting.image}
                          alt="In Room Thumbnail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Main Image Display */}
            <div className="flex-1 space-y-4">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted group">
              {viewMode === "original" && (
                <Image
                  src={painting.image}
                  alt={painting.title}
                  fill
                  className="object-cover cursor-zoom-in"
                  priority
                  onClick={() => setIsZoomed(true)}
                />
              )}
              {viewMode === "black-frame" && (
                <div className="relative w-full h-full p-8 bg-gray-900">
                  <div className="relative w-full h-full border-8 border-black shadow-2xl">
                    <Image
                      src={painting.image}
                      alt={painting.title}
                      fill
                      className="object-cover cursor-zoom-in"
                      onClick={() => setIsZoomed(true)}
                    />
                  </div>
                </div>
              )}
              {viewMode === "white-frame" && (
                <div className="relative w-full h-full p-8 bg-gray-100">
                  <div className="relative w-full h-full border-8 border-white shadow-2xl">
                    <Image
                      src={painting.image}
                      alt={painting.title}
                      fill
                      className="object-cover cursor-zoom-in"
                      onClick={() => setIsZoomed(true)}
                    />
                  </div>
                </div>
              )}
              {viewMode === "room" && (
                <div className="relative w-full h-full">
                  {/* Room Background */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={roomImage}
                    alt="Living Room Interior"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  {/* Artwork centered in frame */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: "42%", height: "50%" }}
                  >
                    <div className="relative w-full h-full shadow-2xl" style={{ padding: '6px', background: 'linear-gradient(180deg, #9e7c5a 0%, #7a5c3a 50%, #6b4d2e 100%)' }}>
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={painting.image}
                          alt={painting.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Upload Room Image Button */}
                  <button
                    onClick={() => roomImageInput?.click()}
                    className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all text-white"
                    title="Upload your own room photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </button>
                  {/* Label */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-white text-sm font-medium">View in Room</p>
                  </div>
                </div>
              )}

              {/* Zoom Button Overlay */}
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <line x1="11" x2="11" y1="8" y2="14" />
                  <line x1="8" x2="14" y1="11" y2="11" />
                </svg>
              </button>

              {!painting.available && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-sm font-bold px-3 py-1 shadow-lg">
                    {t("sold")}
                  </Badge>
                </div>
              )}
            </div>

            {/* View Counter */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 sm:px-4 py-2.5 rounded-lg">
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
                className="text-primary flex-shrink-0 sm:w-[18px] sm:h-[18px]"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="font-semibold text-foreground">
                {views.toLocaleString()}
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                {views === 1 ? "person has" : "people have"} viewed this artwork
              </span>
              <span className="text-muted-foreground sm:hidden">
                views
              </span>
            </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-3 sm:mb-4">
              {painting.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {painting.title}
            </h1>

            {/* Artist Name */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
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
                className="text-muted-foreground sm:w-[18px] sm:h-[18px]"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-base sm:text-lg text-muted-foreground">
                by <Link href="/artist/1" className="font-semibold text-foreground hover:text-primary hover:underline transition-colors">Lamiart</Link>
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
              {formatPrice(painting.price)}
            </p>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {t("medium")}
                </p>
                <p className="font-medium text-sm sm:text-base">{painting.medium}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {t("dimensions")}
                </p>
                <p className="font-medium text-sm sm:text-base">{painting.dimensions}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {t("year")}
                </p>
                <p className="font-medium text-sm sm:text-base">{painting.year}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {painting.available ? (
                    <span className="text-green-600">{t("available")}</span>
                  ) : (
                    <span className="text-red-600">{t("sold")}</span>
                  )}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                {t("description")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {painting.description}
              </p>
            </div>

            {/* Social Share */}
            <div className="mb-6 sm:mb-8">
              <SocialShare
                title={painting.title}
                description={painting.description}
                url={`/gallery/${painting.id}`}
                imageUrl={painting.image}
              />
            </div>

            {painting.available ? (
              <div className="space-y-6 mt-auto">
                {/* Size Display */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Size</label>
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <p className="font-semibold text-sm">Original Size</p>
                    <p className="text-xs text-muted-foreground">{painting.dimensions}</p>
                    <p className="text-sm font-bold mt-1">{formatPrice(painting.price)}</p>
                  </div>
                </div>

                {/* Frame Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Frame Options</label>
                  <div className="grid grid-cols-3 gap-3">
                    {frameOptions.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame.id as "none" | "black" | "white")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedFrame === frame.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-semibold text-sm">{frame.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {frame.price > 0 ? `+${formatPrice(frame.price)}` : "Included"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-Order Information */}
                {painting.isPreOrder && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        Pre-Order Available
                      </Badge>
                      {painting.preOrderDiscount && (
                        <Badge variant="destructive" className="bg-red-500">
                          Save {painting.preOrderDiscount}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Release Date: {painting.preOrderReleaseDate && new Date(painting.preOrderReleaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-sm font-semibold text-purple-700">
                      Pre-order now to secure exclusive early-bird pricing!
                    </p>
                  </div>
                )}

                {/* Total Price */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Frame:</span>
                    <span className="font-medium">{selectedFrameOption?.label}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-2xl font-bold">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 text-lg"
                    onClick={() => addToCart(painting, selectedFrameOption)}
                  >
                    {painting.isPreOrder ? "Pre-Order Now" : t("addToCart")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      if (isInWishlist(painting.id)) {
                        removeFromWishlist(painting.id);
                      } else {
                        addToWishlist(painting);
                      }
                    }}
                    className="px-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={isInWishlist(painting.id) ? "red" : "none"}
                      stroke={isInWishlist(painting.id) ? "red" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </Button>
                </div>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href={`/support?painting=${painting.id}`}>
                    {t("inquire")}
                  </Link>
                </Button>
                <ARViewer painting={painting} />
                <p className="text-sm text-muted-foreground text-center">
                  Free shipping worldwide. 14-day return policy.
                </p>
              </div>
            ) : (
              <div className="bg-muted p-6 rounded-lg text-center mt-auto">
                <p className="text-muted-foreground mb-4">
                  This piece has been sold, but you can commission a similar work.
                </p>
                <Button asChild variant="outline">
                  <Link href="/support">Commission a Piece</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Shipping Calculator - Desktop Only (moved below main content on mobile) */}
          <div className="hidden lg:block lg:col-span-2 mt-8">
            <ShippingCalculator paintingPrice={painting.price} />
          </div>
        </div>

        {/* Shipping Calculator - Mobile */}
        <div className="lg:hidden mt-8">
          <ShippingCalculator paintingPrice={painting.price} />
        </div>

        {/* Reviews Section */}
        <ReviewsSection paintingId={painting.id} />

        {/* Related Works */}
        <div className="mt-16 sm:mt-24">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold">Similar Artworks</h2>
            <Link
              href={`/gallery?styles=${painting.style}`}
              className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 sm:gap-2"
            >
              View More {painting.style}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-4 sm:h-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedPaintings.map((relatedPainting) => (
                <Card
                  key={relatedPainting.id}
                  className="group overflow-hidden border-0 shadow-none bg-transparent"
                >
                  <Link href={`/gallery/${relatedPainting.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted mb-3">
                      <Image
                        src={relatedPainting.image}
                        alt={relatedPainting.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-0">
                      <h3 className="font-medium group-hover:underline">
                        {relatedPainting.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {formatPrice(relatedPainting.price)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => { setIsZoomed(false); setZoomLevel(1); }}
        >
          {/* Close Button */}
          <button
            onClick={() => { setIsZoomed(false); setZoomLevel(1); }}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
            aria-label="Close zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
              disabled={zoomLevel <= 1}
              aria-label="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomReset(); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white text-sm font-medium"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
              disabled={zoomLevel >= 4}
              aria-label="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <line x1="11" x2="11" y1="8" y2="14" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
          </div>

          {/* Zoomable Image Container */}
          <div
            className="relative w-full h-full overflow-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                width: '90vw',
                height: '90vh',
              }}
            >
              <Image
                src={painting.image}
                alt={painting.title}
                fill
                className="object-contain cursor-move"
                priority
                draggable={false}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full z-20">
            <p className="text-white text-sm flex items-center gap-4">
              <span>Use <kbd className="px-2 py-1 bg-white/20 rounded text-xs">+</kbd> / <kbd className="px-2 py-1 bg-white/20 rounded text-xs">-</kbd> to zoom</span>
              <span className="text-white/50">|</span>
              <span>Press <kbd className="px-2 py-1 bg-white/20 rounded text-xs">ESC</kbd> to close</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
