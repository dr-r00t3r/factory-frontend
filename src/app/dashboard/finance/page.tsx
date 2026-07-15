"use client";

import React, { useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatsCard } from "@/components/shared/StatsCard";
import { PrintButton } from "@/components/shared/PrintButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialSummary, useOverallReport } from "@/hooks";
import { toPersianNumber, toPersianCurrency } from "@/lib/utils";
import {
  Banknote, CreditCard, FileText, Receipt, Wallet, TrendingUp,
  TrendingDown, Scale, ArrowDownCircle, ArrowUpCircle, Coins, PiggyBank,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";

export default function FinancialDashboardPage() {
  const { data: fin, isLoading: finLoading } = useFinancialSummary();
  const { data: overall, isLoading: overallLoading } = useOverallReport();

  const isLoading = finLoading && overallLoading;

  // Income vs expense bar chart data
  const chartData = useMemo(() => {
    if (!fin) return [];
    return [
      {
        name: "درآمد",
        "نقدی": fin.total_cash_payments || 0,
        "کارتی": fin.total_card_payments || 0,
        "چک‌های وصولی": fin.total_collected_checks || 0,
        "فروش": fin.total_sales || 0,
        "متفرقه": fin.total_misc_receipts || 0,
      },
      {
        name: "هزینه",
        "هزینه‌ها": fin.total_expenses || 0,
        "حقوق": fin.total_salaries || 0,
        "خرید": fin.total_purchases || 0,
        "پرداخت‌های_متفرقه": fin.total_misc_payments || 0,
      },
    ];
  }, [fin]);

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  const netBalance = fin?.net_balance ?? 0;
  const netBalancePositive = netBalance >= 0;

  // Income breakdown rows
  const incomeRows = fin
    ? [
        { label: "پرداخت‌های نقدی", value: fin.total_cash_payments, icon: <Banknote className="h-4 w-4" /> },
        { label: "پرداخت‌های کارتی", value: fin.total_card_payments, icon: <CreditCard className="h-4 w-4" /> },
        { label: "چک‌های وصول‌شده", value: fin.total_collected_checks, icon: <FileText className="h-4 w-4" /> },
        { label: "فروش محصولات", value: fin.total_sales, icon: <TrendingUp className="h-4 w-4" /> },
        { label: "دریافتی متفرقه", value: fin.total_misc_receipts, icon: <ArrowDownCircle className="h-4 w-4" /> },
        { label: "وام دریافتی", value: fin.total_loans_received, icon: <Coins className="h-4 w-4" /> },
      ]
    : [];

  const expenseRows = fin
    ? [
        { label: "هزینه‌های جاری", value: fin.total_expenses, icon: <Receipt className="h-4 w-4" /> },
        { label: "حقوق پرسنل", value: fin.total_salaries, icon: <Wallet className="h-4 w-4" /> },
        { label: "خرید محصولات", value: fin.total_purchases, icon: <TrendingDown className="h-4 w-4" /> },
        { label: "پرداخت‌های متفرقه", value: fin.total_misc_payments, icon: <ArrowUpCircle className="h-4 w-4" /> },
        { label: "وام پرداختی", value: fin.total_loans_given, icon: <Coins className="h-4 w-4" /> },
        { label: "تخفیف‌ها", value: fin.total_discounts, icon: <Scale className="h-4 w-4" /> },
      ]
    : [];

  const totalIncome = incomeRows.reduce((s, r) => s + (r.value || 0), 0);
  const totalExpense = expenseRows.reduce((s, r) => s + (r.value || 0), 0);

  return (
    <PageShell
      title="داشبورد مالی"
      description="نمای جامع درآمد، هزینه و تراز کارخانه (معادل فرم مالی)"
      actions={<PrintButton />}
    >
      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="کل درآمد"
          value={toPersianCurrency(totalIncome)}
        />
        <StatsCard
          icon={<TrendingDown className="h-5 w-5" />}
          label="کل هزینه"
          value={toPersianCurrency(totalExpense)}
        />
        <StatsCard
          icon={<PiggyBank className="h-5 w-5" />}
          label="تراز (سود/زیان)"
          value={toPersianCurrency(netBalance)}
          trend={{ value: 0, isPositive: netBalancePositive }}
        />
        <StatsCard
          icon={<FileText className="h-5 w-5" />}
          label="چک‌های معوق"
          value={toPersianCurrency(
            (fin?.total_check_amounts || 0) - (fin?.total_collected_checks || 0)
          )}
        />
      </div>

      {/* Income vs Expense breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-600">
              <TrendingUp className="h-5 w-5" />
              درآمدها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomeRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {row.icon}
                  {row.label}
                </span>
                <span className="font-medium">{toPersianCurrency(row.value || 0)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-bold">جمع کل درآمد</span>
              <span className="font-bold text-green-600">{toPersianCurrency(totalIncome)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <TrendingDown className="h-5 w-5" />
              هزینه‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {row.icon}
                  {row.label}
                </span>
                <span className="font-medium">{toPersianCurrency(row.value || 0)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-bold">جمع کل هزینه</span>
              <span className="font-bold text-red-600">{toPersianCurrency(totalExpense)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">مقایسه درآمد و هزینه</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => toPersianNumber(v)} />
                <Tooltip formatter={(v: number) => toPersianCurrency(v)} />
                <Legend />
                <Bar dataKey="نقدی" stackId="a" fill="#22c55e" />
                <Bar dataKey="کارتی" stackId="a" fill="#3b82f6" />
                <Bar dataKey="چک‌های وصولی" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="فروش" stackId="a" fill="#14b8a6" />
                <Bar dataKey="متفرقه" stackId="a" fill="#f59e0b" />
                <Bar dataKey="هزینه‌ها" stackId="b" fill="#ef4444" />
                <Bar dataKey="حقوق" stackId="b" fill="#ec4899" />
                <Bar dataKey="خرید" stackId="b" fill="#a855f7" />
                <Bar dataKey="پرداخت‌های_متفرقه" stackId="b" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              اطلاعاتی برای نمایش وجود ندارد
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production snapshot from overall report */}
      {overall && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">خلاصه تولید</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">شالی وارده</p>
                <p className="text-xl font-bold">
                  {toPersianNumber(overall.total_input_weight)} کیلو
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کیسه وارده</p>
                <p className="text-xl font-bold">{toPersianNumber(overall.total_input_bags)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">خروجی تبدیل</p>
                <p className="text-xl font-bold">
                  {toPersianNumber(overall.total_output_weight)} کیلو
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کارمزد دریافتی</p>
                <p className="text-xl font-bold">{toPersianCurrency(overall.total_karmozd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
