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
import { useProcessLines, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { ProcessLine } from "@/types";

export default function ProcessLinesSettingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProcessLines({ page, page_size: 20 });
  const createMutation = useCreateMutation(API_ENDPOINTS.PROCESS_LINES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.PROCESS_LINES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.PROCESS_LINES);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcessLine | null>(null);
  const [formData, setFormData] = useState({
    process_number: "",
    capacity_bag_count: "",
    hours_work: "",
    fill_percentage_required: "95",
    description: "",
  });

  const resetForm = () => {
    setFormData({ process_number: "", capacity_bag_count: "", hours_work: "", fill_percentage_required: "95", description: "" });
    setSelectedItem(null);
  };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: ProcessLine) => {
    setSelectedItem(item);
    setFormData({
      process_number: String(item.process_number),
      capacity_bag_count: String(item.capacity_bag_count),
      hours_work: item.hours_work != null ? String(item.hours_work) : "",
      fill_percentage_required: String(item.fill_percentage_required),
      description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: ProcessLine) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      process_number: parseInt(formData.process_number),
      capacity_bag_count: parseFloat(formData.capacity_bag_count),
      hours_work: formData.hours_work ? parseFloat(formData.hours_work) : undefined,
      fill_percentage_required: parseFloat(formData.fill_percentage_required),
      description: formData.description || undefined,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<ProcessLine>[] = [
    { key: "process_number", label: "شماره خط", render: (item) => toPersianNumber(item.process_number) },
    { key: "capacity_bag_count", label: "ظرفیت کیسه", render: (item) => toPersianNumber(item.capacity_bag_count) },
    { key: "hours_work", label: "ساعت کار", render: (item) => item.hours_work != null ? toPersianNumber(item.hours_work) : "-" },
    { key: "fill_percentage_required", label: "درصد پر شدن", render: (item) => `${toPersianNumber(item.fill_percentage_required)}٪` },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
    { key: "created_at", label: "تاریخ ایجاد", render: (item) => formatPersianDate(item.created_at) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="خطوط فرآیند" description="مدیریت خطوط فرآیند تولید (تعریف ثابت)"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />خط جدید</Button>}
    >
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} onEdit={openEdit} onDelete={handleDelete} emptyMessage="خط فرآیندی ثبت نشده است" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش خط فرآیند" : "خط فرآیند جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="شماره خط" required>
                <Input type="number" value={formData.process_number} onChange={(e) => setFormData({ ...formData, process_number: e.target.value })} />
              </FormField>
              <FormField label="ظرفیت کیسه" required>
                <Input type="number" value={formData.capacity_bag_count} onChange={(e) => setFormData({ ...formData, capacity_bag_count: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="ساعت کار">
                <Input type="number" value={formData.hours_work} onChange={(e) => setFormData({ ...formData, hours_work: e.target.value })} />
              </FormField>
              <FormField label="درصد پر شدن مورد نیاز">
                <Input type="number" value={formData.fill_percentage_required} onChange={(e) => setFormData({ ...formData, fill_percentage_required: e.target.value })} />
              </FormField>
            </div>
            <FormField label="توضیحات">
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </FormField>
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
