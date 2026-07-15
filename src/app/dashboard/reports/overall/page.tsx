"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { useOverallReport } from "@/hooks";
import { toPersianNumber, toPersianCurrency } from "@/lib/utils";
import { Rice, Factory, Users, Package, TrendingUp, TrendingDown, DollarSign } from "@/lib/icons";

// Backend returns total_sales/total_purchases as a single summed integer;
// tolerate either shape (number or Record<string, number>) defensively.
function asEntries(val: unknown): Array<[string, number]> {
  if (val && typeof val === "object") {
    return Object.entries(val as Record<string, number>);
  }
  if (typeof val === "number") {
    return val > 0 ? [["مجموع", val]] : [];
  }
  return [];
}

function asNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object") {
    return Object.values(val as Record<string, number>).reduce((s, v) => s + (Number(v) || 0), 0);
  }
  return 0;
}

export default function OverallReportPage() {
  const { data: report, isLoading } = useOverallReport();

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  if (!report) {
    return (
      <PageShell title="گزارش جامع" description="گزارش کامل وضعیت کارخانه">
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            اطلاعاتی برای نمایش وجود ندارد
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const salesEntries = asEntries(report.total_sales);
  const purchaseEntries = asEntries(report.total_purchases);
  const totalSales = asNumber(report.total_sales);
  const totalPurchases = asNumber(report.total_purchases);
  const netProfit = report.total_profit;

  return (
    <PageShell title="گزارش جامع" description="گزارش کامل وضعیت کارخانه">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Rice className="h-5 w-5" />} label="کل شالی وارده" value={toPersianNumber(report.total_input_weight) + " کیلو"} />
        <StatsCard icon={<Factory className="h-5 w-5" />} label="خروجی تبدیل" value={toPersianNumber(report.total_output_weight) + " کیلو"} />
        <StatsCard icon={<Users className="h-5 w-5" />} label="مجموع مشتریان" value={toPersianNumber(report.total_active_customers)} />
        <StatsCard icon={<Package className="h-5 w-5" />} label="پرسنل فعال" value={toPersianNumber(0)} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              مجموع فروش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">{toPersianCurrency(totalSales)}</p>
              {salesEntries.map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{key}</span>
                  <span>{toPersianCurrency(val)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              مجموع خرید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-600">{toPersianCurrency(totalPurchases)}</p>
              {purchaseEntries.map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{key}</span>
                  <span>{toPersianCurrency(val)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              سود خالص
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{toPersianCurrency(netProfit)}</p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>هزینه‌ها</span>
                <span className="text-destructive">{toPersianCurrency(report.total_expense)}</span>
              </div>
              <div className="flex justify-between">
                <span>حقوق</span>
                <span className="text-destructive">{toPersianCurrency(report.total_karmozd)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {report.inventory_summary && Object.keys(report.inventory_summary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">خلاصه موجودی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-3">محصول</th>
                    <th className="text-right py-2 px-3">وزن (کیلو)</th>
                    <th className="text-right py-2 px-3">ارزش (ریال)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.inventory_summary).map(([key, item]) => (
                    <tr key={key} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 px-3">{key}</td>
                      <td className="py-2 px-3">{toPersianNumber(item.weight)}</td>
                      <td className="py-2 px-3">{toPersianCurrency(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
