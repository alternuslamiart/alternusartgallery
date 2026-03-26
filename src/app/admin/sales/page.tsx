"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Sale {
  id: string;
  transactionId: string;
  artwork: string;
  artist: string;
  buyer: string;
  price: number;
  commission: number;
  artistEarning: number;
  paymentStatus: "completed" | "processing" | "failed";
  payoutStatus: "pending" | "processing" | "paid" | "failed";
  saleDate: string;
}

export default function SalesPage() {
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

  const [sales] = useState<Sale[]>([]);

  const stats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, sale) => sum + sale.price, 0),
    totalCommission: sales.reduce((sum, sale) => sum + sale.commission, 0),
    totalArtistEarnings: sales.reduce((sum, sale) => sum + sale.artistEarning, 0),
    completedPayments: sales.filter((s) => s.paymentStatus === "completed").length,
    pendingPayouts: sales.filter((s) => s.payoutStatus === "pending").length,
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Transaction ID", "Artwork", "Artist", "Buyer", "Price", "Commission (40%)", "Artist Earning (60%)", "Payment Status", "Payout Status", "Date"],
      ...sales.map((sale) => [
        sale.transactionId,
        sale.artwork,
        sale.artist,
        sale.buyer,
        sale.price,
        sale.commission,
        sale.artistEarning,
        sale.paymentStatus,
        sale.payoutStatus,
        sale.saleDate,
      ]),
      ["", "", "", "TOTALS:", stats.totalRevenue, stats.totalCommission, stats.totalArtistEarnings, "", "", ""],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                <div className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg">
                  Sales
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
          <h2 className="text-3xl font-bold text-black mb-2">Sales & Commission (40%)</h2>
          <p className="text-zinc-600">Track all sales with 40% gallery commission breakdown</p>
        </div>

        {/* Stats - 40% Commission Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">{stats.totalSales} sales</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Badge className="bg-white/30 text-white border-0 text-lg">40%</Badge>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Gallery Commission</p>
            <p className="text-3xl font-bold">€{stats.totalCommission.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Your earnings</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Badge className="bg-white/30 text-white border-0 text-lg">60%</Badge>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Artist Earnings</p>
            <p className="text-3xl font-bold">€{stats.totalArtistEarnings.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-2">Paid to artists</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              {stats.pendingPayouts > 0 && (
                <Badge className="bg-white/20 text-white border-0">{stats.pendingPayouts}</Badge>
              )}
            </div>
            <p className="text-white/80 text-sm mb-1">Pending Payouts</p>
            <p className="text-3xl font-bold">{stats.pendingPayouts}</p>
            <p className="text-white/60 text-xs mt-2">Require processing</p>
          </div>
        </div>

        {/* Commission Breakdown Visual */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-black mb-6">Commission Breakdown Model</h3>
          <div className="flex items-center gap-4">
            <div className="flex-[2]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-emerald-500 rounded" />
                <span className="text-sm font-medium">Gallery Commission (40%)</span>
              </div>
              <div className="h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                40%
              </div>
            </div>
            <div className="flex-[3]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-purple-500 rounded" />
                <span className="text-sm font-medium">Artist Earnings (60%)</span>
              </div>
              <div className="h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                60%
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-600 mt-4">
            For every sale, 40% goes to the gallery and 60% to the artist
          </p>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-black">All Sales Transactions</h3>
                <p className="text-zinc-600 text-sm mt-1">Complete sales history with commission breakdown</p>
              </div>
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">
                    Transaction ID
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Artwork</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Artist</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Buyer</th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">Price</th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Commission (40%)
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-zinc-700">
                    Artist (60%)
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Payment</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Payout</th>
                  <th className="text-left p-4 text-sm font-semibold text-zinc-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50">
                    <td className="p-4">
                      <span className="font-mono text-sm text-zinc-600">#{sale.transactionId}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-black">{sale.artwork}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-700">{sale.artist}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-700">{sale.buyer}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-black">
                        €{sale.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-emerald-600">
                        €{sale.commission.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-purple-600">
                        €{sale.artistEarning.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {sale.paymentStatus === "completed" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          Completed
                        </Badge>
                      ) : sale.paymentStatus === "processing" ? (
                        <Badge className="bg-blue-100 text-blue-700 border-0">Processing</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-0">Failed</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {sale.payoutStatus === "paid" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Paid</Badge>
                      ) : sale.payoutStatus === "processing" ? (
                        <Badge className="bg-blue-100 text-blue-700 border-0">Processing</Badge>
                      ) : sale.payoutStatus === "pending" ? (
                        <Badge className="bg-orange-100 text-orange-700 border-0">Pending</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-0">Failed</Badge>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600 text-sm">{sale.saleDate}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50 border-t-2 border-zinc-300">
                <tr className="font-bold">
                  <td colSpan={4} className="p-4 text-right text-black">
                    TOTALS:
                  </td>
                  <td className="p-4 text-right text-black">
                    €{stats.totalRevenue.toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-emerald-600">
                    €{stats.totalCommission.toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-purple-600">
                    €{stats.totalArtistEarnings.toLocaleString()}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
