"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogPostById, blogPosts } from "@/lib/blog";
import { AdInArticle } from "@/components/adsense";

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  function processInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let inlineKey = 0;

    while (remaining.length > 0) {
      // Bold + italic
      const boldItalicMatch = remaining.match(/\*\*\*(.*?)\*\*\*/);
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      type InlineMatch = { index: number; length: number; node: React.ReactNode };
      let firstMatch: InlineMatch | null = null;

      const candidates: InlineMatch[] = [];

      if (boldItalicMatch && boldItalicMatch.index !== undefined) {
        candidates.push({ index: boldItalicMatch.index, length: boldItalicMatch[0].length, node: <strong key={`bi-${inlineKey++}`}><em>{boldItalicMatch[1]}</em></strong> });
      }
      if (boldMatch && boldMatch.index !== undefined) {
        candidates.push({ index: boldMatch.index, length: boldMatch[0].length, node: <strong key={`b-${inlineKey++}`}>{boldMatch[1]}</strong> });
      }
      if (italicMatch && italicMatch.index !== undefined) {
        candidates.push({ index: italicMatch.index, length: italicMatch[0].length, node: <em key={`i-${inlineKey++}`}>{italicMatch[1]}</em> });
      }
      if (linkMatch && linkMatch.index !== undefined) {
        candidates.push({
          index: linkMatch.index,
          length: linkMatch[0].length,
          node: <Link key={`l-${inlineKey++}`} href={linkMatch[2]} className="text-blue-600 hover:text-blue-800 underline underline-offset-2">{linkMatch[1]}</Link>,
        });
      }

      for (const candidate of candidates) {
        if (!firstMatch || candidate.index < firstMatch.index) {
          firstMatch = candidate;
        }
      }

      if (firstMatch) {
        if (firstMatch.index > 0) {
          parts.push(remaining.slice(0, firstMatch.index));
        }
        parts.push(firstMatch.node);
        remaining = remaining.slice(firstMatch.index + firstMatch.length);
      } else {
        parts.push(remaining);
        break;
      }
    }
    return parts;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-8 border-gray-200" />);
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl sm:text-3xl font-bold text-gray-900 mt-10 mb-4" id={line.slice(3).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
          {processInline(line.slice(3).trim())}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-xl sm:text-2xl font-semibold text-gray-900 mt-8 mb-3">
          {processInline(line.slice(4).trim())}
        </h3>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(
          <li key={`li-${key++}`} className="text-gray-600 leading-relaxed">
            {processInline(lines[i].slice(2).trim())}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-2 my-4 pl-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 flex-shrink-0" />
              {item}
            </div>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s/, "");
        items.push(
          <li key={`oli-${key++}`} className="text-gray-600 leading-relaxed">
            {processInline(text.trim())}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={key++} className="space-y-2 my-4 list-decimal list-inside marker:text-gray-400 marker:font-semibold">
          {items}
        </ol>
      );
      continue;
    }

    // Paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i]) &&
      lines[i].trim() !== "---"
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(" ");
      elements.push(
        <p key={key++} className="text-gray-600 leading-relaxed my-4">
          {processInline(text)}
        </p>
      );
    }
  }

  return elements;
}

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const post = getBlogPostById(id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  // If not enough related posts from same category, fill with other posts
  const otherPosts = relatedPosts.length < 2
    ? blogPosts.filter((p) => p.id !== post.id && !relatedPosts.find((r) => r.id === p.id)).slice(0, 2 - relatedPosts.length)
    : [];

  const suggestedPosts = [...relatedPosts, ...otherPosts];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
          <div className="container mx-auto max-w-4xl">
            <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm border-white/30 hover:bg-white/30">
              {post.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-white">{post.author}</p>
                <p className="text-sm text-white/70">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {post.readTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 italic border-l-4 border-gray-200 pl-6">
            {post.excerpt}
          </p>

          {/* Article Content */}
          <article className="prose-custom">
            {renderMarkdown(post.content)}
          </article>

          {/* In-Article Ad */}
          <AdInArticle />

          {/* Share / Tags Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Category:</span>
                <Badge variant="outline">{post.category}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Share:</span>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Written by</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{post.author}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A passionate art enthusiast and writer contributing to the Alternus Art Gallery blog. Covering topics from collecting tips to artist spotlights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {suggestedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              Continue Reading
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {suggestedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.id}`}>
                  <article className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <Badge className="mb-3" variant="outline">{related.category}</Badge>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={related.authorAvatar}
                            alt={related.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-gray-900">{related.author}</p>
                          <p className="text-gray-400">
                            {new Date(related.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            · {related.readTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button variant="outline" size="lg" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
