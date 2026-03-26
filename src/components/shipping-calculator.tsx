"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers";

interface ShippingCalculatorProps {
  paintingPrice: number;
}

const shippingRates = {
  "United States": { standard: 25, express: 45, freeThreshold: 1200 },
  "United Kingdom": { standard: 20, express: 40, freeThreshold: 1200 },
  "Germany": { standard: 15, express: 30, freeThreshold: 1200 },
  "France": { standard: 15, express: 30, freeThreshold: 1200 },
  "Italy": { standard: 18, express: 35, freeThreshold: 1200 },
  "Spain": { standard: 18, express: 35, freeThreshold: 1200 },
  "Canada": { standard: 30, express: 50, freeThreshold: 1200 },
  "Australia": { standard: 40, express: 70, freeThreshold: 1200 },
  "Japan": { standard: 35, express: 65, freeThreshold: 1200 },
  "China": { standard: 35, express: 60, freeThreshold: 1200 },
  "Other": { standard: 40, express: 75, freeThreshold: 1200 },
};

export function ShippingCalculator({ paintingPrice }: ShippingCalculatorProps) {
  const { formatPrice } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<keyof typeof shippingRates | "">("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [showResults, setShowResults] = useState(false);

  const countries = Object.keys(shippingRates);

  const handleCalculate = () => {
    if (selectedCountry) {
      setShowResults(true);
    }
  };

  const getShippingCost = () => {
    if (!selectedCountry) return 0;

    const rates = shippingRates[selectedCountry];
    const freeShipping = paintingPrice >= rates.freeThreshold;

    if (freeShipping) return 0;

    return shippingMethod === "standard" ? rates.standard : rates.express;
  };

  const shippingCost = getShippingCost();
  const isFreeShipping = selectedCountry && paintingPrice >= shippingRates[selectedCountry].freeThreshold;
  const estimatedDelivery = shippingMethod === "standard" ? "5-10 business days" : "2-4 business days";

  return (
    <div className="border rounded-lg p-6 bg-muted/30">
      <div className="flex items-center gap-2 mb-4">
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
          className="text-primary"
        >
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
        <h3 className="text-lg font-semibold">Calculate Shipping</h3>
      </div>

      <div className="space-y-4">
        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Destination Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value as keyof typeof shippingRates);
              setShowResults(false);
            }}
            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Shipping Method */}
        {selectedCountry && (
          <div>
            <label className="block text-sm font-medium mb-2">Shipping Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShippingMethod("standard");
                  setShowResults(false);
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  shippingMethod === "standard"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Standard</p>
                <p className="text-xs text-muted-foreground">5-10 days</p>
              </button>
              <button
                onClick={() => {
                  setShippingMethod("express");
                  setShowResults(false);
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  shippingMethod === "express"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Express</p>
                <p className="text-xs text-muted-foreground">2-4 days</p>
              </button>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        {selectedCountry && (
          <Button onClick={handleCalculate} className="w-full">
            Calculate Shipping Cost
          </Button>
        )}

        {/* Results */}
        {showResults && selectedCountry && (
          <div className="mt-6 p-4 bg-background rounded-lg border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Shipping Method:</span>
                <span className="font-medium capitalize">{shippingMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                <span className="font-medium">{estimatedDelivery}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Shipping Cost:</span>
                  {isFreeShipping ? (
                    <span className="text-green-600 font-bold text-lg">FREE</span>
                  ) : (
                    <span className="font-bold text-lg">{formatPrice(shippingCost)}</span>
                  )}
                </div>
              </div>
              {isFreeShipping && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    You qualify for free shipping!
                  </p>
                </div>
              )}
              {!isFreeShipping && selectedCountry && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-800">
                    Spend {formatPrice(shippingRates[selectedCountry].freeThreshold - paintingPrice)} more to get free shipping
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground mt-4 space-y-1">
          <p>• All artworks are fully insured during shipping</p>
          <p>• Tracking number provided once shipped</p>
          <p>• Free shipping on orders over €1,200</p>
        </div>
      </div>
    </div>
  );
}
