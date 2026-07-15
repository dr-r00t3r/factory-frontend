"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toPersianCurrency } from "@/lib/utils";
import type { FinancialSummary } from "@/types";

interface RevenueChartProps {
  data: FinancialSummary;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = [
    {
      name: "فروش",
      مقدار: data.total_sales,
      fill: "#22c55e",
    },
    {
      name: "خرید",
      مقدار: data.total_purchases,
      fill: "#ef4444",
    },
    {
      name: "هزینه‌ها",
      مقدار: data.total_expenses,
      fill: "#f59e0b",
    },
    {
      name: "حقوق",
      مقدار: data.total_salaries,
      fill: "#3b82f6",
    },
    {
      name: "سود خالص",
      مقدار: data.net_profit,
      fill: "#8b5cf6",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">نمودار درآمد و هزینه</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => toPersianCurrency(value)}
            />
            <Legend />
            <Bar dataKey="مقدار" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
