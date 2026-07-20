"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getTodayJalaliIso } from "@/lib/jalali";
import { useSales, useInventory, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS, ProductType } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus, Package } from "lucide-react";
import type { Sale, Customer } from "@/types";

const productType = ProductType.NIMDONE;
const productLabel = "نیمدونه";

export default function SalesNimdonePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSales(productType, { page, search, page_size: 10 });
  const { data: inventory } = useInventory();
  const createMutation = useCreateMutation(API_ENDPOINTS.SALES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.SALES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.SALES);
  const currentInventory = inventory?.find((i) => i.product_type === productType);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    customer: null as Customer | null,
    weight: "",
    price_per_unit: "",
    sale_date: getTodayJalaliIso(),
    description: "",
  });
  const totalAmount = parseFloat(formData.weight || "0") * parseFloat(formData.price_per_unit || "0");

  const resetForm = () => {
    setFormData({ customer: null, weight: "", price_per_unit: "", sale_date: getTodayJalaliIso(), description: "" });
    setSelectedItem(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: Sale) => {
    setSelectedItem(item);
    setFormData({
      customer: item.customer_name ? { id: item.customer_id!, name: item.customer_name, phone: "", customer_type: "farmer" } : null,
      weight: String(item.weight_kg), price_per_unit: String(item.unit_price),
      sale_date: item.transaction_date?.split("T")[0] || "", description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: Sale) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      product_type: productType, weight_kg: parseFloat(formData.weight),
      unit_price: parseFloat(formData.price_per_unit), total_amount: totalAmount,
      transaction_date: formData.sale_date, description: formData.description || undefined,
    };
    if (formData.customer) payload.customer_id = formData.customer.id;
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<Sale>[] = [
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "weight_kg", label: "وزن (کیلو)", render: (item) => toPersianNumber(item.weight_kg) },
    { key: "unit_price", label: "قیمت واحد", render: (item) => toPersianCurrency(item.unit_price) },
    { key: "total_amount", label: "مبلغ کل", render: (item) => toPersianCurrency(item.total_amount) },
    { key: "transaction_date", label: "تاریخ", render: (item) => formatPersianDate(item.transaction_date) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title={`فروش ${productLabel}`} description={`مدیریت فروش ${productLabel}`}
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />فروش جدید</Button>}
    >
      {currentInventory && (
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-medium">موجودی فعلی {productLabel}:</span>
          <span className="text-lg font-bold">{toPersianNumber(currentInventory.total_weight)} کیلو</span>
        </CardContent></Card>
      )}
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی فروش..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="فروشی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش فروش" : "فروش جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری"><CustomerSearch value={formData.customer} onChange={(c) => setFormData({ ...formData, customer: c })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="وزن (کیلو)" required><Input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} /></FormField>
              <FormField label="قیمت واحد (ریال)" required><Input type="number" value={formData.price_per_unit} onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })} /></FormField>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <span className="text-sm text-muted-foreground">مبلغ کل: </span>
              <span className="text-lg font-bold">{toPersianCurrency(totalAmount)}</span>
            </div>
            <PersianDatePicker label="تاریخ فروش" value={formData.sale_date} onChange={(v) => setFormData({ ...formData, sale_date: v })} />
            <FormField label="توضیحات"><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>{selectedItem ? "ویرایش" : "ثبت"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} isLoading={deleteMutation.isPending} />
    </PageShell>
  );
}
