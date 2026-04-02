"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const categories = [
  {
    name: "Paintings",
    href: "/gallery?category=Painting",
    dropdown: {
      columns: [
        {
          title: "By Style",
          links: [
            { name: "Abstract", href: "/gallery?category=Painting&style=Abstract" },
            { name: "Contemporary", href: "/gallery?category=Painting&style=Contemporary" },
            { name: "Impressionism", href: "/gallery?category=Painting&style=Impressionism" },
            { name: "Realism", href: "/gallery?category=Painting&style=Realism" },
            { name: "Expressionism", href: "/gallery?category=Painting&style=Expressionism" },
            { name: "Minimalism", href: "/gallery?category=Painting&style=Minimalism" },
          ],
        },
        {
          title: "By Subject",
          links: [
            { name: "Landscape", href: "/gallery?category=Painting&style=Landscape" },
            { name: "Portrait", href: "/gallery?category=Painting&style=Portrait" },
            { name: "Still Life", href: "/gallery?category=Painting&style=Still+Life" },
            { name: "Nature", href: "/gallery?category=Painting&style=Nature" },
            { name: "Urban", href: "/gallery?category=Painting&style=Urban" },
            { name: "Figurative", href: "/gallery?category=Painting&style=Figurative" },
          ],
        },
      ],
      promo: {
        title: "Original Paintings",
        subtitle: "One-of-a-kind works from talented artists.",
        cta: "Explore Paintings",
        href: "/gallery?category=Painting",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80",
      },
    },
  },
  {
    name: "Drawings",
    href: "/gallery?category=Drawing",
    dropdown: {
      columns: [
        {
          title: "By Style",
          links: [
            { name: "Pencil", href: "/gallery?category=Drawing&style=Pencil" },
            { name: "Charcoal", href: "/gallery?category=Drawing&style=Charcoal" },
            { name: "Ink", href: "/gallery?category=Drawing&style=Ink" },
            { name: "Pastel", href: "/gallery?category=Drawing&style=Pastel" },
            { name: "Graphite", href: "/gallery?category=Drawing&style=Graphite" },
          ],
        },
        {
          title: "By Subject",
          links: [
            { name: "Figure Drawing", href: "/gallery?category=Drawing&style=Figure" },
            { name: "Portrait", href: "/gallery?category=Drawing&style=Portrait" },
            { name: "Landscape", href: "/gallery?category=Drawing&style=Landscape" },
            { name: "Still Life", href: "/gallery?category=Drawing&style=Still+Life" },
            { name: "Abstract", href: "/gallery?category=Drawing&style=Abstract" },
          ],
        },
      ],
      promo: {
        title: "Original Drawings",
        subtitle: "Hand-drawn works with intricate detail.",
        cta: "Explore Drawings",
        href: "/gallery?category=Drawing",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
      },
    },
  },
  {
    name: "Sculpture",
    href: "/gallery?category=Sculpture",
    dropdown: {
      columns: [
        {
          title: "By Material",
          links: [
            { name: "Bronze", href: "/gallery?category=Sculpture&style=Bronze" },
            { name: "Marble", href: "/gallery?category=Sculpture&style=Marble" },
            { name: "Wood", href: "/gallery?category=Sculpture&style=Wood" },
            { name: "Clay", href: "/gallery?category=Sculpture&style=Clay" },
            { name: "Metal", href: "/gallery?category=Sculpture&style=Metal" },
          ],
        },
        {
          title: "By Style",
          links: [
            { name: "Abstract", href: "/gallery?category=Sculpture&style=Abstract" },
            { name: "Figurative", href: "/gallery?category=Sculpture&style=Figurative" },
            { name: "Modern", href: "/gallery?category=Sculpture&style=Modern" },
            { name: "Classical", href: "/gallery?category=Sculpture&style=Classical" },
            { name: "Minimalist", href: "/gallery?category=Sculpture&style=Minimalist" },
          ],
        },
      ],
      promo: {
        title: "Sculptural Art",
        subtitle: "Three-dimensional works that captivate.",
        cta: "Explore Sculptures",
        href: "/gallery?category=Sculpture",
        image: "https://images.unsplash.com/photo-1544413164-5f1b361f5bfa?w=600&q=80",
      },
    },
  },
  {
    name: "Photography",
    href: "/gallery?category=Photography",
    dropdown: {
      columns: [
        {
          title: "By Style",
          links: [
            { name: "Fine Art", href: "/gallery?category=Photography&style=Contemporary" },
            { name: "Landscape", href: "/gallery?category=Photography&style=Landscape" },
            { name: "Portrait", href: "/gallery?category=Photography&style=Portrait" },
            { name: "Urban", href: "/gallery?category=Photography&style=Urban" },
            { name: "Nature", href: "/gallery?category=Photography&style=Nature" },
          ],
        },
      ],
      promo: {
        title: "Fine Art Photography",
        subtitle: "Captivating moments, beautifully captured.",
        cta: "View Collection",
        href: "/gallery?category=Photography",
        image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80",
      },
    },
  },
  {
    name: "Digital Art",
    href: "/gallery?category=Digital+Art",
    dropdown: {
      columns: [
        {
          title: "By Style",
          links: [
            { name: "Illustration", href: "/gallery?category=Digital+Art&style=Illustration" },
            { name: "3D Art", href: "/gallery?category=Digital+Art&style=3D" },
            { name: "Pixel Art", href: "/gallery?category=Digital+Art&style=Pixel+Art" },
            { name: "Generative", href: "/gallery?category=Digital+Art&style=Generative" },
            { name: "Concept Art", href: "/gallery?category=Digital+Art&style=Concept+Art" },
          ],
        },
        {
          title: "By Subject",
          links: [
            { name: "Fantasy", href: "/gallery?category=Digital+Art&style=Fantasy" },
            { name: "Sci-Fi", href: "/gallery?category=Digital+Art&style=Sci-Fi" },
            { name: "Abstract", href: "/gallery?category=Digital+Art&style=Abstract" },
            { name: "Portrait", href: "/gallery?category=Digital+Art&style=Portrait" },
            { name: "Nature", href: "/gallery?category=Digital+Art&style=Nature" },
          ],
        },
      ],
      promo: {
        title: "Digital Art Prints",
        subtitle: "Modern digital creations by innovative artists.",
        cta: "Explore Digital Art",
        href: "/gallery?category=Digital+Art",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
      },
    },
  },
  {
    name: "Prints",
    href: "/prints",
    dropdown: {
      columns: [
        {
          title: "By Type",
          links: [
            { name: "Lithography", href: "/prints?type=Lithography" },
            { name: "Screen Print", href: "/prints?type=Screen+Print" },
            { name: "Etching", href: "/prints?type=Etching" },
            { name: "Woodcut", href: "/prints?type=Woodcut" },
            { name: "Giclée", href: "/prints?type=Giclee" },
          ],
        },
        {
          title: "By Subject",
          links: [
            { name: "Abstract", href: "/prints?subject=Abstract" },
            { name: "Landscape", href: "/prints?subject=Landscape" },
            { name: "Botanical", href: "/prints?subject=Botanical" },
            { name: "Figurative", href: "/prints?subject=Figurative" },
            { name: "Geometric", href: "/prints?subject=Geometric" },
          ],
        },
      ],
      promo: {
        title: "Art Prints",
        subtitle: "Limited edition prints from top artists.",
        cta: "Explore Prints",
        href: "/prints",
        image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=600&q=80",
      },
    },
  },
  {
    name: "Mixed Media",
    href: "/gallery?category=Mixed+Media",
    dropdown: {
      columns: [
        {
          title: "By Technique",
          links: [
            { name: "Collage", href: "/gallery?category=Mixed+Media&style=Collage" },
            { name: "Assemblage", href: "/gallery?category=Mixed+Media&style=Assemblage" },
            { name: "Textile Art", href: "/gallery?category=Mixed+Media&style=Textile" },
            { name: "Found Object", href: "/gallery?category=Mixed+Media&style=Found+Object" },
            { name: "Encaustic", href: "/gallery?category=Mixed+Media&style=Encaustic" },
          ],
        },
        {
          title: "By Style",
          links: [
            { name: "Abstract", href: "/gallery?category=Mixed+Media&style=Abstract" },
            { name: "Contemporary", href: "/gallery?category=Mixed+Media&style=Contemporary" },
            { name: "Experimental", href: "/gallery?category=Mixed+Media&style=Experimental" },
            { name: "Pop Art", href: "/gallery?category=Mixed+Media&style=Pop+Art" },
            { name: "Surrealism", href: "/gallery?category=Mixed+Media&style=Surrealism" },
          ],
        },
      ],
      promo: {
        title: "Mixed Media Art",
        subtitle: "Bold combinations pushing creative boundaries.",
        cta: "Explore Mixed Media",
        href: "/gallery?category=Mixed+Media",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80",
      },
    },
  },
  {
    name: "New Arrivals",
    href: "/gallery?sort=newest",
    dropdown: {
      columns: [
        {
          title: "Browse New",
          links: [
            { name: "This Week", href: "/gallery?sort=newest" },
            { name: "This Month", href: "/gallery?sort=newest" },
            { name: "Trending Now", href: "/gallery?sort=newest" },
          ],
        },
        {
          title: "By Category",
          links: [
            { name: "New Paintings", href: "/gallery?category=Painting&sort=newest" },
            { name: "New Photography", href: "/gallery?category=Photography&sort=newest" },
            { name: "New Digital Art", href: "/gallery?category=Digital+Art&sort=newest" },
          ],
        },
      ],
      promo: {
        title: "Fresh Arrivals",
        subtitle: "Discover the latest additions to our gallery.",
        cta: "See What's New",
        href: "/gallery?sort=newest",
        image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80",
      },
    },
  },
  {
    name: "Artists",
    href: "/gallery",
    dropdown: {
      columns: [
        {
          title: "Discover",
          links: [
            { name: "All Artists", href: "/gallery" },
            { name: "Emerging Artists", href: "/gallery" },
            { name: "Featured Artists", href: "/gallery" },
          ],
        },
        {
          title: "Services",
          links: [
            { name: "Custom Commissions", href: "/commissions" },
            { name: "Sell Your Art", href: "/apply" },
            { name: "Gift Cards", href: "/gift-cards" },
          ],
        },
      ],
      promo: {
        title: "Become an Artist",
        subtitle: "Join our community and showcase your work.",
        cta: "Apply Now",
        href: "/apply",
        image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&q=80",
      },
    },
  },
  {
    name: "Commissions",
    href: "/commissions",
    dropdown: {
      columns: [
        {
          title: "Commission Types",
          links: [
            { name: "Portraits", href: "/commissions" },
            { name: "Landscapes", href: "/commissions" },
            { name: "Abstract & Modern", href: "/commissions" },
          ],
        },
        {
          title: "Info",
          links: [
            { name: "How It Works", href: "/commissions" },
            { name: "Pricing Guide", href: "/commissions" },
            { name: "Contact Us", href: "/support" },
          ],
        },
      ],
      promo: {
        title: "Custom Commissions",
        subtitle: "Work with artists to create your dream piece.",
        cta: "Start Your Commission",
        href: "/commissions",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
      },
    },
  },
];

