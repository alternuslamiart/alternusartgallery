"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategoryBar } from "@/components/category-bar";
import { MobileNav } from "@/components/mobile-nav";

const STANDALONE_ROUTES = ["/", "/login", "/signup", "/ai", "/admin/login", "/os", "/about", "/manifesto", "/careers", "/press", "/contact", "/privacy", "/terms", "/cookie-notice", "/security", "/pricing", "/account"];
const STANDALONE_PREFIXES = ["/platform/", "/workspace/", "/account/"];
const NO_CATEGORY_BAR_ROUTES = ["/pricing"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = STANDALONE_ROUTES.includes(pathname) || STANDALONE_PREFIXES.some((p) => pathname.startsWith(p));
  const hideCategoryBar = NO_CATEGORY_BAR_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <div className="sticky top-0 z-50">
        <Header />
        {!hideCategoryBar && <CategoryBar />}
      </div>
      <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}
