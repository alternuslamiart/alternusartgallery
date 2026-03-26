"use client";

import { useCompare } from "@/components/providers";
import { useLanguage } from "@/components/providers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { formatPrice, t } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();

  if (compareList.length === 0) {
    return (
      <div className="py-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare Artworks" }]} />

          <div className="max-w-2xl mx-auto text-center mt-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400"
              >
                <path d="M18 6 7 17l-5-5" />
                <path d="m22 10-7.5 7.5L13 16" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">No Artworks to Compare</h1>
            <p className="text-muted-foreground mb-8">
              Start adding artworks from the gallery to compare their details side-by-side.
            </p>
            <Button asChild size="lg">
              <Link href="/gallery">{t("gallery")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare Artworks" }]} />

        <div className="flex justify-between items-center mb-8 mt-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compare Artworks</h1>
            <p className="text-muted-foreground">
              Comparing {compareList.length} artwork{compareList.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={clearCompare} variant="outline">
            Clear All
          </Button>
        </div>

        {/* Desktop: Side-by-side comparison */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-xl border">
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] gap-0">
              {/* Header Row - Empty cell + Images */}
              <div className="bg-gray-50 border-b border-r p-4"></div>
              {compareList.map((painting) => (
                <div key={painting.id} className="relative border-b border-r last:border-r-0 p-4">
                  <button
                    onClick={() => removeFromCompare(painting.id)}
                    className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <Image src={painting.image} alt={painting.title} fill className="object-cover" />
                  </div>
                  <Link href={`/gallery/${painting.id}`} className="text-lg font-semibold hover:text-primary transition-colors">
                    {painting.title}
                  </Link>
                </div>
              ))}

              {/* Price Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Price</div>
              {compareList.map((painting) => (
                <div key={`price-${painting.id}`} className="border-b border-r last:border-r-0 p-4 text-2xl font-bold text-primary">
                  {formatPrice(painting.price)}
                </div>
              ))}

              {/* Artist Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Artist</div>
              {compareList.map((painting) => (
                <div key={`artist-${painting.id}`} className="border-b border-r last:border-r-0 p-4">
                  <Link href={`/artist/${painting.artistId}`} className="text-primary hover:underline">
                    {painting.artist}
                  </Link>
                </div>
              ))}

              {/* Year Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Year</div>
              {compareList.map((painting) => (
                <div key={`year-${painting.id}`} className="border-b border-r last:border-r-0 p-4">
                  {painting.year}
                </div>
              ))}

              {/* Category Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Category</div>
              {compareList.map((painting) => (
                <div key={`category-${painting.id}`} className="border-b border-r last:border-r-0 p-4">
                  {painting.category}
                </div>
              ))}

              {/* Medium Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Medium</div>
              {compareList.map((painting) => (
                <div key={`medium-${painting.id}`} className="border-b border-r last:border-r-0 p-4">
                  {painting.medium}
                </div>
              ))}

              {/* Dimensions Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Dimensions</div>
              {compareList.map((painting) => (
                <div key={`dimensions-${painting.id}`} className="border-b border-r last:border-r-0 p-4">
                  {painting.dimensions}
                </div>
              ))}

              {/* Description Row */}
              <div className="bg-gray-50 border-b border-r p-4 font-semibold">Description</div>
              {compareList.map((painting) => (
                <div key={`description-${painting.id}`} className="border-b border-r last:border-r-0 p-4 text-sm text-muted-foreground">
                  {painting.description}
                </div>
              ))}

              {/* Actions Row */}
              <div className="bg-gray-50 border-r p-4 font-semibold">Actions</div>
              {compareList.map((painting) => (
                <div key={`actions-${painting.id}`} className="border-r last:border-r-0 p-4 space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/gallery/${painting.id}`}>View Details</Link>
                  </Button>
                  <Button
                    onClick={() => removeFromCompare(painting.id)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Card-based comparison */}
        <div className="lg:hidden space-y-6">
          {compareList.map((painting) => (
            <div key={painting.id} className="bg-white rounded-2xl shadow-xl border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{painting.title}</h3>
                <button
                  onClick={() => removeFromCompare(painting.id)}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <Image src={painting.image} alt={painting.title} fill className="object-cover" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Price:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(painting.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Artist:</span>
                  <Link href={`/artist/${painting.artistId}`} className="text-primary hover:underline">
                    {painting.artist}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Year:</span>
                  <span>{painting.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Category:</span>
                  <span>{painting.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Medium:</span>
                  <span>{painting.medium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Dimensions:</span>
                  <span>{painting.dimensions}</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{painting.description}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/gallery/${painting.id}`}>View Details</Link>
                </Button>
                <Button
                  onClick={() => removeFromCompare(painting.id)}
                  variant="outline"
                  className="flex-1"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add more artworks */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            {compareList.length < 4
              ? `Add up to ${4 - compareList.length} more artwork${4 - compareList.length > 1 ? 's' : ''} to compare`
              : "Maximum 4 artworks reached"
            }
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">Browse Gallery</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
