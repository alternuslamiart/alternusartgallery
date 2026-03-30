"use client";

import { useState } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  comment: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Art Collector",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    comment: "The quality of artwork and service is exceptional. I've purchased three pieces and each one exceeded my expectations. The packaging was professional and the shipping was fast.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Interior Designer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    comment: "As an interior designer, I'm always looking for unique pieces for my clients. Alternus has become my go-to source for high-quality contemporary art. The selection is outstanding.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Home Owner",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    comment: "I was hesitant to buy art online, but the detailed photos and descriptions made me confident. The piece arrived exactly as shown and has transformed my living room. Highly recommend!",
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Gallery Owner",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 5,
    comment: "Working with Alternus has been a pleasure. The artists they represent are talented, and the platform makes it easy to discover and purchase exceptional pieces. A truly professional operation.",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    role: "Art Enthusiast",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    rating: 5,
    comment: "I love how easy it is to browse and filter artworks by style and price. The customer service team was incredibly helpful when I had questions. Will definitely buy again!",
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Corporate Buyer",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    rating: 5,
    comment: "We've furnished our office spaces with multiple pieces from Alternus. The quality is consistent, prices are fair, and the entire process was seamless. Great for corporate art needs.",
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={star <= rating ? "#ffffff" : "none"}
            stroke={star <= rating ? "#ffffff" : "#555555"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  const visibleTestimonials = [
    testimonials[activeIndex],
    testimonials[(activeIndex + 1) % testimonials.length],
    testimonials[(activeIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4 font-mono">
            Testimonials
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4 text-white">
            What Our Clients Say
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect artwork with Alternus
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {visibleTestimonials.map((testimonial, idx) => (
              <div
                key={testimonial.id}
                className={`bg-white/5 p-6 lg:p-8 border border-white/10 hover:border-white/30 transition-all duration-500 rounded-lg ${
                  idx === 1 ? "md:scale-105 md:z-10 md:bg-white/8" : ""
                }`}
              >
                {/* Stars */}
                <div className="mb-4">{renderStars(testimonial.rating)}</div>

                {/* Comment */}
                <p className="text-stone-300 mb-6 leading-relaxed italic text-sm md:text-base">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-500/20 rounded-lg">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-stone-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              aria-label="Previous testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-stone-300"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "bg-amber-500 w-8"
                      : "bg-stone-600 w-1.5 hover:bg-stone-500"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              aria-label="Next testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-stone-300"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">120+</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">98%</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">50+</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Original Artworks</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">10+</p>
              <p className="text-xs uppercase tracking-widest text-stone-500">Featured Artists</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
