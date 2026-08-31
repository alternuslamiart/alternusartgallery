import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Roboto_Flex } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CookieModal } from "@/components/cookie-modal";
import { LayoutShell } from "@/components/layout-shell";
import { SignInPopup } from "@/components/signin-popup";

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
 weight: ["300", "400", "500", "700"],
 variable: "--font-roboto",
 display: "swap",
});

const robotoFlex = Roboto_Flex({
 subsets: ["latin"],
 variable: "--font-roboto-flex",
 display: "swap",
});

export const metadata: Metadata = {
 metadataBase: new URL("https://www.alternusart.com"),
 applicationName: "Crystal Studio",
 title: {
 default: "Crystal Studio | AI Engineering and 3D CAD",
 template: "%s | Crystal Studio",
 },
 description:
 "Crystal Studio is an AI workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation.",
 keywords: [
 "3D machinery design",
 "engine 3D design",
 "industrial machinery CAD",
 "automotive 3D design",
 "motorcycle 3D design",
 "CNC CAM AI",
 "CAD studio integration",
 "AI code assistant",
 "Crystal Studio",
 "mechanical engineering AI",
 ],
 authors: [{ name: "Crystal Studio" }],
 creator: "Crystal Studio",
 publisher: "Crystal Studio",
 icons: {
 icon: [
 { url: "/favicon.svg", type: "image/svg+xml" },
 { url: "/logo.png", sizes: "512x512", type: "image/png" },
 ],
 shortcut: "/favicon.svg",
 apple: "/logo.png",
 },
 openGraph: {
 type: "website",
 locale: "en_US",
 url: "https://www.alternusart.com",
 siteName: "Crystal Studio",
 title: "Crystal Studio | AI Engineering and 3D CAD",
 description:
 "AI workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation.",
 images: [
 {
 url: "/logo.png",
 width: 512,
 height: 512,
 alt: "Crystal Studio",
 },
 ],
 },
 twitter: {
 card: "summary_large_image",
 title: "Crystal Studio | AI Engineering and 3D CAD",
 description:
 "AI workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation.",
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
 id="cedium-dark-flat"
 dangerouslySetInnerHTML={{
 __html: `
 html[data-cedium-theme="dark"],
 .dark {
 --background: 0 0% 11%;
 --foreground: 80 2% 75%;
 --card: 0 0% 15%;
 --card-foreground: 80 2% 75%;
 --popover: 0 0% 15%;
 --popover-foreground: 80 2% 75%;
 --primary: 218 100% 63%;
 --primary-foreground: 0 0% 100%;
 --secondary: 0 0% 15%;
 --secondary-foreground: 80 2% 75%;
 --muted: 0 0% 15%;
 --muted-foreground: 80 2% 75%;
 --accent: 0 0% 15%;
 --accent-foreground: 80 2% 75%;
 --border: 0 0% 20%;
 --input: 0 0% 20%;
 --ring: 218 100% 63%;
 }
 html[data-cedium-theme="dark"] *,
 html[data-cedium-theme="dark"] *::before,
 html[data-cedium-theme="dark"] *::after,
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
 "name": "Crystal Studio",
 "alternateName": "Crystal Studio AI Engineering",
 "url": "https://www.alternusart.com",
 "logo": {
 "@type": "ImageObject",
 "url": "https://www.alternusart.com/logo.png",
 "width": 512,
 "height": 512
 },
 "image": "https://www.alternusart.com/logo.png",
 "description": "AI workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation.",
 "email": "contact@alternusart.com",
 "foundingDate": "2024",
 "sameAs": [
 "https://www.instagram.com/alternusart",
 "https://www.facebook.com/alternusart"
 ],
 "areaServed": "Worldwide",
 "knowsAbout": [
 "3D Machinery Design",
 "Engines and Industrial Machinery",
 "Automotive and Motorcycles",
 "Aerospace and Drones",
 "CNC and Machining",
 "CAD Studio Integration",
 "AI Code Assistant"
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
 "name": "Crystal Studio",
 "description": "AI workspace for 3D machinery, engines, automotive systems, CNC machining, aerospace parts, industrial CAD, and engineering code automation",
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
 <SignInPopup />
 </Providers>
 </body>
 </html>
 );
}
