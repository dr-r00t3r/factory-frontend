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
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getTodayJalaliIso } from "@/lib/jalali";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLoans, useMembers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Loan } from "@/types";

export default function LoansPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useLoans({ page, search, page_size: 10 });
  const { data: members } = useMembers({ page_size: 200 });
  const createMutation = useCreateMutation(API_ENDPOINTS.LOANS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.LOANS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.LOANS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    member: "", amount: "", interest_rate: "", issue_date: getTodayJalaliIso(),
    due_date: "", status: "ACTIVE", description: "",
  });
  const resetForm = () => { setFormData({ member: "", amount: "", interest_rate: "", issue_date: getTodayJalaliIso(), due_date: "", status: "ACTIVE", description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: Loan) => {
    setSelectedItem(item);
    setFormData({
      member: item.member ? String(item.member) : "", amount: String(item.amount),
      interest_rate: item.interest_rate ? String(item.interest_rate) : "",
      issue_date: item.issue_date?.split("T")[0] || "", due_date: item.due_date?.split("T")[0] || "",
      status: item.status || "", description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: Loan) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      amount: parseFloat(formData.amount), issue_date: formData.issue_date,
      status: formData.status, description: formData.description || undefined,
    };
    if (formData.member) payload.member = parseInt(formData.member);
    if (formData.interest_rate) payload.interest_rate = parseFloat(formData.interest_rate);
    if (formData.due_date) payload.due_date = formData.due_date;
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<Loan>[] = [
    { key: "member_name", label: "پرسنل", render: (item) => item.member_name || "-" },
    { key: "amount", label: "مبلغ", render: (item) => toPersianCurrency(item.amount) },
    {
      key: "status",
      label: "وضعیت",
      render: (item) => <Badge variant={item.status === "ACTIVE" ? "warning" : "success"}>{item.status === "ACTIVE" ? "فعال" : "پرداخت شده"}</Badge>,
    },
    { key: "issue_date", label: "تاریخ", render: (item) => formatPersianDate(item.issue_date) },
    { key: "due_date", label: "سررسید", render: (item) => item.due_date ? formatPersianDate(item.due_date) : "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="تنخواه" description="مدیریت تنخواه و وام‌ها"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />تنخواه جدید</Button>}
    >
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجو..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="تنخواهی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش تنخواه" : "تنخواه جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="پرسنل">
              <Select value={formData.member} onValueChange={(v) => setFormData({ ...formData, member: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب پرسنل (اختیاری)" /></SelectTrigger>
                <SelectContent>
                  {members?.results?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
              <FormField label="نرخ سود (%)"><Input type="number" value={formData.interest_rate} onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PersianDatePicker label="تاریخ" value={formData.issue_date} onChange={(v) => setFormData({ ...formData, issue_date: v })} />
              <PersianDatePicker label="سررسید" value={formData.due_date} onChange={(v) => setFormData({ ...formData, due_date: v })} />
            </div>
            <FormField label="وضعیت" required>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">فعال</SelectItem>
                  <SelectItem value="PAID">پرداخت شده</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
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
