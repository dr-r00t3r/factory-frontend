"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { InventoryChart } from "@/components/charts/InventoryChart";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Rice, Package, TrendingUp, Users, Factory } from "@/lib/icons";
import type { OverallReport as OverallReportType } from "@/types";

// Backend may return total_sales/total_purchases as an integer or a Record.
function entriesOf(val: unknown): Array<[string, number]> {
  if (val && typeof val === "object") return Object.entries(val as Record<string, number>);
  if (typeof val === "number" && val > 0) return [["مجموع", val]];
  return [];
}

interface OverallReportProps {
  data: OverallReportType;
}

export function OverallReport({ data }: OverallReportProps) {
  const salesEntries = entriesOf(data.total_sales);
  const purchaseEntries = entriesOf(data.total_purchases);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Rice className="h-5 w-5" />}
          label="کل ورودی شالی"
          value={toPersianNumber(data.total_rice_input ?? data.total_input_weight) + " کیلو"}
        />
        <StatsCard
          icon={<Package className="h-5 w-5" />}
          label="کل خروجی"
          value={toPersianNumber(data.total_output ?? data.total_output_weight) + " کیلو"}
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label="مشتریان"
          value={toPersianNumber(data.total_customers ?? data.total_active_customers)}
        />
        <StatsCard
          icon={<Factory className="h-5 w-5" />}
          label="پرسنل فعال"
          value={toPersianNumber(data.active_members ?? 0)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">فروش بر اساس محصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{key}</span>
                  <span className="font-medium">
                    {toPersianCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">خرید بر اساس محصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{key}</span>
                  <span className="font-medium">
                    {toPersianCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InventoryChart data={data.inventory_summary as any} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">هزینه‌ها و حقوق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">کل هزینه‌ها</span>
                <span className="font-medium text-red-600">
                  {toPersianCurrency(data.total_expenses)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">کل حقوق</span>
                <span className="font-medium text-blue-600">
                  {toPersianCurrency(data.total_salaries)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
