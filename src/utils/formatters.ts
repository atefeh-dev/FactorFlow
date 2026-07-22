import type { Currency } from "../types/invoice.types";

/** Formats a number with thousands separators, e.g. 1234567 -> "1,234,567". Blank for zero/empty. */
export function formatRial(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  if (value === 0) return "";
  return new Intl.NumberFormat("en-US").format(value);
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
