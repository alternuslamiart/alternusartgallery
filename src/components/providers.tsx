"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SessionProvider } from "next-auth/react";
import { Language, translations } from "@/lib/i18n";
import { Painting } from "@/lib/paintings";
import { formatPrice as formatPriceUtil, getCurrencyForLanguage } from "@/lib/currency";

// Language Context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (priceInEur: number) => string;
  currencySymbol: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Cart Context
interface FrameOption {
  id: "none" | "black" | "white";
  label: string;
  price: number;
}

interface CartItem {
  painting: Painting;
  quantity: number;
  frame: FrameOption;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (painting: Painting, frame?: FrameOption) => void;
  removeFromCart: (paintingId: string) => void;
  updateQuantity: (paintingId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Wishlist Context
interface WishlistContextType {
  wishlist: Painting[];
  addToWishlist: (painting: Painting) => void;
  removeFromWishlist: (paintingId: string) => void;
  isInWishlist: (paintingId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

// Reviews Context
export interface Review {
  id: string;
  paintingId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "date" | "helpful">) => void;
  getReviewsByPaintingId: (paintingId: string) => Review[];
  getAverageRating: (paintingId: string) => number;
  getRatingCount: (paintingId: string) => number;
  markHelpful: (reviewId: string) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}

// Auth Context
interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Compare Context
interface CompareContextType {
  compareList: Painting[];
  addToCompare: (painting: Painting) => void;
  removeFromCompare: (paintingId: string) => void;
  clearCompare: () => void;
  isInCompare: (paintingId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}

// User Artworks Context
interface UserArtworksContextType {
  userArtworks: Painting[];
  addUserArtwork: (artwork: Painting) => void;
  removeUserArtwork: (artworkId: string) => void;
  updateUserArtwork: (artworkId: string, updates: Partial<Painting>) => void;
}

const UserArtworksContext = createContext<UserArtworksContextType | undefined>(undefined);

export function useUserArtworks() {
  const context = useContext(UserArtworksContext);
  if (!context) {
    throw new Error("useUserArtworks must be used within a UserArtworksProvider");
  }
  return context;
}

// Combined Provider
export function Providers({ children }: { children: React.ReactNode }) {
  // Language State
  const [language, setLanguage] = useState<Language>("en-US");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Wishlist State
  const [wishlist, setWishlist] = useState<Painting[]>([]);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load wishlist", e);
      }
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (painting: Painting) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === painting.id)) {
        return prev;
      }
      return [...prev, painting];
    });
  };

  const removeFromWishlist = (paintingId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== paintingId));
  };

  const isInWishlist = (paintingId: string): boolean => {
    return wishlist.some((p) => p.id === paintingId);
  };

  const wishlistCount = wishlist.length;

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reviews");
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load reviews", e);
      }
    }
  }, []);

  // Save reviews to localStorage
  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review: Omit<Review, "id" | "date" | "helpful">) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      helpful: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  const getReviewsByPaintingId = (paintingId: string): Review[] => {
    return reviews.filter((r) => r.paintingId === paintingId);
  };

  const getAverageRating = (paintingId: string): number => {
    const paintingReviews = getReviewsByPaintingId(paintingId);
    if (paintingReviews.length === 0) return 0;
    const sum = paintingReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / paintingReviews.length;
  };

  const getRatingCount = (paintingId: string): number => {
    return getReviewsByPaintingId(paintingId).length;
  };

  const markHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    }
    setCartLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, cartLoaded]);

  const defaultFrame: FrameOption = { id: "none", label: "No Frame", price: 0 };

  const addToCart = (painting: Painting, frame?: FrameOption) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.painting.id === painting.id);
      if (existing) {
        return prev;
      }
      return [...prev, { painting, quantity: 1, frame: frame || defaultFrame }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (paintingId: string) => {
    setCartItems((prev) => prev.filter((item) => item.painting.id !== paintingId));
  };

  const updateQuantity = (paintingId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.painting.id === paintingId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.length;
  const total = cartItems.reduce((sum, item) => sum + item.painting.price + (item.frame?.price || 0), 0);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = (email: string, password: string) => {
    // Simulate login
    setUser({ name: email.split("@")[0], email });
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  // Compare State
  const [compareList, setCompareList] = useState<Painting[]>([]);

  // Load compare list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load compare list", e);
      }
    }
  }, []);

  // Save compare list to localStorage
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (painting: Painting) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === painting.id)) {
        return prev;
      }
      // Limit to 4 artworks for comparison
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, painting];
    });
  };

  const removeFromCompare = (paintingId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== paintingId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (paintingId: string): boolean => {
    return compareList.some((p) => p.id === paintingId);
  };

  const compareCount = compareList.length;

  // User Artworks State - stored per user
  const [userArtworks, setUserArtworks] = useState<Painting[]>([]);

  // Get user-specific storage key (works for both localStorage auth and NextAuth session)
  const getUserArtworksKey = useCallback(() => {
    // Check localStorage first (for CEO and local auth)
    if (typeof window !== "undefined") {
      const localEmail = localStorage.getItem("userEmail");
      if (localEmail) return `userArtworks_${localEmail}`;
    }
    // Fallback to user context (for OAuth users)
    if (user?.email) return `userArtworks_${user.email}`;
    return null;
  }, [user?.email]);

  // Load user artworks from localStorage (user-specific)
  useEffect(() => {
    const key = getUserArtworksKey();
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setUserArtworks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load user artworks", e);
          setUserArtworks([]);
        }
      } else {
        setUserArtworks([]);
      }
    } else {
      // No user logged in, clear artworks
      setUserArtworks([]);
    }
  }, [getUserArtworksKey]); // Re-run when key changes

  // Save user artworks to localStorage (user-specific)
  useEffect(() => {
    const key = getUserArtworksKey();
    if (key && userArtworks.length > 0) {
      localStorage.setItem(key, JSON.stringify(userArtworks));
    }
  }, [userArtworks, getUserArtworksKey]);

  const addUserArtwork = (artwork: Painting) => {
    setUserArtworks((prev) => [artwork, ...prev]);
  };

  const removeUserArtwork = (artworkId: string) => {
    setUserArtworks((prev) => prev.filter((a) => a.id !== artworkId));
  };

  const updateUserArtwork = (artworkId: string, updates: Partial<Painting>) => {
    setUserArtworks((prev) =>
      prev.map((artwork) =>
        artwork.id === artworkId ? { ...artwork, ...updates } : artwork
      )
    );
  };

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | "en" | null;
    // Migrate old "en" to "en-US"
    if (saved === "en") {
      setLanguage("en-US");
    } else if (saved && ["en-US", "en-GB", "fr", "de", "it", "es", "pt", "zh", "ja", "ar", "nl", "tr"].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const formatPrice = (priceInEur: number): string => {
    return formatPriceUtil(priceInEur, language);
  };

  const currencyInfo = getCurrencyForLanguage(language);
  const currencySymbol = currencyInfo.symbol;

  return (
    <SessionProvider>
      <LanguageContext.Provider value={{ language, setLanguage, t, formatPrice, currencySymbol }}>
        <WishlistContext.Provider
          value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            wishlistCount,
          }}
        >
          <CompareContext.Provider
            value={{
              compareList,
              addToCompare,
              removeFromCompare,
              clearCompare,
              isInCompare,
              compareCount,
            }}
          >
            <ReviewsContext.Provider
              value={{
                reviews,
                addReview,
                getReviewsByPaintingId,
                getAverageRating,
                getRatingCount,
                markHelpful,
              }}
            >
              <CartContext.Provider
                value={{
                  items: cartItems,
                  addToCart,
                  removeFromCart,
                  updateQuantity,
                  clearCart,
                  itemCount,
                  total,
                  isOpen: isCartOpen,
                  setIsOpen: setIsCartOpen,
                }}
              >
                <AuthContext.Provider
                  value={{
                    isLoggedIn,
                    user,
                    login,
                    logout,
                    isLoginOpen,
                    setIsLoginOpen,
                  }}
                >
                  <UserArtworksContext.Provider
                    value={{
                      userArtworks,
                      addUserArtwork,
                      removeUserArtwork,
                      updateUserArtwork,
                    }}
                  >
                    {children}
                  </UserArtworksContext.Provider>
                </AuthContext.Provider>
              </CartContext.Provider>
            </ReviewsContext.Provider>
          </CompareContext.Provider>
        </WishlistContext.Provider>
      </LanguageContext.Provider>
    </SessionProvider>
  );
}
