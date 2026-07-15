"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { toPersianNumber } from "@/lib/utils";
import type { Inventory } from "@/types";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

interface InventoryChartProps {
  data: Inventory[];
}

export function InventoryChart({ data }: InventoryChartProps) {
  const chartData = data.map((item) => ({
    name: item.product_type_display || item.product_type,
    value: item.total_weight,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          اطلاعاتی برای نمایش وجود ندارد
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, value }) =>
                `${name}: ${toPersianNumber(value)} کیلو`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${toPersianNumber(value)} کیلوگرم`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
