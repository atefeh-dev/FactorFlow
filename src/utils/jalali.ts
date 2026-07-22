import {
  toJalaali,
  toGregorian,
  isValidJalaaliDate,
  jalaaliMonthLength,
  jalaaliToDateObject,
} from "jalaali-js";

export const PERSIAN_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** Week starts on Saturday in the Persian calendar. */
export const PERSIAN_WEEKDAY_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export interface JalaliYmd {
  jy: number;
  jm: number;
  jd: number;
}

/** Parses the app's stored "1401/06/09" format. Returns null if invalid/empty. */
export function parseJalaliString(value: string): JalaliYmd | null {
  const match = value.trim().match(/^(\d{3,4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (!isValidJalaaliDate(jy, jm, jd)) return null;
  return { jy, jm, jd };
}

export function formatJalaliString({ jy, jm, jd }: JalaliYmd): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

export function todayJalali(): JalaliYmd {
  return toJalaali(new Date());
}

/** 0 = Saturday … 6 = Friday, matching PERSIAN_WEEKDAY_SHORT order. */
export function jalaliWeekday({ jy, jm, jd }: JalaliYmd): number {
  const dow = jalaaliToDateObject(jy, jm, jd).getDay(); // 0 = Sunday … 6 = Saturday
  return (dow + 1) % 7;
}

export function daysInJalaliMonth(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

export function addJalaliMonths({ jy, jm, jd }: JalaliYmd, delta: number): JalaliYmd {
  const total = (jy * 12 + (jm - 1)) + delta;
  const nextJy = Math.floor(total / 12);
  const nextJm = (total % 12) + 1;
  const clampedJd = Math.min(jd, daysInJalaliMonth(nextJy, nextJm));
  return { jy: nextJy, jm: nextJm, jd: clampedJd };
}

export function sameJalaliDay(a: JalaliYmd | null, b: JalaliYmd | null): boolean {
  if (!a || !b) return false;
  return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd;
}

export { toGregorian };
