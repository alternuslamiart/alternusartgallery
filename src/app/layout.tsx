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
 default: "Crystal Studio | AI Architecture & Interior Design",
 template: "%s | Crystal Studio",
 },
 description:
 "Crystal Studio is an AI-powered studio for architecture, interior design, furniture planning, 3D visualization, and home robotics.",
 keywords: [
 "3D machinery design",
 "engine 3D design",
 "architectural visualization",
 "automotive 3D design",
 "motorcycle 3D design",
 "floor plan AI",
 "3D design studio",
 "AI code assistant",
 "Crystal Studio",
 "interior design AI",
 ],
 authors: [{ name: "Crystal Studio" }],
 creator: "Crystal Studio",
 publisher: "Crystal Studio",
 icons: {
 icon: [
 { url: "/favicon.jpeg", sizes: "512x512", type: "image/jpeg" },
 ],
 shortcut: "/favicon.jpeg",
 apple: "/favicon.jpeg",
 },
 openGraph: {
 type: "website",
 locale: "en_US",
 url: "https://www.alternusart.com",
 siteName: "Crystal Studio",
 title: "Crystal Studio | AI Architecture & Interior Design",
 description:
 "AI-powered studio for architecture, interior design, furniture planning, 3D visualization, and home robotics.",
 images: [
 {
 url: "/Logopng.png",
 width: 512,
 height: 512,
 alt: "Crystal Studio",
 },
 ],
 },
 twitter: {
 card: "summary_large_image",
 title: "Crystal Studio | AI Architecture & Interior Design",
 description:
 "AI-powered studio for architecture, interior design, furniture planning, 3D visualization, and home robotics.",
 images: ["/Logopng.png"],
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
 --background: 0 0% 3.92%;
 --foreground: 0 0% 100%;
 --card: 0 0% 10.98%;
 --card-foreground: 0 0% 100%;
 --popover: 0 0% 10.98%;
 --popover-foreground: 0 0% 100%;
 --primary: 217 91% 60%;
 --primary-foreground: 0 0% 100%;
 --secondary: 0 0% 7.84%;
 --secondary-foreground: 0 0% 63.14%;
 --muted: 0 0% 10.98%;
 --muted-foreground: 0 0% 63.14%;
 --accent: 0 0% 14.9%;
 --accent-foreground: 0 0% 100%;
 --border: 0 0% 16.47%;
 --input: 0 0% 16.47%;
 --ring: 217 91% 60%;
 --label-primary: 0 0% 100%;
 --label-secondary: 240 4% 63%;
 --label-tertiary: 240 5% 46%;
 --label-quaternary: 240 5% 32%;
 }
 :root {
 --background: 0 0% 100%;
 --foreground: 0 0% 0%;
 --card: 0 0% 100%;
 --card-foreground: 0 0% 0%;
 --popover: 0 0% 100%;
 --popover-foreground: 0 0% 0%;
 --primary: 217 91% 60%;
 --primary-foreground: 0 0% 100%;
 --secondary: 0 0% 92.16%;
 --secondary-foreground: 0 0% 15.69%;
 --muted: 0 0% 84.31%;
 --muted-foreground: 0 0% 23.53%;
 --accent: 0 0% 76.47%;
 --accent-foreground: 0 0% 0%;
 --border: 0 0% 89.8%;
 --input: 0 0% 89.8%;
 --ring: 217 91% 60%;
 --label-primary: 0 0% 0%;
 --label-secondary: 0 0% 15.69%;
 --label-tertiary: 0 0% 23.53%;
 --label-quaternary: 0 0% 31.37%;
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
 "alternateName": "Crystal Studio AI Design",
 "url": "https://www.alternusart.com",
 "logo": {
 "@type": "ImageObject",
 "url": "https://www.alternusart.com/Logopng.png",
 "width": 512,
 "height": 512
 },
 "image": "https://www.alternusart.com/Logopng.png",
 "description": "AI-powered studio for architecture, interior design, furniture planning, 3D visualization, and home robotics.",
 "email": "contact@alternusart.com",
 "foundingDate": "2024",
 "sameAs": [
 "https://www.instagram.com/alternusart",
 "https://www.facebook.com/alternusart"
 ],
 "areaServed": "Worldwide",
 "knowsAbout": [
 "3D Machinery Design",
 "Architecture and Building Design",
 "Automotive and Motorcycles",
 "Aerospace and Drones",
 "Furniture and Space Planning",
 "Home Robotics",
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
 "description": "AI-powered studio for architecture, interior design, furniture planning, 3D visualization, and home robotics",
 "publisher": {
 "@id": "https://www.alternusart.com/#organization"
 },
 "potentialAction": {
 "@type": "SearchAction",
 "target": {
 "@type": "EntryPoint",
 "urlTemplate": "https://www.alternusart.com/design-studio?query={search_term_string}"
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
