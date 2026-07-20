"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProcess,
  useRiceInputs,
  useDeleteMutation,
  useProcessAddInput,
  useProcessRemoveInput,
  useProcessStart,
  useProcessComplete,
} from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Trash2,
  Plus,
  Clock,
  User,
  Layers,
  Percent,
  Weight,
} from "lucide-react";
import type { ProcessInput, Customer } from "@/types";

const statusConfig = {
  not_started: { label: "شروع نشده", variant: "secondary" as const },
  in_progress: { label: "در حال انجام", variant: "warning" as const },
  completed: { label: "تکمیل شده", variant: "success" as const },
};

export default function ProcessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const processId = Number(params.id);

  const { data: process, isLoading, refetch } = useProcess(processId);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.PROCESSES);
  const addInputMutation = useProcessAddInput();
  const removeInputMutation = useProcessRemoveInput();
  const startMutation = useProcessStart();
  const completeMutation = useProcessComplete();

  const [addInputOpen, setAddInputOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [addInputCustomer, setAddInputCustomer] = useState<Customer | null>(null);
  const [addInputRiceInputId, setAddInputRiceInputId] = useState("");
  const [addInputBagCount, setAddInputBagCount] = useState("");

  const { data: addInputRiceInputs } = useRiceInputs(
    addInputCustomer ? { customer_id: addInputCustomer.id, page_size: 100 } : undefined
  );

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
  if (!process) return <div className="text-center py-10">فرآیند یافت نشد</div>;

  const status = process.is_completed
    ? statusConfig.completed
    : process.is_started
      ? statusConfig.in_progress
      : statusConfig.not_started;

  const inputsByCustomer = process.inputs.reduce<Record<number, { name: string; inputs: ProcessInput[]; totalBags: number }>>(
    (acc, input) => {
      const key = input.customer_id;
      if (!acc[key]) {
        acc[key] = { name: input.customer_name || `مشتری #${input.customer_id}`, inputs: [], totalBags: 0 };
      }
      acc[key].inputs.push(input);
      acc[key].totalBags += input.bag_count;
      return acc;
    },
    {}
  );

  const handleDelete = () => {
    deleteMutation.mutate(process.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push("/dashboard/processes");
      },
    });
  };

  const handleAddInput = () => {
    if (!addInputCustomer || !addInputRiceInputId || !addInputBagCount) return;
    addInputMutation.mutate(
      {
        id: process.id,
        data: {
          rice_input_id: parseInt(addInputRiceInputId),
          customer_id: addInputCustomer.id,
          bag_count: parseFloat(addInputBagCount),
        },
      },
      {
        onSuccess: () => {
          setAddInputOpen(false);
          setAddInputCustomer(null);
          setAddInputRiceInputId("");
          setAddInputBagCount("");
          refetch();
        },
      }
    );
  };

  const handleRemoveInput = (inputId: number) => {
    removeInputMutation.mutate(
      { processId: process.id, inputId },
      { onSuccess: () => refetch() }
    );
  };

  const handleStart = () => {
    startMutation.mutate(process.id, { onSuccess: () => refetch() });
  };

  const handleComplete = () => {
    completeMutation.mutate(process.id, { onSuccess: () => refetch() });
  };

  return (
    <PageShell
      title={`فرآیند شماره ${toPersianNumber(process.process_number)}`}
      description={process.description || undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/processes")}>
            <ArrowRight className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          {!process.is_started && !process.is_completed && (
            <>
              <Button onClick={handleStart} disabled={startMutation.isPending}>
                <Play className="h-4 w-4 ml-1" />
                شروع فرآیند
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 ml-1" />
                حذف
              </Button>
            </>
          )}
          {process.is_started && !process.is_completed && (
            <Button onClick={handleComplete} disabled={completeMutation.isPending}>
              <CheckCircle className="h-4 w-4 ml-1" />
              تکمیل فرآیند
            </Button>
          )}
        </div>
      }
    >
      {/* Status & Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Layers className="h-4 w-4" />
              وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status.variant} className="text-base">
              {status.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Weight className="h-4 w-4" />
              ظرفیت / پر شده
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toPersianNumber(process.filled_bag_count)}
              <span className="text-sm font-normal text-muted-foreground mr-1">
                / {toPersianNumber(process.capacity_bag_count)} کیسه
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Percent className="h-4 w-4" />
              درصد پر شدن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                process.fill_percentage >= process.fill_percentage_required
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {toPersianNumber(process.fill_percentage)}٪
            </div>
            <p className="text-xs text-muted-foreground">
              حداقل مورد نیاز: {toPersianNumber(process.fill_percentage_required)}٪
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              تاریخ / ساعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>{formatPersianDate(process.process_date) || "—"}</div>
              {process.hours_work != null && (
                <div className="text-muted-foreground">
                  ساعت کار: {toPersianNumber(process.hours_work)}
                </div>
              )}
              {process.actual_hours_work != null && (
                <div className="text-muted-foreground">
                  ساعت واقعی: {toPersianNumber(process.actual_hours_work)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fill Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>میزان پر شدن کوره</span>
            <span className="font-medium">
              {toPersianNumber(process.filled_bag_count)} از {toPersianNumber(process.capacity_bag_count)} کیسه
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                process.fill_percentage >= process.fill_percentage_required
                  ? "bg-green-500"
                  : process.fill_percentage >= process.fill_percentage_required * 0.8
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(process.fill_percentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inputs by Customer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ورودی‌ها بر اساس مشتری ({process.inputs.length} ورودی)
          </CardTitle>
          {!process.is_completed && (
            <Button size="sm" variant="outline" onClick={() => setAddInputOpen(true)}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن ورودی
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {process.inputs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              هنوز ورودی‌ای ثبت نشده است
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(inputsByCustomer).map(([customerId, group]) => (
                <div key={customerId} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" />
                      {group.name}
                    </div>
                    <Badge variant="outline">
                      {toPersianNumber(group.totalBags)} کیسه
                    </Badge>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t">
                        <th className="px-4 py-2 text-right text-muted-foreground">#</th>
                        <th className="px-4 py-2 text-right text-muted-foreground">تاریخ ورودی شالی</th>
                        <th className="px-4 py-2 text-right text-muted-foreground">تعداد کیسه</th>
                        {!process.is_started && (
                          <th className="px-4 py-2 text-right text-muted-foreground">عملیات</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {group.inputs.map((input, idx) => (
                        <tr key={input.id} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{toPersianNumber(idx + 1)}</td>
                          <td className="px-4 py-2">{formatPersianDate(input.rice_input_date)}</td>
                          <td className="px-4 py-2 font-medium">{toPersianNumber(input.bag_count)} کیسه</td>
                          {!process.is_started && (
                            <td className="px-4 py-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveInput(input.id)}
                                disabled={removeInputMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Input Dialog */}
      <Dialog open={addInputOpen} onOpenChange={setAddInputOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن ورودی به فرآیند</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری" required>
              <CustomerSearch
                value={addInputCustomer}
                onChange={(c) => {
                  setAddInputCustomer(c);
                  setAddInputRiceInputId("");
                }}
              />
            </FormField>

            <FormField label="ورودی شالی" required>
              <Select
                value={addInputRiceInputId}
                onValueChange={(v) => {
                  setAddInputRiceInputId(v);
                  const selected = addInputRiceInputs?.results?.find((r) => String(r.id) === v);
                  if (selected?.bag_count != null) {
                    setAddInputBagCount(String(selected.bag_count));
                  }
                }}
                disabled={!addInputCustomer}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      addInputCustomer ? "انتخاب ورودی" : "ابتدا مشتری را انتخاب کنید"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {addInputRiceInputs?.results?.map((input) => (
                    <SelectItem key={input.id} value={String(input.id)}>
                      {input.rice_type_name} - {input.bag_count != null ? `${toPersianNumber(input.bag_count)} کیسه` : `${toPersianNumber(input.weight_kg ?? 0)} کیلو`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="تعداد کیسه" required>
              <Input
                type="number"
                value={addInputBagCount}
                onChange={(e) => setAddInputBagCount(e.target.value)}
                placeholder="تعداد کیسه"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddInputOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleAddInput}
              disabled={addInputMutation.isPending || !addInputCustomer || !addInputRiceInputId || !addInputBagCount}
            >
              {addInputMutation.isPending ? "در حال افزودن..." : "افزودن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </PageShell>
  );
}
