"use client";

import React from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { toPersianCurrency, formatPersianDate } from "@/lib/utils";
import type { CustomerPayment } from "@/types";

interface PaymentTableProps {
  payments?: CustomerPayment[];
  showCustomer?: boolean;
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function PaymentTable({
  payments,
  showCustomer = true,
  isLoading,
  totalCount,
  page,
  onPageChange,
}: PaymentTableProps) {
  const columns: Column<CustomerPayment>[] = [
    ...(showCustomer
      ? [
          {
            key: "customer_name" as string,
            label: "مشتری",
            render: (item: CustomerPayment) => (
              <span className="font-medium">
                {item.customer_name || "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "amount",
      label: "مبلغ",
      render: (item) => (
        <span className="font-medium text-green-600">
          {toPersianCurrency(item.total_paid)}
        </span>
      ),
    },
    {
      key: "payment_date",
      label: "تاریخ",
      render: (item) => formatPersianDate(item.payment_date),
    },
    {
      key: "description",
      label: "توضیحات",
      render: (item) => item.description || "-",
    },
  ];

  return (
    <DataTable<CustomerPayment>
      columns={columns}
      data={payments}
      isLoading={isLoading}
      totalCount={totalCount}
      page={page}
      pageSize={10}
      onPageChange={onPageChange}
      emptyMessage="پرداختی یافت نشد"
    />
  );
}
