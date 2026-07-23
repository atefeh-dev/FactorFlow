import type { Currency } from "../types/invoice.types";

/** Formats a number with thousands separators, e.g. 1234567 -> "1,234,567". Blank for zero/empty. */
export function formatRial(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  if (value === 0) return "";
  return new Intl.NumberFormat("en-US").format(value);
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Converts Persian ("۱۲۳") and Arabic-Indic ("١٢٣") digits to plain ASCII
 * ones. Mobile keyboards set to Persian produce these by default, and a
 * plain `parseFloat`/`Number()` silently treats them as NaN/0 — a common
 * source of "my numbers don't work" bug reports in Persian web apps.
 */
export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(ch);
    if (persianIndex !== -1) return String(persianIndex);
    const arabicIndex = ARABIC_INDIC_DIGITS.indexOf(ch);
    return arabicIndex !== -1 ? String(arabicIndex) : ch;
  });
}

/** Parses free-typed amount text (any digit script, thousands separators, stray characters) into a whole number. */
export function parseAmountInput(raw: string): number {
  const digitsOnly = normalizeDigits(raw).replace(/[^\d]/g, "");
  return digitsOnly === "" ? 0 : Number(digitsOnly);
}

/** 1 Toman = 10 Rial. All amounts are stored in Toman; this converts for display only. */
const RIAL_PER_TOMAN = 10;

export function currencyLabel(currency: Currency): string {
  return currency === "rial" ? "ریال" : "تومان";
}

/** Converts a stored (Toman) amount into the given display currency. */
export function toDisplayAmount(value: number, currency: Currency): number {
  return currency === "rial" ? value * RIAL_PER_TOMAN : value;
}

/** Converts a value entered in the given display currency back into the stored (Toman) unit. */
export function fromDisplayAmount(displayValue: number, currency: Currency): number {
  return currency === "rial" ? displayValue / RIAL_PER_TOMAN : displayValue;
}

/** Formats a stored (Toman) amount for display in the given currency, thousands-separated. */
export function formatAmount(value: number | null | undefined, currency: Currency): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return formatRial(toDisplayAmount(value, currency));
}
