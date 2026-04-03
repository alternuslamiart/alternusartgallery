// Alternus OS Homepage
// Gallery backup available at: /gallery-home
// To restore gallery: copy gallery-home/page.tsx here, remove "/" from STANDALONE_ROUTES in layout-shell.tsx

import type { Metadata } from "next";
import OSLandingPage from "./os-landing";

export const metadata: Metadata = {
  title: "Alternus OS | AI-Powered Desktop Operating System",
  description:
    "Experience a complete AI-powered desktop operating system in your browser. Window management, 13+ built-in apps, and an intelligent assistant that adapts to your workflow.",
  keywords: [
    "operating system",
    "desktop OS",
    "AI assistant",
    "browser OS",
    "web desktop",
    "Alternus OS",
    "window management",
    "productivity",
  ],
  openGraph: {
    title: "Alternus OS | AI-Powered Desktop Operating System",
    description:
      "A complete desktop experience in your browser. AI assistant, window management, and 13+ built-in apps.",
    type: "website",
    url: "https://alternusart.com",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Alternus OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternus OS | AI-Powered Desktop Operating System",
    description:
      "A complete desktop experience in your browser. AI assistant, window management, and 13+ built-in apps.",
    images: ["/logo.png"],
  },
};

export default function Home() {
  return <OSLandingPage />;
}
