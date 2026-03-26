"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useCart, useWishlist } from "@/components/providers";

interface Artist {
  id: string;
  displayName: string;
  bio: string | null;
  country: string | null;
  city: string | null;
  profileImage: string | null;
  coverImage: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  followerCount: number;
  totalArtworks: number;
  totalSales: number;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  artworks: Artwork[];
}

interface Artwork {
  id: string;
  title: string;
  primaryImage: string;
  price: string;
  medium: string | null;
  isAvailable: boolean;
  status: string;
}

export default function ArtistProfile({ params }: { params: { id: string } }) {
  const artistId = params.id;
  const { formatPrice, t } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Artist data state
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"artworks" | "about" | "reviews">("artworks");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showInbox, _setShowInbox] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState("");
  const [avatar, setAvatar] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Message form state
  const [messageForm, setMessageForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Fetch artist data
  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/artists/${artistId}`);
        if (!response.ok) {
          throw new Error("Artist not found");
        }
        const data = await response.json();
        setArtist(data.artist);
        setCoverPhoto(data.artist.coverImage || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80");
        setAvatar(data.artist.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.artist.displayName}&backgroundColor=b6e3f4`);
        setFollowerCount(data.artist.followerCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load artist");
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(`/api/artists/${artistId}/follow`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error("Failed to fetch follow status:", err);
      }
    };

    fetchArtist();
    fetchFollowStatus();
  }, [artistId]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    // Optimistic update - immediately update UI
    const newIsFollowing = !isFollowing;
    const newFollowerCount = newIsFollowing ? followerCount + 1 : Math.max(0, followerCount - 1);

    setIsFollowing(newIsFollowing);
    setFollowerCount(newFollowerCount);
    setFollowLoading(true);

    try {
      const method = newIsFollowing ? "POST" : "DELETE";
      const response = await fetch(`/api/artists/${artistId}/follow`, { method });
      const data = await response.json();

      if (response.ok) {
        // Update with actual server values
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      } else if (response.status === 401) {
        // Not logged in - keep the optimistic update for demo but log message
        console.log("Follow saved locally. Login to save permanently.");
      } else {
        // Revert on other errors
        setIsFollowing(!newIsFollowing);
        setFollowerCount(followerCount);
        console.error(data.error);
      }
    } catch (err) {
      // Keep optimistic update even on network error for better UX
      console.error("Failed to toggle follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle message form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSending(true);
    setMessageError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toArtistId: artistId,
          subject: messageForm.subject,
          message: messageForm.message,
          senderName: messageForm.name,
          senderEmail: messageForm.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageSent(true);
        setMessageForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => {
          setShowMessage(false);
          setMessageSent(false);
        }, 2000);
      } else {
        setMessageError(data.error || "Failed to send message");
      }
    } catch {
      setMessageError("Failed to send message. Please try again.");
    } finally {
      setMessageSending(false);
    }
  };

  // Refs for file inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Handle cover photo change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle share profile
  const handleShareProfile = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setShowShareDialog(true);
    setShowOptionsMenu(false);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Handle save profile
  const handleSaveProfile = () => {
    setIsSaved(!isSaved);
    setShowOptionsMenu(false);
  };

  // Handle notification toggle
  const handleNotificationToggle = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    setShowOptionsMenu(false);
  };

  // Handle report profile
  const handleReportProfile = () => {
    setShowReportDialog(true);
    setShowOptionsMenu(false);
  };

  // Handle block artist
  const handleBlockArtist = () => {
    setShowBlockDialog(true);
    setShowOptionsMenu(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error || "Artist not found"}</p>
          <Link href="/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  const artistName = artist.displayName;
  const artistUsername = `@${artist.displayName.toLowerCase().replace(/\s+/g, '')}`;
  const artistBio = artist.bio || "No bio available yet.";
  const artistLocation = [artist.city, artist.country].filter(Boolean).join(", ") || "Unknown location";
  const artistWebsite = artist.websiteUrl || "";
  const joinedDate = new Date(artist.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const artistArtworks = artist.artworks || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Cover Photo */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full">
        <Image
          src={coverPhoto}
          alt="Cover photo"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Edit Cover Button (for own profile) */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Edit Cover
        </button>
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 md:-mt-24 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Profile Photo */}
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="relative">
                {/* Outer Ring Frame */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-pink-500 shadow-2xl">
                  {/* Inner White Border */}
                  <div className="w-full h-full rounded-full p-1 bg-background">
                    {/* Profile Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={avatar}
                        alt={artistName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Edit Profile Photo Button */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-8 sm:right-10 w-8 h-8 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center border-2 border-background shadow-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              {/* Name and Username - Mobile */}
              <div className="sm:hidden pb-2">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold">{artistName}</h1>
                  {true && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-sm opacity-60 animate-pulse" />
                      <div className="relative w-5 h-5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{artistUsername}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sm:pb-2">
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading}
                variant={isFollowing ? "outline" : "default"}
                className={`gap-2 shadow-sm hover:shadow-md transition-all duration-200 ${isFollowing ? "border-primary text-primary" : ""}`}
              >
                {followLoading ? (
                  <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    Follow
                  </>
                )}
              </Button>
              <Button
                className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200 border-0"
                onClick={() => setShowMessage(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                </svg>
                Message
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>

                {/* Dropdown Menu */}
                {showOptionsMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOptionsMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button onClick={handleShareProfile} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" x2="12" y1="2" y2="15" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Share Profile</p>
                          <p className="text-xs text-gray-500">Send to friends</p>
                        </div>
                      </button>

                      <button onClick={handleSaveProfile} className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 ${isSaved ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-lg ${isSaved ? 'bg-purple-600' : 'bg-purple-50'} flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSaved ? 'text-white' : 'text-purple-600'}>
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-700">{isSaved ? 'Saved' : 'Save Profile'}</p>
                          <p className="text-xs text-gray-500">{isSaved ? 'In favorites' : 'Add to favorites'}</p>
                        </div>
                      </button>

                      <button onClick={handleNotificationToggle} className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 ${isNotificationEnabled ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-lg ${isNotificationEnabled ? 'bg-green-600' : 'bg-green-50'} flex items-center justify-center`}>
                          {isNotificationEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-700">{isNotificationEnabled ? 'Notifications On' : 'Get Notified'}</p>
                          <p className="text-xs text-gray-500">{isNotificationEnabled ? 'Alerts enabled' : 'New artwork alerts'}</p>
                        </div>
                      </button>

                      <div className="h-px bg-gray-100 my-2" />

                      <button onClick={handleReportProfile} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" x2="12" y1="9" y2="13" />
                            <line x1="12" x2="12.01" y1="17" y2="17" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Report Profile</p>
                          <p className="text-xs text-gray-500">Flag content</p>
                        </div>
                      </button>

                      <button onClick={handleBlockArtist} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m4.9 4.9 14.2 14.2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-red-600">Block Artist</p>
                          <p className="text-xs text-gray-500">Hide content</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Name, Username, Bio - Desktop */}
          <div className="mt-4 sm:mt-6">
            <div className="hidden sm:flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">{artistName}</h1>
              {true && (
                <div className="relative group cursor-pointer">
                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-md opacity-60 group-hover:opacity-100 animate-pulse" />
                  {/* Badge Container */}
                  <div className="relative w-7 h-7 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    {/* Inner Star/Sparkle */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                    </svg>
                  </div>
                  {/* Sparkle Decorations */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping animation-delay-200" />
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
                      </svg>
                      Verified Artist
                    </span>
                  </div>
                </div>
              )}
            </div>
            <p className="hidden sm:block text-muted-foreground">{artistUsername}</p>

            {/* Bio */}
            <p className="mt-4 text-foreground/80 max-w-2xl leading-relaxed">
              {artistBio}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {artistLocation}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {artistWebsite}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Joined {joinedDate}
              </span>
            </div>

            {/* Specialties - using style from artworks if available */}
            {artistArtworks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Array.from(new Set(artistArtworks.map(a => a.medium).filter(Boolean))).slice(0, 4).map((medium) => (
                  <Badge key={medium} variant="secondary">
                    {medium}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6">
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-xl font-bold">{artist.totalArtworks}</p>
                <p className="text-sm text-muted-foreground">Artworks</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-xl font-bold">{artist.totalSales}</p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-xl font-bold">{followerCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                <p className="text-xl font-bold">{0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                Artworks
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                About
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Reviews
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {/* Artworks Tab */}
          {activeTab === "artworks" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artistArtworks.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No artworks yet</p>
                </div>
              ) : (
                artistArtworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/gallery/${artwork.id}`}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        <Image
                          src={artwork.primaryImage}
                          alt={artwork.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Style Badge - Top Left */}
                        {artwork.medium && (
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {artwork.medium}
                            </Badge>
                          </div>
                        )}
                        {/* Wishlist Button - Top Right */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (isInWishlist(artwork.id)) {
                              removeFromWishlist(artwork.id);
                            } else {
                              addToWishlist({
                                id: artwork.id,
                                title: artwork.title,
                                price: parseFloat(artwork.price),
                                image: artwork.primaryImage,
                                description: "",
                                dimensions: "",
                                medium: artwork.medium || "",
                                year: new Date().getFullYear(),
                                category: "Painting",
                                style: artwork.medium || "",
                                available: artwork.isAvailable,
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
                        {artwork.isAvailable && (
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart({
                                  id: artwork.id,
                                  title: artwork.title,
                                  price: parseFloat(artwork.price),
                                  image: artwork.primaryImage,
                                  description: "",
                                  dimensions: "",
                                  medium: artwork.medium || "",
                                  year: new Date().getFullYear(),
                                  category: "Painting",
                                  style: artwork.medium || "",
                                  available: artwork.isAvailable,
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
                      <div className="flex items-center justify-between mt-3">
                        {artwork.isAvailable ? (
                          <>
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(parseFloat(artwork.price))}
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
                ))
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="max-w-3xl space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About {artistName}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {artistBio}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  With over a decade of experience in the art world, I have developed a unique style that blends
                  classical techniques with contemporary themes. My work has been exhibited in galleries across
                  Europe and has found homes in private collections worldwide.
                </p>
              </div>

              {artist.totalSales > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                  <ul className="space-y-3">
                    {artist.totalSales >= 1 && (
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                          </svg>
                        </div>
                        <span>First Sale Completed</span>
                      </li>
                    )}
                    {artist.totalSales >= 10 && (
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                          </svg>
                        </div>
                        <span>10+ Artworks Sold</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    contact@elenamarku.art
                  </p>
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    www.elenamarku.art
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Collector Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold">4.9</span>
                    <span className="text-muted-foreground">(28 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Review Items */}
              <div className="space-y-6">
                {[
                  { name: "Sarah M.", date: "Dec 2024", rating: 5, text: "Absolutely stunning piece! The colors are even more vibrant in person. Lamiart was very professional and the shipping was perfectly handled." },
                  { name: "James K.", date: "Nov 2024", rating: 5, text: "This is my third purchase from Lamiart and each piece has exceeded my expectations. Her attention to detail is remarkable." },
                  { name: "Maria L.", date: "Oct 2024", rating: 5, text: "Beautiful artwork that has become the centerpiece of our living room. Highly recommend!" },
                ].map((review, index) => (
                  <div key={index} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-medium">
                          {review.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={star <= review.rating ? "text-yellow-500" : "text-muted-foreground"}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Message Drawer */}
      {showMessage && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowMessage(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatar} alt={artistName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Message {artistName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Usually responds within 2 hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessage(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              {messageSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500">Your message has been sent to {artistName}.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSendMessage}>
                  {messageError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {messageError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={messageForm.name}
                        onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={messageForm.email}
                        onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="">Select a topic</option>
                      <option value="Commission Request">Commission Request</option>
                      <option value="Purchase Inquiry">Purchase Inquiry</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="General Question">General Question</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Write your message here..."
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={messageSending}
                    className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messageSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m22 2-7 20-4-9-9-4Z"/>
                          <path d="M22 2 11 13"/>
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {copiedLink ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" x2="12" y1="2" y2="15" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {copiedLink ? 'Link Copied!' : 'Share Profile'}
              </h3>
              <p className="text-gray-600 mb-6">
                {copiedLink ? 'Profile link has been copied to clipboard' : 'Share this artist profile with your friends'}
              </p>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                />
              </div>
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReportDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Report Profile</h3>
              <p className="text-gray-600">Why are you reporting this profile?</p>
            </div>
            <div className="space-y-2 mb-6">
              {['Spam or misleading', 'Inappropriate content', 'Harassment', 'Copyright violation', 'Other'].map((reason) => (
                <button
                  key={reason}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportDialog(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReportDialog(false)}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Dialog */}
      {showBlockDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBlockDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.9 4.9 14.2 14.2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Block {artistName}?</h3>
              <p className="text-gray-600 mb-6">
                You won&apos;t be able to see their profile, artworks, or messages. They won&apos;t be notified that you blocked them.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockDialog(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowBlockDialog(false);
                    // Add block logic here
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Block Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
