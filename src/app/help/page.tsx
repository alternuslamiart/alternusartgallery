"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HelpCenterPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setShowContactForm(false);
      setContactForm({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We&apos;re here to help. Find answers, track your order, or get in touch with our support team.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-3">
            <div className="pl-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for help..."
              className="flex-1 py-3 px-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Support Options */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Live Chat */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600 group-hover:text-white transition-colors">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-500 mb-4">Chat with our support team in real-time</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-600 font-medium">Online now</span>
              </div>
            </div>

            {/* Email Support */}
            <Link href="/support" className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 group-hover:text-white transition-colors">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-500 mb-4">Get help via email within 24 hours</p>
              <span className="text-sm text-blue-600 font-medium">info@alternusart.com</span>
            </Link>

            {/* FAQ */}
            <Link href="/faq" className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 group-hover:text-white transition-colors">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
              <p className="text-sm text-gray-500 mb-4">Find answers to common questions</p>
              <span className="text-sm text-purple-600 font-medium">Browse FAQ →</span>
            </Link>

            {/* Support */}
            <Link href="/support" className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow group block">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 group-hover:text-white transition-colors">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Support Center</h3>
              <p className="text-sm text-gray-500 mb-4">Submit a request or get help</p>
              <span className="text-sm text-amber-600 font-medium">Visit Support →</span>
            </Link>
          </div>
        </div>

        {/* Track Order */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50/80">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              {/* Header */}
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
                Order Tracking
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Track Your Order
              </h2>
              <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
                Enter your order number to check delivery status
              </p>

              {/* Modern Input */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center gap-3 p-1.5 bg-gray-100/80 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200/50">
                  <input
                    type="text"
                    placeholder="Enter order number (e.g., ALT-2024-1234)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="flex-1 px-5 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  <button className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:text-gray-900 transition-all duration-200">
                    Track
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-4">
                  Secure tracking with order confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "How do I place an order?", link: "/faq" },
              { title: "What payment methods do you accept?", link: "/faq" },
              { title: "How long does shipping take?", link: "/shipping" },
              { title: "What is your return policy?", link: "/returns" },
              { title: "Do artworks come with a certificate?", link: "/faq" },
              { title: "How can I commission a custom artwork?", link: "/commissions" },
            ].map((topic, index) => (
              <Link
                key={index}
                href={topic.link}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors group"
              >
                <span className="text-gray-700 group-hover:text-gray-900">{topic.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-gray-600">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Support Form Section */}
        <div className="max-w-4xl mx-auto mb-16">
          {formSubmitted && (
            <div className="mb-6 animate-in slide-in-from-top-2 fade-in">
              <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Message Sent!</p>
                  <p className="text-sm text-white/80">We&apos;ll get back to you within 24 hours.</p>
                </div>
              </div>
            </div>
          )}

          {!showContactForm ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Need More Help?</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help you.
                </p>
                <Button size="lg" onClick={() => setShowContactForm(true)}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={contactForm.category}
                      onValueChange={(value) => setContactForm({ ...contactForm, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                        <SelectItem value="returns">Returns & Refunds</SelectItem>
                        <SelectItem value="payment">Payment Issues</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" size="lg" className="flex-1">
                      Send Message
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setShowContactForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Support Hours */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-md bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Support Hours</h3>
                    <p className="text-white/70 text-sm">We&apos;re here to help during business hours</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="font-semibold mb-1">Monday - Friday</p>
                  <p className="text-white/70 text-sm">9:00 AM - 6:00 PM EST</p>
                  <p className="text-white/70 text-sm mt-2">Weekend: Limited Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/shipping" className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
              <p className="text-sm text-gray-500">Delivery times, costs, and packaging</p>
            </Link>
            <Link href="/returns" className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Returns & Refunds</h3>
              <p className="text-sm text-gray-500">Our 14-day hassle-free return policy</p>
            </Link>
            <Link href="/care-guide" className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Art Care Guide</h3>
              <p className="text-sm text-gray-500">How to care for your artwork</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
