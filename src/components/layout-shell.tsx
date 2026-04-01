"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategoryBar } from "@/components/category-bar";
import { MobileNav } from "@/components/mobile-nav";

const STANDALONE_ROUTES = ["/login", "/signup", "/ai"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = STANDALONE_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <CategoryBar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}
