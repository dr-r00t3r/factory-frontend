"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber } from "@/lib/utils";
import { Package, Search } from "lucide-react";
import type { Customer, CustomerInventory } from "@/types";

function useCustomerInventory(customerId?: number) {
  return useQuery({
    queryKey: [API_ENDPOINTS.INVENTORY, "customer", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await apiClient.get<CustomerInventory[]>(
        `${API_ENDPOINTS.INVENTORY}?customer=${customerId}`
      );
      return data;
    },
    enabled: !!customerId,
  });
}

export default function CustomerInventoryPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { data: inventory, isLoading } = useCustomerInventory(selectedCustomer?.id);

  const columns: Column<CustomerInventory>[] = [
    { key: "product_type_display", label: "نوع محصول", render: (item) => item.product_type_display || item.product_type },
    { key: "weight", label: "وزن (کیلو)", render: (item) => toPersianNumber(item.weight) },
  ];

  return (
    <PageShell title="انبار مشتریان" description="مشاهده موجودی انبار به تفکیک مشتری">
      <Card>
        <CardContent className="p-4">
          <FormField label="جستجوی مشتری">
            <CustomerSearch
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="نام مشتری را وارد کنید..."
            />
          </FormField>
        </CardContent>
      </Card>

      {selectedCustomer ? (
        isLoading ? (
          <LoadingSpinner className="min-h-[30vh]" />
        ) : inventory && inventory.length > 0 ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">موجودی {selectedCustomer.name}:</span>
                <span className="text-lg font-bold">
                  {toPersianNumber(inventory.reduce((s, i) => s + Number(i.weight ?? 0), 0))} کیلو
                </span>
              </div>
              <DataTable columns={columns} data={inventory} emptyMessage="موجودی‌ای یافت نشد" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              این مشتری موجودی ندارد
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            برای مشاهده موجودی، مشتری را جستجو کنید
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
