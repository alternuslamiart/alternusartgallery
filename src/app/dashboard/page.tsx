"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { categories, type Painting } from "@/lib/paintings";
import { useLanguage, useUserArtworks } from "@/components/providers";

type Tab = "overview" | "artworks" | "orders" | "settings";

interface NewArtwork {
  title: string;
  image: string;
  price: string;
  medium: string;
  dimensions: string;
  width: string;
  height: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
}

const initialFormState: NewArtwork = {
  title: "",
  image: "",
  price: "",
  medium: "Oil on Canvas",
  dimensions: "",
  width: "",
  height: "",
  category: categories[0],
  year: new Date().getFullYear().toString(),
  description: "",
  tags: [],
};

function DashboardContent() {
  const { formatPrice } = useLanguage();
  const { userArtworks, addUserArtwork, removeUserArtwork, updateUserArtwork } = useUserArtworks();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAddArtworkOpen, setIsAddArtworkOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [newArtwork, setNewArtwork] = useState<NewArtwork>(initialFormState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setNewArtwork({ ...newArtwork, image: result });
      setImageError(false);
    };
    reader.onerror = () => {
      setImageError(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Only show user's own artworks (no demo paintings)
  const allArtworks = userArtworks;

  useEffect(() => {
    if (tabParam && ["overview", "artworks", "orders", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Auto-generate dimensions from width and height
  useEffect(() => {
    if (newArtwork.width && newArtwork.height) {
      setNewArtwork(prev => ({
        ...prev,
        dimensions: `${prev.width} x ${prev.height} cm`
      }));
    }
  }, [newArtwork.width, newArtwork.height]);

  const handleAddTag = () => {
    if (tagInput.trim() && !newArtwork.tags.includes(tagInput.trim())) {
      setNewArtwork(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewArtwork(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isValidImageUrl = (url: string): boolean => {
    return url.trim() !== "" && (url.startsWith("http") || url.startsWith("data:image/"));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return isValidImageUrl(newArtwork.image) && !imageError;
      case 2:
        return newArtwork.title.trim() !== "" && newArtwork.category !== "";
      case 3:
        return newArtwork.price !== "" && parseFloat(newArtwork.price) > 0;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resetForm = () => {
    setNewArtwork(initialFormState);
    setFormStep(1);
    setTagInput("");
    setImageError(false);
    setUploadError(null);
  };

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    try {
      // Step 1: Upload image to Cloudinary
      let imageUrl = newArtwork.image;

      // If it's a base64 image (from file upload), upload to Cloudinary
      if (newArtwork.image.startsWith('data:image/')) {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: newArtwork.image }),
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Step 2: Create artwork in database
      const artworkResponse = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newArtwork.title,
          description: newArtwork.description,
          price: parseFloat(newArtwork.price),
          primaryImage: imageUrl,
          medium: newArtwork.medium,
          style: 'Contemporary',
          category: newArtwork.category,
          dimensions: newArtwork.dimensions || `${newArtwork.width} x ${newArtwork.height} cm`,
          width: newArtwork.width ? parseFloat(newArtwork.width) : null,
          height: newArtwork.height ? parseFloat(newArtwork.height) : null,
          yearCreated: newArtwork.year,
          isFeatured: false,
        }),
      });

      if (!artworkResponse.ok) {
        const error = await artworkResponse.json();
        throw new Error(error.error || 'Failed to create artwork');
      }

      const artworkData = await artworkResponse.json();

      // Also add to local state for immediate display
      const artwork: Painting = {
        id: artworkData.artwork.id,
        title: newArtwork.title,
        image: imageUrl,
        price: parseFloat(newArtwork.price),
        medium: newArtwork.medium,
        dimensions: newArtwork.dimensions || `${newArtwork.width} x ${newArtwork.height} cm`,
        year: parseInt(newArtwork.year),
        category: newArtwork.category,
        style: "Contemporary",
        available: true,
        description: newArtwork.description,
      };

      addUserArtwork(artwork);

      // Close modal and show success
      setIsAddArtworkOpen(false);
      setShowSuccess(true);

      // Reset form
      resetForm();

      // Hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding artwork:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to add artwork');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddArtworkOpen(false);
    resetForm();
  };

  const handleDeleteArtwork = (artworkId: string) => {
    if (confirm("Are you sure you want to delete this artwork?")) {
      removeUserArtwork(artworkId);
    }
  };

  const handleEditArtwork = (artwork: Painting) => {
    setEditingArtwork(artwork);
    setNewArtwork({
      title: artwork.title,
      image: artwork.image,
      price: artwork.price.toString(),
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      width: "",
      height: "",
      category: artwork.category,
      year: artwork.year.toString(),
      description: artwork.description || "",
      tags: [],
    });
    setIsEditOpen(true);
  };

  const handleUpdateArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    const updatedArtwork: Painting = {
      ...editingArtwork,
      title: newArtwork.title,
      image: newArtwork.image,
      price: parseFloat(newArtwork.price),
      medium: newArtwork.medium,
      dimensions: newArtwork.dimensions || `${newArtwork.width} x ${newArtwork.height} cm`,
      year: parseInt(newArtwork.year),
      category: newArtwork.category,
      description: newArtwork.description,
    };

    updateUserArtwork(editingArtwork.id, updatedArtwork);

    setIsEditOpen(false);
    setEditingArtwork(null);
    resetForm();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Statistics
  const totalWorks = allArtworks.length;
  const availableWorks = allArtworks.filter((p) => p.available).length;
  const soldWorks = allArtworks.filter((p) => !p.available).length;
  const totalRevenue = allArtworks.filter((p) => !p.available).reduce((sum, p) => sum + p.price, 0);

  // Orders data - empty for now (will be loaded from API)
  const recentOrders: Array<{
    id: string;
    artwork: string;
    artworkImage: string;
    buyer: string;
    buyerEmail: string;
    buyerAvatar: string;
    price: number;
    status: string;
    date: string;
    shippingAddress: string;
    trackingNumber?: string;
    services: Array<{ task: string; completed: boolean }>;
  }> = [];

  const [selectedOrder, setSelectedOrder] = useState<typeof recentOrders[0] | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<Painting | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )},
    { id: "artworks" as Tab, label: "Artworks", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    )},
    { id: "orders" as Tab, label: "Orders", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    )},
    { id: "settings" as Tab, label: "Settings", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dashboard Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl font-bold text-primary">LA</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Welcome back, Lamiart</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your artworks and orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" asChild>
                <Link href="/gallery">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </svg>
                  View Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-background rounded-xl p-1 sm:p-2 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              ))}
            </nav>

            <Separator className="my-4 sm:my-6" />

            {/* Quick Stats Card */}
            <Card>
              <CardHeader className="pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">This Month</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl font-bold">&euro;{(totalRevenue * 0.3).toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Total Artworks</p>
                          <p className="text-2xl sm:text-3xl font-bold">{totalWorks}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
                          <p className="text-2xl sm:text-3xl font-bold">{availableWorks}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Sold</p>
                          <p className="text-2xl sm:text-3xl font-bold">{soldWorks}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                          <p className="text-2xl sm:text-3xl font-bold">&euro;{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                            <path d="M12 18V6" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
                    {recentOrders.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-xs sm:text-sm">
                        View All
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {recentOrders.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground sm:w-5 sm:h-5">
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{order.artwork}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.buyer} • {order.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                              <Badge variant={
                                order.status === "completed" ? "default" :
                                order.status === "shipped" ? "secondary" : "outline"
                              } className="text-xs">
                                {order.status}
                              </Badge>
                              <p className="font-semibold text-sm sm:text-base">{formatPrice(order.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                          </svg>
                        </div>
                        <h3 className="font-semibold mb-1">No orders yet</h3>
                        <p className="text-sm text-muted-foreground">Orders will appear here when customers purchase your artworks.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Artworks */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">My Artworks</CardTitle>
                    {allArtworks.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("artworks")} className="text-xs sm:text-sm">
                        View All
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {allArtworks.length > 0 ? (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {allArtworks.slice(0, 3).map((painting) => (
                          <div key={painting.id} className="group relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src={painting.image}
                              alt={painting.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <div>
                                <p className="text-white font-medium">{painting.title}</p>
                                <p className="text-white/70 text-sm">{formatPrice(painting.price)}</p>
                              </div>
                            </div>
                            {!painting.available && (
                              <Badge className="absolute top-2 right-2" variant="secondary">Sold</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                            <path d="M2 2l7.586 7.586" />
                            <circle cx="11" cy="11" r="2" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No artworks yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Start by adding your first artwork to showcase your talent.
                        </p>
                        <Button onClick={() => setActiveTab("artworks")}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Add Your First Artwork
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "artworks" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Artworks</h2>
                  <Button onClick={() => setIsAddArtworkOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add New
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allArtworks.map((painting) => (
                    <Card key={painting.id} className="overflow-hidden">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={painting.image}
                          alt={painting.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute top-2 right-2" variant={painting.available ? "default" : "secondary"}>
                          {painting.available ? "Available" : "Sold"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{painting.title}</h3>
                        <p className="text-sm text-muted-foreground">{painting.medium}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-bold">{formatPrice(painting.price)}</p>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditArtwork(painting)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteArtwork(painting.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Orders</h2>
                    <p className="text-muted-foreground">
                      {recentOrders.length > 0
                        ? `${recentOrders.filter(o => o.status === "pending").length} orders need attention`
                        : "Manage your artwork orders"}
                    </p>
                  </div>
                  {recentOrders.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline">Export</Button>
                    </div>
                  )}
                </div>

                {/* Orders List */}
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <Card
                        key={order.id}
                        className={`cursor-pointer hover:shadow-md transition-all ${order.status === "pending" ? "border-amber-300 bg-amber-50/50" : ""}`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Artwork Image */}
                            <div className="relative flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.artworkImage}
                                alt={order.artwork}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              {order.status === "pending" && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                              )}
                            </div>

                            {/* Order Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{order.artwork}</h3>
                                <Badge variant={
                                  order.status === "pending" ? "destructive" :
                                  order.status === "processing" ? "default" :
                                  order.status === "shipped" ? "secondary" : "outline"
                                }>
                                  {order.status === "pending" ? "New Order" : order.status === "processing" ? "In Progress" : "Shipped"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={order.buyerAvatar} alt={order.buyer} className="w-5 h-5 rounded-full" />
                                <span>{order.buyer}</span>
                                <span>•</span>
                                <span>{order.date}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold">{formatPrice(order.price)}</span>
                                <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="hidden md:flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <div className="flex gap-1">
                                {order.services.map((s, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-2 rounded-full ${s.completed ? "bg-green-500" : "bg-gray-200"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-medium">
                                {order.services.filter(s => s.completed).length}/{order.services.length} steps
                              </span>
                            </div>

                            {/* Arrow */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          When customers purchase your artworks, their orders will appear here. Start by adding some artworks to your gallery!
                        </p>
                        <Button onClick={() => setActiveTab("artworks")}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Add Artworks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Settings</h2>

                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">EM</span>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Change Photo</Button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">First Name</label>
                        <input
                          type="text"
                          defaultValue="Lamiart"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Marku"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <input
                          type="email"
                          defaultValue="elena@alternus.art"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <input
                          type="tel"
                          defaultValue="+1 (212) 123-4567"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <textarea
                        rows={4}
                        defaultValue="Passionate artist creating works that express deep emotions and tell unique stories."
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-background resize-none"
                      />
                    </div>

                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                        <input
                          type="text"
                          defaultValue="Raiffeisen Bank"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                        <input
                          type="text"
                          defaultValue="Lamiart"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">IBAN</label>
                        <input
                          type="text"
                          defaultValue="AL47 2121 1009 0000 0002 3569 8741"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">SWIFT/BIC</label>
                        <input
                          type="text"
                          defaultValue="SGSBALTX"
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                    </div>
                    <Button>Update Bank Details</Button>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive emails about new orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive SMS for urgent updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Artwork Added Successfully!</p>
              <p className="text-sm text-white/80">Your artwork is now visible in the gallery.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Artwork Modal - Professional Multi-Step Form */}
      <Dialog open={isAddArtworkOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0">
          {/* Modal Header with Steps */}
          <div className="bg-muted/30 px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Artwork</DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { num: 1, label: "Upload Image" },
                { num: 2, label: "Artwork Details" },
                { num: 3, label: "Pricing & Publish" },
              ].map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        formStep === step.num
                          ? "bg-primary text-primary-foreground"
                          : formStep > step.num
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formStep > step.num ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </div>
                    <span className={`text-sm hidden sm:block ${formStep === step.num ? "font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 ${formStep > step.num ? "bg-green-600" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddArtwork} className="flex flex-col h-[calc(90vh-180px)]">
            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Upload Image */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Upload Your Artwork</h3>
                    <p className="text-muted-foreground text-sm">Add a high-quality image of your artwork</p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div
                    onClick={() => !newArtwork.image && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      newArtwork.image
                        ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                        : isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    }`}
                  >
                    {newArtwork.image && !imageError ? (
                      <div className="space-y-4">
                        <div className="relative aspect-[4/3] max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={newArtwork.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={() => setImageError(true)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewArtwork({ ...newArtwork, image: "" });
                              setImageError(false);
                            }}
                            className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Image loaded successfully
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-colors ${
                          isDragging ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isDragging ? "text-primary" : "text-muted-foreground"}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {isDragging ? "Drop your image here" : "Drag and drop your image here"}
                          </p>
                          <p className="text-muted-foreground">or click to browse files</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                          </svg>
                          Browse Files
                        </Button>
                        {imageError && (
                          <p className="text-red-500 text-sm">Failed to load image. Please use JPG, PNG, or WebP format.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-sm text-muted-foreground">or use URL</span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://example.com/your-artwork.jpg"
                        value={newArtwork.image.startsWith("data:") ? "" : newArtwork.image}
                        onChange={(e) => {
                          setNewArtwork({ ...newArtwork, image: e.target.value });
                          setImageError(false);
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, WebP. For best results, use images at least 1200x1200 pixels.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Artwork Details */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Artwork Details</h3>
                    <p className="text-muted-foreground text-sm">Tell us about your artwork</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Preview thumbnail */}
                    <div className="sm:col-span-2 flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {newArtwork.image && (newArtwork.image.startsWith("http") || newArtwork.image.startsWith("data:image/")) ? (
                          <Image src={newArtwork.image} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{newArtwork.title || "Untitled Artwork"}</p>
                        <p className="text-sm text-muted-foreground">{newArtwork.medium}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                      <Input
                        type="text"
                        placeholder="Enter artwork title"
                        value={newArtwork.title}
                        onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
                      <select
                        value={newArtwork.category}
                        onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Medium <span className="text-red-500">*</span></label>
                      <select
                        value={newArtwork.medium}
                        onChange={(e) => setNewArtwork({ ...newArtwork, medium: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="Oil on Canvas">Oil on Canvas</option>
                        <option value="Acrylic on Canvas">Acrylic on Canvas</option>
                        <option value="Watercolor">Watercolor</option>
                        <option value="Mixed Media">Mixed Media</option>
                        <option value="Digital Art">Digital Art</option>
                        <option value="Charcoal">Charcoal</option>
                        <option value="Pastel">Pastel</option>
                        <option value="Gouache">Gouache</option>
                        <option value="Ink">Ink</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year Created</label>
                      <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder={new Date().getFullYear().toString()}
                        value={newArtwork.year}
                        onChange={(e) => setNewArtwork({ ...newArtwork, year: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width (cm)</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="60"
                        value={newArtwork.width}
                        onChange={(e) => setNewArtwork({ ...newArtwork, width: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height (cm)</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="80"
                        value={newArtwork.height}
                        onChange={(e) => setNewArtwork({ ...newArtwork, height: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Describe your artwork, inspiration, technique, story behind the piece..."
                        value={newArtwork.description}
                        onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a tag (e.g., abstract, nature, portrait)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                          Add
                        </Button>
                      </div>
                      {newArtwork.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newArtwork.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Publish */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Set Your Price</h3>
                    <p className="text-muted-foreground text-sm">Review and publish your artwork</p>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-muted/30 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative w-full sm:w-48 aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        {newArtwork.image && newArtwork.image.startsWith("http") ? (
                          <Image src={newArtwork.image} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="text-xl font-bold">{newArtwork.title || "Untitled"}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{newArtwork.category}</Badge>
                          <Badge variant="outline">{newArtwork.medium}</Badge>
                          {newArtwork.year && <Badge variant="outline">{newArtwork.year}</Badge>}
                        </div>
                        {(newArtwork.width && newArtwork.height) && (
                          <p className="text-sm text-muted-foreground">
                            Dimensions: {newArtwork.width} × {newArtwork.height} cm
                          </p>
                        )}
                        {newArtwork.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{newArtwork.description}</p>
                        )}
                        {newArtwork.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {newArtwork.tags.map((tag) => (
                              <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-background border rounded-2xl p-6 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <path d="M12 18V6" />
                      </svg>
                      Pricing
                    </h4>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sale Price (€) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">€</span>
                        <Input
                          type="number"
                          min="0"
                          max="25000"
                          step="0.01"
                          placeholder="0.00"
                          value={newArtwork.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > 25000) return;
                            setNewArtwork({ ...newArtwork, price: e.target.value });
                          }}
                          className="pl-8 text-2xl font-bold h-14"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">Maximum price: $25,000</p>
                      </div>
                    </div>

                    {newArtwork.price && parseFloat(newArtwork.price) > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your earnings (after 10% fee)</span>
                          <span className="font-semibold">€{(parseFloat(newArtwork.price) * 0.9).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publish Checklist */}
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3">Ready to publish?</h4>
                    <ul className="space-y-2">
                      {[
                        { check: !!newArtwork.image, label: "Artwork image uploaded" },
                        { check: !!newArtwork.title, label: "Title added" },
                        { check: !!newArtwork.category, label: "Category selected" },
                        { check: parseFloat(newArtwork.price) > 0, label: "Price set" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          {item.check ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          )}
                          <span className={item.check ? "text-green-800 dark:text-green-400" : "text-muted-foreground"}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Error Display */}
                  {uploadError && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" x2="12" y1="8" y2="12" />
                          <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        <span className="font-semibold">Upload Error</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{uploadError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t p-4 bg-background flex items-center justify-between gap-4">
              <div>
                {formStep > 1 && (
                  <Button type="button" variant="ghost" onClick={handlePrevStep}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>

                {formStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!validateStep(formStep)}
                  >
                    Continue
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!validateStep(3) || isUploading}
                    className="bg-green-600 hover:bg-green-700 min-w-[160px]"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Publish Artwork
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Artwork Modal */}
      <Dialog open={isEditOpen} onOpenChange={() => { setIsEditOpen(false); setEditingArtwork(null); resetForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Artwork</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateArtwork} className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Artwork Title</label>
                <Input
                  value={newArtwork.title}
                  onChange={(e) => setNewArtwork(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter artwork title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={newArtwork.image}
                  onChange={(e) => setNewArtwork(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (€)</label>
                  <Input
                    type="number"
                    min="0"
                    max="25000"
                    value={newArtwork.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > 25000) return;
                      setNewArtwork(prev => ({ ...prev, price: e.target.value }));
                    }}
                    placeholder="2500"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    type="number"
                    value={newArtwork.year}
                    onChange={(e) => setNewArtwork(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2024"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Medium</label>
                  <Input
                    value={newArtwork.medium}
                    onChange={(e) => setNewArtwork(prev => ({ ...prev, medium: e.target.value }))}
                    placeholder="Oil on Canvas"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={newArtwork.category}
                    onChange={(e) => setNewArtwork(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Dimensions</label>
                <Input
                  value={newArtwork.dimensions}
                  onChange={(e) => setNewArtwork(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="100 x 80 cm"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea
                  value={newArtwork.description}
                  onChange={(e) => setNewArtwork(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your artwork..."
                  className="w-full mt-1 px-3 py-2 border rounded-lg min-h-[100px]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsEditOpen(false); setEditingArtwork(null); resetForm(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-semibold text-gray-900">Order Details</h3>
                <p className="text-xs text-gray-500">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Artwork & Buyer Info */}
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedOrder.artworkImage}
                  alt={selectedOrder.artwork}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedOrder.artwork}</h4>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(selectedOrder.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedOrder.buyerAvatar} alt={selectedOrder.buyer} className="w-6 h-6 rounded-full" />
                    <div>
                      <span className="text-sm text-gray-700">{selectedOrder.buyer}</span>
                      <p className="text-xs text-gray-400">{selectedOrder.buyerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Shipping Address
                </h5>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
              </div>

              {/* Services Checklist */}
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Services to Complete
                </h5>
                <div className="space-y-2">
                  {selectedOrder.services.map((service, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${service.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${service.completed ? "bg-green-500" : "bg-gray-200"}`}>
                        {service.completed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span className="text-xs font-medium text-gray-500">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${service.completed ? "text-green-700 line-through" : "text-gray-700"}`}>
                        {service.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Number (if shipped) */}
              {selectedOrder.status === "shipped" && selectedOrder.trackingNumber && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h5 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                    Tracking Number
                  </h5>
                  <p className="text-sm font-mono text-green-700">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {selectedOrder.status !== "shipped" && (
                  <Button className="flex-1">
                    Mark Next Step Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className={selectedOrder.status === "shipped" ? "flex-1" : ""}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
