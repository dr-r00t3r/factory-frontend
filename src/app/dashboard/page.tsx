"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useRiceInputs, useProcesses, useInventory, useFinancialSummary } from "@/hooks";
import { toPersianNumber, toPersianCurrency } from "@/lib/utils";
import {
  Rice,
  Factory,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  Warehouse,
  DollarSign,
} from "@/lib/icons";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const { data: riceInputsData, isLoading: loadingInputs } = useRiceInputs({ page_size: 5 });
  const { data: processesData, isLoading: loadingProcesses } = useProcesses({ page_size: 5 });
  const { data: inventory, isLoading: loadingInventory } = useInventory();
  const { data: financialSummary, isLoading: loadingFinance } = useFinancialSummary();

  const todayInputs = riceInputsData?.results?.length || 0;
  const pendingProcesses = processesData?.results?.filter(
    (p) => !p.is_completed
  ).length || 0;

  const inventoryChartData = inventory?.map((item) => ({
    name: item.product_type_display || item.product_type,
    value: item.total_weight ?? item.weight ?? 0,
  })) || [];

  const totalInventoryWeight = inventory?.reduce((sum, item) => sum + (item.total_weight ?? item.weight ?? 0), 0) || 0;

  const quickActions = [
    // { title: "ورودی جدید", href: "/rice-inputs", icon: <ArrowRight className="h-4 w-4" /> },
    // { title: "ثبت فرآیند", href: "/processes", icon: <Factory className="h-4 w-4" /> },
    // { title: "ثبت فروش", href: "/sales/shali", icon: <DollarSign className="h-4 w-4" /> },
    // { title: "موجودی انبار", href: "/inventory", icon: <Warehouse className="h-4 w-4" /> },
    { title: "ورودی جدید", href: "/dashboard/rice-inputs", icon: <ArrowRight className="h-4 w-4" /> },
    { title: "ثبت فرآیند", href: "/dashboard/processes", icon: <Factory className="h-4 w-4" /> },
    { title: "ثبت فروش", href: "/dashboard/sales/shali", icon: <DollarSign className="h-4 w-4" /> },
    { title: "موجودی انبار", href: "/dashboard/inventory", icon: <Warehouse className="h-4 w-4" /> },
  ];

  if (loadingInputs && loadingProcesses && loadingInventory && loadingFinance) {
    return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
  }

  return (
    <PageShell title="داشبورد" description="خلاصه وضعیت کارخانه">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Rice className="h-5 w-5" />}
          label="ورودی امروز"
          value={toPersianNumber(todayInputs)}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          icon={<Factory className="h-5 w-5" />}
          label="فرآیندهای در انتظار"
          value={toPersianNumber(pendingProcesses)}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="موجودی کل (کیلو)"
          value={toPersianNumber(totalInventoryWeight)}
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="سود خالص"
          value={financialSummary ? toPersianCurrency(financialSummary.net_balance || financialSummary.net_profit || 0) : "۰"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  {action.icon}
                </div>
                <span className="font-medium">{action.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">موجودی محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${toPersianNumber(value)} کیلو`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                اطلاعاتی برای نمایش وجود ندارد
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ورودی‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            {riceInputsData?.results?.length ? (
              <div className="space-y-3">
                {riceInputsData.results.slice(0, 5).map((input) => (
                  <div key={input.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{input.customer_name || "مشتری"}</p>
                      <p className="text-xs text-muted-foreground">
                        {input.rice_type_name} - {toPersianNumber(input.weight_kg)} کیلو
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(input.input_date).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                ورودی‌ای ثبت نشده است
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
