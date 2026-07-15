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
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { RiceTypeSelect } from "@/components/shared/RiceTypeSelect";
import { useOutputs, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Output } from "@/types";

export default function OutputsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useOutputs({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.OUTPUTS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.OUTPUTS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.OUTPUTS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Output | null>(null);
  const [formData, setFormData] = useState({
    process: "",
    rice_type: "",
    weight: "",
    output_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const resetForm = () => {
    setFormData({
      process: "",
      rice_type: "",
      weight: "",
      output_date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setSelectedItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: Output) => {
    setSelectedItem(item);
    setFormData({
      process: String(item.process_id),
      rice_type: item.rice_type_name || "",
      weight: String(item.weight),
      output_date: item.output_date?.split("T")[0] || "",
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: Output) => {
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
      process_id: parseInt(formData.process),
      weight: parseFloat(formData.weight),
      output_date: formData.output_date,
      description: formData.description || undefined,
    };

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

  const columns: Column<Output>[] = [
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "process_info", label: "فرآیند", render: (item) => item.process_info || `#${item.process_id}` },
    { key: "weight", label: "وزن (کیلو)", render: (item) => toPersianNumber(item.weight) },
    { key: "rice_type_name", label: "نوع محصول", render: (item) => item.rice_type_name || "-" },
    { key: "output_date", label: "تاریخ", render: (item) => formatPersianDate(item.output_date) },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="خروجی تبدیل"
      description="مدیریت خروجی‌های حاصل از فرآیند تبدیل"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          خروجی جدید
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        searchable
        searchPlaceholder="جستجوی خروجی..."
        onSearch={(term) => { setSearch(term); setPage(1); }}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="خروجی‌ای ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش خروجی" : "خروجی جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="شناسه فرآیند" required>
              <Input
                type="number"
                value={formData.process}
                onChange={(e) => setFormData({ ...formData, process: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نوع محصول" required>
                <RiceTypeSelect
                  value={formData.rice_type}
                  onChange={(v) => setFormData({ ...formData, rice_type: v })}
                />
              </FormField>
              <FormField label="وزن (کیلو)" required>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="تاریخ خروجی">
              <Input
                type="date"
                value={formData.output_date}
                onChange={(e) => setFormData({ ...formData, output_date: e.target.value })}
              />
            </FormField>
            <FormField label="توضیحات">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
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
