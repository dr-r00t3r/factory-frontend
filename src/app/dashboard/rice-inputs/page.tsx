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
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { RiceTypeSelect } from "@/components/shared/RiceTypeSelect";
import { useRiceInputs, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { RiceInput, Customer } from "@/types";

export default function RiceInputsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useRiceInputs({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.RICE_INPUTS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.RICE_INPUTS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.RICE_INPUTS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RiceInput | null>(null);
  const [formData, setFormData] = useState({
    customer: null as Customer | null,
    rice_type: "",
    weight: "",
    bag_count: "",
    moisture_percentage: "",
    impurity_percentage: "",
    description: "",
    input_date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setFormData({
      customer: null,
      rice_type: "",
      weight: "",
      bag_count: "",
      moisture_percentage: "",
      impurity_percentage: "",
      description: "",
      input_date: new Date().toISOString().split("T")[0],
    });
    setSelectedItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: RiceInput) => {
    setSelectedItem(item);
    setFormData({
      customer: item.customer_name ? { id: item.customer_id, name: item.customer_name, phone: "", customer_type: "farmer" } : null,
      rice_type: String(item.rice_type_id || ""),
      weight: String(item.weight_kg),
      bag_count: String(item.bag_count || ""),
      moisture_percentage: "",
      impurity_percentage: "",
      description: item.description || "",
      input_date: item.input_date?.split("T")[0] || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: RiceInput) => {
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
      rice_type_id: formData.rice_type ? parseInt(formData.rice_type) : undefined,
      weight_kg: parseInt(formData.weight),
      bag_count: formData.bag_count ? parseInt(formData.bag_count) : undefined,
      input_date: formData.input_date,
      description: formData.description || undefined,
    };
    if (formData.customer) payload.customer_id = formData.customer.id;

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

  const columns: Column<RiceInput>[] = [
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "input_date", label: "تاریخ", render: (item) => formatPersianDate(item.input_date) },
    { key: "weight_kg", label: "وزن (کیلو)", render: (item) => toPersianNumber(item.weight_kg) },
    { key: "rice_type_name", label: "نوع شالی", render: (item) => item.rice_type_name || "-" },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="ورودی شالی"
      description="مدیریت ورودی‌های شالی به کارخانه"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          ورودی جدید
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
        searchPlaceholder="جستجوی ورودی..."
        onSearch={(term) => { setSearch(term); setPage(1); }}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="ورودی‌ای ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش ورودی" : "ورودی جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری" required>
              <CustomerSearch
                value={formData.customer}
                onChange={(c) => setFormData({ ...formData, customer: c })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نوع شالی" required>
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
            <FormField label="تعداد کیسه">
              <Input
                type="number"
                value={formData.bag_count}
                onChange={(e) => setFormData({ ...formData, bag_count: e.target.value })}
              />
            </FormField>
            <FormField label="تاریخ">
              <Input
                type="date"
                value={formData.input_date}
                onChange={(e) => setFormData({ ...formData, input_date: e.target.value })}
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
