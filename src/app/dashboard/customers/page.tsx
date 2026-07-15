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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCustomers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS, CustomerType, CustomerTypeLabels } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus, Users } from "lucide-react";
import toast from "react-hot-toast";
import type { Customer } from "@/types";

// Pull the Persian message attached by our axios interceptor, if present.
function errorMsg(err: unknown): string {
  if (err && typeof err === "object" && "persianMessage" in err) {
    const m = (err as { persianMessage?: string }).persianMessage;
    if (m) return m;
  }
  if (err instanceof Error && err.message) return err.message;
  return "عملیات ناموفق بود";
}

interface CustomerFormState {
  name: string;
  national_code: string;
  phone: string;
  address: string;
  customer_type: string;
}

const emptyForm: CustomerFormState = {
  name: "",
  national_code: "",
  phone: "",
  address: "",
  customer_type: CustomerType.FARMER,
};

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { data, isLoading } = useCustomers({
    page,
    page_size: 10,
    search,
    ...(typeFilter !== "ALL" ? { customer_type: typeFilter.toLowerCase() } : {}),
  });
  const createMutation = useCreateMutation(API_ENDPOINTS.CUSTOMERS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.CUSTOMERS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.CUSTOMERS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormState>(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedItem(null);
  };
  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };
  const openEdit = (item: Customer) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      national_code: item.national_code || "",
      phone: item.phone || "",
      address: item.address || "",
      customer_type: (item.customer_type || CustomerType.FARMER).toUpperCase(),
    });
    setDialogOpen(true);
  };
  const handleDelete = (item: Customer) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem.id, {
      onSuccess: () => {
        toast.success("مشتری حذف شد");
        setDeleteDialogOpen(false);
      },
      onError: (err: unknown) => toast.error(errorMsg(err)),
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("نام مشتری الزامی است");
      return;
    }
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      national_code: formData.national_code.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      customer_type: formData.customer_type.toLowerCase(),
    };

    const onOk = () => {
      setDialogOpen(false);
      resetForm();
      toast.success(selectedItem ? "مشتری ویرایش شد" : "مشتری ثبت شد");
    };
    const onErr = (err: unknown) => toast.error(errorMsg(err));

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload }, { onSuccess: onOk, onError: onErr });
    } else {
      createMutation.mutate(payload, { onSuccess: onOk, onError: onErr });
    }
  };

  const columns: Column<Customer>[] = [
    { key: "name", label: "نام", render: (item) => <span className="font-medium">{item.name}</span> },
    { key: "phone", label: "تلفن", render: (item) => item.phone || "-" },
    {
      key: "customer_type",
      label: "نوع",
      render: (item) => {
        const up = (item.customer_type || "").toUpperCase();
        const key = up === CustomerType.FARMER || up === CustomerType.TRADER ? up : CustomerType.FARMER;
        return (
          <Badge variant={key === CustomerType.FARMER ? "default" : "secondary"}>
            {CustomerTypeLabels[key as CustomerType]}
          </Badge>
        );
      },
    },
    { key: "national_code", label: "کد ملی", render: (item) => item.national_code || "-" },
    { key: "address", label: "آدرس", render: (item) => item.address || "-" },
    { key: "created_at", label: "تاریخ ثبت", render: (item) => formatPersianDate(item.created_at) },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="مشتریان"
      description="مدیریت مشتریان (کشاورزان و تجار)"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          مشتری جدید
        </Button>
      }
    >
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", CustomerType.FARMER, CustomerType.TRADER] as const).map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setTypeFilter(t);
              setPage(1);
            }}
          >
            {t === "ALL" ? "همه" : CustomerTypeLabels[t]}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        searchable
        searchPlaceholder="جستجو بر اساس نام / کد ملی / تلفن..."
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="مشتری‌ای ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedItem ? "ویرایش مشتری" : "مشتری جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="نام" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="نام و نام خانوادگی"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="کد ملی">
                <Input
                  value={formData.national_code}
                  onChange={(e) => setFormData({ ...formData, national_code: e.target.value })}
                  placeholder="کد ملی"
                />
              </FormField>
              <FormField label="تلفن">
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="شماره تماس"
                />
              </FormField>
            </div>
            <FormField label="نوع مشتری" required>
              <Select
                value={formData.customer_type}
                onValueChange={(v) => setFormData({ ...formData, customer_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CustomerType.FARMER}>کشاورز</SelectItem>
                  <SelectItem value={CustomerType.TRADER}>تاجر</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="آدرس">
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="آدرس"
                rows={2}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
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
