import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Roboto_Flex, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartModal } from "@/components/cart-modal";
import { ArtLoverModal } from "@/components/art-lover-modal";
import { CookieModal } from "@/components/cookie-modal";
import { AIChat } from "@/components/ai-chat";
import { LayoutShell } from "@/components/layout-shell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-roboto",
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://alternusart.com'),
  title: {
    default: "Alternus Art Gallery | Original Artworks & Paintings",
    template: "%s | Alternus Art Gallery",
  },
  description: "Discover and purchase exclusive original artworks from talented artists worldwide. Alternus Gallery features unique paintings, prints, and commissioned art pieces.",
  keywords: ["art gallery", "original artworks", "paintings", "art for sale", "buy art online", "contemporary art", "abstract art", "impressionism", "artists", "art collectors"],
  authors: [{ name: "Alternus Art Gallery" }],
  creator: "Alternus Art Gallery",
  publisher: "Alternus Art Gallery",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alternusart.com",
    siteName: "Alternus Art Gallery",
    title: "Alternus Art Gallery | Original Artworks & Paintings",
    description: "Discover and purchase exclusive original artworks from talented artists worldwide.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Alternus Art Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternus Art Gallery | Original Artworks & Paintings",
    description: "Discover and purchase exclusive original artworks from talented artists worldwide.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'W4-KDn_AOLs9zBjvapl4jvxLFcuOvBqP-yV8wf1CCCo',
  },
  other: {
    "trustpilot-one-time-domain-verification-id": "97339bc2-345b-49c2-a68e-f83d09f259c1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google AdSense - Auto Ads */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7703640549256264"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-WJV9KGNV0S"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WJV9KGNV0S');
        `}
      </Script>
      {/* Schema.org Structured Data */}
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://alternusart.com/#organization",
            "name": "Alternus Art Gallery",
            "alternateName": "Alternus",
            "url": "https://alternusart.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://alternusart.com/logo.png",
              "width": 512,
              "height": 512
            },
            "image": "https://alternusart.com/logo.png",
            "description": "Discover and purchase exclusive original artworks from talented artists worldwide. Alternus Gallery features unique paintings, prints, and commissioned art pieces.",
            "email": "contact@alternusart.com",
            "foundingDate": "2024",
            "sameAs": [
              "https://www.instagram.com/alternusart",
              "https://www.facebook.com/alternusart",
              "https://www.trustpilot.com/review/alternusart.com"
            ],
            "areaServed": "Worldwide",
            "knowsAbout": [
              "Art Gallery",
              "Original Artworks",
              "Abstract Art",
              "Contemporary Art",
              "Landscape Paintings",
              "Still Life Art",
              "Oil Paintings"
            ]
          })
        }}
      />
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://alternusart.com/#website",
            "url": "https://alternusart.com",
            "name": "Alternus Art Gallery",
            "description": "Online art gallery featuring original artworks and paintings from artists worldwide",
            "publisher": {
              "@id": "https://alternusart.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://alternusart.com/gallery?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${robotoFlex.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <LayoutShell>{children}</LayoutShell>
          <CartModal />
          <CookieModal />
          <ArtLoverModal />
          <AIChat />
        </Providers>
      </body>
    </html>
  );
}
