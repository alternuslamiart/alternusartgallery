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
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={star <= rating ? "#fbbf24" : "none"}
            stroke={star <= rating ? "#fbbf24" : "#d1d5db"}
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50/80">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect artwork with Alternus
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {visibleTestimonials.map((testimonial, idx) => (
              <div
                key={testimonial.id}
                className={`bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  idx === 1 ? "md:scale-105 md:z-10" : ""
                }`}
              >
                {/* Stars */}
                <div className="mb-4">{renderStars(testimonial.rating)}</div>

                {/* Comment */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
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
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex
                      ? "bg-gray-900 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
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
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">120+</p>
              <p className="text-sm text-gray-600">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">98%</p>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">50+</p>
              <p className="text-sm text-gray-600">Original Artworks</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">10+</p>
              <p className="text-sm text-gray-600">Featured Artists</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
