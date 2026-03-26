"use client";

import Image from "next/image";
import Link from "next/link";

const instagramPosts = [
  { id: 1, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400", likes: 1243 },
  { id: 2, image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400", likes: 892 },
  { id: 3, image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400", likes: 2156 },
  { id: 4, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400", likes: 1567 },
  { id: 5, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400", likes: 934 },
  { id: 6, image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400", likes: 1789 },
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold">Follow Us on Instagram</h2>
          </div>
          <p className="text-muted-foreground">
            <a href="https://instagram.com/alternus.art" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
              @alternus.art
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <Link key={post.id} href="https://instagram.com/alternus.art" target="_blank" rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image src={post.image} alt={`Instagram post ${post.id}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span className="font-semibold">{post.likes.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="https://instagram.com/alternus.art" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
