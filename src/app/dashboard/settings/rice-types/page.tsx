"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { RiceType } from "@/types";

function useRiceTypes() {
  return useQuery({
    queryKey: [API_ENDPOINTS.RICE_TYPES],
    queryFn: async () => { const { data } = await apiClient.get<RiceType[]>(API_ENDPOINTS.RICE_TYPES); return data; },
  });
}

function useCreateRiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const r = await apiClient.post(API_ENDPOINTS.RICE_TYPES, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.RICE_TYPES] }),
  });
}

function useUpdateRiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => { const r = await apiClient.put(`${API_ENDPOINTS.RICE_TYPES}${id}/`, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.RICE_TYPES] }),
  });
}

function useDeleteRiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`${API_ENDPOINTS.RICE_TYPES}${id}/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.RICE_TYPES] }),
  });
}

export default function RiceTypesPage() {
  const { data, isLoading } = useRiceTypes();
  const createMutation = useCreateRiceType();
  const updateMutation = useUpdateRiceType();
  const deleteMutation = useDeleteRiceType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RiceType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const resetForm = () => { setFormData({ name: "", description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: RiceType) => { setSelectedItem(item); setFormData({ name: item.name, description: "" }); setDialogOpen(true); };
  const handleDelete = (item: RiceType) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = { name: formData.name };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<RiceType>[] = [
    { key: "name", label: "نام" },
    { key: "created_at", label: "تاریخ ثبت", render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString("fa-IR") : "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="انواع شالی" description="مدیریت انواع شالی"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />نوع جدید</Button>}
    >
      <DataTable columns={columns} data={data} totalCount={data?.length || 0} onEdit={openEdit} onDelete={handleDelete} emptyMessage="نوع شالی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش نوع شالی" : "نوع شالی جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="نام" required><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></FormField>
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
