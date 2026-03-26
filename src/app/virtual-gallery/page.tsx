"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { paintings } from "@/lib/paintings";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers";

export default function VirtualGalleryPage() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { formatPrice } = useLanguage();
  const galleryRef = useRef<HTMLDivElement>(null);

  // Real fullscreen toggle using browser API
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      galleryRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fallback to CSS fullscreen if API fails
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g. user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Live visitor counter
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // Simulate a realistic visitor count (random between 12-48)
    const base = Math.floor(Math.random() * 37) + 12;
    setVisitorCount(base);

    // Fluctuate the count slightly every 8-15 seconds
    const interval = setInterval(() => {
      setVisitorCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return Math.max(5, Math.min(60, next));
      });
    }, Math.floor(Math.random() * 7000) + 8000);

    return () => clearInterval(interval);
  }, []);

  const rooms = [
    {
      id: 0,
      name: "Main Hall",
      background: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&q=80",
      artworks: paintings.slice(0, 4),
    },
    {
      id: 1,
      name: "Contemporary Wing",
      background: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1600&q=80",
      artworks: paintings.slice(4, 8),
    },
    {
      id: 2,
      name: "Modern Collection",
      background: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1600&q=80",
      artworks: paintings.slice(8, 12),
    },
    {
      id: 3,
      name: "Classic Masterpieces",
      background: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
      artworks: paintings.slice(12, 16),
    },
  ];

  const room = rooms[currentRoom];

  const nextRoom = () => {
    setCurrentRoom((prev) => (prev + 1) % rooms.length);
  };

  const prevRoom = () => {
    setCurrentRoom((prev) => (prev - 1 + rooms.length) % rooms.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Immersive Experience</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Virtual Gallery</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Explore our curated art collection in an immersive gallery environment. Walk through rooms, discover masterpieces, and purchase directly.
          </p>
        </div>
      </div>

      {/* Live Visitor Counter */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="max-w-xs mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{visitorCount}</span> visitors exploring now
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Virtual Gallery Viewer */}
        <div ref={galleryRef} className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "rounded-2xl overflow-hidden shadow-2xl"}`}>
          {/* Background Room */}
          <div className={`relative bg-gray-900 ${isFullscreen ? "h-full" : "aspect-[16/9]"}`}>
            <Image
              src={room.background}
              alt={room.name}
              fill
              className="object-cover opacity-70"
            />

            {/* Vignette effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>

            {/* Room Title */}
            <div className="absolute top-8 left-8">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <h2 className="text-white text-2xl font-bold">{room.name}</h2>
                <p className="text-white/70 text-sm">Room {currentRoom + 1} of {rooms.length}</p>
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-8 right-8 bg-black/50 backdrop-blur-sm p-3 rounded-lg hover:bg-black/70 transition-colors"
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>

            {/* Artworks on the walls */}
            <div className="absolute inset-0 flex items-center justify-center gap-8 px-16">
              {room.artworks.map((artwork, index) => (
                <Link
                  key={artwork.id}
                  href={`/gallery/${artwork.id}`}
                  className="group relative transition-all duration-300 hover:scale-110"
                  style={{
                    width: "18%",
                    aspectRatio: "4/5",
                    transform: `perspective(1000px) rotateY(${(index - 1.5) * 5}deg)`,
                  }}
                >
                  <div className="relative w-full h-full shadow-2xl">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover rounded-sm"
                    />
                    {/* Frame */}
                    <div className="absolute inset-0 border-8 border-gray-800 rounded-sm"></div>

                    {/* Info overlay on hover */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-white font-bold text-sm mb-1">{artwork.title}</p>
                      <p className="text-white/70 text-xs mb-2">{artwork.artist}</p>
                      <p className="text-white font-semibold text-sm">{formatPrice(artwork.price)}</p>
                      <Button size="sm" variant="secondary" className="mt-3 text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Wall label */}
                  <div className="absolute -bottom-8 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{artwork.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
              <Button
                onClick={prevRoom}
                size="lg"
                variant="secondary"
                className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>

              <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="flex gap-2">
                  {rooms.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentRoom(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentRoom
                          ? "bg-white w-8"
                          : "bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={nextRoom}
                size="lg"
                variant="secondary"
                className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-24 left-8 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white/70 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Click on artworks to view details
              </p>
            </div>
          </div>
        </div>

        {/* Room Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {rooms.map((r, index) => (
            <button
              key={r.id}
              onClick={() => setCurrentRoom(index)}
              className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                currentRoom === index
                  ? "border-gray-900 ring-2 ring-gray-900 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image src={r.background} alt={r.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <span className="text-white font-semibold text-sm">{r.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <button
            onClick={() => {
              toggleFullscreen();
            }}
            className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 8h20" />
                <path d="m2 8 7.3 14.6a1 1 0 0 0 1.7 0L20 8" />
                <path d="m10 8 1.9-4.7a1 1 0 0 1 1.9 0L16 8" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">360° Gallery View</h3>
            <p className="text-sm text-gray-500">
              Navigate through our curated gallery spaces with immersive 3D perspectives
            </p>
          </button>

          <Link href="/gallery" className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Curated Collections</h3>
            <p className="text-sm text-gray-500">
              Explore artworks organized by style, period, and artistic movement
            </p>
          </Link>

          <Link href="/gallery" className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Purchase</h3>
            <p className="text-sm text-gray-500">
              Click on any artwork to view details and purchase directly
            </p>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="mt-16 mb-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Want Something Unique?</h3>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Commission a custom artwork from our talented artists, or browse our full gallery for original pieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/commissions"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Start a Commission
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
