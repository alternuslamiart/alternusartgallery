"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400 mb-3 sm:mb-4">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Copyright Policy
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Learn about intellectual property rights, artwork ownership, and how we protect creators on our platform.
          </p>
          <p className="text-gray-500 text-sm mt-4">Last updated: January 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Ownership Banner */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Protecting Creative Work</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Alternus Art Gallery respects the intellectual property rights of artists and creators. All artworks displayed and sold on our platform are protected by copyright law. We take copyright infringement seriously and act promptly to address any violations.
              </p>
            </div>
          </div>

          <div className="space-y-10">

            {/* Artwork Copyright */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Artwork Copyright</h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  All artworks listed on Alternus Art Gallery are the intellectual property of their respective artists. By purchasing an artwork, you acquire the physical piece (or digital file for digital art), but the copyright remains with the artist unless explicitly transferred in writing.
                </p>
                <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What You Can Do</h3>
                  <ul className="space-y-2.5">
                    {[
                      "Display the artwork in your home or office",
                      "Include the artwork in personal, non-commercial photography",
                      "Resell the original physical artwork",
                      "Lend or gift the artwork to others",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What You Cannot Do</h3>
                  <ul className="space-y-2.5">
                    {[
                      "Reproduce or create copies of the artwork for commercial purposes",
                      "Use artwork images for commercial advertising without permission",
                      "Create derivative works based on the artwork without artist consent",
                      "Claim authorship or remove the artist's attribution",
                      "Distribute digital reproductions of the artwork",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-5 h-5 bg-red-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Website Content */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Website Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All content on the Alternus Art Gallery website, including but not limited to text, graphics, logos, icons, images, design elements, and software, is the property of Alternus Art Gallery or its content suppliers and is protected by international copyright laws.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Logo & Branding", description: "The Alternus name, logo, and brand elements are trademarks of Alternus Art Gallery." },
                  { title: "Website Design", description: "The overall layout, design, and user interface of our website are copyrighted." },
                  { title: "Written Content", description: "All articles, descriptions, and editorial content are our intellectual property." },
                  { title: "Photography", description: "Product photos and lifestyle images are copyrighted and may not be reused." },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Artist Rights */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. Artist Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Artists who list their work on Alternus Art Gallery retain full copyright ownership of their artwork. By listing on our platform, artists grant us a limited, non-exclusive license to:
              </p>
              <ul className="space-y-3 mb-4">
                {[
                  "Display artwork images on our website and mobile app",
                  "Use artwork images in marketing and promotional materials related to the platform",
                  "Create thumbnail and preview versions of artwork images",
                  "Share artwork listings on social media channels associated with Alternus",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 leading-relaxed">
                This license terminates when the artist removes their listing from our platform.
              </p>
            </section>

            {/* DMCA */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Copyright Infringement & DMCA</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you believe that your copyrighted work has been used on our platform in a way that constitutes copyright infringement, you may submit a notice to us. We follow the procedures set forth in the Digital Millennium Copyright Act (DMCA).
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your DMCA Notice Should Include:</h3>
                <ol className="space-y-3">
                  {[
                    "A description of the copyrighted work you claim has been infringed",
                    "The URL or location on our website where the infringing material is found",
                    "Your contact information (name, email address)",
                    "A statement that you have a good faith belief that the use is not authorized",
                    "A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on behalf of the owner",
                    "Your physical or electronic signature",
                  ].map((item, index) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Counter-Notice */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Counter-Notice</h2>
              <p className="text-gray-600 leading-relaxed">
                If you believe your content was wrongly removed due to a DMCA notice, you may file a counter-notice through our support page. We will process counter-notices in accordance with applicable law and may restore the content if the original complainant does not file a court action within the statutory period.
              </p>
            </section>

            {/* Repeat Infringers */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Repeat Infringers</h2>
              <p className="text-gray-600 leading-relaxed">
                Alternus Art Gallery maintains a policy of terminating the accounts of users who are repeat copyright infringers. If an artist or user is found to have repeatedly uploaded copyrighted content without authorization, their account will be suspended or permanently removed from our platform.
              </p>
            </section>

            {/* Report */}
            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Report Copyright Infringement</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you believe your copyrighted work is being used on our platform without authorization, please contact us immediately through our support page. We take all reports seriously and will respond promptly.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Submit a Report
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </section>

          </div>

          <Separator className="my-10" />

          {/* Bottom Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>Last updated: January 2026</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
              <Link href="/support" className="hover:text-gray-700 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
