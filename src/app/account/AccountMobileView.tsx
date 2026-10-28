"use client";

import React, { useState } from "react";
import {
  Bell,
  HelpCircle,
  Home,
  LayoutGrid,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";

interface AccountMobileViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  accountName?: string;
  accountEmail?: string;
  accountInitials?: string;
  userImage?: string | null;
}

export function AccountMobileView({
  isDark,
  onToggleTheme,
  accountName = "John Doe",
  accountInitials = "JD",
  userImage,
}: AccountMobileViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "investing" | "explore" | "hub">("dashboard");
  const [cardIndex, setCardIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Exact design specs from {8B7B8C3A-7147-4A06-8D53-7A4B961399CE}.png
  // Dark: Background #121212 | Frame #161616 | Hover #2B2B2B
  // Light: Clean matching light equivalents
  const colors = isDark
    ? {
        bg: "#121212",
        frame: "#161616",
        frameHover: "#2B2B2B",
        frameBorder: "#242424",
        textPrimary: "#FFFFFF",
        textSecondary: "#9E9E9E",
        textFaint: "#757575",
        accent: "#7C3AED",
        pillActive: "#8B5CF6",
        badge: "#EF4444",
        cardGrad: "linear-gradient(135deg, #3C2268 0%, #20133A 52%, #4C2684 100%)",
        chipGrad: "linear-gradient(135deg, #F3BA45 0%, #D89824 100%)",
      }
    : {
        bg: "#F5F6F8",
        frame: "#FFFFFF",
        frameHover: "#ECEEF2",
        frameBorder: "#E5E7EB",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textFaint: "#9CA3AF",
        accent: "#6D28D9",
        pillActive: "#7C3AED",
        badge: "#EF4444",
        cardGrad: "linear-gradient(135deg, #4A2B82 0%, #2A174D 52%, #5F34A6 100%)",
        chipGrad: "linear-gradient(135deg, #F5BE4F 0%, #DC9E28 100%)",
      };

  return (
    <div
      className="account-mobile-view flex flex-col w-full min-h-screen pb-24 font-roboto select-none"
      style={{
        backgroundColor: colors.bg,
        color: colors.textPrimary,
        minHeight: "100vh",
      }}
    >
      {/* Toast popup */}
      {toastMessage && (
        <div
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold shadow-lg transition-all"
          style={{
            backgroundColor: colors.frameHover,
            color: colors.textPrimary,
            border: `1px solid ${colors.frameBorder}`,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Bar (Header) with exact 48x48px circular buttons */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        {/* Left: Avatar (48x48px perfect circle) */}
        <button
          type="button"
          onClick={() => showToast(`Signed in as ${accountName}`)}
          className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition active:scale-95"
          style={{
            backgroundColor: colors.frame,
            border: `1px solid ${colors.frameBorder}`,
          }}
          aria-label="User Profile"
        >
          {userImage ? (
            <img src={userImage} alt={accountName} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold text-sm tracking-tight"
              style={{
                background: "linear-gradient(135deg, #FF6B8B 0%, #9B51E0 100%)",
                color: "#FFFFFF",
              }}
            >
              {accountInitials}
            </div>
          )}
        </button>

        {/* Right buttons: Theme Toggle + Help + Bell (all 48x48px perfect circles) */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button (48x48px perfect circle) */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition active:scale-95"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
              color: colors.textPrimary,
            }}
          >
            {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
          </button>

          {/* Help Button (48x48px perfect circle) */}
          <button
            type="button"
            onClick={() => showToast("Help & Support center")}
            aria-label="Help"
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition active:scale-95"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
              color: colors.textPrimary,
            }}
          >
            <HelpCircle size={20} strokeWidth={2} />
          </button>

          {/* Notification Button (48x48px perfect circle with badge) */}
          <button
            type="button"
            onClick={() => showToast("No new notifications")}
            aria-label="Notifications"
            className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition active:scale-95"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
              color: colors.textPrimary,
            }}
          >
            <Bell size={20} strokeWidth={2} />
            <span
              className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-2"
              style={{
                backgroundColor: colors.badge,
                boxShadow: `0 0 0 2px ${colors.frame}`,
              }}
            />
          </button>
        </div>
      </header>

      {/* Account Title */}
      <div className="px-5 pt-3 pb-1">
        <h1
          className="text-[26px] font-bold tracking-tight"
          style={{ color: colors.textPrimary }}
        >
          Account
        </h1>
      </div>

      {/* Balance Cards Carousel (120px height cards) */}
      <div className="pt-2 pb-1">
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
          {/* Card 1: US Dollar */}
          <div
            className="h-[120px] w-[142px] shrink-0 rounded-[18px] p-3.5 flex flex-col justify-between transition cursor-pointer active:scale-[0.98]"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
            }}
            onClick={() => showToast("USD Account selected")}
          >
            {/* US Flag Icon */}
            <div className="w-8 h-5 rounded overflow-hidden shadow-sm flex items-center justify-center bg-blue-900 border border-black/10">
              <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
                <g fill="none">
                  <path fill="#bd3d44" d="M0 0h640v480H0" />
                  <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203.1h640M0 277h640M0 350.8h640M0 424.6h640" />
                  <path fill="#192f5d" d="M0 0h260v258.5H0z" />
                </g>
              </svg>
            </div>
            <div>
              <div className="text-[19px] font-bold tracking-tight leading-tight" style={{ color: colors.textPrimary }}>
                259.12
              </div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                US Dollar
              </div>
            </div>
          </div>

          {/* Card 2: British Pound */}
          <div
            className="h-[120px] w-[142px] shrink-0 rounded-[18px] p-3.5 flex flex-col justify-between transition cursor-pointer active:scale-[0.98]"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
            }}
            onClick={() => showToast("GBP Account selected")}
          >
            {/* UK Flag Icon */}
            <div className="w-8 h-5 rounded overflow-hidden shadow-sm flex items-center justify-center bg-blue-900 border border-black/10">
              <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
                <clipPath id="uk-clip">
                  <path d="M0 0v30h60V0z" />
                </clipPath>
                <clipPath id="uk-diag">
                  <path d="M0 0l60 30m0-30L0 30" />
                </clipPath>
                <g clipPath="url(#uk-clip)">
                  <path d="M0 0v30h60V0z" fill="#012169" />
                  <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
                  <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-diag)" stroke="#C8102E" strokeWidth="4" />
                  <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
                  <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
                </g>
              </svg>
            </div>
            <div>
              <div className="text-[19px] font-bold tracking-tight leading-tight" style={{ color: colors.textPrimary }}>
                2,012.60
              </div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                British Pound
              </div>
            </div>
          </div>

          {/* Card 3: + New Account */}
          <div
            className="h-[120px] w-[116px] shrink-0 rounded-[18px] p-3.5 flex flex-col justify-between transition cursor-pointer active:scale-[0.98]"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
            }}
            onClick={() => showToast("Create new currency account")}
          >
            {/* Plus Icon inside small rounded frame */}
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: colors.frameHover,
                color: colors.textPrimary,
              }}
            >
              <Plus size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight" style={{ color: colors.textPrimary }}>
                New
              </div>
              <div className="text-[11px] font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                Account
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main VISA Card (Exact measurements: 304 x 208 px) */}
      <div className="px-5 pt-4 flex flex-col items-center">
        <div
          className="relative w-full max-w-[340px] h-[208px] rounded-[24px] p-5 overflow-hidden shadow-2xl flex flex-col justify-between transition active:scale-[0.99]"
          style={{
            background: colors.cardGrad,
            boxShadow: isDark
              ? "0 18px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)"
              : "0 18px 36px -8px rgba(58, 35, 98, 0.35)",
          }}
          onClick={() => setCardIndex((prev) => (prev + 1) % 3)}
        >
          {/* Subtle Decorative Wave Layers */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 340 208" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M-20 80 Q 90 20, 180 100 T 360 80 L 360 220 L -20 220 Z"
                fill="rgba(255,255,255,0.4)"
              />
              <path
                d="M-20 120 Q 120 40, 220 140 T 360 110 L 360 220 L -20 220 Z"
                fill="rgba(255,255,255,0.2)"
              />
            </svg>
          </div>

          {/* Card Top: VISA Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[22px] font-black italic tracking-wider text-white select-none">
              VISA
            </span>
          </div>

          {/* Card Center: Chip + Number */}
          <div className="relative z-10 flex flex-col gap-2 my-auto">
            {/* Smart Chip */}
            <div
              className="w-9 h-7 rounded-[6px] relative overflow-hidden flex items-center justify-center shadow-inner"
              style={{ background: colors.chipGrad }}
            >
              <div className="w-full h-[1px] bg-black/25 absolute top-2" />
              <div className="w-full h-[1px] bg-black/25 absolute bottom-2" />
              <div className="w-[1px] h-full bg-black/25 absolute left-3" />
              <div className="w-[1px] h-full bg-black/25 absolute right-3" />
            </div>

            {/* Card Number */}
            <div className="text-[17px] sm:text-[18px] font-mono font-bold tracking-[0.22em] text-white/95 drop-shadow-sm pt-1">
              •••• •••• •••• 2345
            </div>
          </div>

          {/* Card Bottom: Holder Name + Expiry */}
          <div className="relative z-10 flex items-end justify-between pt-1">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-white/65">
                Card Holder name
              </div>
              <div className="text-[13.5px] font-semibold text-white tracking-tight mt-0.5">
                {accountName || "John Doe"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-white/65">
                Expiry Date
              </div>
              <div className="text-[13.5px] font-semibold text-white tracking-tight mt-0.5">
                02/30
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicator (Pill 40px width + 2 dots) */}
        <div className="flex items-center gap-2 mt-4" aria-hidden="true">
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: cardIndex === 0 ? 40 : 8,
              backgroundColor: cardIndex === 0 ? colors.pillActive : colors.frameHover,
            }}
          />
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: cardIndex === 1 ? 40 : 8,
              backgroundColor: cardIndex === 1 ? colors.pillActive : colors.frameHover,
            }}
          />
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: cardIndex === 2 ? 40 : 8,
              backgroundColor: cardIndex === 2 ? colors.pillActive : colors.frameHover,
            }}
          />
        </div>
      </div>

      {/* Transactions Section */}
      <div className="px-5 pt-5">
        <h2
          className="text-[19px] font-bold tracking-tight pb-3"
          style={{ color: colors.textPrimary }}
        >
          Transactions
        </h2>

        <div className="flex flex-col gap-2.5">
          {/* Transaction 1: Amazon */}
          <div
            className="flex items-center justify-between p-3.5 rounded-[18px] transition cursor-pointer active:scale-[0.99]"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
            }}
            onClick={() => showToast("Amazon transaction details")}
          >
            <div className="flex items-center gap-3">
              {/* 48x48px perfect circle frame */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px]"
                style={{
                  backgroundColor: colors.frameHover,
                  color: colors.textPrimary,
                }}
              >
                AM
              </div>
              <div>
                <div className="text-[14.5px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                  Amazon
                </div>
                <div className="text-[11.5px] font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                  Card payment - Today
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[14.5px] font-bold tracking-tight" style={{ color: isDark ? "#F87171" : "#DC2626" }}>
                - $12.12
              </span>
            </div>
          </div>

          {/* Transaction 2: Cashback */}
          <div
            className="flex items-center justify-between p-3.5 rounded-[18px] transition cursor-pointer active:scale-[0.99]"
            style={{
              backgroundColor: colors.frame,
              border: `1px solid ${colors.frameBorder}`,
            }}
            onClick={() => showToast("Cashback transaction details")}
          >
            <div className="flex items-center gap-3">
              {/* 48x48px perfect circle frame */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: colors.frameHover,
                  color: colors.textPrimary,
                }}
              >
                <RotateCcw size={19} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[14.5px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                  Cashback
                </div>
                <div className="text-[11.5px] font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                  Received
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[14.5px] font-bold tracking-tight" style={{ color: isDark ? "#34D399" : "#059669" }}>
                + 21.00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar (4 tabs: Dashboard, Investing, Explore, Hub) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-[70px] px-2 pb-[env(safe-area-inset-bottom,10px)] backdrop-blur-md"
        style={{
          backgroundColor: colors.frame,
          borderTop: `1px solid ${colors.frameBorder}`,
        }}
        aria-label="Mobile Navigation"
      >
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition"
          style={{
            color: activeTab === "dashboard" ? colors.pillActive : colors.textSecondary,
          }}
        >
          <Home size={22} strokeWidth={activeTab === "dashboard" ? 2.4 : 1.8} />
          <span className="text-[10.5px] font-semibold mt-1">Dashboard</span>
        </button>

        {/* Investing */}
        <button
          type="button"
          onClick={() => setActiveTab("investing")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition"
          style={{
            color: activeTab === "investing" ? colors.pillActive : colors.textSecondary,
          }}
        >
          <TrendingUp size={22} strokeWidth={activeTab === "investing" ? 2.4 : 1.8} />
          <span className="text-[10.5px] font-semibold mt-1">Investing</span>
        </button>

        {/* Explore */}
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition"
          style={{
            color: activeTab === "explore" ? colors.pillActive : colors.textSecondary,
          }}
        >
          <Search size={22} strokeWidth={activeTab === "explore" ? 2.4 : 1.8} />
          <span className="text-[10.5px] font-semibold mt-1">Explore</span>
        </button>

        {/* Hub */}
        <button
          type="button"
          onClick={() => setActiveTab("hub")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition"
          style={{
            color: activeTab === "hub" ? colors.pillActive : colors.textSecondary,
          }}
        >
          <LayoutGrid size={22} strokeWidth={activeTab === "hub" ? 2.4 : 1.8} />
          <span className="text-[10.5px] font-semibold mt-1">Hub</span>
        </button>
      </nav>
    </div>
  );
}
