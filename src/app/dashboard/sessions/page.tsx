"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared/FormField";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProcessSessions, useProcessLines, useCreateMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { ProcessSession } from "@/types";

const sessionStatusConfig = {
  not_started: { label: "شروع نشده", variant: "secondary" as const },
  in_progress: { label: "در حال اجرا", variant: "warning" as const },
  completed: { label: "تکمیل شده", variant: "success" as const },
};

function getSessionStatus(s: { is_completed: boolean; is_started: boolean }) {
  if (s.is_completed) return sessionStatusConfig.completed;
  if (s.is_started) return sessionStatusConfig.in_progress;
  return sessionStatusConfig.not_started;
}

export default function SessionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProcessSessions({ page, page_size: 20 });
  const { data: linesData } = useProcessLines({ page_size: 100 });
  const createMutation = useCreateMutation(API_ENDPOINTS.PROCESS_SESSIONS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("");

  const handleCreate = () => {
    if (!selectedLineId) return;
    createMutation.mutate(
      { process_line_id: parseInt(selectedLineId) },
      {
        onSuccess: (created) => {
          setDialogOpen(false);
          setSelectedLineId("");
          router.push(`/dashboard/sessions/${created.id}`);
        },
      }
    );
  };

  const columns: Column<ProcessSession>[] = [
    { key: "id", label: "شماره نشست", render: (item) => toPersianNumber(item.id) },
    { key: "process_number", label: "شماره خط", render: (item) => toPersianNumber(item.process_number ?? "-") },
    { key: "session_date", label: "تاریخ", render: (item) => formatPersianDate(item.session_date) },
    {
      key: "status", label: "وضعیت",
      render: (item) => {
        const s = getSessionStatus(item);
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "filled_bag_count", label: "کیسه پر شده",
      render: (item) => `${toPersianNumber(item.filled_bag_count)} / ${toPersianNumber(item.capacity_bag_count ?? "-")}`,
    },
    {
      key: "fill_percentage", label: "درصد پر شدن",
      render: (item) => {
        const pct = item.fill_percentage;
        const req = item.fill_percentage_required ?? 95;
        const color = pct >= req ? "text-green-600" : pct >= req * 0.8 ? "text-yellow-600" : "text-red-600";
        return <span className={color}>{toPersianNumber(pct)}٪</span>;
      },
    },
    { key: "inputs", label: "تعداد ورودی", render: (item) => toPersianNumber(item.inputs?.length ?? 0) },
    { key: "actual_hours_work", label: "ساعت واقعی", render: (item) => item.actual_hours_work != null ? toPersianNumber(item.actual_hours_work) : "-" },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="جلسات فرآیند"
      description="لیست تمام جلسات فرآیند تولید"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          نشست جدید
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        onEdit={(item) => router.push(`/dashboard/sessions/${item.id}`)}
        emptyMessage="جلسه‌ای ثبت نشده است"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>ایجاد نشست جدید</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FormField label="خط فرآیند" required>
              <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب خط فرآیند" />
                </SelectTrigger>
                <SelectContent>
                  {linesData?.results?.map((line) => (
                    <SelectItem key={line.id} value={String(line.id)}>
                      خط {toPersianNumber(line.process_number)} — ظرفیت {toPersianNumber(line.capacity_bag_count)} کیسه
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleCreate} disabled={!selectedLineId || createMutation.isPending}>
              {createMutation.isPending ? "در حال ایجاد..." : "ایجاد نشست"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
