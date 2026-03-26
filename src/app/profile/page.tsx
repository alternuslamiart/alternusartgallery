"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage, useUserArtworks } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, UserPlus, MessageCircle, MoreHorizontal, MapPin, Globe, Calendar, Instagram, Facebook, Twitter, Plus, Check, Pencil, X } from "lucide-react";

export default function ProfilePage() {
  const { formatPrice } = useLanguage();
  const { userArtworks } = useUserArtworks();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"artworks" | "about" | "reviews">("artworks");
  const [coverImageInput, setCoverImageInput] = useState<HTMLInputElement | null>(null);
  const [profileImageInput, setProfileImageInput] = useState<HTMLInputElement | null>(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Message state
  const [showMessage, setShowMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Options menu state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState({ instagram: "", facebook: "", twitter: "" });
  const [editingSocials, setEditingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState({ instagram: "", facebook: "", twitter: "" });

  // Profile info state (bio, location, website, specialties)
  const [profileInfo, setProfileInfo] = useState({
    bio: "Welcome to my profile! I'm passionate about art and creativity.",
    location: "Not specified",
    website: "",
    specialties: "Art Enthusiast",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...profileInfo });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("profileSocialLinks");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSocialLinks(parsed);
      setSocialForm(parsed);
    }
    const savedProfile = localStorage.getItem("profileInfo");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileInfo(parsed);
      setProfileForm(parsed);
    }
  }, []);

  const handleSaveSocials = () => {
    setSocialLinks(socialForm);
    localStorage.setItem("profileSocialLinks", JSON.stringify(socialForm));
    setEditingSocials(false);
  };

  const handleSaveProfile = () => {
    setProfileInfo(profileForm);
    localStorage.setItem("profileInfo", JSON.stringify(profileForm));
    setEditingProfile(false);
  };

  // Get user data from session
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  // User's artworks - only artworks uploaded by this user (empty initially)
  const myArtworks = userArtworks;

  // Profile data - using session user data
  const profile = {
    firstName: userName,
    username: userEmail.split("@")[0] || userName.toLowerCase().replace(/\s+/g, ""),
    bio: profileInfo.bio,
    location: profileInfo.location,
    website: profileInfo.website,
    joinedDate: "January 2025",
    specialties: profileInfo.specialties.split(",").map(s => s.trim()).filter(Boolean),
    stats: {
      artworks: myArtworks.length,
      sold: myArtworks.filter(a => !a.available).length,
      followers: followerCount,
      following: 0
    },
    verified: false,
    coverPhoto: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
    profilePhoto: userImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4`
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    const newIsFollowing = !isFollowing;
    const newFollowerCount = newIsFollowing ? followerCount + 1 : Math.max(0, followerCount - 1);

    setIsFollowing(newIsFollowing);
    setFollowerCount(newFollowerCount);
    setFollowLoading(true);

    // Simulate API call
    setTimeout(() => {
      setFollowLoading(false);
    }, 500);
  };

  // Handle message form submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSending(true);
    setMessageError(null);

    // Simulate API call
    setTimeout(() => {
      setMessageSent(true);
      setMessageForm({ name: "", email: "", subject: "", message: "" });
      setMessageSending(false);
      setTimeout(() => {
        setShowMessage(false);
        setMessageSent(false);
      }, 2000);
    }, 1000);
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

  // Handle bookmark/save profile
  const handleBookmarkProfile = () => {
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

  // Handle block user
  const handleBlockUser = () => {
    setShowBlockDialog(true);
    setShowOptionsMenu(false);
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
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-pink-500 shadow-2xl">
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
                  {profile.verified && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-sm opacity-60 animate-pulse"></div>
                      <div className="relative w-5 h-5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">@{profile.username}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sm:pb-2">
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading}
                variant={isFollowing ? "outline" : "default"}
                className={`gap-2 shadow-sm hover:shadow-md transition-all duration-200 ${isFollowing ? "border-primary text-primary" : ""}`}
                size="default"
              >
                {followLoading ? (
                  <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <Check className="w-[18px] h-[18px]" strokeWidth={2} />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-[18px] h-[18px]" strokeWidth={2} />
                    Follow
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowMessage(true)}
                className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                size="default"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                Message
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="hover:bg-accent transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button onClick={handleShareProfile} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" x2="12" y1="2" y2="15" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Share Profile</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Send to friends</p>
                        </div>
                      </button>

                      <button onClick={handleBookmarkProfile} className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 ${isSaved ? 'bg-purple-50 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <div className={`w-8 h-8 rounded-lg ${isSaved ? 'bg-purple-600' : 'bg-purple-50 dark:bg-purple-900/30'} flex items-center justify-center`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSaved ? 'text-white' : 'text-purple-600'}>
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">{isSaved ? 'Saved' : 'Save Profile'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isSaved ? 'In favorites' : 'Add to favorites'}</p>
                        </div>
                      </button>

                      <button onClick={handleNotificationToggle} className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 ${isNotificationEnabled ? 'bg-green-50 dark:bg-green-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <div className={`w-8 h-8 rounded-lg ${isNotificationEnabled ? 'bg-green-600' : 'bg-green-50 dark:bg-green-900/30'} flex items-center justify-center`}>
                          {isNotificationEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">{isNotificationEnabled ? 'Notifications On' : 'Get Notified'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isNotificationEnabled ? 'Alerts enabled' : 'New artwork alerts'}</p>
                        </div>
                      </button>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                      <button onClick={handleReportProfile} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" x2="12" y1="9" y2="13" />
                            <line x1="12" x2="12.01" y1="17" y2="17" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Report Profile</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Flag content</p>
                        </div>
                      </button>

                      <button onClick={handleBlockUser} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m4.9 4.9 14.2 14.2" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-red-600">Block User</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Hide content</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4 sm:mt-6">
            {/* Name & Badge on Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.firstName}</h1>
              {profile.verified && (
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full blur-md opacity-60 group-hover:opacity-100 animate-pulse"></div>
                  <div className="relative w-7 h-7 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping animation-delay-200"></div>

                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                      </svg>
                      Verified Artist
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="hidden sm:block text-muted-foreground">@{profile.username}</p>

            {/* Bio */}
            <p className="mt-4 text-foreground/80 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {profile.location && profile.location !== "Not specified" && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {profile.website}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {profile.joinedDate}
              </span>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6">
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.artworks}</p>
                <p className="text-sm text-muted-foreground">Artworks</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.sold}</p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{formatNumber(profile.stats.followers)}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>
              <button className="text-center hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                <p className="text-xl font-bold">{profile.stats.following}</p>
                <p className="text-sm text-muted-foreground">Following</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Reviews
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "artworks" && (
            <>
              {myArtworks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {myArtworks.map((painting) => (
                    <Link key={painting.id} href={`/gallery/${painting.id}`}>
                      <div className="rounded-xl text-card-foreground group overflow-hidden border-0 shadow-none bg-transparent">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={painting.image}
                            alt={painting.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {!painting.available && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="secondary">Sold</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-6 px-0 pt-3">
                          <h3 className="font-medium group-hover:underline">{painting.title}</h3>
                          <p className="text-sm text-muted-foreground">{painting.medium}</p>
                          <p className="font-semibold mt-1">{formatPrice(painting.price)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No artworks yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start showcasing your talent by adding your first artwork to your profile.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard?tab=artworks">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Artwork
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === "about" && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">About {profile.firstName}</h2>
                <button
                  onClick={() => {
                    setProfileForm({ ...profileInfo });
                    setEditingProfile(true);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  title="Edit profile info"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {profile.bio}
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                {profile.location && profile.location !== "Not specified" && (
                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground">{profile.location}</p>
                  </div>
                )}
                {profile.website && (
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a href={`https://${profile.website}`} className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Edit Profile Dialog */}
              {editingProfile && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingProfile(false)}>
                  <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Edit Profile</h3>
                      <button onClick={() => setEditingProfile(false)} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Bio</label>
                        <textarea
                          placeholder="Write something about yourself..."
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Location</label>
                        <input
                          type="text"
                          placeholder="e.g., Tirana, Albania"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Website</label>
                        <input
                          type="text"
                          placeholder="e.g., www.mysite.com"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Specializations</label>
                        <input
                          type="text"
                          placeholder="e.g., Painting, Sculpture, Photography"
                          value={profileForm.specialties}
                          onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">Separate with commas</p>
                      </div>
                      <Button onClick={handleSaveProfile} className="w-full">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              <p className="text-muted-foreground">No reviews yet.</p>
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
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.profilePhoto} alt={profile.firstName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Message {profile.firstName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Usually responds within 2 hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessage(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
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
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-500">Your message has been sent to {profile.firstName}.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSendMessage}>
                  {messageError && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {messageError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={messageForm.name}
                        onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={messageForm.email}
                        onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                    <select
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Write your message here..."
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={messageSending}
                    className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messageSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
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
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {copiedLink ? 'Link Copied!' : 'Share Profile'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {copiedLink ? 'Profile link has been copied to clipboard' : 'Share this profile with your friends'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 flex items-center gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-400 outline-none"
                />
              </div>
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Report Profile</h3>
              <p className="text-gray-600 dark:text-gray-400">Why are you reporting this profile?</p>
            </div>
            <div className="space-y-2 mb-6">
              {['Spam or misleading', 'Inappropriate content', 'Harassment', 'Copyright violation', 'Other'].map((reason) => (
                <button
                  key={reason}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportDialog(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.9 4.9 14.2 14.2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Block {profile.firstName}?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You won&apos;t be able to see their profile, artworks, or messages. They won&apos;t be notified that you blocked them.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockDialog(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowBlockDialog(false);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Block User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
