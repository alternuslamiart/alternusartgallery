"use client";

import { useState } from "react";
import Image from "next/image";

interface AccordionItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const accordionItems: AccordionItem[] = [
  {
    id: "artists",
    title: "Verified Artists",
    description: "Every artist on Alternus is carefully vetted to ensure authenticity and quality. We work directly with creators to bring you original works from talented artists worldwide.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  },
  {
    id: "quality",
    title: "Museum Quality",
    description: "Each artwork is printed on premium materials using archival-grade inks. Our printing process ensures your art will maintain its vibrant colors and details for generations.",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80",
  },
  {
    id: "shipping",
    title: "Global Shipping",
    description: "We ship worldwide with secure packaging and tracking. Free shipping on orders over €1,200. Your artwork arrives ready to hang and enjoy.",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80",
  },
  {
    id: "secure",
    title: "Secure & Protected",
    description: "Your account and artwork are protected with industry-leading security. Manage your preferences, change passwords, and control your privacy settings with complete confidence.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
  },
];

export default function AccordionSection() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const activeAccordionItem = accordionItems.find(item => item.id === activeItem);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      {/* Accordion Items */}
      <div className="space-y-2">
        {accordionItems.map((item, index) => {
          const isActive = activeItem === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl transition-all duration-300 ${
                isActive ? "bg-gray-50" : "bg-transparent hover:bg-gray-50/50"
              }`}
            >
              <button
                onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                className="w-full p-6 flex items-start gap-6 text-left group transition-all duration-300"
              >
                {/* Number Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl md:text-2xl font-bold mb-2 transition-colors duration-300 ${
                    isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                  }`}>
                    {item.title}
                  </h3>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isActive ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <p className="text-base text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Plus/Minus Icon */}
                <div className="flex-shrink-0 w-6 h-6 relative">
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isActive ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${
                      isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                    }`}>
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isActive ? "rotate-0 opacity-100" : "rotate-180 opacity-0"
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Image Display */}
      <div className="relative">
        <div className="sticky top-8">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
            <Image
              key={activeAccordionItem?.id || 'default'}
              src={activeAccordionItem?.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80"}
              alt={activeAccordionItem?.title || "Art Gallery"}
              fill
              className="object-cover transition-all duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
