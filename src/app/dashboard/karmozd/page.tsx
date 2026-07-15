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
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useMiscPayments, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { MiscPayment } from "@/types";

export default function KarmozdPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMiscPayments({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.MISC_PAYMENTS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.MISC_PAYMENTS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.MISC_PAYMENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MiscPayment | null>(null);
  const [formData, setFormData] = useState({
    title: "", amount: "", payment_date: new Date().toISOString().split("T")[0], description: "",
  });
  const resetForm = () => { setFormData({ title: "", amount: "", payment_date: new Date().toISOString().split("T")[0], description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: MiscPayment) => {
    setSelectedItem(item);
    setFormData({ title: item.title || "", amount: String(item.amount), payment_date: item.payment_date?.split("T")[0] || "", description: item.description || "" });
    setDialogOpen(true);
  };
  const handleDelete = (item: MiscPayment) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      title: formData.title, amount: parseFloat(formData.amount),
      payment_date: formData.payment_date, description: formData.description || undefined,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const totalAmount = data?.results?.reduce((sum, item) => sum + item.amount, 0) || 0;

  const columns: Column<MiscPayment>[] = [
    { key: "title", label: "عنوان" },
    { key: "amount", label: "مبلغ", render: (item) => toPersianCurrency(item.amount) },
    { key: "payment_date", label: "تاریخ", render: (item) => formatPersianDate(item.payment_date) },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="کارمزد" description="مدیریت پرداخت‌های کارمزد"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />پرداخت جدید</Button>}
    >
      <div className="rounded-md border bg-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">مجموع کارمزدها:</span>
          <span className="text-xl font-bold">{toPersianCurrency(totalAmount)}</span>
        </div>
      </div>
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی کارمزد..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="کارمزدی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش کارمزد" : "پرداخت کارمزد جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="عنوان" required><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></FormField>
            <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
            <FormField label="تاریخ پرداخت"><Input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} /></FormField>
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
