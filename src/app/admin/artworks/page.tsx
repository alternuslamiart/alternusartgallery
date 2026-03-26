"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  price: number;
  commission: number;
  artistEarning: number;
  image: string;
  medium: string;
  style: string;
  dimensions: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected" | "sold";
}

interface AddArtworkForm {
  title: string;
  description: string;
  price: string;
  primaryImage: string;
  medium: string;
  style: string;
  category: string;
  dimensions: string;
  yearCreated: string;
  saleStatus: "for_sale" | "sold";
}

// Image upload state
interface UploadState {
  isUploading: boolean;
  preview: string | null;
  error: string | null;
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddArtworkForm>({
    title: "",
    description: "",
    price: "",
    primaryImage: "",
    medium: "",
    style: "",
    category: "Painting",
    dimensions: "",
    yearCreated: new Date().getFullYear().toString(),
    saleStatus: "for_sale",
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    preview: null,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadState({ ...uploadState, error: 'Please select an image file' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState({ ...uploadState, error: 'Image must be less than 10MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState({ isUploading: true, preview: e.target?.result as string, error: null });
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, primaryImage: data.url });
        setUploadState({ isUploading: false, preview: data.url, error: null });
      } else {
        setUploadState({ isUploading: false, preview: null, error: data.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({ isUploading: false, preview: null, error: 'Failed to upload image' });
    }
  };

  // Fetch artworks from database
  useEffect(() => {
    async function fetchArtworks() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/artworks');
        const data = await response.json();

        if (data.artworks) {
          const mappedArtworks: Artwork[] = data.artworks.map((artwork: {
            id: string;
            title: string;
            price: number;
            primaryImage: string;
            medium?: string;
            style?: string;
            dimensions?: string;
            status: string;
            createdAt: string;
            artist?: { id: string; displayName: string };
          }) => ({
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist?.displayName || 'Unknown',
            artistId: artwork.artist?.id || '',
            price: artwork.price,
            commission: Math.round(artwork.price * 0.4),
            artistEarning: Math.round(artwork.price * 0.6),
            image: artwork.primaryImage,
            medium: artwork.medium || '',
            style: artwork.style || '',
            dimensions: artwork.dimensions || '',
            uploadDate: new Date(artwork.createdAt).toISOString().split('T')[0],
            status: artwork.status.toLowerCase() as "pending" | "approved" | "rejected" | "sold",
          }));
          setArtworks(mappedArtworks);
        }
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          primaryImage: formData.primaryImage,
          medium: formData.medium,
          style: formData.style,
          category: formData.category,
          dimensions: formData.dimensions,
          yearCreated: formData.yearCreated,
          status: formData.saleStatus === "sold" ? "SOLD" : "APPROVED",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the artworks list
        window.location.reload();
      } else {
        alert(data.error || 'Failed to add artwork');
      }
    } catch (error) {
      console.error('Error adding artwork:', error);
      alert('Failed to add artwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "sold">("all");
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
    setArtworks(
      artworks.map((artwork) =>
        artwork.id === id ? { ...artwork, status: "approved" as const } : artwork
      )
    );
  };

  const handleReject = (id: string) => {
    const reason = prompt("Arsyeja e refuzimit:");
    if (reason) {
      setArtworks(
        artworks.map((artwork) =>
          artwork.id === id ? { ...artwork, status: "rejected" as const } : artwork
        )
      );
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'SOLD' | 'APPROVED') => {
    try {
      const response = await fetch(`/api/admin/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setArtworks(
          artworks.map((artwork) =>
            artwork.id === id ? { ...artwork, status: newStatus.toLowerCase() as "sold" | "approved" } : artwork
          )
        );
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Delete artwork
  const handleDeleteArtwork = async (id: string, title: string) => {
    if (!confirm(`A jeni i sigurt që dëshironi të fshini "${title}"? Ky veprim nuk mund të zhbëhet.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/artworks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArtworks(artworks.filter((artwork) => artwork.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Dështoi fshirja e veprës');
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
      alert('Dështoi fshirja e veprës');
    } finally {
      setIsDeleting(null);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      description: '',
      price: artwork.price.toString(),
      primaryImage: artwork.image,
      medium: artwork.medium,
      style: artwork.style,
      category: 'Painting',
      dimensions: artwork.dimensions,
      yearCreated: new Date().getFullYear().toString(),
      saleStatus: artwork.status === 'sold' ? 'sold' : 'for_sale',
    });
    setUploadState({
      isUploading: false,
      preview: artwork.image,
      error: null,
    });
    setShowEditModal(true);
  };

  // Edit artwork
  const handleEditArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/artworks/${editingArtwork.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          status: formData.saleStatus === 'sold' ? 'SOLD' : 'APPROVED',
        }),
      });

      if (response.ok) {
        setArtworks(
          artworks.map((artwork) =>
            artwork.id === editingArtwork.id
              ? {
                  ...artwork,
                  title: formData.title,
                  price: parseFloat(formData.price),
                  commission: Math.round(parseFloat(formData.price) * 0.4),
                  artistEarning: Math.round(parseFloat(formData.price) * 0.6),
                  status: formData.saleStatus === 'sold' ? 'sold' as const : 'approved' as const,
                }
              : artwork
          )
        );
        setShowEditModal(false);
        setEditingArtwork(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Dështoi përditësimi i veprës');
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
      alert('Dështoi përditësimi i veprës');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredArtworks = artworks.filter((artwork) =>
    filterStatus === "all" ? true : artwork.status === filterStatus
  );

  const stats = {
    total: artworks.length,
    pending: artworks.filter((a) => a.status === "pending").length,
    approved: artworks.filter((a) => a.status === "approved").length,
    rejected: artworks.filter((a) => a.status === "rejected").length,
    sold: artworks.filter((a) => a.status === "sold").length,
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
                <Link
                  href="/admin/artists"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Artists
                </Link>
                <div className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg relative">
                  Artworks
                  {stats.pending > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.pending}
                    </span>
                  )}
                </div>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Artwork Management</h2>
            <p className="text-zinc-600">Review and manage all artwork submissions</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black hover:bg-zinc-800"
          >
            + Add Artwork
          </Button>
        </div>

        {/* Add Artwork Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Add New Artwork</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-zinc-100 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddArtwork} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Artwork title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                    placeholder="Describe the artwork..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Price (€) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Year Created</label>
                    <input
                      type="number"
                      value={formData.yearCreated}
                      onChange={(e) => setFormData({ ...formData, yearCreated: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Artwork Image *</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Upload Area */}
                  {!uploadState.preview && !formData.primaryImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-zinc-400 mb-3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                      </svg>
                      <p className="text-sm font-medium text-zinc-700">Click to upload image</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Preview Image */}
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100">
                        {uploadState.isUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-center text-white">
                              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-sm">Uploading...</p>
                            </div>
                          </div>
                        ) : null}
                        <Image
                          src={uploadState.preview || formData.primaryImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Change Image Button */}
                      {!uploadState.isUploading && (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadState({ isUploading: false, preview: null, error: null });
                            setFormData({ ...formData, primaryImage: '' });
                            fileInputRef.current?.click();
                          }}
                          className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-colors"
                        >
                          Change Image
                        </button>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadState.error && (
                    <p className="text-xs text-red-500 mt-2">{uploadState.error}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Medium</label>
                    <input
                      type="text"
                      value={formData.medium}
                      onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Oil on canvas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="100x80 cm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="Painting">Painting</option>
                      <option value="Photography">Photography</option>
                      <option value="Sculpture">Sculpture</option>
                      <option value="Drawing">Drawing</option>
                      <option value="Mixed Media">Mixed Media</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Style</label>
                    <input
                      type="text"
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Abstract, Contemporary, etc."
                    />
                  </div>
                </div>

                {/* Sale Status Toggle */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-3">Sale Status</label>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, saleStatus: "for_sale" })}
                      className={`w-28 h-11 rounded-full text-sm font-semibold transition-all ${
                        formData.saleStatus === "for_sale"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, saleStatus: "sold" })}
                      className={`w-28 h-11 rounded-full text-sm font-semibold transition-all ${
                        formData.saleStatus === "sold"
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      Sold
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black hover:bg-zinc-800"
                  >
                    {isSubmitting ? "Adding..." : "Add Artwork"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Artwork Modal */}
        {showEditModal && editingArtwork && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Artwork</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingArtwork(null);
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditArtwork} className="p-6 space-y-4">
                {/* Preview Image */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100">
                  <Image
                    src={editingArtwork.image}
                    alt={editingArtwork.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Price (€) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Sale Status Toggle */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-3">Sale Status</label>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, saleStatus: "for_sale" })}
                      className={`w-28 h-11 rounded-full text-sm font-semibold transition-all ${
                        formData.saleStatus === "for_sale"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, saleStatus: "sold" })}
                      className={`w-28 h-11 rounded-full text-sm font-semibold transition-all ${
                        formData.saleStatus === "sold"
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      Sold
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingArtwork(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black hover:bg-zinc-800"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <p className="text-sm text-zinc-600 mb-1">Total Artworks</p>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Pending Approval</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <p className="text-sm text-emerald-700 mb-1">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Sold</p>
            <p className="text-3xl font-bold text-blue-600">{stats.sold}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-black" : ""}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              className={filterStatus === "pending" ? "bg-orange-600" : ""}
            >
              Pending ({stats.pending})
            </Button>
            <Button
              variant={filterStatus === "approved" ? "default" : "outline"}
              onClick={() => setFilterStatus("approved")}
              className={filterStatus === "approved" ? "bg-emerald-600" : ""}
            >
              Approved ({stats.approved})
            </Button>
            <Button
              variant={filterStatus === "sold" ? "default" : "outline"}
              onClick={() => setFilterStatus("sold")}
              className={filterStatus === "sold" ? "bg-blue-600" : ""}
            >
              Sold ({stats.sold})
            </Button>
            <Button
              variant={filterStatus === "rejected" ? "default" : "outline"}
              onClick={() => setFilterStatus("rejected")}
              className={filterStatus === "rejected" ? "bg-red-600" : ""}
            >
              Rejected ({stats.rejected})
            </Button>
          </div>
        </div>

        {/* Artworks Grid */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading artworks...</p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No artworks yet</h3>
            <p className="text-zinc-600 mb-4">Start by adding your first artwork</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-black hover:bg-zinc-800">
              + Add Artwork
            </Button>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                <Image src={artwork.image} alt={artwork.title} fill className="object-cover" />
                <div className="absolute top-4 right-4">
                  {artwork.status === "pending" && (
                    <Badge className="bg-orange-500 text-white border-0">Pending</Badge>
                  )}
                  {artwork.status === "approved" && (
                    <Badge className="bg-emerald-500 text-white border-0">Approved</Badge>
                  )}
                  {artwork.status === "sold" && (
                    <Badge className="bg-blue-500 text-white border-0">Sold</Badge>
                  )}
                  {artwork.status === "rejected" && (
                    <Badge className="bg-red-500 text-white border-0">Rejected</Badge>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-bold text-xl text-black mb-1">{artwork.title}</h3>
                <p className="text-zinc-600 text-sm mb-4">by {artwork.artist}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Price</span>
                    <span className="font-semibold text-black">
                      €{artwork.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Commission (40%)</span>
                    <span className="font-semibold text-emerald-600">
                      €{artwork.commission.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Artist (60%)</span>
                    <span className="font-semibold text-purple-600">
                      €{artwork.artistEarning.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4 mb-4 space-y-1 text-sm text-zinc-600">
                  <p>
                    <span className="font-medium">Medium:</span> {artwork.medium}
                  </p>
                  <p>
                    <span className="font-medium">Style:</span> {artwork.style}
                  </p>
                  <p>
                    <span className="font-medium">Dimensions:</span> {artwork.dimensions}
                  </p>
                  <p>
                    <span className="font-medium">Uploaded:</span> {artwork.uploadDate}
                  </p>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenEditModal(artwork)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                    disabled={isDeleting === artwork.id}
                  >
                    {isDeleting === artwork.id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                    )}
                  </Button>
                </div>

                {/* Status Actions */}
                {artwork.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(artwork.id)}
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(artwork.id)}
                    >
                      ✗ Reject
                    </Button>
                  </div>
                )}
                {(artwork.status === "approved" || artwork.status === "sold") && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleStatusChange(artwork.id, 'APPROVED')}
                      className={`w-24 h-10 rounded-full text-sm font-semibold transition-all ${
                        artwork.status === "approved"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      onClick={() => handleStatusChange(artwork.id, 'SOLD')}
                      className={`w-24 h-10 rounded-full text-sm font-semibold transition-all ${
                        artwork.status === "sold"
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      Sold
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
