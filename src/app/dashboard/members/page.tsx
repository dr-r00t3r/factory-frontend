"use client";

import React, { useState } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMembers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Member } from "@/types";

export default function MembersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMembers({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.MEMBERS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.MEMBERS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.MEMBERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: "", role: "", phone: "", salary: "", is_active: true, joined_date: new Date().toISOString().split("T")[0],
  });
  const resetForm = () => { setFormData({ name: "", role: "", phone: "", salary: "", is_active: true, joined_date: new Date().toISOString().split("T")[0] }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: Member) => {
    setSelectedItem(item);
    setFormData({ name: item.name || "", role: item.role || "", phone: item.phone || "", salary: item.salary ? String(item.salary) : "", is_active: item.is_active, joined_date: item.joined_date?.split("T")[0] || "" });
    setDialogOpen(true);
  };
  const handleDelete = (item: Member) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      name: formData.name, role: formData.role, phone: formData.phone || undefined,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
      is_active: formData.is_active, joined_date: formData.joined_date,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<Member>[] = [
    { key: "name", label: "نام" },
    { key: "role", label: "سمت" },
    { key: "phone", label: "تلفن", render: (item) => item.phone || "-" },
    { key: "salary", label: "حقوق", render: (item) => item.salary ? toPersianCurrency(item.salary) : "-" },
    { key: "is_active", label: "فعال", render: (item) => <Badge variant={item.is_active ? "success" : "secondary"}>{item.is_active ? "فعال" : "غیرفعال"}</Badge> },
    { key: "joined_date", label: "تاریخ عضویت", render: (item) => formatPersianDate(item.joined_date) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="پرسنل" description="مدیریت پرسنل کارخانه"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />پرسنل جدید</Button>}
    >
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی پرسنل..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="پرسنلی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش پرسنل" : "پرسنل جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نام" required><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></FormField>
              <FormField label="سمت" required><Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="تلفن"><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></FormField>
              <FormField label="حقوق"><Input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} /></FormField>
            </div>
            <FormField label="تاریخ عضویت"><Input type="date" value={formData.joined_date} onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })} /></FormField>
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
              <Label>فعال</Label>
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
