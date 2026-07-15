"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PersianDatePickerProps {
  value?: string;
  onChange: (isoDate: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

function toJalali(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return date.toISOString().split("T")[0];
}

function getPersianDateParts(isoDate?: string): { year: number; month: number; day: number } {
  if (!isoDate) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }
  const d = new Date(isoDate);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function PersianDatePicker({
  value,
  onChange,
  label,
  error,
  required = false,
}: PersianDatePickerProps) {
  const parts = getPersianDateParts(value);
  const [year, setYear] = useState(parts.year);
  const [month, setMonth] = useState(parts.month);
  const [day, setDay] = useState(parts.day);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => current - 5 + i);
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  }, []);

  const handleChange = (field: "year" | "month" | "day", val: string) => {
    const numVal = parseInt(val, 10);
    const newParts = {
      year: field === "year" ? numVal : year,
      month: field === "month" ? numVal : month,
      day: field === "day" ? numVal : day,
    };
    if (field === "year") setYear(numVal);
    if (field === "month") setMonth(numVal);
    if (field === "day") setDay(numVal);

    const clampedDay = Math.min(newParts.day, 28);
    const iso = toJalali(newParts.year, newParts.month, clampedDay);
    onChange(iso);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Select
          value={String(year)}
          onValueChange={(v) => handleChange("year", v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="سال" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(month)}
          onValueChange={(v) => handleChange("month", v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="ماه" />
          </SelectTrigger>
          <SelectContent>
            {persianMonths.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(day)}
          onValueChange={(v) => handleChange("day", v)}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="روز" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
