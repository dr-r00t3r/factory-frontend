"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toPersianCurrency, formatPersianDate } from "@/lib/utils";
import type { FinancialSummary as FinancialSummaryType } from "@/types";

interface FinancialSummaryProps {
  data: FinancialSummaryType;
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const items = [
    { label: "کل فروش", value: data.total_sales, color: "text-green-600" },
    { label: "کل خرید", value: data.total_purchases, color: "text-red-600" },
    { label: "کل هزینه‌ها", value: data.total_expenses, color: "text-orange-600" },
    { label: "کل حقوق", value: data.total_salaries, color: "text-blue-600" },
    { label: "سود خالص", value: data.net_profit ?? data.net_balance, color: (data.net_profit ?? data.net_balance) >= 0 ? "text-green-700" : "text-red-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">خلاصه مالی</CardTitle>
        {data.period_start && data.period_end && (
          <p className="text-sm text-muted-foreground">
            از {formatPersianDate(data.period_start)} تا {formatPersianDate(data.period_end)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`font-bold ${item.color}`}>
                {toPersianCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
