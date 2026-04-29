import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Roboto_Flex, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartModal } from "@/components/cart-modal";
import { ArtLoverModal } from "@/components/art-lover-modal";
import { CookieModal } from "@/components/cookie-modal";
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
  weight: ["400", "500", "700", "900"],
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
  metadataBase: new URL("https://www.alternusart.com"),
  applicationName: "Alternus AI Studio",
  title: {
    default: "Alternus AI Studio | Creative AI Workspace",
    template: "%s | Alternus AI Studio",
  },
  description:
    "Alternus AI Studio is a creative AI workspace for design, film, motion, and in-tool production workflows.",
  keywords: [
    "AI studio",
    "creative AI",
    "design AI",
    "film AI",
    "AI workspace",
    "motion design AI",
    "Alternus AI",
    "creative operating system",
    "After Effects AI",
    "Premiere AI",
    "Blender AI",
  ],
  authors: [{ name: "Alternus AI Studio" }],
  creator: "Alternus AI Studio",
  publisher: "Alternus AI Studio",
  icons: {
    icon: [
      { url: "/alternus-ai-favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/alternus-ai-favicon.svg",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.alternusart.com",
    siteName: "Alternus AI Studio",
    title: "Alternus AI Studio | Creative AI Workspace",
    description:
      "Creative AI workspace for designers and filmmakers. Build, direct, animate, and ship inside Alternus.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Alternus AI Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternus AI Studio | Creative AI Workspace",
    description:
      "Creative AI workspace for designers and filmmakers. Alternus turns prompts into real production work.",
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
            "@id": "https://www.alternusart.com/#organization",
            "name": "Alternus AI Studio",
            "alternateName": "Alternus",
            "url": "https://www.alternusart.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.alternusart.com/logo.png",
              "width": 512,
              "height": 512
            },
            "image": "https://www.alternusart.com/logo.png",
            "description": "Creative AI workspace for design, film, motion, and in-tool production workflows.",
            "email": "contact@alternusart.com",
            "foundingDate": "2024",
            "sameAs": [
              "https://www.instagram.com/alternusart",
              "https://www.facebook.com/alternusart"
            ],
            "areaServed": "Worldwide",
            "knowsAbout": [
              "Creative AI",
              "Motion Design AI",
              "Film Workflows",
              "After Effects Automation",
              "Premiere Pro Workflows",
              "Blender Workflows",
              "AI-Powered Production"
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
            "@id": "https://www.alternusart.com/#website",
            "url": "https://www.alternusart.com",
            "name": "Alternus AI Studio",
            "description": "Creative AI workspace for design, film, and production workflows",
            "publisher": {
              "@id": "https://www.alternusart.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.alternusart.com/gallery?search={search_term_string}"
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
        </Providers>
      </body>
    </html>
  );
}
