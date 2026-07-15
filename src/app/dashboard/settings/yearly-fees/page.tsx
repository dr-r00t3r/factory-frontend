"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { useYearlyFees, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { YearlyFee } from "@/types";

export default function YearlyFeesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useYearlyFees();
  const createMutation = useCreateMutation(API_ENDPOINTS.YEARLY_FEES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.YEARLY_FEES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.YEARLY_FEES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<YearlyFee | null>(null);
  const [formData, setFormData] = useState({ year: String(new Date().getFullYear()), fee_per_bag: "", weight_farmer: "", fee_trader_per_bag: "", weight_trader: "", bag_weight_kg: "" });
  const resetForm = () => { setFormData({ year: String(new Date().getFullYear()), fee_per_bag: "", weight_farmer: "", fee_trader_per_bag: "", weight_trader: "", bag_weight_kg: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: YearlyFee) => {
    setSelectedItem(item);
    setFormData({
      year: String(item.year),
      fee_per_bag: String(item.fee_per_bag ?? 0),
      weight_farmer: String(item.weight_farmer ?? 0),
      fee_trader_per_bag: String(item.fee_trader_per_bag ?? 0),
      weight_trader: String(item.weight_trader ?? 0),
      bag_weight_kg: String(item.bag_weight_kg ?? 0),
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: YearlyFee) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      year: parseInt(formData.year),
      fee_per_bag: parseInt(formData.fee_per_bag, 10),
      weight_farmer: parseInt(formData.weight_farmer, 10),
      fee_trader_per_bag: parseInt(formData.fee_trader_per_bag, 10),
      weight_trader: parseInt(formData.weight_trader, 10),
      bag_weight_kg: parseFloat(formData.bag_weight_kg),
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<YearlyFee>[] = [
    { key: "year", label: "سال", render: (item) => toPersianNumber(item.year) },
    { key: "fee_per_bag", label: "نرخ هر کیسه", render: (item) => toPersianCurrency(item.fee_per_bag ?? 0) },
    { key: "bag_weight_kg", label: "وزن هر کیسه", render: (item) => toPersianNumber(item.bag_weight_kg ?? 0) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="نرخ‌های سالانه" description="مدیریت نرخ‌های سالانه انواع شالی"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />نرخ جدید</Button>}
    >
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} onEdit={openEdit} onDelete={handleDelete} emptyMessage="نرخی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش نرخ" : "نرخ جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="سال" required><Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></FormField>
              <FormField label="وزن هر کیسه (کیلو)" required><Input type="number" value={formData.bag_weight_kg} onChange={(e) => setFormData({ ...formData, bag_weight_kg: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نرخ هر کیسه" required><Input type="number" value={formData.fee_per_bag} onChange={(e) => setFormData({ ...formData, fee_per_bag: e.target.value })} /></FormField>
              <FormField label="وزن کشاورزی" required><Input type="number" value={formData.weight_farmer} onChange={(e) => setFormData({ ...formData, weight_farmer: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نرخ تاجر هر کیسه" required><Input type="number" value={formData.fee_trader_per_bag} onChange={(e) => setFormData({ ...formData, fee_trader_per_bag: e.target.value })} /></FormField>
              <FormField label="وزن تاجر" required><Input type="number" value={formData.weight_trader} onChange={(e) => setFormData({ ...formData, weight_trader: e.target.value })} /></FormField>
            </div>
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
