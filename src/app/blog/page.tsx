"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts, blogCategories } from "@/lib/blog";
import { AdBanner } from "@/components/adsense";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? blogPosts.filter((post) => post.category === selectedCategory)
    : blogPosts;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Blog & News
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Art Stories & Insights
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the world of art with expert advice, artist interviews, and industry news
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Posts
          </Button>
          {blogCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {!selectedCategory && filteredPosts.length > 0 && (
          <div className="mb-16">
            <Link href={`/blog/${filteredPosts[0].id}`}>
              <div className="group relative rounded-2xl overflow-hidden bg-muted cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-[4/3] md:aspect-auto">
                    <Image
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">{filteredPosts[0].category}</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={filteredPosts[0].authorAvatar}
                          alt={filteredPosts[0].author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{filteredPosts[0].author}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(filteredPosts[0].date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })} · {filteredPosts[0].readTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Ad Banner */}
        <AdBanner className="mb-8" />

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(selectedCategory ? filteredPosts : filteredPosts.slice(1)).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <article className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <Badge className="mb-3">{post.category}</Badge>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={post.authorAvatar}
                      alt={post.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-medium">{post.author}</p>
                    <p className="text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })} · {post.readTime}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No blog posts found in this category.
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 9 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Posts
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
