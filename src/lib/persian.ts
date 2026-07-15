export function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)] || d);
}

export function toPersianCurrency(amount: number): string {
  return toPersianDigits(amount.toLocaleString("fa-IR")) + " ریال";
}

export function formatPersianDate(dateStr: string): string {
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

export function formatPersianDateTime(dateStr: string): string {
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

export function getPersianMonthName(month: number): string {
  const months = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
  ];
  return months[month - 1] || "";
}

export function isValidPersianDate(str: string): boolean {
  if (!str) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}
