"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProcessLine, useProcessSessions, useCreateMutation } from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { ProcessSession } from "@/types";

const sessionStatusConfig = {
  not_started: { label: "شروع نشده", variant: "secondary" as const },
  in_progress: { label: "در حال اجرا", variant: "warning" as const },
  completed: { label: "تکمیل شده", variant: "success" as const },
};

function getSessionStatus(s: ProcessSession) {
  if (s.is_completed) return sessionStatusConfig.completed;
  if (s.is_started) return sessionStatusConfig.in_progress;
  return sessionStatusConfig.not_started;
}

export default function ProcessLineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [page, setPage] = useState(1);

  const { data: line, isLoading: lineLoading } = useProcessLine(id);
  const { data: sessions, isLoading: sessionsLoading } = useProcessSessions({
    process_line_id: id,
    page,
    page_size: 20,
  });

  const createMutation = useCreateMutation(API_ENDPOINTS.PROCESS_SESSIONS);

  const handleCreateSession = () => {
    createMutation.mutate(
      { process_line_id: id },
      {
        onSuccess: (created) => {
          router.push(`/dashboard/sessions/${created.id}`);
        },
      }
    );
  };

  const columns: Column<ProcessSession>[] = [
    {
      key: "id",
      label: "شماره نشست",
      render: (item) => toPersianNumber(item.id),
    },
    {
      key: "session_date",
      label: "تاریخ",
      render: (item) => formatPersianDate(item.session_date),
    },
    {
      key: "status",
      label: "وضعیت",
      render: (item) => {
        const s = getSessionStatus(item);
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "filled_bag_count",
      label: "کیسه‌های پر شده",
      render: (item) => (
        <span>
          {toPersianNumber(item.filled_bag_count)} / {toPersianNumber(item.capacity_bag_count)}
        </span>
      ),
    },
    {
      key: "fill_percentage",
      label: "درصد پر شدن",
      render: (item) => {
        const pct = item.fill_percentage;
        const req = item.fill_percentage_required ?? line?.fill_percentage_required ?? 95;
        const color =
          pct >= req
            ? "text-green-600"
            : pct >= req * 0.8
              ? "text-yellow-600"
              : "text-red-600";
        return <span className={color}>{toPersianNumber(pct)}٪</span>;
      },
    },
    {
      key: "inputs",
      label: "ورودی‌ها",
      render: (item) => toPersianNumber(item.inputs?.length ?? 0),
    },
  ];

  if (lineLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell
      title={`خط فرآیند ${line ? toPersianNumber(line.process_number) : ""}`}
      description={
        line
          ? `ظرفیت: ${toPersianNumber(line.capacity_bag_count)} کیسه | ساعت کار: ${toPersianNumber(line.hours_work ?? "-")} | حداقل درصد پر شدن: ${toPersianNumber(line.fill_percentage_required)}٪`
          : ""
      }
      actions={
        <Button onClick={handleCreateSession} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4 ml-1" />
          {createMutation.isPending ? "در حال ایجاد..." : "ایجاد نشست جدید"}
        </Button>
      }
    >
      {sessionsLoading ? (
        <LoadingSpinner className="min-h-[40vh]" />
      ) : (
        <DataTable
          columns={columns}
          data={sessions?.results}
          totalCount={sessions?.count}
          page={page}
          onPageChange={setPage}
          onEdit={(item) => router.push(`/dashboard/sessions/${item.id}`)}
          emptyMessage="نشستی ثبت نشده است"
        />
      )}
    </PageShell>
  );
}
