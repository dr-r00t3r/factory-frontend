import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const persianDigits: Record<string, string> = {
  "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴",
  "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹",
};

export function toPersianNumber(num: number | string | undefined | null): string {
  if (num == null) return "-";
  return String(num).replace(/\d/g, (d) => persianDigits[d] || d);
}

export function toPersianCurrency(amount: number | undefined | null): string {
  if (amount == null) return "-";
  return toPersianNumber(amount.toLocaleString("fa-IR")) + " ریال";
}

export function formatPersianDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatPersianDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function getTodayPersian(): string {
  return new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
