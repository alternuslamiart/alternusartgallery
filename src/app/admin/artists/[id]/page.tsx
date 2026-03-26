"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Artwork {
  id: string;
  title: string;
  price: number;
  commission: number;
  artistEarning: number;
  image: string;
  medium: string;
  style: string;
  dimensions: string;
  status: "pending" | "approved" | "rejected" | "sold";
  uploadDate: string;
  views: number;
}

export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const [artist, setArtist] = useState<{
    id: string;
    displayName: string;
    bio: string;
    country: string;
    city: string;
    profileImage: string;
    coverImage: string;
    websiteUrl: string;
    instagramUrl: string;
    totalArtworks: number;
    totalSales: number;
    createdAt: string;
    user: { firstName: string; lastName: string };
    artworks: { id: string; title: string; primaryImage: string; price: number; medium: string; isAvailable: boolean; status: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await fetch(`/api/artists/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setArtist(data.artist);
        }
      } catch (error) {
        console.error("Failed to fetch artist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [params.id]);

  const [artworks] = useState<Artwork[]>([]);

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "sold">("all");

  const filteredArtworks = artworks.filter((artwork) => {
    if (filterStatus === "all") return true;
    return artwork.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navigation */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <nav className="flex items-center gap-1">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/artists"
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg"
                >
                  Artists
                </Link>
                <Link
                  href="/admin/artworks"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Artworks
                </Link>
                <Link
                  href="/admin/sales"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Sales
                </Link>
              </nav>

            <div className="absolute right-0 flex items-center gap-3">
              {/* User Menu */}
              <div
                ref={userMenuRef}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-black hidden sm:block">CEO</p>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    AAG
                  </button>
                </div>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-zinc-600"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-sm font-medium text-black">Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-200 p-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-600"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/admin/artists">
          <Button variant="outline" size="sm" className="mb-6 gap-2">
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
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Artists
          </Button>
        </Link>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">Loading artist...</p>
          </div>
        ) : !artist ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">Artist not found</p>
          </div>
        ) : (
        <>
        {/* Artist Profile Header */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
            {artist.coverImage && (
              <Image
                src={artist.coverImage}
                alt="Cover"
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="p-8">
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="relative -mt-20">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center">
                  {artist.profileImage ? (
                    <Image
                      src={artist.profileImage}
                      alt={artist.displayName}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-zinc-400">{artist.displayName?.charAt(0) || "A"}</span>
                  )}
                </div>
              </div>

              {/* Artist Info */}
              <div className="flex-1 mt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-black mb-2">{artist.displayName}</h2>
                    <p className="text-zinc-600 mb-4">
                      {artist.city}{artist.city && artist.country ? ", " : ""}{artist.country}
                    </p>
                    {artist.bio && <p className="text-zinc-700 max-w-2xl">{artist.bio}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-sm text-zinc-600">Artworks</p>
                    <p className="text-2xl font-bold text-black">{artist.totalArtworks}</p>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-sm text-zinc-600">Sales</p>
                    <p className="text-2xl font-bold text-black">{artist.totalSales}</p>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-sm text-zinc-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-black">€0</p>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="text-sm text-zinc-600">Artist Earnings (60%)</p>
                    <p className="text-2xl font-bold text-purple-600">€0</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex gap-6 mt-6 text-sm">
                  {artist.websiteUrl && (
                    <div>
                      <span className="text-zinc-600">Website:</span>
                      <span className="text-black ml-2">{artist.websiteUrl}</span>
                    </div>
                  )}
                  {artist.instagramUrl && (
                    <div>
                      <span className="text-zinc-600">Instagram:</span>
                      <span className="text-black ml-2">{artist.instagramUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Artworks Section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-black">Artist Artworks</h3>
              <p className="text-zinc-600 text-sm mt-1">All artworks by {artist.displayName}</p>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                All ({artworks.length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                Pending ({artworks.filter((a) => a.status === "pending").length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "approved" ? "default" : "outline"}
                onClick={() => setFilterStatus("approved")}
              >
                Approved ({artworks.filter((a) => a.status === "approved").length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "sold" ? "default" : "outline"}
                onClick={() => setFilterStatus("sold")}
              >
                Sold ({artworks.filter((a) => a.status === "sold").length})
              </Button>
            </div>
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((artwork) => (
              <div key={artwork.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-64 bg-zinc-100">
                  <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                  <div className="absolute top-3 right-3">
                    {artwork.status === "pending" && (
                      <Badge className="bg-orange-100 text-orange-700 border-0">Pending</Badge>
                    )}
                    {artwork.status === "approved" && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>
                    )}
                    {artwork.status === "sold" && (
                      <Badge className="bg-blue-100 text-blue-700 border-0">Sold</Badge>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-black text-lg mb-2">{artwork.title}</h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Medium</span>
                      <span className="text-black">{artwork.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Style</span>
                      <span className="text-black">{artwork.style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Dimensions</span>
                      <span className="text-black">{artwork.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Price</span>
                      <span className="font-semibold text-black">€{artwork.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Commission (40%)</span>
                      <span className="font-semibold text-emerald-600">€{artwork.commission.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Artist (60%)</span>
                      <span className="font-semibold text-purple-600">€{artwork.artistEarning.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 text-xs text-zinc-500">
                    <span>{artwork.views} views</span>
                    <span>Uploaded {artwork.uploadDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No artworks found with this filter.</p>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
