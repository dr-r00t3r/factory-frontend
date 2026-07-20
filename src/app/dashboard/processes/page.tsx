"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { useProcesses, useCreateMutation, useDeleteMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Process } from "@/types";

const statusConfig = {
  not_started: { label: "شروع نشده", variant: "secondary" as const },
  in_progress: { label: "در حال انجام", variant: "warning" as const },
  completed: { label: "تکمیل شده", variant: "success" as const },
};

function getProcessStatus(p: Process) {
  if (p.is_completed) return statusConfig.completed;
  if (p.is_started) return statusConfig.in_progress;
  return statusConfig.not_started;
}

export default function ProcessesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProcesses({ page, page_size: 20 });

  const createMutation = useCreateMutation(API_ENDPOINTS.PROCESSES);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    process_number: "",
    capacity_bag_count: "",
    hours_work: "",
    fill_percentage_required: "95",
    description: "",
  });

  const handleCreate = () => {
    createMutation.mutate(
      {
        process_number: parseInt(createForm.process_number),
        capacity_bag_count: parseFloat(createForm.capacity_bag_count),
        hours_work: createForm.hours_work ? parseFloat(createForm.hours_work) : undefined,
        fill_percentage_required: parseFloat(createForm.fill_percentage_required),
        description: createForm.description || undefined,
      },
      {
        onSuccess: (created) => {
          setCreateOpen(false);
          setCreateForm({
            process_number: "",
            capacity_bag_count: "",
            hours_work: "",
            fill_percentage_required: "95",
            description: "",
          });
          router.push(`/dashboard/processes/${created.id}`);
        },
      }
    );
  };

  const columns: Column<Process>[] = [
    {
      key: "process_number",
      label: "شماره فرآیند",
      render: (item) => toPersianNumber(item.process_number),
    },
    {
      key: "capacity_bag_count",
      label: "ظرفیت (کیسه)",
      render: (item) => toPersianNumber(item.capacity_bag_count),
    },
    {
      key: "fill_percentage",
      label: "درصد پر شدن",
      render: (item) => {
        const pct = item.fill_percentage;
        const color =
          pct >= item.fill_percentage_required
            ? "text-green-600"
            : pct >= item.fill_percentage_required * 0.8
              ? "text-yellow-600"
              : "text-red-600";
        return (
          <span className={color}>
            {toPersianNumber(pct)}٪ ({toPersianNumber(item.filled_bag_count)} کیسه)
          </span>
        );
      },
    },
    {
      key: "inputs",
      label: "تعداد ورودی",
      render: (item) => toPersianNumber(item.inputs.length),
    },
    {
      key: "status",
      label: "وضعیت",
      render: (item) => {
        const s = getProcessStatus(item);
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "process_date",
      label: "تاریخ",
      render: (item) => formatPersianDate(item.process_date),
    },
    {
      key: "description",
      label: "توضیحات",
      render: (item) => item.description || "-",
    },
  ];

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title="فرآیندهای تولید"
      description="مدیریت فرآیندهای تبدیل شالی به برنج"
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          فرآیند جدید
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data?.results}
        totalCount={data?.count}
        page={page}
        onPageChange={setPage}
        onEdit={(item) => router.push(`/dashboard/processes/${item.id}`)}
        emptyMessage="فرآیندی ثبت نشده است"
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>فرآیند جدید</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="شماره فرآیند" required>
                <Input
                  type="number"
                  value={createForm.process_number}
                  onChange={(e) => setCreateForm({ ...createForm, process_number: e.target.value })}
                />
              </FormField>
              <FormField label="ظرفیت (کیسه)" required>
                <Input
                  type="number"
                  value={createForm.capacity_bag_count}
                  onChange={(e) => setCreateForm({ ...createForm, capacity_bag_count: e.target.value })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="ساعت کار">
                <Input
                  type="number"
                  value={createForm.hours_work}
                  onChange={(e) => setCreateForm({ ...createForm, hours_work: e.target.value })}
                />
              </FormField>
              <FormField label="حداقل درصد پر شدن">
                <Input
                  type="number"
                  value={createForm.fill_percentage_required}
                  onChange={(e) => setCreateForm({ ...createForm, fill_percentage_required: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="توضیحات">
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "در حال ثبت..." : "ثبت فرآیند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
