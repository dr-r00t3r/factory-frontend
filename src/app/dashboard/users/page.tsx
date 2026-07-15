"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus, Shield, ShieldOff } from "lucide-react";
import type { User } from "@/types";

function useUsers() {
  return useQuery({
    queryKey: [API_ENDPOINTS.USERS],
    queryFn: async () => { const { data } = await apiClient.get(API_ENDPOINTS.USERS); return data as User[]; },
  });
}

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const r = await apiClient.post(API_ENDPOINTS.USERS, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] }),
  });
}

function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => { const r = await apiClient.put(`${API_ENDPOINTS.USERS}${id}/`, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] }),
  });
}

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`${API_ENDPOINTS.USERS}${id}/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] }),
  });
}

export default function UsersPage() {
  const { data, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "", email: "", first_name: "", last_name: "", password: "", is_active: true, is_staff: false,
  });
  const resetForm = () => { setFormData({ username: "", email: "", first_name: "", last_name: "", password: "", is_active: true, is_staff: false }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: User) => {
    setSelectedItem(item);
    setFormData({ username: item.username, email: item.email || "", first_name: item.first_name || "", last_name: item.last_name || "", password: "", is_active: item.is_active, is_staff: item.is_staff ?? false });
    setDialogOpen(true);
  };
  const handleDelete = (item: User) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      username: formData.username, email: formData.email || undefined,
      first_name: formData.first_name, last_name: formData.last_name,
      is_active: formData.is_active, is_staff: formData.is_staff,
    };
    if (formData.password) payload.password = formData.password;
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<User>[] = [
    { key: "username", label: "نام کاربری" },
    { key: "first_name", label: "نام", render: (item) => `${item.first_name} ${item.last_name}` },
    { key: "email", label: "ایمیل", render: (item) => item.email || "-" },
    {
      key: "is_staff",
      label: "دسترسی",
      render: (item) => item.is_staff ? <Badge variant="info"><Shield className="h-3 w-3 ml-1" />ادمین</Badge> : <Badge variant="secondary"><ShieldOff className="h-3 w-3 ml-1" />کاربر</Badge>,
    },
    {
      key: "is_active",
      label: "وضعیت",
      render: (item) => <Badge variant={item.is_active ? "success" : "destructive"}>{item.is_active ? "فعال" : "غیرفعال"}</Badge>,
    },
    { key: "date_joined", label: "تاریخ عضویت", render: (item) => formatPersianDate(item.date_joined) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="کاربران" description="مدیریت کاربران سیستم"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />کاربر جدید</Button>}
    >
      <DataTable columns={columns} data={data} totalCount={data?.length || 0} searchable searchPlaceholder="جستجوی کاربر..." onEdit={openEdit} onDelete={handleDelete} emptyMessage="کاربری یافت نشد" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش کاربر" : "کاربر جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نام کاربری" required><Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></FormField>
              <FormField label="ایمیل"><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نام"><Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} /></FormField>
              <FormField label="نام خانوادگی"><Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /></FormField>
            </div>
            <FormField label={selectedItem ? "رمز عبور (خالی برای عدم تغییر)" : "رمز عبور"} required={!selectedItem}>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </FormField>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label>فعال</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_staff} onCheckedChange={(v) => setFormData({ ...formData, is_staff: v })} />
                <Label>ادمین</Label>
              </div>
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
