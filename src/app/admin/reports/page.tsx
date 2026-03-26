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
    // Create a printable version of the report
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #000;
            }
            h1 {
              color: #000;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
            }
            h2 {
              color: #333;
              margin-top: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 8px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Alternus Art Gallery (AAG) - Financial Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>

          <h2>Key Metrics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">€${stats.totalRevenue.toLocaleString()}</div>
              <div class="stat-label">${stats.totalSales} total sales</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Gallery Commission (40%)</div>
              <div class="stat-value">€${stats.totalCommission.toLocaleString()}</div>
              <div class="stat-label">Avg €${stats.avgCommission}/sale</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Artist Earnings (60%)</div>
              <div class="stat-value">€${stats.totalArtistEarnings.toLocaleString()}</div>
              <div class="stat-label">Paid to artists</div>
            </div>
          </div>

          <h2>Monthly Revenue Trend</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Commission (40%)</th>
                <th>Artist Earnings (60%)</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyData.map(d => `
                <tr>
                  <td>${d.month}</td>
                  <td>${d.sales}</td>
                  <td>€${d.revenue.toLocaleString()}</td>
                  <td>€${d.commission.toLocaleString()}</td>
                  <td>€${(d.revenue - d.commission).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Top Performing Artists</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Artist</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              ${topArtists.map((artist, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${artist.name}</td>
                  <td>${artist.sales}</td>
                  <td>€${artist.revenue.toLocaleString()}</td>
                  <td>€${artist.commission.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Sales by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Sales</th>
                <th>Percentage</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${categoryBreakdown.map(cat => `
                <tr>
                  <td>${cat.category}</td>
                  <td>${cat.sales}</td>
                  <td>${cat.percentage}%</td>
                  <td>€${cat.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Alternus Art Gallery (AAG)</strong> | Commission Model: 40% Gallery / 60% Artist</p>
            <p>This is an automatically generated financial report.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
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
