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
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { getTodayJalaliIso } from "@/lib/jalali";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChecks, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Plus, Banknote } from "lucide-react";
import type { CheckPayment, Customer } from "@/types";

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "destructive" }> = {
  PENDING: { label: "در انتظار", variant: "warning" },
  DEPOSITED: { label: "وصول شده", variant: "info" },
  CLEARED: { label: "پاس شده", variant: "success" },
  BOUNCED: { label: "برگشت خورده", variant: "destructive" },
};

type CheckPaymentFilter = "issued" | "received";

export default function CheckPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CheckPaymentFilter>("received");
  const { data, isLoading } = useChecks({ page, search, page_size: 10 });
  const createMutation = useCreateMutation(API_ENDPOINTS.CHECKS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.CHECKS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.CHECKS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CheckPayment | null>(null);
  const [formData, setFormData] = useState({
    customer: null as Customer | null,
    check_number: "", bank_name: "", amount: "",
    issue_date: "", due_date: "", status: "PENDING", description: "",
  });
  const resetForm = () => { setFormData({ customer: null, check_number: "", bank_name: "", amount: "", issue_date: getTodayJalaliIso(), due_date: "", status: "PENDING", description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: CheckPayment) => {
    setSelectedItem(item);
    setFormData({
      customer: item.customer_name ? { id: item.customer_id!, name: item.customer_name, phone: "", customer_type: "farmer" } : null,
      check_number: item.check_number || "", bank_name: item.bank_name || "", amount: String(item.amount),
      issue_date: item.check_date?.split("T")[0] || "", due_date: "",
      status: item.is_collected ? "DEPOSITED" : "PENDING", description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: CheckPayment) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };

  const toggleStatus = (item: CheckPayment) => {
    updateMutation.mutate({ id: item.id, data: { is_collected: !item.is_collected } });
  };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      check_number: formData.check_number, bank_name: formData.bank_name,
      amount: parseFloat(formData.amount), check_date: formData.issue_date || undefined,
      is_collected: formData.status === "DEPOSITED" || formData.status === "CLEARED",
      description: formData.description || undefined,
    };
    if (formData.customer) payload.customer_id = formData.customer.id;
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<CheckPayment>[] = [
    { key: "check_number", label: "شماره چک" },
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "bank_name", label: "بانک" },
    { key: "amount", label: "مبلغ", render: (item) => toPersianCurrency(item.amount) },
    { key: "check_date", label: "تاریخ صدور", render: (item) => formatPersianDate(item.check_date) },
    {
      key: "is_collected",
      label: "وضعیت",
      render: (item) => {
        const s = item.is_collected
          ? { label: "وصول شده", variant: "success" as const }
          : { label: "در انتظار", variant: "warning" as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  const filteredData = data?.results?.filter((item) => {
    if (filter === "issued") return item.customer_id != null;
    return item.customer_id == null;
  });

  return (
    <PageShell title="چک" description="مدیریت چک‌های دریافتی و صادره"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />چک جدید</Button>}
    >
      <Tabs value={filter} onValueChange={(v) => setFilter(v as CheckPaymentFilter)}>
        <TabsList>
          <TabsTrigger value="received">چک دریافتی</TabsTrigger>
          <TabsTrigger value="issued">چک صادره</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <DataTable<CheckPayment>
            columns={[
              ...columns,
              {
                key: "actions",
                label: "عملیات",
                sortable: false,
                render: (item: CheckPayment) => (
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(item)}>
                    <Banknote className="h-4 w-4 ml-1" />
                    {item.is_collected ? "برگشت به وضعیت قبل" : "وصول شد"}
                  </Button>
                ),
              },
            ]}
            data={filteredData}
            totalCount={filteredData?.length || 0}
            page={page}
            onPageChange={setPage}
            searchable searchPlaceholder="جستجوی چک..."
            onSearch={(term) => { setSearch(term); setPage(1); }}
            onEdit={openEdit}
            onDelete={handleDelete}
            emptyMessage="چکی یافت نشد"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش چک" : "چک جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری"><CustomerSearch value={formData.customer} onChange={(c) => setFormData({ ...formData, customer: c })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="شماره چک" required><Input value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} /></FormField>
              <FormField label="بانک" required><Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} /></FormField>
            </div>
            <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <PersianDatePicker label="تاریخ صدور" value={formData.issue_date} onChange={(v) => setFormData({ ...formData, issue_date: v })} />
              <PersianDatePicker label="سررسید" value={formData.due_date} onChange={(v) => setFormData({ ...formData, due_date: v })} />
            </div>
            <FormField label="وضعیت" required>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">در انتظار</SelectItem>
                  <SelectItem value="DEPOSITED">وصول شده</SelectItem>
                  <SelectItem value="CLEARED">پاس شده</SelectItem>
                  <SelectItem value="BOUNCED">برگشت خورده</SelectItem>
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
