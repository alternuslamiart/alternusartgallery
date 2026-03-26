import { Language } from "./i18n";

export type Currency = "USD" | "EUR" | "GBP" | "CNY" | "JPY" | "SAR" | "TRY";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  rate: number; // Conversion rate from EUR (base currency)
}

// Currency mapping based on language/region
export const languageToCurrency: Record<Language, Currency> = {
  "en-US": "USD",     // English (US) → US Dollar
  "en-GB": "GBP",     // English (UK) → British Pound
  es: "EUR",     // Spanish → Euro
  fr: "EUR",     // French → Euro
  de: "EUR",     // German → Euro
  it: "EUR",     // Italian → Euro
  pt: "EUR",     // Portuguese → Euro
  zh: "CNY",     // Chinese → Yuan
  ja: "JPY",     // Japanese → Yen
  ar: "SAR",     // Arabic → Saudi Riyal
  nl: "EUR",     // Dutch → Euro
  tr: "TRY",     // Turkish → Lira
};

// Currency information with symbols and conversion rates
export const currencies: Record<Currency, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", rate: 1.08 },      // 1 EUR = 1.08 USD
  EUR: { code: "EUR", symbol: "€", rate: 1.00 },      // Base currency
  GBP: { code: "GBP", symbol: "£", rate: 0.86 },      // 1 EUR = 0.86 GBP
  CNY: { code: "CNY", symbol: "¥", rate: 7.85 },      // 1 EUR = 7.85 CNY
  JPY: { code: "JPY", symbol: "¥", rate: 160.50 },    // 1 EUR = 160.50 JPY
  SAR: { code: "SAR", symbol: "﷼", rate: 4.05 },      // 1 EUR = 4.05 SAR
  TRY: { code: "TRY", symbol: "₺", rate: 35.20 },     // 1 EUR = 35.20 TRY
};

/**
 * Convert price from EUR to target currency
 */
export function convertPrice(priceInEur: number, targetCurrency: Currency): number {
  const currencyInfo = currencies[targetCurrency];
  return Math.round(priceInEur * currencyInfo.rate);
}

/**
 * Format price with currency symbol
 */
export function formatPrice(priceInEur: number, language: Language): string {
  const currency = languageToCurrency[language];
  const currencyInfo = currencies[currency];
  const convertedPrice = convertPrice(priceInEur, currency);

  // Format number with thousands separator
  const formattedNumber = convertedPrice.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // For some currencies, symbol goes after the number
  if (currency === "TRY") {
    return `${formattedNumber}${currencyInfo.symbol}`;
  }

  // For most currencies, symbol goes before
  return `${currencyInfo.symbol}${formattedNumber}`;
}

/**
 * Get currency info for a language
 */
export function getCurrencyForLanguage(language: Language): CurrencyInfo {
  const currency = languageToCurrency[language];
  return currencies[currency];
}
