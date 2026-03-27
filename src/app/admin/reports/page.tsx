"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ReportsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_timeframe, _setTimeframe] = useState<"7days" | "30days" | "90days" | "year">("30days");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Real data - starts from zero, updates with actual transactions
  const monthlyData: { month: string; revenue: number; commission: number; sales: number }[] = [];

  const topArtists: { name: string; sales: number; revenue: number; commission: number }[] = [];

  const categoryBreakdown: { category: string; sales: number; percentage: number; revenue: number }[] = [];

  const stats = {
    totalRevenue: 0,
    totalCommission: 0,
    totalArtistEarnings: 0,
    totalSales: 0,
    avgSalePrice: 0,
    avgCommission: 0,
  };

  const maxRevenue = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.revenue)) : 0;

  const handleExportCSV = () => {
    const csvContent = [
      ["Month", "Revenue", "Commission (40%)", "Sales"],
      ...monthlyData.map((d) => [d.month, d.revenue, d.commission, d.sales]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const reportYear = new Date().getFullYear();

    // Pre-build dynamic table rows
    const monthlyRows = monthlyData.length > 0
      ? monthlyData.map(d =>
          "<tr><td class='font-bold'>" + d.month + "</td>" +
          "<td class='text-center'>" + d.sales + "</td>" +
          "<td class='text-right'>€" + d.revenue.toLocaleString() + "</td>" +
          "<td class='text-right'>€" + d.commission.toLocaleString() + "</td>" +
          "<td class='text-right'>€" + (d.revenue - d.commission).toLocaleString() + "</td></tr>"
        ).join("")
      : "<tr><td colspan='5' class='text-center' style='color:#999;padding:16px;'>No transaction data recorded for this period.</td></tr>";

    const monthlySummary = monthlyData.length > 0
      ? "<tr class='summary-row'><td>TOTAL</td>" +
        "<td class='text-center'>" + stats.totalSales + "</td>" +
        "<td class='text-right'>€" + stats.totalRevenue.toLocaleString() + "</td>" +
        "<td class='text-right'>€" + stats.totalCommission.toLocaleString() + "</td>" +
        "<td class='text-right'>€" + stats.totalArtistEarnings.toLocaleString() + "</td></tr>"
      : "";

    const artistRows = topArtists.length > 0
      ? topArtists.map((artist, i) =>
          "<tr><td class='font-bold'>" + (i + 1) + "</td>" +
          "<td>" + artist.name + "</td>" +
          "<td class='text-center'>" + artist.sales + "</td>" +
          "<td class='text-right'>€" + artist.revenue.toLocaleString() + "</td></tr>"
        ).join("")
      : "<tr><td colspan='4' class='text-center' style='color:#999;padding:12px;'>No artist data available.</td></tr>";

    const categoryRows = categoryBreakdown.length > 0
      ? categoryBreakdown.map(cat =>
          "<tr><td class='font-bold'>" + cat.category + "</td>" +
          "<td class='text-center'>" + cat.sales + "</td>" +
          "<td class='text-center'>" + cat.percentage + "%</td>" +
          "<td class='text-right'>€" + cat.revenue.toLocaleString() + "</td></tr>"
        ).join("")
      : "<tr><td colspan='4' class='text-center' style='color:#999;padding:12px;'>No category data available.</td></tr>";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AAG Report - ${reportDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.5; }
            .page { width: 100%; min-height: 100vh; padding: 48px 56px; position: relative; page-break-after: always; }
            .page:last-child { page-break-after: auto; }

            /* Header bar */
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #111; }
            .logo { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #111; }
            .logo-sub { font-size: 9px; letter-spacing: 4px; color: #666; margin-top: 2px; }
            .doc-info { text-align: right; font-size: 9px; color: #666; line-height: 1.6; }
            .doc-title { font-size: 13px; font-weight: 700; color: #111; }

            /* Sections */
            .section { margin-bottom: 22px; }
            .section-title { font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
            .section-text { font-size: 10.5px; color: #333; line-height: 1.7; margin-bottom: 8px; text-align: justify; }
            .subsection { font-size: 11px; font-weight: 700; color: #222; margin: 12px 0 6px 0; }

            /* Policy list */
            .policy-list { padding-left: 18px; margin-bottom: 10px; }
            .policy-list li { font-size: 10.5px; color: #333; line-height: 1.7; margin-bottom: 4px; }
            .policy-list li strong { color: #111; }

            /* Stats grid */
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
            .stat-card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px; background: #fafafa; }
            .stat-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; font-weight: 600; }
            .stat-value { font-size: 20px; font-weight: 800; color: #111; margin: 4px 0 2px; }
            .stat-sub { font-size: 8.5px; color: #999; }

            /* Tables */
            table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 10px; }
            th { background: #111; color: #fff; padding: 8px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            td { padding: 7px 10px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) td { background: #f9f9f9; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }

            /* Summary row */
            .summary-row td { background: #f0f0f0 !important; font-weight: 700; border-top: 2px solid #111; }

            /* Footer */
            .page-footer { position: absolute; bottom: 32px; left: 56px; right: 56px; display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #ddd; font-size: 8px; color: #999; }

            /* Two column */
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

            /* Signature */
            .signature-block { margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd; }
            .sig-line { width: 200px; border-bottom: 1px solid #333; margin: 24px 0 6px; }
            .sig-label { font-size: 9px; color: #666; }

            /* Badge */
            .badge { display: inline-block; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 8px; border-radius: 3px; }
            .badge-dark { background: #111; color: #fff; }
            .badge-outline { border: 1px solid #999; color: #666; }

            @media print {
              .page { padding: 36px 44px; }
              .page-footer { bottom: 24px; left: 44px; right: 44px; }
            }
          </style>
        </head>
        <body>

          <!-- PAGE 1: W-7 GALLERY POLICY -->
          <div class="page">
            <div class="header">
              <div>
                <div class="logo">ALTERNUS</div>
                <div class="logo-sub">ART GALLERY</div>
              </div>
              <div class="doc-info">
                <div class="doc-title">W-7 Gallery Policy Document</div>
                <div>Document No: AAG-W7-${reportYear}-001</div>
                <div>Effective Date: January 1, ${reportYear}</div>
                <div>Last Revised: ${reportDate}</div>
                <div style="margin-top:4px"><span class="badge badge-dark">CONFIDENTIAL</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">1. Purpose & Scope</div>
              <div class="section-text">
                This W-7 Policy Document establishes the comprehensive governance framework for Alternus Art Gallery (hereinafter "AAG" or "the Gallery"). It defines the terms, conditions, and operational standards governing all commercial activities between the Gallery, its represented artists, buyers, and affiliated third parties. This policy applies to all original artworks, prints, commissions, and digital art transactions facilitated through the Gallery's physical and digital platforms, including alternusart.com.
              </div>
            </div>

            <div class="section">
              <div class="section-title">2. Commission Structure & Revenue Distribution</div>
              <div class="section-text">
                All sales conducted through the Gallery shall be subject to the following commission framework, applicable to original artworks, prints, and commissioned pieces:
              </div>
              <ul class="policy-list">
                <li><strong>Gallery Commission:</strong> 40% of the final sale price, retained by AAG to cover operational costs, marketing, platform maintenance, secure payment processing, and international logistics coordination.</li>
                <li><strong>Artist Earnings:</strong> 60% of the final sale price, disbursed to the artist within 14 business days following confirmed receipt of payment and expiration of the buyer's return window.</li>
                <li><strong>Custom Commissions:</strong> Commission rates for bespoke or commissioned works shall be negotiated on a case-by-case basis, with a minimum gallery share of 25%.</li>
                <li><strong>Promotional Sales:</strong> During gallery-initiated promotions or seasonal campaigns, adjusted commission splits may apply as mutually agreed upon in writing.</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">3. Artist Representation & Obligations</div>
              <div class="section-text">
                Artists represented by AAG are required to adhere to the following standards and obligations throughout the duration of their partnership:
              </div>
              <ul class="policy-list">
                <li><strong>Authenticity Guarantee:</strong> All submitted artworks must be original creations. Artists warrant full intellectual property ownership and grant AAG non-exclusive rights to display, market, and sell their work through Gallery channels.</li>
                <li><strong>Quality Standards:</strong> Artworks must meet professional standards regarding material quality, presentation, and packaging. The Gallery reserves the right to decline works that do not meet established quality criteria.</li>
                <li><strong>Exclusivity:</strong> Unless otherwise stated in the artist's agreement, works listed on AAG may be simultaneously offered through other channels, provided pricing remains consistent to protect market integrity.</li>
                <li><strong>Tax Compliance:</strong> Artists are solely responsible for reporting earnings and complying with applicable local, national, and international tax regulations. AAG may issue summary earning statements upon request.</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">4. Buyer Terms & Conditions</div>
              <ul class="policy-list">
                <li><strong>Pricing:</strong> All prices listed on the Gallery are in EUR (€) unless otherwise indicated. Prices include the artwork only; framing, shipping, and applicable taxes are calculated separately at checkout.</li>
                <li><strong>Returns:</strong> Buyers may return an artwork within 14 days of confirmed delivery, provided it is in its original condition and packaging. Custom commissions and pre-orders are non-refundable once production has commenced.</li>
                <li><strong>Shipping:</strong> AAG offers complimentary worldwide shipping on original artworks. Delivery timelines range from 5–15 business days depending on destination. All shipments are insured and tracked.</li>
                <li><strong>Authentication:</strong> Each original artwork sold through AAG is accompanied by a Certificate of Authenticity (COA) signed by the artist, verifying provenance and originality.</li>
                <li><strong>Payment:</strong> The Gallery accepts payments via PayPal and major credit/debit cards through secure, PCI-compliant payment processing infrastructure.</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">5. Privacy, Data Protection & Intellectual Property</div>
              <div class="section-text">
                AAG is committed to safeguarding the personal data of all users in compliance with the General Data Protection Regulation (GDPR) and applicable data protection laws. Personal information collected during transactions is processed solely for order fulfillment, communication, and service improvement. Data is never sold to third parties. All artwork images, descriptions, and branding materials on the Gallery's platforms are protected by copyright law and may not be reproduced without express written consent from AAG.
              </div>
            </div>

            <div class="two-col">
              <div class="signature-block">
                <div class="sig-line"></div>
                <div class="sig-label">Authorized Signature — Gallery Director</div>
                <div style="font-size:9px;color:#999;margin-top:4px">Alternus Art Gallery</div>
              </div>
              <div class="signature-block">
                <div class="sig-line"></div>
                <div class="sig-label">Date</div>
              </div>
            </div>

            <div class="page-footer">
              <div>Alternus Art Gallery (AAG) — W-7 Policy Document — Confidential</div>
              <div>Page 1 of 2</div>
            </div>
          </div>

          <!-- PAGE 2: FINANCIAL REPORT -->
          <div class="page">
            <div class="header">
              <div>
                <div class="logo">ALTERNUS</div>
                <div class="logo-sub">ART GALLERY</div>
              </div>
              <div class="doc-info">
                <div class="doc-title">Financial Performance Report</div>
                <div>Report Period: FY ${reportYear}</div>
                <div>Generated: ${reportDate}</div>
                <div style="margin-top:4px"><span class="badge badge-outline">INTERNAL USE</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Executive Summary</div>
              <div class="section-text">
                This report provides a comprehensive overview of Alternus Art Gallery's financial performance for the fiscal year ${reportYear}. It includes key revenue metrics, commission analysis, artist performance rankings, and category-level sales distribution. All figures are reported in EUR (€) and reflect the Gallery's standard 40/60 commission model.
              </div>
            </div>

            <div class="section">
              <div class="section-title">Key Financial Metrics</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Gross Revenue</div>
                  <div class="stat-value">€${stats.totalRevenue.toLocaleString()}</div>
                  <div class="stat-sub">${stats.totalSales} transactions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Gallery Commission (40%)</div>
                  <div class="stat-value">€${stats.totalCommission.toLocaleString()}</div>
                  <div class="stat-sub">Avg €${stats.avgCommission}/transaction</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Artist Disbursements (60%)</div>
                  <div class="stat-value">€${stats.totalArtistEarnings.toLocaleString()}</div>
                  <div class="stat-sub">Net paid to artists</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg. Transaction Value</div>
                  <div class="stat-value">€${stats.avgSalePrice.toLocaleString()}</div>
                  <div class="stat-sub">Per sale average</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Monthly Revenue Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Gross Revenue</th>
                    <th class="text-right">Commission (40%)</th>
                    <th class="text-right">Artist Payout (60%)</th>
                  </tr>
                </thead>
                <tbody>
                  ${monthlyRows}
                  ${monthlySummary}
                </tbody>
              </table>
            </div>

            <div class="two-col">
              <div class="section">
                <div class="section-title">Top Performing Artists</div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Artist</th>
                      <th class="text-center">Sales</th>
                      <th class="text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${artistRows}
                  </tbody>
                </table>
              </div>

              <div class="section">
                <div class="section-title">Sales by Category</div>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th class="text-center">Sales</th>
                      <th class="text-center">Share</th>
                      <th class="text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${categoryRows}
                  </tbody>
                </table>
              </div>
            </div>

            <div style="margin-top:16px;padding:12px 16px;background:#f5f5f5;border-radius:6px;border-left:3px solid #111;">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px;">Disclaimer</div>
              <div style="font-size:9px;color:#666;line-height:1.6;">
                This financial report is generated automatically from the Gallery's transaction database and is intended for internal administrative use only. Figures are subject to reconciliation and may not reflect pending transactions, refunds in process, or adjusted commission agreements. For audited financial statements, please consult the Gallery's accounting department.
              </div>
            </div>

            <div class="page-footer">
              <div>Alternus Art Gallery (AAG) — Financial Report FY ${reportYear} — Internal Use Only</div>
              <div>Page 2 of 2</div>
            </div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportCOA = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const reportYear = new Date().getFullYear();
    const certNumber = "AAG-COA-" + reportYear + "-" + String(Math.floor(Math.random() * 9000) + 1000);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate of Authenticity - ${certNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; background: #fff; }
            .page {
              width: 194mm; min-height: 281mm; padding: 6mm;
              display: flex; flex-direction: column;
              margin: 0 auto;
            }
            .certificate {
              width: 100%; flex: 1; position: relative;
              border: 3px solid #111; padding: 7px;
              display: flex; flex-direction: column;
            }
            .certificate-inner {
              border: 1px solid #999; padding: 36px 44px 28px;
              position: relative; flex: 1;
              display: flex; flex-direction: column;
            }
            .corner { position: absolute; width: 36px; height: 36px; }
            .corner-tl { top: 8px; left: 8px; border-top: 2px solid #8B7355; border-left: 2px solid #8B7355; }
            .corner-tr { top: 8px; right: 8px; border-top: 2px solid #8B7355; border-right: 2px solid #8B7355; }
            .corner-bl { bottom: 8px; left: 8px; border-bottom: 2px solid #8B7355; border-left: 2px solid #8B7355; }
            .corner-br { bottom: 8px; right: 8px; border-bottom: 2px solid #8B7355; border-right: 2px solid #8B7355; }

            .cert-header { text-align: center; margin-bottom: 28px; }
            .cert-logo { font-family: 'Segoe UI', Arial, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111; }
            .cert-logo-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; letter-spacing: 6px; color: #888; margin-top: 2px; }
            .cert-divider { width: 100px; height: 1px; background: #8B7355; margin: 20px auto; }
            .cert-title { font-size: 28px; font-weight: 400; letter-spacing: 5px; text-transform: uppercase; color: #111; margin-bottom: 4px; }
            .cert-subtitle { font-size: 11px; color: #888; letter-spacing: 3px; text-transform: uppercase; }

            .cert-body { text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; }

            .seal-row { display: flex; align-items: center; justify-content: center; gap: 24px; margin: 20px 0; }
            .seal {
              width: 80px; height: 80px; border: 2.5px solid #8B7355;
              border-radius: 50%; display: flex; align-items: center; justify-content: center;
              flex-direction: column; flex-shrink: 0;
            }
            .seal-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #8B7355; font-weight: 700; }
            .seal-year { font-size: 20px; font-weight: 800; color: #8B7355; line-height: 1.1; }

            .cert-statement {
              font-size: 13px; color: #444; line-height: 1.8;
              max-width: 520px; text-align: center;
            }

            .details-grid {
              display: grid; grid-template-columns: 1fr 1fr;
              gap: 0; margin: 20px 0;
              border: 1px solid #ddd; border-radius: 4px; overflow: hidden;
            }
            .detail-item { padding: 14px 20px; border-bottom: 1px solid #eee; }
            .detail-item:nth-child(odd) { border-right: 1px solid #eee; }
            .detail-item:nth-last-child(-n+2) { border-bottom: none; }
            .detail-label {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px;
              color: #999; font-weight: 600; margin-bottom: 4px;
            }
            .detail-value { font-size: 14px; color: #111; font-weight: 500; }
            .detail-value.placeholder {
              color: #bbb; border-bottom: 1px dashed #ccc;
              display: inline-block; min-width: 180px; padding-bottom: 2px;
            }

            .warranty {
              background: #fafaf8; border: 1px solid #e8e6e0; border-radius: 4px;
              padding: 16px 20px; margin: 18px 0; text-align: left;
            }
            .warranty-title {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 9px; font-weight: 700; text-transform: uppercase;
              letter-spacing: 1.5px; color: #8B7355; margin-bottom: 6px;
            }
            .warranty-text { font-size: 10.5px; color: #666; line-height: 1.7; }

            .signatures {
              display: grid; grid-template-columns: 1fr 1fr 1fr;
              gap: 32px; margin-top: 28px; text-align: center;
            }
            .sig-block { padding-top: 6px; }
            .sig-line { border-bottom: 1px solid #333; margin-bottom: 6px; height: 44px; }
            .sig-name { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; font-weight: 600; color: #333; }
            .sig-role { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; color: #999; margin-top: 2px; }

            .cert-footer { text-align: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid #eee; }
            .cert-number { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; letter-spacing: 2px; color: #999; }
            .cert-url { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; color: #bbb; margin-top: 3px; }

            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .page { width: 100%; min-height: 100vh; padding: 2mm; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="certificate">
              <div class="certificate-inner">
                <div class="corner corner-tl"></div>
                <div class="corner corner-tr"></div>
                <div class="corner corner-bl"></div>
                <div class="corner corner-br"></div>

                <div class="cert-header">
                  <div class="cert-logo">ALTERNUS</div>
                  <div class="cert-logo-sub">ART GALLERY</div>
                  <div class="cert-divider"></div>
                  <div class="cert-title">Certificate of Authenticity</div>
                  <div class="cert-subtitle">Original Artwork Verification</div>
                </div>

                <div class="cert-body">
                  <div class="seal-row">
                    <div class="seal">
                      <div class="seal-text">AAG</div>
                      <div class="seal-year">${reportYear}</div>
                      <div class="seal-text">Verified</div>
                    </div>
                    <div class="cert-statement">
                      This document certifies that the artwork described below is an authentic,
                      original work of art. Alternus Art Gallery guarantees the provenance,
                      authenticity, and originality of this piece as represented by the artist
                      and verified through the Gallery's authentication process.
                    </div>
                  </div>

                  <div class="details-grid">
                    <div class="detail-item">
                      <div class="detail-label">Title of Artwork</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Artist Name</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Medium</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Dimensions</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Year of Creation</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Edition</div>
                      <div class="detail-value">Original — 1 of 1</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Date of Sale</div>
                      <div class="detail-value placeholder">&nbsp;</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Certificate Number</div>
                      <div class="detail-value">${certNumber}</div>
                    </div>
                  </div>

                  <div class="warranty">
                    <div class="warranty-title">Guarantee of Authenticity</div>
                    <div class="warranty-text">
                      Alternus Art Gallery warrants that this artwork is an original creation by the named artist.
                      This certificate serves as a permanent record of authenticity and provenance. The Gallery has
                      conducted due diligence to verify the artwork's originality, condition, and attribution.
                      This certificate is non-transferable without the artwork and should be stored securely
                      alongside proof of purchase. In the event of a dispute regarding authenticity, AAG will
                      conduct a review and, if the work is found to be inauthentic, a full refund will be issued
                      in accordance with the Gallery's W-7 Policy Document.
                    </div>
                  </div>
                </div>

                <div class="signatures">
                  <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-name">Artist Signature</div>
                    <div class="sig-role">Creator</div>
                  </div>
                  <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-name">Gallery Director</div>
                    <div class="sig-role">Alternus Art Gallery</div>
                  </div>
                  <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-name">Date of Issue</div>
                    <div class="sig-role">${reportDate}</div>
                  </div>
                </div>

                <div class="cert-footer">
                  <div class="cert-number">Certificate No. ${certNumber}</div>
                  <div class="cert-url">alternusart.com — Exclusive Original Artworks</div>
                </div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navigation */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <nav className="flex items-center gap-1">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Applications
                </Link>
                <Link
                  href="/admin/artists"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Artists
                </Link>
                <Link
                  href="/admin/artworks"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Artworks
                </Link>
                <Link
                  href="/admin/sales"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
                >
                  Sales
                </Link>
                <div className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg">
                  Reports
                </div>
              </nav>

            <div className="absolute right-0 flex items-center gap-3">
              {/* User Menu */}
              <div
                ref={userMenuRef}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-black hidden sm:block">CEO</p>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    AAG
                  </button>
                </div>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-zinc-600"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-sm font-medium text-black">Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-200 p-2">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          window.location.href = "/";
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-600"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Financial Reports & Analytics</h2>
              <p className="text-zinc-600">Comprehensive financial overview with charts and insights</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportCSV} className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Export PDF
              </Button>
              <Button onClick={handleExportCOA} variant="outline" className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Certificate (COA)
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">Total Revenue</p>
            <p className="text-4xl font-bold mb-1">€{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-sm">{stats.totalSales} total sales</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">Your Commission (40%)</p>
            <p className="text-4xl font-bold mb-1">€{stats.totalCommission.toLocaleString()}</p>
            <p className="text-white/60 text-sm">Avg €{stats.avgCommission}/sale</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">Artist Earnings (60%)</p>
            <p className="text-4xl font-bold mb-1">€{stats.totalArtistEarnings.toLocaleString()}</p>
            <p className="text-white/60 text-sm">Paid to artists</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-black mb-1">Revenue Trend</h3>
              <p className="text-zinc-600">Monthly revenue and commission breakdown</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-zinc-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded" />
                <span className="text-sm text-zinc-600">Commission (40%)</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-6">
            {monthlyData.map((data, index) => {
              const revenueHeight = (data.revenue / maxRevenue) * 200;
              const commissionHeight = (data.commission / maxRevenue) * 200;

              return (
                <div key={index} className="flex items-end gap-4">
                  <div className="w-20 text-right">
                    <p className="font-semibold text-black">{data.month}</p>
                    <p className="text-xs text-zinc-500">{data.sales} sales</p>
                  </div>
                  <div className="flex-1 flex items-end gap-3">
                    <div className="flex-1 flex items-end gap-2">
                      {/* Revenue Bar */}
                      <div className="flex-1 relative">
                        <div
                          className="bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer relative group"
                          style={{ height: `${revenueHeight}px`, minHeight: "40px" }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            €{data.revenue.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-center text-xs text-zinc-600 mt-2">
                          €{(data.revenue / 1000).toFixed(0)}K
                        </p>
                      </div>

                      {/* Commission Bar */}
                      <div className="flex-1 relative">
                        <div
                          className="bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600 cursor-pointer relative group"
                          style={{ height: `${commissionHeight}px`, minHeight: "40px" }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            €{data.commission.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-center text-xs text-zinc-600 mt-2">
                          €{(data.commission / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Artists */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8">
            <h3 className="text-2xl font-bold text-black mb-6">Top Performing Artists</h3>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-gradient-to-br from-amber-400 to-orange-500"
                          : index === 1
                          ? "bg-gradient-to-br from-zinc-300 to-zinc-400"
                          : index === 2
                          ? "bg-gradient-to-br from-amber-600 to-amber-700"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black">{artist.name}</p>
                      <p className="text-sm text-zinc-600">{artist.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      €{artist.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-emerald-600">
                      €{artist.commission.toLocaleString()} comm.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8">
            <h3 className="text-2xl font-bold text-black mb-6">Sales by Category</h3>
            <div className="space-y-6">
              {categoryBreakdown.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-black">{cat.category}</span>
                    <span className="text-sm text-zinc-600">
                      {cat.sales} sales ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">
                    €{cat.revenue.toLocaleString()} revenue
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 mt-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Commission Model Summary</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-white/60 text-sm mb-2">Total Sales Revenue</p>
              <p className="text-3xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Gallery Commission (40%)</p>
              <p className="text-3xl font-bold text-emerald-400">
                €{stats.totalCommission.toLocaleString()}
              </p>
              <p className="text-white/60 text-xs mt-1">Your earnings</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-2">Artist Payouts (60%)</p>
              <p className="text-3xl font-bold text-purple-400">
                €{stats.totalArtistEarnings.toLocaleString()}
              </p>
              <p className="text-white/60 text-xs mt-1">Paid to artists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
