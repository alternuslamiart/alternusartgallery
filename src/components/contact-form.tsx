"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPaintingById } from "@/lib/paintings";

export function ContactForm() {
  const searchParams = useSearchParams();
  const paintingId = searchParams.get("painting");
  const selectedPainting = paintingId ? getPaintingById(paintingId) : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: selectedPainting ? `Inquiry about: ${selectedPainting.title}` : "",
    message: selectedPainting
      ? `Hello,\n\nI am interested in the painting "${selectedPainting.title}" (${selectedPainting.dimensions}, ${selectedPainting.medium}).\n\nI would like to know more about:\n- Availability\n- Shipping and delivery\n- Payment options\n\nThank you!`
      : "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Thank You!</h2>
        <p className="text-gray-500 text-sm mb-8">
          Your message has been sent successfully. I&apos;ll get back to you as soon
          as possible.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 pt-8 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Send a Message</h3>
        <p className="text-sm text-gray-400 mt-1">We&apos;ll get back to you as soon as possible</p>
      </div>
      <div className="px-8 pb-8 pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-600 mb-2"
              >
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-gray-400 focus:outline-none transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-600 mb-2"
              >
                Email *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-gray-400 focus:outline-none transition-all duration-200"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-medium text-gray-600 mb-2"
            >
              Subject *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-gray-400 focus:outline-none transition-all duration-200"
                placeholder="What would you like to discuss?"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs font-medium text-gray-600 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-gray-400 focus:outline-none transition-all duration-200 resize-none"
              placeholder="Write your message here..."
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
