"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { blogPosts, blogCategories } from "@/lib/blog";
import { AdBanner } from "@/components/adsense";
import { Bookmark, Share2, Clock, TrendingUp } from "lucide-react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const filteredPosts = selectedCategory
    ? blogPosts.filter((post) => post.category === selectedCategory)
    : blogPosts;

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleShare = async (e: React.MouseEvent, title: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${id}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Post distribution
  const heroPost = !selectedCategory && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const sidebarPosts = !selectedCategory && filteredPosts.length > 2 ? filteredPosts.slice(1, 3) : [];
  const gridPosts = !selectedCategory
    ? filteredPosts.slice(3)
    : filteredPosts;

  return (
    <div className="min-h-screen">
      {/* ═══ Masthead ═══ */}
      <div className="border-t-4 border-[#c4b5a4]">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground mb-3">
            {today}
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
            The Alternus Art Journal
          </h1>
          <p className="font-playfair italic text-sm md:text-base tracking-[0.15em] text-muted-foreground">
            Original Art &middot; Collecting &middot; Culture
          </p>
          {/* Decorative double rule */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent to-[#c4b5a4]" />
            <span className="text-[#c4b5a4] text-lg">&#9830;</span>
            <div className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent to-[#c4b5a4]" />
          </div>
        </div>
      </div>

      {/* ═══ Breaking News Bar ═══ */}
      <Link href={`/blog/${blogPosts[0].id}`}>
        <div className="bg-[#1a1a2e] dark:bg-[#0d0d1a] border-y border-red-900/30 cursor-pointer hover:bg-[#1f1f35] dark:hover:bg-[#111128] transition-colors">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">
            <Badge className="bg-red-600 hover:bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold flex-shrink-0 animate-pulse">
              Breaking
            </Badge>
            <p className="text-sm md:text-base font-medium text-white truncate">
              {blogPosts[0].title}
            </p>
            <span className="text-red-400 text-xs flex-shrink-0 hidden sm:inline">
              LIVE
            </span>
          </div>
        </div>
      </Link>

      {/* ═══ Trending Ticker ═══ */}
      <div className="relative border-b border-border/50 backdrop-blur-md bg-background/80 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex items-center py-2.5 px-4">
          <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[10px] uppercase tracking-wider flex-shrink-0 mr-4">
            Trending
          </Badge>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap">
              {[...blogPosts, ...blogPosts].map((post, i) => (
                <span key={i} className="text-sm font-medium">
                  {post.title}
                  <span className="mx-4 text-[#c4b5a4]">&bull;</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Category Tabs (Sticky) ═══ */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            {blogCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ═══ Hero Featured Article ═══ */}
        {heroPost && (
          <Link href={`/blog/${heroPost.id}`}>
            <div className="group relative rounded-2xl overflow-hidden mb-10 cursor-pointer">
              <div className="relative aspect-[4/3] md:aspect-[21/9]">
                <Image
                  src={heroPost.image}
                  alt={heroPost.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/90">
                    {heroPost.category}
                  </span>
                </div>
                <h2 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 max-w-3xl">
                  {heroPost.title}
                </h2>
                <p className="text-white/75 text-sm md:text-base max-w-2xl line-clamp-2 mb-5">
                  {heroPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20">
                      <Image
                        src={heroPost.authorAvatar}
                        alt={heroPost.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{heroPost.author}</p>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(heroPost.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>&middot;</span>
                        <span>{heroPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => toggleBookmark(e, heroPost.id)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Bookmark
                        className="w-5 h-5"
                        fill={bookmarked.includes(heroPost.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, heroPost.title, heroPost.id)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ═══ Ad Banner ═══ */}
        <AdBanner className="mb-10" />

        {/* ═══ Two-Column Newspaper Layout (no filter) ═══ */}
        {!selectedCategory && (sidebarPosts.length > 0 || gridPosts.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Sidebar — Latest Stories */}
            {sidebarPosts.length > 0 && (
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#c4b5a4]" />
                  <h3 className="font-playfair text-xl font-bold">Latest Stories</h3>
                </div>
                <div className="h-0.5 w-12 bg-[#c4b5a4] mb-6" />

                <div className="space-y-0">
                  {sidebarPosts.map((post, i) => (
                    <Link key={post.id} href={`/blog/${post.id}`}>
                      <div className="group flex gap-4 py-5 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors -mx-3 px-3 rounded-lg">
                        <span className="font-playfair text-3xl font-bold text-muted-foreground/20 leading-none flex-shrink-0 w-8">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-1">
                            {post.category}
                          </p>
                          <h4 className="font-playfair text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>&middot;</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Right Content — Selected Stories */}
            {gridPosts.length > 0 && (
              <div className={sidebarPosts.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-5 bg-[#c4b5a4] rounded-full" />
                  <h3 className="font-playfair text-xl font-bold">Selected Stories</h3>
                </div>
                <div className="h-0.5 w-12 bg-[#c4b5a4] mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gridPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`}>
                      <article className="group rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5a4]" />
                            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                              {post.category}
                            </span>
                          </div>
                          <h4 className="font-playfair text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-7 h-7 rounded-full overflow-hidden">
                                <Image
                                  src={post.authorAvatar}
                                  alt={post.author}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium">{post.author}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <span>
                                    {new Date(post.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span>&middot;</span>
                                  <span>{post.readTime}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => toggleBookmark(e, post.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Bookmark
                                  className="w-4 h-4"
                                  fill={bookmarked.includes(post.id) ? "currentColor" : "none"}
                                />
                              </button>
                              <button
                                onClick={(e) => handleShare(e, post.title, post.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Filtered Grid (when category selected) ═══ */}
        {selectedCategory && filteredPosts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 bg-[#c4b5a4] rounded-full" />
              <h3 className="font-playfair text-xl font-bold">{selectedCategory}</h3>
            </div>
            <div className="h-0.5 w-12 bg-[#c4b5a4] mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article className="group rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5a4]" />
                        <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                          {post.category}
                        </span>
                      </div>
                      <h4 className="font-playfair text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden">
                            <Image
                              src={post.authorAvatar}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{post.author}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span>
                                {new Date(post.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>&middot;</span>
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleBookmark(e, post.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Bookmark
                              className="w-4 h-4"
                              fill={bookmarked.includes(post.id) ? "currentColor" : "none"}
                            />
                          </button>
                          <button
                            onClick={(e) => handleShare(e, post.title, post.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══ No Results ═══ */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="font-playfair text-2xl font-bold mb-2">No stories found</p>
            <p className="text-muted-foreground">
              No articles in this category yet. Check back soon.
            </p>
          </div>
        )}
      </div>

      {/* ═══ Footer Rule ═══ */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#c4b5a4]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Powered by Alternus
          </span>
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#c4b5a4]" />
        </div>
      </div>
    </div>
  );
}
