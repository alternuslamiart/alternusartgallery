"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Settings, MoreHorizontal, MapPin, Globe, Calendar, Instagram, Facebook, Twitter, Shield, Pencil, X } from "lucide-react";

function AdminProfileContent() {
  const [activeTab, setActiveTab] = useState<"artworks" | "about" | "settings">("artworks");
  const [coverImageInput, setCoverImageInput] = useState<HTMLInputElement | null>(null);
  const [profileImageInput, setProfileImageInput] = useState<HTMLInputElement | null>(null);

  // Social links state
  const [socialLinks, setSocialLinks] = useState({ instagram: "", facebook: "", twitter: "" });
  const [editingSocials, setEditingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState({ instagram: "", facebook: "", twitter: "" });

  useEffect(() => {
    const saved = localStorage.getItem("adminSocialLinks");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSocialLinks(parsed);
      setSocialForm(parsed);
    }
  }, []);

  const handleSaveSocials = () => {
    setSocialLinks(socialForm);
    localStorage.setItem("adminSocialLinks", JSON.stringify(socialForm));
    setEditingSocials(false);
  };

  // Admin profile data
  const profile = {
    firstName: "Admin",
    username: "alternus_admin",
    role: "Gallery Administrator",
    bio: "Managing the Alternus Art Gallery platform and supporting our talented artists. Dedicated to providing the best experience for both artists and collectors.",
    location: "Tirana, Albania",
    website: "www.alternus.gallery",
    joinedDate: "January 2024",
    specialties: ["Gallery Management", "Art Curation", "Artist Support", "Platform Admin"],
    stats: {
      artists: 125,
      artworks: 482,
      totalSales: 156,
      revenue: "€245K"
    },
    verified: true,
    coverPhoto: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&q=80",
    profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=10b981`
  };

  // Recent artworks added to platform
  const recentArtworks = [
    {
      id: "1",
      title: "Dawn of Hope",
      artist: "Elena Marku",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      price: 1296,
      status: "Active"
    },
    {
      id: "2",
      title: "Silence of the Night",
      artist: "Stefan Kola",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80",
      price: 1620,
      status: "Sold"
    },
    {
      id: "3",
      title: "Mountain Path",
      artist: "Ana Deda",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
      price: 2160,
      status: "Active"
    },
    {
      id: "4",
      title: "Portrait in Shadow",
      artist: "Luan Biba",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
      price: 1944,
      status: "Sold"
    },
    {
      id: "5",
      title: "Ocean Waves",
      artist: "Eriona Tafa",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
      price: 1512,
      status: "Active"
    },
    {
      id: "6",
      title: "Spring Flowers",
      artist: "Klodian Meta",
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
      price: 972,
      status: "Active"
    },
    {
      id: "7",
      title: "The Old City",
      artist: "Ornela Hoxha",
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
      price: 2700,
      status: "Active"
    },
    {
      id: "8",
      title: "Abstraction I",
      artist: "Andi Shehu",
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80",
      price: 1188,
      status: "Active"
    }
  ];

  const formatPrice = (price: number) => {
    return `€${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file inputs */}
      <input
        ref={setCoverImageInput}
        type="file"
        accept="image/*"
        className="hidden"
      />
      <input
        ref={setProfileImageInput}
        type="file"
        accept="image/*"
        className="hidden"
      />

      {/* Cover Photo */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full">
        <Image
          src={profile.coverPhoto}
          alt="Cover photo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Edit Cover Button */}
        <button
          onClick={() => coverImageInput?.click()}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-lg backdrop-blur-sm"
        >
          <Camera className="w-4 h-4" strokeWidth={2} />
          Edit Cover
        </button>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 md:-mt-24 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Profile Picture & Name */}
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="relative">
                {/* Gradient Border */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-green-500 via-emerald-500 to-teal-500 shadow-2xl">
                  <div className="w-full h-full rounded-full p-1 bg-background">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={profile.profilePhoto}
                        alt={profile.firstName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Profile Photo Button */}
                <button
                  onClick={() => profileImageInput?.click()}
                  className="absolute bottom-0 right-8 sm:right-10 w-8 h-8 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center border-2 border-background shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
                >
                  <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Name on Mobile */}
              <div className="sm:hidden pb-2">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold">{profile.firstName}</h1>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full blur-sm opacity-60 animate-pulse"></div>
                    <div className="relative w-5 h-5 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">@{profile.username}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sm:pb-2">
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 border-0"
                size="default"
                asChild
              >
                <Link href="/admin/dashboard">
                  <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4 sm:mt-6">
            {/* Name & Badge on Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.firstName}</h1>
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full blur-md opacity-60 group-hover:opacity-100 animate-pulse"></div>
                <div className="relative w-7 h-7 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping animation-delay-200"></div>

                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            <p className="hidden sm:block text-muted-foreground">@{profile.username}</p>
            <p className="hidden sm:block text-sm text-green-600 font-medium">{profile.role}</p>

            {/* Bio */}
            <p className="mt-4 text-foreground/80 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {profile.website}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {profile.joinedDate}
              </span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6">
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.artists}</p>
                <p className="text-sm text-muted-foreground">Artists</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.artworks}</p>
                <p className="text-sm text-muted-foreground">Artworks</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.totalSales}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.revenue}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => {
                  setSocialForm(socialLinks);
                  setEditingSocials(true);
                }}
                className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                title="Edit social links"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Social Links Dialog */}
            {editingSocials && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingSocials(false)}>
                <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Edit Social Links</h3>
                    <button onClick={() => setEditingSocials(false)} className="p-1 hover:bg-muted rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                        <Instagram className="w-4 h-4" /> Instagram
                      </label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                        <Facebook className="w-4 h-4" /> Facebook
                      </label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/username"
                        value={socialForm.facebook}
                        onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                        <Twitter className="w-4 h-4" /> X (Twitter)
                      </label>
                      <input
                        type="url"
                        placeholder="https://x.com/username"
                        value={socialForm.twitter}
                        onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <Button onClick={handleSaveSocials} className="w-full">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mt-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("artworks")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "artworks"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                Recent Artworks
              </span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                About
              </span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "artworks" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentArtworks.map((artwork) => (
                <div key={artwork.id} className="rounded-xl text-card-foreground group overflow-hidden border-0 shadow-none bg-transparent">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {artwork.status === "Sold" && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary">Sold</Badge>
                      </div>
                    )}
                    {artwork.status === "Active" && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white border-0">Active</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6 px-0 pt-3">
                    <h3 className="font-medium group-hover:underline">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                    <p className="font-semibold mt-1">{formatPrice(artwork.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "about" && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">About {profile.firstName}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {profile.bio}
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Responsibilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="border-green-200">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">{profile.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Website</h3>
                  <a href={`https://${profile.website}`} className="text-primary hover:underline">
                    {profile.website}
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Manage your admin profile information and preferences.</p>
                  <Button>Edit Profile</Button>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Update your password and security preferences.</p>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Configure how you receive notifications.</p>
                  <Button variant="outline">Configure Notifications</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <AdminAuthGuard>
      <AdminProfileContent />
    </AdminAuthGuard>
  );
}
