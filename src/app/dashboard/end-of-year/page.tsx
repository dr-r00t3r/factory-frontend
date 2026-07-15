"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import apiClient from "@/lib/api-client";
import { toPersianNumber } from "@/lib/utils";
import { RotateCcw, AlertTriangle, Eye } from "lucide-react";

export default function EndOfYearPage() {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const rolloverMutation = useMutation({
    mutationFn: async (year: number) => {
      const { data } = await apiClient.post("/api/end-of-year/", { year });
      return data;
    },
    onSuccess: () => {
      setConfirmOpen(false);
      setPreview(null);
    },
  });

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const { data } = await apiClient.get(`/api/end-of-year/preview/?year=${selectedYear}`);
      setPreview(data);
    } catch {
      setPreview({ message: "امکان پیش‌نمایش وجود ندارد" });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRollover = () => {
    rolloverMutation.mutate(parseInt(selectedYear));
  };

  return (
    <PageShell
      title="انتقال سالانه"
      description="انتقال موجودی و اطلاعات به سال جدید"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            انتخاب سال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <FormField label="سال">
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
            </FormField>
            <Button variant="outline" onClick={handlePreview} disabled={previewLoading}>
              <Eye className="h-4 w-4 ml-1" />
              پیش‌نمایش
            </Button>
          </div>

          {previewLoading && <LoadingSpinner size="sm" />}

          {preview && !previewLoading && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">پیش‌نمایش انتقال سالانه</span>
                </div>
                {Object.entries(preview).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span>{key}</span>
                    <span className="font-medium">
                      {typeof value === "number" ? toPersianNumber(value) : String(value)}
                    </span>
                  </div>
                ))}
                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmOpen(true)}
                    disabled={rolloverMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 ml-1" />
                    اجرای انتقال سالانه
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="تأیید انتقال سالانه"
        description={`آیا از انتقال اطلاعات به سال ${toPersianNumber(parseInt(selectedYear))} اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
        onConfirm={handleRollover}
        isLoading={rolloverMutation.isPending}
      />
    </PageShell>
  );
}
