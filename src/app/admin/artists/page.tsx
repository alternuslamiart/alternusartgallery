"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Artist {
  id: string;
  name: string;
  email: string;
  country: string;
  totalArtworks: number;
  totalSales: number;
  totalRevenue: number;
  commission: number;
  artistEarning: number;
  joinedDate: string;
  isActive: boolean;
  profileImage: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
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

  const handleToggleStatus = (id: string) => {
    setArtists(
      artists.map((artist) =>
        artist.id === id ? { ...artist, isActive: !artist.isActive } : artist
      )
    );
  };

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && artist.isActive) ||
      (filterStatus === "inactive" && !artist.isActive);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: artists.length,
    active: artists.filter((a) => a.isActive).length,
    inactive: artists.filter((a) => !a.isActive).length,
    totalRevenue: artists.reduce((sum, a) => sum + a.totalRevenue, 0),
    totalCommission: artists.reduce((sum, a) => sum + a.commission, 0),
  };

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
                  href="/admin/applications"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Applications
                </Link>
                <div className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg">
                  Artists
                </div>
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Artist Management</h2>
          <p className="text-zinc-600">Manage all approved artists and their activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <p className="text-sm text-zinc-600 mb-1">Total Artists</p>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <p className="text-sm text-emerald-700 mb-1">Active</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Suspended</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">
              €{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Your Commission</p>
            <p className="text-2xl font-bold text-purple-600">
              €{stats.totalCommission.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search artists by name, email, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-black" : ""}
              >
                All ({artists.length})
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className={filterStatus === "active" ? "bg-emerald-600" : ""}
              >
                Active ({stats.active})
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                className={filterStatus === "inactive" ? "bg-red-600" : ""}
              >
                Suspended ({stats.inactive})
              </Button>
            </div>
          </div>
        </div>

        {/* Artists Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Artist</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Country</th>
                  <th className="text-center p-4 text-sm font-semibold text-zinc-700">
                    Artworks
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-zinc-700">Sales</th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Total Revenue
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Commission (40%)
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Artist Earned (60%)
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredArtists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-zinc-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={artist.profileImage}
                            alt={artist.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-black">{artist.name}</p>
                          <p className="text-sm text-zinc-600">{artist.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-700">{artist.country}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-black">{artist.totalArtworks}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-black">{artist.totalSales}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-black">
                        €{artist.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-emerald-600">
                        €{artist.commission.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-purple-600">
                        €{artist.artistEarning.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {artist.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-0">Suspended</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/artists/${artist.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className={
                            artist.isActive
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }
                          onClick={() => handleToggleStatus(artist.id)}
                        >
                          {artist.isActive ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredArtists.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-zinc-600">No artists found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
