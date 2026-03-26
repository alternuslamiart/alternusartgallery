"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  bio: string;
  artworks: number;
  portfolioImages: string[];
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
  website?: string;
  instagram?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showMessageModal, setShowMessageModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = selectedApp; // Used for modal display
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
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

  const handleApprove = (id: string) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: "approved" as const } : app
      )
    );
    setSelectedApp(null);
    // In production: API call to approve artist
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: "rejected" as const } : app
      )
    );
    setSelectedApp(null);
    setRejectionReason("");
    // In production: API call to reject artist + send email
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSendMessage = () => {
    if (!message.trim()) return;
    // In production: API call to send message
    setMessage("");
    setShowMessageModal(false);
  };

  const stats = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    total: applications.length,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Nav */}
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
                <div className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg">
                  Applications
                </div>
                <Link
                  href="/admin/artists"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Artist Applications</h2>
          <p className="text-zinc-600">
            Review and manage artist applications to join your gallery
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <p className="text-sm text-zinc-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <p className="text-sm text-emerald-700 mb-1">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {app.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-black">{app.name}</h3>
                      <p className="text-zinc-600 text-sm">{app.email}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-zinc-600">
                        <span className="flex items-center gap-1">
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
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {app.city}, {app.country}
                        </span>
                        <span>•</span>
                        <span>{app.artworks} artworks</span>
                      </div>
                    </div>
                  </div>
                  {app.status === "pending" ? (
                    <Badge className="bg-orange-100 text-orange-700 border-0">Pending</Badge>
                  ) : app.status === "approved" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">✓ Approved</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-0">✗ Rejected</Badge>
                  )}
                </div>

                {/* Bio */}
                <p className="text-zinc-700 text-sm leading-relaxed">{app.bio}</p>

                {/* Links */}
                {(app.website || app.instagram) && (
                  <div className="flex gap-3 mt-4">
                    {app.website && (
                      <a
                        href={app.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
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
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          <path d="M2 12h20" />
                        </svg>
                        Website
                      </a>
                    )}
                    {app.instagram && (
                      <span className="text-sm text-purple-600 flex items-center gap-1">
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
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                        {app.instagram}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Portfolio Images */}
              <div className="p-6 bg-zinc-50">
                <p className="text-sm font-semibold text-black mb-3">Portfolio ({app.artworks})</p>
                <div className="grid grid-cols-3 gap-3">
                  {app.portfolioImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Image
                        src={img}
                        alt={`Portfolio ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {app.status === "pending" && (
                <div className="p-6 border-t border-zinc-200 bg-white">
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={() => handleApprove(app.id)}
                    >
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
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve Artist
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedApp(app);
                        const reason = prompt("Rejection reason (will be sent to artist):");
                        if (reason) {
                          setRejectionReason(reason);
                          handleReject(app.id);
                        }
                      }}
                    >
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
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowMessageModal(true);
                      }}
                    >
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
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    Applied on {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-400"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">No Applications Yet</h3>
            <p className="text-zinc-600">
              Artist applications will appear here when submitted
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
