"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist, useLanguage, useCart } from "@/components/providers";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useLanguage();
  const { addToCart } = useCart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (painting: any) => {
    addToCart(painting);
    removeFromWishlist(painting.id);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {wishlist.length === 0
              ? "Your wishlist is empty"
              : `${wishlist.length} ${wishlist.length === 1 ? "item" : "items"} in your wishlist`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Explore our gallery and save your favorite artworks for later.
              </p>
              <Button asChild size="lg">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((painting) => (
              <Card key={painting.id} className="group overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Link href={`/gallery/${painting.id}`}>
                    <Image
                      src={painting.image}
                      alt={painting.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(painting.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="red" stroke="red" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/gallery/${painting.id}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:underline">{painting.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">{painting.style}</p>
                  <p className="text-xl font-bold mb-3">{formatPrice(painting.price)}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(painting)}
                      className="flex-1"
                      size="sm"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/gallery/${painting.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
