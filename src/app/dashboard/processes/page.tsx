"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProcesses, useCustomers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Process } from "@/types";

const statusLabels: Record<string, { label: string; variant: "warning" | "info" | "success" }> = {
  PENDING: { label: "در انتظار", variant: "warning" },
  IN_PROGRESS: { label: "در حال انجام", variant: "info" },
  COMPLETED: { label: "تکمیل شده", variant: "success" },
};

export default function ProcessesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useProcesses({ page, search, page_size: 10 });
  const { data: customers } = useCustomers({ page_size: 200 });
  const createMutation = useCreateMutation(API_ENDPOINTS.PROCESSES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.PROCESSES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.PROCESSES);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Process | null>(null);
  const [formData, setFormData] = useState({
    rice_input: "",
    kiln_number: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "PENDING",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      rice_input: "",
      kiln_number: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      status: "PENDING",
      description: "",
    });
    setSelectedItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: Process) => {
    setSelectedItem(item);
    setFormData({
      rice_input: String(item.rice_input_id),
      kiln_number: item.kiln_number ? String(item.kiln_number) : "",
      start_date: item.start_date?.split("T")[0] || "",
      end_date: item.end_date?.split("T")[0] || "",
      status: item.status || "",
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: Process) => {
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
      rice_input_id: parseInt(formData.rice_input),
      status: formData.status,
      start_date: formData.start_date,
      description: formData.description || undefined,
    };
    if (formData.kiln_number) payload.kiln_number = parseInt(formData.kiln_number);
    if (formData.end_date) payload.end_date = formData.end_date;

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

  const columns: Column<Process>[] = [
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "rice_type_name", label: "نوع", render: (item) => item.rice_type_name || "-" },
    { key: "input_weight", label: "وزن ورودی", render: (item) => toPersianNumber(item.input_weight) },
    { key: "kiln_number", label: "شماره فر", render: (item) => item.kiln_number ? toPersianNumber(item.kiln_number) : "-" },
    {
      key: "status",
      label: "وضعیت",
      render: (item) => {
        const statusKey = item.status ?? "PENDING";
        const s = statusLabels[statusKey] || { label: statusKey, variant: "default" as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    { key: "start_date", label: "تاریخ شروع", render: (item) => formatPersianDate(item.start_date) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="فرآیند فر"
      description="مدیریت فرآیندهای تبدیل شالی"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          فرآیند جدید
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
        searchPlaceholder="جستجوی فرآیند..."
        onSearch={(term) => { setSearch(term); setPage(1); }}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="فرآیندی ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش فرآیند" : "فرآیند جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="شناسه ورودی شالی" required>
              <Input
                type="number"
                value={formData.rice_input}
                onChange={(e) => setFormData({ ...formData, rice_input: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="شماره فر">
                <Input
                  type="number"
                  value={formData.kiln_number}
                  onChange={(e) => setFormData({ ...formData, kiln_number: e.target.value })}
                />
              </FormField>
              <FormField label="وضعیت" required>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">در انتظار</SelectItem>
                    <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                    <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="تاریخ شروع">
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </FormField>
              <FormField label="تاریخ پایان">
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </FormField>
            </div>
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
