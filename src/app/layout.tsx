import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Roboto_Flex } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alternusart.com"),
  applicationName: "Cerevix AI",
  title: {
    default: "Cerevix AI | Creative AI Workspace",
    template: "%s | Cerevix AI",
  },
  description:
    "Cerevix AI is a creative AI workspace for AutoCAD website design, coding agents, and Blender 3D production workflows.",
  keywords: [
    "AI studio",
    "creative AI",
    "AutoCAD AI",
    "website design AI",
    "Blender AI",
    "Blender 3D AI",
    "code agent",
    "AI workspace",
    "Cerevix AI",
    "creative operating system",
  ],
  authors: [{ name: "Cerevix AI" }],
  creator: "Cerevix AI",
  publisher: "Cerevix AI",
  icons: {
    icon: [
      { url: "/cerevix-ai-favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/cerevix-ai-favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/cerevix-ai-favicon.png",
    apple: "/cerevix-ai-favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.alternusart.com",
    siteName: "Cerevix AI",
    title: "Cerevix AI | Creative AI Workspace",
    description:
      "Creative AI workspace for AutoCAD website design, coding agents, and Blender 3D production.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Cerevix AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cerevix AI | Creative AI Workspace",
    description:
      "Creative AI workspace for AutoCAD website design and Blender 3D. Cerevix turns prompts into real production work.",
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
      <style
        id="cerevix-dark-flat"
        dangerouslySetInnerHTML={{
          __html: `
            html[data-cerevix-theme="dark"],
            .dark {
              --background: 240 5% 8%;
              --foreground: 240 11% 96%;
              --card: 240 6% 13%;
              --card-foreground: 240 11% 96%;
              --popover: 240 6% 13%;
              --popover-foreground: 240 11% 96%;
              --primary: 218 100% 63%;
              --primary-foreground: 0 0% 100%;
              --secondary: 240 5% 15%;
              --secondary-foreground: 240 11% 96%;
              --muted: 240 5% 15%;
              --muted-foreground: 240 5% 70%;
              --accent: 240 5% 15%;
              --accent-foreground: 240 11% 96%;
              --border: 240 5% 25%;
              --input: 240 5% 25%;
              --ring: 218 100% 63%;
            }
            html[data-cerevix-theme="dark"] *,
            html[data-cerevix-theme="dark"] *::before,
            html[data-cerevix-theme="dark"] *::after,
            .dark *,
            .dark *::before,
            .dark *::after {
              box-shadow: none !important;
              text-shadow: none !important;
            }
          `,
        }}
      />
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
            "name": "Cerevix AI",
            "alternateName": "Cerevix",
            "url": "https://www.alternusart.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.alternusart.com/logo.png",
              "width": 512,
              "height": 512
            },
            "image": "https://www.alternusart.com/logo.png",
            "description": "Creative AI workspace for AutoCAD website design, coding agents, and Blender 3D production workflows.",
            "email": "contact@alternusart.com",
            "foundingDate": "2024",
            "sameAs": [
              "https://www.instagram.com/alternusart",
              "https://www.facebook.com/alternusart"
            ],
            "areaServed": "Worldwide",
            "knowsAbout": [
              "Creative AI",
              "AutoCAD Website Design",
              "Website Coding Agents",
              "Blender 3D Workflows",
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
            "name": "Cerevix AI",
            "description": "Creative AI workspace for AutoCAD website design, coding agents, and Blender 3D production workflows",
            "publisher": {
              "@id": "https://www.alternusart.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
              "urlTemplate": "https://www.alternusart.com/main?query={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${robotoFlex.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <LayoutShell>{children}</LayoutShell>
          <CookieModal />
        </Providers>
      </body>
    </html>
  );
}
