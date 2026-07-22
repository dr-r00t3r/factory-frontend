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
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { getTodayJalaliIso } from "@/lib/jalali";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { Plus } from "lucide-react";
import type { CustomerPayment, Customer } from "@/types";

const PAYMENTS_URL = `${API_ENDPOINTS.CUSTOMERS}payments/`;

function useCustomerPayments(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [PAYMENTS_URL, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") params.append(key, String(value));
        });
      }
      const qs = params.toString();
      const { data } = await apiClient.get(`${PAYMENTS_URL}${qs ? `?${qs}` : ""}`);
      return data as { count: number; results: CustomerPayment[] };
    },
  });
}

function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const r = await apiClient.post(PAYMENTS_URL, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYMENTS_URL] }),
  });
}

function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => { const r = await apiClient.put(`${PAYMENTS_URL}${id}/`, data); return r.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYMENTS_URL] }),
  });
}

function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await apiClient.delete(`${PAYMENTS_URL}${id}/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYMENTS_URL] }),
  });
}

export default function CustomerPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCustomerPayments({ page, search, page_size: 10 });
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const deleteMutation = useDeletePayment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CustomerPayment | null>(null);
  const [formData, setFormData] = useState({
    customer: null as Customer | null, amount: "", payment_date: getTodayJalaliIso(),
    payment_type: "CASH", description: "",
  });
  const resetForm = () => { setFormData({ customer: null, amount: "", payment_date: getTodayJalaliIso(), payment_type: "CASH", description: "" }); setSelectedItem(null); };
  const openCreate = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (item: CustomerPayment) => {
    setSelectedItem(item);
    setFormData({
      customer: item.customer_name && item.customer_id ? { id: item.customer_id, name: item.customer_name, phone: "", customer_type: "farmer", created_at: "", updated_at: "" } : null,
      amount: String(item.total_paid ?? item.cash_amount ?? 0), payment_date: item.payment_date?.split("T")[0] || "",
      payment_type: "CASH", description: item.description || "",
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: CustomerPayment) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const confirmDelete = () => { if (selectedItem) deleteMutation.mutate(selectedItem.id, { onSuccess: () => setDeleteDialogOpen(false) }); };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      amount: parseFloat(formData.amount), payment_date: formData.payment_date,
      payment_type: formData.payment_type, description: formData.description || undefined,
    };
    if (formData.customer) payload.customer = formData.customer.id;
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    } else {
      createMutation.mutate(payload, { onSuccess: () => { setDialogOpen(false); resetForm(); } });
    }
  };

  const columns: Column<CustomerPayment>[] = [
    { key: "customer_name", label: "مشتری", render: (item) => item.customer_name || "-" },
    { key: "total_paid", label: "مبلغ", render: (item) => toPersianCurrency(item.total_paid ?? item.cash_amount ?? 0) },
    { key: "payment_date", label: "تاریخ", render: (item) => formatPersianDate(item.payment_date) },
    { key: "description", label: "توضیحات", render: (item) => item.description || "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="پرداخت نقدی" description="مدیریت پرداخت‌های نقدی مشتریان"
      actions={<Button onClick={openCreate}><Plus className="h-4 w-4 ml-1" />پرداخت جدید</Button>}
    >
      <DataTable columns={columns} data={data?.results} totalCount={data?.count} page={page} onPageChange={setPage} searchable searchPlaceholder="جستجوی پرداخت..." onSearch={(term) => { setSearch(term); setPage(1); }} onEdit={openEdit} onDelete={handleDelete} emptyMessage="پرداختی ثبت نشده است" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedItem ? "ویرایش پرداخت" : "پرداخت جدید"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری" required><CustomerSearch value={formData.customer} onChange={(c) => setFormData({ ...formData, customer: c })} /></FormField>
            <FormField label="مبلغ (ریال)" required><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="نوع پرداخت" required>
                <Select value={formData.payment_type} onValueChange={(v) => setFormData({ ...formData, payment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">نقدی</SelectItem>
                    <SelectItem value="CARD">کارتی</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <PersianDatePicker label="تاریخ" value={formData.payment_date} onChange={(v) => setFormData({ ...formData, payment_date: v })} />
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
