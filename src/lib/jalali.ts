import * as jalaali from "jalaali-js";

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number
): { year: number; month: number; day: number } {
  const j = jalaali.toJalaali(gy, gm, gd);
  return { year: j.jy, month: j.jm, day: j.jd };
}

export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number
): { year: number; month: number; day: number } {
  const g = jalaali.toGregorian(jy, jm, jd);
  return { year: g.gy, month: g.gm, day: g.gd };
}

export function isoToJalali(isoDate: string): { year: number; month: number; day: number } {
  const datePart = isoDate.split("T")[0];
  const parts = datePart.split("-");
  return gregorianToJalali(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10),
    parseInt(parts[2], 10)
  );
}

export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const g = jalaliToGregorian(jy, jm, jd);
  return `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`;
}

export function getTodayJalaliIso(): string {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return jalaliToIso(j.year, j.month, j.day);
}

export function getTodayJalaliParts(): { year: number; month: number; day: number } {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaliMonthName(month: number): string {
  return JALALI_MONTHS[month - 1] || "";
}

export function formatJalaliDate(isoDate: string | undefined | null): string {
  if (!isoDate) return "-";
  try {
    const datePart = isoDate.includes("T") ? isoDate.split("T")[0] : isoDate;
    const parts = datePart.split("-");
    if (parts.length !== 3) return isoDate;
    const j = gregorianToJalali(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10),
      parseInt(parts[2], 10)
    );
    return `${j.day} ${JALALI_MONTHS[j.month - 1]} ${j.year}`;
  } catch {
    return isoDate;
  }
}
