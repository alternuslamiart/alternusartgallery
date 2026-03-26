"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useCart, useWishlist } from "@/components/providers";

interface Artist {
  id: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  totalArtworks: number;
  totalSales: number;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  medium: string;
  style: string;
  dimensions: string;
  available: boolean;
}

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const { formatPrice, t } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArtistData() {
      try {
        setIsLoading(true);

        // Fetch artist info
        const artistResponse = await fetch(`/api/artists/${artistId}`);
        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          setArtist(artistData.artist);
        }

        // Fetch artist's artworks
        const artworksResponse = await fetch(`/api/artworks?artistId=${artistId}`);
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json();
          setArtworks(artworksData.artworks || []);
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (artistId) {
      fetchArtistData();
    }
  }, [artistId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
          <p className="text-gray-600 mb-6">The artist you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/gallery">Back to Gallery</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Artist Header */}
        <div className="bg-white rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {artist.profileImage ? (
                <Image
                  src={artist.profileImage}
                  alt={artist.displayName}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {artist.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist.displayName}</h1>
              {artist.bio && (
                <p className="text-gray-600 mb-4 max-w-2xl">{artist.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Artworks</p>
                  <p className="text-xl font-bold text-gray-900">{artworks.length}</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Sold</p>
                  <p className="text-xl font-bold text-gray-900">{artist.totalSales || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artworks Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Artworks by {artist.displayName}</h2>

          {artworks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="text-gray-600">No artworks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/gallery/${artwork.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Style Badge - Top Left */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {artwork.style}
                        </Badge>
                      </div>
                      {/* Wishlist Button - Top Right */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isInWishlist(artwork.id)) {
                            removeFromWishlist(artwork.id);
                          } else {
                            addToWishlist({
                              ...artwork,
                              year: new Date().getFullYear(),
                              category: "Painting",
                            });
                          }
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                        aria-label={isInWishlist(artwork.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={isInWishlist(artwork.id) ? "red" : "none"}
                          stroke={isInWishlist(artwork.id) ? "red" : "currentColor"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                      {/* Add to Cart - Bottom (hover) */}
                      {artwork.available && (
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({
                                id: artwork.id,
                                title: artwork.title,
                                price: artwork.price,
                                image: artwork.image,
                                description: artwork.description,
                                dimensions: artwork.dimensions,
                                medium: artwork.medium,
                                year: new Date().getFullYear(),
                                category: "Painting",
                                style: artwork.style,
                                available: artwork.available,
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
                    <Link href={`/gallery/${artwork.id}`}>
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {artwork.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{artwork.medium}</p>
                    <p className="text-sm text-gray-500">{artwork.dimensions}</p>
                    <div className="flex items-center justify-between mt-3">
                      {artwork.available ? (
                        <>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(artwork.price)}
                          </p>
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            Available
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
        </div>
      </div>
    </div>
  );
}
