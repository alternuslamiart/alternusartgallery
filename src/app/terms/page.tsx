"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our services. They govern your access to and use of our platform.
          </p>
          <p className="text-gray-500 text-sm mt-4">Last updated: January 1, 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

            {/* Legal Framework */}
            <section className="bg-muted/50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Governing Laws & Regulations
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms of Service are governed by and construed in accordance with:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Albanian Civil Code</h4>
                  <p className="text-sm text-muted-foreground">Law No. 7850, dated 29.7.1994 - Republic of Albania</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">E-Commerce Directive</h4>
                  <p className="text-sm text-muted-foreground">Directive 2000/31/EC - European Union</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Consumer Rights Directive</h4>
                  <p className="text-sm text-muted-foreground">Directive 2011/83/EU - European Union</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Law on Consumer Protection</h4>
                  <p className="text-sm text-muted-foreground">Law No. 9902, dated 17.4.2008 - Republic of Albania</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Law on Electronic Commerce</h4>
                  <p className="text-sm text-muted-foreground">Law No. 10128, dated 11.5.2009 - Republic of Albania</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">CISG</h4>
                  <p className="text-sm text-muted-foreground">UN Convention on Contracts for International Sale of Goods</p>
                </div>
              </div>
            </section>

            {/* Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Alternus Art Gallery (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
                concerning your access to and use of the alternus.art website and any related services
                (collectively, the &quot;Site&quot;).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By accessing or using the Site, you agree that you have read, understood, and agree to be
                bound by these Terms. If you do not agree with these Terms, you are prohibited from using
                the Site and must discontinue use immediately.
              </p>
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm font-medium">
                  IMPORTANT: These Terms contain an arbitration clause and class action waiver that affect
                  your legal rights. Please read Section 15 (Dispute Resolution) carefully.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By using the Site, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You are at least 18 years of age or the age of legal majority in your jurisdiction</li>
                <li>You have the legal capacity to enter into a binding contract</li>
                <li>You are not located in a country subject to trade sanctions or embargoes</li>
                <li>You have not been previously suspended or removed from our Site</li>
                <li>Your use of the Site does not violate any applicable law or regulation</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                If you are using the Site on behalf of an organization, you represent that you have the
                authority to bind that organization to these Terms.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of the Site, you may be required to register for an account.
                When registering, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password confidential and secure</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account if any information provided
                is found to be inaccurate, false, or in violation of these Terms.
              </p>
            </section>

            {/* Products and Artwork */}
            <section>
              <h2 className="text-2xl font-bold mb-4">4. Products and Artwork</h2>

              <h3 className="text-xl font-semibold mb-3">4.1 Product Descriptions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We make every effort to display the colors, dimensions, and details of our artworks as
                accurately as possible. However, due to variations in monitors, screens, and display
                settings, we cannot guarantee that your display will accurately reflect the actual
                colors and appearance of the artwork.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 Authenticity Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All artworks sold through our Site are guaranteed to be authentic original works or
                authorized reproductions as described. Each artwork comes with a Certificate of
                Authenticity signed by the artist or authorized representative.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.3 Availability</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All artworks are subject to availability. We reserve the right to discontinue any
                product at any time. In the event that a product is unavailable after you have
                placed an order, we will notify you and provide a full refund.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.4 Artwork Content Guidelines</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Alternus Art Gallery is committed to fostering a respectful and inclusive creative environment.
                All artworks displayed and sold on our platform must adhere to the following content guidelines:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Artworks must not contain content that is offensive, insulting, or degrading toward any individual
                  or group based on race, ethnicity, nationality, religion, gender, disability,
                  or any other protected characteristic.
                </li>
                <li>
                  Art that expresses dissent, critique, or revolt against actions, systems, or ideologies is welcome
                  and encouraged — provided it does not cross the line into direct insult, hate speech, or incitement
                  of violence against any person or group.
                </li>
                <li>
                  This policy does not represent a limitation on artistic freedom or creative expression. Rather, it
                  reflects our commitment to distancing the platform from content that is deliberately hurtful,
                  discriminatory, or inflammatory in nature.
                </li>
                <li>
                  Alternus reserves the right to review, reject, or remove any artwork that violates these guidelines
                  at its sole discretion, without prior notice.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We believe that art has the power to challenge, provoke thought, and inspire change — and we
                encourage artists to push creative boundaries while maintaining respect for the dignity of all people.
              </p>
            </section>

            {/* Pricing and Payment */}
            <section>
              <h2 className="text-2xl font-bold mb-4">5. Pricing and Payment</h2>

              <h3 className="text-xl font-semibold mb-3">5.1 Pricing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All prices displayed on the Site are in Euros (EUR) unless otherwise indicated. Prices
                are subject to change without notice. The price charged will be the price in effect at
                the time of order placement.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.2 Taxes and Duties</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Prices do not include applicable taxes, customs duties, or import fees. You are responsible
                for paying all taxes and duties imposed by your jurisdiction. For international orders,
                you may be subject to import duties and taxes, which are levied once the shipment reaches
                your country.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.3 Payment Methods</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We accept the following payment methods:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Bank Transfer (IBAN)</li>
                <li>Credit/Debit Cards (Visa, MasterCard, American Express)</li>
                <li>PayPal</li>
                <li>Other payment methods as indicated at checkout</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.4 Payment Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                All payment transactions are processed through secure, PCI-DSS compliant payment processors.
                We do not store your complete credit card information on our servers.
              </p>
            </section>

            {/* Orders and Contracts */}
            <section>
              <h2 className="text-2xl font-bold mb-4">6. Orders and Contract Formation</h2>

              <h3 className="text-xl font-semibold mb-3">6.1 Order Process</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your order constitutes an offer to purchase the artwork(s) specified. All orders are
                subject to acceptance by us. We may, in our sole discretion, refuse or cancel any order
                for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Product availability issues</li>
                <li>Errors in pricing or product information</li>
                <li>Suspected fraudulent transactions</li>
                <li>Inability to verify payment information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 Contract Formation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A binding contract is formed only when we send you an order confirmation email. This
                confirmation constitutes our acceptance of your order. Until such confirmation is sent,
                we reserve the right to decline your order.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.3 Order Confirmation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upon successful order placement, you will receive an email confirmation containing your
                order details, order number, and estimated delivery timeframe. Please retain this
                confirmation for your records.
              </p>
            </section>

            {/* Shipping and Delivery */}
            <section>
              <h2 className="text-2xl font-bold mb-4">7. Shipping and Delivery</h2>

              <h3 className="text-xl font-semibold mb-3">7.1 Shipping Methods</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We offer worldwide shipping through reputable carriers. All artworks are professionally
                packaged to ensure safe delivery. Shipping options and costs will be displayed at checkout.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.2 Delivery Times</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Estimated delivery times are provided at checkout and in your order confirmation. These
                are estimates only and not guaranteed. Factors such as customs clearance, weather, and
                carrier delays may affect delivery times.
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-3 text-left font-semibold">Destination</th>
                      <th className="border p-3 text-left font-semibold">Estimated Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border p-3">Europe</td>
                      <td className="border p-3">5-14 business days</td>
                    </tr>
                    <tr>
                      <td className="border p-3">United States & Canada</td>
                      <td className="border p-3">10-21 business days</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Rest of World</td>
                      <td className="border p-3">14-30 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">7.3 Risk of Loss</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Title and risk of loss for items purchased pass to you upon delivery to the carrier.
                All shipments are insured for their full value.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.4 Delivery Issues</h3>
              <p className="text-muted-foreground leading-relaxed">
                If your order is damaged, lost, or delayed significantly, please contact us within 48 hours
                of delivery (or expected delivery date). We will work with the carrier to resolve the issue
                and, if necessary, provide a replacement or refund.
              </p>
            </section>

            {/* Returns and Refunds */}
            <section>
              <h2 className="text-2xl font-bold mb-4">8. Returns and Refunds</h2>

              <h3 className="text-xl font-semibold mb-3">8.1 Right of Withdrawal (EU Consumer Rights)</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In accordance with EU Consumer Rights Directive 2011/83/EU, consumers in the European
                Union have the right to withdraw from a distance contract within 14 days without giving
                any reason. The withdrawal period expires 14 days from the day you acquire physical
                possession of the goods.
              </p>

              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">To Exercise Your Right of Withdrawal:</h4>
                <p className="text-sm text-muted-foreground">
                  You must inform us of your decision to withdraw by an unequivocal statement (e.g., a
                  letter sent by post or email). You may use the model withdrawal form available on our
                  website, but it is not obligatory.
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">8.2 Return Conditions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To be eligible for a return, the artwork must be:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>In its original condition, undamaged and unaltered</li>
                <li>In the original packaging with all protective materials</li>
                <li>Accompanied by the Certificate of Authenticity</li>
                <li>Returned within 14 days of receiving the item</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">8.3 Return Shipping</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You are responsible for the cost of return shipping unless the return is due to our error
                or a defective product. We recommend using a trackable shipping service and purchasing
                shipping insurance.
              </p>

              <h3 className="text-xl font-semibold mb-3">8.4 Refund Processing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Once we receive and inspect your return, we will notify you of the approval or rejection
                of your refund. If approved, your refund will be processed within 14 days to the original
                method of payment.
              </p>

              <h3 className="text-xl font-semibold mb-3">8.5 Non-Returnable Items</h3>
              <p className="text-muted-foreground leading-relaxed">
                Custom or commissioned artworks are non-returnable unless defective or significantly
                different from the agreed specifications.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold mb-3">9.1 Ownership</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Site and its entire contents, features, and functionality (including but not limited
                to all information, software, text, displays, images, video, audio, and the design,
                selection, and arrangement thereof) are owned by Alternus Art Gallery, its licensors,
                or other providers and are protected by copyright, trademark, patent, trade secret,
                and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.2 Artwork Copyright</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Purchasing an artwork grants you ownership of the physical piece only. The copyright
                and reproduction rights remain with the artist unless explicitly transferred in writing.
                You may not reproduce, distribute, or create derivative works without written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.3 Limited License</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are granted a limited, non-exclusive, non-transferable license to access and use
                the Site for personal, non-commercial purposes. This license does not include the right
                to reproduce, distribute, modify, or create derivative works of any content on the Site.
              </p>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold mb-4">10. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Using the Site for any unlawful purpose or in violation of these Terms</li>
                <li>Attempting to gain unauthorized access to the Site or its systems</li>
                <li>Interfering with or disrupting the Site or servers</li>
                <li>Using automated systems (bots, scrapers) to access the Site</li>
                <li>Impersonating another person or entity</li>
                <li>Submitting false or misleading information</li>
                <li>Engaging in fraudulent transactions</li>
                <li>Circumventing security measures</li>
                <li>Harvesting or collecting user information without consent</li>
                <li>Using the Site to transmit malware or harmful code</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Important Legal Notice</p>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ALTERNUS ART GALLERY,
                  ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                  LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
              </div>

              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Your access to or use of or inability to access or use the Site</li>
                <li>Any conduct or content of any third party on the Site</li>
                <li>Any content obtained from the Site</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                Our total liability to you for all claims arising out of or relating to these Terms or
                your use of the Site shall not exceed the amount you paid to us in the twelve (12) months
                preceding the claim.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Alternus Art Gallery and its officers,
                directors, employees, contractors, agents, licensors, suppliers, successors, and assigns
                from and against any claims, liabilities, damages, judgments, awards, losses, costs,
                expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to
                your violation of these Terms or your use of the Site.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold mb-4">13. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER ALTERNUS ART GALLERY NOR ANY PERSON
                ASSOCIATED WITH US MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS,
                SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SITE.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE,
                OR THAT DEFECTS WILL BE CORRECTED.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold mb-4">14. Governing Law and Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the
                Republic of Albania, without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For consumers in the European Union, nothing in these Terms shall affect your rights
                under mandatory consumer protection laws of your country of residence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising out of or relating to these Terms shall be subject to the exclusive
                jurisdiction of the courts of Kosovo, unless otherwise required by applicable
                consumer protection laws.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold mb-4">15. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold mb-3">15.1 Informal Resolution</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Before initiating any formal dispute resolution proceeding, you agree to first contact
                us and attempt to resolve the dispute informally by sending a written notice describing
                the nature of the dispute and your desired resolution. We will attempt to resolve the
                dispute within 30 days.
              </p>

              <h3 className="text-xl font-semibold mb-3">15.2 Mediation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If informal resolution is unsuccessful, either party may initiate mediation through a
                mutually agreed-upon mediator. The costs of mediation shall be shared equally between
                the parties.
              </p>

              <h3 className="text-xl font-semibold mb-3">15.3 EU Online Dispute Resolution</h3>
              <p className="text-muted-foreground leading-relaxed">
                For consumers in the European Union, you may also use the EU Online Dispute Resolution
                platform available at{" "}
                <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold mb-4">16. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective
                immediately upon posting to the Site. The &quot;Last updated&quot; date at the top of these
                Terms indicates when the latest modifications were made.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of the Site following the posting of revised Terms means that you
                accept and agree to the changes. You are expected to check this page periodically so
                you are aware of any changes.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold mb-4">17. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
                court of competent jurisdiction, such invalidity, illegality, or unenforceability shall
                not affect any other provision of these Terms, and these Terms shall be construed as if
                such invalid, illegal, or unenforceable provision had never been contained herein.
              </p>
            </section>

            {/* Waiver */}
            <section>
              <h2 className="text-2xl font-bold mb-4">18. Waiver</h2>
              <p className="text-muted-foreground leading-relaxed">
                No waiver by Alternus Art Gallery of any term or condition set out in these Terms shall
                be deemed a further or continuing waiver of such term or condition or a waiver of any
                other term or condition, and any failure to assert a right or provision under these
                Terms shall not constitute a waiver of such right or provision.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold mb-4">19. Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with our Privacy Policy and any other legal notices or policies
                published by us on the Site, constitute the entire agreement between you and Alternus
                Art Gallery regarding the use of the Site and supersede all prior and contemporaneous
                understandings, agreements, representations, and warranties.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">20. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                <p className="font-semibold text-lg">Alternus Art Gallery</p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> legal@alternusart.com
                </p>
                <p className="text-muted-foreground">
                  <strong>Website:</strong> alternusart.com
                </p>
              </div>
            </section>

          </div>

          <Separator className="my-8" />

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              Back to Home
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