export function CategoryBar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="hidden lg:block w-full border-b border-gray-100 bg-white relative z-40"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onMouseEnter={() => handleMouseEnter(cat.name)}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
              <Link
                href={cat.href}
                className={`inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-full transition-all whitespace-nowrap ${
                  activeDropdown === cat.name
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown Panels */}
      {categories.map(
        (cat) =>
          cat.dropdown &&
          activeDropdown === cat.name && (
            <div
              key={`dropdown-${cat.name}`}
              onMouseEnter={() => handleMouseEnter(cat.name)}
              onMouseLeave={handleMouseLeave}
              className="absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-in fade-in slide-in-from-top-1 duration-200 z-50"
            >
              <div className="container mx-auto px-4 py-8">
                <div className="flex gap-12">
                  {/* Link Columns */}
                  {cat.dropdown.columns.map((col) => (
                    <div key={col.title} className="min-w-[160px]">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                        {col.title}
                      </h3>
                      <ul className="space-y-2.5">
                        {col.links.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              onClick={() => setActiveDropdown(null)}
                              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Promo Card */}
                  {cat.dropdown.promo && (
                    <div className="ml-auto">
                      <Link
                        href={cat.dropdown.promo.href}
                        onClick={() => setActiveDropdown(null)}
                        className="group block w-[280px] rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-all"
                      >
                        <div className="h-[140px] bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cat.dropdown.promo.image}
                            alt={cat.dropdown.promo.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {cat.dropdown.promo.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            {cat.dropdown.promo.subtitle}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                            {cat.dropdown.promo.cta}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="transition-transform group-hover:translate-x-0.5"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
}
