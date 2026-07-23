const ONES = [
  "",
  "یک",
  "دو",
  "سه",
  "چهار",
  "پنج",
  "شش",
  "هفت",
  "هشت",
  "نه",
];

const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];

const TENS = [
  "",
  "",
  "بیست",
  "سی",
  "چهل",
  "پنجاه",
  "شصت",
  "هفتاد",
  "هشتاد",
  "نود",
];

const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];

const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون", "کوادریلیون"];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  const hundred = Math.floor(n / 100);
  const rest = n % 100;

  if (hundred > 0) parts.push(HUNDREDS[hundred]);

  if (rest >= 10 && rest < 20) {
    parts.push(TEENS[rest - 10]);
  } else if (rest > 0) {
    const ten = Math.floor(rest / 10);
    const one = rest % 10;
    if (ten > 0) parts.push(TENS[ten]);
    if (one > 0) parts.push(ONES[one]);
  }

  return parts.join(" و ");
}

/**
 * Converts an integer amount into Persian words, e.g. 125000 ->
 * "یکصد و بیست و پنج هزار". Only whole numbers are meaningful here — the
 * invoice's currency (Toman/Rial) has no fractional unit in practice, so
 * the value is rounded before conversion.
 */
export function numberToPersianWords(value: number): string {
  const n = Math.round(Math.abs(value));
  if (n === 0) return "صفر";
  if (!Number.isFinite(n)) return "";

  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    groups.unshift(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  groups.forEach((group, index) => {
    if (group === 0) return;
    const scaleIndex = groups.length - 1 - index;
    const words = threeDigitsToWords(group);
    parts.push(scaleIndex > 0 ? `${words} ${SCALES[scaleIndex]}` : words);
  });

  const sign = value < 0 ? "منفی " : "";
  return sign + parts.join(" و ");
}

/** Convenience wrapper: "دویست هزار تومان" style string for display under a total. */
export function amountToWords(value: number, unitLabel: string): string {
  const words = numberToPersianWords(value);
  return words ? `${words} ${unitLabel}` : "";
}
