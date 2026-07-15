"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDebtors } from "@/hooks";
import { toPersianCurrency, formatPersianDate } from "@/lib/utils";
import type { Debtor } from "@/types";

export default function DebtorsPage() {
  const { data: debtors, isLoading } = useDebtors();

  const columns: Column<Debtor>[] = [
    { key: "customer_name", label: "مشتری" },
    { key: "phone", label: "تلفن", render: (item) => item.phone || "-" },
    { key: "total_debt", label: "مجموع بدهی", render: (item) => toPersianCurrency(item.total_debt) },
    { key: "last_transaction", label: "آخرین تراکنش", render: (item) => item.last_transaction ? formatPersianDate(item.last_transaction) : "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  const totalDebt = debtors?.reduce((s, d) => s + (d.total_debt ?? d.debt_amount ?? 0), 0) || 0;

  return (
    <PageShell title="بدهکاران" description="لیست بدهکاران و میزان بدهی">
      <div className="rounded-md border bg-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">مجموع بدهی‌ها:</span>
          <span className="text-xl font-bold text-destructive">{toPersianCurrency(totalDebt)}</span>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={debtors}
        totalCount={debtors?.length || 0}
        searchable
        searchPlaceholder="جستجوی بدهکار..."
        emptyMessage="بدهکاری یافت نشد"
      />
    </PageShell>
  );
}
