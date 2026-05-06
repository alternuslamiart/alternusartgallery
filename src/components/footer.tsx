"use client";

import Link from "next/link";
import Script from "next/script";
import { useLanguage } from "@/components/providers";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-[#0D0904] text-white rounded-t-[24px] md:rounded-t-[32px] lg:rounded-t-[48px]">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-2xl font-bold font-playfair tracking-tight">Cerevix</h3>
            <p className="text-sm text-gray-300">
              An exclusive art gallery where every piece tells a unique story.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.facebook.com/alternusart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#1877F2] transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/alternusart/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#E4405F] transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://x.com/Cerevixart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@alternusart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#FF0000] transition-colors"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@alternusart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
            <p className="text-xs text-gray-300 pt-2">&copy; {new Date().getFullYear()} Cerevix Art Gallery. {t("allRights")}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-1">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("gallery")}
                </Link>
              </li>
              <li>
                <Link href="/virtual-gallery" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Virtual Gallery
                </Link>
              </li>
              <li>
                <Link href="/pre-order" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Pre-Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-1">{t("customerService")}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/commissions" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("commissions")}
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("giftCards")}
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("careGuide")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-1">{t("shipping")}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/shipping" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("shipping")}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("returns")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-1">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/accessibility" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/cookie-notice" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Cookie Notice
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="inline-block py-0.5 text-sm text-white/55 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Center */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-1">{t("helpCenter")}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/help" className="inline-block py-1 hover:text-white transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {t("liveChat")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-block py-1 hover:text-white transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="inline-block py-1 hover:text-white transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {t("emailSupport")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="inline-block py-1 hover:text-white transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                  </svg>
                  {t("trackOrder")}
                </Link>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* TrustBox script */}
      <Script
        src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />

      {/* Marquee Section */}
      <div className="overflow-hidden border-t border-white/5">
        <div className="animate-marquee">
          <span className="text-[256px] font-bold bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent mx-16 leading-none whitespace-nowrap">
            Cerevix
          </span>
          <span className="text-[256px] font-bold bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent mx-16 leading-none whitespace-nowrap">
            Cerevix
          </span>
          <span className="text-[256px] font-bold bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent mx-16 leading-none whitespace-nowrap">
            Cerevix
          </span>
          <span className="text-[256px] font-bold bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-clip-text text-transparent mx-16 leading-none whitespace-nowrap">
            Cerevix
          </span>
        </div>
      </div>

      {/* Small Marquee Strip */}
      <div className="h-[64px] flex items-center overflow-hidden">
        <div className="animate-marquee-slow">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-14 px-4 md:px-8">
              <span className="font-playfair text-2xl md:text-3xl font-bold text-white/20 whitespace-nowrap select-none">Cerevix</span>
              <span className="text-white/20 text-lg select-none">&bull;</span>
              <span className="font-playfair text-2xl md:text-3xl font-bold text-white/20 whitespace-nowrap select-none">Art Gallery</span>
              <span className="text-white/20 text-lg select-none">&bull;</span>
              <span className="font-playfair text-2xl md:text-3xl font-bold text-white/20 whitespace-nowrap select-none">Since 2026</span>
              <span className="text-white/20 text-lg select-none">&bull;</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
