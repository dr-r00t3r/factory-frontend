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
import { useSalaries, useMembers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { getTodayJalaliIso, getTodayJalaliParts } from "@/lib/jalali";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { Plus } from "lucide-react";
import type { Salary } from "@/types";

const months = [
  { value: 1, label: "فروردین" }, { value: 2, label: "اردیبهشت" }, { value: 3, label: "خرداد" },
  { value: 4, label: "تیر" }, { value: 5, label: "مرداد" }, { value: 6, label: "شهریور" },
  { value: 7, label: "مهر" }, { value: 8, label: "آبان" }, { value: 9, label: "آذر" },
  { value: 10, label: "دی" }, { value: 11, label: "بهمن" }, { value: 12, label: "اسفند" },
];

export default function SalariesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const { data, isLoading } = useSalaries({ page, search, member: memberFilter || undefined, page_size: 10 });
  const { data: members } = useMembers({ page_size: 200 });
  const createMutation = useCreateMutation(API_ENDPOINTS.SALARIES);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.SALARIES);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.SALARIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Salary | null>(null);
  const [formData, setFormData] = useState({
    member: "", amount: "", month: "1", year: String(getTodayJalaliParts().year),
    paid_date: getTodayJalaliIso(), description: "",
  });
  const resetForm = () => { setFormData({ member: "", amount: "", month: "1", year: String(getTodayJalaliParts().year), paid_date: getTodayJalaliIso(), description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: Salary) => {
    setSelectedItem(item);
    setFormData({
      member: String(item.member), amount: String(item.amount), month: String(item.month),
      year: String(item.year), paid_date: item.paid_date?.split("T")[0] || "", description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: Salary) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };
  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      member: parseInt(formData.member), amount: parseFloat(formData.amount),
      month: parseInt(formData.month), year: parseInt(formData.year),
      paid_date: formData.paid_date, description: formData.description || undefined,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<Salary>[] = [
    { key: "member_name", label: "پرسنل", render: (item) => item.member_name || "-" },
    { key: "amount", label: "مبلغ", render: (item) => toPersianCurrency(item.amount) },
    { key: "month", label: "ماه", render: (item) => months.find((m) => m.value === item.month)?.label || toPersianNumber(item.month) },
    { key: "year", label: "سال", render: (item) => toPersianNumber(item.year) },
    { key: "paid_date", label: "تاریخ پرداخت", render: (item) => formatPersianDate(item.paid_date) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="حقوق" description="مدیریت حقوق پرسنل"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />حقوق جدید</Button>}
    >
      <div className="flex gap-2 flex-wrap">
        <Select value={memberFilter} onValueChange={(v) => { setMemberFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="فیلتر پرسنل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پرسنل</SelectItem>
            {members?.results?.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی حقوق..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="حقوقی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش حقوق" : "حقوق جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="پرسنل" required>
              <Select value={formData.member} onValueChange={(v) => setFormData({ ...formData, member: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب پرسنل" /></SelectTrigger>
                <SelectContent>
                  {members?.results?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="ماه" required>
                <Select value={formData.month} onValueChange={(v) => setFormData({ ...formData, month: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="سال" required><Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></FormField>
              <PersianDatePicker label="تاریخ پرداخت" value={formData.paid_date} onChange={(v) => setFormData({ ...formData, paid_date: v })} />
            </div>
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
