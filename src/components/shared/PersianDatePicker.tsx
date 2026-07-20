"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isoToJalali, jalaliToIso, getTodayJalaliParts, jalaliMonthName } from "@/lib/jalali";

interface PersianDatePickerProps {
  value?: string;
  onChange: (isoDate: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function PersianDatePicker({
  value,
  onChange,
  label,
  error,
  required = false,
}: PersianDatePickerProps) {
  const parts = useMemo(() => {
    if (value) {
      try {
        return isoToJalali(value);
      } catch {
        return getTodayJalaliParts();
      }
    }
    return getTodayJalaliParts();
  }, [value]);

  const [year, setYear] = useState(parts.year);
  const [month, setMonth] = useState(parts.month);
  const [day, setDay] = useState(parts.day);

  const years = useMemo(() => {
    const current = getTodayJalaliParts().year;
    return Array.from({ length: 20 }, (_, i) => current - 10 + i);
  }, []);

  const maxDay = useMemo(() => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return 29;
  }, [month]);

  const days = useMemo(() => {
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [maxDay]);

  const handleChange = (field: "year" | "month" | "day", val: string) => {
    const numVal = parseInt(val, 10);
    const newParts = {
      year: field === "year" ? numVal : year,
      month: field === "month" ? numVal : month,
      day: field === "day" ? numVal : day,
    };
    if (field === "year") setYear(numVal);
    if (field === "month") {
      setMonth(numVal);
      if (newParts.day > (numVal <= 6 ? 31 : numVal <= 11 ? 30 : 29)) {
        newParts.day = numVal <= 6 ? 31 : numVal <= 11 ? 30 : 29;
        setDay(newParts.day);
      }
    }
    if (field === "day") setDay(numVal);

    const clampedDay = Math.min(
      newParts.day,
      newParts.month <= 6 ? 31 : newParts.month <= 11 ? 30 : 29
    );
    newParts.day = clampedDay;

    const iso = jalaliToIso(newParts.year, newParts.month, clampedDay);
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <SelectItem key={m} value={String(m)}>
                {jalaliMonthName(m)}
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
