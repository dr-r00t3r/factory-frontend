"use client";

import React from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { toPersianNumber, toPersianCurrency, formatPersianDateTime } from "@/lib/utils";
import type { Inventory } from "@/types";

interface InventoryTableProps {
  inventory?: Inventory[];
  isLoading?: boolean;
}

const columns: Column<Inventory>[] = [
  {
    key: "product_type_display",
    label: "محصول",
    render: (item) => (
      <span className="font-medium">
        {item.product_type_display || item.product_type}
      </span>
    ),
  },
  {
    key: "weight",
    label: "وزن کل (کیلوگرم)",
    render: (item) => toPersianNumber(item.weight ?? item.total_weight),
  },
  {
    key: "total_amount",
    label: "ارزش کل",
    render: (item) => toPersianCurrency(item.total_amount ?? item.total_value),
  },
  {
    key: "last_updated",
    label: "آخرین به‌روزرسانی",
    render: (item) => formatPersianDateTime(item.last_updated),
  },
];

export function InventoryTable({ inventory, isLoading }: InventoryTableProps) {
  return (
    <DataTable<Inventory>
      columns={columns}
      data={inventory}
      isLoading={isLoading}
      emptyMessage="محصولی در انبار موجود نیست"
    />
  );
}
