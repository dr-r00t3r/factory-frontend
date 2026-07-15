"use client";

import React from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { CustomerTypeLabels } from "@/lib/constants";
import { formatPersianDate } from "@/lib/utils";
import type { Customer } from "@/types";

interface CustomerTableProps {
  customers?: Customer[];
  onSelect?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

export const customerColumns: Column<Customer>[] = [
  {
    key: "name",
    label: "نام",
    render: (item) => <span className="font-medium">{item.name}</span>,
  },
  {
    key: "phone",
    label: "تلفن",
    render: (item) => item.phone || "-",
  },
  {
    key: "customer_type",
    label: "نوع",
    render: (item) => {
      const up = (item.customer_type || "").toUpperCase();
      const isFarmer = up === "FARMER" || up === "کشاورز";
      const label = isFarmer
        ? CustomerTypeLabels.FARMER
        : up === "TRADER" || up === "تاجر"
          ? CustomerTypeLabels.TRADER
          : item.customer_type || "-";
      return (
        <Badge variant={isFarmer ? "default" : "secondary"}>
          {label}
        </Badge>
      );
    },
  },
  {
    key: "national_code",
    label: "کد ملی",
    render: (item) => item.national_code || "-",
  },
  {
    key: "created_at",
    label: "تاریخ ثبت",
    render: (item) => formatPersianDate(item.created_at),
  },
];

export function CustomerTable({
  customers,
  onSelect,
  onEdit,
  onDelete,
  isLoading,
  totalCount,
  page,
  onPageChange,
}: CustomerTableProps) {
  return (
    <DataTable<Customer>
      columns={customerColumns}
      data={customers}
      isLoading={isLoading}
      totalCount={totalCount}
      page={page}
      pageSize={10}
      onPageChange={onPageChange}
      onEdit={onEdit}
      onDelete={onDelete}
      searchable
      searchPlaceholder="جستجوی مشتری..."
    />
  );
}
