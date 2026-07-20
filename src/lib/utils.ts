import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatJalaliDate } from "@/lib/jalali";

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
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      return formatJalaliDate(dateStr);
    }
    const date = new Date(dateStr);
    const iso = date.toISOString().split("T")[0];
    return formatJalaliDate(iso);
  } catch {
    return dateStr;
  }
}

export function formatPersianDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const iso = date.toISOString().split("T")[0];
    const jalaliPart = formatJalaliDate(iso);
    const timePart = date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    return `${jalaliPart} - ${timePart}`;
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
