"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getTodayJalaliIso } from "@/lib/jalali";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDailyPrices,
  useRiceTypes,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { DailyPrice } from "@/types";

const PRODUCT_TYPE_OPTIONS = [
  { value: "SABOS_NARM", label: "سبوس نرم" },
  { value: "SABOS_DO", label: "سبوس دو" },
  { value: "NIMDONE", label: "نیمدونه" },
  { value: "DONE", label: "دونه" },
];

const productTypeMap: Record<string, string> = Object.fromEntries(
  PRODUCT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export default function DailyPricesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDailyPrices({ page, page_size: 50 });
  const { data: riceTypesData } = useRiceTypes();
  const createMutation = useCreateMutation(API_ENDPOINTS.DAILY_PRICES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.DAILY_PRICES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.DAILY_PRICES);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DailyPrice | null>(null);

  const [productType, setProductType] = useState("");
  const [riceTypeId, setRiceTypeId] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const resetForm = () => {
    setProductType("");
    setRiceTypeId("");
    setPricePerKg("");
    setEffectiveDate(getTodayJalaliIso());
    setSelectedItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: DailyPrice) => {
    setSelectedItem(item);
    setProductType(item.product_type);
    setRiceTypeId(item.rice_type_id != null ? String(item.rice_type_id) : "");
    setPricePerKg(String(item.price_per_kg));
    setEffectiveDate(item.effective_date?.split("T")[0] || "");
    setDialogOpen(true);
  };

  const handleDelete = (item: DailyPrice) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      product_type: productType,
      price_per_kg: parseInt(pricePerKg),
      effective_date: effectiveDate,
    };
    if (riceTypeId) payload.rice_type_id = parseInt(riceTypeId);

    if (selectedItem) {
      updateMutation.mutate(
        { id: selectedItem.id, data: payload },
        { onSuccess: () => { setDialogOpen(false); resetForm(); } }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { setDialogOpen(false); resetForm(); }
      });
    }
  };

  const columns: Column<DailyPrice>[] = [
    {
      key: "product_type",
      label: "نوع محصول",
      render: (item) => productTypeMap[item.product_type] || item.product_type,
    },
    {
      key: "rice_type_name",
      label: "نوع شالی",
      render: (item) => item.rice_type_name || "پیش‌فرض (همه)",
    },
    {
      key: "price_per_kg",
      label: "نرخ (ریال/کیلو)",
      render: (item) => toPersianNumber(item.price_per_kg),
    },
    {
      key: "effective_date",
      label: "تاریخ اجرا",
      render: (item) => formatPersianDate(item.effective_date),
    },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="نرخ روزانه محصولات"
      description="مدیریت نرخ هر کیلوگرم بر اساس نوع شالی و تاریخ"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          نرخ جدید
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="نرخی ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش نرخ" : "نرخ جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="نوع محصول" required>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="نوع شالی (اختیاری - خالی = پیش‌فرض برای همه)">
              <Select value={riceTypeId} onValueChange={setRiceTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="پیش‌فرض برای همه انواع شالی" />
                </SelectTrigger>
                <SelectContent>
                  {riceTypesData?.results?.map((rt) => (
                    <SelectItem key={rt.id} value={String(rt.id)}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="نرخ هر کیلوگرم (ریال)" required>
              <Input
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
              />
            </FormField>

            <PersianDatePicker
              label="تاریخ اجرا"
              value={effectiveDate}
              onChange={setEffectiveDate}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedItem ? "ویرایش" : "ثبت"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageShell>
  );
}
