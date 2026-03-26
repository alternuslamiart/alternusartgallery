"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
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
                Applicable Privacy Laws & Regulations
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Privacy Policy is designed to comply with the following privacy laws and regulations:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">GDPR (EU)</h4>
                  <p className="text-sm text-muted-foreground">General Data Protection Regulation (EU) 2016/679 - European Union</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">CCPA (California)</h4>
                  <p className="text-sm text-muted-foreground">California Consumer Privacy Act - United States</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">LGPD (Brazil)</h4>
                  <p className="text-sm text-muted-foreground">Lei Geral de Proteção de Dados - Brazil</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">POPIA (South Africa)</h4>
                  <p className="text-sm text-muted-foreground">Protection of Personal Information Act - South Africa</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Law No. 9887 (Albania)</h4>
                  <p className="text-sm text-muted-foreground">On the Protection of Personal Data - Republic of Albania</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold mb-2">ePrivacy Directive</h4>
                  <p className="text-sm text-muted-foreground">Directive 2002/58/EC - Electronic Communications Privacy</p>
                </div>
              </div>
            </section>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Alternus Art Gallery (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
                your privacy and personal information in accordance with applicable data protection laws,
                including but not limited to the General Data Protection Regulation (GDPR), the California
                Consumer Privacy Act (CCPA), and Albanian Law No. 9887 &quot;On the Protection of Personal Data.&quot;
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website alternus.art, including any other media form, media channel,
                mobile website, or mobile application related or connected thereto (collectively, the &quot;Site&quot;).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please read this Privacy Policy carefully. By accessing or using our Site, you acknowledge
                that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
                If you do not agree with the terms of this Privacy Policy, please do not access the Site.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3">2.1 Personal Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect personally identifiable information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Register for an account on our Site</li>
                <li>Make a purchase or place an order</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us with inquiries or feedback</li>
                <li>Participate in promotions, surveys, or other Site features</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Name (first and last)</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Billing and shipping address</li>
                <li>Payment information (credit card numbers, bank account details)</li>
                <li>Date of birth</li>
                <li>Username and password</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you access our Site, we may automatically collect certain information about your device and usage, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>IP address and geolocation data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Device type and identifiers</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Clickstream data and browsing patterns</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Process and fulfill your orders, including shipping and payment processing</li>
                <li>Create and manage your account</li>
                <li>Send you order confirmations, updates, and shipping notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Analyze usage trends and preferences</li>
                <li>Detect, prevent, and address fraud or security issues</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Personalize your experience and deliver targeted content</li>
              </ul>
            </section>

            {/* Legal Basis for Processing */}
            <section>
              <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing (GDPR Article 6)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the GDPR, we must have a lawful basis for processing your personal data. We rely on the following legal bases:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-3 text-left font-semibold">Processing Activity</th>
                      <th className="border p-3 text-left font-semibold">Legal Basis (Article 6)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border p-3">Processing orders and payments</td>
                      <td className="border p-3">Contract performance (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Account creation and management</td>
                      <td className="border p-3">Contract performance (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Sending transactional emails</td>
                      <td className="border p-3">Contract performance (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Marketing communications</td>
                      <td className="border p-3">Consent (Art. 6(1)(a))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Newsletter subscription</td>
                      <td className="border p-3">Consent (Art. 6(1)(a))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Website analytics</td>
                      <td className="border p-3">Legitimate interests (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Fraud prevention and security</td>
                      <td className="border p-3">Legitimate interests (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Tax and accounting records</td>
                      <td className="border p-3">Legal obligation (Art. 6(1)(c))</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Responding to legal requests</td>
                      <td className="border p-3">Legal obligation (Art. 6(1)(c))</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Disclosure of Your Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">5. Disclosure of Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following situations:
              </p>

              <h3 className="text-xl font-semibold mb-3">4.1 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information with third-party service providers who perform services on our behalf,
                including payment processing, shipping and logistics, email delivery, hosting services,
                customer service, and marketing assistance.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may disclose your information where required to do so by law or in response to valid
                requests by public authorities (e.g., a court or government agency).
              </p>

              <h3 className="text-xl font-semibold mb-3">4.3 Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If we are involved in a merger, acquisition, or sale of all or a portion of our assets,
                your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.4 With Your Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information for any other purpose with your consent.
              </p>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our Site and
                store certain information. Cookies are files with a small amount of data that may
                include an anonymous unique identifier.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Necessary for the Site to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
                However, if you do not accept cookies, you may not be able to use some portions of our Site.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures designed to protect
                the security of any personal information we process. These measures include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through PCI-DSS compliant providers</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, please note that no method of transmission over the Internet or electronic
                storage is 100% secure. While we strive to use commercially acceptable means to protect
                your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will retain your personal information only for as long as necessary to fulfill the
                purposes for which it was collected, including to satisfy any legal, accounting, or
                reporting requirements. To determine the appropriate retention period, we consider the
                amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized
                use or disclosure, and applicable legal requirements.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Your Legal Rights Under GDPR & Other Laws</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the General Data Protection Regulation (GDPR) and other applicable privacy laws,
                you have the following legally protected rights regarding your personal data:
              </p>

              <div className="space-y-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right of Access (GDPR Article 15)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to obtain confirmation as to whether your personal data is being processed,
                    and access to that data along with information about the processing purposes, categories of data,
                    recipients, retention period, and your other rights.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Rectification (GDPR Article 16)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to obtain rectification of inaccurate personal data and to have
                    incomplete personal data completed without undue delay.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Erasure / &quot;Right to be Forgotten&quot; (GDPR Article 17)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to request deletion of your personal data when: the data is no longer necessary,
                    you withdraw consent, you object to processing, the data was unlawfully processed, or erasure
                    is required by law.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Restriction of Processing (GDPR Article 18)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to restrict processing when: accuracy is contested, processing is unlawful,
                    we no longer need the data but you need it for legal claims, or you have objected to processing.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Data Portability (GDPR Article 20)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to receive your personal data in a structured, commonly used, and
                    machine-readable format, and to transmit that data to another controller without hindrance.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Object (GDPR Article 21)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to object to processing of your personal data for direct marketing purposes
                    at any time. You may also object to processing based on legitimate interests on grounds
                    relating to your particular situation.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Withdraw Consent (GDPR Article 7)</h4>
                  <p className="text-sm text-muted-foreground">
                    Where processing is based on consent, you have the right to withdraw that consent at any time.
                    Withdrawal of consent shall not affect the lawfulness of processing based on consent before its withdrawal.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Right to Lodge a Complaint (GDPR Article 77)</h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to lodge a complaint with a supervisory authority, in particular in the
                    Member State of your habitual residence, place of work, or place of the alleged infringement.
                    In Albania, this is the Information and Data Protection Commissioner.
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">For California Residents (CCPA Rights)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Under the California Consumer Privacy Act (CCPA), California residents have additional rights:
                </p>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>Right to know what personal information is collected, used, shared, or sold</li>
                  <li>Right to delete personal information held by businesses</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising CCPA rights</li>
                </ul>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, please contact us at <strong>privacy@alternusart.com</strong>.
                We will respond to your request within 30 days as required by law.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your
                state, province, country, or other governmental jurisdiction where data protection laws
                may differ. If you are located outside Albania and choose to provide information to us,
                please note that we transfer the data to Albania and process it there. Your consent to
                this Privacy Policy followed by your submission of such information represents your
                agreement to that transfer.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold mb-4">11. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Site is not intended for children under the age of 16. We do not knowingly collect
                personal information from children under 16. If you are a parent or guardian and believe
                that your child has provided us with personal information, please contact us immediately.
                If we become aware that we have collected personal information from a child under 16
                without verification of parental consent, we will take steps to remove that information
                from our servers.
              </p>
            </section>

            {/* Third-Party Advertising */}
            <section>
              <h2 className="text-2xl font-bold mb-4">12. Third-Party Advertising</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may use third-party advertising companies, including Google AdSense, to serve advertisements
                when you visit our website. These companies may use information (not including your name, address,
                email address, or telephone number) about your visits to this and other websites in order to
                provide advertisements about goods and services of interest to you.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Google, as a third-party vendor, uses cookies to serve ads on our site. Google&apos;s use of the
                DART cookie enables it to serve ads to our users based on their visit to our sites and other
                sites on the Internet. Users may opt out of the use of the DART cookie by visiting the
                Google ad and content network privacy policy.
              </p>
              <h3 className="text-xl font-semibold mb-3">How to Opt Out</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Visit <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a> to opt out of personalized advertising</li>
                <li>Visit <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AboutAds.info</a> to opt out of third-party vendor cookies</li>
                <li>Use your browser settings to manage or delete cookies</li>
              </ul>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold mb-4">13. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Site may contain links to third-party websites that are not operated by us.
                If you click on a third-party link, you will be directed to that third party&apos;s site.
                We strongly advise you to review the Privacy Policy of every site you visit.
                We have no control over and assume no responsibility for the content, privacy policies,
                or practices of any third-party sites or services.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                You are advised to review this Privacy Policy periodically for any changes.
                Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold mb-4">15. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                <p className="font-semibold text-lg">Alternus Art Gallery</p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@alternusart.com
                </p>
                <p className="text-muted-foreground">
                  <strong>Website:</strong> alternusart.com
                </p>
              </div>
            </section>

          </div>

          <Separator className="my-8" />

          {/* Back Link */}
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Home
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              Terms of Service
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
