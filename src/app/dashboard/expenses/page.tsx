"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
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
import { useExpenses, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Expense } from "@/types";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useExpenses({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.EXPENSES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.EXPENSES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.EXPENSES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    title: "", amount: "", category: "", expense_date: new Date().toISOString().split("T")[0], description: "",
  });
  const resetForm = () => { setFormData({ title: "", amount: "", category: "", expense_date: new Date().toISOString().split("T")[0], description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: Expense) => {
    setSelectedItem(item);
    setFormData({ title: item.title || "", amount: String(item.amount), category: item.category || "", expense_date: item.expense_date?.split("T")[0] || "", description: item.description || "" });
    setDialogOpen(true);
  };
  const handleDelete = (item: Expense) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      title: formData.title, amount: parseFloat(formData.amount),
      category: formData.category || undefined, expense_date: formData.expense_date,
      description: formData.description || undefined,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const totalAmount = data?.results?.reduce((sum, item) => sum + item.amount, 0) || 0;

  const columns: Column<Expense>[] = [
    { key: "title", label: "عنوان" },
    { key: "amount", label: "مبلغ", render: (item) => toPersianCurrency(item.amount) },
    { key: "category", label: "دسته‌بندی", render: (item) => item.category || "-" },
    { key: "expense_date", label: "تاریخ", render: (item) => formatPersianDate(item.expense_date) },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="هزینه‌ها" description="مدیریت هزینه‌های کارخانه"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />هزینه جدید</Button>}
    >
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="font-medium">مجموع هزینه‌ها:</span>
          <span className="text-xl font-bold text-destructive">{toPersianCurrency(totalAmount)}</span>
        </CardContent>
      </Card>
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی هزینه..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="هزینه‌ای ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش هزینه" : "هزینه جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="عنوان" required><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
              <FormField label="دسته‌بندی">
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="دسته‌بندی" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">آب</SelectItem>
                    <SelectItem value="electricity">برق</SelectItem>
                    <SelectItem value="gas">گاز</SelectItem>
                    <SelectItem value="rent">اجاره</SelectItem>
                    <SelectItem value="repair">تعمیرات</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="تاریخ هزینه"><Input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} /></FormField>
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
