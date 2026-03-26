"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage, useCart } from "@/components/providers";
import { paintings } from "@/lib/paintings";

export default function FavoritesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t: _t, formatPrice } = useLanguage();
  const { addToCart } = useCart();

  // Mock favorites - në të ardhmen do të merren nga database
  const [favorites] = useState(paintings.slice(0, 6));

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">No Favorites Yet</h1>
          <p className="text-muted-foreground mb-6">Start adding artworks to your favorites to see them here.</p>
          <Button asChild size="lg">
            <Link href="/gallery">Browse Gallery</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground">{favorites.length} artworks saved</p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((painting) => (
            <Card key={painting.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Link href={`/gallery/${painting.id}`}>
                  <Image
                    src={painting.image}
                    alt={painting.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>

                {/* Remove from Favorites Button */}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>

                {/* Quick Add to Cart */}
                {painting.available && (
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart(painting)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <Link href={`/gallery/${painting.id}`}>
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
                    {painting.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-2">{painting.medium}</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(painting.price)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              Discover More Art
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
