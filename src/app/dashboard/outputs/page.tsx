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
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getTodayJalaliIso } from "@/lib/jalali";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOutputs,
  useProcessSessions,
  useRiceTypes,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Output, Customer } from "@/types";

function formatPrice(n?: number | null) {
  if (n == null) return "-";
  return toPersianNumber(n) + " ریال";
}

export default function OutputsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOutputs({ page, page_size: 20 });
  const createMutation = useCreateMutation(API_ENDPOINTS.OUTPUTS);
  const updateMutation = useUpdateMutation(API_ENDPOINTS.OUTPUTS);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.OUTPUTS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Output | null>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [riceTypeId, setRiceTypeId] = useState("");
  const [outputDate, setOutputDate] = useState("");
  const [sabosNarmWeight, setSabosNarmWeight] = useState("");
  const [sabosDoWeight, setSabosDoWeight] = useState("");
  const [nimdoneWeight, setNimdoneWeight] = useState("");
  const [doneWeight, setDoneWeight] = useState("");

  const { data: sessionsData } = useProcessSessions({ page_size: 200 });
  const { data: riceTypesData } = useRiceTypes();

  const resetForm = () => {
    setCustomer(null);
    setSessionId("");
    setRiceTypeId("");
    setOutputDate(getTodayJalaliIso());
    setSabosNarmWeight("");
    setSabosDoWeight("");
    setNimdoneWeight("");
    setDoneWeight("");
    setSelectedItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: Output) => {
    setSelectedItem(item);
    setSessionId(String(item.session_id || ""));
    setRiceTypeId(String(item.rice_type_id || ""));
    setOutputDate(item.output_date?.split("T")[0] || "");
    setSabosNarmWeight(String(item.sabos_narm_weight || ""));
    setSabosDoWeight(String(item.sabos_do_weight || ""));
    setNimdoneWeight(String(item.nimdone_weight || ""));
    setDoneWeight(String(item.done_weight || ""));
    setDialogOpen(true);
  };

  const handleDelete = (item: Output) => {
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
    if (!customer) return;

    const payload: Record<string, unknown> = {
      customer_id: customer.id,
      output_date: outputDate,
      sabos_narm_weight: parseInt(sabosNarmWeight) || 0,
      sabos_do_weight: parseInt(sabosDoWeight) || 0,
      nimdone_weight: parseInt(nimdoneWeight) || 0,
      done_weight: parseInt(doneWeight) || 0,
    };
    if (sessionId) payload.session_id = parseInt(sessionId);
    if (riceTypeId) payload.rice_type_id = parseInt(riceTypeId);

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

  const columns: Column<Output>[] = [
    {
      key: "customer_name",
      label: "مشتری",
      render: (item) => item.customer_name || "-",
    },
    {
      key: "session_id",
      label: "نشست",
      render: (item) => item.session_id ? `#${toPersianNumber(item.session_id)}` : "-",
    },
    {
      key: "rice_type_name",
      label: "نوع شالی",
      render: (item) => item.rice_type_name || "-",
    },
    {
      key: "output_date",
      label: "تاریخ",
      render: (item) => formatPersianDate(item.output_date),
    },
    {
      key: "sabos_narm_weight",
      label: "سبوس نرم",
      render: (item) => (
        <div className="text-sm">
          <div>{toPersianNumber(item.sabos_narm_weight)} کیلو</div>
          {item.sabos_narm_total != null && (
            <div className="text-muted-foreground text-xs">{formatPrice(item.sabos_narm_total)}</div>
          )}
        </div>
      ),
    },
    {
      key: "sabos_do_weight",
      label: "سبوس دو",
      render: (item) => (
        <div className="text-sm">
          <div>{toPersianNumber(item.sabos_do_weight)} کیلو</div>
          {item.sabos_do_total != null && (
            <div className="text-muted-foreground text-xs">{formatPrice(item.sabos_do_total)}</div>
          )}
        </div>
      ),
    },
    {
      key: "nimdone_weight",
      label: "نیمدونه",
      render: (item) => (
        <div className="text-sm">
          <div>{toPersianNumber(item.nimdone_weight)} کیلو</div>
          {item.nimdone_total != null && (
            <div className="text-muted-foreground text-xs">{formatPrice(item.nimdone_total)}</div>
          )}
        </div>
      ),
    },
    {
      key: "done_weight",
      label: "دونه",
      render: (item) => (
        <div className="text-sm">
          <div>{toPersianNumber(item.done_weight)} کیلو</div>
          {item.done_total != null && (
            <div className="text-muted-foreground text-xs">{formatPrice(item.done_total)}</div>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="خروجی تبدیل"
      description="مدیریت خروجی‌های حاصل از فرآیند تبدیل"
      actions={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 ml-1" />
          خروجی جدید
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="خروجی‌ای ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "ویرایش خروجی" : "خروجی جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری" required>
              <CustomerSearch
                value={customer}
                onChange={(c) => {
                  setCustomer(c);
                  setSessionId("");
                }}
              />
            </FormField>

            <FormField label="نشست فرآیند (اختیاری)">
              <Select
                value={sessionId}
                onValueChange={setSessionId}
                disabled={!customer}
              >
                <SelectTrigger>
                  <SelectValue placeholder={customer ? "انتخاب نشست" : "ابتدا مشتری را انتخاب کنید"} />
                </SelectTrigger>
                <SelectContent>
                  {sessionsData?.results?.filter((p: { is_completed: boolean }) => p.is_completed).map((session: { id: number; process_number?: number; filled_bag_count: number; capacity_bag_count?: number; fill_percentage: number; session_date?: string }) => (
                    <SelectItem key={session.id} value={String(session.id)}>
                      خط {toPersianNumber(session.process_number)} | {session.filled_bag_count}/{toPersianNumber(session.capacity_bag_count)} کیسه | {toPersianNumber(session.fill_percentage)}٪ | {formatPersianDate(session.session_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="نوع شالی (اختیاری - برای نرخ‌گذاری)">
              <Select value={riceTypeId} onValueChange={setRiceTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع شالی" />
                </SelectTrigger>
                <SelectContent>
                  {riceTypesData?.results?.map((rt) => (
                    <SelectItem key={rt.id} value={String(rt.id)}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <PersianDatePicker
              label="تاریخ خروجی"
              value={outputDate}
              onChange={setOutputDate}
              required
            />

            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">سبوس نرم</h3>
              <FormField label="وزن (کیلوگرم)">
                <Input type="number" value={sabosNarmWeight} onChange={(e) => setSabosNarmWeight(e.target.value)} />
              </FormField>
            </div>

            <FormField label="وزن سبوس دو (کیلوگرم)">
              <Input type="number" value={sabosDoWeight} onChange={(e) => setSabosDoWeight(e.target.value)} />
            </FormField>

            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">نیمدونه</h3>
              <FormField label="وزن (کیلوگرم)">
                <Input type="number" value={nimdoneWeight} onChange={(e) => setNimdoneWeight(e.target.value)} />
              </FormField>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">دونه</h3>
              <FormField label="وزن (کیلوگرم)">
                <Input type="number" value={doneWeight} onChange={(e) => setDoneWeight(e.target.value)} />
              </FormField>
            </div>
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
