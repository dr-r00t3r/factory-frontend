"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/hooks";
import { toPersianNumber, toPersianCurrency } from "@/lib/utils";
import { Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function InventoryPage() {
  const { data: inventory, isLoading } = useInventory();

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  const chartData = inventory?.map((item) => ({
    name: item.product_type_display || item.product_type,
    weight: item.weight,
    value: item.total_amount,
  })) || [];

  const totalWeight = inventory?.reduce((s, i) => s + i.weight, 0) || 0;
  const totalValue = inventory?.reduce((s, i) => s + i.total_amount, 0) || 0;

  return (
    <PageShell title="موجودی محصولات" description="مشاهده موجودی کل محصولات کارخانه">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              خلاصه موجودی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">مجموع وزن</span>
                <span className="text-xl font-bold">{toPersianNumber(totalWeight)} کیلو</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">مجموع ارزش</span>
                <span className="text-xl font-bold">{toPersianCurrency(totalValue)}</span>
              </div>
              {inventory?.map((item) => (
                <div key={item.product_type} className="flex items-center justify-between text-sm">
                  <span>{item.product_type_display || item.product_type}</span>
                  <span>{toPersianNumber(item.weight)} کیلو</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نمودار وزن محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%" labelLine
                    label={({ name, weight }) => `${name}: ${toPersianNumber(weight)} کیلو`}
                    outerRadius={100} dataKey="weight"
                  >
                    {chartData.map((_e, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">اطلاعاتی برای نمایش وجود ندارد</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">جزئیات موجودی</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="weight" fill="#3b82f6" name="وزن (کیلو)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">اطلاعاتی برای نمایش وجود ندارد</div>
          )}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-3">محصول</th>
                  <th className="text-right py-2 px-3">وزن (کیلو)</th>
                  <th className="text-right py-2 px-3">ارزش (ریال)</th>
                  <th className="text-right py-2 px-3">آخرین به‌روزرسانی</th>
                </tr>
              </thead>
              <tbody>
                {inventory?.map((item) => (
                  <tr key={item.product_type} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3">{item.product_type_display || item.product_type}</td>
                    <td className="py-2 px-3">{toPersianNumber(item.weight)}</td>
                    <td className="py-2 px-3">{toPersianCurrency(item.total_amount)}</td>
                    <td className="py-2 px-3">{item.updated_at ? new Date(item.updated_at).toLocaleDateString("fa-IR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
